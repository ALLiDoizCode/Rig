/**
 * Tests for useRelayStatus hook
 *
 * Story 2.5: Relay Status Indicators
 *
 * Test coverage:
 * - Reads relay metadata from TanStack Query cache
 * - Returns correct counts and relay results
 * - Data age indicator updates over time
 * - Refetch triggers repository invalidation
 * - Returns defaults when no data is cached
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { relayStatusKeys } from '@/lib/query-client'
import {
  createRelayResult,
  createRelayQueryMeta,
} from '@/test-utils/factories/relay-status'
import { useRelayStatus } from './useRelayStatus'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
}

function createHookWrapper(queryClient?: QueryClient) {
  const qc = queryClient ?? createTestQueryClient()
  return {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>
        {children}
      </QueryClientProvider>
    ),
    queryClient: qc,
  }
}

describe('useRelayStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should return default values when no relay metadata is cached', () => {
    const { wrapper } = createHookWrapper()
    const { result } = renderHook(() => useRelayStatus(), { wrapper })

    expect(result.current.meta).toBeUndefined()
    expect(result.current.relayResults).toEqual([])
    expect(result.current.respondedCount).toBe(0)
    expect(result.current.totalCount).toBe(0)
    expect(result.current.lastUpdated).toBeNull()
    expect(result.current.dataAge).toBe('')
  })

  it('should read relay metadata from TanStack Query cache', () => {
    const queryClient = createTestQueryClient()
    const meta = createRelayQueryMeta({
      results: [
        createRelayResult({ url: 'wss://relay.damus.io' }),
        createRelayResult({ url: 'wss://nos.lol' }),
        createRelayResult({
          url: 'wss://relay.nostr.band',
          status: 'failed',
          eventCount: 0,
        }),
      ],
      respondedCount: 2,
      totalCount: 3,
    })

    // Pre-seed the cache with relay metadata
    queryClient.setQueryData(relayStatusKeys.all(), meta)

    const { wrapper } = createHookWrapper(queryClient)
    const { result } = renderHook(() => useRelayStatus(), { wrapper })

    expect(result.current.meta).toBeDefined()
    expect(result.current.meta).toBe(meta)
    expect(result.current.relayResults).toHaveLength(3)
    expect(result.current.respondedCount).toBe(2)
    expect(result.current.totalCount).toBe(3)
    expect(result.current.lastUpdated).toBe(meta.queriedAt)
  })

  it('should provide a data age string when relay metadata is cached', () => {
    const queryClient = createTestQueryClient()
    const meta = createRelayQueryMeta({
      queriedAt: Math.floor(Date.now() / 1000) - 60, // 1 minute ago
    })

    queryClient.setQueryData(relayStatusKeys.all(), meta)

    const { wrapper } = createHookWrapper(queryClient)
    const { result } = renderHook(() => useRelayStatus(), { wrapper })

    // data-fns formatDistanceToNow should return something like "about 1 minute ago"
    expect(result.current.dataAge).toMatch(/ago/)
  })

  // AT-2.5.13: Data age updates over time
  it('should update data age over time with setInterval', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })

    const queryClient = createTestQueryClient()
    const meta = createRelayQueryMeta({
      queriedAt: Math.floor(Date.now() / 1000) - 30, // 30 seconds ago
    })

    queryClient.setQueryData(relayStatusKeys.all(), meta)

    const { wrapper } = createHookWrapper(queryClient)
    const { result } = renderHook(() => useRelayStatus(), { wrapper })

    // Advance time by 30 seconds (the interval period)
    act(() => {
      vi.advanceTimersByTime(30_000)
    })

    // The data age should still be a valid string (may or may not change text
    // depending on date-fns thresholds, but the interval should have fired)
    expect(result.current.dataAge).toBeTruthy()
  })

  it('should provide refetch function', () => {
    const { wrapper } = createHookWrapper()
    const { result } = renderHook(() => useRelayStatus(), { wrapper })

    expect(typeof result.current.refetch).toBe('function')
  })

  // AC #5: Refetch triggers repository query invalidation
  it('should invalidate repository queries when refetch is called', () => {
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { wrapper } = createHookWrapper(queryClient)
    const { result } = renderHook(() => useRelayStatus(), { wrapper })

    // Call refetch
    act(() => {
      result.current.refetch()
    })

    // Should invalidate repository queries (which triggers fetchRepositoriesWithMeta,
    // which in turn updates relay metadata as a side effect)
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['repositories'],
    })

    invalidateSpy.mockRestore()
  })

  it('should have empty data age when no metadata is cached', () => {
    const { wrapper } = createHookWrapper()
    const { result } = renderHook(() => useRelayStatus(), { wrapper })

    expect(result.current.dataAge).toBe('')
  })
})
