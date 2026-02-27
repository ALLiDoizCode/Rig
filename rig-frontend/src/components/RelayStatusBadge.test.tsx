/**
 * Tests for RelayStatusBadge component
 *
 * Story 2.5: Relay Status Indicators
 *
 * Test coverage:
 * - Badge display with correct text ("Verified on X of Y relays")
 * - Color coding for all threshold boundaries
 * - Panel expand/collapse behavior
 * - Relay detail display (responding, failed, latencies)
 * - Retry functionality
 * - Data age indicator display
 * - Accessibility (keyboard navigation, screen reader attributes)
 * - Progressive disclosure (collapsed by default)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createRelayResult,
  createRelayQueryMeta,
} from '@/test-utils/factories/relay-status'
import { RelayStatusBadge } from './RelayStatusBadge'
import { getRelayBadgeVariant } from '@/lib/relay-badge-variant'
import type { RelayQueryMeta } from '@/types/relay-status'

describe('getRelayBadgeVariant', () => {
  // AT-2.5.02: Green for >= 80%
  it('should return green for >= 80% relays responded (4 of 5)', () => {
    const result = getRelayBadgeVariant(4, 5)
    expect(result.className).toContain('border-green-600')
    expect(result.className).toContain('text-green-600')
    expect(result.label).toBe('Verified on 4 of 5 relays')
  })

  it('should return green for 5 of 5 relays (100%)', () => {
    const result = getRelayBadgeVariant(5, 5)
    expect(result.className).toContain('border-green-600')
    expect(result.label).toBe('Verified on 5 of 5 relays')
  })

  // AT-2.5.03: Yellow for >= 40% but < 80%
  it('should return yellow for >= 40% but < 80% relays responded (2 of 5)', () => {
    const result = getRelayBadgeVariant(2, 5)
    expect(result.className).toContain('border-yellow-600')
    expect(result.className).toContain('text-yellow-600')
    expect(result.label).toBe('Verified on 2 of 5 relays')
  })

  it('should return yellow for 3 of 5 relays (60%)', () => {
    const result = getRelayBadgeVariant(3, 5)
    expect(result.className).toContain('border-yellow-600')
    expect(result.label).toBe('Verified on 3 of 5 relays')
  })

  // AT-2.5.04: Orange for > 0% but < 40%
  it('should return orange for < 40% relays responded (1 of 5)', () => {
    const result = getRelayBadgeVariant(1, 5)
    expect(result.className).toContain('border-orange-600')
    expect(result.className).toContain('text-orange-600')
    expect(result.label).toBe('Verified on 1 of 5 relays')
  })

  it('should return empty for 0 responded relays', () => {
    const result = getRelayBadgeVariant(0, 5)
    expect(result.className).toBe('')
    expect(result.label).toBe('')
  })

  it('should return empty for 0 total relays', () => {
    const result = getRelayBadgeVariant(0, 0)
    expect(result.className).toBe('')
    expect(result.label).toBe('')
  })

  // Boundary: exactly 80%
  it('should return green for exactly 80% (4 of 5)', () => {
    const result = getRelayBadgeVariant(4, 5)
    expect(result.className).toContain('border-green-600')
  })

  // Boundary: exactly 40%
  it('should return yellow for exactly 40% (2 of 5)', () => {
    const result = getRelayBadgeVariant(2, 5)
    expect(result.className).toContain('border-yellow-600')
  })

  // Singular relay text
  it('should use singular "relay" for 1 total relay', () => {
    const result = getRelayBadgeVariant(1, 1)
    expect(result.label).toBe('Verified on 1 of 1 relay')
  })

  // Plural relay text
  it('should use plural "relays" for multiple total relays', () => {
    const result = getRelayBadgeVariant(3, 5)
    expect(result.label).toBe('Verified on 3 of 5 relays')
  })

  // NFR: Ratio-based thresholds work with non-standard relay counts (not hardcoded to 5)
  describe('NFR: Non-standard relay configurations', () => {
    it('should apply ratio thresholds correctly for 10 relays (green: 8 of 10)', () => {
      const result = getRelayBadgeVariant(8, 10)
      expect(result.className).toContain('border-green-600')
      expect(result.label).toBe('Verified on 8 of 10 relays')
    })

    it('should apply ratio thresholds correctly for 10 relays (yellow: 5 of 10)', () => {
      const result = getRelayBadgeVariant(5, 10)
      expect(result.className).toContain('border-yellow-600')
      expect(result.label).toBe('Verified on 5 of 10 relays')
    })

    it('should apply ratio thresholds correctly for 10 relays (orange: 3 of 10)', () => {
      const result = getRelayBadgeVariant(3, 10)
      expect(result.className).toContain('border-orange-600')
      expect(result.label).toBe('Verified on 3 of 10 relays')
    })

    it('should handle large relay count (12 of 15 = 80%)', () => {
      const result = getRelayBadgeVariant(12, 15)
      expect(result.className).toContain('border-green-600')
    })

    it('should handle 2 relay configuration (2 of 2 = 100%)', () => {
      const result = getRelayBadgeVariant(2, 2)
      expect(result.className).toContain('border-green-600')
      expect(result.label).toBe('Verified on 2 of 2 relays')
    })

    it('should handle 2 relay configuration (1 of 2 = 50% = yellow)', () => {
      const result = getRelayBadgeVariant(1, 2)
      expect(result.className).toContain('border-yellow-600')
    })
  })

  // NFR: Edge cases and defensive boundaries
  describe('NFR: Edge case boundaries', () => {
    it('should return empty for negative responded count', () => {
      const result = getRelayBadgeVariant(-1, 5)
      expect(result.className).toBe('')
      expect(result.label).toBe('')
    })

    it('should return empty for negative total count', () => {
      const result = getRelayBadgeVariant(3, -1)
      expect(result.className).toBe('')
      expect(result.label).toBe('')
    })

    it('should handle responded > total gracefully (100% ratio)', () => {
      // This should not happen in practice but should not crash
      const result = getRelayBadgeVariant(6, 5)
      expect(result.className).toContain('border-green-600')
      expect(result.label).toBe('Verified on 6 of 5 relays')
    })

    // NFR: Dark mode classes are always included
    it('should include dark mode Tailwind classes in all color variants', () => {
      const green = getRelayBadgeVariant(5, 5)
      expect(green.className).toContain('dark:border-green-400')
      expect(green.className).toContain('dark:text-green-400')

      const yellow = getRelayBadgeVariant(2, 5)
      expect(yellow.className).toContain('dark:border-yellow-400')
      expect(yellow.className).toContain('dark:text-yellow-400')

      const orange = getRelayBadgeVariant(1, 5)
      expect(orange.className).toContain('dark:border-orange-400')
      expect(orange.className).toContain('dark:text-orange-400')
    })
  })
})

describe('RelayStatusBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Compact Variant', () => {
    // AT-2.5.01: Displays "Verified on X of Y relays" badge
    it('should display badge with correct text', () => {
      const meta = createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://r1' }),
          createRelayResult({ url: 'wss://r2' }),
          createRelayResult({ url: 'wss://r3', status: 'failed', eventCount: 0 }),
        ],
        respondedCount: 2,
        totalCount: 3,
      })

      render(<RelayStatusBadge meta={meta} variant="compact" />)

      expect(screen.getByText('Verified on 2 of 3 relays')).toBeInTheDocument()
    })

    // AT-2.5.02: Green badge for high confidence
    it('should display green badge for >= 80% relays', () => {
      const meta = createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://r1' }),
          createRelayResult({ url: 'wss://r2' }),
          createRelayResult({ url: 'wss://r3' }),
          createRelayResult({ url: 'wss://r4' }),
          createRelayResult({ url: 'wss://r5' }),
        ],
        respondedCount: 5,
        totalCount: 5,
      })

      render(<RelayStatusBadge meta={meta} variant="compact" />)

      const badge = screen.getByText('Verified on 5 of 5 relays')
      expect(badge.className).toContain('border-green-600')
    })

    // AT-2.5.03: Yellow badge for moderate confidence
    it('should display yellow badge for >= 40% but < 80% relays', () => {
      const meta = createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://r1' }),
          createRelayResult({ url: 'wss://r2' }),
          createRelayResult({ url: 'wss://r3', status: 'failed', eventCount: 0 }),
          createRelayResult({ url: 'wss://r4', status: 'failed', eventCount: 0 }),
          createRelayResult({ url: 'wss://r5', status: 'failed', eventCount: 0 }),
        ],
        respondedCount: 2,
        totalCount: 5,
      })

      render(<RelayStatusBadge meta={meta} variant="compact" />)

      const badge = screen.getByText('Verified on 2 of 5 relays')
      expect(badge.className).toContain('border-yellow-600')
    })

    // AT-2.5.04: Orange badge for low confidence
    it('should display orange badge for < 40% relays', () => {
      const meta = createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://r1' }),
          createRelayResult({ url: 'wss://r2', status: 'failed', eventCount: 0 }),
          createRelayResult({ url: 'wss://r3', status: 'failed', eventCount: 0 }),
          createRelayResult({ url: 'wss://r4', status: 'failed', eventCount: 0 }),
          createRelayResult({ url: 'wss://r5', status: 'failed', eventCount: 0 }),
        ],
        respondedCount: 1,
        totalCount: 5,
      })

      render(<RelayStatusBadge meta={meta} variant="compact" />)

      const badge = screen.getByText('Verified on 1 of 5 relays')
      expect(badge.className).toContain('border-orange-600')
    })

    it('should not render when 0 relays responded', () => {
      const meta = createRelayQueryMeta({
        respondedCount: 0,
        totalCount: 5,
        results: [],
      })

      const { container } = render(<RelayStatusBadge meta={meta} variant="compact" />)

      expect(container.innerHTML).toBe('')
    })

    it('should have role="status" and aria-label on badge', () => {
      const meta = createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://r1' }),
          createRelayResult({ url: 'wss://r2' }),
        ],
        respondedCount: 2,
        totalCount: 2,
      })

      render(<RelayStatusBadge meta={meta} variant="compact" />)

      const badge = screen.getByRole('status')
      expect(badge).toHaveAttribute('aria-label', 'Verified on 2 of 2 relays')
    })
  })

  describe('Detailed Variant', () => {
    function createDetailedMeta(): RelayQueryMeta {
      return createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://relay.damus.io', latencyMs: 120, eventCount: 10 }),
          createRelayResult({ url: 'wss://nos.lol', latencyMs: 250, eventCount: 8 }),
          createRelayResult({
            url: 'wss://relay.nostr.band',
            status: 'failed',
            latencyMs: 2000,
            eventCount: 0,
            error: 'Timeout',
          }),
        ],
        respondedCount: 2,
        totalCount: 3,
        queriedAt: Math.floor(Date.now() / 1000) - 60,
      })
    }

    // AT-2.5.16: Panel collapsed by default
    it('should render badge with panel collapsed by default', () => {
      const meta = createDetailedMeta()

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="about 1 minute ago" />)

      // Badge should be visible
      expect(screen.getByText('Verified on 2 of 3 relays')).toBeInTheDocument()

      // Panel content should not be visible
      expect(screen.queryByText('Responding Relays')).not.toBeInTheDocument()
    })

    // AT-2.5.05: Clicking badge expands panel
    it('should expand panel when badge is clicked', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="about 1 minute ago" />)

      // Click badge to expand
      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      // Panel should now be visible
      expect(screen.getByText('Responding Relays')).toBeInTheDocument()
      expect(screen.getByText('Failed Relays')).toBeInTheDocument()
    })

    // AT-2.5.06: Panel shows relay URLs that responded
    it('should show responding relay URLs in expanded panel', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="about 1 minute ago" />)

      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      expect(screen.getByText('wss://relay.damus.io')).toBeInTheDocument()
      expect(screen.getByText('wss://nos.lol')).toBeInTheDocument()
    })

    // AT-2.5.07: Panel shows response latency per relay
    it('should show response latency for each relay', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="about 1 minute ago" />)

      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      expect(screen.getByText('120ms')).toBeInTheDocument()
      expect(screen.getByText('250ms')).toBeInTheDocument()
    })

    // AT-2.5.08: Panel shows failed relay URLs
    it('should show failed relay URLs with error message in expanded panel', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="about 1 minute ago" />)

      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      expect(screen.getByText('wss://relay.nostr.band')).toBeInTheDocument()
      // Shows actual error message from RelayResult.error field
      expect(screen.getByText('Timeout')).toBeInTheDocument()
    })

    it('should show "Timed out" fallback when failed relay has no error message', async () => {
      const user = userEvent.setup()
      const meta = createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://r1' }),
          createRelayResult({ url: 'wss://r2', status: 'failed', eventCount: 0 }),
        ],
        respondedCount: 1,
        totalCount: 2,
      })

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="just now" />)

      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      expect(screen.getByText('Timed out')).toBeInTheDocument()
    })

    // AT-2.5.09: Panel shows timestamp of last successful query
    // AT-2.5.12: Data age indicator "Last updated Xs ago from X/Y relays"
    it('should show data age indicator in expanded panel', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()

      render(
        <RelayStatusBadge
          meta={meta}
          variant="detailed"
          dataAge="about 1 minute ago"
        />
      )

      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      expect(screen.getByText(/last updated about 1 minute ago from 2\/3 relays/i)).toBeInTheDocument()
    })

    // AT-2.5.10: Retry button shown when relays failed
    it('should show retry button when some relays failed', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()
      const onRetry = vi.fn()

      render(
        <RelayStatusBadge
          meta={meta}
          variant="detailed"
          dataAge="about 1 minute ago"
          onRetry={onRetry}
        />
      )

      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      const retryButton = screen.getByRole('button', { name: /retry all relay queries/i })
      expect(retryButton).toBeInTheDocument()
    })

    // AT-2.5.11: Retry button calls onRetry
    it('should call onRetry when retry button is clicked', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()
      const onRetry = vi.fn()

      render(
        <RelayStatusBadge
          meta={meta}
          variant="detailed"
          dataAge="about 1 minute ago"
          onRetry={onRetry}
        />
      )

      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      const retryButton = screen.getByRole('button', { name: /retry all relay queries/i })
      await user.click(retryButton)

      expect(onRetry).toHaveBeenCalledOnce()
    })

    it('should NOT show retry button when all relays succeeded', async () => {
      const user = userEvent.setup()
      const meta = createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://r1' }),
          createRelayResult({ url: 'wss://r2' }),
        ],
        respondedCount: 2,
        totalCount: 2,
      })
      const onRetry = vi.fn()

      render(
        <RelayStatusBadge
          meta={meta}
          variant="detailed"
          dataAge="just now"
          onRetry={onRetry}
        />
      )

      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      expect(screen.queryByRole('button', { name: /retry all relay queries/i })).not.toBeInTheDocument()
    })

    it('should collapse panel when badge is clicked again', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="about 1 minute ago" />)

      const trigger = screen.getByRole('button', { name: /verified on/i })

      // Expand
      await user.click(trigger)
      expect(screen.getByText('Responding Relays')).toBeInTheDocument()

      // Collapse
      await user.click(trigger)
      expect(screen.queryByText('Responding Relays')).not.toBeInTheDocument()
    })

    // AT-2.5.14: Keyboard navigation
    it('should expand panel with Enter key', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="about 1 minute ago" />)

      const trigger = screen.getByRole('button', { name: /verified on/i })
      trigger.focus()
      await user.keyboard('{Enter}')

      expect(screen.getByText('Responding Relays')).toBeInTheDocument()
    })

    it('should expand panel with Space key', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="about 1 minute ago" />)

      const trigger = screen.getByRole('button', { name: /verified on/i })
      trigger.focus()
      await user.keyboard(' ')

      expect(screen.getByText('Responding Relays')).toBeInTheDocument()
    })

    // AC #8: Tab to badge (keyboard navigable)
    it('should be focusable via Tab key', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="about 1 minute ago" />)

      // Tab from document body to the trigger button
      await user.tab()

      const trigger = screen.getByRole('button', { name: /verified on/i })
      expect(trigger).toHaveFocus()
    })

    // AT-2.5.15: Screen reader attributes
    it('should have aria-expanded attribute on trigger', () => {
      const meta = createDetailedMeta()

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="about 1 minute ago" />)

      const trigger = screen.getByRole('button', { name: /verified on/i })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('should have aria-expanded="true" when panel is open', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="about 1 minute ago" />)

      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('should have role="region" on expanded panel', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="about 1 minute ago" />)

      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('should have aria-live="polite" on data age text', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()

      render(
        <RelayStatusBadge
          meta={meta}
          variant="detailed"
          dataAge="about 1 minute ago"
        />
      )

      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      const dataAgeElement = screen.getByText(/last updated/i)
      expect(dataAgeElement).toHaveAttribute('aria-live', 'polite')
    })

    it('should have relay lists with role="list"', async () => {
      const user = userEvent.setup()
      const meta = createDetailedMeta()

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="about 1 minute ago" />)

      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      const lists = screen.getAllByRole('list')
      expect(lists.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('NFR: Accessibility Deep Tests', () => {
    // NFR-A1: All functionality accessible via keyboard navigation
    it('should have aria-controls linking trigger to panel', async () => {
      const user = userEvent.setup()
      const meta = createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://r1' }),
          createRelayResult({ url: 'wss://r2', status: 'failed', eventCount: 0 }),
        ],
        respondedCount: 1,
        totalCount: 2,
      })

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="just now" />)

      const trigger = screen.getByRole('button', { name: /verified on/i })
      // aria-controls should reference a valid panel ID (generated by useId)
      const controlsId = trigger.getAttribute('aria-controls')
      expect(controlsId).toBeTruthy()

      // Expand to verify the panel's id matches aria-controls
      await user.click(trigger)
      const panel = screen.getByRole('region')
      expect(panel.getAttribute('id')).toBe(controlsId)
    })

    // NFR-A3: Visible focus indicators on interactive elements
    it('should have focus-visible styling on trigger button', () => {
      const meta = createRelayQueryMeta({
        results: [createRelayResult({ url: 'wss://r1' })],
        respondedCount: 1,
        totalCount: 1,
      })

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="just now" />)

      const trigger = screen.getByRole('button', { name: /verified on/i })
      expect(trigger.className).toContain('focus-visible:ring-2')
    })

    // NFR-A6: ARIA labels for retry button
    it('should have descriptive aria-label on retry button', async () => {
      const user = userEvent.setup()
      const meta = createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://r1' }),
          createRelayResult({ url: 'wss://r2', status: 'failed', eventCount: 0 }),
        ],
        respondedCount: 1,
        totalCount: 2,
      })
      const onRetry = vi.fn()

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="just now" onRetry={onRetry} />)

      await user.click(screen.getByRole('button', { name: /verified on/i }))

      const retryButton = screen.getByRole('button', { name: 'Retry all relay queries' })
      expect(retryButton).toHaveAttribute('aria-label', 'Retry all relay queries')
    })

    // NFR-A7: Live regions for dynamic content
    it('should update aria-live region when data age changes', async () => {
      const meta = createRelayQueryMeta({
        results: [createRelayResult({ url: 'wss://r1' })],
        respondedCount: 1,
        totalCount: 1,
      })

      const { rerender } = render(
        <RelayStatusBadge meta={meta} variant="detailed" dataAge="just now" />
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /verified on/i }))

      expect(screen.getByText(/last updated just now/i)).toBeInTheDocument()

      // Re-render with updated data age
      rerender(
        <RelayStatusBadge meta={meta} variant="detailed" dataAge="about 1 minute ago" />
      )

      expect(screen.getByText(/last updated about 1 minute ago/i)).toBeInTheDocument()
    })
  })

  describe('NFR: Graceful Rendering Edge Cases', () => {
    it('should render panel correctly when only successful relays exist (no Failed section)', async () => {
      const user = userEvent.setup()
      const meta = createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://r1' }),
          createRelayResult({ url: 'wss://r2' }),
        ],
        respondedCount: 2,
        totalCount: 2,
      })

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="just now" />)

      await user.click(screen.getByRole('button', { name: /verified on/i }))

      expect(screen.getByText('Responding Relays')).toBeInTheDocument()
      expect(screen.queryByText('Failed Relays')).not.toBeInTheDocument()
    })

    it('should show "just now" as default data age when dataAge prop is empty', async () => {
      const user = userEvent.setup()
      const meta = createRelayQueryMeta({
        results: [createRelayResult({ url: 'wss://r1' })],
        respondedCount: 1,
        totalCount: 1,
      })

      render(<RelayStatusBadge meta={meta} variant="detailed" />)

      await user.click(screen.getByRole('button', { name: /verified on/i }))

      expect(screen.getByText(/last updated just now/i)).toBeInTheDocument()
    })

    it('should NOT show retry button when no onRetry prop is provided even with failed relays', async () => {
      const user = userEvent.setup()
      const meta = createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://r1' }),
          createRelayResult({ url: 'wss://r2', status: 'failed', eventCount: 0 }),
        ],
        respondedCount: 1,
        totalCount: 2,
      })

      // No onRetry prop
      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="just now" />)

      await user.click(screen.getByRole('button', { name: /verified on/i }))

      expect(screen.getByText('Failed Relays')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /retry all relay queries/i })).not.toBeInTheDocument()
    })

    it('should not render data age section when queriedAt is 0', async () => {
      const user = userEvent.setup()
      const meta = createRelayQueryMeta({
        results: [createRelayResult({ url: 'wss://r1' })],
        respondedCount: 1,
        totalCount: 1,
        queriedAt: 0,
      })

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="just now" />)

      await user.click(screen.getByRole('button', { name: /verified on/i }))

      expect(screen.queryByText(/last updated/i)).not.toBeInTheDocument()
    })

    // NFR-A10: Information not conveyed by color alone
    it('should show relay status as text labels alongside icons, not color alone', async () => {
      const user = userEvent.setup()
      const meta = createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://r1', latencyMs: 150 }),
          createRelayResult({ url: 'wss://r2', status: 'failed', eventCount: 0 }),
        ],
        respondedCount: 1,
        totalCount: 2,
      })

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="just now" />)

      await user.click(screen.getByRole('button', { name: /verified on/i }))

      // Responding relays have latency text
      expect(screen.getByText('150ms')).toBeInTheDocument()
      // Failed relays have "Timed out" text
      expect(screen.getByText('Timed out')).toBeInTheDocument()
      // Badge text conveys count information
      expect(screen.getByText('Verified on 1 of 2 relays')).toBeInTheDocument()
    })

    // NFR: list items have role="listitem"
    it('should render relay items with role="listitem" for assistive technologies', async () => {
      const user = userEvent.setup()
      const meta = createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://r1' }),
          createRelayResult({ url: 'wss://r2', status: 'failed', eventCount: 0 }),
        ],
        respondedCount: 1,
        totalCount: 2,
      })

      render(<RelayStatusBadge meta={meta} variant="detailed" dataAge="just now" />)

      await user.click(screen.getByRole('button', { name: /verified on/i }))

      const listItems = screen.getAllByRole('listitem')
      expect(listItems.length).toBe(2) // 1 responding + 1 failed
    })
  })
})
