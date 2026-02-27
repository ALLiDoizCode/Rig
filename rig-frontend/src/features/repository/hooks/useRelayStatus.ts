/**
 * useRelayStatus - Hook for reading relay query metadata from TanStack Query cache
 *
 * Passively reads relay metadata written by useRepositories. Does not trigger
 * its own network requests. Provides relay results, counts, and a data age
 * indicator that updates every 30 seconds.
 *
 * Story 2.5: Relay Status Indicators
 */
import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { relayStatusKeys, repositoryKeys } from '@/lib/query-client'
import type { RelayResult, RelayQueryMeta } from '@/types/relay-status'

/**
 * Hook to read relay status metadata from TanStack Query cache.
 *
 * The relay metadata is written to cache by useRepositories as a side effect
 * of fetching repositories via fetchRepositoriesWithMeta(). This hook reads
 * that metadata passively (enabled: false, staleTime: Infinity).
 *
 * @returns Relay status data including results, counts, data age, and refetch
 */
export function useRelayStatus(): {
  /** The full relay metadata object from cache, or undefined if not yet available */
  meta: RelayQueryMeta | undefined
  relayResults: RelayResult[]
  respondedCount: number
  totalCount: number
  lastUpdated: number | null
  dataAge: string
  refetch: () => void
} {
  const queryClient = useQueryClient()

  // Passive cache reader -- only updated when useRepositories writes to cache.
  // The queryFn placeholder is never called (enabled: false) but prevents
  // TanStack Query's "No queryFn" console warning.
  const { data: meta } = useQuery<RelayQueryMeta>({
    queryKey: relayStatusKeys.all(),
    queryFn: () => Promise.reject(new Error('useRelayStatus is a passive cache reader')),
    enabled: false,
    staleTime: Infinity,
  })

  const relayResults = meta?.results ?? []
  const respondedCount = meta?.respondedCount ?? 0
  const totalCount = meta?.totalCount ?? 0
  const lastUpdated = meta?.queriedAt ?? null

  // Data age indicator -- updates every 30 seconds without re-querying relays
  const [dataAge, setDataAge] = useState('')

  useEffect(() => {
    function updateAge() {
      if (!lastUpdated) {
        setDataAge('')
        return
      }
      setDataAge(formatDistanceToNow(new Date(lastUpdated * 1000), { addSuffix: true }))
    }
    updateAge()
    const interval = setInterval(updateAge, 30_000)
    return () => clearInterval(interval)
  }, [lastUpdated])

  // Refetch triggers a repository refetch, which updates relay metadata as a side effect
  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: repositoryKeys.all() })
  }, [queryClient])

  return {
    meta,
    relayResults,
    respondedCount,
    totalCount,
    lastUpdated,
    dataAge,
    refetch,
  }
}
