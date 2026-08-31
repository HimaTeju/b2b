import { createRequirementApi } from '../../../lib/api/createRequirementApi'

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
const api = createRequirementApi({
  table: 'jobwork_requirements',
  summarySelect: REQUIREMENT_SUMMARY_SELECT,
  detailSelect: REQUIREMENT_DETAIL_SELECT
})

export const getJobWorkRequirements = api.getMany
export const getJobWorkRequirement = api.getOne
export const getMyJobWorkRequirements = api.getMine
export const createJobWorkRequirement = api.create
export const updateJobWorkRequirement = api.update
export const deleteJobWorkRequirement = api.remove
