// Prefix so test-created records (users, listings, enquiries) are easy to spot
// and clean up in the live Supabase project the e2e suite runs against.
export const TEST_PREFIX = 'e2e-test-'

export function testTitle(label) {
  return `${TEST_PREFIX}${label} ${Date.now()}`
}
