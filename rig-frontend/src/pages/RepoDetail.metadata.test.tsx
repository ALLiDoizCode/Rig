/**
 * Tests for RepoDetail page component - Metadata Display
 *
 * Story 2.4: Repository Detail Page
 * Story 2.5: Relay Status Indicators
 *
 * Test coverage:
 * - Repository metadata display (name, description, maintainers, ArNS, topics, timestamp)
 * - ArNS URL copy functionality
 * - Deep linking via route params
 * - Graceful rendering with missing optional fields
 * - URL protocol validation (security)
 * - Relay status badge integration (AC #1, #3, #5)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
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

function renderRepoDetail(owner = 'test-owner', repo = 'test-repo', existingQueryClient?: QueryClient) {
  const queryClient = existingQueryClient ?? createTestQueryClient()
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

describe('RepoDetail Page - Metadata Display', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRepositoryCounter()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('Repository Metadata Display (AC #2)', () => {
    function setupSuccessfulRepo(overrides = {}) {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        name: 'My Awesome Repository',
        description: 'A detailed description of the repository that is not truncated at all.',
        maintainers: [
          'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        ],
        webUrls: ['https://example.ar-io.dev'],
        topics: ['nostr', 'arweave', 'decentralized'],
        createdAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        ...overrides,
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))
      vi.mocked(fetch).mockResolvedValue(
        new Response('# README content', { status: 200 })
      )
      return repo
    }

    // AT-2.4.01: Repository name as h1
    it('should display repository name as h1 heading', async () => {
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toHaveTextContent('My Awesome Repository')
      })
    })

    // AT-2.4.02: Full description (not truncated)
    it('should display full description without truncation', async () => {
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByText(
            'A detailed description of the repository that is not truncated at all.'
          )
        ).toBeInTheDocument()
      })
    })

    // AT-2.4.03: Maintainers with truncated npub
    it('should display all maintainers with truncated pubkeys', async () => {
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        // First maintainer: abcdef12...34567890
        expect(screen.getByText('abcdef12...34567890')).toBeInTheDocument()
        // Second maintainer: fedcba09...87654321
        expect(screen.getByText('fedcba09...87654321')).toBeInTheDocument()
      })
    })

    // AT-2.4.04: ArNS URL with copy
    it('should display ArNS URL with copy button', async () => {
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByText('https://example.ar-io.dev')
        ).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: 'Copy URL' })
      expect(copyButton).toBeInTheDocument()
    })

    // AT-2.4.05: Topics as badges
    it('should display topics as Badge components', async () => {
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('nostr')).toBeInTheDocument()
        expect(screen.getByText('arweave')).toBeInTheDocument()
        expect(screen.getByText('decentralized')).toBeInTheDocument()
      })
    })

    // AT-2.4.06: Last updated timestamp
    it('should display last updated timestamp', async () => {
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        // Should contain relative time like "about 1 hour ago" or similar
        expect(screen.getByText(/ago/i)).toBeInTheDocument()
      })
    })

    // Copy functionality
    it('should copy ArNS URL to clipboard when copy button is clicked', async () => {
      const user = userEvent.setup()
      const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByText('https://example.ar-io.dev')
        ).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: 'Copy URL' })
      await user.click(copyButton)

      // Verify the "Copied!" feedback shows (implies clipboard.writeText was called successfully)
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
      expect(writeTextSpy).toHaveBeenCalledWith(
        'https://example.ar-io.dev'
      )
    })

    it('should handle clipboard failure gracefully without showing "Copied!"', async () => {
      const user = userEvent.setup()
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
        new Error('Clipboard unavailable')
      )
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByText('https://example.ar-io.dev')
        ).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: 'Copy URL' })
      await user.click(copyButton)

      // When clipboard API fails, "Copied!" should NOT appear
      // (the catch block silently handles the error)
      // Wait a tick for the async handler to complete
      await waitFor(() => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
      })
    })
  })

  describe('URL Protocol Validation (Security)', () => {
    it('should not render ArNS link with javascript: URL scheme', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: ['javascript:alert("xss")'],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })

      // ArNS section should not render since the URL has an unsafe protocol
      expect(screen.queryByText('ArNS URL')).not.toBeInTheDocument()
    })

    it('should not render ArNS link with data: URL scheme', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: ['data:text/html,<script>alert(1)</script>'],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })

      expect(screen.queryByText('ArNS URL')).not.toBeInTheDocument()
    })

    it('should render ArNS link with valid https: URL scheme', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: ['https://example.ar-io.dev'],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))
      vi.mocked(fetch).mockResolvedValue(
        new Response('# README', { status: 200 })
      )

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('ArNS URL')).toBeInTheDocument()
      })
    })
  })

  describe('Graceful Optional Fields (AC #2 edge cases)', () => {
    it('should display "No description" in italic when description is empty', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        description: '',
        webUrls: [],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))

      renderRepoDetail()

      await waitFor(() => {
        const noDesc = screen.getByText('No description')
        expect(noDesc).toBeInTheDocument()
        // AC #2: "No description" must be displayed in italic text
        expect(noDesc).toHaveClass('italic')
      })
    })

    it('should not render maintainers section when maintainers array is empty', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        maintainers: [],
        webUrls: [],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })

      expect(screen.queryByText('Maintainers')).not.toBeInTheDocument()
    })

    it('should not render ArNS section when webUrls is empty', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: [],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })

      expect(screen.queryByText('ArNS URL')).not.toBeInTheDocument()
    })

    it('should not render topics section when topics array is empty', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        topics: [],
        webUrls: [],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })

      // There should be no topic badges or role="list" for topics
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })
  })

  describe('Deep Linking (AC #5)', () => {
    // AT-2.4.12: Page accessible via direct URL
    it('should render correctly when navigating directly to /:owner/:repo', async () => {
      const repo = createRepository({
        id: 'deep-link-repo',
        owner: 'deep-link-owner',
        name: 'Deep Link Repo',
        webUrls: [],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))

      renderRepoDetail('deep-link-owner', 'deep-link-repo')

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toHaveTextContent('Deep Link Repo')
      })
    })
  })

  describe('Back Navigation', () => {
    it('should display "Back to repositories" link pointing to /', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: [],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })

      const backLink = screen.getByText('Back to repositories')
      expect(backLink.closest('a')).toHaveAttribute('href', '/')
    })
  })

  describe('Topics as Badges with role="list"', () => {
    it('should render topics container with role="list" and items with role="listitem"', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        topics: ['nostr', 'arweave'],
        webUrls: [],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))

      renderRepoDetail()

      await waitFor(() => {
        const list = screen.getByRole('list')
        expect(list).toBeInTheDocument()

        const items = within(list).getAllByRole('listitem')
        expect(items).toHaveLength(2)
        expect(items[0]).toHaveTextContent('nostr')
        expect(items[1]).toHaveTextContent('arweave')
      })
    })
  })

  describe('Relay Status Badge Integration (Story 2.5)', () => {
    function createDetailedRelayMeta() {
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

    function createDetailedMetaResponse(repos: ReturnType<typeof createRepository>[]) {
      return { repositories: repos, meta: createDetailedRelayMeta() }
    }

    it('should display RelayStatusBadge in metadata card when relay metadata is available', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: [],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createDetailedMetaResponse([repo]))

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: Infinity, retryDelay: 0 },
        },
      })
      renderRepoDetail('test-owner', 'test-repo', queryClient)

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })

      // Relay status badge should be visible with correct text
      await waitFor(() => {
        expect(screen.getByText('Verified on 2 of 3 relays')).toBeInTheDocument()
      })
    })

    it('should render badge with detailed variant (expandable) on detail page', async () => {
      const user = userEvent.setup()
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: [],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createDetailedMetaResponse([repo]))

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: Infinity, retryDelay: 0 },
        },
      })
      renderRepoDetail('test-owner', 'test-repo', queryClient)

      await waitFor(() => {
        expect(screen.getByText('Verified on 2 of 3 relays')).toBeInTheDocument()
      })

      // The detailed variant should have an expandable trigger button
      const trigger = screen.getByRole('button', { name: /verified on/i })
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      // Click to expand panel
      await user.click(trigger)

      // Panel should show relay details
      expect(screen.getByText('Responding Relays')).toBeInTheDocument()
      expect(screen.getByText('Failed Relays')).toBeInTheDocument()
      expect(screen.getByText('wss://relay.damus.io')).toBeInTheDocument()
      expect(screen.getByText('wss://nos.lol')).toBeInTheDocument()
      expect(screen.getByText('wss://relay.nostr.band')).toBeInTheDocument()
      expect(screen.getByText('120ms')).toBeInTheDocument()
      expect(screen.getByText('250ms')).toBeInTheDocument()
    })

    it('should show Retry All Relays button in expanded panel when some relays failed', async () => {
      const user = userEvent.setup()
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: [],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createDetailedMetaResponse([repo]))

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: Infinity, retryDelay: 0 },
        },
      })
      renderRepoDetail('test-owner', 'test-repo', queryClient)

      await waitFor(() => {
        expect(screen.getByText('Verified on 2 of 3 relays')).toBeInTheDocument()
      })

      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      // Retry button should be visible since 1 of 3 relays failed
      const retryButton = screen.getByRole('button', { name: /retry all relay queries/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should show data age indicator in expanded panel', async () => {
      const user = userEvent.setup()
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: [],
      })
      vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createDetailedMetaResponse([repo]))

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: Infinity, retryDelay: 0 },
        },
      })
      renderRepoDetail('test-owner', 'test-repo', queryClient)

      await waitFor(() => {
        expect(screen.getByText('Verified on 2 of 3 relays')).toBeInTheDocument()
      })

      const trigger = screen.getByRole('button', { name: /verified on/i })
      await user.click(trigger)

      // Data age indicator should show "Last updated ... from 2/3 relays"
      expect(screen.getByText(/last updated .* from 2\/3 relays/i)).toBeInTheDocument()
    })

    it('should NOT display relay badge when fetch is still pending', () => {
      // When fetch has not resolved yet, no relay metadata is in cache
      vi.mocked(fetchRepositoriesWithMeta).mockReturnValue(new Promise(() => {}))

      renderRepoDetail()

      // Loading state shows -- no relay badge should be visible
      const loadingElement = screen.getByRole('status')
      expect(loadingElement).toBeInTheDocument()
      expect(screen.queryByText(/verified on/i)).not.toBeInTheDocument()
    })
  })
})
