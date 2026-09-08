// Reuses the same pre-confirmed accounts as e2e/helpers/auth.js (not imported
// directly to keep this Node-only suite independent of @playwright/test).
export const testUsers = {
  primary: {
    email: process.env.E2E_USER1_EMAIL,
    password: process.env.E2E_USER1_PASSWORD,
  },
  secondary: {
    email: process.env.E2E_USER2_EMAIL,
    password: process.env.E2E_USER2_PASSWORD,
  },
}

export function hasUser(user) {
  return Boolean(user.email && user.password)
}

export function hasTestUsers() {
  return hasUser(testUsers.primary) && hasUser(testUsers.secondary)
}
