/**
 * TanStack Query Configuration
 *
 * Configures the QueryClient for async state management across the application.
 * Integrates with IndexedDB cache layer (Story 1.4) for hybrid caching strategy.
 *
 * Configuration decisions:
 * - staleTime: 5 minutes default (issues/PRs) - matches CACHE_TTL_ISSUE
 * - gcTime: 1 hour - keeps data in cache while stale (v5 renamed from cacheTime)
 * - refetchOnWindowFocus: true - ensures fresh data when user returns
 * - retry: 3 with exponential backoff - resilient against transient failures
 *
 * Per-query staleTime overrides:
 * - Repositories: 1 hour (matches CACHE_TTL_REPOSITORY)
 * - Issues/PRs: 5 minutes (default, matches CACHE_TTL_ISSUE)
 *
 * Query Key Convention:
 * The epics spec defines simple flat keys (e.g., ['repository', repoId]).
 * This implementation uses hierarchical factory functions instead, which enable
 * parent-level cache invalidation (e.g., invalidating repositoryKeys.all()
 * clears both list and detail queries). All future stories MUST use these
 * factory functions rather than hand-written key arrays to ensure consistency.
 *
 * @see {@link https://tanstack.com/query/v5/docs/react/overview|TanStack Query v5 Docs}
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * Singleton QueryClient instance for the application.
 *
 * Configuration aligns with IndexedDB cache TTLs:
 * - Default staleTime (5min) matches CACHE_TTL_ISSUE (300000ms)
 * - Repository staleTime (1hr) matches CACHE_TTL_REPOSITORY (3600000ms)
 * - gcTime (1hr) keeps data in cache while stale for better UX
 *
 * Retry strategy:
 * - 3 retries with exponential backoff: 1s, 2s, 4s, max 30s
 * - Handles transient Nostr relay and Arweave gateway failures
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default staleTime: 5 minutes (issues, PRs, comments)
      // Matches CACHE_TTL_ISSUE from constants/cache.ts
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Garbage collection time: 1 hour
      // Keeps data in cache while stale for stale-while-revalidate pattern
      // IMPORTANT: v5 renamed cacheTime → gcTime
      gcTime: 60 * 60 * 1000, // 1 hour

      // Refetch when user returns to window
      // Ensures fresh data after user switches tabs/apps
      refetchOnWindowFocus: true,

      // Retry failed queries 3 times before showing error
      retry: 3,

      // Exponential backoff: 1s, 2s, 4s, 8s...max 30s
      // Helps with transient relay/gateway failures
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      retryDelay: (attemptIndex: number, _error: Error) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

/**
 * Query key factory for repository queries.
 *
 * Hierarchical structure enables efficient cache invalidation:
 * - Invalidate all repositories: queryClient.invalidateQueries(repositoryKeys.all())
 * - Invalidate specific repository: queryClient.invalidateQueries(repositoryKeys.detail(id))
 * - Invalidate all lists: queryClient.invalidateQueries(repositoryKeys.lists())
 *
 * @example
 * // Fetch all repositories
 * useQuery({
 *   queryKey: repositoryKeys.all(),
 *   queryFn: fetchRepositories,
 *   staleTime: 60 * 60 * 1000, // 1 hour for repositories
 * })
 *
 * @example
 * // Fetch specific repository
 * useQuery({
 *   queryKey: repositoryKeys.detail('repo-123'),
 *   queryFn: () => fetchRepository('repo-123'),
 * })
 */
export const repositoryKeys = {
  /** Base key for all repository queries */
  all: () => ['repositories'] as const,

  /** Key for all repository lists (with various filters) */
  lists: () => [...repositoryKeys.all(), 'list'] as const,

  /** Key for repository list with specific filters */
  list: (filters: string) => [...repositoryKeys.lists(), filters] as const,

  /** Key for all repository detail queries */
  details: () => [...repositoryKeys.all(), 'detail'] as const,

  /** Key for specific repository detail */
  detail: (id: string) => [...repositoryKeys.details(), id] as const,
}

/**
 * Query key factory for relay status metadata.
 *
 * Relay metadata is stored in a separate cache key from repository data.
 * Updated as a side effect when useRepositories fetches data via
 * fetchRepositoriesWithMeta(). Read passively by useRelayStatus hook.
 *
 * @example
 * // Write relay metadata to cache
 * queryClient.setQueryData(relayStatusKeys.all(), meta)
 *
 * // Read relay metadata from cache
 * useQuery({ queryKey: relayStatusKeys.all(), enabled: false })
 */
export const relayStatusKeys = {
  /** Key for relay status metadata */
  all: () => ['relay-status'] as const,
}

/**
 * Query key factory for issue queries.
 *
 * Issues are scoped by repository ID for efficient cache invalidation.
 *
 * @example
 * // Fetch issues for a repository
 * useQuery({
 *   queryKey: issueKeys.list('repo-123'),
 *   queryFn: () => fetchIssues('repo-123'),
 * })
 */
export const issueKeys = {
  /** Base key for all issue queries */
  all: () => ['issues'] as const,

  /** Key for issues list for a specific repository */
  list: (repoId: string) => [...issueKeys.all(), repoId] as const,

  /** Key for specific issue detail */
  detail: (repoId: string, issueId: string) =>
    [...issueKeys.all(), repoId, 'detail', issueId] as const,
}

/**
 * Query key factory for pull request queries.
 *
 * Pull requests are scoped by repository ID similar to issues.
 *
 * @example
 * // Fetch PRs for a repository
 * useQuery({
 *   queryKey: pullRequestKeys.list('repo-123'),
 *   queryFn: () => fetchPullRequests('repo-123'),
 * })
 */
export const pullRequestKeys = {
  /** Base key for all pull request queries */
  all: () => ['pullRequests'] as const,

  /** Key for pull requests list for a specific repository */
  list: (repoId: string) => [...pullRequestKeys.all(), repoId] as const,

  /** Key for specific pull request detail */
  detail: (repoId: string, prId: string) =>
    [...pullRequestKeys.all(), repoId, 'detail', prId] as const,
}

/**
 * Query key factory for Arweave file queries.
 *
 * Files are identified by transaction ID (txId) and file path.
 * Arweave content is immutable, so these queries rarely need invalidation.
 *
 * @example
 * // Fetch file from Arweave
 * useQuery({
 *   queryKey: fileKeys.file('tx-abc123', 'src/main.tsx'),
 *   queryFn: () => fetchFile('tx-abc123', 'src/main.tsx'),
 * })
 */
export const fileKeys = {
  /** Base key for all file queries */
  all: () => ['file'] as const,

  /** Key for specific file by transaction ID and path */
  file: (txId: string, path: string) =>
    [...fileKeys.all(), txId, path] as const,
}
