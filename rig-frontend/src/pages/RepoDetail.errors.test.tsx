/**
 * Tests for RepoDetail page component - Error States
 *
 * Story 2.4: Repository Detail Page
 *
 * Test coverage:
 * - Loading skeleton state with role="status"
 * - Error state with role="alert" and retry
 * - Not found state with home link
 * - README not available fallback
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import {
  createRepository,
  resetRepositoryCounter,
} from '@/test-utils/factories/repository'
import {
  createRelayResult,
  createRelayQueryMeta,
} from '@/test-utils/factories/relay-status'

// Mock the nostr service layer
vi.mock('@/lib/nostr', () => ({
  fetchRepositories: vi.fn(),
  fetchRepositoriesWithMeta: vi.fn(),
}))

// Mock react-syntax-highlighter to avoid heavy rendering in tests
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children, language }: { children: string; language: string }) => (
    <pre data-testid="syntax-highlighter" data-language={language}>
      <code>{children}</code>
    </pre>
  ),
}))

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
}))

const { fetchRepositoriesWithMeta } = await import('@/lib/nostr')
const { Component } = await import('./RepoDetail')

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, retryDelay: 0 },
    },
  })
}

/** Helper to wrap repositories in the fetchRepositoriesWithMeta response format */
function createMetaResponse(repos: ReturnType<typeof createRepository>[]) {
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

function renderRepoDetail(owner = 'test-owner', repo = 'test-repo') {
  const queryClient = createTestQueryClient()
  const router = createMemoryRouter(
    [
      { path: '/:owner/:repo', element: <Component /> },
      { path: '/', element: <div>Home Page</div> },
    ],
    { initialEntries: [`/${owner}/${repo}`] }
  )

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    ),
    queryClient,
    router,
  }
}

describe('RepoDetail Page - Error States', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRepositoryCounter()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('Loading State (AC #7)', () => {
    // AT-2.4.15: Loading state skeleton
    it('should display loading skeleton with role="status" and aria-label while fetching', () => {
      vi.mocked(fetchRepositoriesWithMeta).mockReturnValue(new Promise(() => {}))

      renderRepoDetail()

      const loadingElement = screen.getByRole('status')
      expect(loadingElement).toBeInTheDocument()
      expect(loadingElement).toHaveAttribute(
        'aria-label',
        'Loading repository details'
      )
    })
  })

  describe('Error State (AC #9)', () => {
    // AT-2.4.16: Error state with role="alert" and retry
    it('should display error with role="alert" when fetch fails with RigError', async () => {
      const rigError = {
        code: 'RELAY_TIMEOUT' as const,
        message: 'Relay query failed',
        userMessage: 'Unable to connect to Nostr relays. Please try again.',
      }
      vi.mocked(fetchRepositoriesWithMeta).mockRejectedValue(rigError)

      renderRepoDetail()

      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toBeInTheDocument()
      expect(alertElement).toHaveTextContent(
        'Unable to connect to Nostr relays. Please try again.'
      )
    })

    it('should display fallback error message for non-RigError', async () => {
      vi.mocked(fetchRepositoriesWithMeta).mockRejectedValue(
        new Error('Network failure')
      )

      renderRepoDetail()

      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toHaveTextContent('Something went wrong.')
    })

    it('should display "Try Again" button that calls refetch', async () => {
      const user = userEvent.setup()
      const mockRepos = [
        createRepository({ id: 'test-repo', owner: 'test-owner' }),
      ]
      vi.mocked(fetchRepositoriesWithMeta)
        .mockRejectedValueOnce({
          code: 'RELAY_TIMEOUT',
          message: 'Failed',
          userMessage: 'Unable to connect.',
        })
        .mockResolvedValueOnce(createMetaResponse(mockRepos))

      // Mock fetch for README
      vi.mocked(fetch).mockResolvedValue(
        new Response('# README', { status: 200 })
      )

      renderRepoDetail()

      const retryButton = await screen.findByRole('button', {
        name: /try again/i,
      })
      expect(retryButton).toBeInTheDocument()

      await user.click(retryButton)

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })
      expect(fetchRepositoriesWithMeta).toHaveBeenCalledTimes(2)
    })
  })

  describe('Not Found State (AC #8)', () => {
    it('should display "Repository not found" when repo is null', async () => {
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([]))

      renderRepoDetail('nonexistent-owner', 'nonexistent-repo')

      await waitFor(() => {
        expect(screen.getByText('Repository not found')).toBeInTheDocument()
      })
    })

    it('should display link back to home page when not found', async () => {
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([]))

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('Repository not found')).toBeInTheDocument()
      })

      const homeLink = screen.getByText('Back to repositories')
      expect(homeLink.closest('a')).toHaveAttribute('href', '/')
    })
  })

  describe('README Not Available (AC #10)', () => {
    // AT-2.4.17: README not available fallback
    it('should show "README not available" when fetch fails', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: ['https://example.ar-io.dev'],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))
      vi.mocked(fetch).mockResolvedValue(
        new Response(null, { status: 404 })
      )

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('README not available')).toBeInTheDocument()
      })
    })

    it('should show "README not available" when no webUrls exist', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: [],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('README not available')).toBeInTheDocument()
      })
    })

    it('should still display repository metadata when README is not available', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        name: 'My Repo',
        webUrls: [],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toHaveTextContent('My Repo')
      })
      expect(screen.getByText('README not available')).toBeInTheDocument()
    })
  })
})
