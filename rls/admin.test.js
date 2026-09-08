import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { serviceRoleClient, signInClient } from './helpers/clients.js'
import { testUsers } from './helpers/testUsers.js'
import { ready } from './helpers/ready.js'
import { testTitle } from '../e2e/helpers/testData.js'

describe.skipIf(!ready)('admin role RLS (021_admin_role, 022_fix_admin_escalation_guard)', () => {
  let user1, user2, admin, categoryId, listingId

  beforeAll(async () => {
    user1 = await signInClient(testUsers.primary.email, testUsers.primary.password)
    user2 = await signInClient(testUsers.secondary.email, testUsers.secondary.password)
    admin = serviceRoleClient()

    const { data: categories, error } = await user2.client
      .from('machine_categories')
      .select('id')
      .limit(1)
    if (error || !categories?.length) {
      throw new Error('RLS test setup: no machine_categories row found to reference')
    }
    categoryId = categories[0].id

    const { data: listing, error: listingError } = await user2.client
      .from('marketplace_listings')
      .insert({
        profile_id: user2.userId,
        machine_category_id: categoryId,
        intent: 'SELL',
        title: testTitle('rls-admin-target'),
        status: 'ACTIVE',
      })
      .select()
      .single()
    if (listingError) throw listingError
    listingId = listing.id
  })

  afterEach(async () => {
    // Always revert any admin grant a test made, so this account doesn't
    // stay elevated between test files/runs.
    await admin.from('profiles').update({ is_admin: false }).eq('id', user1.userId)
  })

  afterAll(async () => {
    if (listingId) await admin.from('marketplace_listings').delete().eq('id', listingId)
  })

  it('blocks a user from granting themselves admin via an authenticated update', async () => {
    const { error } = await user1.client.from('profiles').update({ is_admin: true }).eq('id', user1.userId)
    // No RLS violation error — the row is reachable via the owner-update
    // policy, but trg_prevent_is_admin_escalation silently reverts the value.
    expect(error).toBeNull()

    const { data } = await admin.from('profiles').select('is_admin').eq('id', user1.userId).single()
    expect(data.is_admin).toBe(false)
  })

  it("blocks a non-admin from moderating another user's listing", async () => {
    const { data, error } = await user1.client
      .from('marketplace_listings')
      .update({ status: 'INACTIVE' })
      .eq('id', listingId)
      .select()
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it("lets an admin moderate another user's listing, but the escalation guard still blocks granting admin through the same session", async () => {
    const { error: promoteError } = await admin.from('profiles').update({ is_admin: true }).eq('id', user1.userId)
    expect(promoteError).toBeNull()

    const { error: moderateError } = await user1.client
      .from('marketplace_listings')
      .update({ status: 'INACTIVE' })
      .eq('id', listingId)
    expect(moderateError).toBeNull()

    const { data: moderated } = await admin
      .from('marketplace_listings')
      .select('status')
      .eq('id', listingId)
      .single()
    expect(moderated.status).toBe('INACTIVE')

    // Even as an admin, granting admin to someone else must go through the
    // service-role-only path, not an authenticated client update.
    const { error: grantError } = await user1.client
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user2.userId)
    expect(grantError).toBeNull()

    const { data: user2Profile } = await admin.from('profiles').select('is_admin').eq('id', user2.userId).single()
    expect(user2Profile.is_admin).toBe(false)
  })
})
