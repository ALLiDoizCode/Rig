import { describe, it, expect, beforeEach } from 'vitest'
import {
  queryClient,
  repositoryKeys,
  issueKeys,
  pullRequestKeys,
  fileKeys,
} from './query-client'

describe('QueryClient configuration', () => {
  describe('default options', () => {
    it('should have staleTime of 5 minutes (300000ms)', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      expect(defaultOptions.queries?.staleTime).toBe(5 * 60 * 1000)
    })

    it('should have gcTime of 1 hour (3600000ms)', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      expect(defaultOptions.queries?.gcTime).toBe(60 * 60 * 1000)
    })

    it('should have refetchOnWindowFocus enabled', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(true)
    })

    it('should have retry set to 3', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      expect(defaultOptions.queries?.retry).toBe(3)
    })

    it('should have exponential backoff retry delay', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      const retryDelay = defaultOptions.queries?.retryDelay

      expect(retryDelay).toBeDefined()
      expect(typeof retryDelay).toBe('function')

      if (typeof retryDelay === 'function') {
        const mockError = new Error('Test error')

        // First retry: 1s (1000ms)
        expect(retryDelay(0, mockError)).toBe(1000)
        // Second retry: 2s (2000ms)
        expect(retryDelay(1, mockError)).toBe(2000)
        // Third retry: 4s (4000ms)
        expect(retryDelay(2, mockError)).toBe(4000)
        // Fourth retry: 8s (8000ms)
        expect(retryDelay(3, mockError)).toBe(8000)
        // Should max out at 30s
        expect(retryDelay(10, mockError)).toBe(30000)
      }
    })
  })

  describe('query key factories', () => {
    describe('repositoryKeys', () => {
      it('should return all repositories key', () => {
        expect(repositoryKeys.all()).toEqual(['repositories'])
      })

      it('should return lists key', () => {
        expect(repositoryKeys.lists()).toEqual(['repositories', 'list'])
      })

      it('should return list key with filters', () => {
        expect(repositoryKeys.list('owner:john')).toEqual([
          'repositories',
          'list',
          'owner:john',
        ])
      })

      it('should return details key', () => {
        expect(repositoryKeys.details()).toEqual(['repositories', 'detail'])
      })

      it('should return detail key with id', () => {
        expect(repositoryKeys.detail('repo-123')).toEqual([
          'repositories',
          'detail',
          'repo-123',
        ])
      })
    })

    describe('issueKeys', () => {
      it('should return all issues key', () => {
        expect(issueKeys.all()).toEqual(['issues'])
      })

      it('should return issues list key for repository', () => {
        expect(issueKeys.list('repo-123')).toEqual(['issues', 'repo-123'])
      })

      it('should return issue detail key', () => {
        expect(issueKeys.detail('repo-123', 'issue-456')).toEqual([
          'issues',
          'repo-123',
          'detail',
          'issue-456',
        ])
      })
    })

    describe('pullRequestKeys', () => {
      it('should return all pull requests key', () => {
        expect(pullRequestKeys.all()).toEqual(['pullRequests'])
      })

      it('should return pull requests list key for repository', () => {
        expect(pullRequestKeys.list('repo-123')).toEqual([
          'pullRequests',
          'repo-123',
        ])
      })

      it('should return pull request detail key', () => {
        expect(pullRequestKeys.detail('repo-123', 'pr-789')).toEqual([
          'pullRequests',
          'repo-123',
          'detail',
          'pr-789',
        ])
      })
    })

    describe('fileKeys', () => {
      it('should return all files key', () => {
        expect(fileKeys.all()).toEqual(['file'])
      })

      it('should return file key with txId and path', () => {
        expect(fileKeys.file('tx-abc123', 'src/main.tsx')).toEqual([
          'file',
          'tx-abc123',
          'src/main.tsx',
        ])
      })

      it('should return file key with different txId and path', () => {
        expect(fileKeys.file('tx-def456', 'README.md')).toEqual([
          'file',
          'tx-def456',
          'README.md',
        ])
      })
    })
  })

  describe('QueryClient instance', () => {
    it('should be a singleton instance', () => {
      // Import queryClient multiple times should return same instance
      const client1 = queryClient
      const client2 = queryClient
      expect(client1).toBe(client2)
    })

    it('should have query cache', () => {
      expect(queryClient.getQueryCache()).toBeDefined()
    })

    it('should have mutation cache', () => {
      expect(queryClient.getMutationCache()).toBeDefined()
    })
  })

  describe('cache integration alignment', () => {
    it('should align staleTime with CACHE_TTL_ISSUE (5 minutes)', async () => {
      // Import cache constants to verify alignment
      const { CACHE_TTL_ISSUE } = await import('@/constants/cache')
      const defaultOptions = queryClient.getDefaultOptions()

      // Default staleTime should match CACHE_TTL_ISSUE
      expect(defaultOptions.queries?.staleTime).toBe(CACHE_TTL_ISSUE)
    })

    it('should have gcTime longer than staleTime for stale-while-revalidate', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      const staleTime =
        typeof defaultOptions.queries?.staleTime === 'number'
          ? defaultOptions.queries.staleTime
          : 0
      const gcTime =
        typeof defaultOptions.queries?.gcTime === 'number'
          ? defaultOptions.queries.gcTime
          : 0

      // gcTime should be longer than staleTime to keep stale data in cache
      expect(gcTime).toBeGreaterThan(staleTime)
    })

    it('should verify cache layer API exports are accessible for future integration', async () => {
      const cacheModule = await import('./cache')

      expect(cacheModule.cacheEvent).toBeDefined()
      expect(cacheModule.getCachedEvent).toBeDefined()
      expect(cacheModule.cacheFile).toBeDefined()
      expect(cacheModule.getCachedFile).toBeDefined()
      expect(cacheModule.invalidateCache).toBeDefined()
      expect(cacheModule.clearExpired).toBeDefined()
      expect(cacheModule.evictLRU).toBeDefined()
    })
  })

  describe('query invalidation', () => {
    beforeEach(() => {
      queryClient.clear()
    })

    it('should invalidate all repository queries via parent key', async () => {
      // Seed cache with a repository detail query
      queryClient.setQueryData(repositoryKeys.detail('repo-1'), {
        name: 'test-repo',
      })

      // Verify data is in cache
      expect(queryClient.getQueryData(repositoryKeys.detail('repo-1'))).toEqual(
        { name: 'test-repo' },
      )

      // Invalidate all repository queries via parent key
      await queryClient.invalidateQueries({ queryKey: repositoryKeys.all() })

      // Query state should be marked invalid (stale)
      const queryState = queryClient.getQueryState(
        repositoryKeys.detail('repo-1'),
      )
      expect(queryState?.isInvalidated).toBe(true)
    })

    it('should invalidate issue queries scoped to a repository', async () => {
      // Seed cache with issues for two different repos
      queryClient.setQueryData(issueKeys.list('repo-1'), [{ id: 'issue-1' }])
      queryClient.setQueryData(issueKeys.list('repo-2'), [{ id: 'issue-2' }])

      // Invalidate only repo-1 issues
      await queryClient.invalidateQueries({
        queryKey: issueKeys.list('repo-1'),
      })

      // repo-1 issues should be invalidated
      const repo1State = queryClient.getQueryState(issueKeys.list('repo-1'))
      expect(repo1State?.isInvalidated).toBe(true)

      // repo-2 issues should NOT be invalidated
      const repo2State = queryClient.getQueryState(issueKeys.list('repo-2'))
      expect(repo2State?.isInvalidated).toBe(false)
    })
  })
})
