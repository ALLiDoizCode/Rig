import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Event as NostrEvent } from 'nostr-tools'

// Mock nostr-tools
const mockPoolInstance = {
  querySync: vi.fn(),
  subscribeMany: vi.fn(),
  close: vi.fn()
}

let poolConstructorArgs: Record<string, unknown> | null = null
const MockSimplePool = vi.fn(function(this: unknown, options: Record<string, unknown>) {
  poolConstructorArgs = options
  return mockPoolInstance
})

vi.mock('nostr-tools/pool', () => ({
  SimplePool: MockSimplePool
}))

vi.mock('nostr-tools/pure', () => ({
  verifyEvent: vi.fn()
}))

// Import after mocks
const { fetchRepositories, fetchRepositoriesWithMeta, fetchIssues, fetchPullRequests, fetchPatches, fetchComments, destroyPool } = await import('./nostr')
const { verifyEvent } = await import('nostr-tools/pure')

describe('Nostr Service Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('SimplePool configuration', () => {
    it('should create pool with enableReconnect and enablePing', () => {
      expect(poolConstructorArgs).toEqual({
        enableReconnect: true,
        enablePing: true
      })
    })
  })

  describe('destroyPool', () => {
    it('should call pool.close with DEFAULT_RELAYS', () => {
      destroyPool()

      expect(mockPoolInstance.close).toHaveBeenCalledWith(
        expect.arrayContaining(['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band'])
      )
    })
  })

  describe('fetchRepositories', () => {
    it('should query kind 30617 events and return Repository domain models', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 30617,
          content: '',
          pubkey: 'abc123',
          sig: 'sig123',
          tags: [
            ['d', 'my-repo'],
            ['name', 'My Repository']
          ],
          created_at: 1234567890
        }
      ]

      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchRepositories()

      expect(mockPoolInstance.querySync).toHaveBeenCalledWith(
        expect.arrayContaining(['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band']),
        { kinds: [30617], limit: 100 },
        { maxWait: 2000 }
      )

      // Should return transformed Repository objects
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'my-repo',
        name: 'My Repository',
        owner: 'abc123',
        eventId: '1',
        createdAt: 1234567890
      })
    })

    it('should query with custom limit', async () => {
      const mockEvents: NostrEvent[] = []
      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(true)

      await fetchRepositories(50)

      expect(mockPoolInstance.querySync).toHaveBeenCalledWith(
        expect.any(Array),
        { kinds: [30617], limit: 50 },
        { maxWait: 2000 }
      )
    })

    it('should reject events with invalid signatures', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 30617,
          content: '',
          pubkey: 'abc',
          sig: 'valid_sig',
          tags: [['d', 'valid-repo']],
          created_at: 123
        },
        {
          id: '2',
          kind: 30617,
          content: '',
          pubkey: 'def',
          sig: 'bad_sig',
          tags: [['d', 'invalid-repo']],
          created_at: 456
        }
      ]

      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent)
        .mockReturnValueOnce(true)   // First event valid
        .mockReturnValueOnce(false)  // Second event invalid

      const result = await fetchRepositories()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('valid-repo')
    })

    it('should log warning via console.warn for invalid signatures', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const mockEvents: NostrEvent[] = [
        {
          id: 'bad-event-id',
          kind: 30617,
          content: 'invalid',
          pubkey: 'def',
          sig: 'bad_sig',
          tags: [],
          created_at: 456
        }
      ]

      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(false)

      await fetchRepositories()

      expect(warnSpy).toHaveBeenCalledWith('Invalid signature rejected:', 'bad-event-id')
    })

    it('should throw RELAY_TIMEOUT on timeout errors', async () => {
      mockPoolInstance.querySync.mockRejectedValue(new Error('Timeout'))

      await expect(fetchRepositories()).rejects.toMatchObject({
        code: 'RELAY_TIMEOUT',
        userMessage: expect.stringContaining('Please try again')
      })
    })

    it('should throw RELAY_TIMEOUT on non-timeout relay errors', async () => {
      mockPoolInstance.querySync.mockRejectedValue(new Error('Connection refused'))

      await expect(fetchRepositories()).rejects.toMatchObject({
        code: 'RELAY_TIMEOUT',
        message: expect.stringContaining('Connection refused')
      })
    })

    it('should throw RigError with context on relay failure', async () => {
      mockPoolInstance.querySync.mockRejectedValue(new Error('Connection failed'))

      try {
        await fetchRepositories()
        expect.fail('Should have thrown error')
      } catch (err: unknown) {
        const rigErr = err as { code: string; message: string; userMessage: string; context: Record<string, unknown> }
        expect(rigErr.code).toBe('RELAY_TIMEOUT')
        expect(rigErr.message).toContain('Connection failed')
        expect(rigErr.userMessage).toBeTruthy()
        expect(rigErr.context).toHaveProperty('relays')
      }
    })

    it('should filter out events that fail Zod validation', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 30617,
          content: '',
          pubkey: 'abc',
          sig: 'sig',
          tags: [['d', 'valid-repo']],
          created_at: 123
        },
        {
          id: '2',
          kind: 30617,
          content: '',
          pubkey: 'def',
          sig: 'sig',
          tags: [], // Missing required 'd' tag - fails Zod validation
          created_at: 456
        }
      ]

      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchRepositories()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('valid-repo')
      expect(warnSpy).toHaveBeenCalledWith(
        'Repository event validation failed:',
        '2',
        expect.anything()
      )
    })

    it('should filter out events that fail Zod refine validation', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      // Empty 'd' tag value fails the Zod refine check (tag[1] is falsy),
      // so this is caught by the try-catch and filtered out
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 30617,
          content: '',
          pubkey: 'abc',
          sig: 'sig',
          tags: [['d', 'valid-repo']],
          created_at: 123
        },
        {
          id: '2',
          kind: 30617,
          content: '',
          pubkey: 'def',
          sig: 'sig',
          tags: [['d', '']], // Empty 'd' tag - Zod refine rejects this
          created_at: 456
        }
      ]

      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchRepositories()

      // Only the valid event survives; invalid one filtered by Zod
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('valid-repo')
    })

    it('should throw VALIDATION_FAILED when ALL events fail Zod validation', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 30617,
          content: '',
          pubkey: 'abc',
          sig: 'sig',
          tags: [], // Missing required 'd' tag
          created_at: 123
        },
        {
          id: '2',
          kind: 30617,
          content: '',
          pubkey: 'def',
          sig: 'sig',
          tags: [], // Missing required 'd' tag
          created_at: 456
        }
      ]

      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(true)

      await expect(fetchRepositories()).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
        message: expect.stringContaining('All 2 repository events failed'),
        userMessage: expect.stringContaining('Unable to process')
      })
    })

    it('should return empty array when no events are returned', async () => {
      mockPoolInstance.querySync.mockResolvedValue([])
      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchRepositories()

      expect(result).toEqual([])
    })
  })

  describe('fetchRepositoriesWithMeta', () => {
    // Helper: create a valid kind 30617 event for testing
    function createRepoEvent(id: string, dTag: string, name: string): NostrEvent {
      return {
        id,
        kind: 30617,
        content: '',
        pubkey: `pubkey-${id}`,
        sig: `sig-${id}`,
        tags: [['d', dTag], ['name', name]],
        created_at: 1234567890,
      }
    }

    // NFR-P7: System races queries across relays in parallel
    it('should query each relay individually in parallel (per-relay metadata tracking)', async () => {
      const event = createRepoEvent('1', 'my-repo', 'My Repo')
      mockPoolInstance.querySync.mockResolvedValue([event])
      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchRepositoriesWithMeta()

      // queryEventsWithMeta queries each relay individually -- 3 calls for 3 default relays
      expect(mockPoolInstance.querySync).toHaveBeenCalledTimes(3)

      // Each call should be to a single relay URL (not all relays)
      const calls = mockPoolInstance.querySync.mock.calls
      const relayUrls = calls.map(call => call[0])
      expect(relayUrls).toEqual([
        ['wss://relay.damus.io'],
        ['wss://nos.lol'],
        ['wss://relay.nostr.band'],
      ])

      // Each call uses the same filter
      for (const call of calls) {
        expect(call[1]).toEqual({ kinds: [30617], limit: 100 })
        expect(call[2]).toEqual({ maxWait: 2000 })
      }

      expect(result.repositories).toHaveLength(1)
      expect(result.repositories[0].id).toBe('my-repo')
    })

    // NFR-S1: Signature verification per relay
    it('should verify event signatures per relay and reject invalid ones', async () => {
      const validEvent = createRepoEvent('1', 'valid-repo', 'Valid Repo')
      const invalidEvent = createRepoEvent('2', 'bad-repo', 'Bad Repo')

      // Relay 1 returns both events, Relay 2 returns valid only, Relay 3 returns invalid only
      mockPoolInstance.querySync
        .mockResolvedValueOnce([validEvent, invalidEvent])
        .mockResolvedValueOnce([validEvent])
        .mockResolvedValueOnce([invalidEvent])

      vi.mocked(verifyEvent)
        .mockImplementation((event: unknown) => {
          return (event as NostrEvent).id === '1'
        })

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await fetchRepositoriesWithMeta()

      // Only the valid event should survive
      expect(result.repositories).toHaveLength(1)
      expect(result.repositories[0].id).toBe('valid-repo')

      // Invalid signatures should be logged
      expect(warnSpy).toHaveBeenCalledWith('Invalid signature rejected:', '2')
    })

    // NFR-R3: System functions with minimum 1/5 relays responding
    it('should return results when some relays fail (partial failure)', async () => {
      const event = createRepoEvent('1', 'my-repo', 'My Repo')

      // Relay 1 succeeds, Relay 2 fails, Relay 3 succeeds
      mockPoolInstance.querySync
        .mockResolvedValueOnce([event])
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockResolvedValueOnce([event])

      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchRepositoriesWithMeta()

      expect(result.repositories).toHaveLength(1) // Deduplicated
      expect(result.meta.respondedCount).toBe(2) // 2 relays succeeded
      expect(result.meta.totalCount).toBe(3) // 3 relays total
      expect(result.meta.results).toHaveLength(3) // All 3 relays recorded

      const successRelays = result.meta.results.filter(r => r.status === 'success')
      const failedRelays = result.meta.results.filter(r => r.status === 'failed')
      expect(successRelays).toHaveLength(2)
      expect(failedRelays).toHaveLength(1)
      expect(failedRelays[0].error).toBe('Connection refused')
    })

    // NFR-R7: Individual relay failures do not block user workflows
    it('should throw RELAY_TIMEOUT when ALL relays fail', async () => {
      mockPoolInstance.querySync.mockRejectedValue(new Error('All failed'))

      await expect(fetchRepositoriesWithMeta()).rejects.toMatchObject({
        code: 'RELAY_TIMEOUT',
        message: expect.stringContaining('All 3 relays failed'),
        userMessage: expect.stringContaining('Please try again'),
      })
    })

    // Event deduplication across relays
    it('should deduplicate events by ID when same event is returned from multiple relays', async () => {
      const event = createRepoEvent('1', 'my-repo', 'My Repo')

      // All 3 relays return the same event
      mockPoolInstance.querySync.mockResolvedValue([event])
      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchRepositoriesWithMeta()

      // Event should appear only once despite being returned by 3 relays
      expect(result.repositories).toHaveLength(1)
      // All 3 relays should have been queried
      expect(result.meta.respondedCount).toBe(3)
    })

    // Relay metadata structure validation
    it('should return correct RelayQueryMeta structure with timing data', async () => {
      const event = createRepoEvent('1', 'my-repo', 'My Repo')

      mockPoolInstance.querySync
        .mockResolvedValueOnce([event])
        .mockResolvedValueOnce([event])
        .mockRejectedValueOnce(new Error('Timeout'))

      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchRepositoriesWithMeta()

      // meta structure validation
      expect(result.meta).toHaveProperty('results')
      expect(result.meta).toHaveProperty('queriedAt')
      expect(result.meta).toHaveProperty('respondedCount')
      expect(result.meta).toHaveProperty('totalCount')

      // queriedAt should be a unix timestamp (seconds)
      expect(result.meta.queriedAt).toBeGreaterThan(0)
      expect(result.meta.queriedAt).toBeLessThanOrEqual(Math.floor(Date.now() / 1000))

      // Each relay result has required fields
      for (const relay of result.meta.results) {
        expect(relay).toHaveProperty('url')
        expect(relay).toHaveProperty('status')
        expect(relay).toHaveProperty('latencyMs')
        expect(relay).toHaveProperty('eventCount')
        expect(relay.latencyMs).toBeGreaterThanOrEqual(0)
        expect(['success', 'failed']).toContain(relay.status)
      }

      // Failed relay should have error string
      const failedRelay = result.meta.results.find(r => r.status === 'failed')
      expect(failedRelay).toBeDefined()
      expect(failedRelay!.error).toBe('Timeout')
      expect(failedRelay!.eventCount).toBe(0)

      // Successful relays should have event counts
      const successRelays = result.meta.results.filter(r => r.status === 'success')
      for (const relay of successRelays) {
        expect(relay.eventCount).toBeGreaterThan(0)
      }
    })

    it('should use custom limit parameter', async () => {
      mockPoolInstance.querySync.mockResolvedValue([])
      vi.mocked(verifyEvent).mockReturnValue(true)

      // All relays return empty -- will throw since respondedCount is 0
      // But we need at least one to succeed with events
      const event = createRepoEvent('1', 'my-repo', 'My Repo')
      mockPoolInstance.querySync.mockResolvedValue([event])

      await fetchRepositoriesWithMeta(50)

      // Each relay call should use limit: 50
      for (const call of mockPoolInstance.querySync.mock.calls) {
        expect(call[1]).toEqual({ kinds: [30617], limit: 50 })
      }
    })

    it('should record per-relay URLs correctly', async () => {
      const event = createRepoEvent('1', 'my-repo', 'My Repo')
      mockPoolInstance.querySync.mockResolvedValue([event])
      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchRepositoriesWithMeta()

      const urls = result.meta.results.map(r => r.url)
      expect(urls).toContain('wss://relay.damus.io')
      expect(urls).toContain('wss://nos.lol')
      expect(urls).toContain('wss://relay.nostr.band')
    })

    it('should handle mixed events from different relays and deduplicate correctly', async () => {
      const event1 = createRepoEvent('1', 'repo-a', 'Repo A')
      const event2 = createRepoEvent('2', 'repo-b', 'Repo B')
      const event3 = createRepoEvent('3', 'repo-c', 'Repo C')

      // Relay 1: event 1 and 2
      // Relay 2: event 2 and 3
      // Relay 3: event 1 and 3
      mockPoolInstance.querySync
        .mockResolvedValueOnce([event1, event2])
        .mockResolvedValueOnce([event2, event3])
        .mockResolvedValueOnce([event1, event3])

      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchRepositoriesWithMeta()

      // Should have 3 unique repositories, not 6
      expect(result.repositories).toHaveLength(3)
      const ids = result.repositories.map(r => r.id)
      expect(ids).toContain('repo-a')
      expect(ids).toContain('repo-b')
      expect(ids).toContain('repo-c')
    })

    it('should return empty repositories when no events returned from any relay', async () => {
      // All relays succeed but return no events
      mockPoolInstance.querySync.mockResolvedValue([])
      vi.mocked(verifyEvent).mockReturnValue(true)

      // This actually throws because respondedCount = 3 but events = 0
      // Wait -- no. respondedCount counts relays that returned successfully (even if 0 events).
      // The code: respondedCount = relayResults.filter(r => r.status === 'success').length
      // If all 3 relays return [] successfully, respondedCount = 3 and events = [].
      const result = await fetchRepositoriesWithMeta()

      expect(result.repositories).toEqual([])
      expect(result.meta.respondedCount).toBe(3)
    })

    // NFR-S1: Zod validation applied after relay merge
    it('should filter out events that fail Zod validation', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const validEvent = createRepoEvent('1', 'valid-repo', 'Valid Repo')
      const invalidEvent: NostrEvent = {
        id: '2',
        kind: 30617,
        content: '',
        pubkey: 'def',
        sig: 'sig',
        tags: [], // Missing required 'd' tag
        created_at: 456,
      }

      mockPoolInstance.querySync
        .mockResolvedValueOnce([validEvent, invalidEvent])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchRepositoriesWithMeta()

      expect(result.repositories).toHaveLength(1)
      expect(result.repositories[0].id).toBe('valid-repo')
      expect(warnSpy).toHaveBeenCalledWith(
        'Repository event validation failed:',
        '2',
        expect.anything()
      )
    })

    // NFR-R9: Network errors display user-friendly messages
    it('should include user-friendly message when all relays fail', async () => {
      mockPoolInstance.querySync.mockRejectedValue(new Error('Network unreachable'))

      try {
        await fetchRepositoriesWithMeta()
        expect.fail('Should have thrown')
      } catch (err: unknown) {
        const rigErr = err as { code: string; message: string; userMessage: string; context: Record<string, unknown> }
        expect(rigErr.code).toBe('RELAY_TIMEOUT')
        expect(rigErr.userMessage).toBe('Unable to connect to Nostr relays. Please try again.')
        expect(rigErr.context).toHaveProperty('relays')
        expect(rigErr.context).toHaveProperty('filter')
      }
    })

    // Non-Error thrown by relay (edge case)
    it('should handle non-Error exceptions from relays gracefully', async () => {
      // Relay 1 throws a string, Relay 2 succeeds, Relay 3 throws an object
      const event = createRepoEvent('1', 'my-repo', 'My Repo')
      mockPoolInstance.querySync
        .mockRejectedValueOnce('string error')
        .mockResolvedValueOnce([event])
        .mockRejectedValueOnce({ weird: 'object' })

      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchRepositoriesWithMeta()

      expect(result.repositories).toHaveLength(1)
      expect(result.meta.respondedCount).toBe(1)

      const failedRelays = result.meta.results.filter(r => r.status === 'failed')
      expect(failedRelays).toHaveLength(2)
      // Non-Error throws should have 'Unknown error' message
      for (const relay of failedRelays) {
        expect(relay.error).toBe('Unknown error')
      }
    })
  })

  describe('fetchIssues', () => {
    it('should query kind 1621 events and return Issue domain models', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 1621,
          content: 'test issue',
          pubkey: 'abc',
          sig: 'sig',
          tags: [
            ['a', 'owner/repo'],
            ['p', 'owner-pubkey']
          ],
          created_at: 123
        }
      ]

      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchIssues('owner/repo')

      expect(mockPoolInstance.querySync).toHaveBeenCalledWith(
        expect.any(Array),
        { kinds: [1621], '#a': ['owner/repo'], limit: 50 },
        { maxWait: 2000 }
      )

      // Should return transformed Issue objects
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: '1',
        repositoryId: 'owner/repo',
        author: 'abc',
        owner: 'owner-pubkey',
        content: 'test issue',
        status: 'open'
      })
    })

    it('should reject invalid signatures for issues', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 1621,
          content: '',
          pubkey: 'a',
          sig: 's',
          tags: [['a', 'owner/repo'], ['p', 'owner']],
          created_at: 1
        }
      ]
      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(false)

      const result = await fetchIssues('owner/repo')
      expect(result).toHaveLength(0)
    })

    it('should throw on relay failure', async () => {
      mockPoolInstance.querySync.mockRejectedValue(new Error('Timeout exceeded'))

      await expect(fetchIssues('owner/repo')).rejects.toMatchObject({
        code: 'RELAY_TIMEOUT'
      })
    })
  })

  describe('fetchPullRequests', () => {
    it('should query kind 1618 events and return PullRequest domain models', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 1618,
          content: 'test PR',
          pubkey: 'abc',
          sig: 'sig',
          tags: [
            ['a', 'owner/repo'],
            ['p', 'owner-pubkey']
          ],
          created_at: 123
        }
      ]

      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchPullRequests('owner/repo')

      expect(mockPoolInstance.querySync).toHaveBeenCalledWith(
        expect.any(Array),
        { kinds: [1618], '#a': ['owner/repo'], limit: 50 },
        { maxWait: 2000 }
      )

      // Should return transformed PullRequest objects
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: '1',
        repositoryId: 'owner/repo',
        author: 'abc',
        owner: 'owner-pubkey',
        content: 'test PR',
        status: 'open'
      })
    })

    it('should reject invalid signatures for pull requests', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 1618,
          content: '',
          pubkey: 'a',
          sig: 's',
          tags: [['a', 'owner/repo'], ['p', 'owner']],
          created_at: 1
        }
      ]
      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(false)

      const result = await fetchPullRequests('owner/repo')
      expect(result).toHaveLength(0)
    })

    it('should throw on relay failure', async () => {
      mockPoolInstance.querySync.mockRejectedValue(new Error('Network error'))

      await expect(fetchPullRequests('owner/repo')).rejects.toMatchObject({
        code: 'RELAY_TIMEOUT'
      })
    })
  })

  describe('fetchPatches', () => {
    it('should query kind 1617 events and return Patch domain models', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 1617,
          content: 'Fix bug\n\ndiff --git ...',
          pubkey: 'abc',
          sig: 'sig',
          tags: [
            ['a', 'owner/repo'],
            ['p', 'owner-pubkey'],
            ['commit', 'abc123'],
            ['committer', 'John Doe', 'john@example.com', '123', '+0000']
          ],
          created_at: 123
        }
      ]

      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchPatches('owner/repo')

      expect(mockPoolInstance.querySync).toHaveBeenCalledWith(
        expect.any(Array),
        { kinds: [1617], '#a': ['owner/repo'], limit: 50 },
        { maxWait: 2000 }
      )

      // Should return transformed Patch objects
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: '1',
        repositoryId: 'owner/repo',
        author: 'abc',
        owner: 'owner-pubkey',
        commitHash: 'abc123',
        commitMessage: 'Fix bug',
        status: 'open'
      })
    })

    it('should reject invalid signatures for patches', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 1617,
          content: '',
          pubkey: 'a',
          sig: 's',
          tags: [
            ['a', 'owner/repo'],
            ['p', 'owner'],
            ['commit', 'abc'],
            ['committer', 'Name', 'email', '1', '+0000']
          ],
          created_at: 1
        }
      ]
      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(false)

      const result = await fetchPatches('owner/repo')
      expect(result).toHaveLength(0)
    })

    it('should throw on relay failure', async () => {
      mockPoolInstance.querySync.mockRejectedValue(new Error('timeout'))

      await expect(fetchPatches('owner/repo')).rejects.toMatchObject({
        code: 'RELAY_TIMEOUT'
      })
    })
  })

  describe('fetchComments', () => {
    it('should query kind 1622 events and return Comment domain models', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 1622,
          content: 'test comment',
          pubkey: 'abc',
          sig: 'sig',
          tags: [
            ['e', 'event123', '', 'root']
          ],
          created_at: 123
        }
      ]

      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(true)

      const result = await fetchComments('event123')

      expect(mockPoolInstance.querySync).toHaveBeenCalledWith(
        expect.any(Array),
        { kinds: [1622], '#e': ['event123'], limit: 100 },
        { maxWait: 2000 }
      )

      // Should return transformed Comment objects
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: '1',
        targetEventId: 'event123',
        author: 'abc',
        content: 'test comment',
        rootId: 'event123',
        replyToId: null
      })
    })

    it('should reject invalid signatures for comments', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 1622,
          content: '',
          pubkey: 'a',
          sig: 's',
          tags: [['e', 'event123', '', 'root']],
          created_at: 1
        }
      ]
      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(false)

      const result = await fetchComments('event123')
      expect(result).toHaveLength(0)
    })

    it('should throw on relay failure', async () => {
      mockPoolInstance.querySync.mockRejectedValue(new Error('Socket closed'))

      await expect(fetchComments('event123')).rejects.toMatchObject({
        code: 'RELAY_TIMEOUT'
      })
    })
  })
})
