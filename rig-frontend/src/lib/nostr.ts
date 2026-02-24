import { SimplePool } from 'nostr-tools/pool'
import { verifyEvent } from 'nostr-tools/pure'
import type { Event as NostrEvent, Filter } from 'nostr-tools'
import {
  REPO_ANNOUNCEMENT,
  ISSUE,
  PULL_REQUEST,
  PATCH,
  COMMENT,
  DEFAULT_RELAYS
} from '@/constants/nostr'
import type { RigError } from '@/types/common'

/**
 * Shared SimplePool instance for all Nostr relay connections.
 *
 * Configured with automatic reconnection and ping for connection health.
 * Reused across the entire application for efficient connection management.
 */
const pool = new SimplePool({
  enableReconnect: true,  // Auto-reconnect on WebSocket disconnect
  enablePing: true        // Send periodic pings for connection health
})

/**
 * Query events from Nostr relays with signature verification
 *
 * @param filter - Nostr event filter (kind, tags, etc.)
 * @param timeout - Query timeout in milliseconds (default: 2000ms per NFR-P8)
 * @returns Validated NostrEvent array
 * @throws RigError with code 'RELAY_TIMEOUT' or 'SIGNATURE_INVALID'
 */
async function queryEvents(
  filter: Filter,
  timeout = 2000
): Promise<NostrEvent[]> {
  try {
    const events = await pool.querySync(DEFAULT_RELAYS, filter, { maxWait: timeout })

    // Signature validation (NFR-S1)
    const validatedEvents = events.filter((event: NostrEvent) => {
      const isValid = verifyEvent(event)
      if (!isValid) {
        // Log warning for invalid signatures (NFR-S3)
        console.warn('Invalid signature rejected:', event.id)
      }
      return isValid
    })

    return validatedEvents
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isTimeout = message.toLowerCase().includes('timeout')
    throw {
      code: isTimeout ? 'RELAY_TIMEOUT' : 'GATEWAY_ERROR',
      message: `Relay query failed: ${message}`,
      userMessage: 'Unable to connect to Nostr relays. Please try again.',
      context: { relays: DEFAULT_RELAYS, filter }
    } as RigError
  }
}

/**
 * Fetch repository announcements (kind 30617)
 *
 * @param limit - Maximum number of repositories to fetch (default: 100)
 * @returns Array of validated repository announcement events
 */
export async function fetchRepositories(limit = 100): Promise<NostrEvent[]> {
  return queryEvents({ kinds: [REPO_ANNOUNCEMENT], limit })
}

/**
 * Fetch issues for a specific repository (kind 1621)
 *
 * @param repoId - Repository identifier (typically 'd' tag value)
 * @param limit - Maximum number of issues to fetch (default: 50)
 * @returns Array of validated issue events
 */
export async function fetchIssues(repoId: string, limit = 50): Promise<NostrEvent[]> {
  return queryEvents({ kinds: [ISSUE], '#a': [repoId], limit })
}

/**
 * Fetch pull requests for a specific repository (kind 1618)
 *
 * @param repoId - Repository identifier
 * @param limit - Maximum number of PRs to fetch (default: 50)
 * @returns Array of validated pull request events
 */
export async function fetchPullRequests(repoId: string, limit = 50): Promise<NostrEvent[]> {
  return queryEvents({ kinds: [PULL_REQUEST], '#a': [repoId], limit })
}

/**
 * Fetch patches for a specific repository (kind 1617)
 *
 * @param repoId - Repository identifier
 * @param limit - Maximum number of patches to fetch (default: 50)
 * @returns Array of validated patch events
 */
export async function fetchPatches(repoId: string, limit = 50): Promise<NostrEvent[]> {
  return queryEvents({ kinds: [PATCH], '#a': [repoId], limit })
}

/**
 * Fetch comments for a specific event (kind 1622)
 *
 * Comments use NIP-10 threading via 'e' tags.
 *
 * @param eventId - Event ID to fetch comments for
 * @param limit - Maximum number of comments to fetch (default: 100)
 * @returns Array of validated comment events
 */
export async function fetchComments(eventId: string, limit = 100): Promise<NostrEvent[]> {
  return queryEvents({ kinds: [COMMENT], '#e': [eventId], limit })
}
