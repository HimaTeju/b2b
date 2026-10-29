import { supabase } from '../../../lib/supabase'
import { sanitizeTerm } from '../../../lib/api/searchUtil'

const CAPABILITY_FIELDS = `
  profile_id,
  title,
  description,
  sectors,
  city,
  state,
  is_active,
  created_at,
  updated_at
`

/**
 * Investor profiles. Same shape as businessServicesCapabilities.js (a plain
 * sectors array column instead of machine-category join tables, so not built
 * on createCapabilityApi).
 */

/** Active investors, optionally narrowed to ones covering `sector`. */
export async function getInvestors({ sector, search, city, excludeProfileId, limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from('investor_capabilities')
    .select(CAPABILITY_FIELDS)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (sector) {
    query = query.contains('sectors', [sector])
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

export async function getInvestor(profileId) {
  const { data, error } = await supabase
    .from('investor_capabilities')
    .select(`
      ${CAPABILITY_FIELDS},
      profiles:profiles!investor_capabilities_profile_id_fkey ( id, company_name, city, state, about, website )
    `)
    .eq('profile_id', profileId)
    .single()

  if (error) throw error

  return data
}

/** The caller's own row regardless of is_active; null (not an error) when none exists yet. */
export async function getMyInvestorCapability(profileId) {
  const { data, error } = await supabase
    .from('investor_capabilities')
    .select(CAPABILITY_FIELDS)
    .eq('profile_id', profileId)
    .maybeSingle()

  if (error) throw error

  return data
}

export async function saveInvestorCapability({ profileId, title, description, sectors, city, state, isActive }) {
  const { data, error } = await supabase
    .from('investor_capabilities')
    .upsert({
      profile_id: profileId,
      title,
      description,
      sectors,
      city,
      state,
      is_active: isActive
    })
    .select(CAPABILITY_FIELDS)
    .single()

  if (error) throw error

  return data
}

export async function deleteInvestorCapability(profileId) {
  const { error } = await supabase
    .from('investor_capabilities')
    .delete()
    .eq('profile_id', profileId)

  if (error) throw error

  return true
}
