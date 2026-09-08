import { hasServiceRole } from './clients.js'
import { hasTestUsers } from './testUsers.js'

// Gates every RLS spec the same way: all tests skip (not fail) when the
// dedicated service-role key or test accounts aren't configured locally/in CI.
export const ready = hasServiceRole() && hasTestUsers()
