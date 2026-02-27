/**
 * useRepositories - TanStack Query hook for fetching repository announcements
 *
 * Wraps fetchRepositoriesWithMeta() from the Nostr service layer with TanStack Query
 * for caching, automatic retries, and stale-while-revalidate behavior.
 *
 * This is the reference pattern for ALL future data-fetching hooks in the app.
 *
 * Key design decisions:
 * - queryFn uses fetchRepositoriesWithMeta() to get both repositories and relay metadata
 * - Relay metadata is written to a separate cache key (relayStatusKeys.all()) as a side effect
 * - The query data type remains Repository[] (preserving existing return type)
 * - select uses deduplicateRepositories to transform cached data on read,
 *   keeping raw relay data intact in the cache
 * - staleTime matches CACHE_TTL_REPOSITORY (1 hour)
 * - Retries handled by global queryClient config (3 attempts, exponential backoff)
 *
 * Story 2.1: Repository List Page with Nostr Query
 * Story 2.5: Relay Status Indicators (fetchRepositoriesWithMeta + relay metadata caching)
 */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchRepositoriesWithMeta } from '@/lib/nostr'
import { repositoryKeys, relayStatusKeys } from '@/lib/query-client'
import type { Repository } from '@/types/repository'

/**
 * Deduplicate repositories by id, keeping the one with the latest createdAt.
 *
 * Multiple relays may return the same repository (same `d` tag / `id` field).
 * This function is used as the `select` option on useQuery to transform
 * cached data on read.
 *
 * @param repos - Array of repositories (potentially with duplicates)
 * @returns Deduplicated array with latest version of each repository
 */
export function deduplicateRepositories(repos: Repository[]): Repository[] {
  const map = new Map<string, Repository>()
  for (const repo of repos) {
    const existing = map.get(repo.id)
    if (!existing || repo.createdAt > existing.createdAt) {
      map.set(repo.id, repo)
    }
  }
  return Array.from(map.values())
}

/**
 * Hook to fetch and cache repository announcements from Nostr relays.
 *
 * Internally calls fetchRepositoriesWithMeta() and writes relay metadata
 * to a separate cache key (relayStatusKeys.all()) as a side effect.
 * The return type remains unchanged: TanStack Query result with Repository[].
 *
 * Returns TanStack Query result with { data, status, error, refetch }.
 * Use `status` field for state checks (not isLoading/isError).
 *
 * @returns TanStack Query result with deduplicated Repository array
 */
export function useRepositories() {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: repositoryKeys.all(),
    queryFn: async () => {
      const { repositories, meta } = await fetchRepositoriesWithMeta()
      // Write relay metadata to separate cache key as a side effect
      queryClient.setQueryData(relayStatusKeys.all(), meta)
      return repositories
    },
    select: deduplicateRepositories,
    staleTime: 60 * 60 * 1000, // 1 hour for repositories
  })
}
