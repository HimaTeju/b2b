import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createQueryBuilder } from '../../test/mockSupabaseQuery'

vi.mock('../supabase', () => ({
  supabase: { from: vi.fn() }
}))

import { supabase } from '../supabase'
import { getMachineCategories, buildCategoryTree, categoryAndDescendantIds } from './categories'

const FLAT_CATEGORIES = [
  { id: 'lathes', parent_id: null, name: 'Lathes', display_order: 1 },
  { id: 'mills', parent_id: null, name: 'Milling Machines', display_order: 2 },
  { id: 'cnc-lathes', parent_id: 'lathes', name: 'CNC Lathes', display_order: 1 },
  { id: 'manual-lathes', parent_id: 'lathes', name: 'Manual Lathes', display_order: 2 }
]

describe('buildCategoryTree', () => {
  it('nests sub-categories under their top-level parent', () => {
    const tree = buildCategoryTree(FLAT_CATEGORIES)

    const lathes = tree.find(c => c.id === 'lathes')
    expect(lathes.children.map(c => c.id)).toEqual(['cnc-lathes', 'manual-lathes'])
  })

  it('gives a top-level category with no children an empty children array', () => {
    const tree = buildCategoryTree(FLAT_CATEGORIES)

    const mills = tree.find(c => c.id === 'mills')
    expect(mills.children).toEqual([])
  })

  it('only includes top-level categories at the root', () => {
    const tree = buildCategoryTree(FLAT_CATEGORIES)
    expect(tree.map(c => c.id)).toEqual(['lathes', 'mills'])
  })
})

describe('categoryAndDescendantIds', () => {
  it('includes the category itself and all descendants', () => {
    const ids = categoryAndDescendantIds('lathes', FLAT_CATEGORIES)
    expect(ids.sort()).toEqual(['cnc-lathes', 'lathes', 'manual-lathes'])
  })

  it('returns just the category id when it has no children', () => {
    const ids = categoryAndDescendantIds('mills', FLAT_CATEGORIES)
    expect(ids).toEqual(['mills'])
  })
})

describe('getMachineCategories', () => {
  beforeEach(() => {
    supabase.from.mockReset()
  })

  it('queries only active categories ordered by display_order', async () => {
    const builder = createQueryBuilder({ data: FLAT_CATEGORIES, error: null })
    supabase.from.mockReturnValue(builder)

    const result = await getMachineCategories()

    expect(supabase.from).toHaveBeenCalledWith('machine_categories')
    expect(builder.__calls).toContainEqual(['eq', 'is_active', true])
    expect(builder.__calls).toContainEqual(['order', 'display_order'])
    expect(result).toEqual(FLAT_CATEGORIES)
  })

  it('throws the Supabase error instead of swallowing it', async () => {
    const builder = createQueryBuilder({ data: null, error: new Error('network down') })
    supabase.from.mockReturnValue(builder)

    await expect(getMachineCategories()).rejects.toThrow('network down')
  })
})
