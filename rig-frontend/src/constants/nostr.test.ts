import { describe, it, expect } from 'vitest'
import {
  REPO_ANNOUNCEMENT,
  ISSUE,
  PULL_REQUEST,
  PATCH,
  COMMENT,
  DEFAULT_RELAYS
} from './nostr'

describe('Nostr Constants', () => {
  describe('NIP-34 Event Kind Constants', () => {
    it('should define REPO_ANNOUNCEMENT as 30617', () => {
      expect(REPO_ANNOUNCEMENT).toBe(30617)
    })

    it('should define ISSUE as 1621', () => {
      expect(ISSUE).toBe(1621)
    })

    it('should define PULL_REQUEST as 1618', () => {
      expect(PULL_REQUEST).toBe(1618)
    })

    it('should define PATCH as 1617', () => {
      expect(PATCH).toBe(1617)
    })

    it('should define COMMENT as 1622', () => {
      expect(COMMENT).toBe(1622)
    })
  })

  describe('DEFAULT_RELAYS', () => {
    it('should contain relay.damus.io', () => {
      expect(DEFAULT_RELAYS).toContain('wss://relay.damus.io')
    })

    it('should contain nos.lol', () => {
      expect(DEFAULT_RELAYS).toContain('wss://nos.lol')
    })

    it('should contain relay.nostr.band', () => {
      expect(DEFAULT_RELAYS).toContain('wss://relay.nostr.band')
    })

    it('should have exactly 3 relays', () => {
      expect(DEFAULT_RELAYS).toHaveLength(3)
    })

    it('should contain only valid WebSocket URLs', () => {
      DEFAULT_RELAYS.forEach(relay => {
        expect(relay).toMatch(/^wss:\/\//)
      })
    })
  })
})
