import { test, expect } from '@playwright/test'
import { login, testUsers, hasUser } from '../e2e/helpers/auth.js'
import { testTitle } from '../e2e/helpers/testData.js'

// Screens chosen for stable, reproducible baselines: no live/seeded listing
// data whose count or order would drift between runs. Dashboard and Home are
// intentionally excluded here because both render per-user activity counts
// and domain ordering that shift as e2e-test- data accumulates in the live
// project, which would make their baselines flaky rather than a real signal.
test.describe('Visual regression', () => {
  test('login page', async ({ page }) => {
    await page.goto('/#/login')
    await expect(page).toHaveScreenshot('login.png')
  })

  test('register page', async ({ page }) => {
    await page.goto('/#/register')
    await expect(page).toHaveScreenshot('register.png')
  })

  test('browse hub', async ({ page }) => {
    test.skip(!hasUser(testUsers.primary), 'E2E_USER1_EMAIL / E2E_USER1_PASSWORD not set')

    await login(page, testUsers.primary)
    await page.goto('/#/browse')
    await expect(page).toHaveScreenshot('browse-hub.png')
  })

  test('post listing form', async ({ page }) => {
    test.skip(!hasUser(testUsers.primary), 'E2E_USER1_EMAIL / E2E_USER1_PASSWORD not set')

    await login(page, testUsers.primary)
    await page.goto('/#/marketplace/scrap/sell/new')
    await expect(page).toHaveScreenshot('post-listing-form.png')
  })

  test('listing detail page', async ({ page }) => {
    test.skip(!hasUser(testUsers.primary), 'E2E_USER1_EMAIL / E2E_USER1_PASSWORD not set')

    await login(page, testUsers.primary)
    await page.goto('/#/marketplace/scrap/sell/new')
    await page.getByLabel('Title *').fill(testTitle('Visual regression listing'))
    await page.getByLabel('Price (INR)').fill('1500')
    await page.getByRole('button', { name: 'Post listing' }).click()
    await expect(page).toHaveURL(/\/#\/marketplace\/[0-9a-f-]+$/)

    // The title contains a timestamp (testTitle), so it's masked rather than
    // compared pixel-for-pixel — everything else on the page (layout, the
    // intent badge, price) is static and worth catching regressions in.
    await expect(page).toHaveScreenshot('listing-detail.png', {
      mask: [page.getByRole('heading', { level: 1 })],
    })
  })
})
