import { createRequirementApi } from '../../../lib/api/createRequirementApi'

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
const api = createRequirementApi({
  table: 'job_posts',
  summarySelect: JOB_POST_SUMMARY_SELECT,
  detailSelect: JOB_POST_DETAIL_SELECT
})

export const getJobPosts = api.getMany
export const getJobPost = api.getOne
export const getMyJobPosts = api.getMine
export const createJobPost = api.create
export const updateJobPost = api.update
export const deleteJobPost = api.remove
