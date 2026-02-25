/**
 * Repository Event Transformer
 *
 * Transforms NIP-34 kind 30617 events into Repository domain models.
 */

import type { RepoAnnouncementEvent } from '@/types/nostr'
import type { Repository } from '@/types/repository'
import { getTagValue, getTagValues } from './helpers'

/**
 * Transform repository announcement event to Repository model
 *
 * @param event - Validated kind 30617 event
 * @returns Repository domain model or null if transformation fails
 */
export function eventToRepository(event: RepoAnnouncementEvent): Repository | null {
  // Required: 'd' tag (repository identifier)
  const id = getTagValue(event.tags, 'd')
  if (!id) {
    console.warn('Invalid repository event: missing required "d" tag', event.id)
    return null
  }

  // Extract all tags
  const nameTag = getTagValue(event.tags, 'name')
  const name = nameTag ?? id // Fallback to 'd' tag value
  const description = getTagValue(event.tags, 'description') ?? ''

  // Multi-value tags
  const webUrls = getTagValues(event.tags, 'web')
  const cloneUrls = getTagValues(event.tags, 'clone')
  const topicTags = getTagValues(event.tags, 't')

  // Array-based tags (maintainers, relays - stored as multiple values in single tag)
  const maintainersTag = event.tags.find(t => t[0] === 'maintainers')
  const maintainers = maintainersTag ? maintainersTag.slice(1) : []

  const relaysTag = event.tags.find(t => t[0] === 'relays')
  const relays = relaysTag ? relaysTag.slice(1) : []

  // Detect personal fork
  const isPersonalFork = topicTags.includes('personal-fork')
  const topics = topicTags.filter(t => t !== 'personal-fork')

  // Extract earliest unique commit from 'r' tag with 'euc' marker
  const eucTag = event.tags.find(t => t[0] === 'r' && t[2] === 'euc')
  const earliestUniqueCommit = eucTag?.[1] ?? null

  return {
    id,
    name,
    description,
    owner: event.pubkey,
    maintainers,
    webUrls,
    cloneUrls,
    relays,
    topics,
    isPersonalFork,
    earliestUniqueCommit,
    eventId: event.id,
    createdAt: event.created_at
  }
}
