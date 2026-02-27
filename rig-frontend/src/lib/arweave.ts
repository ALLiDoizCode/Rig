import {
  Wayfinder,
  LocalStorageGatewaysProvider,
  NetworkGatewaysProvider,
  FastestPingRoutingStrategy,
  HashVerificationStrategy,
} from '@ar.io/wayfinder-core'
import { ARIO } from '@ar.io/sdk/web'
import type { ArweaveManifest, ArNSResolution } from '@/types/arweave'
import type { RigError } from '@/types/common'
import {
  TRUSTED_GATEWAYS,
  GATEWAY_TIMEOUT_MS,
  GATEWAY_COUNT,
  GATEWAY_CACHE_TTL_SECONDS,
} from '@/constants/arweave'

/**
 * Singleton ARIO instance for ArNS name resolution.
 * Read-only client (no signer needed for name lookups).
 */
const ario = ARIO.mainnet()

/**
 * Singleton Wayfinder instance for decentralized gateway access.
 *
 * Configured with:
 * - FastestPingRoutingStrategy: Pings gateways concurrently, selects fastest
 * - LocalStorageGatewaysProvider: Caches gateway list in browser localStorage
 * - NetworkGatewaysProvider: Discovers gateways from ar.io network
 * - HashVerificationStrategy: Verifies SHA-256 hash against trusted gateways
 */
const wayfinder = new Wayfinder({
  routingSettings: {
    strategy: new FastestPingRoutingStrategy({
      timeoutMs: GATEWAY_TIMEOUT_MS,
      maxConcurrency: 5,
      gatewaysProvider: new LocalStorageGatewaysProvider({
        ttlSeconds: GATEWAY_CACHE_TTL_SECONDS,
        gatewaysProvider: new NetworkGatewaysProvider({
          ario,
          limit: GATEWAY_COUNT,
          sortBy: 'operatorStake',
          sortOrder: 'desc',
        }),
      }),
    }),
  },
  verificationSettings: {
    enabled: true,
    strict: false, // Non-blocking: verify async, don't delay response
    strategy: new HashVerificationStrategy({
      trustedGateways: TRUSTED_GATEWAYS,
    }),
  },
})

/**
 * Fetch an Arweave path manifest for a repository.
 *
 * @param txId - Arweave transaction ID of the manifest
 * @returns Parsed ArweaveManifest with file paths and their transaction IDs
 * @throws RigError with code 'GATEWAY_ERROR' on failure
 */
export async function fetchManifest(txId: string): Promise<ArweaveManifest> {
  try {
    const response = await wayfinder.request(`ar://${txId}`)
    if (!response.ok) {
      throw new Error(
        `Gateway returned ${response.status}: ${response.statusText}`,
      )
    }
    const manifest = (await response.json()) as ArweaveManifest
    if (!manifest.manifest || !manifest.paths) {
      throw new Error('Invalid manifest: missing required fields')
    }
    return manifest
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw {
      code: 'GATEWAY_ERROR',
      message: `Failed to fetch manifest: ${message}`,
      userMessage: 'Unable to fetch repository manifest. Please try again.',
      context: { txId },
    } as RigError
  }
}

/**
 * Fetch file content from Arweave via manifest path resolution.
 *
 * @param txId - Arweave transaction ID of the manifest
 * @param path - File path within the manifest (e.g., "src/main.c")
 * @returns File content as string
 * @throws RigError with code 'GATEWAY_ERROR' on failure
 */
export async function fetchFile(txId: string, path: string): Promise<string> {
  try {
    const response = await wayfinder.request(`ar://${txId}/${path}`)
    if (!response.ok) {
      throw new Error(
        `Gateway returned ${response.status}: ${response.statusText}`,
      )
    }
    return await response.text()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw {
      code: 'GATEWAY_ERROR',
      message: `Failed to fetch file: ${message}`,
      userMessage: 'Unable to fetch file content. Please try again.',
      context: { txId, path },
    } as RigError
  }
}

/**
 * Resolve an ArNS name to an Arweave transaction ID.
 *
 * Supports undernames: "docs.ardrive" resolves the "docs" undername.
 *
 * @param name - ArNS name to resolve (e.g., "ardrive", "docs.ardrive")
 * @returns ArNSResolution with transaction ID and metadata
 * @throws RigError with code 'ARNS_RESOLUTION_FAILED' on failure
 */
export async function resolveArNS(name: string): Promise<ArNSResolution> {
  try {
    const result = await ario.resolveArNSName({ name })
    return {
      name: result.name,
      txId: result.txId,
      owner: result.owner,
      type: result.type,
      processId: result.processId,
      ttlSeconds: result.ttlSeconds,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw {
      code: 'ARNS_RESOLUTION_FAILED',
      message: `Failed to resolve ArNS name: ${message}`,
      userMessage: 'Unable to resolve ArNS name. Please try again.',
      context: { name },
    } as RigError
  }
}
