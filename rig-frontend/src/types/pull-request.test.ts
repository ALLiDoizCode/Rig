import { describe, it, expect } from 'vitest'
import type { PullRequest } from './pull-request'

describe('PullRequest domain model', () => {
  it('should have all required fields', () => {
    const pr: PullRequest = {
      id: 'pr-event-id-789',
      repositoryId: '30617:owner-pubkey:repo-id',
      author: 'pr-author-pubkey',
      owner: 'repo-owner-pubkey',
      subject: 'Add new feature',
      content: '## Changes\nThis PR adds a new feature',
      tipCommit: 'abc123def456',
      cloneUrls: ['https://github.com/user/repo.git'],
      branchName: 'feature/new-feature',
      mergeBase: 'def789abc012',
      labels: ['enhancement', 'needs-review'],
      rootPatchId: 'patch-event-id-123',
      status: 'open',
      createdAt: 1234567890
    }

    expect(pr.id).toBe('pr-event-id-789')
    expect(pr.repositoryId).toBeTruthy()
    expect(pr.author).toBeTruthy()
    expect(pr.owner).toBeTruthy()
    expect(pr.subject).toBe('Add new feature')
    expect(pr.content).toBeTruthy()
    expect(pr.tipCommit).toBeTruthy()
    expect(Array.isArray(pr.cloneUrls)).toBe(true)
    expect(pr.branchName).toBe('feature/new-feature')
    expect(pr.mergeBase).toBeTruthy()
    expect(Array.isArray(pr.labels)).toBe(true)
    expect(pr.rootPatchId).toBeTruthy()
    expect(pr.status).toBe('open')
    expect(typeof pr.createdAt).toBe('number')
  })

  it('should support different status values', () => {
    const openPR: PullRequest = {
      id: 'pr1',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      subject: 'Open PR',
      content: 'Description',
      tipCommit: 'commit1',
      cloneUrls: ['url1'],
      branchName: 'branch1',
      mergeBase: 'base1',
      labels: [],
      rootPatchId: 'patch1',
      status: 'open',
      createdAt: 1234567890
    }

    const mergedPR: PullRequest = {
      id: 'pr2',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      subject: 'Merged PR',
      content: 'Description',
      tipCommit: 'commit2',
      cloneUrls: ['url1'],
      branchName: 'branch2',
      mergeBase: 'base1',
      labels: [],
      rootPatchId: 'patch2',
      status: 'applied',
      createdAt: 1234567890
    }

    const draftPR: PullRequest = {
      id: 'pr3',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      subject: 'Draft PR',
      content: 'Description',
      tipCommit: 'commit3',
      cloneUrls: ['url1'],
      branchName: 'branch3',
      mergeBase: 'base1',
      labels: [],
      rootPatchId: 'patch3',
      status: 'draft',
      createdAt: 1234567890
    }

    expect(openPR.status).toBe('open')
    expect(mergedPR.status).toBe('applied')
    expect(draftPR.status).toBe('draft')
  })

  it('should support empty labels array', () => {
    const pr: PullRequest = {
      id: 'pr1',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      subject: 'PR without labels',
      content: 'Description',
      tipCommit: 'commit1',
      cloneUrls: ['url1'],
      branchName: 'branch1',
      mergeBase: 'base1',
      labels: [],
      rootPatchId: 'patch1',
      status: 'open',
      createdAt: 1234567890
    }

    expect(pr.labels).toEqual([])
  })

  it('should support multiple clone URLs', () => {
    const pr: PullRequest = {
      id: 'pr1',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      subject: 'PR with multiple clone URLs',
      content: 'Description',
      tipCommit: 'commit1',
      cloneUrls: [
        'https://github.com/user/repo.git',
        'git@github.com:user/repo.git',
        'https://gitlab.com/user/repo.git'
      ],
      branchName: 'branch1',
      mergeBase: 'base1',
      labels: [],
      rootPatchId: 'patch1',
      status: 'open',
      createdAt: 1234567890
    }

    expect(pr.cloneUrls.length).toBe(3)
  })

  it('should allow null rootPatchId', () => {
    const pr: PullRequest = {
      id: 'pr1',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      subject: 'PR without patches',
      content: 'Description',
      tipCommit: 'commit1',
      cloneUrls: ['url1'],
      branchName: 'branch1',
      mergeBase: 'base1',
      labels: [],
      rootPatchId: null,
      status: 'open',
      createdAt: 1234567890
    }

    expect(pr.rootPatchId).toBeNull()
  })

  it('should allow null for optional NIP-34 tag fields', () => {
    const minimalPR: PullRequest = {
      id: 'pr1',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      subject: 'Minimal PR',
      content: 'Description',
      tipCommit: null,
      cloneUrls: [],
      branchName: null,
      mergeBase: null,
      labels: [],
      rootPatchId: null,
      status: 'open',
      createdAt: 1234567890
    }

    expect(minimalPR.tipCommit).toBeNull()
    expect(minimalPR.branchName).toBeNull()
    expect(minimalPR.mergeBase).toBeNull()
    expect(minimalPR.rootPatchId).toBeNull()
  })
})
