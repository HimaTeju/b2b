// Deletes enquiries created by load/marketplace.js's enquiryWrite scenario
// (identified by the `load-test-` message prefix — see helpers/config.js).
// Run after every load test run against the live project: `npm run test:load:cleanup`.
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const LOAD_TEST_PREFIX = 'load-test-'

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — see load/README.md')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const { data, error } = await admin
  .from('enquiries')
  .delete()
  .like('message', `${LOAD_TEST_PREFIX}%`)
  .select('id')

if (error) {
  console.error('Cleanup failed:', error.message)
  process.exit(1)
}

console.log(`Deleted ${data?.length ?? 0} load-test enquiries.`)
