/**
 * Relay status data factory for tests
 *
 * Generates RelayResult and RelayQueryMeta objects with sensible defaults.
 * All values can be overridden for specific test scenarios.
 *
 * Story 2.5: Relay Status Indicators
 */
import type { RelayResult, RelayQueryMeta } from '@/types/relay-status'

/**
 * Create a single RelayResult with optional overrides.
 *
 * @param overrides - Partial RelayResult fields to override defaults
 * @returns Complete RelayResult object
 */
export function createRelayResult(overrides: Partial<RelayResult> = {}): RelayResult {
  return {
    url: 'wss://relay.example.com',
    status: 'success',
    latencyMs: 150,
    eventCount: 5,
    ...overrides,
  }
}

/**
 * Create a RelayQueryMeta object with optional overrides.
 *
 * Default creates 3 relays: 2 successful, 1 failed.
 *
 * @param overrides - Partial RelayQueryMeta fields to override defaults
 * @returns Complete RelayQueryMeta object
 */
export function createRelayQueryMeta(overrides: Partial<RelayQueryMeta> = {}): RelayQueryMeta {
  const results = overrides.results ?? [
    createRelayResult({ url: 'wss://relay.damus.io' }),
    createRelayResult({ url: 'wss://nos.lol' }),
    createRelayResult({
      url: 'wss://relay.nostr.band',
      status: 'failed',
      latencyMs: 2000,
      eventCount: 0,
      error: 'Timeout',
    }),
  ]
  // Derive counts from results if not explicitly provided.
  // This ensures respondedCount and totalCount stay consistent with results.
  const respondedCount = overrides.respondedCount ?? results.filter(r => r.status === 'success').length
  const totalCount = overrides.totalCount ?? results.length
  return {
    results,
    queriedAt: overrides.queriedAt ?? Math.floor(Date.now() / 1000),
    respondedCount,
    totalCount,
  }
}
