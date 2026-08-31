import { supabase } from '../supabase'

/**
 * Moderation CRUD shape shared by every table the admin panel reviews: an
 * unfiltered (RLS-bypassed-for-admins) list ordered newest first, and a
 * single status/is_active toggle. Relies on the admin SELECT/UPDATE RLS
 * policies added in 021_admin_role.sql — a non-admin caller gets the normal
 * owner/active-only rows back, never an error.
 */
function createModerationApi({ table, idField, select, statusField, activeValue, inactiveValue }) {
  async function getAll({ limit = 100 } = {}) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data
  }

  async function setActive(id, isActive) {
    const { data, error } = await supabase
      .from(table)
      .update({ [statusField]: isActive ? activeValue : inactiveValue })
      .eq(idField, id)
      .select()
      .single()

    if (error) throw error

    return data
  }

  return { getAll, setActive }
}

const users = createModerationApi({
  table: 'profiles',
  idField: 'id',
  select: 'id, company_name, city, state, status, created_at',
  statusField: 'status',
  activeValue: 'ACTIVE',
  inactiveValue: 'SUSPENDED'
})

export const getAllUsers = users.getAll
export const setUserActive = users.setActive

const listings = createModerationApi({
  table: 'marketplace_listings',
  idField: 'id',
  select: 'id, title, intent, section, status, city, state, created_at, profiles:profile_id ( company_name )',
  statusField: 'status',
  activeValue: 'ACTIVE',
  inactiveValue: 'INACTIVE'
})

export const getAllListings = listings.getAll
export const setListingActive = listings.setActive

const serviceProviders = createModerationApi({
  table: 'service_capabilities',
  idField: 'profile_id',
  select: 'profile_id, title, city, state, is_active, created_at, profiles:profiles!service_capabilities_profile_id_fkey ( company_name )',
  statusField: 'is_active',
  activeValue: true,
  inactiveValue: false
})

export const getAllServiceProviders = serviceProviders.getAll
export const setServiceProviderActive = serviceProviders.setActive

const serviceRequirements = createModerationApi({
  table: 'service_requirements',
  idField: 'id',
  select: 'id, title, city, state, status, created_at, profiles:profile_id ( company_name )',
  statusField: 'status',
  activeValue: 'ACTIVE',
  inactiveValue: 'INACTIVE'
})

export const getAllServiceRequirements = serviceRequirements.getAll
export const setServiceRequirementActive = serviceRequirements.setActive

const jobPosts = createModerationApi({
  table: 'job_posts',
  idField: 'id',
  select: 'id, title, city, state, status, created_at, profiles:profile_id ( company_name )',
  statusField: 'status',
  activeValue: 'ACTIVE',
  inactiveValue: 'INACTIVE'
})

export const getAllJobPosts = jobPosts.getAll
export const setJobPostActive = jobPosts.setActive

const jobSeekers = createModerationApi({
  table: 'job_seeker_profiles',
  idField: 'profile_id',
  select: 'profile_id, headline, city, state, is_active, created_at, profiles:profiles!job_seeker_profiles_profile_id_fkey ( company_name )',
  statusField: 'is_active',
  activeValue: true,
  inactiveValue: false
})

export const getAllJobSeekers = jobSeekers.getAll
export const setJobSeekerActive = jobSeekers.setActive

const jobWorkVendors = createModerationApi({
  table: 'jobwork_capabilities',
  idField: 'profile_id',
  select: 'profile_id, title, city, state, is_active, created_at, profiles:profiles!jobwork_capabilities_profile_id_fkey ( company_name )',
  statusField: 'is_active',
  activeValue: true,
  inactiveValue: false
})

export const getAllJobWorkVendors = jobWorkVendors.getAll
export const setJobWorkVendorActive = jobWorkVendors.setActive

const jobWorkRequirements = createModerationApi({
  table: 'jobwork_requirements',
  idField: 'id',
  select: 'id, title, city, state, status, created_at, profiles:profile_id ( company_name )',
  statusField: 'status',
  activeValue: 'ACTIVE',
  inactiveValue: 'INACTIVE'
})

export const getAllJobWorkRequirements = jobWorkRequirements.getAll
export const setJobWorkRequirementActive = jobWorkRequirements.setActive
