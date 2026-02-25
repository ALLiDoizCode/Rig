/**
 * Comment Event Transformer
 *
 * Transforms NIP-34 kind 1622 events into Comment domain models.
 * Implements NIP-10 threading with root and reply markers.
 */

import type { CommentEvent } from '@/types/nostr'
import type { Comment } from '@/types/issue'
import { getTagValues } from './helpers'

/**
 * Transform comment event to Comment model
 *
 * Implements NIP-10 threading:
 * - 'e' tag with 'root' marker: Root event being commented on
 * - 'e' tag with 'reply' marker: Direct parent comment (optional)
 *
 * @param event - Validated kind 1622 event
 * @returns Comment domain model or null if transformation fails
 */
export function eventToComment(event: CommentEvent): Comment | null {
  // Required: 'e' tag with 'root' marker (NIP-10)
  const rootTag = event.tags.find(t => t[0] === 'e' && t[3] === 'root')

  // Fallback: unmarked 'e' tag for backward compatibility
  const fallbackRootTag = !rootTag ? event.tags.find(t => t[0] === 'e') : null

  const rootId = rootTag?.[1] ?? fallbackRootTag?.[1] ?? null

  if (!rootId) {
    console.warn('Invalid comment event: missing required root "e" tag', event.id)
    return null
  }

  // Optional: 'e' tag with 'reply' marker (NIP-10)
  const replyTag = event.tags.find(t => t[0] === 'e' && t[3] === 'reply')
  const replyToId = replyTag?.[1] ?? null

  // targetEventId is the direct parent (reply) or root if no parent
  const targetEventId = replyToId ?? rootId

  // Extract all mentioned public keys from 'p' tags
  const mentions = getTagValues(event.tags, 'p')

  return {
    id: event.id,
    targetEventId,
    author: event.pubkey,
    content: event.content,
    rootId,
    replyToId,
    mentions,
    createdAt: event.created_at
  }
}
