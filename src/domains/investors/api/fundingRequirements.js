import { createRequirementApi } from '../../../lib/api/createRequirementApi'

const REQUIREMENT_SUMMARY_SELECT = `
  id,
  profile_id,
  sector,
  stage,
  amount_sought,
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
 * businessServicesRequirements.js, filtered by sector and stage.
 */
const api = createRequirementApi({
  table: 'funding_requirements',
  summarySelect: REQUIREMENT_SUMMARY_SELECT,
  detailSelect: REQUIREMENT_DETAIL_SELECT,
  applyFilters(query, { sector, stage }) {
    if (sector) {
      query = query.eq('sector', sector)
    }

    if (stage) {
      query = query.eq('stage', stage)
    }

    return query
  }
})

export const getFundingRequirements = api.getMany
export const getFundingRequirement = api.getOne
export const getMyFundingRequirements = api.getMine
export const createFundingRequirement = api.create
export const updateFundingRequirement = api.update
export const deleteFundingRequirement = api.remove
