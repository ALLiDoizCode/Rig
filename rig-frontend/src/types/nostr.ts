/**
 * NIP-34 Nostr Event Types and Validation Schemas
 *
 * Provides TypeScript types and Zod validation schemas for all NIP-34 event kinds.
 * NIP-34 defines git-related event kinds for decentralized code collaboration.
 *
 * @see https://github.com/nostr-protocol/nips/blob/master/34.md
 */

import { z } from 'zod'
import type { Event } from 'nostr-tools'
import {
  REPO_ANNOUNCEMENT,
  REPO_STATE,
  PATCH,
  PULL_REQUEST,
  PR_UPDATE,
  ISSUE,
  COMMENT,
  STATUS_OPEN,
  STATUS_APPLIED,
  STATUS_CLOSED,
  STATUS_DRAFT
} from '@/constants/nostr'

/**
 * Base Nostr Event type from nostr-tools
 *
 * All Nostr events share this structure with id, pubkey, created_at, kind, tags, content, and sig.
 */
export type NostrEvent = Event

/**
 * Nostr tag type
 *
 * Tags are arrays of strings. First element is tag name, remaining elements are tag values.
 * Example: ['e', 'event-id', 'relay-url', 'marker']
 */
export type NostrTag = string[]

/**
 * Base Nostr Event Schema
 *
 * All Nostr events must have these fields. Event-specific schemas extend this base.
 */
export const BaseNostrEventSchema = z.object({
  /** 32-byte hex event ID */
  id: z.string(),
  /** 32-byte hex public key of event author */
  pubkey: z.string(),
  /** Unix timestamp in seconds */
  created_at: z.number(),
  /** Event kind number */
  kind: z.number(),
  /** Array of tag arrays */
  tags: z.array(z.array(z.string())),
  /** Event content (may be empty string) */
  content: z.string(),
  /** 64-byte hex signature */
  sig: z.string()
})

/**
 * Repository Announcement Event Schema (kind 30617)
 *
 * Parameterized replaceable event announcing a git repository.
 * REQUIRED tag: ['d', '<repo-identifier>']
 * OPTIONAL tags: name, description, web (multiple), clone (multiple), relays, maintainers, t (topics)
 */
export const RepoAnnouncementEventSchema = BaseNostrEventSchema.extend({
  kind: z.literal(REPO_ANNOUNCEMENT)
}).refine(
  (event) => event.tags.some(tag => tag[0] === 'd' && tag[1]),
  { message: 'Repository announcement must have "d" tag with identifier' }
)

export type RepoAnnouncementEvent = z.infer<typeof RepoAnnouncementEventSchema>

/**
 * Repository State Event Schema (kind 30618)
 *
 * Parameterized replaceable event containing repository refs (branches, tags, HEAD).
 * REQUIRED tag: ['d', '<repo-identifier>'] (matches corresponding 30617 event)
 * Tags: ['refs/heads/<branch>', '<commit>'], ['refs/tags/<tag>', '<commit>'], ['HEAD', 'ref: refs/heads/<branch>']
 */
export const RepoStateEventSchema = BaseNostrEventSchema.extend({
  kind: z.literal(REPO_STATE)
}).refine(
  (event) => event.tags.some(tag => tag[0] === 'd' && tag[1]),
  { message: 'Repository state must have "d" tag with identifier' }
)

export type RepoStateEvent = z.infer<typeof RepoStateEventSchema>

/**
 * Patch Event Schema (kind 1617)
 *
 * Contains a git patch in format-patch output.
 * Tags: ['a', '30617:<pubkey>:<repo-d-tag>'], ['commit', '<hash>'], ['parent-commit', '<hash>'],
 *       ['committer', '<name>', '<email>', '<timestamp>', '<tz-offset>']
 * Content: git format-patch output (diff text)
 */
export const PatchEventSchema = BaseNostrEventSchema.extend({
  kind: z.literal(PATCH)
})

export type PatchEvent = z.infer<typeof PatchEventSchema>

/**
 * Pull Request Event Schema (kind 1618)
 *
 * Proposes merging commits from a branch.
 * Tags: ['a', '30617:<pubkey>:<repo-d-tag>'], ['p', '<owner-pubkey>'], ['subject', '<title>'],
 *       ['c', '<tip-commit>'], ['branch-name', '<name>'], ['clone', '<url>'] (multiple)
 * Content: Markdown description
 */
export const PullRequestEventSchema = BaseNostrEventSchema.extend({
  kind: z.literal(PULL_REQUEST)
})

export type PullRequestEvent = z.infer<typeof PullRequestEventSchema>

/**
 * Pull Request Update Event Schema (kind 1619)
 *
 * Updates an existing pull request with new tip commit.
 * Tags: ['E', '<original-pr-id>'] (NIP-22), ['P', '<original-author>'] (NIP-22),
 *       ['c', '<new-tip-commit>'], ['a', '30617:...']
 * Content: empty string
 */
export const PRUpdateEventSchema = BaseNostrEventSchema.extend({
  kind: z.literal(PR_UPDATE)
})

export type PRUpdateEvent = z.infer<typeof PRUpdateEventSchema>

/**
 * Issue Event Schema (kind 1621)
 *
 * Creates an issue for a repository.
 * Tags: ['a', '30617:<pubkey>:<repo-d-tag>'], ['p', '<owner-pubkey>'],
 *       ['subject', '<title>'] (optional), ['t', '<label>'] (multiple)
 * Content: Markdown issue description
 */
export const IssueEventSchema = BaseNostrEventSchema.extend({
  kind: z.literal(ISSUE)
})

export type IssueEvent = z.infer<typeof IssueEventSchema>

/**
 * Comment Event Schema (kind 1622)
 *
 * Comments on issues, PRs, or patches using NIP-10 threading.
 * Tags: ['e', '<target-event-id>', '', 'root'] (NIP-10), ['p', '<target-author>'],
 *       ['p', '<mention>'] (multiple)
 * Content: Markdown comment text
 */
export const CommentEventSchema = BaseNostrEventSchema.extend({
  kind: z.literal(COMMENT)
})

export type CommentEvent = z.infer<typeof CommentEventSchema>

/**
 * Status Event Schema (kinds 1630-1633)
 *
 * Changes status of issues, PRs, or patches:
 * - 1630: Open
 * - 1631: Applied/Merged/Resolved (with optional merge-commit or applied-as-commits tags)
 * - 1632: Closed
 * - 1633: Draft
 *
 * Tags: ['e', '<target-event-id>', '', 'root'], ['p', '<owner>'], ['p', '<author>']
 * Kind 1631 optional: ['merge-commit', '<hash>'], ['applied-as-commits', '<hash>', ...]
 * Content: optional explanation
 */
export const StatusEventSchema = BaseNostrEventSchema.extend({
  kind: z.union([
    z.literal(STATUS_OPEN),
    z.literal(STATUS_APPLIED),
    z.literal(STATUS_CLOSED),
    z.literal(STATUS_DRAFT)
  ])
})

export type StatusEvent = z.infer<typeof StatusEventSchema>
