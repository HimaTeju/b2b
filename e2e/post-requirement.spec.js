import { test, expect } from '@playwright/test'
import { login, testUsers, hasUser } from './helpers/auth.js'
import { testTitle } from './helpers/testData.js'

test('a logged-in user can post a requirement and lands on its detail page', async ({ page }) => {
  test.skip(!hasUser(testUsers.primary), 'E2E_USER1_EMAIL / E2E_USER1_PASSWORD not set')

  await login(page, testUsers.primary)

  await page.goto('/#/marketplace/scrap/requirements/new')
  const title = testTitle('Scrap requirement')

  await page.getByLabel('What are you looking for? *').fill(title)
  await page.getByLabel('Budget (INR)').fill('2000')
  await page.getByRole('button', { name: 'Post requirement' }).click()

  await expect(page).toHaveURL(/\/#\/marketplace\/[0-9a-f-]+$/)
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await expect(page.getByText('Looking For', { exact: true })).toBeVisible()
})
