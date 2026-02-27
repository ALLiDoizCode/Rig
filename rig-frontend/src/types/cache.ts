/**
 * Cache type definitions for IndexedDB caching layer
 */

/**
 * Cached Nostr event with TTL
 * Stores transformed domain models, not raw events
 */
export interface CachedEvent {
  /** Auto-incrementing primary key (optional for inserts) */
  id?: number
  /** Nostr event kind (e.g., 30617 for repositories, 1621 for issues) */
  eventKind: number
  /** Event ID (event.id from Nostr) */
  eventId: string
  /** Transformed domain model data */
  data: unknown
  /** Timestamp when cached (ms since epoch) */
  cachedAt: number
  /** Timestamp when cache expires (ms since epoch) */
  expiresAt: number
  /** Timestamp of last access (for LRU eviction) */
  lastAccessedAt: number
}

/**
 * Cached Arweave file content
 * Permanent storage - no TTL (immutable content)
 */
export interface CachedFile {
  /** Auto-incrementing primary key (optional for inserts) */
  id?: number
  /** Arweave transaction ID */
  txId: string
  /** File path within repository */
  path: string
  /** File content */
  content: string
  /** Timestamp when cached (ms since epoch) */
  cachedAt: number
  /** Timestamp of last access (for LRU eviction) */
  lastAccessedAt: number
}

/**
 * Cache retrieval result with staleness indicator
 * Supports stale-while-revalidate pattern
 */
export interface CacheResult<T> {
  /** Cached data, or null if cache miss */
  data: T | null
  /** True if data is expired but returned for stale-while-revalidate */
  isStale: boolean
}
