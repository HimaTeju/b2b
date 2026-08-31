import { expect } from '@playwright/test'

// Pre-confirmed test accounts on the live Supabase project (see e2e/README.md).
// Tests that need auth are skipped, not failed, when credentials aren't provided
// so the suite still runs (e.g. browse/filter) without Supabase test users set up.
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

export async function login(page, user) {
  await page.goto('/#/login')
  await page.getByLabel('Email').fill(user.email)
  await page.getByLabel('Password', { exact: true }).fill(user.password)
  await page.getByRole('button', { name: /Sign in/ }).click()
  await expect(page).toHaveURL(/\/#\/$/)
}
