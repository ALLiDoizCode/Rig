import { describe, it, expect } from 'vitest'
import type { Issue, Comment } from './issue'
import type { EntityStatus } from './common'

describe('EntityStatus type', () => {
  it('should accept valid status values', () => {
    const open: EntityStatus = 'open'
    const applied: EntityStatus = 'applied'
    const closed: EntityStatus = 'closed'
    const draft: EntityStatus = 'draft'

    expect(open).toBe('open')
    expect(applied).toBe('applied')
    expect(closed).toBe('closed')
    expect(draft).toBe('draft')
  })
})

describe('Issue domain model', () => {
  it('should have all required fields', () => {
    const issue: Issue = {
      id: 'issue-event-id-123',
      repositoryId: '30617:pubkey:repo-id',
      author: 'author-pubkey',
      owner: 'owner-pubkey',
      subject: 'Bug report: Something is broken',
      content: '## Description\nDetailed bug description here',
      labels: ['bug', 'high-priority'],
      status: 'open',
      createdAt: 1234567890
    }

    expect(issue.id).toBe('issue-event-id-123')
    expect(issue.repositoryId).toBeTruthy()
    expect(issue.author).toBeTruthy()
    expect(issue.owner).toBeTruthy()
    expect(issue.subject).toBe('Bug report: Something is broken')
    expect(issue.content).toBeTruthy()
    expect(Array.isArray(issue.labels)).toBe(true)
    expect(issue.status).toBe('open')
    expect(typeof issue.createdAt).toBe('number')
  })

  it('should support different status values', () => {
    const openIssue: Issue = {
      id: 'id1',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      subject: 'Open issue',
      content: 'Content',
      labels: [],
      status: 'open',
      createdAt: 1234567890
    }

    const closedIssue: Issue = {
      id: 'id2',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      subject: 'Closed issue',
      content: 'Content',
      labels: [],
      status: 'closed',
      createdAt: 1234567890
    }

    expect(openIssue.status).toBe('open')
    expect(closedIssue.status).toBe('closed')
  })

  it('should support empty labels array', () => {
    const issue: Issue = {
      id: 'id1',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      subject: 'Issue without labels',
      content: 'Content',
      labels: [],
      status: 'open',
      createdAt: 1234567890
    }

    expect(issue.labels).toEqual([])
  })
})

describe('Comment domain model', () => {
  it('should have all required fields', () => {
    const comment: Comment = {
      id: 'comment-event-id-456',
      targetEventId: 'target-event-id',
      author: 'comment-author-pubkey',
      content: 'This is a comment on the issue',
      rootId: 'root-event-id',
      replyToId: 'direct-parent-id',
      mentions: ['mentioned-pubkey-1', 'mentioned-pubkey-2'],
      createdAt: 1234567890
    }

    expect(comment.id).toBe('comment-event-id-456')
    expect(comment.targetEventId).toBeTruthy()
    expect(comment.author).toBeTruthy()
    expect(comment.content).toBeTruthy()
    expect(comment.rootId).toBe('root-event-id')
    expect(comment.replyToId).toBe('direct-parent-id')
    expect(Array.isArray(comment.mentions)).toBe(true)
    expect(typeof comment.createdAt).toBe('number')
  })

  it('should allow null replyToId for root-level comments', () => {
    const rootComment: Comment = {
      id: 'comment-id',
      targetEventId: 'target-id',
      author: 'author',
      content: 'Root level comment',
      rootId: 'root-id',
      replyToId: null,
      mentions: [],
      createdAt: 1234567890
    }

    expect(rootComment.replyToId).toBeNull()
  })

  it('should support empty mentions array', () => {
    const comment: Comment = {
      id: 'comment-id',
      targetEventId: 'target-id',
      author: 'author',
      content: 'Comment without mentions',
      rootId: 'root-id',
      replyToId: null,
      mentions: [],
      createdAt: 1234567890
    }

    expect(comment.mentions).toEqual([])
  })

  it('should support NIP-10 threading structure', () => {
    const threadedComment: Comment = {
      id: 'reply-comment-id',
      targetEventId: 'original-issue-id',
      author: 'commenter',
      content: 'This is a reply to another comment',
      rootId: 'original-issue-id',
      replyToId: 'parent-comment-id',
      mentions: ['parent-author'],
      createdAt: 1234567890
    }

    expect(threadedComment.rootId).toBe('original-issue-id')
    expect(threadedComment.replyToId).toBe('parent-comment-id')
  })
})
