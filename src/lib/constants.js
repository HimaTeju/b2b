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

export const SECTIONS = ['MACHINERY', 'TOOLS_ACCESSORIES', 'SCRAP', 'PROPERTY']

export const SECTION_LABELS = {
  MACHINERY: 'Machinery',
  TOOLS_ACCESSORIES: 'Tools & Accessories',
  SCRAP: 'Scrap',
  PROPERTY: 'Property'
}

// Route segment appended after /marketplace for each section (Machinery keeps the bare path).
export const SECTION_PATH = {
  MACHINERY: '',
  TOOLS_ACCESSORIES: '/tools-accessories',
  SCRAP: '/scrap',
  PROPERTY: '/property'
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

// Property section (industrial sheds, warehouses, shops…). deal_type is a DB
// enum (see 030_marketplace_property_fields.sql); `intent` still decides
// whether the post is an offer or a requirement.
export const PROPERTY_DEAL_TYPES = ['RENT', 'SALE']

export const PROPERTY_DEAL_LABELS = {
  RENT: 'Rent',
  SALE: 'Sale'
}

// marketplace_listings.property_type is free text (Property only), validated
// against this static list so it can grow without a migration.
export const PROPERTY_TYPES = [
  'Industrial Shed',
  'Warehouse',
  'Godown',
  'Factory Building',
  'Shop',
  'Showroom',
  'Office Space',
  'Cold Storage',
  'Industrial Plot / Land',
  'Other'
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

// business_service_capabilities.service_types / business_service_requirements.service_type
// are free text validated against this static list (see 031_business_services.sql),
// so new professions can be added without a migration.
export const BUSINESS_SERVICE_TYPES = [
  'Import-Export Advice',
  'Import-Export Services',
  'Audit',
  'Tax Services',
  'Other'
]

export const BUSINESS_SERVICES_DISCLAIMER =
  'B2B connects businesses with service providers but does not verify credentials or give professional advice. Check qualifications before you engage anyone.'

// investor_capabilities.sectors / funding_requirements.sector and .stage are free
// text validated against these static lists (see 032_investors.sql), so they can
// grow without a migration.
export const INVESTMENT_SECTORS = [
  'Manufacturing',
  'Engineering & Machinery',
  'Export & Trade',
  'Real Estate & Infrastructure',
  'Agriculture & Food',
  'Energy & Utilities',
  'Services & Technology',
  'Other'
]

export const PROJECT_STAGES = ['Idea', 'Startup', 'Running business', 'Expansion']

export const INVESTORS_DISCLAIMER =
  'B2B only connects people. It does not verify projects or investors, or give investment advice. Do your own checks before committing any money.'
