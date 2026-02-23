# NIP-34 Event Reference Guide

Quick reference for NIP-34 git-related Nostr events.

## Event Kinds Summary

| Kind | Name | Purpose | Cost | Who Can Publish |
|------|------|---------|------|-----------------|
| 30617 | Repository | Announce/describe repository | 1000 sats | Owner |
| 30618 | State | Track branches/tags | 5 sats | Owner |
| 1617 | Patch | Submit code change <60KB | 10 sats | Any contributor |
| 1618 | Pull Request | Propose changes (large) | 25 sats | Any contributor |
| 1619 | PR Update | Update existing PR | 5 sats | PR author |
| 1621 | Issue | Report bug/request feature | 10 sats | Anyone |
| 1622 | Comment | Discuss issue/PR/patch | 1 sat | Anyone |
| 1630 | Status: Open | Mark as open | 5 sats | Maintainer/Author |
| 1631 | Status: Merged | Mark as merged/resolved | 5 sats | Maintainer/Author |
| 1632 | Status: Closed | Mark as closed | 5 sats | Maintainer/Author |
| 1633 | Status: Draft | Mark as draft/WIP | 5 sats | Maintainer/Author |

---

## 30617: Repository Announcement

**Purpose:** Announce a repository's existence and metadata.

**Replaceability:** Replaceable (can update metadata)

**Structure:**
```json
{
  "kind": 30617,
  "tags": [
    ["d", "repo-identifier"],              // REQUIRED: Unique identifier (kebab-case)
    ["name", "Human Readable Name"],       // REQUIRED: Display name
    ["description", "Short description"],  // REQUIRED: Brief summary
    ["web", "https://viewer.com/repo"],   // OPTIONAL: Web viewer URL
    ["clone", "git@github.com:user/repo"], // OPTIONAL: Clone URL
    ["relays", "wss://relay1.com", "wss://relay2.com"], // OPTIONAL: Preferred relays
    ["r", "<earliest-unique-commit>", "euc"], // OPTIONAL: Fork tracking
    ["maintainers", "<pubkey1>", "<pubkey2>"], // OPTIONAL: Other maintainers
    ["t", "javascript"],                   // OPTIONAL: Topic tags
    ["t", "open-source"],
    ["t", "personal-fork"]                 // OPTIONAL: Mark as personal fork
  ],
  "content": "Extended README or documentation (markdown)",
  "created_at": 1234567890,
  "pubkey": "<owner-pubkey>",
  "id": "<event-id>",
  "sig": "<signature>"
}
```

**Discovery Query:**
```javascript
// Find all repositories
const repos = await pool.list(relays, [{
  kinds: [30617],
  limit: 100
}])

// Find by topic
const jsRepos = await pool.list(relays, [{
  kinds: [30617],
  "#t": ["javascript"]
}])

// Find user's repos
const userRepos = await pool.list(relays, [{
  kinds: [30617],
  authors: ["<user-pubkey>"]
}])
```

---

## 30618: Repository State

**Purpose:** Track current branch heads and tags.

**Replaceability:** Replaceable (updates as repo changes)

**Structure:**
```json
{
  "kind": 30618,
  "tags": [
    ["d", "repo-identifier"],              // MUST match corresponding 30617
    ["refs/heads/main", "<commit-hash>"],  // Branch pointer
    ["refs/heads/develop", "<commit-hash>"],
    ["refs/tags/v1.0", "<commit-hash>"],   // Tag pointer
    ["HEAD", "refs/heads/main"]            // Current branch
  ],
  "content": "",
  "created_at": 1234567890,
  "pubkey": "<owner-pubkey>",
  "id": "<event-id>",
  "sig": "<signature>"
}
```

**Note:** Owner can stop tracking state by publishing event with no refs tags.

---

## 1617: Patch

**Purpose:** Submit code changes <60KB inline.

**Structure:**
```json
{
  "kind": 1617,
  "tags": [
    ["a", "30617:<owner-pubkey>:<repo-d-tag>"], // REQUIRED: Target repo
    ["r", "<repo-euc>"],                        // REQUIRED: Earliest unique commit
    ["p", "<owner-pubkey>"],                    // REQUIRED: Notify owner
    ["commit", "<new-commit-hash>"],            // OPTIONAL: Commit ID
    ["parent-commit", "<parent-hash>"],         // OPTIONAL: Parent commit
    ["commit-pgp-sig", "<pgp-signature>"],      // OPTIONAL: GPG signature
    ["committer", "<name>", "<email>", "<timestamp>", "<timezone>"], // OPTIONAL
    ["t", "root"]                               // OPTIONAL: First in series
  ],
  "content": "From abc123...def456\n\ndiff --git a/file.js b/file.js\n...",
  "created_at": 1234567890,
  "pubkey": "<contributor-pubkey>",
  "id": "<event-id>",
  "sig": "<signature>"
}
```

**Query Pattern:**
```javascript
// Get all patches for a repo
const patches = await pool.list(relays, [{
  kinds: [1617],
  "#a": ["30617:<owner>:<repo>"]
}])
```

---

## 1618: Pull Request

**Purpose:** Propose changes (larger than 60KB or multi-commit).

**Structure:**
```json
{
  "kind": 1618,
  "tags": [
    ["a", "30617:<owner-pubkey>:<repo-d-tag>"], // REQUIRED: Target repo
    ["subject", "Title of PR"],                 // REQUIRED: PR title
    ["c", "<tip-commit-hash>"],                 // REQUIRED: PR branch tip
    ["clone", "git@example.com:user/fork"],     // REQUIRED: Where to fetch code
    ["branch-name", "feature/awesome"],         // OPTIONAL: Suggested branch name
    ["merge-base", "<base-commit-hash>"],       // OPTIONAL: Common ancestor
    ["t", "enhancement"],                       // OPTIONAL: Labels
    ["t", "needs-review"],
    ["e", "<root-patch-event-id>"]              // OPTIONAL: If revising patch
  ],
  "content": "## Description\n\nThis PR adds...\n\n## Changes\n...",
  "created_at": 1234567890,
  "pubkey": "<contributor-pubkey>",
  "id": "<event-id>",
  "sig": "<signature>"
}
```

**Note:** Push to `refs/nostr/<pr-event-id>` before signing.

**Query Pattern:**
```javascript
// Get PRs for repo
const prs = await pool.list(relays, [{
  kinds: [1618],
  "#a": ["30617:<owner>:<repo>"]
}])
```

---

## 1619: PR Update

**Purpose:** Update PR tip without creating new PR.

**Structure:**
```json
{
  "kind": 1619,
  "tags": [
    ["E", "<original-pr-event-id>"],            // REQUIRED: Original PR (NIP-22)
    ["P", "<original-pr-author-pubkey>"],       // REQUIRED: (NIP-22)
    ["c", "<new-tip-commit>"],                  // REQUIRED: Updated tip
    ["clone", "git@example.com:user/fork"],     // REQUIRED: Updated clone URL
    ["merge-base", "<base-commit>"]             // OPTIONAL
  ],
  "content": "Updated to address review comments",
  "created_at": 1234567890,
  "pubkey": "<pr-author-pubkey>",
  "id": "<event-id>",
  "sig": "<signature>"
}
```

---

## 1621: Issue

**Purpose:** Report bugs, request features, start discussions.

**Structure:**
```json
{
  "kind": 1621,
  "tags": [
    ["a", "30617:<owner-pubkey>:<repo-d-tag>"], // REQUIRED: Target repo
    ["p", "<owner-pubkey>"],                    // REQUIRED: Notify owner
    ["subject", "Bug: App crashes on startup"], // REQUIRED: Issue title
    ["t", "bug"],                               // OPTIONAL: Labels
    ["t", "priority:high"]
  ],
  "content": "## Steps to reproduce\n1. Open app\n2. ...",
  "created_at": 1234567890,
  "pubkey": "<reporter-pubkey>",
  "id": "<event-id>",
  "sig": "<signature>"
}
```

**Query Pattern:**
```javascript
// Get issues for repo
const issues = await pool.list(relays, [{
  kinds: [1621],
  "#a": ["30617:<owner>:<repo>"]
}])

// Filter by label
const bugs = await pool.list(relays, [{
  kinds: [1621],
  "#a": ["30617:<owner>:<repo>"],
  "#t": ["bug"]
}])
```

---

## 1622: Comment

**Purpose:** Comment on patches, PRs, issues.

**Structure:**
```json
{
  "kind": 1622,
  "tags": [
    ["e", "<target-event-id>", "", "root"],     // REQUIRED: What you're commenting on (NIP-10)
    ["p", "<target-author-pubkey>"],            // REQUIRED: Notify author
    ["p", "<mentioned-user-pubkey>"]            // OPTIONAL: Additional mentions
  ],
  "content": "I can confirm this bug. Here's what I found...",
  "created_at": 1234567890,
  "pubkey": "<commenter-pubkey>",
  "id": "<event-id>",
  "sig": "<signature>"
}
```

**Threading (NIP-10):**
- Use `["e", "<root-id>", "", "root"]` to reference thread root
- Use `["e", "<reply-to-id>", "", "reply"]` to reply to specific comment
- Clients should reconstruct thread tree

**Query Pattern:**
```javascript
// Get comments for an issue
const comments = await pool.list(relays, [{
  kinds: [1622],
  "#e": ["<issue-event-id>"]
}])
```

---

## 1630-1633: Status Events

**Purpose:** Change lifecycle status of issues/patches/PRs.

**Kinds:**
- **1630:** Open
- **1631:** Applied/Merged/Resolved
- **1632:** Closed (without applying)
- **1633:** Draft/WIP

**Structure:**
```json
{
  "kind": 1631,  // Merged
  "tags": [
    ["e", "<pr-or-patch-event-id>", "", "root"], // REQUIRED: Target event
    ["p", "<pr-author-pubkey>"],                 // REQUIRED: Notify author
    ["merge-commit", "<commit-hash>"],           // OPTIONAL: Merge commit
    ["applied-as-commits", "<hash1>", "<hash2>"] // OPTIONAL: For patches
  ],
  "content": "Merged! Thanks for the contribution.",
  "created_at": 1234567890,
  "pubkey": "<maintainer-pubkey>",
  "id": "<event-id>",
  "sig": "<signature>"
}
```

**Authorization:**
- Repository owner/maintainers can change status
- OR original author (close their own PR/issue)

**Most Recent Wins:**
- Query all status events for a target
- Sort by `created_at` descending
- First result = current status

**Query Pattern:**
```javascript
// Get status for PR
const statuses = await pool.list(relays, [{
  kinds: [1630, 1631, 1632, 1633],
  "#e": ["<pr-event-id>"]
}])

// Sort by timestamp descending, take most recent
const currentStatus = statuses.sort((a, b) => b.created_at - a.created_at)[0]
```

---

## Common Query Patterns

### Get Repository with All Activity
```javascript
// Step 1: Get repository
const repo = await pool.get(relays, {
  kinds: [30617],
  authors: ["<owner-pubkey>"],
  "#d": ["<repo-name>"]
})

// Step 2: Get all related events
const activity = await pool.list(relays, [{
  kinds: [1617, 1618, 1621], // Patches, PRs, issues
  "#a": [`30617:${repo.pubkey}:${repo.tags.find(t => t[0] === 'd')[1]}`]
}])
```

### Real-time Subscription
```javascript
// Subscribe to new events for a repo
const sub = pool.sub(relays, [{
  kinds: [1617, 1618, 1621, 1622],
  "#a": ["30617:<owner>:<repo>"],
  since: Math.floor(Date.now() / 1000) // Only new events
}])

sub.on('event', event => {
  console.log('New event:', event)
  // Update UI
})
```

### Get Issue with Comments
```javascript
// Get issue
const issue = await pool.get(relays, {
  ids: ["<issue-event-id>"]
})

// Get all comments
const comments = await pool.list(relays, [{
  kinds: [1622],
  "#e": [issue.id]
}])

// Get current status
const status = await pool.list(relays, [{
  kinds: [1630, 1631, 1632, 1633],
  "#e": [issue.id]
}])
```

---

## Cost Schedule (Reference)

| Operation | Kind | Cost (sats) |
|-----------|------|-------------|
| Create Repository | 30617 | 1000 |
| Update State | 30618 | 5 |
| Submit Patch | 1617 | 10 |
| Create PR | 1618 | 25 |
| Update PR | 1619 | 5 |
| Create Issue | 1621 | 10 |
| Comment | 1622 | 1 |
| Change Status | 1630-1633 | 5 |

**Note:** Costs enforced by Crosstown/Connector before publishing events.

---

## Authentication

All events MUST be signed with user's Nostr key:
1. Generate event (without `id` and `sig`)
2. Compute `id` = SHA256 of serialized event
3. Sign `id` with private key (Schnorr signature)
4. Add `sig` field to event

Users typically use browser extensions (nos2x, Alby) for signing.

---

## References

- **NIP-01:** Basic protocol - https://github.com/nostr-protocol/nips/blob/master/01.md
- **NIP-34:** Git stuff - https://github.com/nostr-protocol/nips/blob/master/34.md
- **NIP-10:** Reply threading - https://github.com/nostr-protocol/nips/blob/master/10.md
- **NIP-22:** Comments - https://github.com/nostr-protocol/nips/blob/master/22.md
- **nostr-tools:** https://github.com/nbd-wtf/nostr-tools
