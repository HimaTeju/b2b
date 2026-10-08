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

// marketplace_listings.material_type and .shape are free text (Scrap only,
// see DATABASE_SCHEMA.md), validated against these static lists so they can
// grow without a migration — same pattern as JOB_CATEGORIES below.
export const SCRAP_MATERIAL_TYPES = ['Plastic', 'Metal', 'E-Waste']

// Only shown as a second dropdown when Metal is selected above; the metal
// chosen here (not the literal word "Metal") is what gets saved as material_type.
export const SCRAP_METAL_TYPES = [
  'Aluminium',
  'Steel',
  'Iron',
  'Copper',
  'Brass',
  'Bronze',
  'Cobalt',
  'Nickel',
  'Tin',
  'Zinc',
  'MS',
'MSJ'
]

export const SCRAP_SHAPES = ['Solid', 'Sheet', 'Square', 'Round', 'Powder', 'Metal Chips']

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

export const PACKERS_MOVERS_REQUEST_TYPE_LABELS = {
  MACHINE_LIFTING: 'Machine Lifting',
  SHOP_LIFTING: 'Shop Lifting'
}
