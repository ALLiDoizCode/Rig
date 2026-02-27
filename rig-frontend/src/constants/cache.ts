/**
 * Cache configuration constants for IndexedDB caching layer
 * Implements hybrid TTL policy per Architecture specification
 */

/**
 * Cache TTL (Time To Live) values in milliseconds
 */

/** Repository metadata TTL: 1 hour (repos change rarely) */
export const CACHE_TTL_REPOSITORY = 3600000

/** Issue TTL: 5 minutes (active discussions need freshness) */
export const CACHE_TTL_ISSUE = 300000

/** Pull Request TTL: 5 minutes */
export const CACHE_TTL_PULL_REQUEST = 300000

/** Comment TTL: 5 minutes */
export const CACHE_TTL_COMMENT = 300000

/** Patch TTL: 5 minutes */
export const CACHE_TTL_PATCH = 300000

/**
 * Database configuration
 */

/** IndexedDB database name */
export const CACHE_DB_NAME = 'rig-cache'

/** IndexedDB database version */
export const CACHE_DB_VERSION = 1
