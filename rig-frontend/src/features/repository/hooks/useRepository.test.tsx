/**
 * Tests for useRepository hook
 *
 * Story 2.4: Repository Detail Page (Task 4.21, 4.22)
 * Story 2.5: Relay Status Indicators (relay metadata caching)
 *
 * Verifies the hook fetches repositories and returns the matching one
 * by owner AND id, or null when no match is found. Also verifies that
 * relay metadata is written to cache as a side effect.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  createRepository,
  resetRepositoryCounter,
} from '@/test-utils/factories/repository'
import {
  createRelayResult,
  createRelayQueryMeta,
} from '@/test-utils/factories/relay-status'
import { relayStatusKeys } from '@/lib/query-client'

vi.mock('@/lib/nostr', () => ({
  fetchRepositories: vi.fn(),
  fetchRepositoriesWithMeta: vi.fn(),
}))

const { fetchRepositoriesWithMeta } = await import('@/lib/nostr')
const { useRepository } = await import('./useRepository')

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
}

function createWrapper(queryClient?: QueryClient) {
  const qc = queryClient ?? createTestQueryClient()
  return {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    ),
    queryClient: qc,
  }
}

/** Helper to create a mock return value for fetchRepositoriesWithMeta */
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

describe('useRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRepositoryCounter()
  })

  it('should return matching repository when owner and id both match', async () => {
    const targetRepo = createRepository({
      id: 'my-repo',
      owner: 'owner-pubkey-abc',
      name: 'My Repository',
    })
    const otherRepo = createRepository({
      id: 'other-repo',
      owner: 'other-owner',
      name: 'Other Repo',
    })
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
      createMetaResponse([targetRepo, otherRepo])
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useRepository('owner-pubkey-abc', 'my-repo'),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(result.current.data).toEqual(targetRepo)
  })

  it('should return null when no matching repository is found', async () => {
    const repo = createRepository({
      id: 'existing-repo',
      owner: 'some-owner',
    })
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
      createMetaResponse([repo])
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useRepository('nonexistent-owner', 'nonexistent-repo'),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(result.current.data).toBeNull()
  })

  it('should return null when owner matches but id does not', async () => {
    const repo = createRepository({
      id: 'my-repo',
      owner: 'owner-abc',
    })
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
      createMetaResponse([repo])
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useRepository('owner-abc', 'wrong-repo'),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(result.current.data).toBeNull()
  })

  it('should return null when id matches but owner does not', async () => {
    const repo = createRepository({
      id: 'my-repo',
      owner: 'owner-abc',
    })
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
      createMetaResponse([repo])
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useRepository('wrong-owner', 'my-repo'),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(result.current.data).toBeNull()
  })

  it('should propagate error when fetchRepositoriesWithMeta fails', async () => {
    const rigError = {
      code: 'RELAY_TIMEOUT' as const,
      message: 'Relay query failed',
      userMessage: 'Unable to connect to Nostr relays. Please try again.',
    }
    vi.mocked(fetchRepositoriesWithMeta).mockRejectedValue(rigError)

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useRepository('any-owner', 'any-repo'),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    expect(result.current.error).toEqual(rigError)
  })

  // Story 2.5: Relay metadata written to cache as side effect
  it('should write relay metadata to relayStatusKeys.all() cache', async () => {
    const repo = createRepository({
      id: 'test-repo',
      owner: 'test-owner',
    })
    const meta = createRelayQueryMeta({
      results: [
        createRelayResult({ url: 'wss://relay.damus.io' }),
        createRelayResult({ url: 'wss://nos.lol' }),
      ],
      respondedCount: 2,
      totalCount: 2,
    })
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue({
      repositories: [repo],
      meta,
    })

    const queryClient = createTestQueryClient()
    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData')
    const { wrapper } = createWrapper(queryClient)
    const { result } = renderHook(
      () => useRepository('test-owner', 'test-repo'),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(setQueryDataSpy).toHaveBeenCalledWith(
      relayStatusKeys.all(),
      expect.objectContaining({
        respondedCount: 2,
        totalCount: 2,
      })
    )

    setQueryDataSpy.mockRestore()
  })
})
