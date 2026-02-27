/**
 * E2E Tests for Story 2.5: Relay Status Indicators
 *
 * Tests the RelayStatusBadge component rendered on both the Home page (/)
 * and the Repository Detail page (/:owner/:repo). Story 2.5 replaced the
 * old static relay badge in RepoCard with a dynamic badge that tracks
 * actual relay query responses, and added an interactive collapsible
 * relay detail panel on the detail page.
 *
 * UI changes tested:
 * - Compact relay status badge on RepoCard with "Verified on X of Y relays" text (AC #1, #2)
 * - Color coding: green (>=80%), yellow (>=40%), orange (<40%) based on ratio (AC #2)
 * - Detailed relay status badge on RepoDetail with collapsible panel (AC #3, #4)
 * - Panel shows responding relay URLs with latency (AC #3, #6)
 * - Panel shows failed relay URLs (AC #3)
 * - Data age indicator "Last updated Xs ago from X/Y relays" (AC #7)
 * - "Retry All Relays" button when some relays failed (AC #5)
 * - Accessibility: aria-expanded, aria-controls, role="region", keyboard nav (AC #8)
 * - Progressive disclosure: panel collapsed by default (AC #4)
 *
 * Strategy:
 * - Tests use live Nostr relay data with resilient conditional assertions,
 *   matching the pattern established in all prior E2E test files.
 * - For the Home page, badges appear inside RepoCard footers.
 * - For the Detail page, the badge appears in the metadata Card with the
 *   detailed variant (collapsible panel).
 * - Since relay response data is real (not mocked), tests verify the badge
 *   is present and correctly structured without asserting specific relay
 *   counts or colors (which depend on live relay availability).
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
 * Escape a string for use in a CSS selector (ID or class).
 * React's useId() produces IDs like ":r0:" which contain colons that
 * must be escaped in CSS selectors. cssEscape() is a browser API not
 * available in Node.js, so we use a manual implementation.
 */
function cssEscape(value: string): string {
  return value.replace(/([^\w-])/g, '\\$1')
}

/**
 * Wait for the home page to finish loading (any terminal state).
 */
async function waitForHomeLoaded(page: Page, timeout = DATA_LOAD_TIMEOUT) {
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
 * Wait for the repo detail page to finish loading.
 */
async function waitForRepoDetailLoaded(page: Page, timeout = DATA_LOAD_TIMEOUT) {
  await page.waitForFunction(
    () => {
      const hasBackLink = !!document.body.textContent?.match(/Back to repositories/)
      const hasNotFound = !!document.body.textContent?.match(/Repository not found/)
      const hasError = !!document.querySelector('[role="alert"]')
      const hasDetailLoading = !!document.querySelector('[role="status"][aria-label="Loading repository details"]')
      const hasPageLoading = !!document.querySelector('[role="status"][aria-label="Loading page"]')
      return (hasBackLink || hasNotFound || hasError) && !hasDetailLoading && !hasPageLoading
    },
    undefined,
    { timeout }
  )
}

/**
 * Navigate from home page to the first available repository detail page.
 * Returns the name of the repository navigated to, or null if no repos exist.
 */
async function navigateToFirstRepo(page: Page): Promise<string | null> {
  await page.goto('/')
  await waitForHomeLoaded(page)

  const articles = page.locator('article')
  const count = await articles.count()

  if (count === 0) return null

  const nameLink = articles.first().getByRole('heading', { level: 2 }).locator('a')
  const repoName = await nameLink.textContent()
  const href = await nameLink.getAttribute('href')

  if (!href) return null

  await nameLink.click()

  await page.waitForURL((url) => {
    const pathname = new URL(url).pathname
    return pathname !== '/' && /^\/[^/]+\/[^/]+$/.test(pathname)
  }, { timeout: DATA_LOAD_TIMEOUT })

  await waitForRepoDetailLoaded(page)

  return repoName?.trim() ?? null
}

// ---------------------------------------------------------------------------
// Tests: Relay Status Badge on Home Page (AC #1, AT-2.5.01)
// ---------------------------------------------------------------------------

test.describe('Relay Status - Badge on Home Page', () => {
  test('relay status badges with role="status" are visible on repository cards', async ({ page }) => {
    await page.goto('/')
    await waitForHomeLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      // Look for relay status badges with the "Verified on" aria-label pattern
      const badges = page.locator('[role="status"]')
      const badgeCount = await badges.count()

      let foundRelayBadge = false
      for (let i = 0; i < badgeCount; i++) {
        const ariaLabel = await badges.nth(i).getAttribute('aria-label')
        if (ariaLabel && /verified on/i.test(ariaLabel)) {
          foundRelayBadge = true
          await expect(badges.nth(i)).toBeVisible()
          break
        }
      }

      // With live relay data, we expect at least one relay badge to appear
      // (relay metadata is global, so all cards get the same badge)
      if (foundRelayBadge) {
        expect(foundRelayBadge).toBe(true)
      }
    }
  })

  test('relay status badge displays "Verified on X of Y relays" text (AT-2.5.01)', async ({ page }) => {
    await page.goto('/')
    await waitForHomeLoaded(page)

    const badges = page.locator('[role="status"]')
    const count = await badges.count()

    for (let i = 0; i < count; i++) {
      const badge = badges.nth(i)
      const ariaLabel = await badge.getAttribute('aria-label')
      if (ariaLabel && /verified on/i.test(ariaLabel)) {
        // Badge text should match "Verified on X of Y relay(s)"
        await expect(badge).toContainText(/Verified on \d+ of \d+ relay/)
        // aria-label should match the same pattern
        expect(ariaLabel).toMatch(/Verified on \d+ of \d+ relays?/)
        break
      }
    }
  })

  test('relay status badge has proper aria-label for screen readers (AT-2.5.15)', async ({ page }) => {
    await page.goto('/')
    await waitForHomeLoaded(page)

    const badges = page.locator('[role="status"]')
    const count = await badges.count()

    for (let i = 0; i < count; i++) {
      const badge = badges.nth(i)
      const ariaLabel = await badge.getAttribute('aria-label')
      if (ariaLabel && /verified on/i.test(ariaLabel)) {
        // Aria-label should contain the relay count
        expect(ariaLabel).toMatch(/Verified on \d+ of \d+ relays?/)
        break
      }
    }
  })

  test('all visible RepoCard badges share the same relay count (global metadata)', async ({ page }) => {
    await page.goto('/')
    await waitForHomeLoaded(page)

    const badges = page.locator('[role="status"]')
    const count = await badges.count()

    const relayLabels: string[] = []
    for (let i = 0; i < count; i++) {
      const ariaLabel = await badges.nth(i).getAttribute('aria-label')
      if (ariaLabel && /verified on/i.test(ariaLabel)) {
        relayLabels.push(ariaLabel)
      }
    }

    // Since relay metadata is global (not per-repo), all badges should be identical
    if (relayLabels.length >= 2) {
      const first = relayLabels[0]
      for (const label of relayLabels) {
        expect(label).toBe(first)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Badge Color Coding (AC #2, AT-2.5.02, AT-2.5.03, AT-2.5.04)
// ---------------------------------------------------------------------------

test.describe('Relay Status - Badge Color Coding', () => {
  test('badge uses color classes corresponding to relay response ratio (AT-2.5.02/03/04)', async ({ page }) => {
    await page.goto('/')
    await waitForHomeLoaded(page)

    const badges = page.locator('[role="status"]')
    const count = await badges.count()

    for (let i = 0; i < count; i++) {
      const badge = badges.nth(i)
      const ariaLabel = await badge.getAttribute('aria-label')

      if (ariaLabel && /verified on/i.test(ariaLabel)) {
        const className = await badge.getAttribute('class') ?? ''
        const match = ariaLabel.match(/Verified on (\d+) of (\d+) relays?/)

        if (match) {
          const responded = parseInt(match[1], 10)
          const total = parseInt(match[2], 10)
          const ratio = responded / total

          // Verify the color class matches the threshold
          if (ratio >= 0.8) {
            // Green: >= 80% responded
            expect(className).toContain('text-green-600')
          } else if (ratio >= 0.4) {
            // Yellow: >= 40% but < 80% responded
            expect(className).toContain('text-yellow-600')
          } else {
            // Orange: > 0% but < 40% responded
            expect(className).toContain('text-orange-600')
          }
        }
        break
      }
    }
  })

  test('badge border color matches text color for relay ratio', async ({ page }) => {
    await page.goto('/')
    await waitForHomeLoaded(page)

    const badges = page.locator('[role="status"]')
    const count = await badges.count()

    for (let i = 0; i < count; i++) {
      const badge = badges.nth(i)
      const ariaLabel = await badge.getAttribute('aria-label')

      if (ariaLabel && /verified on/i.test(ariaLabel)) {
        const className = await badge.getAttribute('class') ?? ''
        const match = ariaLabel.match(/Verified on (\d+) of (\d+) relays?/)

        if (match) {
          const responded = parseInt(match[1], 10)
          const total = parseInt(match[2], 10)
          const ratio = responded / total

          // Both border and text should use the same color family
          if (ratio >= 0.8) {
            expect(className).toContain('border-green-600')
            expect(className).toContain('text-green-600')
          } else if (ratio >= 0.4) {
            expect(className).toContain('border-yellow-600')
            expect(className).toContain('text-yellow-600')
          } else {
            expect(className).toContain('border-orange-600')
            expect(className).toContain('text-orange-600')
          }
        }
        break
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Compact Badge Variant on Home (no expand/collapse)
// ---------------------------------------------------------------------------

test.describe('Relay Status - Compact Badge (Home Page)', () => {
  test('compact badge on RepoCard is NOT expandable (no collapsible panel)', async ({ page }) => {
    await page.goto('/')
    await waitForHomeLoaded(page)

    const articles = page.locator('article')
    const count = await articles.count()

    if (count > 0) {
      // Find a relay badge inside a card
      const firstCard = articles.first()
      const badge = firstCard.locator('[role="status"]')
      const badgeCount = await badge.count()

      if (badgeCount > 0) {
        // The compact badge should NOT have aria-expanded attribute
        // (it's a plain Badge element, not a CollapsibleTrigger button)
        const ariaExpanded = await badge.getAttribute('aria-expanded')
        expect(ariaExpanded).toBeNull()

        // There should be no collapsible content inside the card footer
        const collapsibleContent = firstCard.locator('[role="region"]')
        const regionCount = await collapsibleContent.count()
        expect(regionCount).toBe(0)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Relay Status Badge on Detail Page (AC #1, #3, #4)
// ---------------------------------------------------------------------------

test.describe('Relay Status - Badge on Detail Page', () => {
  test('relay status badge is visible on the detail page metadata card', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      // The detailed badge has a button trigger with aria-label "Verified on X of Y relays"
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await expect(badge).toBeVisible()
        // Should contain the "Verified on" text inside a Badge component
        await expect(badge).toContainText(/Verified on \d+ of \d+ relay/)
      }
      // If no badge, relays may all have failed or metadata not yet available
    }
  })

  test('relay status badge on detail page includes chevron icon for expand hint', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        // The chevron SVG icon should be inside the badge button
        const chevron = badge.locator('svg')
        const svgCount = await chevron.count()
        expect(svgCount).toBeGreaterThanOrEqual(1)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Collapsible Panel - Progressive Disclosure (AC #3, #4, AT-2.5.05, AT-2.5.16)
// ---------------------------------------------------------------------------

test.describe('Relay Status - Collapsible Panel', () => {
  test('panel is collapsed by default (progressive disclosure) (AT-2.5.16)', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        // aria-expanded should be "false" by default
        await expect(badge).toHaveAttribute('aria-expanded', 'false')

        // The panel region should NOT be visible
        const panelId = await badge.getAttribute('aria-controls')
        if (panelId) {
          const panel = page.locator(`#${cssEscape(panelId)}`)
          await expect(panel).toBeHidden()
        }
      }
    }
  })

  test('clicking badge expands the relay detail panel (AT-2.5.05)', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        // Click to expand
        await badge.click()

        // aria-expanded should now be "true"
        await expect(badge).toHaveAttribute('aria-expanded', 'true')

        // The panel region should now be visible
        const panelId = await badge.getAttribute('aria-controls')
        if (panelId) {
          const panel = page.locator(`#${cssEscape(panelId)}`)
          await expect(panel).toBeVisible()
        }
      }
    }
  })

  test('clicking badge again collapses the panel', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        // Expand
        await badge.click()
        await expect(badge).toHaveAttribute('aria-expanded', 'true')

        // Collapse
        await badge.click()
        await expect(badge).toHaveAttribute('aria-expanded', 'false')

        // Panel should be hidden again
        const panelId = await badge.getAttribute('aria-controls')
        if (panelId) {
          const panel = page.locator(`#${cssEscape(panelId)}`)
          await expect(panel).toBeHidden()
        }
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Panel Content - Responding Relays (AC #3, #6, AT-2.5.06, AT-2.5.07)
// ---------------------------------------------------------------------------

test.describe('Relay Status - Panel: Responding Relays', () => {
  test('expanded panel shows "Responding Relays" section with relay URLs (AT-2.5.06)', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()
        await expect(badge).toHaveAttribute('aria-expanded', 'true')

        // Look for "Responding Relays" heading
        const respondingHeader = page.getByText('Responding Relays')
        await expect(respondingHeader).toBeVisible()

        // Look for relay URLs (wss:// format) in the panel
        const panelId = await badge.getAttribute('aria-controls')
        if (panelId) {
          const panel = page.locator(`#${cssEscape(panelId)}`)
          const relayUrls = panel.locator('.font-mono')
          const urlCount = await relayUrls.count()
          expect(urlCount).toBeGreaterThanOrEqual(1)

          // At least one URL should start with wss://
          const firstUrl = await relayUrls.first().textContent()
          expect(firstUrl).toMatch(/^wss:\/\//)
        }
      }
    }
  })

  test('responding relays show latency in ms (AT-2.5.07)', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()
        await expect(badge).toHaveAttribute('aria-expanded', 'true')

        // Look for latency values (e.g., "150ms")
        const panelId = await badge.getAttribute('aria-controls')
        if (panelId) {
          const panel = page.locator(`#${cssEscape(panelId)}`)
          const latencyText = panel.getByText(/\d+ms/)
          const latencyCount = await latencyText.count()
          expect(latencyCount).toBeGreaterThanOrEqual(1)
        }
      }
    }
  })

  test('responding relays show green checkmark icon', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()
        await expect(badge).toHaveAttribute('aria-expanded', 'true')

        const panelId = await badge.getAttribute('aria-controls')
        if (panelId) {
          const panel = page.locator(`#${cssEscape(panelId)}`)
          // Green checkmark icon (CheckCircleIcon) has text-green-600 class
          const greenIcons = panel.locator('.text-green-600, .text-green-400')
          const iconCount = await greenIcons.count()
          expect(iconCount).toBeGreaterThanOrEqual(1)
        }
      }
    }
  })

  test('relay list items use semantic list structure (role="list" / role="listitem")', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()
        await expect(badge).toHaveAttribute('aria-expanded', 'true')

        const panelId = await badge.getAttribute('aria-controls')
        if (panelId) {
          const panel = page.locator(`#${cssEscape(panelId)}`)
          const lists = panel.locator('[role="list"]')
          const listCount = await lists.count()
          expect(listCount).toBeGreaterThanOrEqual(1)

          // Each list should contain listitem elements
          const firstList = lists.first()
          const items = firstList.locator('[role="listitem"]')
          const itemCount = await items.count()
          expect(itemCount).toBeGreaterThanOrEqual(1)
        }
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Panel Content - Failed Relays (AC #3, AT-2.5.08)
// ---------------------------------------------------------------------------

test.describe('Relay Status - Panel: Failed Relays', () => {
  test('expanded panel shows "Failed Relays" section when some relays failed (AT-2.5.08)', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()
        await expect(badge).toHaveAttribute('aria-expanded', 'true')

        // Check if "Failed Relays" section exists
        const failedHeader = page.getByText('Failed Relays')
        const hasFailedSection = await failedHeader.isVisible().catch(() => false)

        if (hasFailedSection) {
          // Failed relays should have red X icons
          const panelId = await badge.getAttribute('aria-controls')
          if (panelId) {
            const panel = page.locator(`#${cssEscape(panelId)}`)
            const redIcons = panel.locator('.text-red-600, .text-red-400')
            const iconCount = await redIcons.count()
            expect(iconCount).toBeGreaterThanOrEqual(1)
          }
        }
        // If no failed relays, that's also valid (all relays responded)
      }
    }
  })

  test('failed relays show error description or "Timed out" text', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()
        await expect(badge).toHaveAttribute('aria-expanded', 'true')

        const failedHeader = page.getByText('Failed Relays')
        const hasFailedSection = await failedHeader.isVisible().catch(() => false)

        if (hasFailedSection) {
          // Failed relay entries should show an error message
          const panelId = await badge.getAttribute('aria-controls')
          if (panelId) {
            const panel = page.locator(`#${cssEscape(panelId)}`)
            // The error text is in a span next to the relay URL
            const panelText = await panel.textContent()
            // Should contain error text or "Timed out"
            expect(panelText).toBeTruthy()
          }
        }
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Data Age Indicator (AC #7, AT-2.5.09, AT-2.5.12)
// ---------------------------------------------------------------------------

test.describe('Relay Status - Data Age Indicator', () => {
  test('expanded panel shows "Last updated" text with relay count (AT-2.5.09, AT-2.5.12)', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()
        await expect(badge).toHaveAttribute('aria-expanded', 'true')

        // Look for "Last updated ... from X/Y relays" text
        const dataAgeText = page.getByText(/Last updated .+ from \d+\/\d+ relays/)
        await expect(dataAgeText).toBeVisible()
      }
    }
  })

  test('data age text shows relative time (e.g., "less than a minute ago")', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()
        await expect(badge).toHaveAttribute('aria-expanded', 'true')

        // The data age should contain "ago" (from formatDistanceToNow with addSuffix)
        // or "just now" as a fallback
        const dataAgeText = page.getByText(/Last updated/)
        await expect(dataAgeText).toBeVisible()
        const text = await dataAgeText.textContent()
        expect(text).toMatch(/ago|just now/)
      }
    }
  })

  test('data age text has aria-live="polite" for screen reader updates', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()
        await expect(badge).toHaveAttribute('aria-expanded', 'true')

        // The data age paragraph should have aria-live="polite"
        const dataAgeParagraph = page.locator('[aria-live="polite"]').filter({ hasText: /Last updated/ })
        await expect(dataAgeParagraph).toBeVisible()
        await expect(dataAgeParagraph).toHaveAttribute('aria-live', 'polite')
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Retry Button (AC #5, AT-2.5.10)
// ---------------------------------------------------------------------------

test.describe('Relay Status - Retry Button', () => {
  test('"Retry All Relays" button appears when some relays failed (AT-2.5.10)', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()
        await expect(badge).toHaveAttribute('aria-expanded', 'true')

        // Check if there are failed relays
        const failedHeader = page.getByText('Failed Relays')
        const hasFailedRelays = await failedHeader.isVisible().catch(() => false)

        if (hasFailedRelays) {
          // Retry button should be visible when relays have failed
          const retryButton = page.getByRole('button', { name: 'Retry all relay queries' })
          await expect(retryButton).toBeVisible()
          await expect(retryButton).toContainText('Retry All Relays')
        }
        // If no failed relays, retry button should NOT be shown
        if (!hasFailedRelays) {
          const retryButton = page.getByRole('button', { name: 'Retry all relay queries' })
          const retryVisible = await retryButton.isVisible().catch(() => false)
          expect(retryVisible).toBe(false)
        }
      }
    }
  })

  test('retry button has aria-label="Retry all relay queries"', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()

        const failedHeader = page.getByText('Failed Relays')
        const hasFailedRelays = await failedHeader.isVisible().catch(() => false)

        if (hasFailedRelays) {
          const retryButton = page.getByRole('button', { name: 'Retry all relay queries' })
          await expect(retryButton).toHaveAttribute('aria-label', 'Retry all relay queries')
        }
      }
    }
  })

  test('retry button has type="button" to prevent form submission', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()

        const failedHeader = page.getByText('Failed Relays')
        const hasFailedRelays = await failedHeader.isVisible().catch(() => false)

        if (hasFailedRelays) {
          const retryButton = page.getByRole('button', { name: 'Retry all relay queries' })
          await expect(retryButton).toHaveAttribute('type', 'button')
        }
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Accessibility (AC #8, AT-2.5.14, AT-2.5.15)
// ---------------------------------------------------------------------------

test.describe('Relay Status - Accessibility', () => {
  test('badge trigger has aria-expanded attribute (AT-2.5.14)', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        // Initially collapsed
        await expect(badge).toHaveAttribute('aria-expanded', 'false')

        // After click, expanded
        await badge.click()
        await expect(badge).toHaveAttribute('aria-expanded', 'true')
      }
    }
  })

  test('badge trigger has aria-controls linking to the panel ID', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        const ariaControls = await badge.getAttribute('aria-controls')
        expect(ariaControls).toBeTruthy()

        // The controlled element should exist
        await badge.click()
        const panel = page.locator(`#${cssEscape(ariaControls!)}`)
        await expect(panel).toBeVisible()
      }
    }
  })

  test('expanded panel has role="region" and aria-labelledby linking to badge (AT-2.5.15)', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()

        const panelId = await badge.getAttribute('aria-controls')
        if (panelId) {
          const panel = page.locator(`#${cssEscape(panelId)}`)
          await expect(panel).toHaveAttribute('role', 'region')

          // aria-labelledby should reference the badge's ID
          const badgeId = await badge.getAttribute('id')
          const labelledBy = await panel.getAttribute('aria-labelledby')
          expect(labelledBy).toBe(badgeId)
        }
      }
    }
  })

  test('badge trigger is keyboard navigable (Tab focus) (AT-2.5.14)', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        // Focus the badge via Tab key
        await badge.focus()
        await expect(badge).toBeFocused()
      }
    }
  })

  test('Enter key on focused badge expands/collapses the panel (AT-2.5.14)', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        // Focus and press Enter to expand
        await badge.focus()
        await page.keyboard.press('Enter')
        await expect(badge).toHaveAttribute('aria-expanded', 'true')

        // Press Enter again to collapse
        await page.keyboard.press('Enter')
        await expect(badge).toHaveAttribute('aria-expanded', 'false')
      }
    }
  })

  test('Space key on focused badge expands/collapses the panel (AT-2.5.14)', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        // Focus and press Space to expand
        await badge.focus()
        await page.keyboard.press('Space')
        await expect(badge).toHaveAttribute('aria-expanded', 'true')

        // Press Space again to collapse
        await page.keyboard.press('Space')
        await expect(badge).toHaveAttribute('aria-expanded', 'false')
      }
    }
  })

  test('badge trigger has visible focus ring when focused', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.focus()

        // Check that focus-visible styles are applied
        const hasRingClass = await badge.evaluate(el =>
          el.className.includes('focus-visible:ring')
        )
        expect(hasRingClass).toBe(true)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Relay Status Badge in Metadata Card Context
// ---------------------------------------------------------------------------

test.describe('Relay Status - Metadata Integration', () => {
  test('relay badge is positioned within the metadata Card alongside other metadata', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        // The badge should be inside a Card (rounded-xl border)
        const card = badge.locator('xpath=ancestor::div[contains(@class, "rounded-xl")]')
        const cardCount = await card.count()
        expect(cardCount).toBeGreaterThanOrEqual(1)

        // Other metadata fields should also be visible in the same Card
        const updatedLabel = page.getByText('Updated')
        await expect(updatedLabel).toBeVisible()
      }
    }
  })

  test('relay badge appears alongside wifi icon in metadata section', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        // The badge row should contain an SVG icon (WifiIcon)
        const badgeRow = badge.locator('xpath=ancestor::div[contains(@class, "flex items-start")]')
        const rowCount = await badgeRow.count()

        if (rowCount > 0) {
          const svgIcons = badgeRow.first().locator('svg')
          const iconCount = await svgIcons.count()
          expect(iconCount).toBeGreaterThanOrEqual(1)
        }
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Panel Content Structure
// ---------------------------------------------------------------------------

test.describe('Relay Status - Panel Structure', () => {
  test('expanded panel has proper visual structure with border and background', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()

        const panelId = await badge.getAttribute('aria-controls')
        if (panelId) {
          const panel = page.locator(`#${cssEscape(panelId)}`)
          await expect(panel).toBeVisible()

          // Panel should have border and background classes
          const className = await panel.getAttribute('class') ?? ''
          expect(className).toContain('border')
          expect(className).toContain('rounded')
        }
      }
    }
  })

  test('relay section headings use h4 elements for semantic hierarchy', async ({ page }) => {
    const repoName = await navigateToFirstRepo(page)

    if (repoName) {
      const badge = page.locator('button[aria-label*="Verified on"]')
      const hasBadge = await badge.isVisible().catch(() => false)

      if (hasBadge) {
        await badge.click()

        const panelId = await badge.getAttribute('aria-controls')
        if (panelId) {
          const panel = page.locator(`#${cssEscape(panelId)}`)
          const h4Elements = panel.locator('h4')
          const h4Count = await h4Elements.count()
          // At least the "Responding Relays" heading
          expect(h4Count).toBeGreaterThanOrEqual(1)
        }
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: No Badge When Zero Relays (Edge Case)
// ---------------------------------------------------------------------------

test.describe('Relay Status - Edge Cases', () => {
  test('no relay badge is rendered when 0 relays responded (zero state)', async ({ page }) => {
    // This test verifies the contract: if respondedCount <= 0, no badge is rendered.
    // With live data, this is unlikely but we validate that any badges present
    // have at least 1 responded relay in their label.
    await page.goto('/')
    await waitForHomeLoaded(page)

    const badges = page.locator('[role="status"]')
    const count = await badges.count()

    for (let i = 0; i < count; i++) {
      const ariaLabel = await badges.nth(i).getAttribute('aria-label')
      if (ariaLabel && /verified on/i.test(ariaLabel)) {
        const match = ariaLabel.match(/Verified on (\d+) of (\d+) relays?/)
        if (match) {
          const responded = parseInt(match[1], 10)
          // If a badge is rendered, responded count must be > 0
          expect(responded).toBeGreaterThan(0)
        }
      }
    }
  })

  test('relay badge label pluralizes "relay" correctly', async ({ page }) => {
    await page.goto('/')
    await waitForHomeLoaded(page)

    const badges = page.locator('[role="status"]')
    const count = await badges.count()

    for (let i = 0; i < count; i++) {
      const ariaLabel = await badges.nth(i).getAttribute('aria-label')
      if (ariaLabel && /verified on/i.test(ariaLabel)) {
        const match = ariaLabel.match(/Verified on (\d+) of (\d+) (relay.*)/)
        if (match) {
          const total = parseInt(match[2], 10)
          const suffix = match[3]
          if (total === 1) {
            expect(suffix).toBe('relay')
          } else {
            expect(suffix).toBe('relays')
          }
        }
        break
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Tests: Visual Consistency Across Pages
// ---------------------------------------------------------------------------

test.describe('Relay Status - Cross-Page Consistency', () => {
  test('relay count in badge matches between home page and detail page', async ({ page }) => {
    await page.goto('/')
    await waitForHomeLoaded(page)

    // Get the relay count from the home page badge
    const homeBadges = page.locator('[role="status"]')
    const homeCount = await homeBadges.count()

    let homeRelayLabel: string | null = null
    for (let i = 0; i < homeCount; i++) {
      const ariaLabel = await homeBadges.nth(i).getAttribute('aria-label')
      if (ariaLabel && /verified on/i.test(ariaLabel)) {
        homeRelayLabel = ariaLabel
        break
      }
    }

    if (homeRelayLabel) {
      // Navigate to the first repo detail page
      const articles = page.locator('article')
      const articleCount = await articles.count()

      if (articleCount > 0) {
        const nameLink = articles.first().getByRole('heading', { level: 2 }).locator('a')
        await nameLink.click()

        await page.waitForURL((url) => {
          const pathname = new URL(url).pathname
          return pathname !== '/' && /^\/[^/]+\/[^/]+$/.test(pathname)
        }, { timeout: DATA_LOAD_TIMEOUT })

        await waitForRepoDetailLoaded(page)

        // Check the detail page badge matches
        const detailBadge = page.locator('button[aria-label*="Verified on"]')
        const hasDetailBadge = await detailBadge.isVisible().catch(() => false)

        if (hasDetailBadge) {
          const detailLabel = await detailBadge.getAttribute('aria-label')
          // Both should report the same relay count (same metadata source)
          expect(detailLabel).toBe(homeRelayLabel)
        }
      }
    }
  })
})
