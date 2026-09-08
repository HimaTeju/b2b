import { describe, it, expect } from 'vitest'
import { anonClient, signInClient } from './helpers/clients.js'
import { testUsers } from './helpers/testUsers.js'
import { ready } from './helpers/ready.js'

// 020_require_auth_for_public_reads.sql: every "anyone can view active X"
// policy requires auth.role() = 'authenticated', so the anon (public) key
// alone must not be able to read any of these tables via the raw REST API.
const TABLES = ['profiles', 'marketplace_listings', 'machine_categories']

describe.skipIf(!ready)('public reads require authentication (020_require_auth_for_public_reads)', () => {
  it.each(TABLES)('blocks anonymous select on %s', async table => {
    const anon = anonClient()
    const { data, error } = await anon.from(table).select('id').limit(1)
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it.each(TABLES)('allows authenticated select on %s', async table => {
    const { client } = await signInClient(testUsers.primary.email, testUsers.primary.password)
    const { error } = await client.from(table).select('id').limit(1)
    expect(error).toBeNull()
  })
})
