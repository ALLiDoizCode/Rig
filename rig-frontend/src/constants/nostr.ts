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

/**
 * Default Nostr Relay URLs
 *
 * Static relay pool with 3 hardcoded reliable relays.
 * Multi-relay setup provides redundancy and censorship resistance.
 */
export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band'
]
