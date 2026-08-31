import { test, expect } from '@playwright/test'
import { login, testUsers, hasUser } from './helpers/auth.js'
import { testTitle } from './helpers/testData.js'

// Scrap section is used because it has no CategoryPicker dependency, keeping
// the flow deterministic without needing to seed/know real category ids.
test('a logged-in user can post a sell listing and lands on its detail page', async ({ page }) => {
  test.skip(!hasUser(testUsers.primary), 'E2E_USER1_EMAIL / E2E_USER1_PASSWORD not set')

  await login(page, testUsers.primary)

  await page.goto('/#/marketplace/scrap/sell/new')
  const title = testTitle('Scrap listing')

  await page.getByLabel('Title *').fill(title)
  await page.getByLabel('Price (INR)').fill('1500')
  await page.getByRole('button', { name: 'Post listing' }).click()

  await expect(page).toHaveURL(/\/#\/marketplace\/[0-9a-f-]+$/)
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
})
