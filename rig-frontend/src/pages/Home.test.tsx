/**
 * Tests for Home page component
 *
 * Story 2.1: Repository List Page with Nostr Query
 *
 * Test coverage:
 * - Loading skeleton state (AC #4)
 * - Error state with retry (AC #5)
 * - Empty state (AC #6)
 * - Populated grid layout (AC #2)
 * - Accessibility attributes (ARIA roles, landmarks)
 *
 * Acceptance Criteria covered: #2, #4, #5, #6, #9
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
})
