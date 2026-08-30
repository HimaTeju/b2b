import { supabase } from '../../../lib/supabase'

const SEEKER_FIELDS = `
  profile_id,
  headline,
  about,
  experience_years,
  resume_url,
  city,
  state,
  is_active,
  created_at,
  updated_at
`

/**
 * Active job seeker profiles, optionally filtered by category. Mirrors
 * jobworkCapabilities.js's getJobWorkVendors — category filtering is a
 * many-to-many inner join against job_seeker_categories.
 */
export async function getJobSeekers({ categoryIds, search, city, excludeProfileId, limit = 50, offset = 0 } = {}) {
  const hasCategoryFilter = categoryIds && categoryIds.length > 0

  let query = supabase
    .from('job_seeker_profiles')
    .select(`
      ${SEEKER_FIELDS},
      job_seeker_categories${hasCategoryFilter ? '!inner' : ''} ( machine_category_id, machine_categories ( id, name ) )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (hasCategoryFilter) {
    query = query.in('job_seeker_categories.machine_category_id', categoryIds)
  }

  if (city) {
    query = query.ilike('city', `%${city}%`)
  }

  if (excludeProfileId) {
    query = query.neq('profile_id', excludeProfileId)
  }

  if (search) {
    query = query.or(`headline.ilike.%${search}%,about.ilike.%${search}%`)
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) throw error

  return data
}

export async function getJobSeeker(profileId) {
  const { data, error } = await supabase
    .from('job_seeker_profiles')
    .select(`
      ${SEEKER_FIELDS},
      job_seeker_categories ( machine_category_id, machine_categories ( id, name ) ),
      profiles:profiles!job_seeker_profiles_profile_id_fkey ( id, company_name, city, state, about, website )
    `)
    .eq('profile_id', profileId)
    .single()

  if (error) throw error

  return data
}

/**
 * The caller's own job seeker row, regardless of is_active — used to decide
 * create-vs-edit mode on the setup page. Returns null (not an error) when no
 * row exists yet.
 */
export async function getMyJobSeekerProfile(profileId) {
  const { data, error } = await supabase
    .from('job_seeker_profiles')
    .select(`
      ${SEEKER_FIELDS},
      job_seeker_categories ( machine_category_id )
    `)
    .eq('profile_id', profileId)
    .maybeSingle()

  if (error) throw error

  return data
}

/**
 * Upsert the job seeker row, then replace its category tags. Two sequential
 * calls, not atomic — same known limitation as saveJobWorkCapability.
 */
export async function saveJobSeekerProfile({ profileId, headline, about, experienceYears, resumeUrl, city, state, isActive, categoryIds }) {
  const { error: upsertError } = await supabase
    .from('job_seeker_profiles')
    .upsert({
      profile_id: profileId,
      headline,
      about,
      experience_years: experienceYears,
      resume_url: resumeUrl,
      city,
      state,
      is_active: isActive
    })

  if (upsertError) throw upsertError

  const { error: deleteError } = await supabase
    .from('job_seeker_categories')
    .delete()
    .eq('profile_id', profileId)

  if (deleteError) throw deleteError

  if (categoryIds.length > 0) {
    const { error: insertError } = await supabase
      .from('job_seeker_categories')
      .insert(categoryIds.map(machineCategoryId => ({ profile_id: profileId, machine_category_id: machineCategoryId })))

    if (insertError) throw insertError
  }

  return getMyJobSeekerProfile(profileId)
}

export async function deleteJobSeekerProfile(profileId) {
  const { error } = await supabase
    .from('job_seeker_profiles')
    .delete()
    .eq('profile_id', profileId)

  if (error) throw error

  return true
}
