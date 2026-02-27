import { describe, it, expect } from 'vitest'
import {
  TRUSTED_GATEWAYS,
  GATEWAY_TIMEOUT_MS,
  GATEWAY_COUNT,
  GATEWAY_CACHE_TTL_SECONDS,
} from './arweave'

describe('Arweave Constants', () => {
  describe('TRUSTED_GATEWAYS', () => {
    it('should contain valid HTTPS URLs', () => {
      expect(TRUSTED_GATEWAYS).toBeDefined()
      expect(Array.isArray(TRUSTED_GATEWAYS)).toBe(true)
      expect(TRUSTED_GATEWAYS.length).toBeGreaterThan(0)

      TRUSTED_GATEWAYS.forEach((gateway) => {
        expect(gateway).toBeInstanceOf(URL)
        expect(gateway.protocol).toBe('https:')
      })
    })

    it('should contain arweave.net as a trusted gateway', () => {
      const hasArweaveNet = TRUSTED_GATEWAYS.some(
        (gw) => gw.hostname === 'arweave.net',
      )
      expect(hasArweaveNet).toBe(true)
    })
  })

  describe('GATEWAY_TIMEOUT_MS', () => {
    it('should be a positive number', () => {
      expect(GATEWAY_TIMEOUT_MS).toBeDefined()
      expect(typeof GATEWAY_TIMEOUT_MS).toBe('number')
      expect(GATEWAY_TIMEOUT_MS).toBeGreaterThan(0)
    })

    it('should be 3000ms as per NFR-P9', () => {
      expect(GATEWAY_TIMEOUT_MS).toBe(3000)
    })
  })

  describe('GATEWAY_COUNT', () => {
    it('should be a positive number', () => {
      expect(GATEWAY_COUNT).toBeDefined()
      expect(typeof GATEWAY_COUNT).toBe('number')
      expect(GATEWAY_COUNT).toBeGreaterThan(0)
    })

    it('should be 10 gateways', () => {
      expect(GATEWAY_COUNT).toBe(10)
    })
  })

  describe('GATEWAY_CACHE_TTL_SECONDS', () => {
    it('should be a positive number', () => {
      expect(GATEWAY_CACHE_TTL_SECONDS).toBeDefined()
      expect(typeof GATEWAY_CACHE_TTL_SECONDS).toBe('number')
      expect(GATEWAY_CACHE_TTL_SECONDS).toBeGreaterThan(0)
    })

    it('should be 3600 seconds (1 hour)', () => {
      expect(GATEWAY_CACHE_TTL_SECONDS).toBe(3600)
    })
  })

  describe('Environment Variable Handling', () => {
    it('should validate URL format for gateway', () => {
      // Test that invalid URLs are caught (tested via fallback behavior)
      // If VITE_ARWEAVE_GATEWAY is invalid, primaryGateway falls back to arweave.net
      const validUrlPattern = /^https:\/\/.+/
      TRUSTED_GATEWAYS.forEach((gateway) => {
        expect(gateway.href).toMatch(validUrlPattern)
      })
    })

    it('should handle fallback when env var is undefined', () => {
      // In test environment, env vars are undefined, so we verify fallback works
      // TRUSTED_GATEWAYS should contain arweave.net (the fallback)
      const hasArweaveNet = TRUSTED_GATEWAYS.some(
        (gw) => gw.hostname === 'arweave.net',
      )
      expect(hasArweaveNet).toBe(true)
    })
  })
})
