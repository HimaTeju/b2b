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
