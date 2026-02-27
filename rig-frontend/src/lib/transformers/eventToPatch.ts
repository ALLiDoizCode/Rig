/**
 * Patch Event Transformer
 *
 * Transforms NIP-34 kind 1617 events into Patch domain models.
 */

import type { PatchEvent } from '@/types/nostr'
import type { Patch } from '@/types/patch'
import { getTagValue, getATag } from './helpers'

/**
 * Transform patch event to Patch model
 *
 * Extracts commit metadata and parses committer tag (name, email, timestamp, tz-offset).
 *
 * @param event - Validated kind 1617 event
 * @returns Patch domain model or null if transformation fails
 */
export function eventToPatch(event: PatchEvent): Patch | null {
  // Required: 'a' tag (repository reference)
  const repositoryId = getATag(event.tags)
  if (!repositoryId) {
    console.warn('Invalid patch event: missing required "a" tag', event.id)
    return null
  }

  // Required: 'p' tag (repository owner)
  const owner = getTagValue(event.tags, 'p')
  if (!owner) {
    console.warn('Invalid patch event: missing required "p" tag', event.id)
    return null
  }

  // Required: 'commit' tag
  const commitHash = getTagValue(event.tags, 'commit')
  if (!commitHash) {
    console.warn('Invalid patch event: missing required "commit" tag', event.id)
    return null
  }

  // Required: 'committer' tag with 4 values: name, email, timestamp, tz-offset
  const committerTag = event.tags.find(t => t[0] === 'committer')
  if (!committerTag) {
    console.warn('Invalid patch event: missing required "committer" tag', event.id)
    return null
  }

  // Parse committer tag (with defaults for missing values)
  const committerName = committerTag[1] ?? ''
  const committerEmail = committerTag[2] ?? ''
  const parsedTimestamp = committerTag[3] ? parseInt(committerTag[3], 10) : 0
  const committerTimestamp = Number.isNaN(parsedTimestamp) ? 0 : parsedTimestamp
  const committerTzOffset = committerTag[4] ?? '+0000'

  // Optional: 'parent-commit' tag (null for initial commits)
  const parentCommitHash = getTagValue(event.tags, 'parent-commit')

  // Optional: 'commit-pgp-sig' tag
  const pgpSignature = getTagValue(event.tags, 'commit-pgp-sig')

  // Extract commit message from content (before diff).
  // Handles both plain "message\n\ndiff" format and git format-patch
  // "Subject: [PATCH] message" format.
  const firstLine = event.content.split('\n')[0] ?? ''
  const subjectMatch = firstLine.match(/^Subject:\s*(?:\[PATCH[^\]]*\]\s*)?(.*)/)
  const commitMessage = subjectMatch ? subjectMatch[1] : firstLine

  return {
    id: event.id,
    repositoryId,
    author: event.pubkey,
    owner,
    commitHash,
    parentCommitHash,
    commitMessage,
    diff: event.content,
    committerName,
    committerEmail,
    committerTimestamp,
    committerTzOffset,
    pgpSignature,
    status: 'open', // Default status, status events handled separately
    createdAt: event.created_at
  }
}
