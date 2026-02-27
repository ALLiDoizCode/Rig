/**
 * Tests for Home page component
 *
 * Story 2.1: Repository List Page with Nostr Query
 * Story 2.3: Client-Side Search and Filtering
 * Story 2.5: Relay Status Indicators (relay metadata passed to RepoCard)
 * Story 2.6: Real-Time Repository Updates (integration tests AT-2.6.04, AT-2.6.08)
 *
 * Test coverage:
 * - Loading skeleton state (AC #4)
 * - Error state with retry (AC #5)
 * - Empty state (AC #6)
 * - Populated grid layout (AC #2)
 * - Accessibility attributes (ARIA roles, landmarks)
 * - Search and filtering (Story 2.3: AC #1-#10)
 * - Relay metadata passed to RepoCard (Story 2.5)
 * - Real-time updates integration (Story 2.6: AT-2.6.04, AT-2.6.08)
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
import {
  createRelayResult,
  createRelayQueryMeta,
} from '@/test-utils/factories/relay-status'
import { repositoryKeys } from '@/lib/query-client'

// Mock the nostr service layer at the service boundary
vi.mock('@/lib/nostr', () => ({
  fetchRepositories: vi.fn(),
  fetchRepositoriesWithMeta: vi.fn(),
  subscribeToRepositories: vi.fn(() => ({ close: vi.fn() })),
}))

// Mock useRealtimeRepositories to prevent subscription side effects in existing tests
vi.mock('@/features/repository/hooks/useRealtimeRepositories', () => ({
  useRealtimeRepositories: vi.fn(),
}))

const { fetchRepositoriesWithMeta } = await import('@/lib/nostr')
const { useRealtimeRepositories } = await import('@/features/repository/hooks/useRealtimeRepositories')
const { Component: Home } = await import('./Home')

/** Helper to create a mock return value for fetchRepositoriesWithMeta */
function createMetaResponse(repos: ReturnType<typeof createRepositories>) {
  const meta = createRelayQueryMeta({
    results: [
      createRelayResult({ url: 'wss://relay.damus.io' }),
      createRelayResult({ url: 'wss://nos.lol' }),
    ],
    respondedCount: 2,
    totalCount: 2,
  })
  return { repositories: repos, meta }
}

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
      // Given: fetchRepositoriesWithMeta returns a promise that never resolves (stays pending)
      vi.mocked(fetchRepositoriesWithMeta).mockReturnValue(new Promise(() => {}))

      // When: The Home page is rendered
      renderHome()

      // Then: Should show a loading skeleton with proper accessibility
      const loadingElement = screen.getByRole('status')
      expect(loadingElement).toBeInTheDocument()
      expect(loadingElement).toHaveAttribute('aria-label', 'Loading repositories')
    })

    it('[P1] should display 6 skeleton cards in the loading grid', () => {
      // Given: Data is pending
      vi.mocked(fetchRepositoriesWithMeta).mockReturnValue(new Promise(() => {}))

      // When: The Home page is rendered
      renderHome()

      // Then: Should show 6 skeleton card placeholders
      const skeletonContainer = screen.getByRole('status')
      expect(skeletonContainer).toBeInTheDocument()
      const gridElement = skeletonContainer.querySelector('.grid')
      expect(gridElement).toBeInTheDocument()
      expect(gridElement?.children).toHaveLength(6)
    })

    it('[P1] should render skeleton grid with responsive classes (AC #2 + #4)', () => {
      // Given: Data is pending
      vi.mocked(fetchRepositoriesWithMeta).mockReturnValue(new Promise(() => {}))

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
      // Given: fetchRepositoriesWithMeta resolves with data
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse(createRepositories(2))
      )

      // When: The Home page is rendered
      renderHome()

      // Then: Loading skeleton should disappear after data arrives
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
      // Given: fetchRepositoriesWithMeta throws a RigError
      const rigError = {
        code: 'RELAY_TIMEOUT' as const,
        message: 'Relay query failed: Timeout',
        userMessage: 'Unable to connect to Nostr relays. Please try again.',
        context: {},
      }
      vi.mocked(fetchRepositoriesWithMeta).mockRejectedValue(rigError)

      // When: The Home page is rendered
      renderHome()

      // Then: Should show the user-friendly error message with role="alert"
      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toBeInTheDocument()
      expect(alertElement).toHaveTextContent('Unable to connect to Nostr relays. Please try again.')
    })

    it('[P0] should display a "Try Again" button when query fails', async () => {
      // Given: fetchRepositoriesWithMeta throws an error
      vi.mocked(fetchRepositoriesWithMeta).mockRejectedValue({
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
      vi.mocked(fetchRepositoriesWithMeta)
        .mockRejectedValueOnce({
          code: 'RELAY_TIMEOUT',
          message: 'Failed',
          userMessage: 'Unable to connect to Nostr relays. Please try again.',
        })
        .mockResolvedValueOnce(createMetaResponse(mockRepos))

      // When: The Home page is rendered and error is shown
      renderHome()

      const retryButton = await screen.findByRole('button', { name: /try again/i })

      // When: User clicks "Try Again"
      await user.click(retryButton)

      // Then: Should refetch and show repositories
      await waitFor(() => {
        expect(screen.getByText('Repository 1')).toBeInTheDocument()
      })
      expect(fetchRepositoriesWithMeta).toHaveBeenCalledTimes(2)
    })

    it('[P1] should handle generic Error objects (non-RigError) gracefully', async () => {
      // Given: fetchRepositoriesWithMeta throws a generic Error (not RigError)
      vi.mocked(fetchRepositoriesWithMeta).mockRejectedValue(new Error('Network failure'))

      // When: The Home page is rendered
      renderHome()

      // Then: Should show a fallback error message
      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toBeInTheDocument()
      expect(alertElement).toHaveTextContent('Something went wrong.')
    })

    it('[P2] should display different RigError user messages correctly', async () => {
      // Given: fetchRepositoriesWithMeta throws a VALIDATION_FAILED RigError
      vi.mocked(fetchRepositoriesWithMeta).mockRejectedValue({
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
      // Given: fetchRepositoriesWithMeta throws an error
      vi.mocked(fetchRepositoriesWithMeta).mockRejectedValue({
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
      // Given: fetchRepositoriesWithMeta returns an empty array
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([]))

      // When: The Home page is rendered
      renderHome()

      // Then: Should show the empty state message
      await waitFor(() => {
        expect(screen.getByText(/no repositories found/i)).toBeInTheDocument()
      })
    })

    it('[P2] should display informative sub-message in empty state', async () => {
      // Given: fetchRepositoriesWithMeta returns an empty array
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([]))

      // When: The Home page is rendered
      renderHome()

      // Then: Should show informative sub-message about Nostr announcements
      await waitFor(() => {
        expect(screen.getByText(/nostr will appear here/i)).toBeInTheDocument()
      })
    })

    it('[P1] should not display loading skeleton in empty state', async () => {
      // Given: fetchRepositoriesWithMeta returns an empty array
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([]))

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
      // Given: fetchRepositoriesWithMeta returns 3 repositories
      const mockRepos = createRepositories(3)
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse(mockRepos))

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
      // Given: fetchRepositoriesWithMeta returns repositories with descriptions
      const mockRepos = createRepositories(2)
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse(mockRepos))

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
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse([repoShortPubkey])
      )

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
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse([repoLongPubkey])
      )

      // When: The Home page is rendered
      renderHome()

      // Then: Should show truncated pubkey: first 8 chars + "..." + last 8 chars
      await waitFor(() => {
        expect(screen.getByText('abcdef12...34567890')).toBeInTheDocument()
      })
    })

    it('[P1] should render a responsive grid container', async () => {
      // Given: fetchRepositoriesWithMeta returns repositories
      const mockRepos = createRepositories(3)
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse(mockRepos))

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
      // Given: fetchRepositoriesWithMeta returns 3 repositories
      const mockRepos = createRepositories(3)
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse(mockRepos))

      // When: The Home page is rendered
      renderHome()

      // Then: Should show the repository count text
      await waitFor(() => {
        expect(screen.getByText('3 repositories')).toBeInTheDocument()
      })
    })

    it('[P1] should display singular "repository" for a single result', async () => {
      // Given: fetchRepositoriesWithMeta returns 1 repository
      const mockRepos = createRepositories(1)
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse(mockRepos))

      // When: The Home page is rendered
      renderHome()

      // Then: Should show singular "repository" text
      await waitFor(() => {
        expect(screen.getByText('1 repository')).toBeInTheDocument()
      })
    })

    it('[P1] should render each repository as an article element', async () => {
      // Given: fetchRepositoriesWithMeta returns repositories
      const mockRepos = createRepositories(3)
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse(mockRepos))

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
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse([repoNoDesc])
      )

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
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse([repoWithTopics])
      )

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
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse([repoManyTopics])
      )

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
      // Given: fetchRepositoriesWithMeta returns duplicate repos (same id from different relays)
      const repo1 = createRepository({ id: 'dup-repo', name: 'Dup Repo Old', createdAt: 1000 })
      const repo2 = createRepository({ id: 'dup-repo', name: 'Dup Repo New', createdAt: 2000 })
      const repo3 = createRepository({ id: 'unique-repo', name: 'Unique Repo', createdAt: 1500 })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse([repo1, repo2, repo3])
      )

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
      // Given: fetchRepositoriesWithMeta returns an empty array
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([]))

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
      // Given: fetchRepositoriesWithMeta returns empty (state does not matter for heading)
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([]))

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
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([]))

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
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([]))

      // When: The Home page is rendered
      const { container } = renderHome()

      // Then: The first child should be a <section> element (not <main> or <div>)
      await waitFor(() => {
        const sectionElements = container.querySelectorAll('section')
        expect(sectionElements.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('[P1] should render repository names as h2 headings for proper hierarchy', async () => {
      // Given: fetchRepositoriesWithMeta returns repositories
      const mockRepos = createRepositories(2)
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse(mockRepos))

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
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse(createRepositories(3))
      )

      renderHome()

      await waitFor(() => {
        const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
        expect(searchInput).toBeInTheDocument()
      })
    })

    // AT-2.3.01: Repository list filters in real-time as user types
    it('[P0] should filter repositories by name (case-insensitive, partial match)', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse([
          createRepository({ name: 'Bitcoin Core' }),
          createRepository({ name: 'Nostr Tools' }),
          createRepository({ name: 'bitkey-wallet' }),
        ])
      )

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      })

      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'bit')

      act(() => { vi.advanceTimersByTime(300) })

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

      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse([
          createRepository({ name: 'Bitcoin Core' }),
          createRepository({ name: 'Nostr Tools' }),
          createRepository({ name: 'Lightning Node' }),
        ])
      )

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('3 repositories')).toBeInTheDocument()
      })

      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'bitcoin')

      act(() => { vi.advanceTimersByTime(300) })

      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 3 repositories')).toBeInTheDocument()
      })
    })

    // AT-2.3.05: "Clear search" button (X icon) appears when search has text
    it('[P1] should show clear button when search has text and hide when empty', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse(createRepositories(2))
      )

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Repository 1')).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()

      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'test')

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument()

      await user.clear(searchInput)

      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()
    })

    // AT-2.3.06: Clicking "Clear search" resets the list
    it('[P0] should reset search and restore full list when clear button is clicked', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse([
          createRepository({ name: 'Bitcoin Core' }),
          createRepository({ name: 'Nostr Tools' }),
        ])
      )

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      })

      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'bitcoin')

      act(() => { vi.advanceTimersByTime(300) })

      await waitFor(() => {
        expect(screen.queryByText('Nostr Tools')).not.toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /clear search/i })
      await user.click(clearButton)

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

      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse([
          createRepository({ name: 'Bitcoin Core' }),
          createRepository({ name: 'Nostr Tools' }),
        ])
      )

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      })

      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      await user.type(searchInput, 'zzzznonexistent')

      act(() => { vi.advanceTimersByTime(300) })

      await waitFor(() => {
        expect(screen.getByText(/no repositories found matching 'zzzznonexistent'/i)).toBeInTheDocument()
      })
    })

    // AT-2.3.14: Debounce delay (300ms) prevents excessive filtering
    it('[P0] should debounce filtering by 300ms', async () => {
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse([
          createRepository({ name: 'Bitcoin Core' }),
          createRepository({ name: 'Nostr Tools' }),
        ])
      )

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      })

      vi.useFakeTimers()

      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      fireEvent.change(searchInput, { target: { value: 'bitcoin' } })

      // Before debounce: both repos still visible
      expect(screen.getByText('Nostr Tools')).toBeInTheDocument()

      act(() => { vi.advanceTimersByTime(300) })

      // After debounce: only matching repo visible
      expect(screen.queryByText('Nostr Tools')).not.toBeInTheDocument()
      expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
    })

    // AC #9: Search input NOT rendered during loading state
    it('[P1] should NOT render search input during loading state', () => {
      vi.mocked(fetchRepositoriesWithMeta).mockReturnValue(new Promise(() => {}))

      renderHome()

      expect(screen.queryByRole('searchbox', { name: /search repositories/i })).not.toBeInTheDocument()
    })

    // AC #9: Search input NOT rendered when data is empty
    it('[P1] should NOT render search input when data is empty', async () => {
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([]))

      renderHome()

      await waitFor(() => {
        expect(screen.getByText(/no repositories found/i)).toBeInTheDocument()
      })
      expect(screen.queryByRole('searchbox', { name: /search repositories/i })).not.toBeInTheDocument()
    })

    // AC #9: Search input NOT rendered during error state
    it('[P1] should NOT render search input during error state', async () => {
      vi.mocked(fetchRepositoriesWithMeta).mockRejectedValue({
        code: 'RELAY_TIMEOUT',
        message: 'Failed',
        userMessage: 'Unable to connect.',
      })

      renderHome()

      await screen.findByRole('alert')
      expect(screen.queryByRole('searchbox', { name: /search repositories/i })).not.toBeInTheDocument()
    })
  })

  describe('Relay Metadata Integration (Story 2.5)', () => {
    it('[P1] should pass relay metadata to RepoCard and render badge', async () => {
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse(createRepositories(1))
      )

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Repository 1')).toBeInTheDocument()
      })

      // RepoCard should display the relay badge from relayMeta
      expect(screen.getByText('Verified on 2 of 2 relays')).toBeInTheDocument()
    })
  })

  describe('Real-Time Repository Updates Integration (Story 2.6)', () => {
    // Verify useRealtimeRepositories hook is called when Home mounts (AC #4)
    it('should call useRealtimeRepositories hook on mount', async () => {
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse(createRepositories(1))
      )

      renderHome()

      await waitFor(() => {
        expect(screen.getByText('Repository 1')).toBeInTheDocument()
      })

      // The hook should have been called when the Home component mounted
      expect(useRealtimeRepositories).toHaveBeenCalled()
    })

    // AT-2.6.04: New repository appears in list automatically on new event
    //
    // Integration test: Simulates the effect of useRealtimeRepositories invalidating
    // the TanStack Query cache when a new event arrives. The useRealtimeRepositories
    // hook is mocked in this file (to prevent WebSocket side effects), so we simulate
    // the cache invalidation directly on the queryClient to verify the end-to-end
    // flow: cache invalidation -> refetch -> updated repo list in the DOM.
    it('[AT-2.6.04] should display new repository after cache invalidation triggers refetch', async () => {
      // Given: Initial load returns 2 repositories
      const initialRepos = [
        createRepository({ name: 'Repo Alpha' }),
        createRepository({ name: 'Repo Beta' }),
      ]
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse(initialRepos)
      )

      const { queryClient } = renderHome()

      // Wait for initial data to render
      await waitFor(() => {
        expect(screen.getByText('Repo Alpha')).toBeInTheDocument()
        expect(screen.getByText('Repo Beta')).toBeInTheDocument()
      })
      expect(screen.getByText('2 repositories')).toBeInTheDocument()

      // When: A new event arrives (simulated by updating mock and invalidating cache)
      // In production, useRealtimeRepositories calls:
      //   queryClient.invalidateQueries({ queryKey: repositoryKeys.all() })
      const updatedRepos = [
        ...initialRepos,
        createRepository({ name: 'Repo Gamma (New!)' }),
      ]
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse(updatedRepos)
      )

      // Simulate cache invalidation (what useRealtimeRepositories does on new event)
      await act(async () => {
        await queryClient.invalidateQueries({ queryKey: repositoryKeys.all() })
      })

      // Then: The new repository appears in the list without page refresh
      await waitFor(() => {
        expect(screen.getByText('Repo Gamma (New!)')).toBeInTheDocument()
      })
      expect(screen.getByText('Repo Alpha')).toBeInTheDocument()
      expect(screen.getByText('Repo Beta')).toBeInTheDocument()
      expect(screen.getByText('3 repositories')).toBeInTheDocument()
    })

    // AT-2.6.08: Real-time updates interact correctly with relay status
    //
    // Integration test: Verifies that when cache invalidation triggers a refetch,
    // the relay metadata is also updated (because fetchRepositoriesWithMeta returns
    // both repositories and relay metadata, and useRepositories writes metadata
    // to a separate cache key as a side effect).
    it('[AT-2.6.08] should update relay metadata when cache invalidation triggers refetch', async () => {
      // Given: Initial load returns 1 repo with 2-of-2 relay metadata
      const initialRepos = createRepositories(1)
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
        createMetaResponse(initialRepos)
      )

      const { queryClient } = renderHome()

      // Wait for initial data with relay badge
      await waitFor(() => {
        expect(screen.getByText('Repository 1')).toBeInTheDocument()
      })
      expect(screen.getByText('Verified on 2 of 2 relays')).toBeInTheDocument()

      // When: A refetch happens (triggered by real-time event cache invalidation)
      // with updated relay metadata (now 3 relays responded)
      // Keep the same repos to avoid ID collision concerns
      const updatedMeta = createRelayQueryMeta({
        results: [
          createRelayResult({ url: 'wss://relay.damus.io' }),
          createRelayResult({ url: 'wss://nos.lol' }),
          createRelayResult({ url: 'wss://relay.nostr.band' }),
        ],
        respondedCount: 3,
        totalCount: 3,
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue({
        repositories: initialRepos,
        meta: updatedMeta,
      })

      // Simulate cache invalidation (what useRealtimeRepositories does)
      await act(async () => {
        await queryClient.invalidateQueries({ queryKey: repositoryKeys.all() })
      })

      // Then: The relay metadata badge is updated to reflect new relay data
      // The refetch writes updated metadata to relayStatusKeys.all() cache,
      // which useRelayStatus observes passively, triggering a re-render
      await waitFor(() => {
        expect(screen.getByText('Verified on 3 of 3 relays')).toBeInTheDocument()
      })
    })
  })
})
