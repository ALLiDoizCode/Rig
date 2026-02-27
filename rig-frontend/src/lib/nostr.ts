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
import {
  RepoAnnouncementEventSchema,
  IssueEventSchema,
  PullRequestEventSchema,
  PatchEventSchema,
  CommentEventSchema
} from '@/types/nostr'
import {
  eventToRepository,
  eventToIssue,
  eventToPullRequest,
  eventToPatch,
  eventToComment
} from '@/lib/transformers'
import type { Repository } from '@/types/repository'
import type { Issue, Comment } from '@/types/issue'
import type { PullRequest } from '@/types/pull-request'
import type { Patch } from '@/types/patch'

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
 * @throws RigError with code 'RELAY_TIMEOUT'
 */
async function queryEvents(
  filter: Filter,
  timeout = 2000
): Promise<NostrEvent[]> {
  try {
    const events = await pool.querySync([...DEFAULT_RELAYS], filter, { maxWait: timeout })

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
    throw {
      code: 'RELAY_TIMEOUT',
      message: `Relay query failed: ${message}`,
      userMessage: 'Unable to connect to Nostr relays. Please try again.',
      context: { relays: DEFAULT_RELAYS, filter }
    } as RigError
  }
}

/**
 * Validate events with Zod schema, transform to domain models, filter nulls.
 *
 * Throws VALIDATION_FAILED if ALL events fail Zod validation (indicates
 * a systemic schema mismatch). Individual failures are filtered with a warning.
 *
 * @param events - Raw events from relay query
 * @param schema - Zod schema for validation
 * @param transformer - Pure function to transform validated event to domain model
 * @param label - Label for warning messages (e.g., 'Repository')
 * @returns Array of successfully transformed domain models
 * @throws RigError with code 'VALIDATION_FAILED' when all events fail validation
 */
function validateAndTransform<TSchema, TModel>(
  events: NostrEvent[],
  schema: { parse: (data: unknown) => TSchema },
  transformer: (event: TSchema) => TModel | null,
  label: string
): TModel[] {
  if (events.length === 0) return []

  let validationFailures = 0

  const results = events
    .map(event => {
      try {
        const validatedEvent = schema.parse(event)
        return transformer(validatedEvent)
      } catch (err) {
        validationFailures++
        console.warn(`${label} event validation failed:`, event.id, err)
        return null
      }
    })
    .filter((item): item is TModel => item !== null)

  // If ALL events failed Zod validation, throw VALIDATION_FAILED
  if (validationFailures === events.length) {
    throw {
      code: 'VALIDATION_FAILED',
      message: `All ${events.length} ${label.toLowerCase()} events failed schema validation`,
      userMessage: `Unable to process ${label.toLowerCase()} data. The format may have changed.`,
      context: { totalEvents: events.length, failures: validationFailures }
    } as RigError
  }

  return results
}

/**
 * Fetch repository announcements (kind 30617)
 *
 * @param limit - Maximum number of repositories to fetch (default: 100)
 * @returns Array of Repository domain models
 * @throws RigError with code 'RELAY_TIMEOUT' or 'VALIDATION_FAILED'
 */
export async function fetchRepositories(limit = 100): Promise<Repository[]> {
  const events = await queryEvents({ kinds: [REPO_ANNOUNCEMENT], limit })
  return validateAndTransform(events, RepoAnnouncementEventSchema, eventToRepository, 'Repository')
}

/**
 * Fetch issues for a specific repository (kind 1621)
 *
 * @param repoId - Repository identifier (typically 'd' tag value)
 * @param limit - Maximum number of issues to fetch (default: 50)
 * @returns Array of Issue domain models
 * @throws RigError with code 'RELAY_TIMEOUT' or 'VALIDATION_FAILED'
 */
export async function fetchIssues(repoId: string, limit = 50): Promise<Issue[]> {
  const events = await queryEvents({ kinds: [ISSUE], '#a': [repoId], limit })
  return validateAndTransform(events, IssueEventSchema, eventToIssue, 'Issue')
}

/**
 * Fetch pull requests for a specific repository (kind 1618)
 *
 * @param repoId - Repository identifier
 * @param limit - Maximum number of PRs to fetch (default: 50)
 * @returns Array of PullRequest domain models
 * @throws RigError with code 'RELAY_TIMEOUT' or 'VALIDATION_FAILED'
 */
export async function fetchPullRequests(repoId: string, limit = 50): Promise<PullRequest[]> {
  const events = await queryEvents({ kinds: [PULL_REQUEST], '#a': [repoId], limit })
  return validateAndTransform(events, PullRequestEventSchema, eventToPullRequest, 'Pull request')
}

/**
 * Fetch patches for a specific repository (kind 1617)
 *
 * @param repoId - Repository identifier
 * @param limit - Maximum number of patches to fetch (default: 50)
 * @returns Array of Patch domain models
 * @throws RigError with code 'RELAY_TIMEOUT' or 'VALIDATION_FAILED'
 */
export async function fetchPatches(repoId: string, limit = 50): Promise<Patch[]> {
  const events = await queryEvents({ kinds: [PATCH], '#a': [repoId], limit })
  return validateAndTransform(events, PatchEventSchema, eventToPatch, 'Patch')
}

/**
 * Fetch comments for a specific event (kind 1622)
 *
 * Comments use NIP-10 threading via 'e' tags.
 *
 * @param eventId - Event ID to fetch comments for
 * @param limit - Maximum number of comments to fetch (default: 100)
 * @returns Array of Comment domain models
 * @throws RigError with code 'RELAY_TIMEOUT' or 'VALIDATION_FAILED'
 */
export async function fetchComments(eventId: string, limit = 100): Promise<Comment[]> {
  const events = await queryEvents({ kinds: [COMMENT], '#e': [eventId], limit })
  return validateAndTransform(events, CommentEventSchema, eventToComment, 'Comment')
}

/**
 * Destroy the shared SimplePool instance and close all WebSocket connections.
 *
 * Call this during application teardown (e.g., in a React useEffect cleanup or
 * when the app unmounts) to ensure all relay connections are properly closed.
 *
 * After calling this function, any subsequent fetch calls will fail because
 * the pool instance is a module-level singleton. This is intentional — the
 * function is meant for final cleanup only.
 */
export function destroyPool(): void {
  pool.close([...DEFAULT_RELAYS])
}
