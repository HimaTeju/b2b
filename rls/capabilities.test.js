import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { serviceRoleClient, signInClient } from './helpers/clients.js'
import { testUsers } from './helpers/testUsers.js'
import { ready } from './helpers/ready.js'
import { testTitle } from '../e2e/helpers/testData.js'

// Enabling a capability (Services / Job Work / Packers & Movers) means
// creating an owner-scoped row in one of these tables — verifies a user
// can only ever enable/manage their own capability, not someone else's.
const CAPABILITY_TABLES = ['service_capabilities', 'jobwork_capabilities', 'packers_movers_capabilities']

describe.skipIf(!ready)('capability tables RLS', () => {
  let user1, user2, admin

  beforeAll(async () => {
    user1 = await signInClient(testUsers.primary.email, testUsers.primary.password)
    user2 = await signInClient(testUsers.secondary.email, testUsers.secondary.password)
    admin = serviceRoleClient()
  })

  for (const table of CAPABILITY_TABLES) {
    describe(table, () => {
      afterEach(async () => {
        await admin.from(table).delete().eq('profile_id', user1.userId)
      })

      it('lets the owner create their own capability row', async () => {
        const { error } = await user1.client.from(table).insert({
          profile_id: user1.userId,
          title: testTitle('rls-capability'),
        })
        expect(error).toBeNull()
      })

      it('blocks another user from creating a capability row for someone else', async () => {
        const { error } = await user2.client.from(table).insert({
          profile_id: user1.userId,
          title: testTitle('rls-capability-impersonation'),
        })
        expect(error).not.toBeNull()
      })

      it("blocks another user from updating someone else's capability row", async () => {
        const { error: setupError } = await admin.from(table).insert({
          profile_id: user1.userId,
          title: testTitle('rls-capability-target'),
        })
        expect(setupError).toBeNull()

        const { data, error } = await user2.client
          .from(table)
          .update({ title: 'hijacked' })
          .eq('profile_id', user1.userId)
          .select()
        expect(error).toBeNull()
        expect(data).toEqual([])
      })
    })
  }
})
