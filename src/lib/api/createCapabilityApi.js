import { supabase } from '../supabase'
import { sanitizeTerm } from './searchUtil'

/**
 * Factory for the "capability profile" CRUD shape shared by
 * serviceCapabilities.js, jobworkCapabilities.js and jobSeekerProfiles.js:
 * an is_active-gated directory of profiles tagged with machine categories
 * through a many-to-many join table, a single-record detail fetch with the
 * profile embedded, "my record" regardless of is_active, an upsert-then-
 * retag save, and delete.
 *
 * Each of those modules is a thin config wrapper around this factory — see
 * them for the exact table/column names and FK constraint name.
 *
 * config:
 *   table         - main table name (e.g. 'service_capabilities')
 *   categoryTable - many-to-many category tags table (e.g. 'service_capability_categories')
 *   fkConstraint  - FK constraint name for the `profiles!...` embed in the detail query
 *   fields        - SELECT fields block for the main table's own columns
 *   searchFields  - [field1, field2] used to build the `or(...)` search filter
 *   toRow(input)  - maps the save() input object to the upsert row (everything
 *                   except profile_id, which the factory adds itself)
 */
export function createCapabilityApi({ table, categoryTable, fkConstraint, fields, searchFields, toRow }) {
  const [searchField1, searchField2] = searchFields

  /**
   * Active rows, optionally filtered by category. Category filtering is a
   * many-to-many inner join against categoryTable (a profile can cover
   * several categories) — a materially different query shape from the
   * requirement/listing factory's direct machine_category_id column filter.
   */
  async function getMany({ categoryIds, search, city, excludeProfileId, limit = 50, offset = 0 } = {}) {
    const hasCategoryFilter = categoryIds && categoryIds.length > 0

    let query = supabase
      .from(table)
      .select(`
        ${fields},
        ${categoryTable}${hasCategoryFilter ? '!inner' : ''} ( machine_category_id, machine_categories ( id, name ) )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (hasCategoryFilter) {
      query = query.in(`${categoryTable}.machine_category_id`, categoryIds)
    }

    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    if (excludeProfileId) {
      query = query.neq('profile_id', excludeProfileId)
    }

    if (search) {
      const term = sanitizeTerm(search)
      query = query.or(`${searchField1}.ilike.%${term}%,${searchField2}.ilike.%${term}%`)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) throw error

    return data
  }

  async function getOne(profileId) {
    const { data, error } = await supabase
      .from(table)
      .select(`
        ${fields},
        ${categoryTable} ( machine_category_id, machine_categories ( id, name ) ),
        profiles:profiles!${fkConstraint} ( id, company_name, city, state, about, website )
      `)
      .eq('profile_id', profileId)
      .single()

    if (error) throw error

    return data
  }

  /**
   * The caller's own row, regardless of is_active — used to decide
   * create-vs-edit mode on the setup page. Returns null (not an error) when
   * no row exists yet.
   */
  async function getMine(profileId) {
    const { data, error } = await supabase
      .from(table)
      .select(`
        ${fields},
        ${categoryTable} ( machine_category_id )
      `)
      .eq('profile_id', profileId)
      .maybeSingle()

    if (error) throw error

    return data
  }

  /**
   * Upsert the row, then replace its category tags. Two sequential calls,
   * not atomic — acceptable at this codebase's simplicity level (no
   * Postgres function/RPC), but a known limitation: a failure between the
   * two calls can leave stale tags, self-correcting on the next save.
   */
  async function save(input) {
    const { profileId, categoryIds } = input

    const { error: upsertError } = await supabase
      .from(table)
      .upsert({
        profile_id: profileId,
        ...toRow(input)
      })

    if (upsertError) throw upsertError

    const { error: deleteError } = await supabase
      .from(categoryTable)
      .delete()
      .eq('profile_id', profileId)

    if (deleteError) throw deleteError

    if (categoryIds.length > 0) {
      const { error: insertError } = await supabase
        .from(categoryTable)
        .insert(categoryIds.map(machineCategoryId => ({ profile_id: profileId, machine_category_id: machineCategoryId })))

      if (insertError) throw insertError
    }

    return getMine(profileId)
  }

  async function remove(profileId) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('profile_id', profileId)

    if (error) throw error

    return true
  }

  return { getMany, getOne, getMine, save, remove }
}
