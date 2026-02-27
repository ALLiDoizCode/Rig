/**
 * Tests for shared formatting utilities
 *
 * Story 2.2: Repository Card Component with Metadata
 */
import { describe, it, expect } from 'vitest'
import { truncatePubkey, formatRelativeTime } from './format'

describe('truncatePubkey', () => {
  it('should return short pubkeys unchanged (<=20 chars)', () => {
    expect(truncatePubkey('short-pubkey-abc')).toBe('short-pubkey-abc')
  })

  it('should return exactly 20-char pubkeys unchanged', () => {
    const key20 = '12345678901234567890'
    expect(key20).toHaveLength(20)
    expect(truncatePubkey(key20)).toBe(key20)
  })

  it('should truncate pubkeys longer than 20 chars', () => {
    const key21 = '123456789012345678901'
    expect(key21).toHaveLength(21)
    expect(truncatePubkey(key21)).toBe('12345678...45678901')
  })

  it('should truncate long hex pubkeys with ellipsis (first 8 + ... + last 8)', () => {
    const longPubkey = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    expect(truncatePubkey(longPubkey)).toBe('abcdef12...34567890')
  })

  it('should handle empty string', () => {
    expect(truncatePubkey('')).toBe('')
  })
})

describe('formatRelativeTime', () => {
  it('should return a string containing "ago" for past timestamps', () => {
    // A timestamp from ~1 hour ago
    const oneHourAgo = Math.floor(Date.now() / 1000) - 3600
    const result = formatRelativeTime(oneHourAgo)
    expect(result).toContain('ago')
  })

  it('should handle a timestamp from several days ago', () => {
    const threeDaysAgo = Math.floor(Date.now() / 1000) - 3 * 24 * 3600
    const result = formatRelativeTime(threeDaysAgo)
    expect(result).toContain('ago')
    expect(result).toContain('3 days')
  })

  it('should handle zero timestamp (Unix epoch)', () => {
    const result = formatRelativeTime(0)
    expect(result).toContain('ago')
    // Should contain "over" or "about" for very old timestamps
    expect(result.length).toBeGreaterThan(0)
  })

  it('should handle a very recent timestamp', () => {
    const justNow = Math.floor(Date.now() / 1000) - 10
    const result = formatRelativeTime(justNow)
    expect(result).toContain('ago')
  })

  it('should handle a future timestamp gracefully', () => {
    const oneHourFromNow = Math.floor(Date.now() / 1000) + 3600
    const result = formatRelativeTime(oneHourFromNow)
    // date-fns formatDistanceToNow with addSuffix returns "in about 1 hour" for future timestamps
    expect(result).toContain('in')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should return "Unknown" for NaN timestamp', () => {
    expect(formatRelativeTime(NaN)).toBe('Unknown')
  })

  it('should return "Unknown" for Infinity timestamp', () => {
    expect(formatRelativeTime(Infinity)).toBe('Unknown')
  })

  it('should return "Unknown" for -Infinity timestamp', () => {
    expect(formatRelativeTime(-Infinity)).toBe('Unknown')
  })
})
