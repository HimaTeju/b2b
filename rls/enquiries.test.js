import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { anonClient, serviceRoleClient, signInClient } from './helpers/clients.js'
import { testUsers } from './helpers/testUsers.js'
import { ready } from './helpers/ready.js'
import { testTitle } from '../e2e/helpers/testData.js'

describe.skipIf(!ready)('enquiries RLS', () => {
  let user1, user2, admin, categoryId, listingId, enquiryId

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

    const { data: listing, error: listingError } = await user1.client
      .from('marketplace_listings')
      .insert({
        profile_id: user1.userId,
        machine_category_id: categoryId,
        intent: 'SELL',
        title: testTitle('rls-enquiry-target'),
        status: 'ACTIVE',
      })
      .select()
      .single()
    if (listingError) throw listingError
    listingId = listing.id

    const { data: enquiry, error: enquiryError } = await user2.client
      .from('enquiries')
      .insert({
        from_profile_id: user2.userId,
        to_profile_id: user1.userId,
        marketplace_listing_id: listingId,
        message: testTitle('rls-enquiry'),
      })
      .select()
      .single()
    if (enquiryError) throw enquiryError
    enquiryId = enquiry.id
  })

  afterAll(async () => {
    if (enquiryId) await admin.from('enquiries').delete().eq('id', enquiryId)
    if (listingId) await admin.from('marketplace_listings').delete().eq('id', listingId)
  })

  it('blocks impersonating another user as the sender', async () => {
    const { error } = await user1.client.from('enquiries').insert({
      from_profile_id: user2.userId,
      to_profile_id: user1.userId,
      marketplace_listing_id: listingId,
      message: 'impersonated',
    })
    expect(error).not.toBeNull()
  })

  it('lets both sender and recipient view the enquiry', async () => {
    const { data: asSender } = await user2.client.from('enquiries').select('id').eq('id', enquiryId)
    expect(asSender).toHaveLength(1)

    const { data: asRecipient } = await user1.client.from('enquiries').select('id').eq('id', enquiryId)
    expect(asRecipient).toHaveLength(1)
  })

  it('blocks anonymous reads', async () => {
    const anon = anonClient()
    const { data, error } = await anon.from('enquiries').select('id').eq('id', enquiryId)
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('lets the recipient mark it read but blocks the sender from updating it', async () => {
    const { data: senderAttempt, error: senderError } = await user2.client
      .from('enquiries')
      .update({ is_read: true })
      .eq('id', enquiryId)
      .select()
    expect(senderError).toBeNull()
    expect(senderAttempt).toEqual([])

    const { error } = await user1.client.from('enquiries').update({ is_read: true }).eq('id', enquiryId)
    expect(error).toBeNull()

    const { data: check } = await admin.from('enquiries').select('is_read').eq('id', enquiryId).single()
    expect(check.is_read).toBe(true)
  })
})
