/**
 * Tests for Home page component
 *
 * Story 2.1: Repository List Page with Nostr Query
 * Story 2.3: Client-Side Search and Filtering
 *
 * Test coverage:
 * - Loading skeleton state (AC #4)
 * - Error state with retry (AC #5)
 * - Empty state (AC #6)
 * - Populated grid layout (AC #2)
 * - Accessibility attributes (ARIA roles, landmarks)
 * - Search and filtering (Story 2.3: AC #1-#10)
 *
 * Acceptance Criteria covered: #2, #4, #5, #6, #9 (Story 2.1), #1-#10 (Story 2.3)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import type { ReactNode } from 'react'
import {
  createRepository,
  createRepositories,
  resetRepositoryCounter,
} from '@/test-utils/factories/repository'

// Mock the nostr service layer at the service boundary
vi.mock('@/lib/nostr', () => ({
  fetchRepositories: vi.fn(),
}))

const { fetchRepositories } = await import('@/lib/nostr')
const { Component: Home } = await import('./Home')

// Fresh QueryClient per test — prevents cache leaks between tests
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
}

// Component wrapper with QueryClientProvider + MemoryRouter
// Note: AppLayout is already applied via routes.tsx RootLayout,
// so Home itself does not need it. We render Home directly.
function renderHome() {
  const queryClient = createTestQueryClient()

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )

  return {
    ...render(<Home />, { wrapper }),
    queryClient,
  }
}

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRepositoryCounter()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Loading State (AC #4)', () => {
    // AT-2.1.06: Shows loading skeleton state
    it('[P0] should display loading skeleton with role="status" and aria-label while data is pending', () => {
      // Given: fetchRepositories returns a promise that never resolves (stays pending)
      vi.mocked(fetchRepositories).mockReturnValue(new Promise(() => {}))

      // When: The Home page is rendered
      renderHome()

      // Then: Should show a loading skeleton with proper accessibility
      const loadingElement = screen.getByRole('status')
      expect(loadingElement).toBeInTheDocument()
      expect(loadingElement).toHaveAttribute('aria-label', 'Loading repositories')
    })

    it('[P1] should display 6 skeleton cards in the loading grid', () => {
      // Given: Data is pending
      vi.mocked(fetchRepositories).mockReturnValue(new Promise(() => {}))

      // When: The Home page is rendered
      renderHome()

      // Then: Should show 6 skeleton card placeholders
      const skeletonContainer = screen.getByRole('status')
      expect(skeletonContainer).toBeInTheDocument()
      // The skeleton grid should contain 6 skeleton card wrappers
      // We verify by checking the grid container has children
      const gridElement = skeletonContainer.querySelector('.grid')
      expect(gridElement).toBeInTheDocument()
      expect(gridElement?.children).toHaveLength(6)
    })

    it('[P1] should render skeleton grid with responsive classes (AC #2 + #4)', () => {
      // Given: Data is pending
      vi.mocked(fetchRepositories).mockReturnValue(new Promise(() => {}))

      // When: The Home page is rendered
      renderHome()

      // Then: The skeleton grid should have responsive Tailwind classes
      const skeletonContainer = screen.getByRole('status')
      const gridElement = skeletonContainer.querySelector('.grid')
      expect(gridElement).toHaveClass('grid-cols-1')
      expect(gridElement).toHaveClass('md:grid-cols-2')
      expect(gridElement).toHaveClass('lg:grid-cols-3')
    })

    it('[P1] should remove loading skeleton after data loads successfully', async () => {
      // Given: fetchRepositories resolves with data
      vi.mocked(fetchRepositories).mockResolvedValue(createRepositories(2))

      // When: The Home page is rendered
      renderHome()

      // Then: Loading skeleton should disappear after data arrives
      // Query by aria-label to distinguish the loading skeleton from other role="status" elements
      // (e.g., verification badge on RepoCard)
      await waitFor(() => {
        expect(screen.queryByRole('status', { name: 'Loading repositories' })).not.toBeInTheDocument()
      })

      // And repository data should be visible
      expect(screen.getByText('Repository 1')).toBeInTheDocument()
    })
  })

  describe('Error State (AC #5)', () => {
    // AT-2.1.09: Shows error message with retry when all relays fail
    it('[P0] should display error message with role="alert" when query fails with RigError', async () => {
      // Given: fetchRepositories throws a RigError
      const rigError = {
        code: 'RELAY_TIMEOUT' as const,
        message: 'Relay query failed: Timeout',
        userMessage: 'Unable to connect to Nostr relays. Please try again.',
        context: {},
      }
      vi.mocked(fetchRepositories).mockRejectedValue(rigError)

      // When: The Home page is rendered
      renderHome()

      // Then: Should show the user-friendly error message with role="alert"
      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toBeInTheDocument()
      expect(alertElement).toHaveTextContent('Unable to connect to Nostr relays. Please try again.')
    })

    it('[P0] should display a "Try Again" button when query fails', async () => {
      // Given: fetchRepositories throws an error
      vi.mocked(fetchRepositories).mockRejectedValue({
        code: 'RELAY_TIMEOUT',
        message: 'Failed',
        userMessage: 'Unable to connect to Nostr relays. Please try again.',
      })

      // When: The Home page is rendered
      renderHome()

      // Then: Should show a "Try Again" button
      const retryButton = await screen.findByRole('button', { name: /try again/i })
      expect(retryButton).toBeInTheDocument()
    })

    // AT-2.1.10: Retry button re-queries relays
    it('[P0] should refetch when "Try Again" button is clicked', async () => {
      // Given: First call fails, second call succeeds
      const user = userEvent.setup()
      const mockRepos = createRepositories(2)
      vi.mocked(fetchRepositories)
        .mockRejectedValueOnce({
          code: 'RELAY_TIMEOUT',
          message: 'Failed',
          userMessage: 'Unable to connect to Nostr relays. Please try again.',
        })
        .mockResolvedValueOnce(mockRepos)

      // When: The Home page is rendered and error is shown
      renderHome()

      const retryButton = await screen.findByRole('button', { name: /try again/i })

      // When: User clicks "Try Again"
      await user.click(retryButton)

      // Then: Should refetch and show repositories
      await waitFor(() => {
        expect(screen.getByText('Repository 1')).toBeInTheDocument()
      })
      expect(fetchRepositories).toHaveBeenCalledTimes(2)
    })

    it('[P1] should handle generic Error objects (non-RigError) gracefully', async () => {
      // Given: fetchRepositories throws a generic Error (not RigError)
      vi.mocked(fetchRepositories).mockRejectedValue(new Error('Network failure'))

      // When: The Home page is rendered
      renderHome()

      // Then: Should show a fallback error message
      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toBeInTheDocument()
      expect(alertElement).toHaveTextContent('Something went wrong.')
    })

    it('[P2] should display different RigError user messages correctly', async () => {
      // Given: fetchRepositories throws a VALIDATION_FAILED RigError
      vi.mocked(fetchRepositories).mockRejectedValue({
        code: 'VALIDATION_FAILED',
        message: 'All events failed validation',
        userMessage: 'Repository data could not be loaded due to invalid data.',
      })

      // When: The Home page is rendered
      renderHome()

      // Then: Should show the specific user message from the RigError
      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toHaveTextContent('Repository data could not be loaded due to invalid data.')
    })

    it('[P1] should not display loading skeleton while in error state', async () => {
      // Given: fetchRepositories throws an error
      vi.mocked(fetchRepositories).mockRejectedValue({
        code: 'RELAY_TIMEOUT',
        message: 'Failed',
        userMessage: 'Unable to connect.',
      })

      // When: The Home page is rendered
      renderHome()

      // Then: Error state should be shown, NOT loading skeleton
      await screen.findByRole('alert')
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('Empty State (AC #6)', () => {
    // AT-2.1.15: Empty state when no repositories exist
    it('[P1] should display empty state message when no repositories are returned', async () => {
      // Given: fetchRepositories returns an empty array
      vi.mocked(fetchRepositories).mockResolvedValue([])

      // When: The Home page is rendered
      renderHome()

      // Then: Should show the empty state message
      await waitFor(() => {
        expect(screen.getByText(/no repositories found/i)).toBeInTheDocument()
      })
    })

    it('[P2] should display informative sub-message in empty state', async () => {
      // Given: fetchRepositories returns an empty array
      vi.mocked(fetchRepositories).mockResolvedValue([])

      // When: The Home page is rendered
      renderHome()

      // Then: Should show informative sub-message about Nostr announcements
      await waitFor(() => {
        expect(screen.getByText(/nostr will appear here/i)).toBeInTheDocument()
      })
    })

    it('[P1] should not display loading skeleton in empty state', async () => {
      // Given: fetchRepositories returns an empty array
      vi.mocked(fetchRepositories).mockResolvedValue([])

      // When: The Home page is rendered
      renderHome()

      // Then: Empty state should be shown, NOT loading skeleton
      await waitFor(() => {
        expect(screen.getByText(/no repositories found/i)).toBeInTheDocument()
      })
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('Populated State (AC #2)', () => {
    // AT-2.1.02: Displays repositories in grid layout
    it('[P0] should display repository names in a grid after successful fetch', async () => {
      // Given: fetchRepositories returns 3 repositories
      const mockRepos = createRepositories(3)
      vi.mocked(fetchRepositories).mockResolvedValue(mockRepos)

      // When: The Home page is rendered
      renderHome()

      // Then: Should show all repository names
      await waitFor(() => {
        expect(screen.getByText('Repository 1')).toBeInTheDocument()
      })
      expect(screen.getByText('Repository 2')).toBeInTheDocument()
      expect(screen.getByText('Repository 3')).toBeInTheDocument()
    })

    it('[P1] should display repository descriptions', async () => {
      // Given: fetchRepositories returns repositories with descriptions
      const mockRepos = createRepositories(2)
      vi.mocked(fetchRepositories).mockResolvedValue(mockRepos)

      // When: The Home page is rendered
      renderHome()

      // Then: Should show repository descriptions
      await waitFor(() => {
        expect(screen.getByText('Description for repository 1')).toBeInTheDocument()
      })
      expect(screen.getByText('Description for repository 2')).toBeInTheDocument()
    })

    it('[P2] should display short owner pubkeys without truncation', async () => {
      // Given: A repository with a short pubkey (<=20 chars, below truncation threshold)
      const repoShortPubkey = createRepository({ owner: 'short-pubkey-abc' })
      vi.mocked(fetchRepositories).mockResolvedValue([repoShortPubkey])

      // When: The Home page is rendered
      renderHome()

      // Then: Should show the full short pubkey (no truncation applied)
      await waitFor(() => {
        expect(screen.getByText('short-pubkey-abc')).toBeInTheDocument()
      })
    })

    it('[P2] should truncate long owner pubkeys with ellipsis', async () => {
      // Given: A repository with a long hex pubkey (>20 chars, triggers truncation)
      const longPubkey = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      const repoLongPubkey = createRepository({ owner: longPubkey })
      vi.mocked(fetchRepositories).mockResolvedValue([repoLongPubkey])

      // When: The Home page is rendered
      renderHome()

      // Then: Should show truncated pubkey: first 8 chars + "..." + last 8 chars
      await waitFor(() => {
        expect(screen.getByText('abcdef12...34567890')).toBeInTheDocument()
      })
    })

    it('[P1] should render a responsive grid container', async () => {
      // Given: fetchRepositories returns repositories
      const mockRepos = createRepositories(3)
      vi.mocked(fetchRepositories).mockResolvedValue(mockRepos)

      // When: The Home page is rendered
      const { container } = renderHome()

      // Then: Should have responsive grid classes
      await waitFor(() => {
        const grid = container.querySelector('.grid')
        expect(grid).toBeInTheDocument()
        expect(grid).toHaveClass('grid-cols-1')
        expect(grid).toHaveClass('md:grid-cols-2')
        expect(grid).toHaveClass('lg:grid-cols-3')
      })
    })

    it('[P1] should display repository count in the header', async () => {
      // Given: fetchRepositories returns 3 repositories
      const mockRepos = createRepositories(3)
      vi.mocked(fetchRepositories).mockResolvedValue(mockRepos)

      // When: The Home page is rendered
      renderHome()

      // Then: Should show the repository count text
      await waitFor(() => {
        expect(screen.getByText('3 repositories')).toBeInTheDocument()
      })
    })

    it('[P1] should display singular "repository" for a single result', async () => {
      // Given: fetchRepositories returns 1 repository
      const mockRepos = createRepositories(1)
      vi.mocked(fetchRepositories).mockResolvedValue(mockRepos)

      // When: The Home page is rendered
      renderHome()

      // Then: Should show singular "repository" text
      await waitFor(() => {
        expect(screen.getByText('1 repository')).toBeInTheDocument()
      })
    })

    it('[P1] should render each repository as an article element', async () => {
      // Given: fetchRepositories returns repositories
      const mockRepos = createRepositories(3)
      vi.mocked(fetchRepositories).mockResolvedValue(mockRepos)

      // When: The Home page is rendered
      renderHome()

      // Then: Each repository should be rendered as an <article> element
      await waitFor(() => {
        const articles = screen.getAllByRole('article')
        expect(articles).toHaveLength(3)
      })
    })

    it('[P1] should display "No description" for repositories without descriptions', async () => {
      // Given: A repository with an empty description
      const repoNoDesc = createRepository({ description: '' })
      vi.mocked(fetchRepositories).mockResolvedValue([repoNoDesc])

      // When: The Home page is rendered
      renderHome()

      // Then: Should show "No description" placeholder text
      await waitFor(() => {
        expect(screen.getByText('No description')).toBeInTheDocument()
      })
    })

    it('[P1] should display topic tags on repository cards', async () => {
      // Given: A repository with specific topics
      const repoWithTopics = createRepository({
        topics: ['nostr', 'git', 'decentralized'],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repoWithTopics])

      // When: The Home page is rendered
      renderHome()

      // Then: Should show the topic tags
      await waitFor(() => {
        expect(screen.getByText('nostr')).toBeInTheDocument()
        expect(screen.getByText('git')).toBeInTheDocument()
        expect(screen.getByText('decentralized')).toBeInTheDocument()
      })
    })

    it('[P2] should truncate topics display to 4 with overflow indicator', async () => {
      // Given: A repository with more than 4 topics
      const repoManyTopics = createRepository({
        topics: ['topic-1', 'topic-2', 'topic-3', 'topic-4', 'topic-5', 'topic-6'],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repoManyTopics])

      // When: The Home page is rendered
      renderHome()

      // Then: Should show first 4 topics and a "+2" overflow indicator
      await waitFor(() => {
        expect(screen.getByText('topic-1')).toBeInTheDocument()
        expect(screen.getByText('topic-4')).toBeInTheDocument()
        expect(screen.getByText('+2')).toBeInTheDocument()
      })
      // The 5th and 6th topics should not be rendered
      expect(screen.queryByText('topic-5')).not.toBeInTheDocument()
      expect(screen.queryByText('topic-6')).not.toBeInTheDocument()
    })

    // AT-2.1.14: Component-level deduplication integration
    it('[P1] should display deduplicated repositories (dedup via hook select)', async () => {
      // Given: fetchRepositories returns duplicate repos (same id from different relays)
      const repo1 = createRepository({ id: 'dup-repo', name: 'Dup Repo Old', createdAt: 1000 })
      const repo2 = createRepository({ id: 'dup-repo', name: 'Dup Repo New', createdAt: 2000 })
      const repo3 = createRepository({ id: 'unique-repo', name: 'Unique Repo', createdAt: 1500 })
      vi.mocked(fetchRepositories).mockResolvedValue([repo1, repo2, repo3])

      // When: The Home page is rendered
      renderHome()

      // Then: Should display only 2 unique repositories (deduplication via select)
      await waitFor(() => {
        expect(screen.getByText('Dup Repo New')).toBeInTheDocument()
        expect(screen.getByText('Unique Repo')).toBeInTheDocument()
      })
      // The count should reflect deduplicated total
      expect(screen.getByText('2 repositories')).toBeInTheDocument()
    })

    it('[P2] should not show repository count when there are no repositories', async () => {
      // Given: fetchRepositories returns an empty array
      vi.mocked(fetchRepositories).mockResolvedValue([])

      // When: The Home page is rendered
      renderHome()

      // Then: Should not show a "0 repositories" count
      await waitFor(() => {
        expect(screen.getByText(/no repositories found/i)).toBeInTheDocument()
      })
      expect(screen.queryByText(/0 repositor/i)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('[P1] should have a page heading (h1) with "Repositories" text', async () => {
      // Given: fetchRepositories returns empty (state does not matter for heading)
      vi.mocked(fetchRepositories).mockResolvedValue([])

      // When: The Home page is rendered
      renderHome()

      // Then: Should have an h1 heading with the correct text
      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()
        expect(heading).toHaveTextContent('Repositories')
      })
    })

    it('[P1] should not render a <main> element (AppLayout already provides one)', async () => {
      // Given: Any state
      vi.mocked(fetchRepositories).mockResolvedValue([])

      // When: The Home page is rendered
      const { container } = renderHome()

      // Then: Should NOT contain a <main> element (avoid duplicate landmarks)
      await waitFor(() => {
        const mainElements = container.querySelectorAll('main')
        expect(mainElements).toHaveLength(0)
      })
    })

    it('[P1] should use <section> as the top-level wrapper', async () => {
      // Given: Any state
      vi.mocked(fetchRepositories).mockResolvedValue([])

      // When: The Home page is rendered
      const { container } = renderHome()

      // Then: The first child should be a <section> element (not <main> or <div>)
      await waitFor(() => {
        const sectionElements = container.querySelectorAll('section')
        expect(sectionElements.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('[P1] should render repository names as h2 headings for proper hierarchy', async () => {
      // Given: fetchRepositories returns repositories
      const mockRepos = createRepositories(2)
      vi.mocked(fetchRepositories).mockResolvedValue(mockRepos)

      // When: The Home page is rendered
      renderHome()

      // Then: Repository names should be rendered as h2 elements (under h1 "Repositories")
      await waitFor(() => {
        const h2Headings = screen.getAllByRole('heading', { level: 2 })
        expect(h2Headings.length).toBe(2)
        expect(h2Headings[0]).toHaveTextContent('Repository 1')
        expect(h2Headings[1]).toHaveTextContent('Repository 2')
      })
    })
  })

  describe('Search and Filtering (Story 2.3)', () => {
    // AT-2.3.09: Search input has aria-label="Search repositories"
    it('[P1] should render search input with correct aria-label when data is loaded', async () => {
      // Given: fetchRepositories returns repositories
      vi.mocked(fetchRepositories).mockResolvedValue(createRepositories(3))

      // When: The Home page is rendered
      renderHome()

      // Then: Search input should be rendered with correct aria-label
      await waitFor(() => {
        const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
        expect(searchInput).toBeInTheDocument()
      })
    })

    // AT-2.3.01: Repository list filters in real-time as user types
    // AT-2.3.02: Filtering is case-insensitive
    // AT-2.3.03: Filtering matches partial strings
    it('[P0] should filter repositories by name (case-insensitive, partial match)', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // Given: Repositories with distinct names
      vi.mocked(fetchRepositories).mockResolvedValue([
        createRepository({ name: 'Bitcoin Core' }),
        createRepository({ name: 'Nostr Tools' }),
        createRepository({ name: 'bitkey-wallet' }),
      ])

      renderHome()

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      })

      // When: User types a partial, case-insensitive search term
      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'bit')

      // Advance past debounce
      act(() => { vi.advanceTimersByTime(300) })

      // Then: Only matching repos should be visible
      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
        expect(screen.getByText('bitkey-wallet')).toBeInTheDocument()
        expect(screen.queryByText('Nostr Tools')).not.toBeInTheDocument()
      })
    })

    // AT-2.3.04: Shows "Showing X of Y repositories" count
    it('[P1] should display "Showing X of Y repositories" when search is active', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      vi.mocked(fetchRepositories).mockResolvedValue([
        createRepository({ name: 'Bitcoin Core' }),
        createRepository({ name: 'Nostr Tools' }),
        createRepository({ name: 'Lightning Node' }),
      ])

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('3 repositories')).toBeInTheDocument()
      })

      // When: User searches
      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'bitcoin')

      act(() => { vi.advanceTimersByTime(300) })

      // Then: Count should show filtered/total
      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 3 repositories')).toBeInTheDocument()
      })
    })

    // AT-2.3.05: "Clear search" button (X icon) appears when search has text
    it('[P1] should show clear button when search has text and hide when empty', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      vi.mocked(fetchRepositories).mockResolvedValue(createRepositories(2))

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Repository 1')).toBeInTheDocument()
      })

      // Initially: no clear button
      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()

      // When: User types
      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'test')

      // Then: Clear button appears
      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument()

      // When: User clears input manually
      await user.clear(searchInput)

      // Then: Clear button disappears
      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()
    })

    // AT-2.3.06: Clicking "Clear search" resets the list
    it('[P0] should reset search and restore full list when clear button is clicked', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      vi.mocked(fetchRepositories).mockResolvedValue([
        createRepository({ name: 'Bitcoin Core' }),
        createRepository({ name: 'Nostr Tools' }),
      ])

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      })

      // Type to filter
      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'bitcoin')

      act(() => { vi.advanceTimersByTime(300) })

      await waitFor(() => {
        expect(screen.queryByText('Nostr Tools')).not.toBeInTheDocument()
      })

      // When: Click clear button
      const clearButton = screen.getByRole('button', { name: /clear search/i })
      await user.click(clearButton)

      // Then: Full list restored, input cleared
      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
        expect(screen.getByText('Nostr Tools')).toBeInTheDocument()
      })
      expect(searchInput).toHaveValue('')
    })

    // AT-2.3.07: Empty state when no repos match
    it('[P0] should show "No repositories found matching \'[term]\'" when no results match', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      vi.mocked(fetchRepositories).mockResolvedValue([
        createRepository({ name: 'Bitcoin Core' }),
        createRepository({ name: 'Nostr Tools' }),
      ])

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      })

      // When: User searches for something that matches nothing
      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'zzzznonexistent')

      act(() => { vi.advanceTimersByTime(300) })

      // Then: Empty state with search term is displayed
      await waitFor(() => {
        expect(screen.getByText(/no repositories found matching 'zzzznonexistent'/i)).toBeInTheDocument()
      })
    })

    // AT-2.3.08: Empty state includes "Clear search" button
    it('[P1] should show "Clear search" button in search empty state that resets', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      vi.mocked(fetchRepositories).mockResolvedValue([
        createRepository({ name: 'Bitcoin Core' }),
      ])

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      })

      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'nomatch')

      act(() => { vi.advanceTimersByTime(300) })

      await waitFor(() => {
        expect(screen.getByText(/no repositories found matching/i)).toBeInTheDocument()
      })

      // When: Click the "Clear search" button in the empty state
      // Note: There are two "Clear search" buttons -- the X icon in the input area
      // and the text button in the empty state. Get all and click the one with text content.
      const clearSearchButtons = screen.getAllByRole('button', { name: /clear search/i })
      const emptyStateClearButton = clearSearchButtons.find(btn => btn.textContent === 'Clear search')!
      await user.click(emptyStateClearButton)

      // Then: Full list restored
      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      })
      expect(searchInput).toHaveValue('')
    })

    // AT-2.3.11: Keyboard shortcut "/" focuses the search input
    it('[P1] should focus search input when "/" is pressed', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      vi.mocked(fetchRepositories).mockResolvedValue(createRepositories(2))

      renderHome()
      await waitFor(() => {
        expect(screen.getByText('Repository 1')).toBeInTheDocument()
      })

      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      expect(searchInput).not.toHaveFocus()

      // When: Press "/" on document (focus is on body, not an input)
      await user.keyboard('/')

      // Then: Search input should be focused
      expect(searchInput).toHaveFocus()
    })

    // AT-2.3.12: "/" inside the search input types the character (no re-focus loop)
    it('[P1] should type "/" character normally when search input is already focused', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      vi.mocked(fetchRepositories).mockResolvedValue(createRepositories(2))

      renderHome()
      await waitFor(() => {
        expect(screen.getByText('Repository 1')).toBeInTheDocument()
      })

      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })

      // When: Focus the input first, then type "/"
      await user.click(searchInput)
      await user.type(searchInput, 'test/')

      // Then: The "/" should be typed into the input
      expect(searchInput).toHaveValue('test/')
    })

    // AT-2.3.14: Debounce delay (300ms) prevents excessive filtering
    it('[P0] should debounce filtering by 300ms', async () => {
      // Phase 1: Render with real timers to let React Query resolve
      vi.mocked(fetchRepositories).mockResolvedValue([
        createRepository({ name: 'Bitcoin Core' }),
        createRepository({ name: 'Nostr Tools' }),
      ])

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      })

      // Phase 2: Install fake timers to control debounce timing
      vi.useFakeTimers()

      // When: Simulate typing directly via fireEvent (avoids userEvent timer conflicts with fake timers)
      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      fireEvent.change(searchInput, { target: { value: 'bitcoin' } })

      // Before debounce: both repos still visible (filtering not applied yet)
      expect(screen.getByText('Nostr Tools')).toBeInTheDocument()

      // Advance past debounce
      act(() => { vi.advanceTimersByTime(300) })

      // After debounce: only matching repo visible
      expect(screen.queryByText('Nostr Tools')).not.toBeInTheDocument()
      expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
    })

    // AC #9: Search input NOT rendered during loading state
    it('[P1] should NOT render search input during loading state', () => {
      // Given: fetchRepositories returns a promise that never resolves
      vi.mocked(fetchRepositories).mockReturnValue(new Promise(() => {}))

      // When: The Home page is rendered
      renderHome()

      // Then: Search input should not be present
      expect(screen.queryByRole('searchbox', { name: /search repositories/i })).not.toBeInTheDocument()
    })

    // AC #9: Search input NOT rendered when data is empty
    it('[P1] should NOT render search input when data is empty', async () => {
      // Given: fetchRepositories returns an empty array
      vi.mocked(fetchRepositories).mockResolvedValue([])

      // When: The Home page is rendered
      renderHome()

      // Then: Search input should not be present
      await waitFor(() => {
        expect(screen.getByText(/no repositories found/i)).toBeInTheDocument()
      })
      expect(screen.queryByRole('searchbox', { name: /search repositories/i })).not.toBeInTheDocument()
    })

    // AT-2.3.10: Search input has visible focus indicator
    it('[P1] should have visible focus indicator classes on the search input', async () => {
      // Given: fetchRepositories returns repositories
      vi.mocked(fetchRepositories).mockResolvedValue(createRepositories(2))

      // When: The Home page is rendered
      renderHome()

      // Then: The search input should have focus-visible ring classes (satisfies NFR-A3)
      await waitFor(() => {
        const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
        expect(searchInput).toHaveClass('focus-visible:ring-[3px]')
      })
    })

    // AC #1: Label element associated with search input via htmlFor/id
    it('[P1] should have a label element associated with the search input via htmlFor/id', async () => {
      // Given: fetchRepositories returns repositories
      vi.mocked(fetchRepositories).mockResolvedValue(createRepositories(2))

      // When: The Home page is rendered
      const { container } = renderHome()

      // Then: A label with htmlFor="repo-search" should exist and the input should have matching id
      await waitFor(() => {
        const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
        expect(searchInput).toHaveAttribute('id', 'repo-search')
      })
      const label = container.querySelector('label[for="repo-search"]')
      expect(label).toBeInTheDocument()
      expect(label).toHaveTextContent('Search repositories')
    })

    // AC #1: Search input is wrapped in a search landmark for screen reader navigation
    it('[P1] should wrap search input in a search landmark element', async () => {
      // Given: fetchRepositories returns repositories
      vi.mocked(fetchRepositories).mockResolvedValue(createRepositories(2))

      // When: The Home page is rendered
      renderHome()

      // Then: A search landmark should exist wrapping the search input
      await waitFor(() => {
        const searchLandmark = screen.getByRole('search')
        expect(searchLandmark).toBeInTheDocument()
        // The search input should be inside the search landmark
        const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
        expect(searchLandmark).toContainElement(searchInput)
      })
    })

    // AC #1: Input has type="search" for mobile keyboard optimization
    it('[P1] should have type="search" on the search input for mobile keyboard optimization', async () => {
      // Given: fetchRepositories returns repositories
      vi.mocked(fetchRepositories).mockResolvedValue(createRepositories(2))

      // When: The Home page is rendered
      renderHome()

      // Then: The search input should have type="search"
      await waitFor(() => {
        const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
        expect(searchInput).toHaveAttribute('type', 'search')
      })
    })

    // AC #5: Clear button has minimum 44x44px touch target
    it('[P1] should have minimum 44x44px touch target on clear button', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // Given: fetchRepositories returns repositories
      vi.mocked(fetchRepositories).mockResolvedValue(createRepositories(2))

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Repository 1')).toBeInTheDocument()
      })

      // When: User types to reveal the clear button
      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'test')

      // Then: Clear button should have minimum touch target classes
      const clearButton = screen.getByRole('button', { name: /clear search/i })
      expect(clearButton).toHaveClass('min-h-[44px]')
      expect(clearButton).toHaveClass('min-w-[44px]')
    })

    // AC #8 guard: "/" keyboard shortcut should NOT fire when another input element is focused
    it('[P1] should NOT focus search input when "/" is pressed inside another input', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      vi.mocked(fetchRepositories).mockResolvedValue(createRepositories(2))

      // Render with an additional input element in the DOM
      const queryClient = createTestQueryClient()
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <input data-testid="other-input" type="text" />
            {children}
          </MemoryRouter>
        </QueryClientProvider>
      )
      render(<Home />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('Repository 1')).toBeInTheDocument()
      })

      // When: Another input is focused and "/" is pressed
      const otherInput = screen.getByTestId('other-input')
      await user.click(otherInput)
      expect(otherInput).toHaveFocus()
      await user.keyboard('/')

      // Then: The search input should NOT have gained focus (the "/" typed into other input)
      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      expect(searchInput).not.toHaveFocus()
      expect(otherInput).toHaveFocus()
    })

    // AC #9: "/" keyboard shortcut has no effect when search input ref is null (loading state)
    it('[P1] should not throw when "/" is pressed during loading state (no search input)', () => {
      // Given: fetchRepositories returns a promise that never resolves (loading state)
      vi.mocked(fetchRepositories).mockReturnValue(new Promise(() => {}))

      renderHome()

      // Verify we're in loading state
      expect(screen.getByRole('status', { name: 'Loading repositories' })).toBeInTheDocument()
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()

      // When: "/" is pressed on document during loading state
      // Then: No error should be thrown (handler gracefully handles null ref)
      expect(() => {
        fireEvent.keyDown(document, { key: '/' })
      }).not.toThrow()
    })

    // AT-2.3.15: Search term is lost on navigation (documents known limitation)
    it('[P2] should lose search term when component unmounts and remounts', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      vi.mocked(fetchRepositories).mockResolvedValue([
        createRepository({ name: 'Bitcoin Core' }),
        createRepository({ name: 'Nostr Tools' }),
      ])

      const { unmount } = renderHome()

      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      })

      // When: User enters a search term
      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'bitcoin')

      act(() => { vi.advanceTimersByTime(300) })

      await waitFor(() => {
        expect(screen.queryByText('Nostr Tools')).not.toBeInTheDocument()
      })

      // When: Component unmounts (simulating navigation away)
      unmount()

      // And: Component remounts (simulating navigation back)
      renderHome()

      // Then: Search term should be lost (known limitation -- state is local, not persisted)
      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
        expect(screen.getByText('Nostr Tools')).toBeInTheDocument()
      })
      const newSearchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      expect(newSearchInput).toHaveValue('')
    })

    // AC #4: Count reverts to "N repositories" after clearing search
    it('[P1] should revert count to "N repositories" after clearing search', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      vi.mocked(fetchRepositories).mockResolvedValue([
        createRepository({ name: 'Bitcoin Core' }),
        createRepository({ name: 'Nostr Tools' }),
      ])

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('2 repositories')).toBeInTheDocument()
      })

      // When: User searches to trigger "Showing X of Y" count
      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'bitcoin')

      act(() => { vi.advanceTimersByTime(300) })

      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 2 repositories')).toBeInTheDocument()
      })

      // When: User clears the search
      const clearButton = screen.getByRole('button', { name: /clear search/i })
      await user.click(clearButton)

      // Then: Count should revert to normal format
      await waitFor(() => {
        expect(screen.getByText('2 repositories')).toBeInTheDocument()
      })
      expect(screen.queryByText(/showing/i)).not.toBeInTheDocument()
    })

    // AC #3: Filtering matches ONLY on name field, not description or other fields
    it('[P1] should filter only on repository name, not description', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // Given: A repo whose description contains "wallet" but name does not
      vi.mocked(fetchRepositories).mockResolvedValue([
        createRepository({ name: 'Bitcoin Core', description: 'A wallet implementation' }),
        createRepository({ name: 'Nostr Tools', description: 'Protocol utilities' }),
      ])

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      })

      // When: User searches for "wallet" (exists in description but not in any name)
      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'wallet')

      act(() => { vi.advanceTimersByTime(300) })

      // Then: No repos should match because filtering is name-only
      await waitFor(() => {
        expect(screen.getByText(/no repositories found matching 'wallet'/i)).toBeInTheDocument()
      })
      expect(screen.queryByText('Bitcoin Core')).not.toBeInTheDocument()
      expect(screen.queryByText('Nostr Tools')).not.toBeInTheDocument()
    })

    // Edge case: Typing and deleting restores full list after debounce settles
    it('[P1] should restore full list when search term is typed and then deleted', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      vi.mocked(fetchRepositories).mockResolvedValue([
        createRepository({ name: 'Bitcoin Core' }),
        createRepository({ name: 'Nostr Tools' }),
      ])

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      })

      // When: User types a search term
      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'bitcoin')

      act(() => { vi.advanceTimersByTime(300) })

      await waitFor(() => {
        expect(screen.queryByText('Nostr Tools')).not.toBeInTheDocument()
      })

      // When: User clears the input by selecting all and deleting
      await user.clear(searchInput)

      act(() => { vi.advanceTimersByTime(300) })

      // Then: Full list should be restored
      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
        expect(screen.getByText('Nostr Tools')).toBeInTheDocument()
      })
      expect(screen.getByText('2 repositories')).toBeInTheDocument()
    })

    // AC #9: Search input NOT rendered during error state
    it('[P1] should NOT render search input during error state', async () => {
      // Given: fetchRepositories throws an error
      vi.mocked(fetchRepositories).mockRejectedValue({
        code: 'RELAY_TIMEOUT',
        message: 'Failed',
        userMessage: 'Unable to connect.',
      })

      // When: The Home page is rendered
      renderHome()

      // Then: Error state should be shown, search input should not be present
      await screen.findByRole('alert')
      expect(screen.queryByRole('searchbox', { name: /search repositories/i })).not.toBeInTheDocument()
    })
  })
})
