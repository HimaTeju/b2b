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
 * Job-work vendor profiles — mirrors serviceCapabilities.js, for the
 * jobwork_capabilities table.
 */
const api = createCapabilityApi({
  table: 'jobwork_capabilities',
  categoryTable: 'jobwork_capability_categories',
  fkConstraint: 'jobwork_capabilities_profile_id_fkey',
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

export const getJobWorkVendors = api.getMany
export const getJobWorkVendor = api.getOne
export const getMyJobWorkCapability = api.getMine
export const saveJobWorkCapability = api.save
export const deleteJobWorkCapability = api.remove
