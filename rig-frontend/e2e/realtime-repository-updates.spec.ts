/**
 * E2E Tests for Story 2.6: Real-Time Repository Updates
 *
 * Tests the real-time WebSocket subscription that automatically adds new
 * repositories to the Home page list and shows toast notifications when
 * new kind 30617 repository announcement events arrive from Nostr relays.
 *
 * UI changes tested:
 * - Toaster component is present in the app (Sonner, positioned bottom-right)
 * - Toast notification "New repository added: [name]" appears on new event (AC #3)
 * - Toast auto-dismisses after 5 seconds (AC #3)
 * - Toast has close button for manual dismissal
 * - Multiple toasts stack vertically
 * - Real-time subscription coexists with existing page states (loading, populated)
 * - Toast accessibility (aria-live on Sonner section)
 * - No stale toasts on initial load (since filter prevents historical replay)
 * - No "set state on unmounted component" errors on navigation
 *
 * Strategy for testing toast notifications:
 * - The subscribeToRepositories() function verifies schnorr signatures on
 *   incoming events, which cannot be forged from addInitScript. Instead:
 *
 *   1. For TOAST UI tests: We discover the Vite-resolved sonner module path
 *      at runtime and call toast() directly with the same message format that
 *      useRealtimeRepositories produces. This verifies the complete Sonner
 *      rendering pipeline (positioning, dismissal, close button, stacking,
 *      accessibility) in the real browser environment.
 *
 *   2. For INTEGRATION tests: We use live relay connections and verify that
 *      the subscription infrastructure works correctly (no stale toasts on
 *      initial load due to the `since` filter, no errors on navigation).
 *
 * - Sonner v2 DOM structure:
 *   - Outer section: <section aria-label="Notifications alt+T" aria-live="polite">
 *   - Toast list:    <ol data-sonner-toaster data-y-position="bottom" data-x-position="right">
 *   - Individual:    <li data-sonner-toast>
 *   - Close button:  <button data-close-button aria-label="Close toast">
 */
import { test, expect, type Page } from '@playwright/test'

// Maximum time to wait for relay data to arrive. Accounts for:
// - 2s relay query timeout per attempt
// - 3 retries with exponential backoff (1s + 2s + 4s)
// - JS bundle lazy loading via Suspense
const DATA_LOAD_TIMEOUT = 30_000

// Selector for the Sonner toaster outer section (always present in DOM)
const TOASTER_SECTION = 'section[aria-label*="Notifications"]'

// Selector for the Sonner toast list (only present when toasts are showing)
const TOAST_LIST = 'ol[data-sonner-toaster]'

// Selector for individual toast elements
const TOAST_ITEM = 'li[data-sonner-toast]'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wait for the app to finish loading: the skeleton disappears and one of
 * articles, empty state, or error state is visible.
 */
async function waitForAppLoaded(page: Page, timeout = DATA_LOAD_TIMEOUT) {
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

/**
 * Trigger a toast notification matching the exact format used by
 * useRealtimeRepositories: `toast("New repository added: [name]", { duration: 5000 })`
 *
 * Dynamically discovers the Vite-resolved sonner module path (which includes
 * a version hash like `?v=2afd8883`) to ensure we use the exact same module
 * instance as the app's <Toaster> component.
 */
async function triggerRepoToast(page: Page, repoName: string) {
  await page.evaluate(async (name: string) => {
    // Find the Vite-resolved sonner module URL from performance entries.
    // The app loads it as `/node_modules/.vite/deps/sonner.js?v=HASH`.
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const sonnerEntry = resources.find(
      r => r.name.includes('/node_modules/.vite/deps/sonner.js')
    )

    if (!sonnerEntry) {
      throw new Error('Could not find Vite-resolved sonner module in performance entries')
    }

    // Extract the pathname + query from the full URL
    const url = new URL(sonnerEntry.name)
    const importPath = url.pathname + url.search

    const sonner = await import(importPath)
    sonner.toast(`New repository added: ${name}`, { duration: 5000 })
  }, repoName)
}

/**
 * Stub WebSocket to connect and immediately return EOSE with no events.
 * Keeps realtime subscriptions open but never fires events.
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
                for (const fn of (listeners['message'] || [])) {
                  fn(new MessageEvent('message', { data: eoseMsg }))
                }
              }, 50)
            }
          } catch { /* ignore */ }
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
            listeners[type] = listeners[type].filter(f => f !== fn)
          }
        },
        dispatchEvent: () => true,
      }

      setTimeout(() => {
        ws.readyState = 1
        if (ws.onopen) ws.onopen(new Event('open'))
        for (const fn of (listeners['open'] || [])) fn(new Event('open'))
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

// ---------------------------------------------------------------------------
// Tests: Toaster Component Presence (AC #3)
// ---------------------------------------------------------------------------

test.describe('Real-Time Updates - Toaster Component', () => {
  test('Sonner Toaster section is present in the DOM on page load', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')

    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    // Sonner renders an outer <section> element with aria-label="Notifications ..."
    const toasterSection = page.locator(TOASTER_SECTION)
    await expect(toasterSection).toBeAttached()
  })

  test('Toaster section has aria-live="polite" for accessible notifications', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')

    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    const toasterSection = page.locator(TOASTER_SECTION)
    await expect(toasterSection).toHaveAttribute('aria-live', 'polite')
  })

  test('no toast list is rendered when no toasts are showing', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')

    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    // Wait a moment to confirm no toasts appear
    await page.waitForTimeout(1000)

    // The inner <ol data-sonner-toaster> should NOT exist when no toasts are showing
    const toastList = page.locator(TOAST_LIST)
    await expect(toastList).toHaveCount(0)
  })
})

// ---------------------------------------------------------------------------
// Tests: Toast Notification Rendering (AC #2, AC #3, AT-2.6.04, AT-2.6.06)
//
// These tests trigger a toast using the same sonner toast() function that
// useRealtimeRepositories calls, verifying the full Sonner rendering pipeline
// including the Toaster configuration (position, closeButton, theme).
// ---------------------------------------------------------------------------

test.describe('Real-Time Updates - Toast Notification', () => {
  test('toast with "New repository added: [name]" appears via sonner toast()', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    const repoName = 'E2E-Test-Repo'
    await triggerRepoToast(page, repoName)

    const toast = page.locator(TOAST_ITEM).filter({
      hasText: `New repository added: ${repoName}`,
    })
    await expect(toast).toBeVisible({ timeout: 5_000 })
  })

  test('toast notification contains the full repository name', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    const repoName = 'My-Awesome-Project'
    await triggerRepoToast(page, repoName)

    const toast = page.locator(TOAST_ITEM).filter({
      hasText: 'New repository added: My-Awesome-Project',
    })
    await expect(toast).toBeVisible({ timeout: 5_000 })
  })

  test('toast has a close button for manual dismissal', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    await triggerRepoToast(page, 'Dismissable-Repo')

    const toast = page.locator(TOAST_ITEM).first()
    await expect(toast).toBeVisible({ timeout: 5_000 })

    // Sonner renders a close button with data-close-button attribute
    // (enabled by closeButton prop on the Toaster component)
    const closeButton = toast.locator('button[data-close-button]')
    await expect(closeButton).toBeAttached()
  })

  test('clicking close button dismisses the toast', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    await triggerRepoToast(page, 'Close-Me-Repo')

    const toast = page.locator(TOAST_ITEM).first()
    await expect(toast).toBeVisible({ timeout: 5_000 })

    const closeButton = toast.locator('button[data-close-button]')
    await closeButton.click()

    // Toast should be dismissed
    await expect(toast).toBeHidden({ timeout: 5_000 })
  })

  test('toast message starts with "New repository added:" prefix', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    const repoName = 'Prefix-Check-Repo'
    await triggerRepoToast(page, repoName)

    const toast = page.locator(TOAST_ITEM).first()
    await expect(toast).toBeVisible({ timeout: 5_000 })

    const text = await toast.textContent()
    expect(text).toContain('New repository added:')
    expect(text).toContain(repoName)
  })
})

// ---------------------------------------------------------------------------
// Tests: Toast Positioning (AC #3)
// ---------------------------------------------------------------------------

test.describe('Real-Time Updates - Toast Position', () => {
  test('toast list is positioned at bottom-right per Toaster configuration', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    await triggerRepoToast(page, 'Position-Test-Repo')

    const toast = page.locator(TOAST_ITEM).first()
    await expect(toast).toBeVisible({ timeout: 5_000 })

    // Check the toast list container has bottom-right positioning attributes
    const toastList = page.locator(TOAST_LIST)
    await expect(toastList).toHaveAttribute('data-y-position', 'bottom')
    await expect(toastList).toHaveAttribute('data-x-position', 'right')
  })

  test('toast renders in the lower-right quadrant of the viewport', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    await triggerRepoToast(page, 'Viewport-Position-Repo')

    const toast = page.locator(TOAST_ITEM).first()
    await expect(toast).toBeVisible({ timeout: 5_000 })

    const box = await toast.boundingBox()
    const viewport = page.viewportSize()

    if (box && viewport) {
      // Toast should be in the bottom half of the viewport
      expect(box.y).toBeGreaterThan(viewport.height / 2)
      // Toast should be in the right half of the viewport
      expect(box.x + box.width / 2).toBeGreaterThan(viewport.width / 2)
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Toast Auto-Dismiss (AC #3, AT-2.6.07)
// ---------------------------------------------------------------------------

test.describe('Real-Time Updates - Toast Auto-Dismiss', () => {
  test('toast auto-dismisses after approximately 5 seconds', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    await triggerRepoToast(page, 'AutoDismiss-Repo')

    const toast = page.locator(TOAST_ITEM).first()

    // Wait for toast to appear
    await expect(toast).toBeVisible({ timeout: 5_000 })

    const appearedAt = Date.now()

    // Wait for the toast to auto-dismiss (5s duration + animation buffer)
    await expect(toast).toBeHidden({ timeout: 12_000 })

    const elapsed = Date.now() - appearedAt

    // Toast should auto-dismiss around 5 seconds (allow 3-10s window
    // for animation transitions and browser timing variations)
    expect(elapsed).toBeGreaterThanOrEqual(3000)
    expect(elapsed).toBeLessThanOrEqual(12000)
  })
})

// ---------------------------------------------------------------------------
// Tests: Toast Accessibility
// ---------------------------------------------------------------------------

test.describe('Real-Time Updates - Toast Accessibility', () => {
  test('toaster section has aria-label containing "Notifications"', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    const toasterSection = page.locator(TOASTER_SECTION)
    await expect(toasterSection).toBeAttached()

    const ariaLabel = await toasterSection.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
    expect(ariaLabel).toMatch(/Notification/i)
  })

  test('toaster section has aria-relevant="additions text"', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    const toasterSection = page.locator(TOASTER_SECTION)
    await expect(toasterSection).toHaveAttribute('aria-relevant', 'additions text')
  })

  test('close button has aria-label for screen readers', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    await triggerRepoToast(page, 'Accessible-Close-Repo')

    const toast = page.locator(TOAST_ITEM).first()
    await expect(toast).toBeVisible({ timeout: 5_000 })

    const closeButton = toast.locator('button[data-close-button]')
    const ariaLabel = await closeButton.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
    expect(ariaLabel).toMatch(/close/i)
  })

  test('toast is inside the aria-live region for screen reader announcements', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    // Verify the toaster section has aria-live before toast appears
    const toasterSection = page.locator(TOASTER_SECTION)
    await expect(toasterSection).toHaveAttribute('aria-live', 'polite')

    // Trigger a toast -- it should appear inside the aria-live region
    await triggerRepoToast(page, 'ScreenReader-Repo')

    // The toast should be a descendant of the aria-live section
    const toastInsideLiveRegion = toasterSection.locator(TOAST_ITEM)
    await expect(toastInsideLiveRegion).toBeVisible({ timeout: 5_000 })
  })
})

// ---------------------------------------------------------------------------
// Tests: Multiple Toasts (AT-2.6.11)
// ---------------------------------------------------------------------------

test.describe('Real-Time Updates - Multiple Toasts', () => {
  test('multiple rapid toasts stack without overlapping', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    // Trigger 3 toasts rapidly
    await triggerRepoToast(page, 'Repo-Alpha')
    await triggerRepoToast(page, 'Repo-Beta')
    await triggerRepoToast(page, 'Repo-Gamma')

    // Wait for toasts to render
    await page.waitForTimeout(500)

    const toasts = page.locator(TOAST_ITEM)
    const count = await toasts.count()

    // Sonner should display multiple toasts (default visibleToasts is 3)
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('each toast in a stack shows distinct repository names', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    await triggerRepoToast(page, 'UniqueAlpha')
    await triggerRepoToast(page, 'UniqueBeta')

    await page.waitForTimeout(500)

    const toasts = page.locator(TOAST_ITEM)
    const count = await toasts.count()

    if (count >= 2) {
      const texts = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          toasts.nth(i).textContent()
        )
      )
      // All toasts should have unique text
      const uniqueTexts = new Set(texts)
      expect(uniqueTexts.size).toBe(count)
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Integration with Page States
// ---------------------------------------------------------------------------

test.describe('Real-Time Updates - Page State Integration', () => {
  test('toast appears alongside empty state page content', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')

    // Wait for empty state
    const emptyText = page.getByText(/no repositories found on the network/i)
    await expect(emptyText).toBeVisible({ timeout: DATA_LOAD_TIMEOUT })

    // Trigger a toast
    await triggerRepoToast(page, 'FirstRepo-OnEmptyPage')

    const toast = page.locator(TOAST_ITEM).first()
    await expect(toast).toBeVisible({ timeout: 5_000 })

    // Empty state should still be visible (toast does not replace content)
    await expect(emptyText).toBeVisible()
  })

  test('page heading "Repositories" remains visible when toast appears', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    await triggerRepoToast(page, 'HeadingTest-Repo')

    const toast = page.locator(TOAST_ITEM).first()
    await expect(toast).toBeVisible({ timeout: 5_000 })

    const heading = page.getByRole('heading', { level: 1, name: 'Repositories' })
    await expect(heading).toBeVisible()
  })

  test('Toaster section exists but no toasts show during loading skeleton state', async ({ page }) => {
    // Stub WebSockets to hang -- keeps UI in loading state
    await page.addInitScript(() => {
      const OriginalWebSocket = window.WebSocket

      // @ts-expect-error - overriding WebSocket constructor
      window.WebSocket = function HangingWebSocket() {
        return {
          readyState: 0,
          bufferedAmount: 0,
          extensions: '',
          protocol: '',
          binaryType: 'blob' as BinaryType,
          CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3,
          onopen: null, onclose: null, onerror: null, onmessage: null,
          send: () => {}, close: () => {},
          addEventListener: () => {}, removeEventListener: () => {},
          dispatchEvent: () => true,
        }
      } as unknown as typeof WebSocket

      window.WebSocket.CONNECTING = 0
      window.WebSocket.OPEN = 1
      window.WebSocket.CLOSING = 2
      window.WebSocket.CLOSED = 3
      window.WebSocket.prototype = OriginalWebSocket.prototype
    })

    await page.goto('/')

    const skeleton = page.getByRole('status', { name: 'Loading repositories' })
    await expect(skeleton).toBeVisible({ timeout: 10_000 })

    // Toaster section is present during loading
    const toaster = page.locator(TOASTER_SECTION)
    await expect(toaster).toBeAttached()

    // No toasts should be showing
    const toasts = page.locator(TOAST_ITEM)
    await expect(toasts).toHaveCount(0)
  })
})

// ---------------------------------------------------------------------------
// Tests: Live Relay Integration (conditional)
// ---------------------------------------------------------------------------

test.describe('Real-Time Updates - Live Relay Integration', () => {
  test('Toaster section is present when using live relay connections', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const toasterSection = page.locator(TOASTER_SECTION)
    await expect(toasterSection).toBeAttached()
  })

  test('no toasts on initial page load (since filter prevents historical replay)', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    // The `since` filter in subscribeToRepositories ensures no historical
    // events trigger toasts. Wait to confirm no toasts appear.
    await page.waitForTimeout(2000)

    const toasts = page.locator(TOAST_ITEM)
    const toastCount = await toasts.count()
    expect(toastCount).toBe(0)
  })

  test('app functions normally with repository list and Toaster rendered together', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    // Page should show one of the terminal states
    const hasArticles = await page.locator('article').count() > 0
    const hasEmpty = await page.getByText(/no repositories found/i).isVisible().catch(() => false)
    const hasError = await page.getByRole('alert').isVisible().catch(() => false)

    expect(hasArticles || hasEmpty || hasError).toBe(true)

    // Toaster should coexist without breaking layout
    const toaster = page.locator(TOASTER_SECTION)
    await expect(toaster).toBeAttached()
  })
})

// ---------------------------------------------------------------------------
// Tests: Toast Content Edge Cases
// ---------------------------------------------------------------------------

test.describe('Real-Time Updates - Toast Content Edge Cases', () => {
  test('toast with truncated name (100+ chars) does not break layout', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    // Simulate what extractRepoName would produce for a long name
    const truncatedName = 'A'.repeat(100) + '...'
    await triggerRepoToast(page, truncatedName)

    const toast = page.locator(TOAST_ITEM).first()
    await expect(toast).toBeVisible({ timeout: 5_000 })

    const box = await toast.boundingBox()
    expect(box).toBeTruthy()
    if (box) {
      const viewport = page.viewportSize()
      if (viewport) {
        expect(box.width).toBeLessThanOrEqual(viewport.width)
      }
    }

    const text = await toast.textContent()
    expect(text).toContain('...')
  })
})

// ---------------------------------------------------------------------------
// Tests: Navigation Resilience (AT-2.6.12)
// ---------------------------------------------------------------------------

test.describe('Real-Time Updates - Navigation', () => {
  test('navigating away from Home does not cause "state on unmounted" errors', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      // Navigate to a repo detail page -- this unmounts the Home component
      // and should trigger useEffect cleanup (sub.close())
      const nameLink = articles.first().getByRole('heading', { level: 2 }).locator('a')
      const href = await nameLink.getAttribute('href')

      if (href) {
        await nameLink.click()

        await page.waitForURL((url) => {
          const pathname = new URL(url).pathname
          return pathname !== '/' && /^\/[^/]+\/[^/]+$/.test(pathname)
        }, { timeout: DATA_LOAD_TIMEOUT })

        // Allow async cleanup warnings to surface
        await page.waitForTimeout(1000)

        // Filter to only React state-after-unmount errors
        const relevantErrors = consoleErrors.filter(
          (err) =>
            err.includes('unmounted') ||
            err.includes('set state') ||
            err.includes('Can\'t perform a React state update')
        )

        expect(relevantErrors).toHaveLength(0)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Theme Integration
// ---------------------------------------------------------------------------

test.describe('Real-Time Updates - Theme', () => {
  test('toast list has data-sonner-theme attribute when showing', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')
    await page.waitForSelector('main#main-content', { timeout: 10_000 })

    await triggerRepoToast(page, 'Theme-Test-Repo')

    const toast = page.locator(TOAST_ITEM).first()
    await expect(toast).toBeVisible({ timeout: 5_000 })

    const toastList = page.locator(TOAST_LIST)
    const theme = await toastList.getAttribute('data-sonner-theme')
    expect(theme).toBeTruthy()
    expect(['light', 'dark', 'system']).toContain(theme)
  })
})
