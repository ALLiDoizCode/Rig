import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { eventToPatch } from './eventToPatch'
import type { PatchEvent } from '@/types/nostr'
import { PATCH } from '@/constants/nostr'

describe('eventToPatch', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  it('should transform valid patch event with all fields', () => {
    const event: PatchEvent = {
      id: 'patch123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PATCH,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['commit', 'abc123def456'],
        ['parent-commit', 'parent789xyz'],
        ['committer', 'John Doe', 'john@example.com', '1234567890', '+0530'],
        ['commit-pgp-sig', '-----BEGIN PGP SIGNATURE-----\n...']
      ],
      content: `Add new feature

This commit adds a new feature to the codebase.

diff --git a/file.txt b/file.txt
index abc123..def456 100644
--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,4 @@
 line 1
 line 2
+new line
 line 3`,
      sig: 'sig123'
    }

    const result = eventToPatch(event)

    expect(result).toEqual({
      id: 'patch123',
      repositoryId: '30617:owner123:my-repo',
      author: 'author123',
      owner: 'owner123',
      commitHash: 'abc123def456',
      parentCommitHash: 'parent789xyz',
      commitMessage: 'Add new feature',
      diff: event.content,
      committerName: 'John Doe',
      committerEmail: 'john@example.com',
      committerTimestamp: 1234567890,
      committerTzOffset: '+0530',
      pgpSignature: '-----BEGIN PGP SIGNATURE-----\n...',
      status: 'open',
      createdAt: 1234567890
    })
  })

  it('should extract commit message from first line of content', () => {
    const event: PatchEvent = {
      id: 'patch123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PATCH,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['commit', 'abc123'],
        ['committer', 'John Doe', 'john@example.com', '1234567890', '+0000']
      ],
      content: 'Fix critical bug\n\nThis fixes the issue...\n\ndiff --git ...',
      sig: 'sig123'
    }

    const result = eventToPatch(event)

    expect(result?.commitMessage).toBe('Fix critical bug')
  })

  it('should handle missing optional parent-commit (initial commit)', () => {
    const event: PatchEvent = {
      id: 'patch123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PATCH,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['commit', 'abc123'],
        ['committer', 'John Doe', 'john@example.com', '1234567890', '+0000']
      ],
      content: 'Initial commit\n\ndiff --git ...',
      sig: 'sig123'
    }

    const result = eventToPatch(event)

    expect(result?.parentCommitHash).toBe(null)
  })

  it('should handle missing optional commit-pgp-sig', () => {
    const event: PatchEvent = {
      id: 'patch123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PATCH,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['commit', 'abc123'],
        ['committer', 'John Doe', 'john@example.com', '1234567890', '+0000']
      ],
      content: 'Unsigned commit\n\ndiff --git ...',
      sig: 'sig123'
    }

    const result = eventToPatch(event)

    expect(result?.pgpSignature).toBe(null)
  })

  it('should default status to open', () => {
    const event: PatchEvent = {
      id: 'patch123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PATCH,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['commit', 'abc123'],
        ['committer', 'John Doe', 'john@example.com', '1234567890', '+0000']
      ],
      content: 'Commit message\n\ndiff ...',
      sig: 'sig123'
    }

    const result = eventToPatch(event)

    expect(result?.status).toBe('open')
  })

  it('should return null when a tag is missing', () => {
    const event: PatchEvent = {
      id: 'patch123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PATCH,
      tags: [
        ['p', 'owner123'],
        ['commit', 'abc123'],
        ['committer', 'John Doe', 'john@example.com', '1234567890', '+0000']
      ],
      content: 'Commit message',
      sig: 'sig123'
    }

    const result = eventToPatch(event)

    expect(result).toBe(null)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid patch event: missing required "a" tag',
      'patch123'
    )
  })

  it('should return null when p tag is missing', () => {
    const event: PatchEvent = {
      id: 'patch123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PATCH,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['commit', 'abc123'],
        ['committer', 'John Doe', 'john@example.com', '1234567890', '+0000']
      ],
      content: 'Commit message',
      sig: 'sig123'
    }

    const result = eventToPatch(event)

    expect(result).toBe(null)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid patch event: missing required "p" tag',
      'patch123'
    )
  })

  it('should return null when commit tag is missing', () => {
    const event: PatchEvent = {
      id: 'patch123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PATCH,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['committer', 'John Doe', 'john@example.com', '1234567890', '+0000']
      ],
      content: 'Commit message',
      sig: 'sig123'
    }

    const result = eventToPatch(event)

    expect(result).toBe(null)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid patch event: missing required "commit" tag',
      'patch123'
    )
  })

  it('should return null when committer tag is missing', () => {
    const event: PatchEvent = {
      id: 'patch123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PATCH,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['commit', 'abc123']
      ],
      content: 'Commit message',
      sig: 'sig123'
    }

    const result = eventToPatch(event)

    expect(result).toBe(null)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Invalid patch event: missing required "committer" tag',
      'patch123'
    )
  })

  it('should handle malformed committer tag with defaults', () => {
    const event: PatchEvent = {
      id: 'patch123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PATCH,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['commit', 'abc123'],
        ['committer', 'John Doe'] // Missing email, timestamp, tz-offset
      ],
      content: 'Commit message',
      sig: 'sig123'
    }

    const result = eventToPatch(event)

    expect(result?.committerName).toBe('John Doe')
    expect(result?.committerEmail).toBe('')
    expect(result?.committerTimestamp).toBe(0)
    expect(result?.committerTzOffset).toBe('+0000')
  })

  it('should parse committer timestamp as number', () => {
    const event: PatchEvent = {
      id: 'patch123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PATCH,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['commit', 'abc123'],
        ['committer', 'John Doe', 'john@example.com', '9876543210', '-0800']
      ],
      content: 'Commit message',
      sig: 'sig123'
    }

    const result = eventToPatch(event)

    expect(result?.committerTimestamp).toBe(9876543210)
    expect(typeof result?.committerTimestamp).toBe('number')
  })

  it('should default committerTimestamp to 0 for non-numeric value', () => {
    const event: PatchEvent = {
      id: 'patch123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PATCH,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['commit', 'abc123'],
        ['committer', 'John Doe', 'john@example.com', 'not-a-number', '+0000']
      ],
      content: 'Commit message',
      sig: 'sig123'
    }

    const result = eventToPatch(event)

    expect(result?.committerTimestamp).toBe(0)
    expect(typeof result?.committerTimestamp).toBe('number')
  })

  it('should extract commit message from Subject: header in format-patch output', () => {
    const event: PatchEvent = {
      id: 'patch123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PATCH,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['commit', 'abc123'],
        ['committer', 'John Doe', 'john@example.com', '1234567890', '+0000']
      ],
      content: 'Subject: [PATCH] Fix login validation\n\nSigned-off-by: John\n\ndiff --git ...',
      sig: 'sig123'
    }

    const result = eventToPatch(event)

    expect(result?.commitMessage).toBe('Fix login validation')
  })

  it('should handle different timezone offsets', () => {
    const event: PatchEvent = {
      id: 'patch123',
      pubkey: 'author123',
      created_at: 1234567890,
      kind: PATCH,
      tags: [
        ['a', '30617:owner123:my-repo'],
        ['p', 'owner123'],
        ['commit', 'abc123'],
        ['committer', 'John Doe', 'john@example.com', '1234567890', '-1200']
      ],
      content: 'Commit message',
      sig: 'sig123'
    }

    const result = eventToPatch(event)

    expect(result?.committerTzOffset).toBe('-1200')
  })
})
