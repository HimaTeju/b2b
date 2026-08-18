import { supabase } from '../supabase'

// Which tables represent "did something in this domain" for recency
// ranking. Deliberately just the tables a profile owns directly (listings/
// requirements/capability rows) — not enquiries — so this stays one cheap
// indexed query per table rather than also scanning both sides of enquiries
// per domain.
const DOMAIN_TABLES = {
  marketplace: ['marketplace_listings'],
  services: ['service_requirements', 'service_capabilities'],
  jobwork: ['jobwork_requirements', 'jobwork_capabilities'],
  jobs: ['job_posts', 'job_seeker_profiles']
}

async function latestCreatedAt(table, profileId) {
  const { data, error } = await supabase
    .from(table)
    .select('created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error

  return data?.[0]?.created_at ?? null
}

/**
 * Most recent created_at per domain, for this profile, across that domain's
 * own tables — used to bias Home's domain ordering toward what a user
 * actually does. See lib/domains.jsx's rankDomains for how this combines
 * with declared onboarding interests.
 */
export async function getDomainActivity(profileId) {
  const entries = await Promise.all(
    Object.entries(DOMAIN_TABLES).map(async ([domain, tables]) => {
      const dates = await Promise.all(tables.map(table => latestCreatedAt(table, profileId)))
      const latest = dates.filter(Boolean).sort().at(-1) ?? null
      return [domain, latest]
    })
  )

  return Object.fromEntries(entries)
}
