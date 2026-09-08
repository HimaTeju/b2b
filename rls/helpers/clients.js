import { createClient } from '@supabase/supabase-js'

// Node-only helper — never imported by app/browser code, so a service-role
// key here never risks reaching the client bundle.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const noSessionPersistence = { auth: { autoRefreshToken: false, persistSession: false } }

export function hasServiceRole() {
  return Boolean(SUPABASE_URL && ANON_KEY && SERVICE_ROLE_KEY)
}

export function serviceRoleClient() {
  if (!hasServiceRole()) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set — see e2e/README.md')
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, noSessionPersistence)
}

export function anonClient() {
  return createClient(SUPABASE_URL, ANON_KEY, noSessionPersistence)
}

export async function signInClient(email, password) {
  const client = createClient(SUPABASE_URL, ANON_KEY, noSessionPersistence)
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) {
    throw new Error(`RLS test setup: failed to sign in as ${email}: ${error.message}`)
  }
  return { client, userId: data.user.id }
}
