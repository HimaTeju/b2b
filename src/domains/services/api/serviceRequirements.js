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
 * "I need a repair/service" requirement posts — same shape/filter pattern as
 * lib/api/listings.js minus price/quantity/condition/intent (service_requirements
 * has no such columns).
 */
const api = createRequirementApi({
  table: 'service_requirements',
  summarySelect: REQUIREMENT_SUMMARY_SELECT,
  detailSelect: REQUIREMENT_DETAIL_SELECT
})

export const getServiceRequirements = api.getMany
export const getServiceRequirement = api.getOne
export const getMyServiceRequirements = api.getMine
export const createServiceRequirement = api.create
export const updateServiceRequirement = api.update
export const deleteServiceRequirement = api.remove
