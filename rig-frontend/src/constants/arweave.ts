/**
 * Arweave & ar.io Gateway Configuration Constants
 *
 * Used by the Arweave service layer for gateway routing and verification.
 */

/**
 * Trusted gateway URLs for hash verification of Arweave data
 *
 * Primary gateway reads from VITE_ARWEAVE_GATEWAY env var (falls back to arweave.net).
 * Note: This is separate from GATEWAY_COUNT (10 discovered gateways for routing).
 * - Routing: Wayfinder discovers 10 ar.io gateways and tries 3+ per request with automatic failover
 * - Verification: Hash verification uses these 2 trusted sources (primary gateway, permagate.io)
 * - This design balances decentralized routing with trusted verification anchors
 */
const envGateway = import.meta.env.VITE_ARWEAVE_GATEWAY

// Validate and use env gateway, fall back to default if invalid
let primaryGateway = 'https://arweave.net'
if (envGateway) {
  try {
    new URL(envGateway) // Validate URL format
    primaryGateway = envGateway
  } catch {
    console.warn(`Invalid VITE_ARWEAVE_GATEWAY: "${envGateway}", using default: ${primaryGateway}`)
  }
}

export const TRUSTED_GATEWAYS = [
  new URL(primaryGateway),
  new URL('https://permagate.io'),
]

/** Gateway request timeout in milliseconds (per NFR-P9: <3s for 95% of retrievals) */
export const GATEWAY_TIMEOUT_MS = 3000

/** Number of ar.io gateways to discover from the network */
export const GATEWAY_COUNT = 10

/** How long to cache the gateway list in localStorage (seconds) */
export const GATEWAY_CACHE_TTL_SECONDS = 3600
