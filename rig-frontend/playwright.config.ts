/**
 * Playwright E2E Test Configuration
 *
 * Runs tests against the Vite dev server for the rig-frontend application.
 * Uses Chromium only for faster local development cycles.
 *
 * Usage:
 *   npx playwright test             # Run all E2E tests
 *   npx playwright test --ui        # Run with Playwright UI mode
 *   npx playwright test --headed    # Run with visible browser
 */
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  /* Per-test timeout: generous for tests that wait for TanStack Query retries */
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  /* Visual regression testing configuration */
  expect: {
    toHaveScreenshot: {
      /* Maximum pixel ratio difference allowed (0.1 = 10%) */
      maxDiffPixelRatio: 0.01,
      /* Threshold for individual pixel color difference (0-1) */
      threshold: 0.2,
      /* Use consistent screenshot options */
      animations: 'disabled',
      /* Compare against screenshots in the same platform folder */
      stylePath: undefined,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
