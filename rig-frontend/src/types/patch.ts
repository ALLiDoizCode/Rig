/**
 * Patch Domain Model
 *
 * Represents git patches parsed from NIP-34 kind 1617 events.
 * Patches contain git format-patch output and commit metadata.
 */

import type { EntityStatus } from './common'

/**
 * Patch domain model
 *
 * Parsed from kind 1617 events.
 * Contains commit hash, parent, committer info, and git diff content.
 */
export interface Patch {
  /** Nostr event ID of the patch */
  id: string

  /** Repository reference from 'a' tag (format: 30617:<pubkey>:<repo-d-tag>) */
  repositoryId: string

  /** Public key of patch author (event.pubkey) */
  author: string

  /** Public key of repository owner from 'p' tag */
  owner: string

  /** Commit hash from 'commit' tag */
  commitHash: string

  /** Parent commit hash from 'parent-commit' tag, or null for initial commit */
  parentCommitHash: string | null

  /** Commit message (extracted from diff or separate field) */
  commitMessage: string

  /** Git format-patch diff output (event.content) */
  diff: string

  /** Committer name from 'committer' tag */
  committerName: string

  /** Committer email from 'committer' tag */
  committerEmail: string

  /** Committer timestamp from 'committer' tag (Unix seconds) */
  committerTimestamp: number

  /** Committer timezone offset from 'committer' tag (e.g., '+0530', '-0800') */
  committerTzOffset: string

  /** PGP signature from 'commit-pgp-sig' tag, or null if unsigned */
  pgpSignature: string | null

  /** Current status derived from most recent status event (default: 'open') */
  status: EntityStatus

  /** Unix timestamp when patch was created (event.created_at) */
  createdAt: number
}
