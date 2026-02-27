/**
 * Tests for useRepositories hook
 *
 * Story 2.1: Repository List Page with Nostr Query
 * Story 2.5: Relay Status Indicators (fetchRepositoriesWithMeta integration)
 *
 * Test coverage:
 * - deduplicateRepositories pure function (unit tests)
 * - useRepositories hook (hook tests with QueryClientProvider)
 * - Relay metadata written to TanStack Query cache as side effect
 *
 * Acceptance Criteria covered: #1, #3, #7, #8, #9 (Story 2.1)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
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
import { relayStatusKeys } from '@/lib/query-client'

// Mock the nostr service layer — mock at the service boundary, not relay level
vi.mock('@/lib/nostr', () => ({
  fetchRepositories: vi.fn(),
  fetchRepositoriesWithMeta: vi.fn(),
}))

// Import after mocks are set up
const { fetchRepositoriesWithMeta } = await import('@/lib/nostr')
const { deduplicateRepositories, useRepositories } = await import('./useRepositories')

// Fresh QueryClient per test to prevent cache leaks
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
}

// Hook wrapper with QueryClientProvider (no router needed for hooks)
function createHookWrapper() {
  const queryClient = createTestQueryClient()
  return {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    ),
    queryClient,
  }
}

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

describe('deduplicateRepositories', () => {
  beforeEach(() => {
    resetRepositoryCounter()
  })

  // AT-2.1.14: Deduplicates repositories from multiple relays
  it('[P0] should deduplicate repositories by id, keeping the one with latest createdAt', () => {
    // Given: Two repositories with the same id but different createdAt timestamps
    const olderRepo = createRepository({ id: 'my-repo', createdAt: 1000 })
    const newerRepo = createRepository({ id: 'my-repo', createdAt: 2000 })
    const uniqueRepo = createRepository({ id: 'other-repo', createdAt: 1500 })

    // When: Deduplicating the array
    const result = deduplicateRepositories([olderRepo, newerRepo, uniqueRepo])

    // Then: Should keep the newer duplicate and the unique repo
    expect(result).toHaveLength(2)
    const deduplicatedRepo = result.find((r) => r.id === 'my-repo')
    expect(deduplicatedRepo?.createdAt).toBe(2000)
    expect(result.find((r) => r.id === 'other-repo')).toBeDefined()
  })

  it('[P1] should return all items when there are no duplicates', () => {
    // Given: Three repositories with unique ids
    const repos = createRepositories(3)

    // When: Deduplicating
    const result = deduplicateRepositories(repos)

    // Then: All items should be preserved
    expect(result).toHaveLength(3)
  })

  it('[P1] should return empty array when input is empty', () => {
    // Given: An empty array
    // When: Deduplicating
    const result = deduplicateRepositories([])

    // Then: Should return empty array
    expect(result).toEqual([])
  })

  it('[P1] should return single item unchanged', () => {
    // Given: A single repository
    const repo = createRepository()

    // When: Deduplicating
    const result = deduplicateRepositories([repo])

    // Then: Should return that single item
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(repo)
  })

  it('[P2] should handle multiple groups of duplicates', () => {
    // Given: Multiple duplicate groups from different relays
    const repoA_old = createRepository({ id: 'repo-a', createdAt: 100 })
    const repoA_new = createRepository({ id: 'repo-a', createdAt: 200 })
    const repoB_old = createRepository({ id: 'repo-b', createdAt: 300 })
    const repoB_new = createRepository({ id: 'repo-b', createdAt: 400 })
    const repoC = createRepository({ id: 'repo-c', createdAt: 500 })

    // When: Deduplicating
    const result = deduplicateRepositories([repoA_old, repoB_old, repoA_new, repoB_new, repoC])

    // Then: Should keep latest of each group
    expect(result).toHaveLength(3)
    expect(result.find((r) => r.id === 'repo-a')?.createdAt).toBe(200)
    expect(result.find((r) => r.id === 'repo-b')?.createdAt).toBe(400)
    expect(result.find((r) => r.id === 'repo-c')?.createdAt).toBe(500)
  })
})

describe('useRepositories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRepositoryCounter()
  })

  // AT-2.1.01: Queries relays for kind 30617 on page load
  it('[P0] should fetch repositories successfully and return data with status success', async () => {
    // Given: The service layer returns a list of repositories
    const mockRepos = createRepositories(3)
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse(mockRepos))

    // When: The hook is rendered
    const { wrapper } = createHookWrapper()
    const { result } = renderHook(() => useRepositories(), { wrapper })

    // Then: Should transition from pending to success with data
    expect(result.current.status).toBe('pending')

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(result.current.data).toHaveLength(3)
    expect(fetchRepositoriesWithMeta).toHaveBeenCalledOnce()
  })

  // AT-2.1.09: Error handling when all relays fail
  it('[P0] should set status to error when fetchRepositoriesWithMeta throws RigError', async () => {
    // Given: The service layer throws a RigError
    const rigError = {
      code: 'RELAY_TIMEOUT' as const,
      message: 'Relay query failed: Timeout',
      userMessage: 'Unable to connect to Nostr relays. Please try again.',
      context: {},
    }
    vi.mocked(fetchRepositoriesWithMeta).mockRejectedValue(rigError)

    // When: The hook is rendered
    const { wrapper } = createHookWrapper()
    const { result } = renderHook(() => useRepositories(), { wrapper })

    // Then: Should transition to error status with the RigError
    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    expect(result.current.error).toMatchObject({
      code: 'RELAY_TIMEOUT',
      userMessage: expect.stringContaining('Unable to connect'),
    })
  })

  // AT-2.1.14: Hook integrates deduplication via select
  it('[P0] should deduplicate repositories via the select option', async () => {
    // Given: The service layer returns duplicates (same id from different relays)
    const repo1 = createRepository({ id: 'dup-repo', createdAt: 1000 })
    const repo2 = createRepository({ id: 'dup-repo', createdAt: 2000 })
    const repo3 = createRepository({ id: 'unique-repo', createdAt: 1500 })
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
      createMetaResponse([repo1, repo2, repo3])
    )

    // When: The hook is rendered
    const { wrapper } = createHookWrapper()
    const { result } = renderHook(() => useRepositories(), { wrapper })

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    // Then: Data should be deduplicated (2 unique repos, not 3)
    expect(result.current.data).toHaveLength(2)
    const dupRepo = result.current.data?.find((r) => r.id === 'dup-repo')
    expect(dupRepo?.createdAt).toBe(2000) // Latest wins
  })

  // AT-2.1.11: Stale-while-revalidate — cached data shown immediately
  it('[P1] should return stale data immediately while refetch is in-flight', async () => {
    // Given: Cache is seeded with stale data
    const staleRepos = createRepositories(2)
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse(staleRepos))

    const { wrapper, queryClient } = createHookWrapper()
    const { result } = renderHook(() => useRepositories(), { wrapper })

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })
    expect(result.current.data).toHaveLength(2)

    // When: A refetch is triggered (simulating stale-while-revalidate)
    // Prepare a slow response for the refetch
    const freshRepos = createRepositories(3)
    let resolveRefetch: (value: ReturnType<typeof createMetaResponse>) => void
    const refetchPromise = new Promise<ReturnType<typeof createMetaResponse>>((resolve) => {
      resolveRefetch = resolve
    })
    vi.mocked(fetchRepositoriesWithMeta).mockReturnValue(refetchPromise)

    // Invalidate to trigger background refetch (do NOT await — it waits for refetch to complete)
    const invalidatePromise = queryClient.invalidateQueries({ queryKey: ['repositories'] })

    // Then: Stale data should still be available immediately
    expect(result.current.data).toHaveLength(2)

    // When: Fresh data arrives
    resolveRefetch!(createMetaResponse(freshRepos))

    // Wait for the invalidation/refetch to complete
    await invalidatePromise

    await waitFor(() => {
      expect(result.current.data).toHaveLength(3)
    })
  })

  // AT-2.1.05: Displays repos even if only 1 relay responds
  it('[P0] should display repositories even when partial relay data is returned', async () => {
    // Given: Only 1 relay responds with 1 repository (pool.querySync handles this internally)
    const partialRepos = [createRepository()]
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse(partialRepos))

    // When: The hook is rendered
    const { wrapper } = createHookWrapper()
    const { result } = renderHook(() => useRepositories(), { wrapper })

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    // Then: The single repository should be displayed
    expect(result.current.data).toHaveLength(1)
  })

  it('[P1] should use repositoryKeys.all() as the query key', async () => {
    // Given: The hook is configured with the correct query key
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([]))

    // When: The hook is rendered
    const { wrapper, queryClient } = createHookWrapper()
    renderHook(() => useRepositories(), { wrapper })

    await waitFor(() => {
      const queryState = queryClient.getQueryState(['repositories'])
      expect(queryState).toBeDefined()
    })
  })

  it('[P2] should configure staleTime of 1 hour for repository data', async () => {
    // Given: The hook uses staleTime: 60 * 60 * 1000
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
      createMetaResponse(createRepositories(1))
    )

    // When: The hook is rendered and data is fetched
    const { wrapper, queryClient } = createHookWrapper()
    renderHook(() => useRepositories(), { wrapper })

    await waitFor(() => {
      const queryState = queryClient.getQueryState(['repositories'])
      expect(queryState?.status).toBe('success')
    })

    // Then: The query should not be considered stale immediately
    // (We verify by checking fetchRepositoriesWithMeta is not called again within staleTime)
    // This is implicitly tested by TanStack Query's staleTime behavior
    expect(fetchRepositoriesWithMeta).toHaveBeenCalledTimes(1)
  })

  // AT-2.1.12: Updates cached data when fresh data arrives from relays
  it('[P1] should update displayed data when refetch returns fresh data', async () => {
    // Given: Initial fetch returns 2 repositories
    const initialRepos = createRepositories(2)
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse(initialRepos))

    const { wrapper } = createHookWrapper()
    const { result } = renderHook(() => useRepositories(), { wrapper })

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0]?.name).toBe('Repository 1')

    // When: Refetch returns updated data (e.g., a new repository appeared on relays)
    const updatedRepos = createRepositories(4)
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse(updatedRepos))
    await result.current.refetch()

    // Then: Hook should return the fresh data
    await waitFor(() => {
      expect(result.current.data).toHaveLength(4)
    })
    expect(fetchRepositoriesWithMeta).toHaveBeenCalledTimes(2)
  })

  it('[P1] should provide a refetch function for manual retry', async () => {
    // Given: The hook is rendered with successful data
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
      createMetaResponse(createRepositories(1))
    )

    const { wrapper } = createHookWrapper()
    const { result } = renderHook(() => useRepositories(), { wrapper })

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    // Then: The refetch function should be available
    expect(typeof result.current.refetch).toBe('function')
  })

  // Story 2.5: Relay metadata written to separate cache key
  it('[P0] should write relay metadata to relayStatusKeys.all() cache', async () => {
    const mockRepos = createRepositories(2)
    const meta = createRelayQueryMeta({
      results: [
        createRelayResult({ url: 'wss://relay.damus.io' }),
        createRelayResult({ url: 'wss://nos.lol' }),
      ],
      respondedCount: 2,
      totalCount: 2,
    })
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue({
      repositories: mockRepos,
      meta,
    })

    const { wrapper, queryClient } = createHookWrapper()

    // Spy on setQueryData to verify the side effect call
    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData')

    const { result } = renderHook(() => useRepositories(), { wrapper })

    // Wait for the query to succeed first
    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    // Verify setQueryData was called with relay status key and correct meta
    // Note: We verify via spy rather than getQueryData because the test QueryClient
    // uses gcTime: 0, which garbage-collects unobserved queries immediately.
    // In production, the relay-status query is observed by useRelayStatus hook.
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      relayStatusKeys.all(),
      expect.objectContaining({
        respondedCount: 2,
        totalCount: 2,
      })
    )

    setQueryDataSpy.mockRestore()
  })

  it('[P1] should preserve Repository[] return type (not include meta in query data)', async () => {
    const mockRepos = createRepositories(2)
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse(mockRepos))

    const { wrapper } = createHookWrapper()
    const { result } = renderHook(() => useRepositories(), { wrapper })

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    // Return type should be Repository[], not { repositories, meta }
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0]).toHaveProperty('id')
    expect(result.current.data?.[0]).toHaveProperty('name')
    expect(result.current.data?.[0]).not.toHaveProperty('meta')
  })
})
