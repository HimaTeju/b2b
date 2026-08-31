import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createQueryBuilder } from '../../test/mockSupabaseQuery'

vi.mock('../supabase', () => ({
  supabase: { from: vi.fn() }
}))

import { supabase } from '../supabase'
import { getEnquirySubject, createEnquiry, setEnquiryRead, getEnquiryCounts } from './enquiries'

describe('getEnquirySubject', () => {
  it('resolves a marketplace listing enquiry', () => {
    const subject = getEnquirySubject({
      marketplace_listing_id: 'listing-1',
      marketplace_listing: { id: 'listing-1', title: 'CNC Lathe' }
    })

    expect(subject).toEqual({
      kind: 'MARKETPLACE_LISTING',
      id: 'listing-1',
      title: 'CNC Lathe',
      path: '/marketplace/listing-1',
      removed: false
    })
  })

  it('marks the subject removed when the referenced row is gone (deleted or RLS-hidden)', () => {
    const subject = getEnquirySubject({
      marketplace_listing_id: 'listing-1',
      marketplace_listing: null
    })

    expect(subject).toEqual({
      kind: 'MARKETPLACE_LISTING',
      id: 'listing-1',
      title: null,
      path: null,
      removed: true
    })
  })

  it('uses headline instead of title for a job seeker subject', () => {
    const subject = getEnquirySubject({
      job_seeker_profile_id: 'seeker-1',
      job_seeker: { profile_id: 'seeker-1', headline: 'CNC Operator, 5 yrs' }
    })

    expect(subject.title).toBe('CNC Operator, 5 yrs')
    expect(subject.path).toBe('/jobs/seekers/seeker-1')
  })

  it('returns null when no reference column is set', () => {
    expect(getEnquirySubject({})).toBeNull()
  })
})

describe('createEnquiry', () => {
  beforeEach(() => {
    supabase.from.mockReset()
  })

  it('inserts null for every reference column that was not provided', async () => {
    const builder = createQueryBuilder({ data: { id: 'enq-1' }, error: null })
    supabase.from.mockReturnValue(builder)

    await createEnquiry({
      fromProfileId: 'profile-a',
      toProfileId: 'profile-b',
      message: 'Interested, please call',
      marketplaceListingId: 'listing-1'
    })

    const insertCall = builder.__calls.find(([method]) => method === 'insert')
    expect(insertCall[1][0]).toMatchObject({
      from_profile_id: 'profile-a',
      to_profile_id: 'profile-b',
      marketplace_listing_id: 'listing-1',
      service_requirement_id: null,
      jobwork_requirement_id: null,
      job_post_id: null,
      service_capability_profile_id: null,
      jobwork_capability_profile_id: null,
      job_seeker_profile_id: null,
      message: 'Interested, please call'
    })
  })

  it('throws when the insert fails', async () => {
    supabase.from.mockReturnValue(createQueryBuilder({ data: null, error: new Error('insert failed') }))

    await expect(createEnquiry({ fromProfileId: 'a', toProfileId: 'b', message: 'hi' })).rejects.toThrow('insert failed')
  })
})

describe('setEnquiryRead', () => {
  beforeEach(() => {
    supabase.from.mockReset()
  })

  it('updates is_read for the given enquiry id', async () => {
    const builder = createQueryBuilder({ data: { id: 'enq-1', is_read: true }, error: null })
    supabase.from.mockReturnValue(builder)

    const result = await setEnquiryRead('enq-1', true)

    expect(builder.__calls).toContainEqual(['update', { is_read: true }])
    expect(builder.__calls).toContainEqual(['eq', 'id', 'enq-1'])
    expect(result).toEqual({ id: 'enq-1', is_read: true })
  })
})

describe('getEnquiryCounts', () => {
  beforeEach(() => {
    supabase.from.mockReset()
  })

  it('combines sent, received, and unread counts for a profile', async () => {
    supabase.from
      .mockReturnValueOnce(createQueryBuilder({ data: null, error: null, count: 4 }))
      .mockReturnValueOnce(createQueryBuilder({ data: null, error: null, count: 9 }))
      .mockReturnValueOnce(createQueryBuilder({ data: null, error: null, count: 2 }))

    const counts = await getEnquiryCounts('profile-a')

    expect(counts).toEqual({ sent: 4, received: 9, unread: 2 })
  })

  it('throws if any of the three count queries fails', async () => {
    supabase.from
      .mockReturnValueOnce(createQueryBuilder({ data: null, error: null, count: 4 }))
      .mockReturnValueOnce(createQueryBuilder({ data: null, error: new Error('boom'), count: null }))
      .mockReturnValueOnce(createQueryBuilder({ data: null, error: null, count: 2 }))

    await expect(getEnquiryCounts('profile-a')).rejects.toThrow('boom')
  })
})
