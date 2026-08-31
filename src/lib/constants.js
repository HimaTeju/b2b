// Enum labels shared across pages — mirrors supabase/migrations/002_enums.sql
// Note: the schema also defines a BUY intent, but the app only ever creates
// SELL (seller-posted listings) and REQUIREMENT (buyer-posted asks).

export const INTENT_LABELS = {
  SELL: 'For Sale',
  REQUIREMENT: 'Looking For'
}

export const CONDITIONS = ['NEW', 'USED']

export const CONDITION_LABELS = {
  NEW: 'New',
  USED: 'Used'
}

export const SECTIONS = ['MACHINERY', 'TOOLS_ACCESSORIES', 'SCRAP']

export const SECTION_LABELS = {
  MACHINERY: 'Machinery',
  TOOLS_ACCESSORIES: 'Tools & Accessories',
  SCRAP: 'Scrap'
}

// Route segment appended after /marketplace for each section (Machinery keeps the bare path).
export const SECTION_PATH = {
  MACHINERY: '',
  TOOLS_ACCESSORIES: '/tools-accessories',
  SCRAP: '/scrap'
}

export const WEIGHT_UNITS = ['GM', 'KG']

export const WEIGHT_UNIT_LABELS = {
  GM: 'gm',
  KG: 'kg'
}

// job_posts.job_category is free text (not a DB enum, see 024_job_posts_category.sql)
// validated against this static list so it can grow without a migration.
export const JOB_CATEGORIES = [
  'Technician',
  'Mechanic',
  'Designer',
  'Programmer',
  'Operator',
  'Driver',
  'Helper / Labour',
  'Other'
]
