import { describe, it, expect } from 'vitest'
import type { Patch } from './patch'

describe('Patch domain model', () => {
  it('should have all required fields', () => {
    const patch: Patch = {
      id: 'patch-event-id-321',
      repositoryId: '30617:owner-pubkey:repo-id',
      author: 'patch-author-pubkey',
      owner: 'repo-owner-pubkey',
      commitHash: 'abc123def456789',
      parentCommitHash: 'parent789abc123',
      commitMessage: 'Fix critical bug in authentication',
      diff: 'diff --git a/auth.ts b/auth.ts\nindex 123..456\n--- a/auth.ts\n+++ b/auth.ts\n...',
      committerName: 'John Doe',
      committerEmail: 'john@example.com',
      committerTimestamp: 1234567890,
      committerTzOffset: '-0500',
      pgpSignature: 'PGP SIGNATURE BLOCK',
      status: 'open',
      createdAt: 1234567890
    }

    expect(patch.id).toBe('patch-event-id-321')
    expect(patch.repositoryId).toBeTruthy()
    expect(patch.author).toBeTruthy()
    expect(patch.owner).toBeTruthy()
    expect(patch.commitHash).toBeTruthy()
    expect(patch.parentCommitHash).toBeTruthy()
    expect(patch.commitMessage).toBeTruthy()
    expect(patch.diff).toBeTruthy()
    expect(patch.committerName).toBe('John Doe')
    expect(patch.committerEmail).toBe('john@example.com')
    expect(typeof patch.committerTimestamp).toBe('number')
    expect(patch.committerTzOffset).toBeTruthy()
    expect(patch.pgpSignature).toBeTruthy()
    expect(patch.status).toBe('open')
    expect(typeof patch.createdAt).toBe('number')
  })

  it('should support different status values', () => {
    const openPatch: Patch = {
      id: 'patch1',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      commitHash: 'commit1',
      parentCommitHash: 'parent1',
      commitMessage: 'Message',
      diff: 'diff...',
      committerName: 'Name',
      committerEmail: 'email@example.com',
      committerTimestamp: 1234567890,
      committerTzOffset: '+0000',
      pgpSignature: null,
      status: 'open',
      createdAt: 1234567890
    }

    const appliedPatch: Patch = {
      id: 'patch2',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      commitHash: 'commit2',
      parentCommitHash: 'parent2',
      commitMessage: 'Message',
      diff: 'diff...',
      committerName: 'Name',
      committerEmail: 'email@example.com',
      committerTimestamp: 1234567890,
      committerTzOffset: '+0000',
      pgpSignature: null,
      status: 'applied',
      createdAt: 1234567890
    }

    expect(openPatch.status).toBe('open')
    expect(appliedPatch.status).toBe('applied')
  })

  it('should allow null pgpSignature', () => {
    const unsignedPatch: Patch = {
      id: 'patch1',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      commitHash: 'commit1',
      parentCommitHash: 'parent1',
      commitMessage: 'Unsigned commit',
      diff: 'diff...',
      committerName: 'Name',
      committerEmail: 'email@example.com',
      committerTimestamp: 1234567890,
      committerTzOffset: '+0000',
      pgpSignature: null,
      status: 'open',
      createdAt: 1234567890
    }

    expect(unsignedPatch.pgpSignature).toBeNull()
  })

  it('should allow null parentCommitHash for initial commits', () => {
    const initialPatch: Patch = {
      id: 'patch1',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      commitHash: 'commit1',
      parentCommitHash: null,
      commitMessage: 'Initial commit',
      diff: 'diff...',
      committerName: 'Name',
      committerEmail: 'email@example.com',
      committerTimestamp: 1234567890,
      committerTzOffset: '+0000',
      pgpSignature: null,
      status: 'open',
      createdAt: 1234567890
    }

    expect(initialPatch.parentCommitHash).toBeNull()
  })

  it('should handle git format-patch diff content', () => {
    const patchWithRealDiff: Patch = {
      id: 'patch1',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      commitHash: 'abc123',
      parentCommitHash: 'def456',
      commitMessage: 'Add feature',
      diff: `From abc123def456 Mon Sep 17 00:00:00 2001
From: Developer <dev@example.com>
Date: Mon, 1 Jan 2024 12:00:00 +0000
Subject: [PATCH] Add feature

---
 src/feature.ts | 10 ++++++++++
 1 file changed, 10 insertions(+)

diff --git a/src/feature.ts b/src/feature.ts
index 1234567..abcdefg 100644
--- a/src/feature.ts
+++ b/src/feature.ts
@@ -1,3 +1,13 @@
+export function newFeature() {
+  return 'feature'
+}
+`,
      committerName: 'Developer',
      committerEmail: 'dev@example.com',
      committerTimestamp: 1234567890,
      committerTzOffset: '+0000',
      pgpSignature: null,
      status: 'open',
      createdAt: 1234567890
    }

    expect(patchWithRealDiff.diff).toContain('diff --git')
    expect(patchWithRealDiff.diff).toContain('From abc123def456')
  })

  it('should support timezone offsets', () => {
    const patch1: Patch = {
      id: 'patch1',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      commitHash: 'commit1',
      parentCommitHash: 'parent1',
      commitMessage: 'Message',
      diff: 'diff...',
      committerName: 'Name',
      committerEmail: 'email@example.com',
      committerTimestamp: 1234567890,
      committerTzOffset: '+0530',
      pgpSignature: null,
      status: 'open',
      createdAt: 1234567890
    }

    const patch2: Patch = {
      id: 'patch2',
      repositoryId: 'repo1',
      author: 'author1',
      owner: 'owner1',
      commitHash: 'commit2',
      parentCommitHash: 'parent2',
      commitMessage: 'Message',
      diff: 'diff...',
      committerName: 'Name',
      committerEmail: 'email@example.com',
      committerTimestamp: 1234567890,
      committerTzOffset: '-0800',
      pgpSignature: null,
      status: 'open',
      createdAt: 1234567890
    }

    expect(patch1.committerTzOffset).toBe('+0530')
    expect(patch2.committerTzOffset).toBe('-0800')
  })
})
