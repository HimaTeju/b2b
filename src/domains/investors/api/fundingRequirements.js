import { createRequirementApi } from '../../../lib/api/createRequirementApi'

const REQUIREMENT_SUMMARY_SELECT = `
  id,
  profile_id,
  title,
  description,
  city,
  state,
  status,
  created_at,
  updated_at
`

const REQUIREMENT_DETAIL_SELECT = `
  ${REQUIREMENT_SUMMARY_SELECT},
  profiles:profile_id ( id, company_name, city, state, about, website )
`

/**
 * "My project is seeking funding" posts — same shape as
 * businessServicesRequirements.js, but free text only (title/description),
 * so there are no extra filters beyond the factory's search.
 */
const api = createRequirementApi({
  table: 'funding_requirements',
  summarySelect: REQUIREMENT_SUMMARY_SELECT,
  detailSelect: REQUIREMENT_DETAIL_SELECT
})

export const getFundingRequirements = api.getMany
export const getFundingRequirement = api.getOne
export const getMyFundingRequirements = api.getMine
export const createFundingRequirement = api.create
export const updateFundingRequirement = api.update
export const deleteFundingRequirement = api.remove
