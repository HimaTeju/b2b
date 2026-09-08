// k6 runs this in its own JS runtime (not Node) — no npm imports, only
// k6/* built-ins. __ENV is k6's read-through of the OS environment the
// process was started with (see load/README.md for what to export).

export function requireEnv(name) {
  const value = __ENV[name]
  if (!value) {
    throw new Error(`Missing required env var ${name} — see load/README.md`)
  }
  return value
}

// Refuses to run unless the operator explicitly acknowledges this hits the
// same Supabase project real users are on (see load/README.md's safety
// section for why there's no dedicated load-test project here).
export function requireLiveConfirmation() {
  if (__ENV.LOAD_TEST_CONFIRM !== 'live') {
    throw new Error(
      'Refusing to run: set LOAD_TEST_CONFIRM=live to confirm you intend to run this against ' +
      'the live Supabase project, off-peak, at the concurrency levels documented in load/README.md.'
    )
  }
}

export const SUPABASE_URL = requireEnv('VITE_SUPABASE_URL')
export const ANON_KEY = requireEnv('VITE_SUPABASE_ANON_KEY')
export const REST_URL = `${SUPABASE_URL}/rest/v1`
export const AUTH_URL = `${SUPABASE_URL}/auth/v1`

// Prefix for any data this suite writes, so it's identifiable and safe to
// clean up — same convention as e2e/helpers/testData.js's `e2e-test-` prefix.
export const LOAD_TEST_PREFIX = 'load-test-'

export function anonHeaders(extra = {}) {
  return { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json', ...extra }
}

export function authHeaders(accessToken, extra = {}) {
  return { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', ...extra }
}
