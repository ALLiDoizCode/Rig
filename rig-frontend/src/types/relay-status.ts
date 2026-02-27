/**
 * Relay Status Types
 *
 * Types for tracking per-relay query metadata including response status,
 * latency, and aggregate statistics. Used by the relay status indicator
 * components to display verification confidence levels.
 *
 * Story 2.5: Relay Status Indicators
 */

/**
 * Result of querying a single Nostr relay.
 *
 * Tracks whether the relay responded successfully, how long it took,
 * and how many events it returned.
 */
export interface RelayResult {
  /** Relay WebSocket URL (e.g., "wss://relay.damus.io") */
  url: string

  /** Whether the relay responded successfully or failed/timed out */
  status: 'success' | 'failed'

  /** Response time in milliseconds */
  latencyMs: number

  /** Number of events returned by this relay */
  eventCount: number

  /** Error message if the relay failed (undefined for successful relays) */
  error?: string
}

/**
 * Aggregate metadata from querying multiple relays.
 *
 * Contains per-relay results and summary statistics.
 * Stored in TanStack Query cache under relayStatusKeys.all().
 */
export interface RelayQueryMeta {
  /** Per-relay query results */
  results: RelayResult[]

  /** Unix timestamp (seconds) when the query was initiated */
  queriedAt: number

  /** Number of relays that responded successfully */
  respondedCount: number

  /** Total number of relays queried */
  totalCount: number
}
