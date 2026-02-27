import { describe, it, expect } from 'vitest'
import {
  // Schemas (runtime values)
  BaseNostrEventSchema,
  RepoAnnouncementEventSchema,
  RepoStateEventSchema,
  PatchEventSchema,
  PullRequestEventSchema,
  PRUpdateEventSchema,
  IssueEventSchema,
  CommentEventSchema,
  StatusEventSchema
} from '@/types'

import type {
  // Common types
  RigError,
  EntityStatus,

  // Nostr types
  NostrTag,
} from '@/types'

describe('@/types barrel export', () => {
  it('should export all Zod schemas as runtime values', () => {
    expect(BaseNostrEventSchema).toBeDefined()
    expect(RepoAnnouncementEventSchema).toBeDefined()
    expect(RepoStateEventSchema).toBeDefined()
    expect(PatchEventSchema).toBeDefined()
    expect(PullRequestEventSchema).toBeDefined()
    expect(PRUpdateEventSchema).toBeDefined()
    expect(IssueEventSchema).toBeDefined()
    expect(CommentEventSchema).toBeDefined()
    expect(StatusEventSchema).toBeDefined()
  })

  it('should allow type-level usage of all exported types', () => {
    // These are compile-time checks — if this file compiles, the types are accessible
    const _rigError: RigError = {
      code: 'RELAY_TIMEOUT',
      message: 'test',
      userMessage: 'test'
    }
    expect(_rigError.code).toBe('RELAY_TIMEOUT')

    const _status: EntityStatus = 'open'
    expect(_status).toBe('open')

    const _tag: NostrTag = ['e', 'id']
    expect(Array.isArray(_tag)).toBe(true)
  })
})
