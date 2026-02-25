/**
 * Transformer Helper Utilities
 *
 * Shared functions for extracting values from Nostr event tags.
 * NIP-34 tags are arrays of strings: ['tag-name', 'value', ...optional-params]
 */

/**
 * Extract single value from first matching tag
 *
 * @param tags - Event tags array
 * @param name - Tag name to search for
 * @returns Tag value or null if not found
 */
export function getTagValue(tags: string[][], name: string): string | null {
  const tag = tags.find(t => t[0] === name)
  return tag?.[1] ?? null
}

/**
 * Extract all values from matching tags
 *
 * @param tags - Event tags array
 * @param name - Tag name to search for
 * @returns Array of tag values (empty if none found)
 */
export function getTagValues(tags: string[][], name: string): string[] {
  return tags
    .filter(t => t[0] === name && t[1] !== undefined)
    .map(t => t[1])
}

/**
 * Extract 'a' tag value (repository reference)
 *
 * Format: '30617:<pubkey>:<d-tag>'
 *
 * @param tags - Event tags array
 * @returns Repository reference or null if not found
 */
export function getATag(tags: string[][]): string | null {
  return getTagValue(tags, 'a')
}
