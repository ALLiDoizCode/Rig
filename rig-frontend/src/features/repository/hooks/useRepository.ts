/**
 * useRepository - TanStack Query hook for fetching a single repository
 *
 * Fetches all repositories from Nostr relays and finds the matching one
 * by owner pubkey AND repository id (d-tag). Leverages TanStack Query
 * caching so that navigating from the list page reuses cached data.
 *
 * When the repository list is already cached (e.g., the user navigated from
 * the home page), the hook provides initialData from that cache to avoid a
 * redundant network call. If the list cache is empty or the repo is not found
 * in it, the queryFn fetches fresh data from relays.
 *
 * The queryFn uses fetchRepositoriesWithMeta() and writes relay metadata to
 * the cache as a side effect, ensuring the RelayStatusBadge on the detail page
 * has fresh data even when navigating directly to a repo URL.
 *
 * Story 2.4: Repository Detail Page
 * Story 2.5: Relay Status Indicators (relay metadata caching)
 */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchRepositoriesWithMeta } from '@/lib/nostr'
import { repositoryKeys, relayStatusKeys } from '@/lib/query-client'
import type { Repository } from '@/types/repository'

/**
 * Hook to fetch a single repository by owner and id.
 *
 * Uses fetchRepositoriesWithMeta() and filters for the matching repo.
 * TanStack Query caching (staleTime: 1 hour) prevents redundant
 * network calls when navigating from the list page. Additionally,
 * checks the list cache (repositoryKeys.all()) for initialData so
 * that the detail page can render instantly when coming from the list.
 *
 * @param owner - Repository owner pubkey
 * @param repoId - Repository identifier (d-tag)
 * @returns TanStack Query result with Repository | null
 */
export function useRepository(owner: string, repoId: string) {
  const queryClient = useQueryClient()

  return useQuery<Repository | null>({
    queryKey: repositoryKeys.detail(repoId),
    queryFn: async () => {
      const { repositories, meta } = await fetchRepositoriesWithMeta()
      // Write relay metadata to separate cache key as a side effect
      // (same pattern as useRepositories) so RepoDetail's RelayStatusBadge
      // shows correct data even when navigating directly to a detail page
      queryClient.setQueryData(relayStatusKeys.all(), meta)
      return repositories.find((r) => r.owner === owner && r.id === repoId) ?? null
    },
    initialData: () => {
      const cachedRepos = queryClient.getQueryData<Repository[]>(
        repositoryKeys.all()
      )
      if (!cachedRepos) return undefined
      return (
        cachedRepos.find((r) => r.owner === owner && r.id === repoId) ?? undefined
      )
    },
    // Tell TanStack Query when the initialData was last fetched so it can
    // honour staleTime correctly. Without this, initialData is treated as
    // fetched at epoch 0 and the queryFn always runs (defeating the cache).
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(repositoryKeys.all())?.dataUpdatedAt,
    staleTime: 60 * 60 * 1000, // 1 hour, matching repository caching
  })
}
