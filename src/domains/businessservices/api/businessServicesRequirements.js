import { createRequirementApi } from '../../../lib/api/createRequirementApi'

const REQUIREMENT_SUMMARY_SELECT = `
  id,
  profile_id,
  service_type,
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
 * "I need an import-export / audit / tax service" requirement posts — same
 * shape as packersMoversRequirements.js, filtered by service_type instead of
 * machine category.
 */
const api = createRequirementApi({
  table: 'business_service_requirements',
  summarySelect: REQUIREMENT_SUMMARY_SELECT,
  detailSelect: REQUIREMENT_DETAIL_SELECT,
  applyFilters(query, { serviceType }) {
    if (serviceType) {
      query = query.eq('service_type', serviceType)
    }

    return query
  }
})

export const getBusinessServiceRequirements = api.getMany
export const getBusinessServiceRequirement = api.getOne
export const getMyBusinessServiceRequirements = api.getMine
export const createBusinessServiceRequirement = api.create
export const updateBusinessServiceRequirement = api.update
export const deleteBusinessServiceRequirement = api.remove
