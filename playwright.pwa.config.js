import { defineConfig, devices } from '@playwright/test'

// Separate from playwright.config.js because PWA/service-worker behavior only
// activates in a production build+preview, not `vite dev`.
export default defineConfig({
  testDir: './e2e-pwa',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173/b2b/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 390, height: 844 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173/b2b/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
