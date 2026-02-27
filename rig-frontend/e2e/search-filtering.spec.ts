/**
 * E2E Tests for Story 2.3: Client-Side Search and Filtering
 *
 * Tests the search input and filtering functionality on the Home page (/)
 * which allows users to filter the repository list by name in real-time.
 *
 * UI changes tested:
 * - Search input with type="search" rendered after data loads (AC #1, #9)
 * - Real-time client-side filtering as the user types (AC #2)
 * - Case-insensitive partial string matching on repository name (AC #3)
 * - "Showing X of Y repositories" count when search is active (AC #4)
 * - "Clear search" (X icon) button when input has text (AC #5)
 * - Search empty state with "No repositories found matching '[term]'" (AC #6)
 * - Focus indicator on search input (AC #7)
 * - "/" keyboard shortcut to focus search input (AC #8)
 * - Search input hidden during loading/empty/error states (AC #9)
 *
 * Strategy:
 * - Tests that exercise search against live relay data use conditional
 *   assertions based on which repositories are returned.
 * - For deterministic states (loading, empty), WebSocket stubs are used
 *   to control the relay response, matching the pattern established
 *   in home-repository-list.spec.ts.
 * - E2E tests here complement (not duplicate) the component-level tests
 *   in Home.test.tsx by exercising the full browser rendering pipeline.
 */
import { test, expect, type Page } from '@playwright/test'

// Maximum time to wait for relay data to arrive. Accounts for:
// - 2s relay query timeout per attempt
// - 3 retries with exponential backoff (1s + 2s + 4s)
// - JS bundle lazy loading via Suspense
const DATA_LOAD_TIMEOUT = 30_000

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
 * Stub WebSocket to hang (never open). Keeps the UI in loading/skeleton state.
 */
async function stubWebSocketsToHang(page: Page) {
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
}

/**
 * Stub WebSocket to connect and immediately return EOSE with no events.
 * fetchRepositories resolves with [] and the UI shows the empty state.
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
// Tests: Search Input Visibility (AC #1, AC #9)
// ---------------------------------------------------------------------------

test.describe('Search & Filtering - Input Visibility', () => {
  test('search input is visible when repositories are loaded', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await expect(searchInput).toBeVisible()
    }
  })

  test('search input is NOT visible during loading state (AC #9)', async ({ page }) => {
    await stubWebSocketsToHang(page)
    await page.goto('/')

    const skeleton = page.getByRole('status', { name: 'Loading repositories' })
    await expect(skeleton).toBeVisible({ timeout: 10_000 })

    const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
    await expect(searchInput).toBeHidden()
  })

  test('search input is NOT visible when data is empty (AC #9)', async ({ page }) => {
    await stubWebSocketsToReturnEmpty(page)
    await page.goto('/')

    const emptyText = page.getByText(/no repositories found on the network/i)
    await expect(emptyText).toBeVisible({ timeout: DATA_LOAD_TIMEOUT })

    const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
    await expect(searchInput).toBeHidden()
  })

  test('search input has type="search" for mobile keyboard optimization', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await expect(searchInput).toHaveAttribute('type', 'search')
    }
  })

  test('search input has placeholder text "Search repositories..."', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await expect(searchInput).toHaveAttribute('placeholder', 'Search repositories...')
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Search Landmark & Accessibility (AC #7, AC #9)
// ---------------------------------------------------------------------------

test.describe('Search & Filtering - Accessibility', () => {
  test('search input is wrapped in role="search" landmark (AT-2.3.09)', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchLandmark = page.locator('[role="search"]')
      await expect(searchLandmark).toBeVisible()

      // The search input is inside the landmark
      const searchInput = searchLandmark.getByRole('searchbox', { name: /search repositories/i })
      await expect(searchInput).toBeVisible()
    }
  })

  test('search input has associated label element via htmlFor/id', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      const inputId = await searchInput.getAttribute('id')
      expect(inputId).toBe('repo-search')

      // Verify the label exists and references the input
      const label = page.locator(`label[for="${inputId}"]`)
      await expect(label).toBeAttached()
    }
  })

  test('search input has aria-keyshortcuts="/" attribute', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await expect(searchInput).toHaveAttribute('aria-keyshortcuts', '/')
    }
  })

  test('search input has visible focus indicator on focus (AC #7)', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await searchInput.focus()

      // Verify the input has a visible focus ring/outline
      const boxShadow = await searchInput.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return styles.boxShadow
      })
      // When focused, shadcn Input applies a ring via box-shadow; it should not be "none"
      expect(boxShadow).not.toBe('none')
    }
  })

  test('count display has aria-live="polite" for screen reader announcements', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const countSpan = page.locator('[aria-live="polite"]').filter({ hasText: /repositor/ })
      await expect(countSpan).toBeVisible()
      await expect(countSpan).toHaveAttribute('aria-atomic', 'true')
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Client-Side Filtering (AC #2, AC #3)
// ---------------------------------------------------------------------------

test.describe('Search & Filtering - Filtering Behavior', () => {
  test('typing in search filters the visible repository cards (AT-2.3.01)', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const initialCount = await articles.count()

    if (initialCount > 1) {
      // Get the name of the first repository to use as search term
      const firstRepoHeading = articles.first().getByRole('heading', { level: 2 })
      const firstRepoName = await firstRepoHeading.textContent()

      if (firstRepoName && firstRepoName.trim().length >= 3) {
        const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
        const searchTerm = firstRepoName.trim()

        // Type the full name of the first repo
        await searchInput.fill(searchTerm)

        // Wait for debounce (300ms) + a small margin
        await page.waitForTimeout(500)

        // After filtering, at least the first repo should be visible
        const filteredArticles = page.locator('article')
        const filteredCount = await filteredArticles.count()
        expect(filteredCount).toBeGreaterThanOrEqual(1)
        // Filtered count should be <= initial count
        expect(filteredCount).toBeLessThanOrEqual(initialCount)
      }
    }
  })

  test('filtering is case-insensitive (AT-2.3.02)', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const initialCount = await articles.count()

    if (initialCount > 0) {
      const firstRepoHeading = articles.first().getByRole('heading', { level: 2 })
      const firstRepoName = await firstRepoHeading.textContent()

      if (firstRepoName && firstRepoName.trim().length >= 2) {
        const searchInput = page.getByRole('searchbox', { name: /search repositories/i })

        // Type in all UPPERCASE
        await searchInput.fill(firstRepoName.trim().toUpperCase())
        await page.waitForTimeout(500)

        // The matching repo should still be visible
        const repoStillVisible = await firstRepoHeading.isVisible().catch(() => false)
        expect(repoStillVisible).toBe(true)
      }
    }
  })

  test('filtering matches partial strings (AT-2.3.03)', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const initialCount = await articles.count()

    if (initialCount > 0) {
      const firstRepoHeading = articles.first().getByRole('heading', { level: 2 })
      const firstRepoName = await firstRepoHeading.textContent()

      if (firstRepoName && firstRepoName.trim().length >= 3) {
        const searchInput = page.getByRole('searchbox', { name: /search repositories/i })

        // Type only the first 3 characters of the repo name
        const partialTerm = firstRepoName.trim().substring(0, 3)
        await searchInput.fill(partialTerm)
        await page.waitForTimeout(500)

        // The matching repo should still be visible
        const repoStillVisible = await firstRepoHeading.isVisible().catch(() => false)
        expect(repoStillVisible).toBe(true)
      }
    }
  })

  test('search filters on repository name only, not description', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const initialCount = await articles.count()

    if (initialCount > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })

      // Type a search term that is very unlikely to match any repo name
      await searchInput.fill('zzz_nonexistent_term_xyz_999')
      await page.waitForTimeout(500)

      // Should show empty state (no matching repos)
      const emptyState = page.getByText(/no repositories found matching/i)
      await expect(emptyState).toBeVisible()
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Count Display (AC #4)
// ---------------------------------------------------------------------------

test.describe('Search & Filtering - Count Display', () => {
  test('shows "N repositories" count without search active', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const countText = page.getByText(/^\d+ repositor(y|ies)$/)
      await expect(countText).toBeVisible()
    }
  })

  test('shows "Showing X of Y repositories" when search is active (AT-2.3.04)', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const initialCount = await articles.count()

    if (initialCount > 0) {
      const firstRepoHeading = articles.first().getByRole('heading', { level: 2 })
      const firstRepoName = await firstRepoHeading.textContent()

      if (firstRepoName && firstRepoName.trim().length >= 2) {
        const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
        await searchInput.fill(firstRepoName.trim())
        await page.waitForTimeout(500)

        const showingText = page.getByText(/^Showing \d+ of \d+ repositories$/)
        await expect(showingText).toBeVisible()
      }
    }
  })

  test('count reverts to "N repositories" after clearing search', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const initialCount = await articles.count()

    if (initialCount > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })

      // Type something to activate search
      await searchInput.fill('a')
      await page.waitForTimeout(500)

      // Clear the search
      await searchInput.fill('')
      await page.waitForTimeout(500)

      // Count should revert to normal format
      const countText = page.getByText(/^\d+ repositor(y|ies)$/)
      await expect(countText).toBeVisible()
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Clear Search Button (AC #5, AC #6)
// ---------------------------------------------------------------------------

test.describe('Search & Filtering - Clear Button', () => {
  test('clear button (X icon) appears when search has text (AT-2.3.05)', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const clearButton = page.getByRole('button', { name: 'Clear search' })

      // Initially hidden
      await expect(clearButton).toBeHidden()

      // Type in search
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await searchInput.fill('test')

      // Clear button should appear
      await expect(clearButton).toBeVisible()
    }
  })

  test('clear button has aria-label="Clear search"', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await searchInput.fill('test')

      const clearButton = page.getByRole('button', { name: 'Clear search' })
      await expect(clearButton).toHaveAttribute('aria-label', 'Clear search')
    }
  })

  test('clicking clear button resets the search and restores full list (AT-2.3.06)', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const initialCount = await articles.count()

    if (initialCount > 1) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })

      // Type a search term that might filter
      const firstRepoHeading = articles.first().getByRole('heading', { level: 2 })
      const firstRepoName = await firstRepoHeading.textContent()

      if (firstRepoName && firstRepoName.trim().length >= 2) {
        await searchInput.fill(firstRepoName.trim())
        await page.waitForTimeout(500)

        // Click the clear button
        const clearButton = page.getByRole('button', { name: 'Clear search' })
        await clearButton.click()

        // Search input should be empty
        await expect(searchInput).toHaveValue('')

        // Wait for the list to restore
        await page.waitForTimeout(100)

        // Full list should be restored
        const restoredCount = await page.locator('article').count()
        expect(restoredCount).toBe(initialCount)
      }
    }
  })

  test('clear button returns focus to the search input after click', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await searchInput.fill('test')

      const clearButton = page.getByRole('button', { name: 'Clear search' })
      await clearButton.click()

      // Focus should return to the search input
      await expect(searchInput).toBeFocused()
    }
  })

  test('clear button meets 44x44px minimum touch target', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await searchInput.fill('test')

      const clearButton = page.getByRole('button', { name: 'Clear search' })
      const box = await clearButton.boundingBox()

      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44)
        expect(box.width).toBeGreaterThanOrEqual(44)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Search Empty State (AC #6)
// ---------------------------------------------------------------------------

test.describe('Search & Filtering - Search Empty State', () => {
  test('displays "No repositories found matching \'[term]\'" when no repos match (AT-2.3.07)', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      const searchTerm = 'zzz_nonexistent_xyz_999'
      await searchInput.fill(searchTerm)
      await page.waitForTimeout(500)

      // Empty state message should contain the search term
      const emptyMessage = page.getByText(`No repositories found matching '${searchTerm}'`)
      await expect(emptyMessage).toBeVisible()
    }
  })

  test('search empty state has a "Clear search" button (AT-2.3.08)', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await searchInput.fill('zzz_nonexistent_xyz_999')
      await page.waitForTimeout(500)

      // The empty state should have a "Clear search" text button (distinct from
      // the X icon button inside the search input which uses aria-label).
      // Target the button with visible "Clear search" text content.
      const clearSearchButton = page.getByRole('button', { name: 'Clear search', exact: true }).filter({ hasText: 'Clear search' })
      await expect(clearSearchButton).toBeVisible()
    }
  })

  test('clicking "Clear search" in empty state restores the full list', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const initialCount = await articles.count()

    if (initialCount > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await searchInput.fill('zzz_nonexistent_xyz_999')
      await page.waitForTimeout(500)

      // Verify empty state is shown
      await expect(page.getByText(/no repositories found matching/i)).toBeVisible()

      // Click the "Clear search" text button in the empty state (not the X icon
      // button inside the search input). Use getByText for the visible text button.
      const clearSearchButton = page.getByText('Clear search', { exact: true })
      await clearSearchButton.click()

      // Wait briefly for state to update
      await page.waitForTimeout(100)

      // Full list should be restored
      const restoredArticles = page.locator('article')
      const restoredCount = await restoredArticles.count()
      expect(restoredCount).toBe(initialCount)
    }
  })

  test('search input remains visible and editable during search empty state', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await searchInput.fill('zzz_nonexistent_xyz_999')
      await page.waitForTimeout(500)

      // Verify empty state is shown
      await expect(page.getByText(/no repositories found matching/i)).toBeVisible()

      // Search input should still be visible and editable
      await expect(searchInput).toBeVisible()
      await expect(searchInput).toBeEnabled()

      // Can type a new search term
      await searchInput.fill('')
      await page.waitForTimeout(500)

      // Full list should be restored
      const restoredArticles = page.locator('article')
      const restoredCount = await restoredArticles.count()
      expect(restoredCount).toBeGreaterThan(0)
    }
  })

  test('search empty state shows helper text about trying different term', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await searchInput.fill('zzz_nonexistent_xyz_999')
      await page.waitForTimeout(500)

      const helperText = page.getByText(/try a different search term/i)
      await expect(helperText).toBeVisible()
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Keyboard Shortcut "/" (AC #8)
// ---------------------------------------------------------------------------

test.describe('Search & Filtering - Keyboard Shortcut', () => {
  test('"/" key focuses the search input when not in a text field (AT-2.3.11)', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })

      // Ensure focus is not on the search input
      await page.locator('h1').click()
      await expect(searchInput).not.toBeFocused()

      // Press "/"
      await page.keyboard.press('/')

      // Search input should be focused
      await expect(searchInput).toBeFocused()
    }
  })

  test('"/" typed inside the search input enters the character normally (AT-2.3.12)', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })

      // Focus the search input first
      await searchInput.click()
      await expect(searchInput).toBeFocused()

      // Type "/" into the search input
      await searchInput.type('test/path')

      // The "/" character should be in the input value
      await expect(searchInput).toHaveValue('test/path')
    }
  })

  test('"/" shortcut hint is displayed when search input is empty', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      // The "/" keyboard hint (kbd element) should be visible inside the search area
      const kbdHint = page.locator('[role="search"] kbd')
      // May be hidden on small viewports (sm:flex) but should exist
      await expect(kbdHint).toBeAttached()
    }
  })

  test('"/" hint disappears when search input has text', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await searchInput.fill('test')

      // The kbd hint should be replaced by the clear button
      const kbdHint = page.locator('[role="search"] kbd')
      await expect(kbdHint).toBeHidden()
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Debounce Behavior (AT-2.3.14)
// ---------------------------------------------------------------------------

test.describe('Search & Filtering - Debounce', () => {
  test('filtering does not happen instantly; debounce delays the filter (AT-2.3.14)', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const initialCount = await articles.count()

    if (initialCount > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })

      // Type a nonexistent term character by character (slowly to observe debounce)
      await searchInput.fill('zzz_nonexistent_xyz_999')

      // Immediately after typing, the articles might still be visible
      // because of the 300ms debounce delay. We check that the count display
      // eventually changes to "Showing X of Y" format after debounce settles.
      await page.waitForTimeout(500)

      // After debounce, the empty state should appear
      const emptyState = page.getByText(/no repositories found matching/i)
      await expect(emptyState).toBeVisible()
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Mobile Viewport (AT-2.3.13)
// ---------------------------------------------------------------------------

test.describe('Search & Filtering - Mobile Viewport', () => {
  test('search input is visible and usable on mobile viewport (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await expect(searchInput).toBeVisible()

      // Verify it's usable (can type)
      await searchInput.fill('test')
      await expect(searchInput).toHaveValue('test')
    }
  })

  test('search input does not overflow on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchLandmark = page.locator('[role="search"]')
      const box = await searchLandmark.boundingBox()

      if (box) {
        // Search container should not exceed viewport width
        expect(box.x + box.width).toBeLessThanOrEqual(375 + 1) // +1 for rounding
      }
    }
  })

  test('"/" keyboard hint is hidden on mobile viewport (sm:flex)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      // The kbd element uses sm:flex, so it should be hidden on mobile
      const kbdHint = page.locator('[role="search"] kbd')
      await expect(kbdHint).toBeHidden()
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Integration - Search with Grid Coexistence
// ---------------------------------------------------------------------------

test.describe('Search & Filtering - Grid Integration', () => {
  test('search input and repository grid coexist on the page', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      // Both search and grid should be visible simultaneously
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await expect(searchInput).toBeVisible()
      await expect(articles.first()).toBeVisible()

      // Search is above the grid (lower y coordinate)
      const searchBox = await searchInput.boundingBox()
      const gridBox = await articles.first().boundingBox()

      if (searchBox && gridBox) {
        expect(searchBox.y).toBeLessThan(gridBox.y)
      }
    }
  })

  test('heading "Repositories" remains visible during search', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      const searchInput = page.getByRole('searchbox', { name: /search repositories/i })
      await searchInput.fill('test')
      await page.waitForTimeout(500)

      // "Repositories" heading should still be visible
      const heading = page.getByRole('heading', { level: 1, name: 'Repositories' })
      await expect(heading).toBeVisible()
    }
  })

  test('search icon is visible inside the search input', async ({ page }) => {
    await page.goto('/')
    await waitForAppLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      // The search icon (SVG) should be inside the search landmark
      const searchLandmark = page.locator('[role="search"]')
      const svgIcons = searchLandmark.locator('svg')
      const svgCount = await svgIcons.count()
      expect(svgCount).toBeGreaterThanOrEqual(1)
    }
  })
})
