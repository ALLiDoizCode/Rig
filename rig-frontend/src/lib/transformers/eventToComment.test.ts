import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { eventToComment } from './eventToComment'
import type { CommentEvent } from '@/types/nostr'
import { COMMENT } from '@/constants/nostr'

describe('eventToComment', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  it('should transform root-level comment with NIP-10 threading', () => {
    const event: CommentEvent = {
      id: 'comment123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: COMMENT,
      tags: [
        ['e', 'issue-event-id', 'wss://relay.example.com', 'root'],
        ['p', 'target-author']
      ],
      content: 'This is a comment on the issue',
      sig: 'sig123'
    }

    const result = eventToComment(event)

    expect(result).toEqual({
      id: 'comment123',
      targetEventId: 'issue-event-id',
      author: 'author123',
      content: 'This is a comment on the issue',
      rootId: 'issue-event-id',
      replyToId: null, // Root-level comment has no parent
      mentions: ['target-author'],
      createdAt: 1234567890
    })
  })

  it('should transform reply comment with both root and reply markers', () => {
    const event: CommentEvent = {
      id: 'reply123',
      pubkey: 'replier123',
      created_at: 1234567891,
      kind: COMMENT,
      tags: [
        ['e', 'issue-event-id', 'wss://relay.example.com', 'root'],
        ['e', 'parent-comment-id', 'wss://relay.example.com', 'reply'],
        ['p', 'issue-author'],
        ['p', 'parent-author']
      ],
      content: 'This is a reply to another comment',
      sig: 'sig123'
    }

    const result = eventToComment(event)

    expect(result).toEqual({
      id: 'reply123',
      targetEventId: 'parent-comment-id',
      author: 'replier123',
      content: 'This is a reply to another comment',
      rootId: 'issue-event-id',
      replyToId: 'parent-comment-id',
      mentions: ['issue-author', 'parent-author'],
      createdAt: 1234567891
    })
  })

  it('should handle comment without reply marker as root-level', () => {
    const event: CommentEvent = {
      id: 'comment123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: COMMENT,
      tags: [
        ['e', 'issue-event-id', '', 'root']
      ],
      content: 'Root comment without reply',
      sig: 'sig123'
    }

    const result = eventToComment(event)

    expect(result?.replyToId).toBe(null)
    expect(result?.rootId).toBe('issue-event-id')
    expect(result?.targetEventId).toBe('issue-event-id')
  })

  it('should extract multiple mentions from p tags', () => {
    const event: CommentEvent = {
      id: 'comment123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: COMMENT,
      tags: [
        ['e', 'issue-event-id', '', 'root'],
        ['p', 'user1'],
        ['p', 'user2'],
        ['p', 'user3']
      ],
      content: 'Comment mentioning multiple users',
      sig: 'sig123'
    }

    const result = eventToComment(event)

    expect(result?.mentions).toEqual(['user1', 'user2', 'user3'])
  })

  it('should return null when root e tag is missing', () => {
    const event: CommentEvent = {
      id: 'comment123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: COMMENT,
      tags: [
        ['p', 'target-author']
      ],
      content: 'Comment without root',
      sig: 'sig123'
    }

    const result = eventToComment(event)

    expect(result).toBe(null)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid comment event: missing required root "e" tag',
      'comment123'
    )
  })

  it('should handle empty mentions when no p tags present', () => {
    const event: CommentEvent = {
      id: 'comment123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: COMMENT,
      tags: [
        ['e', 'issue-event-id', '', 'root']
      ],
      content: 'Comment without mentions',
      sig: 'sig123'
    }

    const result = eventToComment(event)

    expect(result?.mentions).toEqual([])
  })

  it('should handle e tags without markers (backward compatibility)', () => {
    const event: CommentEvent = {
      id: 'comment123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: COMMENT,
      tags: [
        ['e', 'target-event-id']
      ],
      content: 'Comment with unmarked e tag',
      sig: 'sig123'
    }

    const result = eventToComment(event)

    // Should still work, treating unmarked e tag as root
    expect(result?.rootId).toBe('target-event-id')
    expect(result?.targetEventId).toBe('target-event-id')
    expect(result?.replyToId).toBe(null)
  })

  it('should prioritize reply marker for targetEventId', () => {
    const event: CommentEvent = {
      id: 'reply123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: COMMENT,
      tags: [
        ['e', 'root-event-id', '', 'root'],
        ['e', 'direct-parent-id', '', 'reply']
      ],
      content: 'Nested reply',
      sig: 'sig123'
    }

    const result = eventToComment(event)

    expect(result?.targetEventId).toBe('direct-parent-id')
    expect(result?.rootId).toBe('root-event-id')
    expect(result?.replyToId).toBe('direct-parent-id')
  })
})
