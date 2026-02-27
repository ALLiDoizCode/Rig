import { describe, it, expect } from 'vitest'
import type { CachedEvent, CachedFile, CacheResult } from './cache'

describe('Cache Type Definitions', () => {
  describe('CachedEvent', () => {
    it('should allow creating a valid CachedEvent object', () => {
      const event: CachedEvent = {
        id: 1,
        eventKind: 30617,
        eventId: 'abc123',
        data: { name: 'test-repo' },
        cachedAt: 1000000,
        expiresAt: 2000000,
        lastAccessedAt: 1500000,
      }
      expect(event.eventKind).toBe(30617)
      expect(event.eventId).toBe('abc123')
      expect(event.data).toEqual({ name: 'test-repo' })
    })

    it('should allow optional id field', () => {
      const event: Omit<CachedEvent, 'id'> = {
        eventKind: 1621,
        eventId: 'issue-1',
        data: { title: 'Bug report' },
        cachedAt: 1000000,
        expiresAt: 2000000,
        lastAccessedAt: 1500000,
      }
      expect(event.eventKind).toBe(1621)
    })

    it('should store arbitrary data payload', () => {
      const event: CachedEvent = {
        id: 1,
        eventKind: 1618,
        eventId: 'pr-1',
        data: {
          title: 'Fix bug',
          status: 'open',
          author: { name: 'alice' },
          nested: { deep: { value: 42 } },
        },
        cachedAt: Date.now(),
        expiresAt: Date.now() + 300000,
        lastAccessedAt: Date.now(),
      }
      expect(event.data).toHaveProperty('nested.deep.value', 42)
    })
  })

  describe('CachedFile', () => {
    it('should allow creating a valid CachedFile object', () => {
      const file: CachedFile = {
        id: 1,
        txId: 'arweave-tx-123',
        path: '/README.md',
        content: '# Hello World',
        cachedAt: 1000000,
        lastAccessedAt: 1500000,
      }
      expect(file.txId).toBe('arweave-tx-123')
      expect(file.path).toBe('/README.md')
      expect(file.content).toBe('# Hello World')
    })

    it('should allow optional id field', () => {
      const file: Omit<CachedFile, 'id'> = {
        txId: 'arweave-tx-456',
        path: '/src/main.ts',
        content: 'console.log("test")',
        cachedAt: Date.now(),
        lastAccessedAt: Date.now(),
      }
      expect(file.txId).toBe('arweave-tx-456')
    })

    it('should not have expiresAt field (permanent cache)', () => {
      const file: CachedFile = {
        id: 1,
        txId: 'arweave-tx-789',
        path: '/package.json',
        content: '{}',
        cachedAt: Date.now(),
        lastAccessedAt: Date.now(),
      }
      // TypeScript would error if expiresAt is present
      expect(file).not.toHaveProperty('expiresAt')
    })
  })

  describe('CacheResult', () => {
    it('should allow creating a CacheResult with data and isStale=false', () => {
      const result: CacheResult<{ name: string }> = {
        data: { name: 'test-repo' },
        isStale: false,
      }
      expect(result.data).toEqual({ name: 'test-repo' })
      expect(result.isStale).toBe(false)
    })

    it('should allow creating a CacheResult with data and isStale=true', () => {
      const result: CacheResult<{ title: string }> = {
        data: { title: 'Bug report' },
        isStale: true,
      }
      expect(result.data).toEqual({ title: 'Bug report' })
      expect(result.isStale).toBe(true)
    })

    it('should support null data for cache misses', () => {
      const result: CacheResult<{ name: string }> = {
        data: null,
        isStale: false,
      }
      expect(result.data).toBeNull()
      expect(result.isStale).toBe(false)
    })

    it('should be generic over any data type', () => {
      const stringResult: CacheResult<string> = {
        data: 'hello',
        isStale: false,
      }
      const numberResult: CacheResult<number> = {
        data: 42,
        isStale: true,
      }
      const arrayResult: CacheResult<string[]> = {
        data: ['a', 'b', 'c'],
        isStale: false,
      }
      expect(stringResult.data).toBe('hello')
      expect(numberResult.data).toBe(42)
      expect(arrayResult.data).toEqual(['a', 'b', 'c'])
    })
  })
})
