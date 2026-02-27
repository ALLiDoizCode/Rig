import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ArweaveManifest, ArNSResolution } from '@/types/arweave'

// Mock @ar.io/wayfinder-core
const mockRequest = vi.fn()
const mockWayfinderInstance = { request: mockRequest }
const MockWayfinder = vi.fn(function (this: unknown) {
  return mockWayfinderInstance
})

vi.mock('@ar.io/wayfinder-core', () => ({
  Wayfinder: MockWayfinder,
  LocalStorageGatewaysProvider: vi.fn(),
  NetworkGatewaysProvider: vi.fn(),
  FastestPingRoutingStrategy: vi.fn(),
  HashVerificationStrategy: vi.fn(),
}))

// Mock @ar.io/sdk/web
const mockResolveArNSName = vi.fn()
const mockArioInstance = { resolveArNSName: mockResolveArNSName }
const MockARIO = {
  mainnet: vi.fn(() => mockArioInstance),
}

vi.mock('@ar.io/sdk/web', () => ({
  ARIO: MockARIO,
}))

// Import after mocks
const { fetchManifest, fetchFile, resolveArNS } = await import('./arweave')

describe('Arweave Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchManifest', () => {
    it('should return parsed ArweaveManifest on success', async () => {
      const mockManifest: ArweaveManifest = {
        manifest: 'arweave/paths',
        version: '0.2.0',
        index: { path: 'index.html' },
        paths: {
          'src/main.c': { id: 'tx-id-1' },
          'README.md': { id: 'tx-id-2' },
        },
      }

      mockRequest.mockResolvedValueOnce({
        ok: true,
        json: async () => mockManifest,
      })

      const result = await fetchManifest('test-tx-id')

      expect(result).toEqual(mockManifest)
      expect(mockRequest).toHaveBeenCalledWith('ar://test-tx-id')
      expect(mockRequest).toHaveBeenCalledTimes(1)
    })

    it('should throw RigError with code GATEWAY_ERROR on HTTP error', async () => {
      mockRequest.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(fetchManifest('test-tx-id')).rejects.toMatchObject({
        code: 'GATEWAY_ERROR',
        message: expect.stringContaining('Failed to fetch manifest'),
        userMessage: 'Unable to fetch repository manifest. Please try again.',
        context: { txId: 'test-tx-id' },
      })
    })

    it('should throw RigError when manifest is missing required fields', async () => {
      mockRequest.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ version: '0.2.0' }), // Missing manifest and paths
      })

      await expect(fetchManifest('test-tx-id')).rejects.toMatchObject({
        code: 'GATEWAY_ERROR',
        message: expect.stringContaining('Invalid manifest'),
        userMessage: 'Unable to fetch repository manifest. Please try again.',
      })
    })

    it('should throw RigError on network failure', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Network error'))

      await expect(fetchManifest('test-tx-id')).rejects.toMatchObject({
        code: 'GATEWAY_ERROR',
        message: expect.stringContaining('Network error'),
        userMessage: 'Unable to fetch repository manifest. Please try again.',
        context: { txId: 'test-tx-id' },
      })
    })
  })

  describe('fetchFile', () => {
    it('should return file content string on success', async () => {
      const mockContent = '// This is file content\nconsole.log("hello")'

      mockRequest.mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      })

      const result = await fetchFile('test-tx-id', 'src/main.c')

      expect(result).toBe(mockContent)
      expect(mockRequest).toHaveBeenCalledWith('ar://test-tx-id/src/main.c')
      expect(mockRequest).toHaveBeenCalledTimes(1)
    })

    it('should throw RigError with code GATEWAY_ERROR on HTTP error', async () => {
      mockRequest.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(
        fetchFile('test-tx-id', 'src/missing.c'),
      ).rejects.toMatchObject({
        code: 'GATEWAY_ERROR',
        message: expect.stringContaining('Failed to fetch file'),
        userMessage: 'Unable to fetch file content. Please try again.',
        context: { txId: 'test-tx-id', path: 'src/missing.c' },
      })
    })

    it('should throw RigError on network failure', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Connection timeout'))

      await expect(fetchFile('test-tx-id', 'src/main.c')).rejects.toMatchObject(
        {
          code: 'GATEWAY_ERROR',
          message: expect.stringContaining('Connection timeout'),
          userMessage: 'Unable to fetch file content. Please try again.',
          context: { txId: 'test-tx-id', path: 'src/main.c' },
        },
      )
    })
  })

  describe('resolveArNS', () => {
    it('should return ArNSResolution on success', async () => {
      const mockResolution = {
        name: 'ardrive',
        txId: 'kvhEUsIY5bXe0Wu2-YUFz20O078uYFzmQIO-7brv8qw',
        owner: 't4Xr0_J4Iurt7caNST02cMotaz2FIbWQ4Kbj616RHl3',
        type: 'lease' as const,
        processId: 'bh9l1cy0aksiL_x9M359faGzM_yjralacHIUo8_nQXM',
        ttlSeconds: 3600,
      }

      mockResolveArNSName.mockResolvedValueOnce(mockResolution)

      const result = await resolveArNS('ardrive')

      expect(result).toEqual<ArNSResolution>(mockResolution)
      expect(mockResolveArNSName).toHaveBeenCalledWith({ name: 'ardrive' })
      expect(mockResolveArNSName).toHaveBeenCalledTimes(1)
    })

    it('should throw RigError with code ARNS_RESOLUTION_FAILED on failure', async () => {
      mockResolveArNSName.mockRejectedValueOnce(
        new Error('ArNS name not found'),
      )

      await expect(resolveArNS('nonexistent')).rejects.toMatchObject({
        code: 'ARNS_RESOLUTION_FAILED',
        message: expect.stringContaining('ArNS name not found'),
        userMessage: 'Unable to resolve ArNS name. Please try again.',
        context: { name: 'nonexistent' },
      })
    })

    it('should support undernames', async () => {
      const mockResolution = {
        name: 'docs.ardrive',
        txId: 'undername-tx-id',
        type: 'lease' as const,
        processId: 'process-id',
        ttlSeconds: 3600,
      }

      mockResolveArNSName.mockResolvedValueOnce(mockResolution)

      const result = await resolveArNS('docs.ardrive')

      expect(result.name).toBe('docs.ardrive')
      expect(mockResolveArNSName).toHaveBeenCalledWith({
        name: 'docs.ardrive',
      })
    })
  })

  describe('Wayfinder Configuration', () => {
    it('should use correct timeout constant (3000ms per NFR-P9)', async () => {
      const { GATEWAY_TIMEOUT_MS } = await import('@/constants/arweave')
      expect(GATEWAY_TIMEOUT_MS).toBe(3000)
    })

    it('should use correct gateway count for network discovery', async () => {
      const { GATEWAY_COUNT } = await import('@/constants/arweave')
      expect(GATEWAY_COUNT).toBe(10) // Discovers 10 gateways for routing
    })

    it('should use correct cache TTL for localStorage', async () => {
      const { GATEWAY_CACHE_TTL_SECONDS } = await import('@/constants/arweave')
      expect(GATEWAY_CACHE_TTL_SECONDS).toBe(3600) // 1 hour
    })

    it('should have at least 2 trusted gateways for hash verification', async () => {
      const { TRUSTED_GATEWAYS } = await import('@/constants/arweave')

      expect(TRUSTED_GATEWAYS).toBeDefined()
      expect(Array.isArray(TRUSTED_GATEWAYS)).toBe(true)
      expect(TRUSTED_GATEWAYS.length).toBeGreaterThanOrEqual(2)

      // Verify they are HTTPS URL objects
      TRUSTED_GATEWAYS.forEach((gw: URL) => {
        expect(gw).toBeInstanceOf(URL)
        expect(gw.protocol).toBe('https:')
      })
    })
  })

  describe('Gateway Failover Behavior', () => {
    it('should handle all gateways failing with proper error', async () => {
      mockRequest.mockReset()
      // Wayfinder SDK tries multiple gateways internally and ultimately fails
      mockRequest.mockRejectedValueOnce(new Error('All gateways failed'))

      await expect(fetchManifest('test-tx-id')).rejects.toMatchObject({
        code: 'GATEWAY_ERROR',
        message: expect.stringContaining('All gateways failed'),
        userMessage: 'Unable to fetch repository manifest. Please try again.',
      })
    })

    it('should succeed when Wayfinder finds a working gateway', async () => {
      mockRequest.mockReset()

      const mockManifest: ArweaveManifest = {
        manifest: 'arweave/paths',
        version: '0.2.0',
        paths: { 'file.txt': { id: 'tx-id' } },
      }

      // Wayfinder SDK handles failover internally and returns successful response
      mockRequest.mockResolvedValueOnce({
        ok: true,
        json: async () => mockManifest,
      })

      const result = await fetchManifest('test-tx-id')

      expect(result).toEqual(mockManifest)
      expect(mockRequest).toHaveBeenCalledWith('ar://test-tx-id')
    })
  })

  describe('Timeout Handling', () => {
    it('should handle gateway timeout errors gracefully', async () => {
      mockRequest.mockReset()
      mockRequest.mockRejectedValueOnce(new Error('Request timeout after 3000ms'))

      await expect(fetchManifest('test-tx-id')).rejects.toMatchObject({
        code: 'GATEWAY_ERROR',
        message: expect.stringContaining('timeout'),
        userMessage: 'Unable to fetch repository manifest. Please try again.',
      })
    })

    it('should handle slow gateway responses with timeout', async () => {
      mockRequest.mockReset()
      mockRequest.mockRejectedValueOnce(
        new Error('Gateway response exceeded timeout'),
      )

      await expect(fetchFile('test-tx-id', 'file.txt')).rejects.toMatchObject({
        code: 'GATEWAY_ERROR',
        message: expect.stringContaining('timeout'),
      })
    })
  })

  describe('Module Exports', () => {
    it('should export all 3 required functions', () => {
      expect(typeof fetchManifest).toBe('function')
      expect(typeof fetchFile).toBe('function')
      expect(typeof resolveArNS).toBe('function')
    })

    it('should export exactly 3 functions and no singleton instances', async () => {
      // Import the module dynamically to check exports
      const arweaveModule = await import('./arweave')
      const exportedNames = Object.keys(arweaveModule)

      // Verify the 3 required exports exist
      expect(exportedNames).toContain('fetchManifest')
      expect(exportedNames).toContain('fetchFile')
      expect(exportedNames).toContain('resolveArNS')

      // Verify singleton instances are NOT exported
      expect(exportedNames).not.toContain('wayfinder')
      expect(exportedNames).not.toContain('ario')

      // Should only export the 3 functions (not wayfinder, ario, or other internals)
      expect(exportedNames.length).toBe(3)
    })
  })
})
