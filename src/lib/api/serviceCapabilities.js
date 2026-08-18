import { supabase } from '../supabase'

const CAPABILITY_FIELDS = `
  profile_id,
  title,
  description,
  city,
  state,
  is_active,
  created_at,
  updated_at
`

/**
 * Active service-provider profiles, optionally filtered by category. Category
 * filtering is a many-to-many inner join against service_capability_categories
 * (a provider can cover several categories) — a materially different query
 * shape from listings.js's direct machine_category_id column filter.
 */
export async function getServiceProviders({ categoryIds, search, city, excludeProfileId, limit = 50, offset = 0 } = {}) {
  const hasCategoryFilter = categoryIds && categoryIds.length > 0

  let query = supabase
    .from('service_capabilities')
    .select(`
      ${CAPABILITY_FIELDS},
      service_capability_categories${hasCategoryFilter ? '!inner' : ''} ( machine_category_id, machine_categories ( id, name ) )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (hasCategoryFilter) {
    query = query.in('service_capability_categories.machine_category_id', categoryIds)
  }

  if (city) {
    query = query.ilike('city', `%${city}%`)
  }

  if (excludeProfileId) {
    query = query.neq('profile_id', excludeProfileId)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) throw error

  return data
}

export async function getServiceProvider(profileId) {
  const { data, error } = await supabase
    .from('service_capabilities')
    .select(`
      ${CAPABILITY_FIELDS},
      service_capability_categories ( machine_category_id, machine_categories ( id, name ) ),
      profiles:profiles!service_capabilities_profile_id_fkey ( id, company_name, city, state, about, website )
    `)
    .eq('profile_id', profileId)
    .single()

  if (error) throw error

  return data
}

/**
 * The caller's own capability row, regardless of is_active — used to decide
 * create-vs-edit mode on the setup page. Returns null (not an error) when no
 * row exists yet.
 */
export async function getMyServiceCapability(profileId) {
  const { data, error } = await supabase
    .from('service_capabilities')
    .select(`
      ${CAPABILITY_FIELDS},
      service_capability_categories ( machine_category_id )
    `)
    .eq('profile_id', profileId)
    .maybeSingle()

  if (error) throw error

  return data
}

/**
 * Upsert the capability row, then replace its category tags. Two sequential
 * calls, not atomic — acceptable at this codebase's simplicity level (no
 * Postgres function/RPC), but a known limitation: a failure between the two
 * calls can leave stale tags, self-correcting on the next save.
 */
export async function saveServiceCapability({ profileId, title, description, city, state, isActive, categoryIds }) {
  const { error: upsertError } = await supabase
    .from('service_capabilities')
    .upsert({
      profile_id: profileId,
      title,
      description,
      city,
      state,
      is_active: isActive
    })

  if (upsertError) throw upsertError

  const { error: deleteError } = await supabase
    .from('service_capability_categories')
    .delete()
    .eq('profile_id', profileId)

  if (deleteError) throw deleteError

  if (categoryIds.length > 0) {
    const { error: insertError } = await supabase
      .from('service_capability_categories')
      .insert(categoryIds.map(machineCategoryId => ({ profile_id: profileId, machine_category_id: machineCategoryId })))

    if (insertError) throw insertError
  }

  return getMyServiceCapability(profileId)
}

export async function deleteServiceCapability(profileId) {
  const { error } = await supabase
    .from('service_capabilities')
    .delete()
    .eq('profile_id', profileId)

  if (error) throw error

  return true
}
