/**
 * Arweave data types for the Rig application
 */

/** Arweave path manifest structure (version 0.2.0) */
export interface ArweaveManifest {
  manifest: string
  version: string
  index?: { path: string }
  paths: Record<string, { id: string }>
}

/** Result of ArNS name resolution via @ar.io/sdk */
export type ArNSResolution = {
  name: string
  txId: string
  owner?: string
  type: 'lease' | 'permabuy'
  processId: string
  ttlSeconds: number
}
