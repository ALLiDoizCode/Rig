import { describe, it, expect } from 'vitest'
import {
  NostrEvent,
  NostrTag,
  BaseNostrEventSchema,
  RepoAnnouncementEventSchema,
  RepoStateEventSchema,
  PatchEventSchema,
  PullRequestEventSchema,
  PRUpdateEventSchema,
  IssueEventSchema,
  CommentEventSchema,
  StatusEventSchema,
} from './nostr'

describe('NostrEvent and NostrTag types', () => {
  it('should have correct NostrTag type structure', () => {
    const tag: NostrTag = ['e', '123', 'relay', 'root']
    expect(Array.isArray(tag)).toBe(true)
    expect(typeof tag[0]).toBe('string')
  })

  it('should have correct NostrEvent type structure', () => {
    const event: NostrEvent = {
      id: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      pubkey: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      created_at: 1234567890,
      kind: 1,
      tags: [['p', 'somepubkey']],
      content: 'test content',
      sig: 'signature1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
    }
    expect(event.id).toBe('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
  })
})

describe('BaseNostrEventSchema', () => {
  it('should accept valid base event', () => {
    const validEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1,
      tags: [['p', 'somepubkey']],
      content: 'test content',
      sig: 'signature1234567890'
    }
    expect(() => BaseNostrEventSchema.parse(validEvent)).not.toThrow()
  })

  it('should reject event missing id', () => {
    const invalidEvent = {
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1,
      tags: [],
      content: '',
      sig: 'signature'
    }
    expect(() => BaseNostrEventSchema.parse(invalidEvent)).toThrow()
  })

  it('should reject event missing sig', () => {
    const invalidEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1,
      tags: [],
      content: ''
    }
    expect(() => BaseNostrEventSchema.parse(invalidEvent)).toThrow()
  })

  it('should accept event with empty tags array', () => {
    const validEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1,
      tags: [],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => BaseNostrEventSchema.parse(validEvent)).not.toThrow()
  })

  it('should accept event with extra unknown fields (extensibility)', () => {
    const eventWithExtra = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1,
      tags: [],
      content: '',
      sig: 'signature1234567890',
      unknownField: 'should be allowed'
    }
    expect(() => BaseNostrEventSchema.parse(eventWithExtra)).not.toThrow()
  })
})

describe('RepoAnnouncementEventSchema (kind 30617)', () => {
  it('should accept valid repository announcement', () => {
    const validEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 30617,
      tags: [
        ['d', 'my-awesome-repo'],
        ['name', 'My Awesome Repo'],
        ['description', 'A great repository']
      ],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => RepoAnnouncementEventSchema.parse(validEvent)).not.toThrow()
  })

  it('should reject event with wrong kind', () => {
    const invalidEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1621, // Wrong kind
      tags: [['d', 'my-repo']],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => RepoAnnouncementEventSchema.parse(invalidEvent)).toThrow()
  })

  it('should reject event missing required "d" tag', () => {
    const invalidEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 30617,
      tags: [['name', 'My Repo']], // Missing 'd' tag
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => RepoAnnouncementEventSchema.parse(invalidEvent)).toThrow()
  })

  it('should accept event with multiple optional tags', () => {
    const validEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 30617,
      tags: [
        ['d', 'my-repo'],
        ['web', 'https://example.com'],
        ['web', 'https://mirror.example.com'],
        ['clone', 'https://github.com/user/repo.git'],
        ['maintainers', 'pubkey1', 'pubkey2'],
        ['t', 'javascript'],
        ['t', 'typescript']
      ],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => RepoAnnouncementEventSchema.parse(validEvent)).not.toThrow()
  })
})

describe('RepoStateEventSchema (kind 30618)', () => {
  it('should accept valid repository state event', () => {
    const validEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 30618,
      tags: [
        ['d', 'my-repo'],
        ['refs/heads/main', 'abcdef123456'],
        ['HEAD', 'ref: refs/heads/main']
      ],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => RepoStateEventSchema.parse(validEvent)).not.toThrow()
  })

  it('should reject event with wrong kind', () => {
    const invalidEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 30617, // Wrong kind
      tags: [['d', 'my-repo']],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => RepoStateEventSchema.parse(invalidEvent)).toThrow()
  })
})

describe('PatchEventSchema (kind 1617)', () => {
  it('should accept valid patch event', () => {
    const validEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1617,
      tags: [
        ['a', '30617:abcdef:my-repo'],
        ['commit', 'abc123'],
        ['parent-commit', 'def456']
      ],
      content: 'diff --git a/file.txt b/file.txt\n...',
      sig: 'signature1234567890'
    }
    expect(() => PatchEventSchema.parse(validEvent)).not.toThrow()
  })

  it('should reject event with wrong kind', () => {
    const invalidEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1618, // Wrong kind
      tags: [],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => PatchEventSchema.parse(invalidEvent)).toThrow()
  })
})

describe('PullRequestEventSchema (kind 1618)', () => {
  it('should accept valid pull request event', () => {
    const validEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1618,
      tags: [
        ['a', '30617:abcdef:my-repo'],
        ['p', 'ownerpubkey'],
        ['subject', 'Fix critical bug'],
        ['c', 'abc123'],
        ['branch-name', 'fix-bug']
      ],
      content: '## Description\nThis PR fixes a critical bug',
      sig: 'signature1234567890'
    }
    expect(() => PullRequestEventSchema.parse(validEvent)).not.toThrow()
  })

  it('should reject event with wrong kind', () => {
    const invalidEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1617, // Wrong kind
      tags: [],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => PullRequestEventSchema.parse(invalidEvent)).toThrow()
  })
})

describe('PRUpdateEventSchema (kind 1619)', () => {
  it('should accept valid PR update event', () => {
    const validEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1619,
      tags: [
        ['a', '30617:abcdef:my-repo'],
        ['E', 'original-pr-id'],
        ['P', 'original-pr-author'],
        ['c', 'new-tip-commit-hash'],
        ['clone', 'https://github.com/user/repo.git'],
        ['merge-base', 'abc123']
      ],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => PRUpdateEventSchema.parse(validEvent)).not.toThrow()
  })

  it('should reject event with wrong kind', () => {
    const invalidEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1618, // Wrong kind
      tags: [],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => PRUpdateEventSchema.parse(invalidEvent)).toThrow()
  })
})

describe('IssueEventSchema (kind 1621)', () => {
  it('should accept valid issue event', () => {
    const validEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1621,
      tags: [
        ['a', '30617:abcdef:my-repo'],
        ['p', 'ownerpubkey'],
        ['subject', 'Bug report'],
        ['t', 'bug']
      ],
      content: '## Bug Description\nSomething is broken',
      sig: 'signature1234567890'
    }
    expect(() => IssueEventSchema.parse(validEvent)).not.toThrow()
  })

  it('should reject event with wrong kind', () => {
    const invalidEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1622, // Wrong kind
      tags: [],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => IssueEventSchema.parse(invalidEvent)).toThrow()
  })
})

describe('CommentEventSchema (kind 1622)', () => {
  it('should accept valid comment event', () => {
    const validEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1622,
      tags: [
        ['e', 'targeteventid', '', 'root'],
        ['p', 'targetauthorpubkey']
      ],
      content: 'This is a comment',
      sig: 'signature1234567890'
    }
    expect(() => CommentEventSchema.parse(validEvent)).not.toThrow()
  })

  it('should reject event with wrong kind', () => {
    const invalidEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1621, // Wrong kind
      tags: [],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => CommentEventSchema.parse(invalidEvent)).toThrow()
  })
})

describe('StatusEventSchema (kinds 1630-1633)', () => {
  it('should accept status open event (kind 1630)', () => {
    const validEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1630,
      tags: [
        ['e', 'targeteventid', '', 'root'],
        ['p', 'ownerpubkey']
      ],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => StatusEventSchema.parse(validEvent)).not.toThrow()
  })

  it('should accept status applied event (kind 1631)', () => {
    const validEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1631,
      tags: [
        ['e', 'targeteventid', '', 'root'],
        ['p', 'ownerpubkey'],
        ['merge-commit', 'abc123']
      ],
      content: 'Merged successfully',
      sig: 'signature1234567890'
    }
    expect(() => StatusEventSchema.parse(validEvent)).not.toThrow()
  })

  it('should accept status closed event (kind 1632)', () => {
    const validEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1632,
      tags: [
        ['e', 'targeteventid', '', 'root'],
        ['p', 'ownerpubkey']
      ],
      content: 'Closing this',
      sig: 'signature1234567890'
    }
    expect(() => StatusEventSchema.parse(validEvent)).not.toThrow()
  })

  it('should accept status draft event (kind 1633)', () => {
    const validEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1633,
      tags: [
        ['e', 'targeteventid', '', 'root'],
        ['p', 'ownerpubkey']
      ],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => StatusEventSchema.parse(validEvent)).not.toThrow()
  })

  it('should reject event with wrong kind', () => {
    const invalidEvent = {
      id: '1234567890abcdef',
      pubkey: 'abcdef1234567890',
      created_at: 1234567890,
      kind: 1621, // Wrong kind
      tags: [],
      content: '',
      sig: 'signature1234567890'
    }
    expect(() => StatusEventSchema.parse(invalidEvent)).toThrow()
  })
})
