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
 * Service-provider profiles — same shape/filter pattern as
 * jobworkCapabilities.js, for the service_capabilities table.
 */
const api = createCapabilityApi({
  table: 'service_capabilities',
  categoryTable: 'service_capability_categories',
  fkConstraint: 'service_capabilities_profile_id_fkey',
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

export const getServiceProviders = api.getMany
export const getServiceProvider = api.getOne
export const getMyServiceCapability = api.getMine
export const saveServiceCapability = api.save
export const deleteServiceCapability = api.remove
