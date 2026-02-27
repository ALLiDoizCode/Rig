/**
 * Issue and Comment Domain Models
 *
 * Represents issues and comments parsed from NIP-34 events.
 * Issues (kind 1621) and Comments (kind 1622) support threaded discussions.
 */

import type { EntityStatus } from './common'

export type { EntityStatus }

/**
 * Issue domain model
 *
 * Parsed from kind 1621 events.
 * Represents a repository issue with status derived from status events.
 */
export interface Issue {
  /** Nostr event ID of the issue */
  id: string

  /** Repository reference from 'a' tag (format: 30617:<pubkey>:<repo-d-tag>) */
  repositoryId: string

  /** Public key of issue author (event.pubkey) */
  author: string

  /** Public key of repository owner from 'p' tag */
  owner: string

  /** Issue title from 'subject' tag */
  subject: string

  /** Issue description markdown (event.content) */
  content: string

  /** Label tags from 't' tags */
  labels: string[]

  /** Current status derived from most recent status event (default: 'open') */
  status: EntityStatus

  /** Unix timestamp when issue was created (event.created_at) */
  createdAt: number
}

/**
 * Comment domain model
 *
 * Parsed from kind 1622 events.
 * Uses NIP-10 threading for nested discussions.
 */
export interface Comment {
  /** Nostr event ID of the comment */
  id: string

  /** Event ID this comment targets (from 'e' tag) */
  targetEventId: string

  /** Public key of comment author (event.pubkey) */
  author: string

  /** Comment markdown content (event.content) */
  content: string

  /** Root event ID from NIP-10 'e' tag with 'root' marker */
  rootId: string

  /** Direct parent comment ID from NIP-10 'e' tag, or null for root-level */
  replyToId: string | null

  /** Mentioned public keys from 'p' tags */
  mentions: string[]

  /** Unix timestamp when comment was created (event.created_at) */
  createdAt: number
}
