import { describe, it, expect } from 'vitest'
import {
  CACHE_TTL_REPOSITORY,
  CACHE_TTL_ISSUE,
  CACHE_TTL_PULL_REQUEST,
  CACHE_TTL_COMMENT,
  CACHE_TTL_PATCH,
  CACHE_DB_NAME,
  CACHE_DB_VERSION,
} from './cache'

describe('Cache Constants', () => {
  describe('TTL Values', () => {
    it('should have repository TTL of 1 hour (3600000ms)', () => {
      expect(CACHE_TTL_REPOSITORY).toBe(3600000)
    })

    it('should have issue TTL of 5 minutes (300000ms)', () => {
      expect(CACHE_TTL_ISSUE).toBe(300000)
    })

    it('should have pull request TTL of 5 minutes (300000ms)', () => {
      expect(CACHE_TTL_PULL_REQUEST).toBe(300000)
    })

    it('should have comment TTL of 5 minutes (300000ms)', () => {
      expect(CACHE_TTL_COMMENT).toBe(300000)
    })

    it('should have patch TTL of 5 minutes (300000ms)', () => {
      expect(CACHE_TTL_PATCH).toBe(300000)
    })

    it('should have all TTL values as positive numbers', () => {
      const ttls = [
        CACHE_TTL_REPOSITORY,
        CACHE_TTL_ISSUE,
        CACHE_TTL_PULL_REQUEST,
        CACHE_TTL_COMMENT,
        CACHE_TTL_PATCH,
      ]
      ttls.forEach((ttl) => {
        expect(ttl).toBeGreaterThan(0)
        expect(Number.isInteger(ttl)).toBe(true)
      })
    })
  })

  describe('Database Configuration', () => {
    it('should have database name as "rig-cache"', () => {
      expect(CACHE_DB_NAME).toBe('rig-cache')
    })

    it('should have database version as 1', () => {
      expect(CACHE_DB_VERSION).toBe(1)
    })

    it('should have database version as positive integer', () => {
      expect(CACHE_DB_VERSION).toBeGreaterThan(0)
      expect(Number.isInteger(CACHE_DB_VERSION)).toBe(true)
    })
  })
})
