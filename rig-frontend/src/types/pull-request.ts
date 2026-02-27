/**
 * Pull Request Domain Model
 *
 * Represents pull requests parsed from NIP-34 kind 1618 events.
 * PRs propose merging commits from a branch into a repository.
 */

import type { EntityStatus } from './common'

/**
 * Pull Request domain model
 *
 * Parsed from kind 1618 events.
 * Contains commit metadata, clone URLs, and branch information.
 */
export interface PullRequest {
  /** Nostr event ID of the pull request */
  id: string

  /** Repository reference from 'a' tag (format: 30617:<pubkey>:<repo-d-tag>) */
  repositoryId: string

  /** Public key of PR author (event.pubkey) */
  author: string

  /** Public key of repository owner from 'p' tag */
  owner: string

  /** PR title from 'subject' tag */
  subject: string

  /** PR body markdown (event.content) */
  content: string

  /** Tip commit hash from 'c' tag, or null if not provided */
  tipCommit: string | null

  /** Git clone URLs from 'clone' tags */
  cloneUrls: string[]

  /** Branch name from 'branch-name' tag, or null if not provided */
  branchName: string | null

  /** Merge base commit from 'merge-base' tag, or null if not provided */
  mergeBase: string | null

  /** Label tags from 't' tags */
  labels: string[]

  /** Root patch event ID from 'e' tag, or null if no patches */
  rootPatchId: string | null

  /** Current status derived from most recent status event (default: 'open') */
  status: EntityStatus

  /** Unix timestamp when PR was created (event.created_at) */
  createdAt: number
}
