/**
 * Tests for RepoCard component
 *
 * Story 2.2: Repository Card Component with Metadata
 *
 * Test coverage:
 * - Metadata display (name, description, maintainers, timestamp, ArNS URL)
 * - Clickable link navigation to correct route
 * - Description truncation and expand/collapse behavior
 * - Verification badge with correct relay count and color
 * - Copy button clipboard interaction
 * - Accessibility attributes (ARIA labels, roles)
 * - Graceful rendering when optional fields are missing
 * - Topic tags display
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import {
  createRepository,
  resetRepositoryCounter,
} from '@/test-utils/factories/repository'
import { RepoCard } from './RepoCard'
import type { Repository } from '@/types/repository'

// Clipboard mock -- set up fresh each test
let mockWriteText: ReturnType<typeof vi.fn>

function renderRepoCard(repoOverrides: Partial<Repository> = {}) {
  const repo = createRepository(repoOverrides)
  return {
    ...render(
      <MemoryRouter>
        <RepoCard repo={repo} />
      </MemoryRouter>
    ),
    repo,
  }
}

describe('RepoCard', () => {
  beforeEach(() => {
    resetRepositoryCounter()
    vi.clearAllMocks()
    vi.useRealTimers()

    // Spy on navigator.clipboard.writeText (happy-dom provides clipboard)
    // If clipboard doesn't exist, create it
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        writable: true,
        configurable: true,
      })
    }
    mockWriteText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Metadata Display', () => {
    // AT-2.2.01: Displays repository name as prominent heading
    it('[P0] should display repository name as an h2 heading', () => {
      const { repo } = renderRepoCard()

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent(repo.name)
    })

    it('[P1] should display repository description', () => {
      const { repo } = renderRepoCard({ description: 'A test repository for Nostr' })

      expect(screen.getByText('A test repository for Nostr')).toBeInTheDocument()
      expect(repo.description).toBe('A test repository for Nostr')
    })

    // AT-2.2.04: Displays maintainer(s) names/npubs
    it('[P1] should display maintainer pubkeys', () => {
      renderRepoCard({ maintainers: ['pubkey-abc-123'] })

      expect(screen.getByText('pubkey-abc-123')).toBeInTheDocument()
    })

    it('[P1] should truncate long maintainer pubkeys', () => {
      const longPubkey = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      renderRepoCard({ maintainers: [longPubkey] })

      expect(screen.getByText('abcdef12...34567890')).toBeInTheDocument()
    })

    it('[P1] should show first 3 maintainers with "+N more" for overflow', () => {
      renderRepoCard({
        maintainers: ['maintainer-1-key', 'maintainer-2-key', 'maintainer-3-key', 'maintainer-4-key', 'maintainer-5-key'],
      })

      expect(screen.getByText('maintainer-1-key')).toBeInTheDocument()
      expect(screen.getByText('maintainer-2-key')).toBeInTheDocument()
      expect(screen.getByText('maintainer-3-key')).toBeInTheDocument()
      expect(screen.getByText('+2 more')).toBeInTheDocument()
      expect(screen.queryByText('maintainer-4-key')).not.toBeInTheDocument()
    })

    // AT-2.2.07: Displays "Last updated X ago" relative timestamp
    it('[P1] should display relative timestamp', () => {
      // Use a timestamp from roughly 1 day ago
      const oneDayAgo = Math.floor(Date.now() / 1000) - 86400
      renderRepoCard({ createdAt: oneDayAgo })

      const timestampElement = screen.getByText(/ago/i)
      expect(timestampElement).toBeInTheDocument()
    })
  })

  describe('Navigation Link', () => {
    // AT-2.2.09: Repository name is a clickable link to /:owner/:repo
    it('[P0] should render repo name as a link to the correct route', () => {
      renderRepoCard({ owner: 'alice-pubkey', id: 'my-repo' })

      const link = screen.getByRole('link', { name: /view repository/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', `/${encodeURIComponent('alice-pubkey')}/${encodeURIComponent('my-repo')}`)
    })

    it('[P1] should have hover:underline class for link discoverability', () => {
      renderRepoCard()

      const link = screen.getByRole('link', { name: /view repository/i })
      expect(link.className).toContain('hover:underline')
    })
  })

  describe('Description Expand/Collapse', () => {
    // AT-2.2.02 & AT-2.2.03: Description truncation and expand/collapse
    it('[P1] should apply line-clamp-3 class to description by default', () => {
      const { container } = renderRepoCard({
        description: 'A description that might be long enough to truncate over multiple lines.',
      })

      const descriptionP = container.querySelector('p.line-clamp-3')
      expect(descriptionP).toBeInTheDocument()
    })

    it('[P1] should NOT show "Read more" button when description fits within 3 lines', () => {
      // In happy-dom, scrollHeight === clientHeight === 0, so isTruncated is false.
      // Explicitly verify the button is absent when text is not truncated.
      renderRepoCard({
        description: 'A short description.',
      })

      expect(screen.queryByRole('button', { name: /toggle description/i })).not.toBeInTheDocument()
    })

    it('[P1] should toggle "Read more" / "Show less" button on click', async () => {
      const user = userEvent.setup()

      // In happy-dom, scrollHeight === clientHeight === 0, so isTruncated won't be
      // auto-detected. We need to manually trigger the expand UI.
      // The expand button only shows if isTruncated is true OR isExpanded is true.
      // We mock scrollHeight > clientHeight to simulate truncation.
      const mockRef = vi.spyOn(HTMLParagraphElement.prototype, 'scrollHeight', 'get').mockReturnValue(100)
      const mockClientHeight = vi.spyOn(HTMLParagraphElement.prototype, 'clientHeight', 'get').mockReturnValue(60)

      renderRepoCard({
        description: 'This is a very long description that spans many lines and should be truncated when displayed in the card component for better readability and card layout consistency across the grid.',
      })

      // Should show "Read more" button
      const readMoreBtn = await screen.findByRole('button', { name: /toggle description/i })
      expect(readMoreBtn).toBeInTheDocument()
      expect(readMoreBtn).toHaveTextContent('Read more')
      expect(readMoreBtn).toHaveAttribute('aria-expanded', 'false')

      // Click to expand
      await user.click(readMoreBtn)

      expect(readMoreBtn).toHaveTextContent('Show less')
      expect(readMoreBtn).toHaveAttribute('aria-expanded', 'true')

      // Click to collapse
      await user.click(readMoreBtn)

      expect(readMoreBtn).toHaveTextContent('Read more')
      expect(readMoreBtn).toHaveAttribute('aria-expanded', 'false')

      mockRef.mockRestore()
      mockClientHeight.mockRestore()
    })
  })

  describe('Verification Badge', () => {
    // AT-2.2.10: Verification badge shows "Verified on X relays"
    it('[P1] should display badge with green color for 4+ relays', () => {
      renderRepoCard({
        relays: ['wss://r1', 'wss://r2', 'wss://r3', 'wss://r4'],
      })

      const badge = screen.getByText('Verified on 4 relays')
      expect(badge).toBeInTheDocument()
      expect(badge.className).toContain('border-green-600')
      expect(badge.className).toContain('text-green-600')
    })

    it('[P1] should display badge with yellow color for 2-3 relays', () => {
      renderRepoCard({
        relays: ['wss://r1', 'wss://r2'],
      })

      const badge = screen.getByText('Verified on 2 relays')
      expect(badge).toBeInTheDocument()
      expect(badge.className).toContain('border-yellow-600')
      expect(badge.className).toContain('text-yellow-600')
    })

    it('[P1] should display badge with orange color for 1 relay', () => {
      renderRepoCard({
        relays: ['wss://r1'],
      })

      const badge = screen.getByText('Verified on 1 relay')
      expect(badge).toBeInTheDocument()
      expect(badge.className).toContain('border-orange-600')
      expect(badge.className).toContain('text-orange-600')
    })

    it('[P1] should hide badge when relay count is 0', () => {
      renderRepoCard({ relays: [] })

      expect(screen.queryByText(/verified on/i)).not.toBeInTheDocument()
    })
  })

  describe('ArNS URL and Copy Button', () => {
    // AT-2.2.05 & AT-2.2.06: ArNS URL display and copy
    it('[P1] should display ArNS URL when available', () => {
      renderRepoCard({ webUrls: ['https://my-repo.arweave.dev'] })

      expect(screen.getByText('https://my-repo.arweave.dev')).toBeInTheDocument()
    })

    it('[P1] should hide ArNS URL section when no web URLs', () => {
      renderRepoCard({ webUrls: [] })

      expect(screen.queryByLabelText('Copy URL')).not.toBeInTheDocument()
    })

    it('[P1] should copy URL to clipboard on copy button click', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderRepoCard({ webUrls: ['https://my-repo.arweave.dev'] })

      const copyBtn = screen.getByRole('button', { name: 'Copy URL' })
      await user.click(copyBtn)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('https://my-repo.arweave.dev')
      })
    })

    it('[P1] should show "Copied!" feedback after copying', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      renderRepoCard({ webUrls: ['https://my-repo.arweave.dev'] })

      const copyBtn = screen.getByRole('button', { name: 'Copy URL' })
      await user.click(copyBtn)

      expect(screen.getByText('Copied!')).toBeInTheDocument()

      // After 2 seconds, "Copied!" should disappear.
      // Wrap in act() because the setTimeout callback triggers a state update.
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
      })
    })

    it('[P2] should fail silently when clipboard API is unavailable', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      mockWriteText.mockRejectedValue(new Error('Clipboard unavailable'))

      renderRepoCard({ webUrls: ['https://my-repo.arweave.dev'] })

      const copyBtn = screen.getByRole('button', { name: 'Copy URL' })

      // Should not throw
      await user.click(copyBtn)

      // Wait for async operation to settle
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled()
      })

      // "Copied!" should NOT appear since the copy failed
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
    })
  })

  describe('Topic Tags', () => {
    it('[P1] should display topic tags', () => {
      renderRepoCard({ topics: ['nostr', 'git', 'decentralized'] })

      expect(screen.getByText('nostr')).toBeInTheDocument()
      expect(screen.getByText('git')).toBeInTheDocument()
      expect(screen.getByText('decentralized')).toBeInTheDocument()
    })

    it('[P1] should truncate topics to 4 with "+N" overflow indicator', () => {
      renderRepoCard({
        topics: ['topic-1', 'topic-2', 'topic-3', 'topic-4', 'topic-5', 'topic-6'],
      })

      expect(screen.getByText('topic-1')).toBeInTheDocument()
      expect(screen.getByText('topic-4')).toBeInTheDocument()
      expect(screen.getByText('+2')).toBeInTheDocument()
      expect(screen.queryByText('topic-5')).not.toBeInTheDocument()
    })

    it('[P1] should hide topics section when no topics', () => {
      const { container } = renderRepoCard({ topics: [] })

      // No topic spans should be rendered
      const topicSpans = container.querySelectorAll('.bg-secondary')
      expect(topicSpans).toHaveLength(0)
    })
  })

  describe('Accessibility', () => {
    // AT-2.2.14: Screen reader navigation with proper ARIA labels
    it('[P1] should wrap card in <article> element', () => {
      renderRepoCard()

      const article = screen.getByRole('article')
      expect(article).toBeInTheDocument()
    })

    it('[P1] should have aria-label on repo name link', () => {
      renderRepoCard({ name: 'My Cool Repo' })

      const link = screen.getByRole('link', { name: 'View repository My Cool Repo' })
      expect(link).toBeInTheDocument()
    })

    it('[P1] should have aria-label on copy button', () => {
      renderRepoCard({ webUrls: ['https://example.com'] })

      const copyBtn = screen.getByRole('button', { name: 'Copy URL' })
      expect(copyBtn).toBeInTheDocument()
    })

    it('[P1] should have aria-expanded on expand/collapse button', () => {
      // Mock scrollHeight > clientHeight to trigger isTruncated
      vi.spyOn(HTMLParagraphElement.prototype, 'scrollHeight', 'get').mockReturnValue(100)
      vi.spyOn(HTMLParagraphElement.prototype, 'clientHeight', 'get').mockReturnValue(60)

      renderRepoCard({
        description: 'A description long enough to be truncated',
      })

      const toggleBtn = screen.getByRole('button', { name: /toggle description/i })
      expect(toggleBtn).toHaveAttribute('aria-expanded', 'false')
    })

    it('[P1] should have aria-label and role="status" on verification badge', () => {
      renderRepoCard({ relays: ['wss://r1', 'wss://r2', 'wss://r3'] })

      const badge = screen.getByText('Verified on 3 relays')
      expect(badge).toHaveAttribute('aria-label', 'Verified on 3 relays')
      expect(badge).toHaveAttribute('role', 'status')
    })
  })

  describe('Graceful Rendering with Missing Fields', () => {
    // AT-2.2.15: Card renders gracefully when optional fields are missing
    it('[P1] should display "No description" when description is empty', () => {
      renderRepoCard({ description: '' })

      expect(screen.getByText('No description')).toBeInTheDocument()
    })

    it('[P1] should hide maintainers section when maintainers array is empty', () => {
      renderRepoCard({ maintainers: [] })

      // No maintainer elements should be rendered; UsersIcon should not appear
      expect(screen.queryByText(/maintainer/i)).not.toBeInTheDocument()
    })

    it('[P1] should hide ArNS section when webUrls is empty', () => {
      renderRepoCard({ webUrls: [] })

      expect(screen.queryByLabelText('Copy URL')).not.toBeInTheDocument()
    })

    it('[P1] should hide verification badge when relays is empty', () => {
      renderRepoCard({ relays: [] })

      expect(screen.queryByText(/verified on/i)).not.toBeInTheDocument()
    })

    it('[P1] should render card with all optional fields missing', () => {
      renderRepoCard({
        description: '',
        maintainers: [],
        webUrls: [],
        relays: [],
        topics: [],
      })

      // Card should still render with name and "No description"
      expect(screen.getByRole('article')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.getByText('No description')).toBeInTheDocument()
    })
  })

  describe('Card Structure', () => {
    // AT-2.2.08: Uses shadcn/ui Card component
    it('[P2] should render using shadcn/ui Card component (data-slot="card")', () => {
      const { container } = renderRepoCard()

      const card = container.querySelector('[data-slot="card"]')
      expect(card).toBeInTheDocument()
    })

    it('[P2] should have hover shadow transition', () => {
      const { container } = renderRepoCard()

      const card = container.querySelector('[data-slot="card"]')
      expect(card?.className).toContain('hover:shadow-md')
    })

    it('[P1] should display owner pubkey in footer', () => {
      renderRepoCard({ owner: 'short-owner' })

      expect(screen.getByText('short-owner')).toBeInTheDocument()
    })

    it('[P1] should truncate long owner pubkey in footer', () => {
      const longOwner = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      renderRepoCard({ owner: longOwner })

      expect(screen.getByText('abcdef12...34567890')).toBeInTheDocument()
    })
  })

  describe('Navigation Link - Special Characters (R2.2-4)', () => {
    it('[P1] should encode special characters in owner/repo route path', () => {
      renderRepoCard({ owner: 'alice key', id: 'my repo' })

      const link = screen.getByRole('link', { name: /view repository/i })
      expect(link).toHaveAttribute('href', '/alice%20key/my%20repo')
    })

    it('[P1] should encode unicode characters in owner/repo path', () => {
      renderRepoCard({ owner: 'alice\u00e9', id: 'r\u00e9po' })

      const link = screen.getByRole('link', { name: /view repository/i })
      expect(link).toHaveAttribute(
        'href',
        `/${encodeURIComponent('alice\u00e9')}/${encodeURIComponent('r\u00e9po')}`
      )
    })

    it('[P1] should encode slashes and ampersands in owner/repo path', () => {
      renderRepoCard({ owner: 'org/team', id: 'repo&name' })

      const link = screen.getByRole('link', { name: /view repository/i })
      expect(link).toHaveAttribute(
        'href',
        `/${encodeURIComponent('org/team')}/${encodeURIComponent('repo&name')}`
      )
    })
  })

  describe('Verification Badge - Boundary Values (R2.2-5)', () => {
    it('[P1] should display yellow badge for exactly 3 relays', () => {
      renderRepoCard({
        relays: ['wss://r1', 'wss://r2', 'wss://r3'],
      })

      const badge = screen.getByText('Verified on 3 relays')
      expect(badge).toBeInTheDocument()
      expect(badge.className).toContain('border-yellow-600')
      expect(badge.className).toContain('text-yellow-600')
    })

    it('[P1] should display green badge for 5+ relays', () => {
      renderRepoCard({
        relays: ['wss://r1', 'wss://r2', 'wss://r3', 'wss://r4', 'wss://r5'],
      })

      const badge = screen.getByText('Verified on 5 relays')
      expect(badge).toBeInTheDocument()
      expect(badge.className).toContain('border-green-600')
      expect(badge.className).toContain('text-green-600')
    })

    it('[P2] should use outline variant on verification badge (AC #6)', () => {
      const { container } = renderRepoCard({
        relays: ['wss://r1', 'wss://r2'],
      })

      // The Badge component with variant="outline" renders a data-slot="badge"
      const badge = container.querySelector('[data-slot="badge"]')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Description Expand/Collapse - Line Clamp Removal (AC #3)', () => {
    it('[P1] should remove line-clamp-3 class when description is expanded', async () => {
      const user = userEvent.setup()
      vi.spyOn(HTMLParagraphElement.prototype, 'scrollHeight', 'get').mockReturnValue(100)
      vi.spyOn(HTMLParagraphElement.prototype, 'clientHeight', 'get').mockReturnValue(60)

      const { container } = renderRepoCard({
        description: 'A very long description that should be expandable.',
      })

      // Initially, line-clamp-3 is applied
      expect(container.querySelector('p.line-clamp-3')).toBeInTheDocument()

      // Expand
      const expandBtn = screen.getByRole('button', { name: /toggle description/i })
      await user.click(expandBtn)

      // After expanding, line-clamp-3 should be removed
      expect(container.querySelector('p.line-clamp-3')).not.toBeInTheDocument()
      // But the paragraph should still exist
      expect(screen.getByText('A very long description that should be expandable.')).toBeInTheDocument()
    })

    it('[P1] should re-apply line-clamp-3 class when description is collapsed', async () => {
      const user = userEvent.setup()
      vi.spyOn(HTMLParagraphElement.prototype, 'scrollHeight', 'get').mockReturnValue(100)
      vi.spyOn(HTMLParagraphElement.prototype, 'clientHeight', 'get').mockReturnValue(60)

      const { container } = renderRepoCard({
        description: 'A very long description that toggles.',
      })

      const expandBtn = screen.getByRole('button', { name: /toggle description/i })

      // Expand
      await user.click(expandBtn)
      expect(container.querySelector('p.line-clamp-3')).not.toBeInTheDocument()

      // Collapse
      await user.click(expandBtn)
      expect(container.querySelector('p.line-clamp-3')).toBeInTheDocument()
    })
  })

  describe('ArNS URL - Edge Cases (AC #7)', () => {
    it('[P1] should apply truncate class to ArNS URL for long URLs', () => {
      const { container } = renderRepoCard({
        webUrls: ['https://very-long-repository-name.arweave.dev/some/deep/path/that/is/very/long'],
      })

      const urlSpan = container.querySelector('.truncate.font-mono')
      expect(urlSpan).toBeInTheDocument()
      expect(urlSpan?.textContent).toBe(
        'https://very-long-repository-name.arweave.dev/some/deep/path/that/is/very/long'
      )
    })

    it('[P1] should only display the first web URL when multiple exist', () => {
      renderRepoCard({
        webUrls: ['https://first-url.arweave.dev', 'https://second-url.arweave.dev'],
      })

      expect(screen.getByText('https://first-url.arweave.dev')).toBeInTheDocument()
      expect(screen.queryByText('https://second-url.arweave.dev')).not.toBeInTheDocument()
    })
  })

  describe('Touch Targets (AT-2.2.12, AC #8)', () => {
    it('[P1] should have minimum 44x44px touch target on repo name link', () => {
      renderRepoCard()

      const link = screen.getByRole('link', { name: /view repository/i })
      expect(link.className).toContain('min-h-[44px]')
      expect(link.className).toContain('min-w-[44px]')
    })

    it('[P1] should have minimum 44x44px touch target on copy button', () => {
      renderRepoCard({ webUrls: ['https://example.com'] })

      const copyBtn = screen.getByRole('button', { name: 'Copy URL' })
      expect(copyBtn.className).toContain('min-h-[44px]')
      expect(copyBtn.className).toContain('min-w-[44px]')
    })

    it('[P1] should have minimum 44x44px touch target on expand/collapse button', () => {
      vi.spyOn(HTMLParagraphElement.prototype, 'scrollHeight', 'get').mockReturnValue(100)
      vi.spyOn(HTMLParagraphElement.prototype, 'clientHeight', 'get').mockReturnValue(60)

      renderRepoCard({
        description: 'A truncated description for touch target testing.',
      })

      const expandBtn = screen.getByRole('button', { name: /toggle description/i })
      expect(expandBtn.className).toContain('min-h-[44px]')
      expect(expandBtn.className).toContain('min-w-[44px]')
    })
  })

  describe('No Description Styling (AC #3, AC #9)', () => {
    it('[P1] should display "No description" in italic muted text', () => {
      renderRepoCard({ description: '' })

      const noDescEl = screen.getByText('No description')
      expect(noDescEl).toBeInTheDocument()
      // Verify italic and muted styling classes (with opacity modifier)
      expect(noDescEl.className).toContain('italic')
      expect(noDescEl.className).toContain('text-muted-foreground/60')
    })
  })

  describe('Maintainer Overflow - Large Lists (R2.2-3)', () => {
    it('[P1] should show first 3 of 10 maintainers with "+7 more" overflow', () => {
      const maintainers = Array.from({ length: 10 }, (_, i) => `maintainer-${i + 1}`)
      renderRepoCard({ maintainers })

      // First 3 visible
      expect(screen.getByText('maintainer-1')).toBeInTheDocument()
      expect(screen.getByText('maintainer-2')).toBeInTheDocument()
      expect(screen.getByText('maintainer-3')).toBeInTheDocument()
      // Overflow indicator
      expect(screen.getByText('+7 more')).toBeInTheDocument()
      // 4th and beyond not visible
      expect(screen.queryByText('maintainer-4')).not.toBeInTheDocument()
      expect(screen.queryByText('maintainer-10')).not.toBeInTheDocument()
    })

    it('[P1] should display exactly 3 maintainers without overflow indicator', () => {
      renderRepoCard({
        maintainers: ['maint-a', 'maint-b', 'maint-c'],
      })

      expect(screen.getByText('maint-a')).toBeInTheDocument()
      expect(screen.getByText('maint-b')).toBeInTheDocument()
      expect(screen.getByText('maint-c')).toBeInTheDocument()
      expect(screen.queryByText(/more/)).not.toBeInTheDocument()
    })

    it('[P1] should display single maintainer without overflow indicator', () => {
      renderRepoCard({ maintainers: ['single-maintainer'] })

      expect(screen.getByText('single-maintainer')).toBeInTheDocument()
      expect(screen.queryByText(/more/)).not.toBeInTheDocument()
    })
  })

  describe('Verification Badge - Singular/Plural Text (AC #6)', () => {
    it('[P1] should use singular "relay" for 1 relay', () => {
      renderRepoCard({ relays: ['wss://r1'] })

      expect(screen.getByText('Verified on 1 relay')).toBeInTheDocument()
      expect(screen.queryByText('Verified on 1 relays')).not.toBeInTheDocument()
    })

    it('[P1] should use plural "relays" for 2+ relays', () => {
      renderRepoCard({ relays: ['wss://r1', 'wss://r2'] })

      expect(screen.getByText('Verified on 2 relays')).toBeInTheDocument()
    })
  })
})
