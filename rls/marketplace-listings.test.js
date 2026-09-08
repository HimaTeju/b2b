import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { anonClient, serviceRoleClient, signInClient } from './helpers/clients.js'
import { testUsers } from './helpers/testUsers.js'
import { ready } from './helpers/ready.js'
import { testTitle } from '../e2e/helpers/testData.js'

describe.skipIf(!ready)('marketplace_listings RLS', () => {
  let user1, user2, admin, categoryId, listingId

  beforeAll(async () => {
    user1 = await signInClient(testUsers.primary.email, testUsers.primary.password)
    user2 = await signInClient(testUsers.secondary.email, testUsers.secondary.password)
    admin = serviceRoleClient()

    const { data: categories, error } = await user1.client
      .from('machine_categories')
      .select('id')
      .limit(1)
    if (error || !categories?.length) {
      throw new Error('RLS test setup: no machine_categories row found to reference')
    }
    categoryId = categories[0].id

    const { data: listing, error: insertError } = await user1.client
      .from('marketplace_listings')
      .insert({
        profile_id: user1.userId,
        machine_category_id: categoryId,
        intent: 'SELL',
        title: testTitle('rls-listing'),
        status: 'ACTIVE',
      })
      .select()
      .single()
    if (insertError) throw insertError
    listingId = listing.id
  })

  afterAll(async () => {
    if (listingId) {
      await admin.from('marketplace_listings').delete().eq('id', listingId)
    }
  })

  it('lets the owner update their own listing', async () => {
    const { error } = await user1.client
      .from('marketplace_listings')
      .update({ description: 'updated by owner' })
      .eq('id', listingId)
    expect(error).toBeNull()
  })

  it('blocks another user from updating the listing', async () => {
    const { data, error } = await user2.client
      .from('marketplace_listings')
      .update({ description: 'hijacked' })
      .eq('id', listingId)
      .select()
    expect(error).toBeNull()
    expect(data).toEqual([])

    const { data: check } = await admin
      .from('marketplace_listings')
      .select('description')
      .eq('id', listingId)
      .single()
    expect(check.description).not.toBe('hijacked')
  })

  it('blocks another user from deleting the listing', async () => {
    const { data, error } = await user2.client
      .from('marketplace_listings')
      .delete()
      .eq('id', listingId)
      .select()
    expect(error).toBeNull()
    expect(data).toEqual([])

    const { data: stillThere } = await admin
      .from('marketplace_listings')
      .select('id')
      .eq('id', listingId)
      .maybeSingle()
    expect(stillThere).not.toBeNull()
  })

  it('blocks creating a listing owned by someone else', async () => {
    const { error } = await user2.client.from('marketplace_listings').insert({
      profile_id: user1.userId,
      machine_category_id: categoryId,
      intent: 'SELL',
      title: testTitle('rls-impersonation'),
    })
    expect(error).not.toBeNull()
  })

  it('blocks anonymous reads', async () => {
    const anon = anonClient()
    const { data, error } = await anon
      .from('marketplace_listings')
      .select('id')
      .eq('id', listingId)
    expect(error).toBeNull()
    expect(data).toEqual([])
  })
})
