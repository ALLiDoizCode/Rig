/**
 * Tests for subscribeToRepositories service function
 *
 * Story 2.6: Real-Time Repository Updates
 *
 * Tests verify:
 * - Subscription uses pool.subscribeMany with correct relays and filter
 * - Signature verification is applied to incoming events
 * - Invalid-signature events do NOT trigger the onEvent callback
 * - The returned SubCloser.close() works
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Event as NostrEvent } from 'nostr-tools'

// Mock nostr-tools
const mockSubscribeManyReturn = { close: vi.fn() }
const mockPoolInstance = {
  querySync: vi.fn(),
  subscribeMany: vi.fn().mockReturnValue(mockSubscribeManyReturn),
  close: vi.fn(),
}

const MockSimplePool = vi.fn(function (this: unknown) {
  return mockPoolInstance
})

vi.mock('nostr-tools/pool', () => ({
  SimplePool: MockSimplePool,
}))

vi.mock('nostr-tools/pure', () => ({
  verifyEvent: vi.fn(),
}))

// Import after mocks
const { subscribeToRepositories } = await import('./nostr')
const { verifyEvent } = await import('nostr-tools/pure')

describe('subscribeToRepositories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPoolInstance.subscribeMany.mockReturnValue(mockSubscribeManyReturn)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call pool.subscribeMany with DEFAULT_RELAYS, kind 30617 filter, and since timestamp', () => {
    const onEvent = vi.fn()
    const beforeCall = Math.floor(Date.now() / 1000)

    subscribeToRepositories(onEvent)

    const afterCall = Math.floor(Date.now() / 1000)

    expect(mockPoolInstance.subscribeMany).toHaveBeenCalledTimes(1)
    const [relays, filter] = mockPoolInstance.subscribeMany.mock.calls[0]

    // Should pass DEFAULT_RELAYS (3 relays from fallback)
    expect(relays).toEqual(
      expect.arrayContaining(['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band'])
    )
    expect(relays).toHaveLength(3)

    // Should filter for kind 30617 (REPO_ANNOUNCEMENT) with since timestamp
    expect(filter.kinds).toEqual([30617])
    expect(filter.since).toBeGreaterThanOrEqual(beforeCall)
    expect(filter.since).toBeLessThanOrEqual(afterCall)
  })

  it('should verify event signature and call onEvent for valid events', () => {
    const onEvent = vi.fn()
    vi.mocked(verifyEvent).mockReturnValue(true)

    subscribeToRepositories(onEvent)

    // Extract the onevent callback that was passed to subscribeMany
    const params = mockPoolInstance.subscribeMany.mock.calls[0][2]
    const fakeEvent: NostrEvent = {
      id: 'valid-event-1',
      kind: 30617,
      content: '',
      pubkey: 'abc123',
      sig: 'valid-sig',
      tags: [['d', 'my-repo'], ['name', 'My Repo']],
      created_at: 1700000000,
    }

    // Simulate event arrival
    params.onevent(fakeEvent)

    expect(verifyEvent).toHaveBeenCalledWith(fakeEvent)
    expect(onEvent).toHaveBeenCalledWith(fakeEvent)
    expect(onEvent).toHaveBeenCalledTimes(1)
  })

  it('should NOT call onEvent for events with invalid signatures', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const onEvent = vi.fn()
    vi.mocked(verifyEvent).mockReturnValue(false)

    subscribeToRepositories(onEvent)

    const params = mockPoolInstance.subscribeMany.mock.calls[0][2]
    const fakeEvent: NostrEvent = {
      id: 'invalid-event-1',
      kind: 30617,
      content: '',
      pubkey: 'bad-actor',
      sig: 'invalid-sig',
      tags: [['d', 'bad-repo']],
      created_at: 1700000000,
    }

    params.onevent(fakeEvent)

    expect(verifyEvent).toHaveBeenCalledWith(fakeEvent)
    expect(onEvent).not.toHaveBeenCalled()
  })

  it('should log a console warning for events with invalid signatures', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const onEvent = vi.fn()
    vi.mocked(verifyEvent).mockReturnValue(false)

    subscribeToRepositories(onEvent)

    const params = mockPoolInstance.subscribeMany.mock.calls[0][2]
    const fakeEvent: NostrEvent = {
      id: 'bad-event-42',
      kind: 30617,
      content: '',
      pubkey: 'bad-actor',
      sig: 'invalid-sig',
      tags: [['d', 'bad-repo']],
      created_at: 1700000000,
    }

    params.onevent(fakeEvent)

    expect(warnSpy).toHaveBeenCalledWith(
      'Invalid signature rejected in subscription:',
      'bad-event-42'
    )
  })

  it('should return a SubCloser with a close() method', () => {
    const onEvent = vi.fn()

    const sub = subscribeToRepositories(onEvent)

    expect(sub).toBe(mockSubscribeManyReturn)
    expect(typeof sub.close).toBe('function')

    sub.close()
    expect(mockSubscribeManyReturn.close).toHaveBeenCalledTimes(1)
  })
})
