/**
 * Shared formatting utilities
 *
 * Extracted from Home.tsx (Story 2.2) for reuse across components.
 */
import { formatDistanceToNow } from 'date-fns'

/**
 * Truncate a hex public key for display.
 * Shows first 8 and last 8 characters with ellipsis.
 *
 * @param pubkey - The full public key string
 * @returns Truncated pubkey or original if short enough
 */
export function truncatePubkey(pubkey: string): string {
  if (pubkey.length <= 20) return pubkey
  return `${pubkey.slice(0, 8)}...${pubkey.slice(-8)}`
}

/**
 * Format a Unix timestamp (seconds) as a relative time string.
 * E.g., "2 hours ago", "3 days ago"
 *
 * @param unixTimestamp - Unix timestamp in seconds
 * @returns Relative time string
 */
export function formatRelativeTime(unixTimestamp: number): string {
  if (!Number.isFinite(unixTimestamp)) {
    return 'Unknown'
  }
  return formatDistanceToNow(new Date(unixTimestamp * 1000), { addSuffix: true })
}
