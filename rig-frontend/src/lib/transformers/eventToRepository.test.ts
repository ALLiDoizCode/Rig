import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { eventToRepository } from './eventToRepository'
import type { RepoAnnouncementEvent } from '@/types/nostr'
import { REPO_ANNOUNCEMENT } from '@/constants/nostr'

describe('eventToRepository', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  it('should transform valid repository event with all fields', () => {
    const event: RepoAnnouncementEvent = {
      id: 'event123',
      pubkey: 'pubkey123',
      created_at: 1234567890,
      kind: REPO_ANNOUNCEMENT,
      tags: [
        ['d', 'my-repo'],
        ['name', 'My Awesome Repository'],
        ['description', 'A very cool project'],
        ['web', 'https://example.com'],
        ['web', 'https://mirror.example.org'],
        ['clone', 'https://example.com/repo.git'],
        ['clone', 'git@example.com:repo.git'],
        ['relays', 'wss://relay1.example.com', 'wss://relay2.example.com'],
        ['maintainers', 'maintainer1', 'maintainer2'],
        ['t', 'javascript'],
        ['t', 'typescript'],
        ['t', 'react'],
        ['r', 'abc123def', 'euc']
      ],
      content: '',
      sig: 'sig123'
    }

    const result = eventToRepository(event)

    expect(result).toEqual({
      id: 'my-repo',
      name: 'My Awesome Repository',
      description: 'A very cool project',
      owner: 'pubkey123',
      maintainers: ['maintainer1', 'maintainer2'],
      webUrls: ['https://example.com', 'https://mirror.example.org'],
      cloneUrls: ['https://example.com/repo.git', 'git@example.com:repo.git'],
      relays: ['wss://relay1.example.com', 'wss://relay2.example.com'],
      topics: ['javascript', 'typescript', 'react'],
      isPersonalFork: false,
      earliestUniqueCommit: 'abc123def',
      eventId: 'event123',
      createdAt: 1234567890
    })
  })

  it('should use d tag as name fallback when name tag missing', () => {
    const event: RepoAnnouncementEvent = {
      id: 'event123',
      pubkey: 'pubkey123',
      created_at: 1234567890,
      kind: REPO_ANNOUNCEMENT,
      tags: [
        ['d', 'fallback-name']
      ],
      content: '',
      sig: 'sig123'
    }

    const result = eventToRepository(event)

    expect(result?.name).toBe('fallback-name')
  })

  it('should detect personal-fork topic tag', () => {
    const event: RepoAnnouncementEvent = {
      id: 'event123',
      pubkey: 'pubkey123',
      created_at: 1234567890,
      kind: REPO_ANNOUNCEMENT,
      tags: [
        ['d', 'my-fork'],
        ['t', 'personal-fork'],
        ['t', 'javascript']
      ],
      content: '',
      sig: 'sig123'
    }

    const result = eventToRepository(event)

    expect(result?.isPersonalFork).toBe(true)
    expect(result?.topics).toEqual(['javascript']) // personal-fork excluded from topics
  })

  it('should handle missing optional tags with sensible defaults', () => {
    const event: RepoAnnouncementEvent = {
      id: 'event123',
      pubkey: 'pubkey123',
      created_at: 1234567890,
      kind: REPO_ANNOUNCEMENT,
      tags: [
        ['d', 'minimal-repo']
      ],
      content: '',
      sig: 'sig123'
    }

    const result = eventToRepository(event)

    expect(result).toEqual({
      id: 'minimal-repo',
      name: 'minimal-repo',
      description: '',
      owner: 'pubkey123',
      maintainers: [],
      webUrls: [],
      cloneUrls: [],
      relays: [],
      topics: [],
      isPersonalFork: false,
      earliestUniqueCommit: null,
      eventId: 'event123',
      createdAt: 1234567890
    })
  })

  it('should return null when d tag is missing', () => {
    const event: RepoAnnouncementEvent = {
      id: 'event123',
      pubkey: 'pubkey123',
      created_at: 1234567890,
      kind: REPO_ANNOUNCEMENT,
      tags: [
        ['name', 'Some Repo']
      ],
      content: '',
      sig: 'sig123'
    }

    const result = eventToRepository(event)

    expect(result).toBe(null)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid repository event: missing required "d" tag',
      'event123'
    )
  })

  it('should extract earliest unique commit from r tag with euc marker', () => {
    const event: RepoAnnouncementEvent = {
      id: 'event123',
      pubkey: 'pubkey123',
      created_at: 1234567890,
      kind: REPO_ANNOUNCEMENT,
      tags: [
        ['d', 'my-repo'],
        ['r', 'commit-hash-123', 'euc']
      ],
      content: '',
      sig: 'sig123'
    }

    const result = eventToRepository(event)

    expect(result?.earliestUniqueCommit).toBe('commit-hash-123')
  })

  it('should return null for earliestUniqueCommit when r tag has no euc marker', () => {
    const event: RepoAnnouncementEvent = {
      id: 'event123',
      pubkey: 'pubkey123',
      created_at: 1234567890,
      kind: REPO_ANNOUNCEMENT,
      tags: [
        ['d', 'my-repo'],
        ['r', 'commit-hash-123', 'other-marker']
      ],
      content: '',
      sig: 'sig123'
    }

    const result = eventToRepository(event)

    expect(result?.earliestUniqueCommit).toBe(null)
  })

  it('should handle maintainers tag as array of values', () => {
    const event: RepoAnnouncementEvent = {
      id: 'event123',
      pubkey: 'pubkey123',
      created_at: 1234567890,
      kind: REPO_ANNOUNCEMENT,
      tags: [
        ['d', 'my-repo'],
        ['maintainers', 'alice', 'bob', 'charlie']
      ],
      content: '',
      sig: 'sig123'
    }

    const result = eventToRepository(event)

    expect(result?.maintainers).toEqual(['alice', 'bob', 'charlie'])
  })

  it('should handle relays tag as array of values', () => {
    const event: RepoAnnouncementEvent = {
      id: 'event123',
      pubkey: 'pubkey123',
      created_at: 1234567890,
      kind: REPO_ANNOUNCEMENT,
      tags: [
        ['d', 'my-repo'],
        ['relays', 'wss://relay1.com', 'wss://relay2.com']
      ],
      content: '',
      sig: 'sig123'
    }

    const result = eventToRepository(event)

    expect(result?.relays).toEqual(['wss://relay1.com', 'wss://relay2.com'])
  })
})
