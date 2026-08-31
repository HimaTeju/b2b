import { test, expect } from '@playwright/test'
import { login, testUsers, hasUser } from './helpers/auth.js'
import { testTitle } from './helpers/testData.js'

test.describe('Registration', () => {
  test('creating an account with mismatched passwords is rejected client-side', async ({ page }) => {
    await page.goto('/#/register')
    await page.getByLabel('Full name').fill(testTitle('user'))
    await page.getByLabel('Email').fill('mismatch@example.com')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByLabel('Confirm password').fill('different123')
    await page.getByRole('button', { name: /Create account/ }).click()

    await expect(page.getByText('Passwords do not match')).toBeVisible()
    await expect(page).toHaveURL(/\/#\/register$/)
  })

  test('the register page links back to login', async ({ page }) => {
    await page.goto('/#/register')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/#\/login$/)
  })
})

test.describe('Login', () => {
  test('an unauthenticated visitor is redirected to login', async ({ page }) => {
    await page.goto('/#/')
    await expect(page).toHaveURL(/\/#\/login$/)
  })

  test('invalid credentials show an error and keep the user on the login page', async ({ page }) => {
    await page.goto('/#/login')
    await page.getByLabel('Email').fill('nonexistent-e2e-user@example.com')
    await page.getByLabel('Password', { exact: true }).fill('wrong-password')
    await page.getByRole('button', { name: /Sign in/ }).click()

    await expect(page.getByRole('button', { name: /Sign in/ })).toBeEnabled()
    await expect(page).toHaveURL(/\/#\/login$/)
  })

  test('a pre-confirmed test user can log in and reach the home page', async ({ page }) => {
    test.skip(!hasUser(testUsers.primary), 'E2E_USER1_EMAIL / E2E_USER1_PASSWORD not set')

    await login(page, testUsers.primary)
    await expect(page).toHaveURL(/\/#\/$/)
  })
})
