/**
 * Tests for Home page component - Real-Time Updates
 *
 * Story 2.6: Real-Time Repository Updates
 *
 * Test coverage:
 * - Real-time repository updates integration (AT-2.6.04, AT-2.6.08)
 * - WebSocket subscription lifecycle
 * - Cache invalidation triggers
 * - Relay metadata updates
 *
 * Acceptance Criteria covered: Story 2.6 integration tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
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

describe('Home Page - Real-Time Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRepositoryCounter()
  })

  afterEach(() => {
    vi.useRealTimers()
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
})
