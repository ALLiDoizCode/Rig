/**
 * Cache service using IndexedDB via Dexie
 * Implements hybrid TTL policies and stale-while-revalidate pattern
 */

import Dexie, { type Table } from 'dexie'
import type { CachedEvent, CachedFile, CacheResult } from '../types/cache'
import { CACHE_DB_NAME, CACHE_DB_VERSION } from '../constants/cache'

/**
 * Dexie database for caching
 * Module-private singleton (not exported)
 */
class CacheDatabase extends Dexie {
  events!: Table<CachedEvent>
  files!: Table<CachedFile>

  constructor() {
    super(CACHE_DB_NAME)
    this.version(CACHE_DB_VERSION).stores({
      // Events table: compound index on [eventKind+eventId] for fast lookups
      // Also index eventKind, expiresAt, lastAccessedAt for queries
      events: '++id, [eventKind+eventId], eventKind, expiresAt, lastAccessedAt',
      // Files table: compound index on [txId+path] for fast lookups
      files: '++id, [txId+path], lastAccessedAt',
    })
  }
}

// Module-private singleton instance
const db = new CacheDatabase()

/** Number of entries to evict per LRU batch */
const LRU_EVICTION_BATCH_SIZE = 10

/**
 * Cache a Nostr event with TTL
 * @param eventKind - Nostr event kind (e.g., 30617 for repositories)
 * @param eventId - Event ID
 * @param data - Transformed domain model data
 * @param ttl - Time to live in milliseconds
 */
export async function cacheEvent(
  eventKind: number,
  eventId: string,
  data: unknown,
  ttl: number
): Promise<void> {
  // Input validation
  if (eventKind < 0 || !eventId || ttl <= 0) {
    console.warn('Invalid cache input:', { eventKind, eventId, ttl })
    return
  }

  try {
    const now = Date.now()
    const cachedEvent: CachedEvent = {
      eventKind,
      eventId,
      data,
      cachedAt: now,
      expiresAt: now + ttl,
      lastAccessedAt: now,
    }

    // Upsert: update if exists, insert if new
    const existing = await db.events
      .where('[eventKind+eventId]')
      .equals([eventKind, eventId])
      .first()

    if (existing) {
      await db.events.update(existing.id!, cachedEvent)
    } else {
      await db.events.add(cachedEvent)
    }
  } catch (err) {
    console.warn('Cache write failed:', err)
    // Gracefully degrade - cache failure should not break the app
  }
}

/**
 * Get cached event with stale-while-revalidate support
 * @param eventKind - Nostr event kind
 * @param eventId - Event ID
 * @returns CacheResult with data and isStale flag (data is null if not found)
 */
export async function getCachedEvent<T = unknown>(
  eventKind: number,
  eventId: string
): Promise<CacheResult<T>> {
  try {
    const cached = await db.events
      .where('[eventKind+eventId]')
      .equals([eventKind, eventId])
      .first()

    if (!cached) {
      return { data: null, isStale: false }
    }

    const now = Date.now()
    const isExpired = now > cached.expiresAt

    // Update lastAccessedAt for LRU tracking
    await db.events.update(cached.id!, { lastAccessedAt: now })

    // Stale-while-revalidate: return data even if expired, with isStale flag
    // Note: Type cast is unsafe - validation happens at service layer (Story 1.5)
    return {
      data: cached.data as T,
      isStale: isExpired,
    }
  } catch (err) {
    console.warn('Cache read failed:', err)
    return { data: null, isStale: false }
  }
}

/**
 * Cache an Arweave file (permanent, no TTL)
 * @param txId - Arweave transaction ID
 * @param path - File path
 * @param content - File content
 */
export async function cacheFile(
  txId: string,
  path: string,
  content: string
): Promise<void> {
  // Input validation
  if (!txId || !path) {
    console.warn('Invalid file cache input:', { txId, path })
    return
  }

  try {
    const now = Date.now()
    const cachedFile: CachedFile = {
      txId,
      path,
      content,
      cachedAt: now,
      lastAccessedAt: now,
    }

    // Upsert: update if exists, insert if new
    const existing = await db.files.where('[txId+path]').equals([txId, path]).first()

    if (existing) {
      await db.files.update(existing.id!, cachedFile)
    } else {
      await db.files.add(cachedFile)
    }
  } catch (err) {
    console.warn('File cache write failed:', err)
    // Gracefully degrade - cache failure should not break the app
  }
}

/**
 * Get cached file content
 * @param txId - Arweave transaction ID
 * @param path - File path
 * @returns File content, or null if not found
 */
export async function getCachedFile(
  txId: string,
  path: string
): Promise<string | null> {
  try {
    const cached = await db.files.where('[txId+path]').equals([txId, path]).first()

    if (!cached) {
      return null
    }

    // Update lastAccessedAt for LRU tracking
    await db.files.update(cached.id!, { lastAccessedAt: Date.now() })

    return cached.content
  } catch (err) {
    console.warn('File cache read failed:', err)
    return null
  }
}

/**
 * Invalidate cache entries
 * @param eventKind - Optional event kind to filter by (clears all events if omitted)
 * @param filter - Optional additional filter (reserved for event-specific queries in future stories)
 */
export async function invalidateCache(
  eventKind?: number,
  _filter?: unknown, // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<void> {
  try {
    if (eventKind !== undefined) {
      // Clear specific event kind
      await db.events.where('eventKind').equals(eventKind).delete()
    } else {
      // Clear all events (but not files)
      await db.events.clear()
    }
  } catch (err) {
    console.warn('Cache invalidation failed:', err)
    // Gracefully degrade - invalidation failure is non-critical
  }
}

/**
 * Clear all expired cache entries
 * Does not affect files (permanent cache)
 */
export async function clearExpired(): Promise<void> {
  try {
    const now = Date.now()
    await db.events.where('expiresAt').below(now).delete()
  } catch (err) {
    console.warn('Clear expired failed:', err)
    // Gracefully degrade - cleanup failure is non-critical
  }
}

/**
 * Evict least-recently-used entries to free up space
 * Note: Current implementation evicts a fixed batch size. Future enhancement could
 * use targetBytes parameter with navigator.storage.estimate() for quota-aware eviction.
 * @param targetBytes - Optional target size in bytes (reserved for quota management)
 * @returns Number of entries evicted
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function evictLRU(_targetBytes?: number): Promise<number> {
  try {
    // Get all entries sorted by lastAccessedAt (oldest first)
    const eventsToEvict = await db.events
      .orderBy('lastAccessedAt')
      .limit(LRU_EVICTION_BATCH_SIZE)
      .toArray()

    const filesToEvict = await db.files
      .orderBy('lastAccessedAt')
      .limit(LRU_EVICTION_BATCH_SIZE)
      .toArray()

    // Delete oldest events
    const eventIds = eventsToEvict.map((e) => e.id!).filter((id) => id !== undefined)
    if (eventIds.length > 0) {
      await db.events.bulkDelete(eventIds)
    }

    // Delete oldest files
    const fileIds = filesToEvict.map((f) => f.id!).filter((id) => id !== undefined)
    if (fileIds.length > 0) {
      await db.files.bulkDelete(fileIds)
    }

    return eventIds.length + fileIds.length
  } catch (err) {
    console.warn('LRU eviction failed:', err)
    return 0
  }
}
