// k6 load test for the marketplace's highest-traffic Supabase-backed flows:
// browse/filter, search, listing detail, sign-in, and enquiry submission
// (write path). Talks to PostgREST/GoTrue directly (same endpoints
// @supabase/supabase-js calls) since k6 scripts run in their own JS
// runtime, not Node, and can't import supabase-js.
//
// Run via `npm run test:load` — see load/README.md before running this
// against anything, especially the *why* behind LOAD_TEST_CONFIRM and the
// conservative default VUs/durations below.
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Counter } from 'k6/metrics'
import {
  REST_URL,
  AUTH_URL,
  anonHeaders,
  authHeaders,
  requireEnv,
  requireLiveConfirmation,
  LOAD_TEST_PREFIX,
} from './helpers/config.js'

requireLiveConfirmation()

const TEST_USER1 = { email: requireEnv('E2E_USER1_EMAIL'), password: requireEnv('E2E_USER1_PASSWORD') }
const TEST_USER2 = { email: requireEnv('E2E_USER2_EMAIL'), password: requireEnv('E2E_USER2_PASSWORD') }

const enquiryWriteErrors = new Counter('enquiry_write_errors')
const signinErrors = new Counter('signin_errors')

// Conservative defaults for running against the live project off-peak.
// Override via `k6 run -e BROWSE_VUS=10 ...` once you've confirmed headroom
// at these defaults — see load/README.md's "raising concurrency" section.
export const options = {
  scenarios: {
    browse: {
      executor: 'constant-vus',
      exec: 'browse',
      vus: Number(__ENV.BROWSE_VUS || 3),
      duration: __ENV.BROWSE_DURATION || '30s',
    },
    search: {
      executor: 'constant-vus',
      exec: 'search',
      vus: Number(__ENV.SEARCH_VUS || 2),
      duration: __ENV.SEARCH_DURATION || '30s',
      startTime: '5s',
    },
    listingDetail: {
      executor: 'constant-vus',
      exec: 'listingDetail',
      vus: Number(__ENV.DETAIL_VUS || 2),
      duration: __ENV.DETAIL_DURATION || '30s',
      startTime: '5s',
    },
    // per-vu-iterations with 1 VU so this can't fan out into a burst of
    // password-grant requests — GoTrue rate-limits those aggressively.
    signin: {
      executor: 'per-vu-iterations',
      exec: 'signin',
      vus: 1,
      iterations: Number(__ENV.SIGNIN_ITERATIONS || 5),
      maxDuration: '30s',
    },
    // Write path — deliberately tiny. Every row this creates is prefixed
    // with LOAD_TEST_PREFIX and must be cleaned up with `npm run test:load:cleanup`.
    enquiryWrite: {
      executor: 'shared-iterations',
      exec: 'enquiryWrite',
      vus: 1,
      iterations: Number(__ENV.ENQUIRY_ITERATIONS || 5),
      startTime: '10s',
      maxDuration: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{scenario:browse}': ['p(95)<800'],
    'http_req_duration{scenario:search}': ['p(95)<1000'],
    'http_req_duration{scenario:listingDetail}': ['p(95)<800'],
  },
}

const LISTING_SUMMARY_SELECT =
  'id,profile_id,machine_category_id,intent,section,title,description,condition,price,quantity,' +
  'city,state,status,created_at,machine_categories:machine_category_id(id,name),' +
  'listing_images(id,storage_path,is_primary,display_order)'
const LISTING_DETAIL_SELECT = `${LISTING_SUMMARY_SELECT},profiles:profile_id(id,company_name,city,state,about,website)`

const SEARCH_TERMS = ['lathe', 'press', 'CNC', 'compressor', 'welding']

function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

// Runs once before any VU starts. Browse/search/detail reads all require an
// authenticated session now (020_require_auth_for_public_reads.sql), so this
// signs in once here and hands every VU the same token, alongside a sample
// of real ACTIVE listings so the detail/enquiry scenarios exercise realistic
// ids instead of made-up ones.
export function setup() {
  const signinRes = signInAs(TEST_USER1)
  check(signinRes, { 'setup: signed in': (r) => r.status === 200 })
  if (signinRes.status !== 200) {
    throw new Error(`setup: failed to sign in as ${TEST_USER1.email}: ${signinRes.status} ${signinRes.body}`)
  }
  const { access_token: accessToken } = JSON.parse(signinRes.body)

  const res = http.get(
    `${REST_URL}/marketplace_listings?select=id,profile_id&status=eq.ACTIVE&intent=eq.SELL&limit=25`,
    { headers: authHeaders(accessToken) }
  )
  check(res, { 'setup: fetched sample listings': (r) => r.status === 200 })

  const listings = res.status === 200 ? JSON.parse(res.body) : []
  if (listings.length === 0) {
    throw new Error(
      'No ACTIVE SELL listings found to sample — seed the project with representative data first (see load/README.md).'
    )
  }
  return { listings, accessToken }
}

export function browse(data) {
  const res = http.get(
    `${REST_URL}/marketplace_listings?select=${encodeURIComponent(LISTING_SUMMARY_SELECT)}` +
      '&status=eq.ACTIVE&intent=eq.SELL&order=created_at.desc&limit=20',
    { headers: authHeaders(data.accessToken), tags: { scenario: 'browse' } }
  )
  check(res, { 'browse: 200': (r) => r.status === 200 })
  sleep(1)
}

export function search(data) {
  const term = pick(SEARCH_TERMS)
  const orFilter = `title.ilike.%25${term}%25,description.ilike.%25${term}%25`
  const res = http.get(
    `${REST_URL}/marketplace_listings?select=${encodeURIComponent(LISTING_SUMMARY_SELECT)}` +
      `&status=eq.ACTIVE&or=(${orFilter})&limit=20`,
    { headers: authHeaders(data.accessToken), tags: { scenario: 'search' } }
  )
  check(res, { 'search: 200': (r) => r.status === 200 })
  sleep(1)
}

export function listingDetail(data) {
  const listing = pick(data.listings)
  const res = http.get(
    `${REST_URL}/marketplace_listings?select=${encodeURIComponent(LISTING_DETAIL_SELECT)}&id=eq.${listing.id}`,
    { headers: authHeaders(data.accessToken), tags: { scenario: 'listingDetail' } }
  )
  check(res, { 'listingDetail: 200': (r) => r.status === 200 })
  sleep(1)
}

function signInAs(user) {
  const res = http.post(
    `${AUTH_URL}/token?grant_type=password`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: anonHeaders(), tags: { scenario: 'signin' } }
  )
  return res
}

export function signin() {
  const res = signInAs(TEST_USER1)
  const ok = check(res, { 'signin: 200': (r) => r.status === 200 })
  if (!ok) signinErrors.add(1)
  sleep(2)
}

export function enquiryWrite(data) {
  const signinRes = signInAs(TEST_USER2)
  if (signinRes.status !== 200) {
    enquiryWriteErrors.add(1)
    return
  }
  const { access_token: accessToken, user } = JSON.parse(signinRes.body)

  const candidates = data.listings.filter((l) => l.profile_id !== user.id)
  if (candidates.length === 0) {
    enquiryWriteErrors.add(1)
    return
  }
  const listing = pick(candidates)

  const res = http.post(
    `${REST_URL}/enquiries`,
    JSON.stringify({
      from_profile_id: user.id,
      to_profile_id: listing.profile_id,
      marketplace_listing_id: listing.id,
      message: `${LOAD_TEST_PREFIX}enquiry ${Date.now()}`,
    }),
    { headers: authHeaders(accessToken, { Prefer: 'return=representation' }), tags: { scenario: 'enquiryWrite' } }
  )
  const ok = check(res, { 'enquiryWrite: 201': (r) => r.status === 201 })
  if (!ok) enquiryWriteErrors.add(1)
  sleep(2)
}
