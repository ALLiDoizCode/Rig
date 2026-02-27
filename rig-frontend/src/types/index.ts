/**
 * Type Definitions Barrel Export
 *
 * Central export point for all type definitions in the Rig application.
 * Import types via: import type { X } from '@/types'
 */

// Common types
export type { RigError, EntityStatus } from './common'

// Arweave types
export type { ArweaveManifest, ArNSResolution } from './arweave'

// Cache types
export type { CachedEvent, CachedFile, CacheResult } from './cache'

// Nostr event types and schemas
export type {
  NostrEvent,
  NostrTag,
  RepoAnnouncementEvent,
  RepoStateEvent,
  PatchEvent,
  PullRequestEvent,
  PRUpdateEvent,
  IssueEvent,
  CommentEvent,
  StatusEvent
} from './nostr'

export {
  BaseNostrEventSchema,
  RepoAnnouncementEventSchema,
  RepoStateEventSchema,
  PatchEventSchema,
  PullRequestEventSchema,
  PRUpdateEventSchema,
  IssueEventSchema,
  CommentEventSchema,
  StatusEventSchema
} from './nostr'

// Domain model types
export type { Repository } from './repository'
export type { Issue, Comment } from './issue'
export type { PullRequest } from './pull-request'
export type { Patch } from './patch'
