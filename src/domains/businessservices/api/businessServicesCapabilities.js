import { supabase } from '../../../lib/supabase'
import { sanitizeTerm } from '../../../lib/api/searchUtil'

const CAPABILITY_FIELDS = `
  profile_id,
  title,
  description,
  service_types,
  city,
  state,
  is_active,
  created_at,
  updated_at
`

/**
 * Business Services provider profiles. Not built on createCapabilityApi:
 * that factory tags profiles with machine categories through a join table,
 * while a provider here lists plain service types in one service_types
 * array column, so there is no join table to filter or re-tag.
 */

/** Active providers, optionally narrowed to ones offering `serviceType`. */
export async function getBusinessServiceProviders({ serviceType, search, city, excludeProfileId, limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from('business_service_capabilities')
    .select(CAPABILITY_FIELDS)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (serviceType) {
    query = query.contains('service_types', [serviceType])
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

export async function getBusinessServiceProvider(profileId) {
  const { data, error } = await supabase
    .from('business_service_capabilities')
    .select(`
      ${CAPABILITY_FIELDS},
      profiles:profiles!business_service_capabilities_profile_id_fkey ( id, company_name, city, state, about, website )
    `)
    .eq('profile_id', profileId)
    .single()

  if (error) throw error

  return data
}

/** The caller's own row regardless of is_active; null (not an error) when none exists yet. */
export async function getMyBusinessServiceCapability(profileId) {
  const { data, error } = await supabase
    .from('business_service_capabilities')
    .select(CAPABILITY_FIELDS)
    .eq('profile_id', profileId)
    .maybeSingle()

  if (error) throw error

  return data
}

export async function saveBusinessServiceCapability({ profileId, title, description, serviceTypes, city, state, isActive }) {
  const { data, error } = await supabase
    .from('business_service_capabilities')
    .upsert({
      profile_id: profileId,
      title,
      description,
      service_types: serviceTypes,
      city,
      state,
      is_active: isActive
    })
    .select(CAPABILITY_FIELDS)
    .single()

  if (error) throw error

  return data
}

export async function deleteBusinessServiceCapability(profileId) {
  const { error } = await supabase
    .from('business_service_capabilities')
    .delete()
    .eq('profile_id', profileId)

  if (error) throw error

  return true
}
