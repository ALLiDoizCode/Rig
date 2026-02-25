/**
 * Issue Event Transformer
 *
 * Transforms NIP-34 kind 1621 events into Issue domain models.
 */

import type { IssueEvent } from '@/types/nostr'
import type { Issue } from '@/types/issue'
import { getTagValue, getTagValues, getATag } from './helpers'

/**
 * Transform issue event to Issue model
 *
 * @param event - Validated kind 1621 event
 * @returns Issue domain model or null if transformation fails
 */
export function eventToIssue(event: IssueEvent): Issue | null {
  // Required: 'a' tag (repository reference)
  const repositoryId = getATag(event.tags)
  if (!repositoryId) {
    console.warn('Invalid issue event: missing required "a" tag', event.id)
    return null
  }

  // Required: 'p' tag (repository owner)
  const owner = getTagValue(event.tags, 'p')
  if (!owner) {
    console.warn('Invalid issue event: missing required "p" tag', event.id)
    return null
  }

  // Optional fields
  const subject = getTagValue(event.tags, 'subject') ?? ''
  const labels = getTagValues(event.tags, 't')

  return {
    id: event.id,
    repositoryId,
    author: event.pubkey,
    owner,
    subject,
    content: event.content,
    labels,
    status: 'open', // Default status, status events handled separately
    createdAt: event.created_at
  }
}
