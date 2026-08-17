import { supabase } from '../supabase'

const ENQUIRY_SELECT = `
  id,
  from_profile_id,
  to_profile_id,
  marketplace_listing_id,
  service_requirement_id,
  jobwork_requirement_id,
  job_post_id,
  service_capability_profile_id,
  jobwork_capability_profile_id,
  message,
  is_read,
  created_at,
  from_profile:from_profile_id ( id, company_name, city, state ),
  to_profile:to_profile_id ( id, company_name, city, state ),
  marketplace_listing:marketplace_listing_id ( id, title, price, city, state ),
  service_requirement:service_requirement_id ( id, title, city, state ),
  jobwork_requirement:jobwork_requirement_id ( id, title, city, state ),
  job_post:job_post_id ( id, title, city, state ),
  service_capability:service_capability_profile_id ( profile_id, title, city, state ),
  jobwork_capability:jobwork_capability_profile_id ( profile_id, title, city, state )
`

// Which of the 6 mutually-exclusive reference columns is set determines what
// an enquiry is "about" and where "View" should navigate. Kept as one lookup
// table so every UI spot (list preview, detail header, detail section) reads
// the same reference-type-to-route mapping via getEnquirySubject().
const SUBJECT_RESOLVERS = [
  { field: 'marketplace_listing_id', key: 'marketplace_listing', kind: 'MARKETPLACE_LISTING', path: row => `/marketplace/${row.id}` },
  { field: 'service_requirement_id', key: 'service_requirement', kind: 'SERVICE_REQUIREMENT', path: row => `/services/requirements/${row.id}` },
  { field: 'jobwork_requirement_id', key: 'jobwork_requirement', kind: 'JOBWORK_REQUIREMENT', path: row => `/job-work/requirements/${row.id}` },
  { field: 'job_post_id', key: 'job_post', kind: 'JOB_POST', path: row => `/jobs/${row.id}` },
  { field: 'service_capability_profile_id', key: 'service_capability', kind: 'SERVICE_CAPABILITY', path: row => `/services/providers/${row.profile_id}` },
  { field: 'jobwork_capability_profile_id', key: 'jobwork_capability', kind: 'JOBWORK_CAPABILITY', path: row => `/job-work/vendors/${row.profile_id}` }
]

/**
 * Resolve which of the 6 reference columns an enquiry row has set, and
 * return a uniform { kind, id, title, path, removed } shape for the UI —
 * `removed` is true when the referenced row was deleted or is no longer
 * visible under RLS (e.g. a deactivated capability profile).
 */
export function getEnquirySubject(enquiry) {
  const match = SUBJECT_RESOLVERS.find(r => enquiry[r.field])
  if (!match) return null

  const row = enquiry[match.key]
  return {
    kind: match.kind,
    id: enquiry[match.field],
    title: row?.title ?? null,
    path: row ? match.path(row) : null,
    removed: !row
  }
}

export async function createEnquiry({
  fromProfileId,
  toProfileId,
  message,
  marketplaceListingId,
  serviceRequirementId,
  jobworkRequirementId,
  jobPostId,
  serviceCapabilityProfileId,
  jobworkCapabilityProfileId
}) {
  const { data, error } = await supabase
    .from('enquiries')
    .insert([{
      from_profile_id: fromProfileId,
      to_profile_id: toProfileId,
      marketplace_listing_id: marketplaceListingId ?? null,
      service_requirement_id: serviceRequirementId ?? null,
      jobwork_requirement_id: jobworkRequirementId ?? null,
      job_post_id: jobPostId ?? null,
      service_capability_profile_id: serviceCapabilityProfileId ?? null,
      jobwork_capability_profile_id: jobworkCapabilityProfileId ?? null,
      message
    }])
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getReceivedEnquiries(profileId) {
  const { data, error } = await supabase
    .from('enquiries')
    .select(ENQUIRY_SELECT)
    .eq('to_profile_id', profileId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function getSentEnquiries(profileId) {
  const { data, error } = await supabase
    .from('enquiries')
    .select(ENQUIRY_SELECT)
    .eq('from_profile_id', profileId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function setEnquiryRead(id, isRead) {
  const { data, error } = await supabase
    .from('enquiries')
    .update({ is_read: isRead })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getEnquiryCounts(profileId) {
  const [sent, received, unread] = await Promise.all([
    supabase
      .from('enquiries')
      .select('id', { count: 'exact', head: true })
      .eq('from_profile_id', profileId),
    supabase
      .from('enquiries')
      .select('id', { count: 'exact', head: true })
      .eq('to_profile_id', profileId),
    supabase
      .from('enquiries')
      .select('id', { count: 'exact', head: true })
      .eq('to_profile_id', profileId)
      .eq('is_read', false)
  ])

  if (sent.error) throw sent.error
  if (received.error) throw received.error
  if (unread.error) throw unread.error

  return {
    sent: sent.count || 0,
    received: received.count || 0,
    unread: unread.count || 0
  }
}
