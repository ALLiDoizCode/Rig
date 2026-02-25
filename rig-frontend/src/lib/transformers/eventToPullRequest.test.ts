import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { eventToPullRequest } from './eventToPullRequest'
import type { PullRequestEvent } from '@/types/nostr'
import { PULL_REQUEST } from '@/constants/nostr'

describe('eventToPullRequest', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  it('should transform valid pull request event with all fields', () => {
    const event: PullRequestEvent = {
      id: 'pr123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PULL_REQUEST,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['subject', 'Add new feature'],
        ['c', 'abc123def456'],
        ['clone', 'https://github.com/user/repo.git'],
        ['clone', 'git@github.com:user/repo.git'],
        ['branch-name', 'feature/new-thing'],
        ['merge-base', 'def456abc123'],
        ['t', 'enhancement'],
        ['t', 'needs-review'],
        ['e', 'patch-event-id']
      ],
      content: '## Changes\n\nThis PR adds a new feature...',
      sig: 'sig123'
    }

    const result = eventToPullRequest(event)

    expect(result).toEqual({
      id: 'pr123',
      repositoryId: '30617:owner123:my-repo',
      author: 'author123',
      owner: 'owner123',
      subject: 'Add new feature',
      content: '## Changes\n\nThis PR adds a new feature...',
      tipCommit: 'abc123def456',
      cloneUrls: ['https://github.com/user/repo.git', 'git@github.com:user/repo.git'],
      branchName: 'feature/new-thing',
      mergeBase: 'def456abc123',
      labels: ['enhancement', 'needs-review'],
      rootPatchId: 'patch-event-id',
      status: 'open',
      createdAt: 1234567890
    })
  })

  it('should handle missing optional fields with null', () => {
    const event: PullRequestEvent = {
      id: 'pr123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PULL_REQUEST,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123']
      ],
      content: 'Minimal PR',
      sig: 'sig123'
    }

    const result = eventToPullRequest(event)

    expect(result).toEqual({
      id: 'pr123',
      repositoryId: '30617:owner123:my-repo',
      author: 'author123',
      owner: 'owner123',
      subject: '',
      content: 'Minimal PR',
      tipCommit: null,
      cloneUrls: [],
      branchName: null,
      mergeBase: null,
      labels: [],
      rootPatchId: null,
      status: 'open',
      createdAt: 1234567890
    })
  })

  it('should default status to open', () => {
    const event: PullRequestEvent = {
      id: 'pr123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PULL_REQUEST,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123']
      ],
      content: 'PR description',
      sig: 'sig123'
    }

    const result = eventToPullRequest(event)

    expect(result?.status).toBe('open')
  })

  it('should return null when a tag is missing', () => {
    const event: PullRequestEvent = {
      id: 'pr123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PULL_REQUEST,
      tags: [
        ['p', 'owner123']
      ],
      content: 'PR description',
      sig: 'sig123'
    }

    const result = eventToPullRequest(event)

    expect(result).toBe(null)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid pull request event: missing required "a" tag',
      'pr123'
    )
  })

  it('should return null when p tag is missing', () => {
    const event: PullRequestEvent = {
      id: 'pr123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PULL_REQUEST,
      tags: [
        ['a', '30617:owner123:my-repo']
      ],
      content: 'PR description',
      sig: 'sig123'
    }

    const result = eventToPullRequest(event)

    expect(result).toBe(null)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid pull request event: missing required "p" tag',
      'pr123'
    )
  })

  it('should extract multiple clone URLs', () => {
    const event: PullRequestEvent = {
      id: 'pr123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PULL_REQUEST,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['clone', 'https://example.com/repo1.git'],
        ['clone', 'https://example.com/repo2.git'],
        ['clone', 'git@example.com:repo.git']
      ],
      content: 'PR description',
      sig: 'sig123'
    }

    const result = eventToPullRequest(event)

    expect(result?.cloneUrls).toEqual([
      'https://example.com/repo1.git',
      'https://example.com/repo2.git',
      'git@example.com:repo.git'
    ])
  })

  it('should handle missing subject with empty string', () => {
    const event: PullRequestEvent = {
      id: 'pr123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PULL_REQUEST,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123']
      ],
      content: 'PR description',
      sig: 'sig123'
    }

    const result = eventToPullRequest(event)

    expect(result?.subject).toBe('')
  })

  it('should extract rootPatchId from e tag', () => {
    const event: PullRequestEvent = {
      id: 'pr123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PULL_REQUEST,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['e', 'root-patch-event-123']
      ],
      content: 'PR description',
      sig: 'sig123'
    }

    const result = eventToPullRequest(event)

    expect(result?.rootPatchId).toBe('root-patch-event-123')
  })
})
