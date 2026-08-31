import { supabase } from '../../../lib/supabase'
import { sanitizeTerm } from '../../../lib/api/searchUtil'

const REQUIREMENT_SUMMARY_SELECT = `
  id,
  profile_id,
  machine_category_id,
  title,
  description,
  city,
  state,
  status,
  created_at,
  updated_at,
  machine_categories:machine_category_id ( id, name )
`

const REQUIREMENT_DETAIL_SELECT = `
  ${REQUIREMENT_SUMMARY_SELECT},
  profiles:profile_id ( id, company_name, city, state, about, website )
`

/**
 * "I need a job-work vendor" requirement posts — same shape/filter pattern
 * as serviceRequirements.js, for the jobwork_requirements table.
 */
export async function getJobWorkRequirements({ categoryIds, search, excludeProfileId, limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from('jobwork_requirements')
    .select(REQUIREMENT_SUMMARY_SELECT)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })

  if (categoryIds && categoryIds.length > 0) {
    query = query.in('machine_category_id', categoryIds)
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

export async function getJobWorkRequirement(id) {
  const { data, error } = await supabase
    .from('jobwork_requirements')
    .select(REQUIREMENT_DETAIL_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error

  return data
}

export async function getMyJobWorkRequirements(profileId) {
  const { data, error } = await supabase
    .from('jobwork_requirements')
    .select(REQUIREMENT_SUMMARY_SELECT)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function createJobWorkRequirement(requirementData) {
  const { data, error } = await supabase
    .from('jobwork_requirements')
    .insert([requirementData])
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateJobWorkRequirement(id, updates) {
  const { data, error } = await supabase
    .from('jobwork_requirements')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function deleteJobWorkRequirement(id) {
  const { error } = await supabase
    .from('jobwork_requirements')
    .delete()
    .eq('id', id)

  if (error) throw error

  return true
}
