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
const { fetchRepositories, fetchIssues, fetchPullRequests, fetchPatches, fetchComments, destroyPool } = await import('./nostr')
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
