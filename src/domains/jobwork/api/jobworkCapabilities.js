import { supabase } from '../../../lib/supabase'
import { sanitizeTerm } from '../../../lib/api/searchUtil'

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
 * Active job-work vendor profiles, optionally filtered by category. Mirrors
 * serviceCapabilities.js's getServiceProviders — category filtering is a
 * many-to-many inner join against jobwork_capability_categories.
 */
export async function getJobWorkVendors({ categoryIds, search, city, excludeProfileId, limit = 50, offset = 0 } = {}) {
  const hasCategoryFilter = categoryIds && categoryIds.length > 0

  let query = supabase
    .from('jobwork_capabilities')
    .select(`
      ${CAPABILITY_FIELDS},
      jobwork_capability_categories${hasCategoryFilter ? '!inner' : ''} ( machine_category_id, machine_categories ( id, name ) )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (hasCategoryFilter) {
    query = query.in('jobwork_capability_categories.machine_category_id', categoryIds)
  }

  if (city) {
    query = query.ilike('city', `%${city}%`)
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

export async function getJobWorkVendor(profileId) {
  const { data, error } = await supabase
    .from('jobwork_capabilities')
    .select(`
      ${CAPABILITY_FIELDS},
      jobwork_capability_categories ( machine_category_id, machine_categories ( id, name ) ),
      profiles:profiles!jobwork_capabilities_profile_id_fkey ( id, company_name, city, state, about, website )
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
export async function getMyJobWorkCapability(profileId) {
  const { data, error } = await supabase
    .from('jobwork_capabilities')
    .select(`
      ${CAPABILITY_FIELDS},
      jobwork_capability_categories ( machine_category_id )
    `)
    .eq('profile_id', profileId)
    .maybeSingle()

  if (error) throw error

  return data
}

/**
 * Upsert the capability row, then replace its category tags. Two sequential
 * calls, not atomic — same known limitation as saveServiceCapability.
 */
export async function saveJobWorkCapability({ profileId, title, description, city, state, isActive, categoryIds }) {
  const { error: upsertError } = await supabase
    .from('jobwork_capabilities')
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
    .from('jobwork_capability_categories')
    .delete()
    .eq('profile_id', profileId)

  if (deleteError) throw deleteError

  if (categoryIds.length > 0) {
    const { error: insertError } = await supabase
      .from('jobwork_capability_categories')
      .insert(categoryIds.map(machineCategoryId => ({ profile_id: profileId, machine_category_id: machineCategoryId })))

    if (insertError) throw insertError
  }

  return getMyJobWorkCapability(profileId)
}

export async function deleteJobWorkCapability(profileId) {
  const { error } = await supabase
    .from('jobwork_capabilities')
    .delete()
    .eq('profile_id', profileId)

  if (error) throw error

  return true
}
