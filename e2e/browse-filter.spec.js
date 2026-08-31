import { test, expect } from '@playwright/test'
import { login, testUsers, hasUser } from './helpers/auth.js'

test.describe('Browse & filter', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasUser(testUsers.primary), 'E2E_USER1_EMAIL / E2E_USER1_PASSWORD not set')
    await login(page, testUsers.primary)
  })

  test('searching the marketplace filters the listing grid', async ({ page }) => {
    await page.goto('/#/marketplace')
    await expect(page.getByRole('heading', { name: /Browse Machinery/ })).toBeVisible()

    const search = page.getByPlaceholder(/Search machinery/)
    await search.fill('zzzz-no-listing-should-match-zzzz')

    await expect(page.getByText('No listings match these filters.')).toBeVisible()
  })

  test('switching sections navigates between machinery, tools & accessories, and scrap', async ({ page }) => {
    await page.goto('/#/marketplace')

    await page.getByRole('button', { name: 'Scrap' }).click()
    await expect(page).toHaveURL(/\/#\/marketplace\/scrap$/)
    await expect(page.getByRole('heading', { name: /Browse Scrap/ })).toBeVisible()
  })

  test('the category filter sheet opens and can be dismissed', async ({ page }) => {
    await page.goto('/#/marketplace')

    await page.getByRole('button', { name: 'All categories' }).click()
    await expect(page.getByRole('dialog', { name: 'Select category' })).toBeVisible()
  })
})
