import { supabase } from '../supabase'

/**
 * Get all active machine categories (flat list, both top-level and sub-categories).
 */
export async function getMachineCategories() {
  const { data, error } = await supabase
    .from('machine_categories')
    .select('id, parent_id, name, display_order')
    .eq('is_active', true)
    .order('display_order')

  if (error) throw error

  return data
}

/**
 * Arrange a flat category list into a two-level tree (top-level categories with a `children` array).
 */
export function buildCategoryTree(categories) {
  const byParent = new Map()

  for (const category of categories) {
    const key = category.parent_id || 'root'
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key).push(category)
  }

  const topLevel = byParent.get('root') || []

  return topLevel.map(category => ({
    ...category,
    children: byParent.get(category.id) || []
  }))
}

/**
 * A category and all of its descendant ids (used to match listings against a
 * top-level category regardless of which sub-category they were posted under).
 */
export function categoryAndDescendantIds(categoryId, categories) {
  const ids = [categoryId]
  const children = categories.filter(c => c.parent_id === categoryId)
  for (const child of children) {
    ids.push(...categoryAndDescendantIds(child.id, categories))
  }
  return ids
}
