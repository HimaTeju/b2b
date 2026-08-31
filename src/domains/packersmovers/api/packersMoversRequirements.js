import { createRequirementApi } from '../../../lib/api/createRequirementApi'

// city/state are aliased from pickup_city/pickup_state (not drop_city/drop_state)
// so RequirementCard/formatLocation — shared with Services/Job Work/Jobs, which
// only have one location — show the pickup location unmodified. The detail page
// reads pickup_city/pickup_state/drop_city/drop_state directly to show both.
const REQUIREMENT_SUMMARY_SELECT = `
  id,
  profile_id,
  request_type,
  machine_category_id,
  title,
  description,
  city:pickup_city,
  state:pickup_state,
  pickup_city,
  pickup_state,
  drop_city,
  drop_state,
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
 * "I need a machine/shop lifted" requirement posts — same shape/filter
 * pattern as serviceRequirements.js, for the packers_movers_requirements
 * table, plus a request_type filter (MACHINE_LIFTING/SHOP_LIFTING).
 */
const api = createRequirementApi({
  table: 'packers_movers_requirements',
  summarySelect: REQUIREMENT_SUMMARY_SELECT,
  detailSelect: REQUIREMENT_DETAIL_SELECT,
  applyFilters(query, { requestType }) {
    if (requestType) {
      query = query.eq('request_type', requestType)
    }

    return query
  }
})

export const getPackersMoversRequirements = api.getMany
export const getPackersMoversRequirement = api.getOne
export const getMyPackersMoversRequirements = api.getMine
export const createPackersMoversRequirement = api.create
export const updatePackersMoversRequirement = api.update
export const deletePackersMoversRequirement = api.remove
