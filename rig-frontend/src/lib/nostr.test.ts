import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Event as NostrEvent } from 'nostr-tools'

// Mock nostr-tools
const mockPoolInstance = {
  querySync: vi.fn(),
  subscribeMany: vi.fn(),
  close: vi.fn()
}

let poolConstructorArgs: any = null
const MockSimplePool = vi.fn(function(this: any, options: any) {
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
const { fetchRepositories, fetchIssues, fetchPullRequests, fetchPatches, fetchComments } = await import('./nostr')
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

  describe('fetchRepositories', () => {
    it('should query kind 30617 events with default limit', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 30617,
          content: 'test repo',
          pubkey: 'abc123',
          sig: 'sig123',
          tags: [],
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
      expect(result).toEqual(mockEvents)
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
          content: 'valid',
          pubkey: 'abc',
          sig: 'valid_sig',
          tags: [],
          created_at: 123
        },
        {
          id: '2',
          kind: 30617,
          content: 'invalid',
          pubkey: 'def',
          sig: 'bad_sig',
          tags: [],
          created_at: 456
        }
      ]

      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent)
        .mockReturnValueOnce(true)   // First event valid
        .mockReturnValueOnce(false)  // Second event invalid

      const result = await fetchRepositories()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
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

    it('should throw GATEWAY_ERROR on non-timeout errors', async () => {
      mockPoolInstance.querySync.mockRejectedValue(new Error('Connection refused'))

      await expect(fetchRepositories()).rejects.toMatchObject({
        code: 'GATEWAY_ERROR',
        message: expect.stringContaining('Connection refused')
      })
    })

    it('should throw RigError with context on relay failure', async () => {
      mockPoolInstance.querySync.mockRejectedValue(new Error('Connection failed'))

      try {
        await fetchRepositories()
        expect.fail('Should have thrown error')
      } catch (err: any) {
        expect(err.code).toBe('GATEWAY_ERROR')
        expect(err.message).toContain('Connection failed')
        expect(err.userMessage).toBeTruthy()
        expect(err.context).toHaveProperty('relays')
      }
    })
  })

  describe('fetchIssues', () => {
    it('should query kind 1621 events with repoId filter', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 1621,
          content: 'test issue',
          pubkey: 'abc',
          sig: 'sig',
          tags: [['a', 'owner/repo']],
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
      expect(result).toEqual(mockEvents)
    })

    it('should reject invalid signatures for issues', async () => {
      const mockEvents: NostrEvent[] = [
        { id: '1', kind: 1621, content: '', pubkey: 'a', sig: 's', tags: [], created_at: 1 }
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
    it('should query kind 1618 events with repoId filter', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 1618,
          content: 'test PR',
          pubkey: 'abc',
          sig: 'sig',
          tags: [['a', 'owner/repo']],
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
      expect(result).toEqual(mockEvents)
    })

    it('should reject invalid signatures for pull requests', async () => {
      const mockEvents: NostrEvent[] = [
        { id: '1', kind: 1618, content: '', pubkey: 'a', sig: 's', tags: [], created_at: 1 }
      ]
      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(false)

      const result = await fetchPullRequests('owner/repo')
      expect(result).toHaveLength(0)
    })

    it('should throw on relay failure', async () => {
      mockPoolInstance.querySync.mockRejectedValue(new Error('Network error'))

      await expect(fetchPullRequests('owner/repo')).rejects.toMatchObject({
        code: 'GATEWAY_ERROR'
      })
    })
  })

  describe('fetchPatches', () => {
    it('should query kind 1617 events with repoId filter', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 1617,
          content: 'test patch',
          pubkey: 'abc',
          sig: 'sig',
          tags: [['a', 'owner/repo']],
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
      expect(result).toEqual(mockEvents)
    })

    it('should reject invalid signatures for patches', async () => {
      const mockEvents: NostrEvent[] = [
        { id: '1', kind: 1617, content: '', pubkey: 'a', sig: 's', tags: [], created_at: 1 }
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
    it('should query kind 1622 events with eventId filter', async () => {
      const mockEvents: NostrEvent[] = [
        {
          id: '1',
          kind: 1622,
          content: 'test comment',
          pubkey: 'abc',
          sig: 'sig',
          tags: [['e', 'event123']],
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
      expect(result).toEqual(mockEvents)
    })

    it('should reject invalid signatures for comments', async () => {
      const mockEvents: NostrEvent[] = [
        { id: '1', kind: 1622, content: '', pubkey: 'a', sig: 's', tags: [], created_at: 1 }
      ]
      mockPoolInstance.querySync.mockResolvedValue(mockEvents)
      vi.mocked(verifyEvent).mockReturnValue(false)

      const result = await fetchComments('event123')
      expect(result).toHaveLength(0)
    })

    it('should throw on relay failure', async () => {
      mockPoolInstance.querySync.mockRejectedValue(new Error('Socket closed'))

      await expect(fetchComments('event123')).rejects.toMatchObject({
        code: 'GATEWAY_ERROR'
      })
    })
  })
})
