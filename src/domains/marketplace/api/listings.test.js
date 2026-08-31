import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createQueryBuilder } from '../../../test/mockSupabaseQuery'

vi.mock('../../../lib/supabase', () => ({
  supabase: { from: vi.fn() }
}))

vi.mock('./listingImages', () => ({
  deleteListingImageFiles: vi.fn().mockResolvedValue(undefined)
}))

import { supabase } from '../../../lib/supabase'
import { deleteListingImageFiles } from './listingImages'
import { getListings, getListing, createListing, updateListing, deleteListing } from './listings'

describe('getListings', () => {
  beforeEach(() => {
    supabase.from.mockReset()
  })

  it('always filters to active listings ordered newest first', async () => {
    const builder = createQueryBuilder({ data: [], error: null })
    supabase.from.mockReturnValue(builder)

    await getListings()

    expect(supabase.from).toHaveBeenCalledWith('marketplace_listings')
    expect(builder.__calls).toContainEqual(['eq', 'status', 'ACTIVE'])
    expect(builder.__calls).toContainEqual(['order', 'created_at', { ascending: false }])
  })

  it('only applies category, price, and search filters when they are provided', async () => {
    const builder = createQueryBuilder({ data: [], error: null })
    supabase.from.mockReturnValue(builder)

    await getListings({ categoryIds: ['cat-1', 'cat-2'], minPrice: 1000, maxPrice: 5000, search: 'lathe' })

    expect(builder.__calls).toContainEqual(['in', 'machine_category_id', ['cat-1', 'cat-2']])
    expect(builder.__calls).toContainEqual(['gte', 'price', 1000])
    expect(builder.__calls).toContainEqual(['lte', 'price', 5000])
    expect(builder.__calls).toContainEqual(['or', 'title.ilike.%lathe%,description.ilike.%lathe%'])
  })

  it('sanitizes the search term before building the or-filter, so it cannot break the filter grammar', async () => {
    const builder = createQueryBuilder({ data: [], error: null })
    supabase.from.mockReturnValue(builder)

    await getListings({ search: 'lathe,cnc(mill)' })

    expect(builder.__calls).toContainEqual(['or', 'title.ilike.%lathe cnc mill%,description.ilike.%lathe cnc mill%'])
  })

  it('omits price filters when min/max price are empty strings', async () => {
    const builder = createQueryBuilder({ data: [], error: null })
    supabase.from.mockReturnValue(builder)

    await getListings({ minPrice: '', maxPrice: '' })

    expect(builder.__calls.some(([method]) => method === 'gte')).toBe(false)
    expect(builder.__calls.some(([method]) => method === 'lte')).toBe(false)
  })

  it('applies the requested page via range()', async () => {
    const builder = createQueryBuilder({ data: [], error: null })
    supabase.from.mockReturnValue(builder)

    await getListings({ limit: 20, offset: 40 })

    expect(builder.__calls).toContainEqual(['range', 40, 59])
  })

  it('throws the Supabase error instead of returning it', async () => {
    supabase.from.mockReturnValue(createQueryBuilder({ data: null, error: new Error('query failed') }))

    await expect(getListings()).rejects.toThrow('query failed')
  })
})

describe('getListing', () => {
  beforeEach(() => {
    supabase.from.mockReset()
  })

  it('fetches a single listing by id', async () => {
    const builder = createQueryBuilder({ data: { id: 'listing-1' }, error: null })
    supabase.from.mockReturnValue(builder)

    const result = await getListing('listing-1')

    expect(builder.__calls).toContainEqual(['eq', 'id', 'listing-1'])
    expect(builder.__calls.some(([method]) => method === 'single')).toBe(true)
    expect(result).toEqual({ id: 'listing-1' })
  })
})

describe('createListing', () => {
  beforeEach(() => {
    supabase.from.mockReset()
  })

  it('inserts the given listing data and returns the created row', async () => {
    const builder = createQueryBuilder({ data: { id: 'new-listing' }, error: null })
    supabase.from.mockReturnValue(builder)

    const result = await createListing({ title: 'CNC Lathe', intent: 'SELL' })

    expect(builder.__calls).toContainEqual(['insert', [{ title: 'CNC Lathe', intent: 'SELL' }]])
    expect(result).toEqual({ id: 'new-listing' })
  })
})

describe('updateListing', () => {
  beforeEach(() => {
    supabase.from.mockReset()
  })

  it('updates only the given fields for the given id', async () => {
    const builder = createQueryBuilder({ data: { id: 'listing-1', price: 9000 }, error: null })
    supabase.from.mockReturnValue(builder)

    await updateListing('listing-1', { price: 9000 })

    expect(builder.__calls).toContainEqual(['update', { price: 9000 }])
    expect(builder.__calls).toContainEqual(['eq', 'id', 'listing-1'])
  })
})

describe('deleteListing', () => {
  beforeEach(() => {
    supabase.from.mockReset()
    deleteListingImageFiles.mockClear()
  })

  it('removes storage files before deleting the listing row', async () => {
    const builder = createQueryBuilder({ data: null, error: null })
    supabase.from.mockReturnValue(builder)
    const images = [{ id: 'img-1', storage_path: 'p/1.jpg' }]

    const result = await deleteListing('listing-1', images)

    expect(deleteListingImageFiles).toHaveBeenCalledWith(images)
    expect(builder.__calls).toContainEqual(['delete'])
    expect(builder.__calls).toContainEqual(['eq', 'id', 'listing-1'])
    expect(result).toBe(true)
  })

  it('throws if the listing row delete fails, even though images were already removed', async () => {
    supabase.from.mockReturnValue(createQueryBuilder({ data: null, error: new Error('delete failed') }))

    await expect(deleteListing('listing-1', [])).rejects.toThrow('delete failed')
  })
})
