import { test, expect } from '@playwright/test'

test.describe('PWA', () => {
  test('registers a service worker on first load', async ({ page }) => {
    await page.goto('/')

    const hasActiveWorker = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready
      return Boolean(registration.active)
    })

    expect(hasActiveWorker).toBe(true)
  })

  test('serves a web app manifest linked with the /b2b/ base path', async ({ page }) => {
    await page.goto('/')

    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href')
    expect(manifestHref).toBe('/b2b/manifest.webmanifest')

    const response = await page.request.get(new URL(manifestHref, page.url()).toString())
    expect(response.ok()).toBe(true)

    const manifest = await response.json()
    expect(manifest.name).toBeTruthy()
    expect(manifest.icons.length).toBeGreaterThan(0)
  })

  test('renders the cached app shell when offline after the first visit', async ({ page, context }) => {
    await page.goto('/')
    await page.evaluate(() => navigator.serviceWorker.ready)
    // Let the service worker finish precaching the app shell assets.
    await page.waitForTimeout(1000)

    await context.setOffline(true)
    await page.reload()

    await expect(page.locator('#root')).not.toBeEmpty()

    await context.setOffline(false)
  })

  test('registers the service worker without console or page errors', async ({ page }) => {
    const errors = []
    page.on('pageerror', (err) => errors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/')
    await page.evaluate(() => navigator.serviceWorker.ready)

    expect(errors).toEqual([])
  })
})
