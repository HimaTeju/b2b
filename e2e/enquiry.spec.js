import { test, expect } from '@playwright/test'
import { login, testUsers, hasUser } from './helpers/auth.js'
import { testTitle } from './helpers/testData.js'

test('a second user can send an enquiry on another user\'s listing', async ({ browser }) => {
  test.skip(
    !hasUser(testUsers.primary) || !hasUser(testUsers.secondary),
    'E2E_USER1_* and E2E_USER2_* must both be set (enquiring requires two distinct accounts)'
  )

  // User 1 posts a listing.
  const posterContext = await browser.newContext()
  const posterPage = await posterContext.newPage()
  await login(posterPage, testUsers.primary)

  await posterPage.goto('/#/marketplace/scrap/sell/new')
  const title = testTitle('Enquiry target')
  await posterPage.getByLabel('Title *').fill(title)
  await posterPage.getByRole('button', { name: 'Post listing' }).click()
  await expect(posterPage).toHaveURL(/\/#\/marketplace\/[0-9a-f-]+$/)
  const listingUrl = posterPage.url()
  await posterContext.close()

  // User 2 opens the listing and sends an enquiry.
  const buyerContext = await browser.newContext()
  const buyerPage = await buyerContext.newPage()
  await login(buyerPage, testUsers.secondary)

  await buyerPage.goto(listingUrl)
  await expect(buyerPage.getByRole('heading', { name: title })).toBeVisible()

  await buyerPage.getByRole('button', { name: 'Send enquiry' }).click()
  await buyerPage.getByPlaceholder(/interested in this listing/).fill('e2e test enquiry — please ignore')
  await buyerPage.getByRole('button', { name: 'Send enquiry' }).click()

  await expect(buyerPage.getByText('Enquiry sent — the seller will get in touch.')).toBeVisible()
  await buyerContext.close()
})
