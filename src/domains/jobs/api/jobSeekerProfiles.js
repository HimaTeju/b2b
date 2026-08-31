import { createCapabilityApi } from '../../../lib/api/createCapabilityApi'

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
 * Job seeker profiles — mirrors jobworkCapabilities.js, for the
 * job_seeker_profiles table.
 */
const api = createCapabilityApi({
  table: 'job_seeker_profiles',
  categoryTable: 'job_seeker_categories',
  fkConstraint: 'job_seeker_profiles_profile_id_fkey',
  fields: SEEKER_FIELDS,
  searchFields: ['headline', 'about'],
  toRow: ({ headline, about, experienceYears, resumeUrl, city, state, isActive }) => ({
    headline,
    about,
    experience_years: experienceYears,
    resume_url: resumeUrl,
    city,
    state,
    is_active: isActive
  })
})

export const getJobSeekers = api.getMany
export const getJobSeeker = api.getOne
export const getMyJobSeekerProfile = api.getMine
export const saveJobSeekerProfile = api.save
export const deleteJobSeekerProfile = api.remove
