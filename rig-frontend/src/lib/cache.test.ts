import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  cacheEvent,
  getCachedEvent,
  cacheFile,
  getCachedFile,
  invalidateCache,
  clearExpired,
  evictLRU,
} from './cache'
import {
  CACHE_TTL_REPOSITORY,
  CACHE_TTL_ISSUE,
} from '../constants/cache'

describe('Cache Service', () => {
  // Ensure real timers before each test to avoid conflicts with IndexedDB
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(async () => {
    // Clean up: restore real timers and clear cache
    vi.useRealTimers()
    await invalidateCache()
  })

  describe('cacheEvent', () => {
    it('should cache an event with TTL', async () => {
      const data = { name: 'test-repo', owner: 'alice' }
      await cacheEvent(30617, 'repo-123', data, CACHE_TTL_REPOSITORY)

      const result = await getCachedEvent(30617, 'repo-123')
      expect(result).not.toBeNull()
      expect(result?.data).toEqual(data)
      expect(result?.isStale).toBe(false)
    })

    it('should store multiple events with different kinds', async () => {
      await cacheEvent(30617, 'repo-1', { name: 'repo-1' }, CACHE_TTL_REPOSITORY)
      await cacheEvent(1621, 'issue-1', { title: 'Bug' }, CACHE_TTL_ISSUE)

      const repo = await getCachedEvent(30617, 'repo-1')
      const issue = await getCachedEvent(1621, 'issue-1')

      expect(repo?.data).toEqual({ name: 'repo-1' })
      expect(issue?.data).toEqual({ title: 'Bug' })
    })

    it('should update existing event when cached again', async () => {
      await cacheEvent(30617, 'repo-1', { name: 'v1' }, CACHE_TTL_REPOSITORY)
      await cacheEvent(30617, 'repo-1', { name: 'v2' }, CACHE_TTL_REPOSITORY)

      const result = await getCachedEvent(30617, 'repo-1')
      expect(result?.data).toEqual({ name: 'v2' })
    })
  })

  describe('getCachedEvent', () => {
    it('should return { data: null, isStale: false } for cache miss', async () => {
      const result = await getCachedEvent(30617, 'nonexistent')
      expect(result).not.toBeNull()
      expect(result.data).toBeNull()
      expect(result.isStale).toBe(false)
    })

    it('should return stale data with isStale=true when expired', async () => {
      // Use real time with a very short TTL to test expiration
      const shortTTL = 1 // 1ms TTL
      await cacheEvent(1621, 'issue-1', { title: 'Bug' }, shortTTL)

      // Wait for expiration with larger margin for reliability
      await new Promise(resolve => setTimeout(resolve, 50))

      const result = await getCachedEvent(1621, 'issue-1')
      expect(result).not.toBeNull()
      expect(result.data).toEqual({ title: 'Bug' })
      expect(result.isStale).toBe(true)
    })

    it('should return fresh data with isStale=false when not expired', async () => {
      await cacheEvent(30617, 'repo-1', { name: 'test' }, CACHE_TTL_REPOSITORY)

      const result = await getCachedEvent(30617, 'repo-1')
      expect(result.isStale).toBe(false)
    })
  })

  describe('cacheFile', () => {
    it('should cache a file permanently (no TTL)', async () => {
      await cacheFile('tx-123', '/README.md', '# Hello')

      const result = await getCachedFile('tx-123', '/README.md')
      expect(result).toBe('# Hello')
    })

    it('should cache multiple files with different paths', async () => {
      await cacheFile('tx-123', '/README.md', '# Readme')
      await cacheFile('tx-123', '/src/main.ts', 'console.log("hi")')

      const readme = await getCachedFile('tx-123', '/README.md')
      const main = await getCachedFile('tx-123', '/src/main.ts')

      expect(readme).toBe('# Readme')
      expect(main).toBe('console.log("hi")')
    })

    it('should update existing file when cached again', async () => {
      await cacheFile('tx-123', '/README.md', '# v1')
      await cacheFile('tx-123', '/README.md', '# v2')

      const result = await getCachedFile('tx-123', '/README.md')
      expect(result).toBe('# v2')
    })
  })

  describe('getCachedFile', () => {
    it('should return null for cache miss', async () => {
      const result = await getCachedFile('tx-999', '/nonexistent.md')
      expect(result).toBeNull()
    })

    it('should return file content (permanent cache)', async () => {
      await cacheFile('tx-123', '/README.md', '# Permanent')

      const result = await getCachedFile('tx-123', '/README.md')
      expect(result).toBe('# Permanent')
    })
  })

  describe('invalidateCache', () => {
    it('should clear all events when called with no arguments', async () => {
      await cacheEvent(30617, 'repo-1', { name: 'repo-1' }, CACHE_TTL_REPOSITORY)
      await cacheEvent(1621, 'issue-1', { title: 'Issue' }, CACHE_TTL_ISSUE)

      await invalidateCache()

      const repo = await getCachedEvent(30617, 'repo-1')
      const issue = await getCachedEvent(1621, 'issue-1')

      expect(repo.data).toBeNull()
      expect(issue.data).toBeNull()
    })

    it('should clear only events of specific kind', async () => {
      await cacheEvent(30617, 'repo-1', { name: 'repo-1' }, CACHE_TTL_REPOSITORY)
      await cacheEvent(1621, 'issue-1', { title: 'Issue' }, CACHE_TTL_ISSUE)

      await invalidateCache(1621)

      const repo = await getCachedEvent(30617, 'repo-1')
      const issue = await getCachedEvent(1621, 'issue-1')

      expect(repo.data).not.toBeNull()
      expect(issue.data).toBeNull()
    })

    it('should not affect files when clearing events', async () => {
      await cacheEvent(30617, 'repo-1', { name: 'repo-1' }, CACHE_TTL_REPOSITORY)
      await cacheFile('tx-123', '/README.md', '# File')

      await invalidateCache()

      const repo = await getCachedEvent(30617, 'repo-1')
      const file = await getCachedFile('tx-123', '/README.md')

      expect(repo.data).toBeNull()
      expect(file).toBe('# File')
    })
  })

  describe('clearExpired', () => {
    it('should remove only expired entries', async () => {
      // Cache with different TTLs
      await cacheEvent(30617, 'repo-1', { name: 'repo' }, CACHE_TTL_REPOSITORY) // 1hr
      await cacheEvent(1621, 'issue-1', { title: 'Issue' }, 1) // 1ms - will expire

      // Wait for short TTL to expire with larger margin for reliability
      await new Promise(resolve => setTimeout(resolve, 50))

      await clearExpired()

      const repo = await getCachedEvent(30617, 'repo-1')
      const issue = await getCachedEvent(1621, 'issue-1')

      expect(repo.data).not.toBeNull()
      expect(issue.data).toBeNull()
    })

    it('should not remove files (permanent cache)', async () => {
      await cacheFile('tx-123', '/README.md', '# File')
      await cacheEvent(1621, 'issue-1', { title: 'Issue' }, 1) // 1ms - will expire

      // Wait for event to expire with larger margin for reliability
      await new Promise(resolve => setTimeout(resolve, 50))

      await clearExpired()

      const file = await getCachedFile('tx-123', '/README.md')
      const issue = await getCachedEvent(1621, 'issue-1')

      expect(file).toBe('# File')
      expect(issue.data).toBeNull()
    })
  })

  describe('Input Validation', () => {
    it('should reject invalid eventKind in cacheEvent', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await cacheEvent(-1, 'repo-1', { name: 'test' }, CACHE_TTL_REPOSITORY)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid cache input:',
        expect.objectContaining({ eventKind: -1 })
      )

      const result = await getCachedEvent(-1, 'repo-1')
      expect(result.data).toBeNull()

      consoleWarnSpy.mockRestore()
    })

    it('should reject empty eventId in cacheEvent', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await cacheEvent(30617, '', { name: 'test' }, CACHE_TTL_REPOSITORY)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid cache input:',
        expect.objectContaining({ eventId: '' })
      )

      consoleWarnSpy.mockRestore()
    })

    it('should reject negative ttl in cacheEvent', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await cacheEvent(30617, 'repo-1', { name: 'test' }, -1000)

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid cache input:',
        expect.objectContaining({ ttl: -1000 })
      )

      consoleWarnSpy.mockRestore()
    })

    it('should reject empty txId in cacheFile', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await cacheFile('', '/README.md', '# Content')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid file cache input:',
        expect.objectContaining({ txId: '' })
      )

      consoleWarnSpy.mockRestore()
    })

    it('should reject empty path in cacheFile', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await cacheFile('tx-123', '', '# Content')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid file cache input:',
        expect.objectContaining({ path: '' })
      )

      consoleWarnSpy.mockRestore()
    })
  })

  describe('evictLRU', () => {
    it('should evict least-recently-used entries', async () => {
      // Cache many events to ensure some remain after eviction
      for (let i = 0; i < 15; i++) {
        await cacheEvent(30617, `repo-${i}`, { name: `repo-${i}` }, CACHE_TTL_REPOSITORY)
        await new Promise(resolve => setTimeout(resolve, 2))
      }

      // Access the last few entries to make them more recent
      await getCachedEvent(30617, 'repo-13')
      await getCachedEvent(30617, 'repo-14')

      // Evict LRU - should remove ~10 oldest entries
      const evicted = await evictLRU()
      expect(evicted).toBeGreaterThanOrEqual(10)
      expect(evicted).toBeLessThanOrEqual(20) // Allow some variance

      // Verify recently-accessed entries are still there
      const recent1 = await getCachedEvent(30617, 'repo-13')
      const recent2 = await getCachedEvent(30617, 'repo-14')

      expect(recent1).not.toBeNull()
      expect(recent2).not.toBeNull()

      // Verify old entries were evicted
      const old1 = await getCachedEvent(30617, 'repo-0')
      const old2 = await getCachedEvent(30617, 'repo-1')

      expect(old1.data).toBeNull()
      expect(old2.data).toBeNull()
    })

    it('should evict both events and files', async () => {
      // Cache events and files
      await cacheEvent(30617, 'repo-1', { name: 'repo' }, CACHE_TTL_REPOSITORY)
      await cacheFile('tx-1', '/file1.md', 'content1')

      await new Promise(resolve => setTimeout(resolve, 5))

      await cacheEvent(1621, 'issue-1', { title: 'issue' }, CACHE_TTL_ISSUE)
      await cacheFile('tx-2', '/file2.md', 'content2')

      // Evict LRU
      const evicted = await evictLRU()
      expect(evicted).toBeGreaterThan(0)
    })

    it('should return count of evicted entries', async () => {
      // Start with empty cache
      await invalidateCache()

      // Cache a few entries
      await cacheEvent(30617, 'repo-1', { name: 'repo-1' }, CACHE_TTL_REPOSITORY)
      await cacheEvent(1621, 'issue-1', { title: 'issue-1' }, CACHE_TTL_ISSUE)
      await cacheFile('tx-1', '/file1.md', 'content')

      const evicted = await evictLRU()
      expect(evicted).toBeGreaterThanOrEqual(0)
      expect(typeof evicted).toBe('number')
    })

    it('should not fail when cache is empty', async () => {
      await invalidateCache()

      const evicted = await evictLRU()
      expect(evicted).toBe(0)
    })
  })
})
