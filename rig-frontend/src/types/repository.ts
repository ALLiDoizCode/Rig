/**
 * Repository Domain Model
 *
 * Represents a git repository parsed from NIP-34 kind 30617 events.
 * This interface defines the structure after transformation from raw Nostr events.
 */

/**
 * Git repository domain model
 *
 * Parsed from kind 30617 (Repository Announcement) events.
 * Contains all repository metadata extracted from event tags.
 */
export interface Repository {
  /** Repository identifier from 'd' tag (kebab-case) */
  id: string

  /** Display name from 'name' tag, fallback to 'd' tag value */
  name: string

  /** Repository description from 'description' tag */
  description: string

  /** Repository owner public key (event.pubkey) */
  owner: string

  /** List of maintainer public keys from 'maintainers' tag */
  maintainers: string[]

  /** Web URLs for repository browsing from 'web' tags */
  webUrls: string[]

  /** Git clone URLs from 'clone' tags */
  cloneUrls: string[]

  /** Preferred Nostr relays from 'relays' tag */
  relays: string[]

  /** Topic tags from 't' tags (excluding 'personal-fork') */
  topics: string[]

  /** Whether repository has 'personal-fork' topic tag */
  isPersonalFork: boolean

  /** Earliest unique commit from 'r' tag with 'euc' marker, or null */
  earliestUniqueCommit: string | null

  /** Nostr event ID of the repository announcement */
  eventId: string

  /** Unix timestamp when repository was announced (event.created_at) */
  createdAt: number
}
