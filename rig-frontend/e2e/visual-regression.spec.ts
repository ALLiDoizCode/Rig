/**
 * Visual Regression Tests
 *
 * Uses Playwright's built-in screenshot comparison to catch unintended visual changes.
 * Baseline screenshots are stored in e2e/__screenshots__/ and compared on each run.
 *
 * Strategy:
 * - Test key pages in multiple states (loading, populated, empty, error)
 * - Test across viewport sizes (mobile, tablet, desktop)
 * - Test interactive states (focus, hover) where critical
 * - Use full-page screenshots for layout verification
 * - Use component screenshots for isolated widget testing
 *
 * Usage:
 *   npx playwright test visual-regression.spec.ts           # Run tests
 *   npx playwright test visual-regression.spec.ts --update-snapshots  # Update baselines
 *
 * Note: Visual tests are marked with .skip by default to avoid flakiness in CI.
 * Remove .skip to enable them locally or in controlled CI environments.
 */
import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Stub WebSocket to hang (never open, never error). Keeps the UI in loading state.
 */
async function stubWebSocketsToHang(page: Page) {
  await page.addInitScript(() => {
    const OriginalWebSocket = window.WebSocket

    // @ts-expect-error - overriding WebSocket constructor
    window.WebSocket = function HangingWebSocket() {
      return {
        readyState: 0, // CONNECTING (never transitions)
        bufferedAmount: 0,
        extensions: '',
        protocol: '',
        binaryType: 'blob' as BinaryType,
        CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3,
        onopen: null, onclose: null, onerror: null, onmessage: null,
        send: () => {},
        close: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }
    } as unknown as typeof WebSocket

    window.WebSocket.CONNECTING = 0
    window.WebSocket.OPEN = 1
    window.WebSocket.CLOSING = 2
    window.WebSocket.CLOSED = 3
    window.WebSocket.prototype = OriginalWebSocket.prototype
  })
}

/**
 * Stub WebSocket to connect and immediately close with no messages (empty state).
 */
async function stubWebSocketsToReturnEmpty(page: Page) {
  await page.addInitScript(() => {
    const OriginalWebSocket = window.WebSocket

    // @ts-expect-error - overriding WebSocket constructor
    window.WebSocket = function EmptyWebSocket() {
      const listeners: Record<string, Array<(...args: unknown[]) => void>> = {}

      const ws = {
        readyState: 0,
        bufferedAmount: 0,
        extensions: '',
        protocol: '',
        binaryType: 'blob' as BinaryType,
        CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3,
        onopen: null as ((ev: Event) => void) | null,
        onclose: null as ((ev: CloseEvent) => void) | null,
        onerror: null as ((ev: Event) => void) | null,
        onmessage: null as ((ev: MessageEvent) => void) | null,
        send: (data: string) => {
          try {
            const parsed = JSON.parse(data)
            if (Array.isArray(parsed) && parsed[0] === 'REQ') {
              const subId = parsed[1]
              setTimeout(() => {
                const eoseMsg = JSON.stringify(['EOSE', subId])
                if (ws.onmessage) {
                  ws.onmessage(new MessageEvent('message', { data: eoseMsg }))
                }
                for (const fn of listeners['message'] || []) {
                  fn(new MessageEvent('message', { data: eoseMsg }))
                }
              }, 50)
            }
          } catch {
            /* ignore */
          }
        },
        close: () => {
          ws.readyState = 3
          if (ws.onclose) ws.onclose(new CloseEvent('close', { code: 1000 }))
        },
        addEventListener: (type: string, fn: (...args: unknown[]) => void) => {
          if (!listeners[type]) listeners[type] = []
          listeners[type].push(fn)
        },
        removeEventListener: (type: string, fn: (...args: unknown[]) => void) => {
          if (listeners[type]) {
            listeners[type] = listeners[type].filter((f) => f !== fn)
          }
        },
        dispatchEvent: () => true,
      }

      setTimeout(() => {
        ws.readyState = 1
        if (ws.onopen) ws.onopen(new Event('open'))
        for (const fn of listeners['open'] || []) fn(new Event('open'))
      }, 20)

      return ws
    } as unknown as typeof WebSocket

    window.WebSocket.CONNECTING = 0
    window.WebSocket.OPEN = 1
    window.WebSocket.CLOSING = 2
    window.WebSocket.CLOSED = 3
    window.WebSocket.prototype = OriginalWebSocket.prototype
  })
}

/**
 * Inject error state by manipulating the DOM.
 */
async function injectErrorState(page: Page) {
  await page.goto('/')

  await page.waitForFunction(
    () => {
      const hasLoading = !!document.querySelector('[role="status"][aria-label="Loading repositories"]')
      const hasContent =
        document.querySelectorAll('article').length > 0 ||
        !!document.body.textContent?.match(/no repositories found/i) ||
        !!document.querySelector('[role="alert"]')
      return hasLoading || hasContent
    },
    undefined,
    { timeout: 10_000 }
  )

  await page.evaluate(() => {
    const section = document.querySelector('main#main-content > section')
    if (!section) return

    const heading = section.querySelector('h1')?.parentElement
    const children = Array.from(section.children)
    for (const child of children) {
      if (child !== heading) {
        child.remove()
      }
    }

    const errorDiv = document.createElement('div')
    errorDiv.setAttribute('role', 'alert')
    errorDiv.className = 'flex flex-col items-center justify-center py-16 space-y-4'
    errorDiv.innerHTML = `
      <div class="rounded-full bg-destructive/10 p-3">
        <svg class="size-6 text-destructive" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div class="text-center space-y-1">
        <p class="font-medium">Unable to connect to Nostr relays. Please try again.</p>
        <p class="text-sm text-muted-foreground">Check your connection and try again.</p>
      </div>
      <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" data-testid="retry-button">
        <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
        Try Again
      </button>
    `
    section.appendChild(errorDiv)

    const skeleton = document.querySelector('[role="status"][aria-label="Loading repositories"]')
    if (skeleton) skeleton.remove()
  })
}

/**
 * Wait for app to finish loading.
 */
async function waitForAppLoaded(page: Page, timeout = 30_000) {
  await page.waitForFunction(
    () => {
      const hasArticles = document.querySelectorAll('article').length > 0
      const hasEmpty = !!document.body.textContent?.match(/no repositories found/i)
      const hasError = !!document.querySelector('[role="alert"]')
      const hasLoading = !!document.querySelector('[role="status"][aria-label="Loading repositories"]')
      return (hasArticles || hasEmpty || hasError) && !hasLoading
    },
    undefined,
    { timeout }
  )
}

// ---------------------------------------------------------------------------
// Visual Regression Tests: Home Page States
// ---------------------------------------------------------------------------

test.describe('Visual Regression: Home Page', () => {
  test('home page - loading state (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await stubWebSocketsToHang(page)
    await page.goto('/')

    const skeleton = page.getByRole('status', { name: 'Loading repositories' })
    await expect(skeleton).toBeVisible({ timeout: 10_000 })

    // Take full-page screenshot
    await expect(page).toHaveScreenshot('home-loading-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('home page - empty state (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')

    const emptyText = page.getByText(/no repositories found/i)
    await expect(emptyText).toBeVisible({ timeout: 10_000 })

    await expect(page).toHaveScreenshot('home-empty-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('home page - error state (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await injectErrorState(page)

    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()

    await expect(page).toHaveScreenshot('home-error-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('home page - populated state (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await waitForAppLoaded(page)

    const hasArticles = (await page.locator('article').count()) > 0
    if (hasArticles) {
      await expect(page).toHaveScreenshot('home-populated-desktop.png', {
        fullPage: true,
        animations: 'disabled',
        // Mask dynamic content (dates, real-time data)
        mask: [page.locator('.font-mono')], // Mask pubkeys (dynamic)
      })
    } else {
      test.skip()
    }
  })
})

// ---------------------------------------------------------------------------
// Visual Regression Tests: Responsive Layouts
// ---------------------------------------------------------------------------

test.describe('Visual Regression: Responsive Layouts', () => {
  test('home page - loading state (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await stubWebSocketsToHang(page)
    await page.goto('/')

    const skeleton = page.getByRole('status', { name: 'Loading repositories' })
    await expect(skeleton).toBeVisible({ timeout: 10_000 })

    await expect(page).toHaveScreenshot('home-loading-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('home page - loading state (tablet)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await stubWebSocketsToHang(page)
    await page.goto('/')

    const skeleton = page.getByRole('status', { name: 'Loading repositories' })
    await expect(skeleton).toBeVisible({ timeout: 10_000 })

    await expect(page).toHaveScreenshot('home-loading-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('home page - empty state (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')

    const emptyText = page.getByText(/no repositories found/i)
    await expect(emptyText).toBeVisible({ timeout: 10_000 })

    await expect(page).toHaveScreenshot('home-empty-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})

// ---------------------------------------------------------------------------
// Visual Regression Tests: Component Isolation
// ---------------------------------------------------------------------------

test.describe('Visual Regression: Component Isolation', () => {
  test('repository card - loading skeleton', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await stubWebSocketsToHang(page)
    await page.goto('/')

    const skeleton = page.getByRole('status', { name: 'Loading repositories' })
    await expect(skeleton).toBeVisible({ timeout: 10_000 })

    const firstCard = skeleton.locator('.grid > div').first()
    await expect(firstCard).toHaveScreenshot('repo-card-skeleton.png', {
      animations: 'disabled',
    })
  })

  test('repository card - populated', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const hasArticles = (await articles.count()) > 0

    if (hasArticles) {
      const firstCard = articles.first()
      await expect(firstCard).toHaveScreenshot('repo-card-populated.png', {
        animations: 'disabled',
        mask: [firstCard.locator('.font-mono')], // Mask dynamic pubkey
      })
    } else {
      test.skip()
    }
  })

  test('header component - desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await stubWebSocketsToHang(page)
    await page.goto('/')

    const header = page.locator('header')
    await expect(header).toBeVisible({ timeout: 10_000 })

    await expect(header).toHaveScreenshot('header-desktop.png', {
      animations: 'disabled',
    })
  })

  test('footer component - desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await stubWebSocketsToHang(page)
    await page.goto('/')

    const footer = page.locator('footer')
    await expect(footer).toBeVisible({ timeout: 10_000 })

    await expect(footer).toHaveScreenshot('footer-desktop.png', {
      animations: 'disabled',
    })
  })
})

// ---------------------------------------------------------------------------
// Visual Regression Tests: Interactive States
// ---------------------------------------------------------------------------

test.describe('Visual Regression: Interactive States', () => {
  test('repository card - hover state', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const hasArticles = (await articles.count()) > 0

    if (hasArticles) {
      const firstCard = articles.first()
      await firstCard.hover()

      // Wait for hover transition to complete
      await page.waitForTimeout(300)

      await expect(firstCard).toHaveScreenshot('repo-card-hover.png', {
        animations: 'disabled',
        mask: [firstCard.locator('.font-mono')],
      })
    } else {
      test.skip()
    }
  })

  test('retry button - focus state', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await injectErrorState(page)

    const retryButton = page.getByRole('button', { name: /try again/i })
    await expect(retryButton).toBeVisible()

    await retryButton.focus()

    await expect(retryButton).toHaveScreenshot('retry-button-focus.png', {
      animations: 'disabled',
    })
  })
})

// ---------------------------------------------------------------------------
// Visual Regression Tests: Theme Consistency
// ---------------------------------------------------------------------------

test.describe('Visual Regression: Theme Consistency', () => {
  test('color palette - primary components', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await stubWebSocketsToHang(page)
    await page.goto('/')

    const skeleton = page.getByRole('status', { name: 'Loading repositories' })
    await expect(skeleton).toBeVisible({ timeout: 10_000 })

    // Take screenshot of the main content area to verify color consistency
    const mainContent = page.locator('main#main-content')
    await expect(mainContent).toHaveScreenshot('theme-primary-components.png', {
      animations: 'disabled',
    })
  })

  test('spacing and typography - page layout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')

    const emptyText = page.getByText(/no repositories found/i)
    await expect(emptyText).toBeVisible({ timeout: 10_000 })

    await expect(page).toHaveScreenshot('theme-spacing-typography.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})
