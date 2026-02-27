/**
 * useReadme - TanStack Query hook for fetching README.md from Arweave
 *
 * Fetches README content from the repository's first webUrl using a simple
 * fetch() call (Option A: webUrls are already resolved gateway URLs).
 *
 * README is a nice-to-have feature -- failures are handled gracefully
 * with minimal retries and the rest of the page still displays.
 *
 * Security:
 * - URL protocol validation: Only https:// and http:// schemes are allowed
 *   (webUrls originate from untrusted Nostr relay data)
 * - Response size limit: 1 MB max to prevent memory exhaustion from
 *   malicious or misconfigured endpoints
 *
 * Story 2.4: Repository Detail Page
 */
import { useQuery } from '@tanstack/react-query'

/** Maximum README size in bytes (1 MB). Prevents memory exhaustion from large responses. */
const MAX_README_SIZE = 1024 * 1024

/**
 * Validate that a URL uses an allowed protocol (http or https only).
 * Rejects file://, ftp://, javascript:, data:, and other schemes.
 *
 * @param url - URL string to validate
 * @returns true if the URL uses http:// or https://
 */
function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

/**
 * Hook to fetch README.md content from a repository's Arweave web URL.
 *
 * @param webUrls - Array of web URLs from the Repository model
 * @param enabled - Whether the query should execute (typically true when repo data is loaded)
 * @returns TanStack Query result with README content string or null
 */
export function useReadme(webUrls: string[], enabled: boolean) {
  const rawUrl = webUrls.length > 0 ? webUrls[0] : null
  const baseUrl = rawUrl !== null && isAllowedUrl(rawUrl)
    ? rawUrl.replace(/\/+$/, '')
    : null

  return useQuery<string | null>({
    queryKey: ['readme', baseUrl],
    queryFn: async () => {
      // baseUrl is guaranteed non-null and protocol-validated when enabled is true (guard below)
      const response = await fetch(`${baseUrl}/README.md`)
      if (!response.ok) {
        throw new Error(`README fetch failed: ${response.status}`)
      }

      // Guard against oversized responses to prevent memory exhaustion.
      // Check Content-Length header first (fast path), then enforce limit during read.
      const contentLength = response.headers.get('Content-Length')
      if (contentLength !== null && parseInt(contentLength, 10) > MAX_README_SIZE) {
        throw new Error(`README too large: ${contentLength} bytes exceeds ${MAX_README_SIZE} byte limit`)
      }

      const text = await response.text()
      if (text.length > MAX_README_SIZE) {
        throw new Error(`README too large: ${text.length} bytes exceeds ${MAX_README_SIZE} byte limit`)
      }

      return text
    },
    enabled: enabled && baseUrl !== null,
    retry: 1,
    staleTime: Infinity, // README content from Arweave is immutable
  })
}

/** Exported for testing */
export { isAllowedUrl, MAX_README_SIZE }
