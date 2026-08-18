import { supabase } from '../supabase'
import { getMachineCategories, categoryAndDescendantIds } from './categories'

const PREVIEW_LIMIT = 3

function sanitizeTerm(term) {
  // Strip characters that would corrupt PostgREST's or-filter grammar
  // (`,` separates conditions, `()` wraps in-lists) or behave as ilike
  // wildcards (`%`) rather than literal search text.
  return term.trim().replace(/[,()%]/g, ' ').replace(/\s+/g, ' ').trim()
}

async function matchedCategoryIds(term) {
  const categories = await getMachineCategories()
  const lower = term.toLowerCase()
  const matches = categories.filter(c => c.name.toLowerCase().includes(lower))
  if (matches.length === 0) return []

  const ids = new Set()
  matches.forEach(m => categoryAndDescendantIds(m.id, categories).forEach(id => ids.add(id)))
  return [...ids]
}

// Surfaces backed by a direct machine_category_id column on the table
// itself — a matched category can be OR-ed into the same query as the text
// match in one round trip.
const DIRECT_CATEGORY_SURFACES = [
  {
    key: 'marketplace-listings',
    table: 'marketplace_listings',
    select: 'id, title, city, state, condition, price, intent, machine_categories:machine_category_id ( name )',
    statusFilter: q => q.eq('status', 'ACTIVE').eq('intent', 'SELL'),
    textColumns: ['title', 'description'],
    group: 'marketplace',
    label: 'Marketplace · Listings',
    path: '/marketplace',
    itemKey: item => item.id,
    detailPath: item => `/marketplace/${item.id}`
  },
  {
    key: 'marketplace-requirements',
    table: 'marketplace_listings',
    select: 'id, title, city, state, condition, price, intent, machine_categories:machine_category_id ( name )',
    statusFilter: q => q.eq('status', 'ACTIVE').eq('intent', 'REQUIREMENT'),
    textColumns: ['title', 'description'],
    group: 'marketplace',
    label: 'Marketplace · Requirements',
    path: '/marketplace/requirements',
    itemKey: item => item.id,
    detailPath: item => `/marketplace/${item.id}`
  },
  {
    key: 'service-requirements',
    table: 'service_requirements',
    select: 'id, title, description, city, state, created_at, machine_categories:machine_category_id ( name )',
    statusFilter: q => q.eq('status', 'ACTIVE'),
    textColumns: ['title', 'description'],
    group: 'services',
    label: 'Services · Requirements',
    path: '/services/requirements',
    itemKey: item => item.id,
    detailPath: item => `/services/requirements/${item.id}`
  },
  {
    key: 'jobwork-requirements',
    table: 'jobwork_requirements',
    select: 'id, title, description, city, state, created_at, machine_categories:machine_category_id ( name )',
    statusFilter: q => q.eq('status', 'ACTIVE'),
    textColumns: ['title', 'description'],
    group: 'jobwork',
    label: 'Job Work · Requirements',
    path: '/job-work/requirements',
    itemKey: item => item.id,
    detailPath: item => `/job-work/requirements/${item.id}`
  },
  {
    key: 'job-posts',
    table: 'job_posts',
    select: 'id, title, description, city, state, created_at, machine_categories:machine_category_id ( name )',
    statusFilter: q => q.eq('status', 'ACTIVE'),
    textColumns: ['title', 'description'],
    group: 'jobs',
    label: 'Jobs · Job Posts',
    path: '/jobs',
    itemKey: item => item.id,
    detailPath: item => `/jobs/${item.id}`
  }
]

// Surfaces where category coverage lives in a many-to-many join table
// (capability profiles can cover several categories). OR-ing a join-table
// match into the same query as a text match on the base table doesn't
// compose cleanly in PostgREST, so these stay text-only for this preview
// search — the category boost is a nice-to-have, not worth doubling the
// query count for 3 of 8 surfaces. Full category filtering is still
// available on each surface's own browse page via CategoryFilterSheet.
const TEXT_ONLY_SURFACES = [
  {
    key: 'service-providers',
    table: 'service_capabilities',
    select: 'profile_id, title, city, state, service_capability_categories ( machine_categories ( name ) )',
    statusFilter: q => q.eq('is_active', true),
    textColumns: ['title', 'description'],
    group: 'services',
    label: 'Services · Providers',
    path: '/services',
    itemKey: item => item.profile_id,
    detailPath: item => `/services/providers/${item.profile_id}`
  },
  {
    key: 'jobwork-vendors',
    table: 'jobwork_capabilities',
    select: 'profile_id, title, city, state, jobwork_capability_categories ( machine_categories ( name ) )',
    statusFilter: q => q.eq('is_active', true),
    textColumns: ['title', 'description'],
    group: 'jobwork',
    label: 'Job Work · Vendors',
    path: '/job-work',
    itemKey: item => item.profile_id,
    detailPath: item => `/job-work/vendors/${item.profile_id}`
  },
  {
    key: 'job-seekers',
    table: 'job_seeker_profiles',
    select: 'profile_id, headline, city, state, experience_years, job_seeker_categories ( machine_categories ( name ) )',
    statusFilter: q => q.eq('is_active', true),
    textColumns: ['headline', 'about'],
    group: 'jobs',
    label: 'Jobs · Job Seekers',
    path: '/jobs/seekers',
    itemKey: item => item.profile_id,
    detailPath: item => `/jobs/seekers/${item.profile_id}`
  }
]

function toGroupResult(surface, data, count) {
  return {
    key: surface.key,
    group: surface.group,
    label: surface.label,
    path: surface.path,
    itemKey: surface.itemKey,
    detailPath: surface.detailPath,
    items: data,
    count: count ?? data.length
  }
}

async function runDirectCategorySurface(surface, term, categoryIds, excludeProfileId) {
  let query = supabase.from(surface.table).select(surface.select, { count: 'exact' })
  query = surface.statusFilter(query)
  if (excludeProfileId) query = query.neq('profile_id', excludeProfileId)
  query = query.order('created_at', { ascending: false }).limit(PREVIEW_LIMIT)

  const textClauses = surface.textColumns.map(col => `${col}.ilike.%${term}%`)
  const clauses = categoryIds.length > 0
    ? [...textClauses, `machine_category_id.in.(${categoryIds.join(',')})`]
    : textClauses
  query = query.or(clauses.join(','))

  const { data, error, count } = await query
  if (error) throw error
  return toGroupResult(surface, data, count)
}

async function runTextOnlySurface(surface, term, excludeProfileId) {
  let query = supabase.from(surface.table).select(surface.select, { count: 'exact' })
  query = surface.statusFilter(query)
  if (excludeProfileId) query = query.neq('profile_id', excludeProfileId)
  query = query.order('created_at', { ascending: false }).limit(PREVIEW_LIMIT)

  query = query.or(surface.textColumns.map(col => `${col}.ilike.%${term}%`).join(','))

  const { data, error, count } = await query
  if (error) throw error
  return toGroupResult(surface, data, count)
}

/**
 * Universal search across all 8 browse surfaces (see DATABASE_SCHEMA.md's
 * conceptual model — 4 domains, each with a demand and a supply side).
 * Returns one entry per surface that has at least one match, each capped
 * at PREVIEW_LIMIT items plus a total count for "See all N". A term that
 * also matches a machine_categories name additionally pulls in rows tagged
 * under that category (and its sub-categories) for the 5 surfaces with a
 * direct category column — see TEXT_ONLY_SURFACES for the 3 that don't.
 */
export async function getUniversalSearchResults(rawTerm, { excludeProfileId } = {}) {
  const term = sanitizeTerm(rawTerm)
  if (term.length < 2) return []

  const categoryIds = await matchedCategoryIds(term)

  const results = await Promise.all([
    ...DIRECT_CATEGORY_SURFACES.map(s => runDirectCategorySurface(s, term, categoryIds, excludeProfileId)),
    ...TEXT_ONLY_SURFACES.map(s => runTextOnlySurface(s, term, excludeProfileId))
  ])

  return results.filter(r => r.items.length > 0)
}
