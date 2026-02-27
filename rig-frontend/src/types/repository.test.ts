import { describe, it, expect } from 'vitest'
import type { Repository } from './repository'

describe('Repository domain model', () => {
  it('should have all required fields', () => {
    const repo: Repository = {
      id: 'my-awesome-repo',
      name: 'My Awesome Repo',
      description: 'A great repository',
      owner: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      maintainers: ['pubkey1', 'pubkey2'],
      webUrls: ['https://example.com'],
      cloneUrls: ['https://github.com/user/repo.git'],
      relays: ['wss://relay.damus.io'],
      topics: ['javascript', 'typescript'],
      isPersonalFork: false,
      earliestUniqueCommit: 'abc123',
      eventId: 'eventid123',
      createdAt: 1234567890
    }

    expect(repo.id).toBe('my-awesome-repo')
    expect(repo.name).toBe('My Awesome Repo')
    expect(repo.owner).toBeTruthy()
    expect(Array.isArray(repo.maintainers)).toBe(true)
    expect(Array.isArray(repo.webUrls)).toBe(true)
    expect(Array.isArray(repo.cloneUrls)).toBe(true)
    expect(Array.isArray(repo.relays)).toBe(true)
    expect(Array.isArray(repo.topics)).toBe(true)
    expect(typeof repo.isPersonalFork).toBe('boolean')
    expect(typeof repo.createdAt).toBe('number')
  })

  it('should allow null earliestUniqueCommit', () => {
    const repo: Repository = {
      id: 'my-repo',
      name: 'My Repo',
      description: '',
      owner: 'pubkey',
      maintainers: [],
      webUrls: [],
      cloneUrls: [],
      relays: [],
      topics: [],
      isPersonalFork: false,
      earliestUniqueCommit: null,
      eventId: 'eventid',
      createdAt: 1234567890
    }

    expect(repo.earliestUniqueCommit).toBeNull()
  })

  it('should support empty arrays for optional list fields', () => {
    const repo: Repository = {
      id: 'minimal-repo',
      name: 'Minimal Repo',
      description: '',
      owner: 'pubkey',
      maintainers: [],
      webUrls: [],
      cloneUrls: [],
      relays: [],
      topics: [],
      isPersonalFork: false,
      earliestUniqueCommit: null,
      eventId: 'eventid',
      createdAt: 1234567890
    }

    expect(repo.maintainers).toEqual([])
    expect(repo.webUrls).toEqual([])
    expect(repo.cloneUrls).toEqual([])
    expect(repo.relays).toEqual([])
    expect(repo.topics).toEqual([])
  })

  it('should correctly identify personal forks', () => {
    const personalFork: Repository = {
      id: 'forked-repo',
      name: 'Forked Repo',
      description: 'My fork',
      owner: 'pubkey',
      maintainers: [],
      webUrls: [],
      cloneUrls: [],
      relays: [],
      topics: [],
      isPersonalFork: true,
      earliestUniqueCommit: 'abc123',
      eventId: 'eventid',
      createdAt: 1234567890
    }

    expect(personalFork.isPersonalFork).toBe(true)
  })
})
