import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { eventToIssue } from './eventToIssue'
import type { IssueEvent } from '@/types/nostr'
import { ISSUE } from '@/constants/nostr'

describe('eventToIssue', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  it('should transform valid issue event with all fields', () => {
    const event: IssueEvent = {
      id: 'issue123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: ISSUE,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['subject', 'Fix the bug in login'],
        ['t', 'bug'],
        ['t', 'urgent']
      ],
      content: 'The login button is not working properly...',
      sig: 'sig123'
    }

    const result = eventToIssue(event)

    expect(result).toEqual({
      id: 'issue123',
      repositoryId: '30617:owner123:my-repo',
      author: 'author123',
      owner: 'owner123',
      subject: 'Fix the bug in login',
      content: 'The login button is not working properly...',
      labels: ['bug', 'urgent'],
      status: 'open',
      createdAt: 1234567890
    })
  })

  it('should default status to open', () => {
    const event: IssueEvent = {
      id: 'issue123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: ISSUE,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123']
      ],
      content: 'Issue description',
      sig: 'sig123'
    }

    const result = eventToIssue(event)

    expect(result?.status).toBe('open')
  })

  it('should handle missing subject tag with empty string', () => {
    const event: IssueEvent = {
      id: 'issue123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: ISSUE,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123']
      ],
      content: 'Issue description',
      sig: 'sig123'
    }

    const result = eventToIssue(event)

    expect(result?.subject).toBe('')
  })

  it('should handle empty labels when no t tags present', () => {
    const event: IssueEvent = {
      id: 'issue123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: ISSUE,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123']
      ],
      content: 'Issue description',
      sig: 'sig123'
    }

    const result = eventToIssue(event)

    expect(result?.labels).toEqual([])
  })

  it('should return null when a tag is missing', () => {
    const event: IssueEvent = {
      id: 'issue123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: ISSUE,
      tags: [
        ['p', 'owner123']
      ],
      content: 'Issue description',
      sig: 'sig123'
    }

    const result = eventToIssue(event)

    expect(result).toBe(null)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid issue event: missing required "a" tag',
      'issue123'
    )
  })

  it('should return null when p tag is missing', () => {
    const event: IssueEvent = {
      id: 'issue123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: ISSUE,
      tags: [
        ['a', '30617:owner123:my-repo']
      ],
      content: 'Issue description',
      sig: 'sig123'
    }

    const result = eventToIssue(event)

    expect(result).toBe(null)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid issue event: missing required "p" tag',
      'issue123'
    )
  })

  it('should handle empty content', () => {
    const event: IssueEvent = {
      id: 'issue123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: ISSUE,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['subject', 'Empty issue']
      ],
      content: '',
      sig: 'sig123'
    }

    const result = eventToIssue(event)

    expect(result?.content).toBe('')
  })

  it('should extract multiple labels from t tags', () => {
    const event: IssueEvent = {
      id: 'issue123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: ISSUE,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['t', 'bug'],
        ['t', 'enhancement'],
        ['t', 'documentation']
      ],
      content: 'Issue description',
      sig: 'sig123'
    }

    const result = eventToIssue(event)

    expect(result?.labels).toEqual(['bug', 'enhancement', 'documentation'])
  })
})
