import { supabase } from '../supabase'
import { sanitizeTerm } from './searchUtil'

/**
 * Factory for the "requirement" CRUD shape shared by serviceRequirements.js,
 * jobworkRequirements.js, jobPosts.js and (with extra config) listings.js:
 * an ACTIVE-only, category-filterable, searchable list; a single-record
 * detail fetch with the poster's profile embedded; "my records" regardless
 * of status; and plain create/update/delete.
 *
 * Each of those modules is a thin config wrapper around this factory — see
 * them for the exact table names, SUMMARY_SELECT/DETAIL_SELECT strings, and
 * (for listings.js) the extra listing-only filters and pre-delete cleanup.
 *
 * config:
 *   table         - Supabase table name
 *   summarySelect - the module's SUMMARY_SELECT string (used for list + "my" queries)
 *   detailSelect  - the module's DETAIL_SELECT string (used for the single-record fetch)
 *   applyFilters(query, extraFilters) - optional hook applied right after the
 *                   categoryIds filter, for filters beyond categoryIds/search/
 *                   excludeProfileId (listings.js uses this for intent/section/
 *                   city/minPrice/maxPrice). Must return the (possibly chained) query.
 *   beforeDelete(id, extra) - optional hook run before the delete query
 *                   (listings.js uses this to remove Storage files first)
 */
export function createRequirementApi({ table, summarySelect, detailSelect, applyFilters, beforeDelete }) {
  async function getMany({ categoryIds, search, excludeProfileId, limit = 50, offset = 0, ...extraFilters } = {}) {
    let query = supabase
      .from(table)
      .select(summarySelect)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })

    if (categoryIds && categoryIds.length > 0) {
      query = query.in('machine_category_id', categoryIds)
    }

    if (applyFilters) {
      query = applyFilters(query, extraFilters)
    }

    if (excludeProfileId) {
      query = query.neq('profile_id', excludeProfileId)
    }

    if (search) {
      const term = sanitizeTerm(search)
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) throw error

    return data
  }

  async function getOne(id) {
    const { data, error } = await supabase
      .from(table)
      .select(detailSelect)
      .eq('id', id)
      .single()

    if (error) throw error

    return data
  }

  async function getMine(profileId) {
    const { data, error } = await supabase
      .from(table)
      .select(summarySelect)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data
  }

  async function create(itemData) {
    const { data, error } = await supabase
      .from(table)
      .insert([itemData])
      .select()
      .single()

    if (error) throw error

    return data
  }

  async function update(id, updates) {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return data
  }

  async function remove(id, extra) {
    if (beforeDelete) {
      await beforeDelete(id, extra)
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw error

    return true
  }

  return { getMany, getOne, getMine, create, update, remove }
}
