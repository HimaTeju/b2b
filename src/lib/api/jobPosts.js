import { supabase } from '../supabase'

const JOB_POST_SUMMARY_SELECT = `
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

const JOB_POST_DETAIL_SELECT = `
  ${JOB_POST_SUMMARY_SELECT},
  profiles:profile_id ( id, company_name, city, state, about, website )
`

/**
 * Job vacancy posts — same shape/filter pattern as jobworkRequirements.js,
 * for the job_posts table. Unlike service/job-work capabilities, posting a
 * job has no capability gate: any profile can post one directly.
 */
export async function getJobPosts({ categoryIds, search, excludeProfileId, limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from('job_posts')
    .select(JOB_POST_SUMMARY_SELECT)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })

  if (categoryIds && categoryIds.length > 0) {
    query = query.in('machine_category_id', categoryIds)
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

export async function getJobPost(id) {
  const { data, error } = await supabase
    .from('job_posts')
    .select(JOB_POST_DETAIL_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error

  return data
}

export async function getMyJobPosts(profileId) {
  const { data, error } = await supabase
    .from('job_posts')
    .select(JOB_POST_SUMMARY_SELECT)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function createJobPost(jobPostData) {
  const { data, error } = await supabase
    .from('job_posts')
    .insert([jobPostData])
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateJobPost(id, updates) {
  const { data, error } = await supabase
    .from('job_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function deleteJobPost(id) {
  const { error } = await supabase
    .from('job_posts')
    .delete()
    .eq('id', id)

  if (error) throw error

  return true
}
