import { createCapabilityApi } from '../../../lib/api/createCapabilityApi'

const CAPABILITY_FIELDS = `
  profile_id,
  title,
  description,
  city,
  state,
  is_active,
  created_at,
  updated_at
`

/**
 * Packers & Movers vendor profiles — same shape/filter pattern as
 * serviceCapabilities.js, for the packers_movers_capabilities table.
 */
const api = createCapabilityApi({
  table: 'packers_movers_capabilities',
  categoryTable: 'packers_movers_capability_categories',
  fkConstraint: 'packers_movers_capabilities_profile_id_fkey',
  fields: CAPABILITY_FIELDS,
  searchFields: ['title', 'description'],
  toRow: ({ title, description, city, state, isActive }) => ({
    title,
    description,
    city,
    state,
    is_active: isActive
  })
})

export const getPackersMoversVendors = api.getMany
export const getPackersMoversVendor = api.getOne
export const getMyPackersMoversCapability = api.getMine
export const savePackersMoversCapability = api.save
export const deletePackersMoversCapability = api.remove
