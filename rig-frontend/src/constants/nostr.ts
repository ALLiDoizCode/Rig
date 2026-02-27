/**
 * NIP-34 Event Kind Constants
 *
 * NIP-34 defines git-related event kinds for decentralized code collaboration.
 * See: https://github.com/nostr-protocol/nips/blob/master/34.md
 */

/** Repository announcement (kind 30617) - Parameterized replaceable event */
export const REPO_ANNOUNCEMENT = 30617

/** Issue (kind 1621) - Regular event */
export const ISSUE = 1621

/** Pull request (kind 1618) - Regular event */
export const PULL_REQUEST = 1618

/** Patch (kind 1617) - Regular event containing git diff */
export const PATCH = 1617

/** Comment (kind 1622) - Generic comment for issues/PRs */
export const COMMENT = 1622

/** Repository state (kind 30618) - Parameterized replaceable event */
export const REPO_STATE = 30618

/** Pull request update (kind 1619) - Update to existing PR */
export const PR_UPDATE = 1619

/** Status: Open (kind 1630) - Issue/PR/Patch opened */
export const STATUS_OPEN = 1630

/** Status: Applied/Merged/Resolved (kind 1631) - Successfully applied */
export const STATUS_APPLIED = 1631

/** Status: Closed (kind 1632) - Issue/PR/Patch closed without merge */
export const STATUS_CLOSED = 1632

/** Status: Draft (kind 1633) - Draft state */
export const STATUS_DRAFT = 1633

/**
 * Default Nostr Relay URLs
 *
 * Reads from VITE_NOSTR_RELAYS environment variable (comma-separated).
 * Falls back to hardcoded relays if env var not set.
 * Multi-relay setup provides redundancy and censorship resistance.
 */
const envRelays = import.meta.env.VITE_NOSTR_RELAYS
const FALLBACK_RELAYS = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band'] as const
export const DEFAULT_RELAYS: readonly string[] = envRelays
  ? envRelays.split(',').map((r: string) => r.trim()).filter(Boolean)
  : FALLBACK_RELAYS
