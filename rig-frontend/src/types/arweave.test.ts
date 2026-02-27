import { describe, it, expect } from 'vitest'
import type { ArweaveManifest, ArNSResolution } from './arweave'

describe('Arweave Types', () => {
  describe('ArweaveManifest', () => {
    it('should have correct interface structure', () => {
      const manifest: ArweaveManifest = {
        manifest: 'arweave/paths',
        version: '0.2.0',
        index: { path: 'index.html' },
        paths: {
          'src/main.c': { id: 'tx-id-1' },
          'README.md': { id: 'tx-id-2' },
        },
      }

      expect(manifest.manifest).toBe('arweave/paths')
      expect(manifest.version).toBe('0.2.0')
      expect(manifest.index?.path).toBe('index.html')
      expect(manifest.paths['src/main.c'].id).toBe('tx-id-1')
    })

    it('should allow optional index field', () => {
      const manifestWithoutIndex: ArweaveManifest = {
        manifest: 'arweave/paths',
        version: '0.2.0',
        paths: {
          'file.txt': { id: 'tx-id' },
        },
      }

      expect(manifestWithoutIndex.index).toBeUndefined()
    })

    it('should support dynamic path keys', () => {
      const manifest: ArweaveManifest = {
        manifest: 'arweave/paths',
        version: '0.2.0',
        paths: {},
      }

      manifest.paths['dynamic/path.js'] = { id: 'dynamic-tx-id' }

      expect(manifest.paths['dynamic/path.js'].id).toBe('dynamic-tx-id')
    })
  })

  describe('ArNSResolution', () => {
    it('should have correct type structure for lease', () => {
      const resolution: ArNSResolution = {
        name: 'ardrive',
        txId: 'kvhEUsIY5bXe0Wu2-YUFz20O078uYFzmQIO-7brv8qw',
        owner: 't4Xr0_J4Iurt7caNST02cMotaz2FIbWQ4Kbj616RHl3',
        type: 'lease',
        processId: 'bh9l1cy0aksiL_x9M359faGzM_yjralacHIUo8_nQXM',
        ttlSeconds: 3600,
      }

      expect(resolution.type).toBe('lease')
      expect(resolution.name).toBe('ardrive')
      expect(resolution.txId).toBeTruthy()
      expect(resolution.processId).toBeTruthy()
      expect(resolution.ttlSeconds).toBeGreaterThan(0)
    })

    it('should have correct type structure for permabuy', () => {
      const resolution: ArNSResolution = {
        name: 'permanent',
        txId: 'permanent-tx-id',
        type: 'permabuy',
        processId: 'process-id',
        ttlSeconds: 0,
      }

      expect(resolution.type).toBe('permabuy')
      expect(resolution.owner).toBeUndefined()
    })

    it('should allow optional owner field', () => {
      const resolutionWithoutOwner: ArNSResolution = {
        name: 'test',
        txId: 'tx-id',
        type: 'lease',
        processId: 'process-id',
        ttlSeconds: 3600,
      }

      expect(resolutionWithoutOwner.owner).toBeUndefined()
    })

    it('should support undernames', () => {
      const undername: ArNSResolution = {
        name: 'docs.ardrive',
        txId: 'undername-tx-id',
        type: 'lease',
        processId: 'process-id',
        ttlSeconds: 3600,
      }

      expect(undername.name).toContain('.')
      expect(undername.name.split('.').length).toBe(2)
    })
  })
})
