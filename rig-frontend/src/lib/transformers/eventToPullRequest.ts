/**
 * Pull Request Event Transformer
 *
 * Transforms NIP-34 kind 1618 events into PullRequest domain models.
 */

import type { PullRequestEvent } from '@/types/nostr'
import type { PullRequest } from '@/types/pull-request'
import { getTagValue, getTagValues, getATag } from './helpers'

/**
 * Transform pull request event to PullRequest model
 *
 * @param event - Validated kind 1618 event
 * @returns PullRequest domain model or null if transformation fails
 */
export function eventToPullRequest(event: PullRequestEvent): PullRequest | null {
  // Required: 'a' tag (repository reference)
  const repositoryId = getATag(event.tags)
  if (!repositoryId) {
    console.warn('Invalid pull request event: missing required "a" tag', event.id)
    return null
  }

  // Required: 'p' tag (repository owner)
  const owner = getTagValue(event.tags, 'p')
  if (!owner) {
    console.warn('Invalid pull request event: missing required "p" tag', event.id)
    return null
  }

  // Optional fields
  const subject = getTagValue(event.tags, 'subject') ?? ''
  const tipCommit = getTagValue(event.tags, 'c')
  const branchName = getTagValue(event.tags, 'branch-name')
  const mergeBase = getTagValue(event.tags, 'merge-base')
  const rootPatchId = getTagValue(event.tags, 'e')
  const cloneUrls = getTagValues(event.tags, 'clone')
  const labels = getTagValues(event.tags, 't')

  return {
    id: event.id,
    repositoryId,
    author: event.pubkey,
    owner,
    subject,
    content: event.content,
    tipCommit,
    cloneUrls,
    branchName,
    mergeBase,
    labels,
    rootPatchId,
    status: 'open', // Default status, status events handled separately
    createdAt: event.created_at
  }
}
