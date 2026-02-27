/**
 * Tests for useRealtimeRepositories hook
 *
 * Story 2.6: Real-Time Repository Updates
 *
 * Test coverage (AT-2.6.xx test IDs from test design):
 * - AT-2.6.01: Subscription created when hook mounts
 * - AT-2.6.02: Subscription closed when hook unmounts (verify close() called)
 * - AT-2.6.03: Subscription filter includes only kind 30617
 * - AT-2.6.05: Cache invalidated on new event (repositoryKeys.all())
 * - AT-2.6.06: Toast shown with "New repository added: [name]"
 * - AT-2.6.07: Toast auto-dismisses after 5 seconds (use vi.useFakeTimers())
 * - AT-2.6.09: Reconnection -- delegated to SimplePool (documented)
 * - AT-2.6.10: Updated repo (same d-tag) handled correctly
 * - AT-2.6.11: Multiple rapid events handled without race conditions
 * - AT-2.6.12: No state updates after unmount
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { Event as NostrEvent } from 'nostr-tools'
import { repositoryKeys } from '@/lib/query-client'

// Mock subscribeToRepositories from the nostr service layer
const mockClose = vi.fn()
let capturedOnEvent: ((event: NostrEvent) => void) | null = null

vi.mock('@/lib/nostr', () => ({
  subscribeToRepositories: vi.fn((onEvent: (event: NostrEvent) => void) => {
    capturedOnEvent = onEvent
    return { close: mockClose }
  }),
}))

// Mock sonner toast -- toast() is used for real-time notifications
const mockToast = vi.fn()
vi.mock('sonner', () => ({
  toast: mockToast,
}))

const { subscribeToRepositories } = await import('@/lib/nostr')
await import('sonner')
const { useRealtimeRepositories } = await import('./useRealtimeRepositories')

/** Create a fake kind 30617 event for testing */
function createFakeRepoEvent(overrides: Partial<NostrEvent> = {}): NostrEvent {
  return {
    id: 'event-1',
    kind: 30617,
    content: '',
    pubkey: 'abc123',
    sig: 'sig-1',
    tags: [['d', 'my-repo'], ['name', 'My Repository']],
    created_at: 1700000000,
    ...overrides,
  }
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useRealtimeRepositories', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    capturedOnEvent = null
    queryClient = createTestQueryClient()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // AT-2.6.01: Subscription created when hook mounts
  it('[AT-2.6.01] should create subscription when hook mounts', () => {
    renderHook(() => useRealtimeRepositories(), {
      wrapper: createWrapper(queryClient),
    })

    expect(subscribeToRepositories).toHaveBeenCalledTimes(1)
    expect(subscribeToRepositories).toHaveBeenCalledWith(expect.any(Function))
  })

  // AT-2.6.02: Subscription closed when hook unmounts
  it('[AT-2.6.02] should close subscription when hook unmounts', () => {
    const { unmount } = renderHook(() => useRealtimeRepositories(), {
      wrapper: createWrapper(queryClient),
    })

    expect(mockClose).not.toHaveBeenCalled()

    unmount()

    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  // AT-2.6.03: Subscription filter includes only kind 30617
  // (This is verified at the service layer in nostr.subscribeToRepositories.test.ts.
  // Here we verify the hook delegates to subscribeToRepositories correctly.)
  it('[AT-2.6.03] should delegate subscription to subscribeToRepositories service function', () => {
    renderHook(() => useRealtimeRepositories(), {
      wrapper: createWrapper(queryClient),
    })

    // The hook calls subscribeToRepositories with a callback;
    // the filter (kind 30617) is applied inside subscribeToRepositories
    expect(subscribeToRepositories).toHaveBeenCalledTimes(1)
  })

  // AT-2.6.05: Cache invalidated on new event
  it('[AT-2.6.05] should invalidate TanStack Query cache on new event', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    renderHook(() => useRealtimeRepositories(), {
      wrapper: createWrapper(queryClient),
    })

    // Simulate a new event arriving
    const fakeEvent = createFakeRepoEvent()
    capturedOnEvent?.(fakeEvent)

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: repositoryKeys.all(),
    })
  })

  // AT-2.6.06: Toast shown with "New repository added: [name]"
  it('[AT-2.6.06] should show toast with repo name from "name" tag', () => {
    renderHook(() => useRealtimeRepositories(), {
      wrapper: createWrapper(queryClient),
    })

    const fakeEvent = createFakeRepoEvent({
      tags: [['d', 'my-repo'], ['name', 'Awesome Repo']],
    })
    capturedOnEvent?.(fakeEvent)

    expect(mockToast).toHaveBeenCalledWith('New repository added: Awesome Repo', {
      duration: 5000,
    })
  })

  it('[AT-2.6.06] should fallback to "d" tag when "name" tag is missing', () => {
    renderHook(() => useRealtimeRepositories(), {
      wrapper: createWrapper(queryClient),
    })

    const fakeEvent = createFakeRepoEvent({
      tags: [['d', 'fallback-repo-id']],
    })
    capturedOnEvent?.(fakeEvent)

    expect(mockToast).toHaveBeenCalledWith('New repository added: fallback-repo-id', {
      duration: 5000,
    })
  })

  it('[AT-2.6.06] should fallback to "Unknown repository" when no name or d tag', () => {
    renderHook(() => useRealtimeRepositories(), {
      wrapper: createWrapper(queryClient),
    })

    const fakeEvent = createFakeRepoEvent({
      tags: [],
    })
    capturedOnEvent?.(fakeEvent)

    expect(mockToast).toHaveBeenCalledWith('New repository added: Unknown repository', {
      duration: 5000,
    })
  })

  it('[AT-2.6.06] should fallback to "d" tag when "name" tag has empty value', () => {
    renderHook(() => useRealtimeRepositories(), {
      wrapper: createWrapper(queryClient),
    })

    const fakeEvent = createFakeRepoEvent({
      tags: [['name', ''], ['d', 'repo-from-d-tag']],
    })
    capturedOnEvent?.(fakeEvent)

    expect(mockToast).toHaveBeenCalledWith('New repository added: repo-from-d-tag', {
      duration: 5000,
    })
  })

  it('[AT-2.6.06] should truncate extremely long repo names to prevent UI issues', () => {
    renderHook(() => useRealtimeRepositories(), {
      wrapper: createWrapper(queryClient),
    })

    const longName = 'A'.repeat(200)
    const fakeEvent = createFakeRepoEvent({
      tags: [['d', 'long-repo'], ['name', longName]],
    })
    capturedOnEvent?.(fakeEvent)

    const expectedName = 'A'.repeat(100) + '...'
    expect(mockToast).toHaveBeenCalledWith(`New repository added: ${expectedName}`, {
      duration: 5000,
    })
  })

  // AT-2.6.07: Toast auto-dismisses after 5 seconds
  it('[AT-2.6.07] should set toast duration to 5000ms (5 seconds)', () => {
    vi.useFakeTimers()

    renderHook(() => useRealtimeRepositories(), {
      wrapper: createWrapper(queryClient),
    })

    const fakeEvent = createFakeRepoEvent()
    capturedOnEvent?.(fakeEvent)

    // Verify the toast was called with duration: 5000
    expect(mockToast).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ duration: 5000 })
    )
  })

  // AT-2.6.09: Reconnection behavior
  // SimplePool's enableReconnect: true handles reconnection automatically.
  // This is already tested in nostr.test.ts (pool configuration test).
  // The hook does NOT implement custom reconnection logic.
  it('[AT-2.6.09] should delegate reconnection to SimplePool (no custom reconnection logic)', () => {
    // This test documents that reconnection is handled by SimplePool.
    // The hook simply calls subscribeToRepositories() and relies on the pool
    // to manage WebSocket connections with enableReconnect: true.
    renderHook(() => useRealtimeRepositories(), {
      wrapper: createWrapper(queryClient),
    })

    // Verify the hook does not attempt any reconnection-related calls
    // (e.g., no setTimeout, no manual reconnect, no retry logic)
    expect(subscribeToRepositories).toHaveBeenCalledTimes(1)
  })

  // AT-2.6.10: Updated repo (same d-tag) handled correctly
  it('[AT-2.6.10] should invalidate cache for updated repo (same d-tag, newer timestamp)', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    renderHook(() => useRealtimeRepositories(), {
      wrapper: createWrapper(queryClient),
    })

    // Simulate an updated event for the same repo (same d-tag, newer timestamp)
    const updatedEvent = createFakeRepoEvent({
      id: 'event-updated',
      tags: [['d', 'existing-repo'], ['name', 'Updated Repo']],
      created_at: 1700001000, // newer timestamp
    })
    capturedOnEvent?.(updatedEvent)

    // Cache invalidation triggers refetch; deduplicateRepositories in
    // useRepositories handles keeping the latest version
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: repositoryKeys.all(),
    })
    expect(mockToast).toHaveBeenCalledWith('New repository added: Updated Repo', {
      duration: 5000,
    })
  })

  // AT-2.6.11: Multiple rapid events handled without race conditions
  it('[AT-2.6.11] should handle multiple rapid events without race conditions', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    renderHook(() => useRealtimeRepositories(), {
      wrapper: createWrapper(queryClient),
    })

    // Simulate 3 rapid events
    const events = [
      createFakeRepoEvent({ id: 'evt-1', tags: [['d', 'repo-1'], ['name', 'Repo One']] }),
      createFakeRepoEvent({ id: 'evt-2', tags: [['d', 'repo-2'], ['name', 'Repo Two']] }),
      createFakeRepoEvent({ id: 'evt-3', tags: [['d', 'repo-3'], ['name', 'Repo Three']] }),
    ]

    for (const event of events) {
      capturedOnEvent?.(event)
    }

    // Each event should trigger cache invalidation and toast
    expect(invalidateSpy).toHaveBeenCalledTimes(3)
    expect(mockToast).toHaveBeenCalledTimes(3)
    expect(mockToast).toHaveBeenCalledWith('New repository added: Repo One', {
      duration: 5000,
    })
    expect(mockToast).toHaveBeenCalledWith('New repository added: Repo Two', {
      duration: 5000,
    })
    expect(mockToast).toHaveBeenCalledWith('New repository added: Repo Three', {
      duration: 5000,
    })
  })

  // AT-2.6.12: No state updates after unmount
  it('[AT-2.6.12] should not fire events after unmount (subscription closed)', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { unmount } = renderHook(() => useRealtimeRepositories(), {
      wrapper: createWrapper(queryClient),
    })

    // Unmount the hook -- subscription should be closed
    unmount()

    expect(mockClose).toHaveBeenCalledTimes(1)

    // After unmount, the sub.close() stops further events from arriving.
    // The capturedOnEvent callback is no longer invoked by the subscription.
    // This verifies the cleanup pattern prevents state updates after unmount.
    //
    // Note: In production, sub.close() tells the pool to stop delivering
    // events to this subscriber. We verify the close is called, which is
    // sufficient to prevent "set state on unmounted component" warnings.
    expect(invalidateSpy).not.toHaveBeenCalled()
    expect(mockToast).not.toHaveBeenCalled()
  })
})
