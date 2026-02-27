/**
 * useRealtimeRepositories - Subscription hook for real-time repository updates
 *
 * Subscribes to kind 30617 repository announcement events via WebSocket.
 * When a new valid event arrives, invalidates the TanStack Query cache
 * (which triggers a refetch by useRepositories) and shows a toast notification.
 *
 * Architecture: This is a subscription hook (side-effect only, no return value).
 * It works alongside useRepositories (the query hook) following the project's
 * separation pattern for subscriptions vs queries.
 *
 * Lifecycle:
 * - Subscription created when the hook mounts (via useEffect)
 * - Subscription closed when the hook unmounts (via cleanup return)
 *
 * Story 2.6: Real-Time Repository Updates
 */
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { subscribeToRepositories } from '@/lib/nostr'
import { repositoryKeys } from '@/lib/query-client'
import type { Event as NostrEvent } from 'nostr-tools'

/** Maximum length for repository names displayed in toast notifications */
const MAX_REPO_NAME_LENGTH = 100

/**
 * Extract repository name from a kind 30617 event's tags.
 *
 * Fallback chain: name tag -> d tag -> "Unknown repository"
 *
 * Truncates names longer than MAX_REPO_NAME_LENGTH to prevent UI issues
 * from maliciously crafted events with extremely long tag values.
 */
function extractRepoName(event: NostrEvent): string {
  const nameTag = event.tags.find(t => t[0] === 'name')
  const raw = nameTag?.[1] || event.tags.find(t => t[0] === 'd')?.[1] || 'Unknown repository'

  if (raw.length > MAX_REPO_NAME_LENGTH) {
    return raw.slice(0, MAX_REPO_NAME_LENGTH) + '...'
  }
  return raw
}

/**
 * Subscribe to real-time repository announcement events.
 *
 * Call at the top of a component function (React rules of hooks).
 * No return value -- this is a side-effect-only hook.
 */
export function useRealtimeRepositories(): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    const sub = subscribeToRepositories((event: NostrEvent) => {
      const repoName = extractRepoName(event)
      queryClient.invalidateQueries({ queryKey: repositoryKeys.all() })
      toast(`New repository added: ${repoName}`, {
        duration: 5000,
      })
    })

    return () => {
      sub.close()
    }
  }, [queryClient])
}
