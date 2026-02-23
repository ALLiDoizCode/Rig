# Product Requirements Document: Decentralized Forgejo with NIP-34, ILP, and Arweave

**Version:** 1.0
**Date:** 2026-02-23
**Status:** Draft
**Owner:** Jonathan Green
**Contributors:** Claude (AI Assistant)

---

## Executive Summary

This document outlines the requirements for building a decentralized, censorship-resistant code collaboration platform using Nostr protocol (NIP-34) with ILP-gated event publishing for spam prevention.

**Key Innovation:** A pure P2P architecture where:
- **Nostr events (NIP-34)** provide all git operations and collaboration
- **ILP micropayments** gate event publishing to prevent spam
- **Crosstown + Connector** handle payment verification and relay publishing
- **nostr-tools** provides read-only client interface
- **No centralized backend** for reading/discovery

This creates a truly decentralized alternative to GitHub/GitLab where:
- Repositories are NIP-34 event streams
- Anyone can read without accounts (P2P via relays)
- Writers pay micropayments to publish events
- No single entity can censor or shut down the service

**Forgejo** serves as the feature reference to ensure we match traditional git hosting capabilities.

---

## Problem Statement

### Current State
Traditional git hosting platforms (GitHub, GitLab, Forgejo) suffer from:
1. **Centralization risk**: Single point of failure, can be censored or shut down
2. **Platform lock-in**: Code and collaboration history tied to one service
3. **Spam/abuse**: Free services plagued by spam, requiring aggressive moderation
4. **Data ownership**: Platform owns your repository metadata and collaboration history
5. **Permanence**: No guarantee repositories will exist long-term

### Market Opportunity
- Open-source developers need censorship-resistant hosting
- Decentralized web (Web3) movement seeks alternatives to centralized services
- Archival institutions need permanent code preservation
- Developers want true data ownership and portability

---

## Goals & Objectives

### Primary Goals
1. **Decentralization**: No single point of failure or control
2. **Permanence**: Code stored forever on Arweave
3. **Censorship Resistance**: No entity can delete or block repositories
4. **Spam Prevention**: Economic incentives prevent abuse without moderation
5. **Interoperability**: Standards-based (NIP-34) for ecosystem compatibility

### Success Metrics
- **Launch Metrics** (3 months)
  - 100+ repositories migrated
  - 500+ active users with Nostr keys
  - 10,000+ NIP-34 events published
  - 95%+ ILP payment success rate

- **Growth Metrics** (12 months)
  - 5,000+ repositories
  - 10,000+ active developers
  - 1M+ NIP-34 events
  - 99.9% Arweave data availability

- **Quality Metrics**
  - <2% spam rate (vs 30%+ on free platforms)
  - <5 second average event propagation time
  - <$0.10 average cost per repository operation

### Non-Goals (Out of Scope)
- Full Forgejo feature parity in v1.0
- Web2 hosting features (GitHub Pages, CI/CD runners initially)
- Replacing traditional git for private corporate use
- Competing on feature richness (focus on decentralization benefits)

---

## User Personas

### 1. **Alex - Open Source Maintainer**
**Background:** Maintains popular OSS projects, concerned about censorship
**Goals:**
- Permanent archive of project history
- Censorship-resistant hosting
- Community contributions without platform lock-in
**Pain Points:**
- Worried GitHub could ban account/projects
- Wants guaranteed long-term availability
- Doesn't want to deal with spam PRs/issues
**Technical Skill:** High

### 2. **Jordan - Contributor**
**Background:** Contributes to various open-source projects
**Goals:**
- Access repositories regardless of geographic restrictions
- Own their contribution identity (Nostr key)
- Low friction for submitting patches/PRs
**Pain Points:**
- GitHub blocked in their country sometimes
- Multiple accounts across platforms
- Spam clutters issue trackers
**Technical Skill:** Medium-High

### 3. **Sam - Archivist/Researcher**
**Background:** Works at institution preserving software history
**Goals:**
- Permanent, tamper-proof code archives
- Verifiable authorship and provenance
- Long-term accessibility (decades)
**Pain Points:**
- Platforms disappear (Google Code, Sourceforge decline)
- Link rot and data loss
- Lack of cryptographic verification
**Technical Skill:** Medium

### 4. **Casey - Web3 Developer**
**Background:** Builds decentralized applications
**Goals:**
- Align hosting with decentralized ethos
- Integrate with Nostr/crypto ecosystem
- Own their data and identity
**Pain Points:**
- Centralized platforms contradict Web3 values
- Wants to use existing Nostr identity
- Willing to pay small amounts for quality
**Technical Skill:** High

---

## Feature Requirements

### Phase 1: Core Infrastructure (MVP)

#### F1.1: Frontend Read Client (nostr-tools)
**Priority:** P0 (Critical)
**Status:** 🔴 Not Started

**User Story:** As a user, I want to browse repositories using a static web app that queries Nostr relays directly.

**Requirements:**
- Static HTML/JS app using nostr-tools
- Connect to 3-5 public Nostr relays via WebSocket
- Query for NIP-34 events (kinds 30617, 1617, 1618, 1621, etc.)
- Display repositories, issues, patches, PRs
- No authentication needed for reading
- Real-time updates via subscriptions
- Cache events in IndexedDB

**Technology:**
- nostr-tools `SimplePool` for multi-relay connections
- NIP-01 `Filter` objects for queries
- Event signature verification (built into nostr-tools)

**Acceptance Criteria:**
- Connect to relays in <2 seconds
- Query repositories and display results in <3 seconds
- Works in all modern browsers
- No backend API calls (pure P2P)
- Graceful handling of relay failures (try multiple relays)
- Client-side filtering and sorting

**Reference Implementation:**
```javascript
import { SimplePool } from 'nostr-tools'

const pool = new SimplePool()
const relays = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol'
]

// Query for repositories
const events = await pool.list(relays, [{
  kinds: [30617],
  limit: 100
}])

// Display repos
events.forEach(event => {
  const name = event.tags.find(t => t[0] === 'name')?.[1]
  const description = event.tags.find(t => t[0] === 'description')?.[1]
  displayRepo({ name, description, event })
})
```

#### F1.2: Repository Announcement (NIP-34 Kind 30617)
**Priority:** P0 (Critical)
**Status:** 🔴 Not Started

**User Story:** As a maintainer, I want to announce my repository on Nostr so it's discoverable and censorship-resistant.

**Requirements:**
- Frontend form to create repository metadata
- Generate NIP-34 kind 30617 event:
  ```json
  {
    "kind": 30617,
    "tags": [
      ["d", "repo-name"],              // Unique identifier
      ["name", "My Repository"],       // Human-readable name
      ["description", "About this..."], // Description
      ["web", "https://..."],          // Web viewer URL (optional)
      ["relays", "wss://relay1...", "wss://relay2..."], // Preferred relays
      ["t", "javascript", "git"],      // Topic tags for discovery
      ["r", "<earliest-unique-commit>", "euc"]  // Future: fork detection
    ],
    "content": "Extended README or documentation",
    "created_at": <timestamp>,
    "pubkey": "<maintainer-pubkey>",
    "id": "<computed-event-id>",
    "sig": "<signature>"
  }
  ```
- User signs event with browser extension (nos2x/Alby)
- User pays 1000 sats via Web Monetization API
- Submit {event, payment_receipt} to Crosstown/Connector
- Connector verifies payment and publishes to relays
- Repository discoverable immediately via nostr-tools queries

**Acceptance Criteria:**
- Repository creation form validates all required fields
- Event structure matches NIP-34 spec exactly
- Payment prompt clear and user-friendly
- Event published to ≥3 relays within 10 seconds
- Repository appears in discovery queries immediately
- Event is replaceable (user can update metadata)

**Out of Scope (Deferred):**
- Git object storage (commits, blobs, trees)
- Arweave uploads
- Clone functionality
- Focus on metadata announcements only

#### F1.3: Crosstown/Connector Integration
**Priority:** P0 (Critical)
**Status:** 🔴 Not Started (You're handling this)

**User Story:** As the system, Crosstown/Connector verifies ILP payments before publishing events to relays.

**Requirements (Interface Contract):**
- **Endpoint:** POST /publish-event
- **Request:**
  ```json
  {
    "event": {
      "kind": 30617,
      "tags": [...],
      "content": "...",
      "pubkey": "...",
      "created_at": 123456,
      "id": "...",
      "sig": "..."
    },
    "payment_receipt": {
      "receipt_id": "...",
      "amount": 1000,
      "currency": "sats",
      "timestamp": 123456,
      "signature": "..."
    }
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "published_to": ["wss://relay1...", "wss://relay2..."],
    "event_id": "..."
  }
  ```
- **Response (Failure):**
  ```json
  {
    "success": false,
    "error": "insufficient_payment" | "invalid_signature" | "rate_limited",
    "message": "Payment of 1000 sats required, got 100 sats"
  }
  ```

**Cost Schedule (Reference):**
```
Repository Creation (30617):   1000 sats
Patch (1617):                  10 sats
Pull Request (1618):           25 sats
Issue (1621):                  10 sats
Comment (1622):                1 sat
Status Change (1630-1633):     5 sats
```

**Acceptance Criteria:**
- Crosstown/Connector API endpoint available
- Frontend can submit events + payment receipts
- Payment verification completes in <2 seconds
- Clear error messages on payment failure
- Events published to ≥3 configured relays
- Rate limiting prevents spam even with payments

**Note:** Implementation details are out of scope for this PRD. Crosstown/Connector is a separate service you're building.

#### F1.4: Storage Strategy (Out of Scope / Deferred)
**Priority:** P2 (Deferred - You'll handle later)
**Status:** 🔴 Not Started

**Note:** Git object storage and Arweave integration are explicitly out of scope for initial implementation.

**Future Considerations:**
- How to store actual code/files (not just metadata)
- Arweave for permanent storage
- IPFS as alternative
- Or hybrid approach

**For MVP, focus on:**
- NIP-34 event structures (metadata only)
- Repository announcements
- Issues and PRs as text events
- Comments and discussions
- Actual git operations deferred

#### F1.5: Patches and Pull Requests (NIP-34 Events)
**Priority:** P0 (Critical)
**Status:** 🔴 Not Started

**User Story:** As a contributor, I want to submit patches and PRs as Nostr events.

**Requirements:**

**F1.5a: Patches (Kind 1617) - Small changes <60KB**

Event Structure:
```json
{
  "kind": 1617,
  "tags": [
    ["a", "30617:<owner-pubkey>:<repo-d-tag>"],  // References repo
    ["r", "<repo-euc>"],                         // Earliest unique commit
    ["p", "<repo-owner-pubkey>"],                // Notify owner
    ["commit", "<commit-hash>"],                 // New commit ID
    ["parent-commit", "<parent-hash>"],          // Parent commit
    ["t", "root"]                                // Optional: mark as root of series
  ],
  "content": "From abc123...def456\n\ndiff --git a/file.js b/file.js\n...",
  "created_at": <timestamp>,
  "pubkey": "<contributor-pubkey>",
  "sig": "<signature>"
}
```

Workflow:
1. Contributor generates patch: `git format-patch HEAD~1`
2. Frontend creates kind 1617 event with patch in content
3. User signs event
4. User pays 10 sats
5. Submit to Crosstown/Connector
6. Appears in maintainer's patch list (query via `#a` tag)

**F1.5b: Pull Requests (Kind 1618) - Larger changes**

Event Structure:
```json
{
  "kind": 1618,
  "tags": [
    ["a", "30617:<owner>:<repo>"],
    ["subject", "Add new feature"],
    ["c", "<tip-commit-hash>"],                  // PR tip
    ["branch-name", "feature/awesome"],
    ["merge-base", "<base-commit>"],
    ["t", "enhancement"],                        // Label
    ["p", "<maintainer-pubkey>"]
  ],
  "content": "## Description\n\nThis PR adds...",  // Markdown
  "created_at": <timestamp>,
  "pubkey": "<contributor-pubkey>",
  "sig": "<signature>"
}
```

Workflow:
1. Contributor creates PR description
2. Frontend generates kind 1618 event
3. User signs and pays 25 sats
4. Submit to Crosstown/Connector
5. Maintainer sees PR in list

**Acceptance Criteria:**
- Event structures match NIP-34 spec
- Patches display with syntax highlighting
- PRs show as cards with title, author, description
- Both link back to repository
- Real-time updates when new patches/PRs arrive
- Comments thread under each (kind 1622)

**Out of Scope:**
- Actual git operations (applying patches, merging)
- Code review UI
- Diff visualization (future enhancement)

#### F1.6: Issues and Comments (Kinds 1621, 1622)
**Priority:** P1 (High)
**Status:** 🔴 Not Started

**User Story:** As a user, I want to report issues and discuss code using Nostr events.

**Requirements:**

**Issues (Kind 1621):**
```json
{
  "kind": 1621,
  "tags": [
    ["a", "30617:<owner>:<repo>"],
    ["p", "<repo-owner-pubkey>"],
    ["subject", "Bug: App crashes on startup"],
    ["t", "bug"],                              // Labels
    ["t", "priority:high"]
  ],
  "content": "## Steps to reproduce\n1. Open app\n2. Click...",
  "created_at": <timestamp>,
  "pubkey": "<reporter-pubkey>",
  "sig": "<signature>"
}
```

Workflow:
1. User fills issue form (title, body, labels)
2. Frontend generates kind 1621 event
3. User signs and pays 10 sats
4. Submit to Crosstown/Connector
5. Issue appears in repository's issue list

**Comments (Kind 1622):**
```json
{
  "kind": 1622,
  "tags": [
    ["e", "<issue-or-pr-event-id>", "", "root"],  // Thread root (NIP-10)
    ["p", "<issue-author-pubkey>"],
    ["p", "<mentioned-user-pubkey>"]              // Mentions
  ],
  "content": "I can confirm this bug on Linux...",
  "created_at": <timestamp>,
  "pubkey": "<commenter-pubkey>",
  "sig": "<signature>"
}
```

Workflow:
1. User writes comment text
2. Frontend generates kind 1622 event with NIP-10 threading
3. User signs and pays 1 sat
4. Submit to Crosstown/Connector
5. Comment appears in thread

**Acceptance Criteria:**
- Issues display with title, body, labels, author
- Comments thread correctly under parent (NIP-10)
- Real-time updates (<10s)
- Markdown rendering for issue/comment bodies
- Labels shown as colored tags
- Author avatars (from Nostr profiles - NIP-01)
- Mention notifications (via `p` tags)

**Query Pattern:**
```javascript
// Get all issues for a repo
pool.list(relays, [{
  kinds: [1621],
  "#a": ["30617:<owner>:<repo>"]
}])

// Get comments for an issue
pool.list(relays, [{
  kinds: [1622],
  "#e": ["<issue-event-id>"]
}])
```

#### F1.7: Status Management (Kinds 1630-1633)
**Priority:** P1 (High)
**Status:** 🔴 Not Started

**User Story:** As a maintainer, I want to change the status of issues/patches/PRs.

**Status Events:**
- **1630:** Open (default state)
- **1631:** Applied/Merged (for patches/PRs) or Resolved (for issues)
- **1632:** Closed (without applying/merging)
- **1633:** Draft (work in progress)

**Event Structure:**
```json
{
  "kind": 1631,  // Merged
  "tags": [
    ["e", "<pr-or-patch-event-id>", "", "root"],
    ["p", "<pr-author-pubkey>"],               // Notify author
    ["merge-commit", "<commit-hash>"],         // Optional
    ["applied-as-commits", "<hash1>", "<hash2>"]  // For patches
  ],
  "content": "Merged! Thanks for the contribution.",
  "created_at": <timestamp>,
  "pubkey": "<maintainer-pubkey>",
  "sig": "<signature>"
}
```

**Requirements:**
- Maintainer or PR/issue author can publish status events
- Most recent status event determines current state
- Frontend displays status badge (Open, Merged, Closed, Draft)
- Status changes appear in real-time
- Optional message explaining status change

**Acceptance Criteria:**
- Only maintainers or authors can change status
- Status updates reflect immediately (<10s)
- Historical status changes viewable
- Closed/merged items still discoverable (via filters)

**Query Pattern:**
```javascript
// Get status for a PR
const statuses = await pool.list(relays, [{
  kinds: [1630, 1631, 1632, 1633],
  "#e": ["<pr-event-id>"]
}])
// Sort by created_at descending, take first = current status
```

---

### Phase 2: Enhanced Collaboration

#### F2.1: Repository State Tracking (Kind 30618)
**Priority:** P1 (High)
**Status:** 🔴 Not Started

**Requirements:**
- Automatic state updates after pushes/merges
- Broadcast current branch heads and tags
- Include commit parent info for ahead/behind tracking
- Efficient updates (only changed refs)

#### F2.2: PR Updates and Revisions (Kind 1619)
**Priority:** P1 (High)
**Status:** 🔴 Not Started

**Requirements:**
- Update PR tip commit without creating new PR
- Link to original PR event
- Show revision history
- Force-push detection and warnings

#### F2.3: Status Management (Kinds 1630-1633)
**Priority:** P1 (High)
**Status:** 🔴 Not Started

**Requirements:**
- Open/Applied/Merged/Closed/Draft statuses
- Maintainer authorization for status changes
- Status change notifications
- UI indicators for current status

#### F2.4: Access Control and Permissions
**Priority:** P1 (High)
**Status:** 🔴 Not Started

**User Story:** As a maintainer, I want to control who can push to my repository.

**Requirements:**
- NIP-34 ACL events defining write/admin permissions
- Verify contributor pubkey against ACL before accepting events
- Support for public read, restricted write
- Maintainer can add/remove collaborators
- Fork detection (personal-fork tag)

**ACL Event Structure:**
```json
{
  "kind": 30619,
  "tags": [
    ["d", "my-repo"],
    ["a", "30617:<owner>:my-repo"],
    ["write", "pubkey1", "pubkey2"],
    ["admin", "owner-pubkey"],
    ["read", "*"]
  ]
}
```

**Acceptance Criteria:**
- Unauthorized pushes rejected immediately
- ACL updates propagate within 30 seconds
- Maintainer UI for managing collaborators
- Fork creation doesn't require permission

#### F2.5: Search and Discovery (Pure Nostr NIP-01 Queries)
**Priority:** P1 (High) - Core to decentralized architecture
**Status:** 🔴 Not Started

**User Story:** As a user, I want to discover repositories by querying Nostr relays directly without any centralized search service.

**Requirements:**
- Frontend connects to Nostr relays via WebSocket
- Uses NIP-01 REQ/FILTER to query for NIP-34 events
- All discovery happens client-side or via relay queries
- No backend search index required

**NIP-01 Query Patterns:**

**Discover All Repositories:**
```json
["REQ", "repos", {
  "kinds": [30617],
  "limit": 100
}]
```

**Search by Topic/Tag:**
```json
["REQ", "rust-repos", {
  "kinds": [30617],
  "#t": ["rust"],
  "limit": 50
}]
```

**Find User's Repositories:**
```json
["REQ", "user-repos", {
  "kinds": [30617],
  "authors": ["user-pubkey-hex..."],
  "limit": 100
}]
```

**Find Repository by ID:**
```json
["REQ", "specific-repo", {
  "kinds": [30617],
  "authors": ["owner-pubkey"],
  "#d": ["repo-name"]
}]
```

**Trending (Recent Activity):**
```json
["REQ", "trending", {
  "kinds": [30617],
  "since": 1234567890,
  "limit": 50
}]
```

**Get All Events for a Repository:**
```json
["REQ", "repo-events", {
  "kinds": [1617, 1618, 1621, 1622, 1630, 1631, 1632],
  "#a": ["30617:<owner-pubkey>:<repo-d-tag>"]
}]
```

**Frontend Implementation:**
- Connect to 3-5 public Nostr relays
- Subscribe to relevant event kinds
- Cache events in IndexedDB/localStorage
- Client-side filtering and sorting
- Real-time updates via WebSocket subscriptions

**Acceptance Criteria:**
- Connect to multiple relays for redundancy
- Search/filter results in <2 seconds (client-side)
- Support tag filtering (#rust, #javascript, etc.)
- Pagination for large result sets
- Works entirely without backend (static hosting)
- Relay failures don't break discovery (fallback to other relays)

**Technical Notes:**
- Relays may implement their own filtering optimizations
- Some relays may not support all filter types
- Frontend should aggregate results from multiple relays
- Duplicate events (same ID from different relays) should be deduplicated

#### F2.6: Notifications
**Priority:** P2 (Medium)
**Status:** 🔴 Not Started

**Requirements:**
- Nostr DM notifications (NIP-04) for mentions
- Email notifications (optional)
- Notification preferences UI
- Web push notifications
- Batching to prevent spam

---

### Phase 3: Advanced Features

#### F3.1: Code Review Tools
**Priority:** P2 (Medium)
**Status:** 🔴 Not Started

**Requirements:**
- Line-by-line comments on patches/PRs
- Review approval/rejection events
- Request changes workflow
- Review assignment

#### F3.2: CI/CD Integration
**Priority:** P2 (Medium)
**Status:** 🔴 Not Started

**Requirements:**
- Nostr event-triggered builds
- Status checks as Nostr events
- Integration with existing CI systems
- Build logs on Arweave

#### F3.3: Git Protocol Compatibility
**Priority:** P1 (High)
**Status:** 🔴 Not Started

**User Story:** As a developer, I want to use standard git commands (clone, push, pull) with Nostr-backed repositories.

**Requirements:**
- Git HTTP protocol wrapper
- Translate git push → NIP-34 events
- Fetch objects from Arweave on pull
- Authentication via Nostr signatures
- Support git clone, push, pull, fetch

**Acceptance Criteria:**
- Standard git clients work without modification
- Push automatically creates patch/PR events
- Clone fetches from Arweave transparently
- Performance comparable to traditional git (±20%)

#### F3.4: Repository Mirroring
**Priority:** P2 (Medium)
**Status:** 🔴 Not Started

**Requirements:**
- Mirror existing GitHub/GitLab repos to Nostr
- Automatic sync on push
- Bidirectional sync option
- Preserve commit signatures

#### F3.5: Web Viewer (Static Client - Primary Read Interface)
**Priority:** P0 (Critical) - This is how users discover and browse repos
**Status:** 🔴 Not Started

**User Story:** As a viewer, I want to browse repositories without running a server, using only Nostr relays and Arweave.

**Requirements:**
- Pure client-side JavaScript/WASM app (no backend)
- WebSocket connections to Nostr relays
- Direct HTTP requests to Arweave gateways
- All data fetching via NIP-01 REQ queries
- Local state management (IndexedDB for caching)
- Can be hosted on any static file server or IPFS

**Core Features:**
1. **Repository Discovery**
   - Query relays for kind 30617 events
   - Filter by tags, author, time range
   - Display repository list with metadata
   - Real-time updates via subscriptions

2. **Repository Viewer**
   - Fetch repository manifest from Arweave
   - Reconstruct git tree from manifest
   - File browser with directory navigation
   - Syntax highlighting (client-side, highlight.js)
   - Markdown rendering for README

3. **Commit History**
   - Query for commit events
   - Display commit log with diffs
   - Author info from Nostr pubkeys
   - Cryptographic verification of signatures

4. **Issues & PRs**
   - Query for kinds 1621 (issues), 1618 (PRs)
   - Display with comments (kind 1622)
   - Thread navigation
   - Status indicators from kind 1630-1633 events

5. **Offline Support**
   - Cache Nostr events in IndexedDB
   - Cache Arweave data for visited repos
   - Service Worker for offline viewing
   - PWA installable on mobile

**Technology Stack:**
- Vanilla JS or lightweight framework (Svelte/Preact)
- nostr-tools library for WebSocket handling
- highlight.js for syntax highlighting
- marked.js for markdown rendering
- localforage for IndexedDB abstraction
- No build step required (or minimal bundling)

**Deployment:**
- Deploy to GitHub Pages, Netlify, or any CDN
- Or host on IPFS/Arweave itself
- Single HTML file with inlined JS (for simplicity)
- Or modular build with code splitting

**Acceptance Criteria:**
- Zero backend dependencies for reads
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Loads repository in <5 seconds (first load), <1s (cached)
- Syntax highlighting for 50+ languages
- Responsive design for mobile
- Gracefully handles relay failures (tries multiple relays)
- Clear UI indicators when fetching from Arweave
- Can be self-hosted by anyone (just static files)

**Example User Flow:**
1. User visits static site (e.g., https://nostr-git.com)
2. Site connects to 3-5 Nostr relays via WebSocket
3. Site sends REQ for kind 30617 events (repositories)
4. Relays return matching events
5. User clicks on repository
6. Site queries for repository-specific events (patches, issues)
7. Site fetches manifest from Arweave using TX ID from event
8. Site reconstructs file tree and displays code
9. All rendering happens client-side
10. No server logs user activity (true privacy)

**Technical Notes:**
- Use Web Workers for heavy parsing/rendering
- Implement virtual scrolling for large file lists
- Stream large files from Arweave (don't load entire file)
- Support deep linking to specific files/commits
- SEO via pre-rendering (optional, for discoverability)

#### F3.6: Analytics and Insights
**Priority:** P3 (Low)
**Status:** 🔴 Not Started

**Requirements:**
- Repository activity graphs
- Contributor statistics
- Issue/PR velocity metrics
- On-chain analytics (all data verifiable)

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Read-Only)                 │
│                      Using nostr-tools                      │
├─────────────────────────────────────────────────────────────┤
│   Web Viewer   │   Mobile App   │   CLI Tools   │  Any UI  │
└────────┬───────────────┬───────────────┬──────────────┬─────┘
         │               │               │              │
         └───────────────┴───────────────┴──────────────┘
                              │
                              │ (WebSocket REQ/FILTER)
                              │ (NIP-01 queries)
                              │
                    ┌─────────▼─────────┐
                    │   Nostr Relays    │
                    │   (Distributed)   │
                    │                   │
                    │ Store NIP-34 git  │
                    │ events (repos,    │
                    │ patches, issues)  │
                    └─────────┬─────────┘
                              ▲
                              │
                              │ (Publish events after payment)
                              │
                   ┌──────────┴──────────┐
                   │  Crosstown/Connector │
                   │   (Backend Service)  │
                   │                      │
                   │ • ILP packet verify  │
                   │ • Nostr relay pub    │
                   │ • Payment gating     │
                   └──────────▲───────────┘
                              │
                              │ (User submits event + payment)
                              │
         ┌────────────────────┴────────────────────┐
         │         Write Operations (Gated)        │
         │  User signs event → pays ILP → submit   │
         └─────────────────────────────────────────┘
```

**Key Architecture Principles:**

1. **Reads are Pure P2P (no backend)**
   - Frontend uses nostr-tools to query relays directly
   - No authentication needed to browse
   - No centralized API or database

2. **Writes are ILP-Gated**
   - User creates + signs Nostr event (client-side)
   - User pays ILP micropayment (Web Monetization API)
   - Submit to Crosstown/Connector
   - Connector verifies payment, publishes to relays
   - Invalid/unpaid events rejected

3. **Storage (Future/Out of Scope)**
   - Arweave integration TBD
   - For now, focus on Nostr event design
   - Code/data storage strategy deferred

4. **Forgejo is Reference Only**
   - Use Forgejo feature set as requirements
   - NOT forking/modifying Forgejo codebase
   - Building new NIP-34 native system

### Data Flow: Creating a Repository

```
1. User fills out repo form in web UI
        ↓
2. Frontend generates NIP-34 event (kind 30617)
   {
     "kind": 30617,
     "tags": [
       ["d", "my-repo"],
       ["name", "My Repository"],
       ["description", "A cool project"],
       ...
     ],
     "content": "Extended README..."
   }
        ↓
3. User signs event with Nostr key (browser extension)
        ↓
4. User pays 1000 sats via ILP (Web Monetization API)
        ↓
5. Frontend submits: {event, payment_receipt} → Crosstown/Connector
        ↓
6. Crosstown/Connector verifies ILP payment receipt
        ↓
7. If valid: Connector publishes event to Nostr relays
        ↓
8. Relays store and distribute event
        ↓
9. Other users query relays with nostr-tools
        ↓
10. Repository appears in discovery (no delay)
```

**Note:** Git object storage (code, commits) is deferred. For now, focus on metadata events.

### Data Flow: Submitting a Patch

```
1. Contributor creates patch (git format-patch)
        ↓
2. Frontend generates NIP-34 event (kind 1617)
   {
     "kind": 1617,
     "tags": [
       ["a", "30617:<owner-pubkey>:<repo-d-tag>"],
       ["p", "<repo-owner-pubkey>"],
       ["commit", "<commit-hash>"],
       ["parent-commit", "<parent-hash>"]
     ],
     "content": "diff --git a/file.js..."
   }
        ↓
3. Contributor signs event with their Nostr key
        ↓
4. Contributor pays 10 sats via ILP
        ↓
5. Submit {event, payment_receipt} → Crosstown/Connector
        ↓
6. Connector verifies payment
        ↓
7. Connector publishes event to relays
        ↓
8. Maintainer queries relays for patches
   REQ: {"kinds": [1617], "#a": ["30617:owner:repo"]}
        ↓
9. Maintainer sees patch in their viewer
        ↓
10. Maintainer can accept/reject via status event (kind 1631/1632)
```

**Note:** Actual git operations (applying patch, updating repo state) deferred.

### Client-Side vs Server-Side Architecture

**IMPORTANT:** This system is **read-heavy P2P, write-gated via Crosstown/Connector**.

**Client-Side Only (No Backend Required):**
- ✅ Repository discovery (NIP-01 queries to relays via nostr-tools)
- ✅ Reading issues/PRs/comments (query relays)
- ✅ Viewing repository metadata (from kind 30617 events)
- ✅ Searching/filtering (client-side or relay-supported filtering)
- ✅ Real-time updates (WebSocket subscriptions)
- ✅ Event signature verification

**Crosstown/Connector (Backend Service):**
- ❌ ILP payment verification
- ❌ Publishing events to relays (only after payment verified)
- ❌ Payment receipt validation
- ❌ Rate limiting (prevent spam even with payments)

**User Actions (Client-Side Event Creation):**
- User signs events with their Nostr key (browser extension)
- User pays ILP micropayment
- User submits to Crosstown/Connector
- Connector gates publishing on valid payment

**Why This Architecture?**
- **Reads are free and P2P** → No backend needed, pure relay queries
- **Writes require payment** → Crosstown/Connector enforces this
- **No centralized database** → All data in Nostr events
- **Spam prevention** → Economic cost enforced at write gateway
- **Censorship resistant** → No single point of control for reads

### Technology Stack

**Frontend (Static Client - Read-Only):**
- Vanilla JavaScript or Svelte/Preact
- **nostr-tools** (npm) - https://www.npmjs.com/package/nostr-tools
  - `SimplePool` for connecting to multiple relays
  - `Filter` for NIP-01 REQ/FILTER queries
  - Event signature verification
  - **READ-ONLY** - does not publish events
- highlight.js - Syntax highlighting (future)
- marked.js - Markdown rendering (future)
- localforage - IndexedDB for caching events
- **Deployment:** Static hosting (Netlify, GitHub Pages, IPFS)

**Crosstown/Connector (Backend Service):**
- **Purpose:** ILP payment verification + Nostr relay publishing gateway
- **Responsibilities:**
  - Receive events + payment receipts from clients
  - Verify ILP packet/payment receipt
  - Publish validated events to Nostr relays
  - Rate limiting and spam prevention
  - Payment audit trail
- **Technology:** (Your implementation - TBD)
- **Reference:** You mentioned these handle "ILP Packet and nostr relay side of things"

**Nostr Infrastructure:**
- **Relays:** Public Nostr relays (damus, nostr.band, nos.lol, etc.)
- **Protocol:** NIP-01 (basic protocol), NIP-34 (git stuff)
- **Client Library:** nostr-tools for frontend
- **Signatures:** schnorr/secp256k1 (via browser extensions like nos2x, Alby)

**ILP/Payment:**
- Web Monetization API (client-side)
- ILP payment pointers
- Crosstown/Connector validates receipts
- Micropayment amounts per event kind

**Storage (Out of Scope for Now):**
- ~~Arweave integration~~ - Deferred, you'll handle later
- Focus on Nostr event structures first
- Git object storage strategy TBD

**Feature Reference:**
- **Forgejo** - Feature parity target (not implementation)
- Map git operations to NIP-34 events
- Support issues, PRs, comments, etc.

### Security Considerations

**Authentication:**
- Nostr signatures cryptographically verify identity
- No passwords stored (passwordless for Nostr-only accounts)
- Challenge-response prevents replay attacks
- 5-minute challenge TTL

**Authorization:**
- ACL events signed by repository owner
- Multiple signature verification before accepting events
- Contributor permissions checked before applying patches

**Payment Security:**
- ILP receipts cryptographically signed
- Payment amounts validated against cost schedule
- Double-spend prevention via receipt deduplication
- Webhook signatures verified

**Data Integrity:**
- Git objects content-addressed (SHA-256)
- Arweave transactions immutable and verifiable
- Nostr events cryptographically signed
- Commit signatures preserved (GPG/SSH)

**Spam Prevention:**
- Economic cost for all write operations
- Escalating costs for high-frequency operations
- Reputation system (future: web of trust)
- Rate limiting on free operations (reads)

### NIP-01 Discovery Patterns (Client Implementation Guide)

**Pattern 1: Discover All Repositories**
```javascript
// Get latest 100 repositories
const filter = {
  kinds: [30617],
  limit: 100
}
// Sort client-side by created_at for "trending"
```

**Pattern 2: Search by Topic**
```javascript
// Find repositories tagged with #rust
const filter = {
  kinds: [30617],
  "#t": ["rust"],
  limit: 50
}
```

**Pattern 3: Find User's Repositories**
```javascript
// Get all repos by a specific user
const filter = {
  kinds: [30617],
  authors: ["user-pubkey-hex"],
  limit: 100
}
```

**Pattern 4: Get Repository Details**
```javascript
// Get specific repository by d-tag
const filter = {
  kinds: [30617],
  authors: ["owner-pubkey"],
  "#d": ["repository-name"]
}
// Should return exactly 1 event (parametrized replaceable)
```

**Pattern 5: Get All Repository Activity**
```javascript
// Get all events related to a repository
const filter = {
  kinds: [1617, 1618, 1619, 1621, 1622, 1630, 1631, 1632, 1633],
  "#a": ["30617:<owner-pubkey>:<repo-d-tag>"]
}
// Returns patches, PRs, issues, comments, status changes
```

**Pattern 6: Get Recent Activity (Time-based)**
```javascript
// Get repos created in last 7 days
const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60)
const filter = {
  kinds: [30617],
  since: sevenDaysAgo,
  limit: 50
}
```

**Pattern 7: Multi-Topic Search (OR logic)**
```javascript
// Find repos tagged with rust OR go
const rustFilter = { kinds: [30617], "#t": ["rust"] }
const goFilter = { kinds: [30617], "#t": ["go"] }
// Send both filters in one REQ
// Relay returns events matching either filter
```

**Pattern 8: Following-based Discovery**
```javascript
// Get repos from people you follow
// (Assumes you have a follow list - NIP-02)
const followedPubkeys = ["pubkey1", "pubkey2", "pubkey3"]
const filter = {
  kinds: [30617],
  authors: followedPubkeys,
  limit: 100
}
```

**Client Implementation Best Practices:**
1. **Connect to multiple relays** (3-5) for redundancy
2. **Deduplicate events** by ID (same repo from multiple relays)
3. **Cache aggressively** in IndexedDB to reduce relay queries
4. **Subscribe to updates** - keep WebSocket open for real-time
5. **Handle relay failures** gracefully - don't block UI
6. **Show which relay** provided each piece of data (transparency)
7. **Allow user to add custom relays** (no hardcoded relay list)

### Performance Requirements

**Latency (Client-Side Operations):**
- Relay connection: <2s to establish WebSocket
- Initial discovery query: <3s for 100 repos (depends on relay)
- Event deduplication: <100ms (client-side)
- Arweave manifest fetch: <2s (first time), <100ms (cached)
- File rendering: <500ms for typical source file
- Search/filter: <500ms (client-side operations)

**Latency (Server-Side Operations):**
- Event publishing: <500ms (after payment verified)
- Event propagation: <5s (P95), <10s (P99)
- Arweave upload: <30s for <10MB
- Payment verification: <2s

**Throughput:**
- Frontend: Support 10,000 concurrent viewers (static hosting scales)
- Backend: Support 100 concurrent write operations
- Relay queries: 1000 REQ/minute per client
- Arweave fetches: 100 concurrent requests (CDN-backed)

**Scalability:**
- **Frontend:** Infinitely scalable (static files on CDN)
- **Backend:** Horizontal scaling for write operations
- **Relays:** Use multiple relays for load distribution
- **Arweave:** Multiple gateways for redundancy

**Availability:**
- **Frontend:** 99.99% (static hosting SLA)
- **Reads:** No single point of failure (multiple relays + Arweave)
- **Writes:** 99.9% (backend SLA, but not critical - can retry)
- **Data:** 99.99% (Arweave permanence guarantee)

---

## User Flows

### Flow 1: Creating a Repository

**Actors:** Maintainer (Alex)

**Preconditions:**
- Alex has Nostr browser extension installed
- Alex has Lightning wallet with ≥1000 sats
- Alex is logged in to Forgejo

**Steps:**
1. Alex clicks "New Repository" in Forgejo UI
2. Fills out repository name, description, license
3. Clicks "Create Repository"
4. System generates NIP-34 event preview
5. System displays payment prompt: "Pay 1000 sats to publish"
6. Alex clicks "Pay with Lightning"
7. Payment modal opens (Web Monetization / Alby)
8. Alex confirms payment
9. System verifies payment receipt
10. System uploads git objects to Arweave (shows progress)
11. System publishes event to Nostr relays
12. Success message: "Repository published! Event ID: abc123..."
13. Repository page displays with Nostr event ID and Arweave manifest link

**Error Handling:**
- Payment fails: Show retry button and error message
- Arweave upload fails: Retry automatically, show status
- Relay publishing fails: Retry on other relays, show warning if <3 succeed

**Acceptance Criteria:**
- Complete flow in <60 seconds
- Clear progress indicators at each step
- Recoverable from any error state

### Flow 2: Submitting a Patch

**Actors:** Contributor (Jordan)

**Preconditions:**
- Jordan has cloned repository
- Jordan has made changes and created patch
- Jordan has Nostr key and ≥10 sats

**Steps:**
1. Jordan runs: `git format-patch HEAD~1`
2. Jordan opens Forgejo repository page
3. Clicks "Submit Patch"
4. Uploads .patch file or pastes patch content
5. System parses patch, shows commit info
6. System prompts: "Pay 10 sats to submit"
7. Jordan confirms payment
8. System creates NIP-34 event (kind 1617)
9. Browser extension prompts Jordan to sign event
10. Jordan clicks "Sign"
11. System publishes event to relays
12. Success message: "Patch submitted! Event ID: def456..."
13. Patch appears in repository's "Patches" list
14. Maintainer receives Nostr DM notification

**Alternative Flow: Via Git CLI (Phase 3)**
1. Jordan runs: `git push origin HEAD:refs/patches/my-fix`
2. System intercepts push
3. Prompts for payment via CLI
4. Auto-creates and signs NIP-34 event
5. Publishes patch
6. Returns success to git client

**Acceptance Criteria:**
- Patch submission <30 seconds
- Clear indication of payment requirement
- Patch visible immediately after publication

### Flow 3: Opening an Issue

**Actors:** Anyone

**Preconditions:**
- User has Nostr key and ≥10 sats

**Steps:**
1. User navigates to repository
2. Clicks "New Issue"
3. Fills out title and description (markdown supported)
4. Adds labels (optional)
5. Clicks "Submit Issue"
6. System prompts: "Pay 10 sats to create issue"
7. User confirms payment
8. Browser signs NIP-34 event (kind 1621)
9. Event published to relays
10. Issue appears in repository's issue list
11. Issue assigned unique ID (Nostr event ID)

**Acceptance Criteria:**
- Rich markdown editor with preview
- Template support (bug report, feature request)
- Payment failure doesn't lose draft

### Flow 4: Repository Discovery (Pure Client-Side via Nostr)

**Actors:** Sam (Archivist)

**Preconditions:**
- Sam has web browser
- No account or authentication required
- No backend server needed

**Steps:**
1. Sam visits static site (e.g., https://nostr-git.io or IPFS hash)
2. **Site connects to Nostr relays** via WebSocket:
   - wss://relay.damus.io
   - wss://relay.nostr.band
   - wss://nos.lol
3. **Site sends NIP-01 REQ** for repositories:
   ```json
   ["REQ", "discover", {
     "kinds": [30617],
     "limit": 100
   }]
   ```
4. Relays return repository announcement events
5. Site displays "Trending Repositories" (sorted client-side by `created_at`)
6. Sam clicks "Filter by topic: #rust"
7. **Site sends new REQ** with tag filter:
   ```json
   ["REQ", "rust-repos", {
     "kinds": [30617],
     "#t": ["rust"],
     "limit": 50
   }]
   ```
8. Site displays filtered list of Rust repositories
9. Sam clicks on "awesome-rust-project"
10. **Site queries for repository events**:
    ```json
    ["REQ", "repo-details", {
      "kinds": [1617, 1618, 1621, 1622, 30618],
      "#a": ["30617:<owner-pubkey>:awesome-rust-project"]
    }]
    ```
11. Site receives patches, PRs, issues, comments
12. **Site fetches manifest from Arweave**:
    - Extracts `clone` tag with ar://manifest-tx-id
    - HTTP GET to arweave.net/manifest-tx-id
13. Site displays repository page:
    - File browser (reconstructed from manifest)
    - Commit history (from events)
    - Issues and PRs (from kind 1621, 1618 events)
    - Comments threaded (from kind 1622 events)
14. Sam clicks on `src/main.rs` file
15. **Site fetches file from Arweave**:
    - Looks up blob hash in manifest
    - GET arweave.net/<blob-tx-id>
    - Renders with syntax highlighting (client-side)
16. Sam clicks "Clone" button
17. Site displays:
    - **Nostr Event ID:** `nevent1...` (shareable)
    - **Arweave Manifest:** `ar://abc123...`
    - **Clone URL:** `nostr-git://npub.../repo-name`
18. Sam can share the nevent1... URL and anyone can view the repo

**Technical Implementation:**
```javascript
// Example client-side code
import { relayInit } from 'nostr-tools'

// Connect to relays
const relays = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol'
].map(url => relayInit(url))

await Promise.all(relays.map(r => r.connect()))

// Discover repositories
const sub = relays[0].sub([{
  kinds: [30617],
  limit: 100
}])

sub.on('event', event => {
  // Parse repository metadata
  const repoName = event.tags.find(t => t[0] === 'name')?.[1]
  const description = event.tags.find(t => t[0] === 'description')?.[1]
  const arweaveUrl = event.tags.find(t => t[0] === 'clone')?.[1]

  // Display in UI
  renderRepository({ repoName, description, arweaveUrl, event })
})

// Fetch from Arweave
async function fetchManifest(txId) {
  const response = await fetch(`https://arweave.net/${txId}`)
  return await response.json()
}
```

**Error Handling:**
- Relay connection fails: Try next relay
- No events found: Show "No repositories yet" message
- Arweave fetch fails: Retry with different gateway
- Invalid manifest: Show error, display raw event data

**Acceptance Criteria:**
- ✅ Zero backend calls (pure P2P)
- ✅ Browse without authentication
- ✅ Filter/search responsive (<2s client-side)
- ✅ Works with any Nostr relays (no vendor lock-in)
- ✅ Works with any Arweave gateway
- ✅ Can be hosted anywhere (static files)
- ✅ Real-time updates (via WebSocket subscriptions)
- ✅ Clear indicators showing decentralization:
  - Nostr event IDs displayed
  - Arweave TX IDs as links
  - Which relays provided data
  - "Fetching from Arweave..." indicators

---

## Success Metrics & KPIs

### User Acquisition
- **Target:** 500 users in month 1, 2000 by month 3
- **Measurement:** Unique Nostr pubkeys with ≥1 action
- **Tracking:** Weekly active users (WAU)

### Repository Growth
- **Target:** 100 repos in month 1, 1000 by month 6
- **Measurement:** Kind 30617 events published
- **Tracking:** New repos per week, cumulative

### Engagement
- **Target:** 5000 NIP-34 events/week by month 3
- **Measurement:** All event kinds (patches, issues, comments, etc.)
- **Breakdown:**
  - Patches: 20%
  - Pull Requests: 15%
  - Issues: 25%
  - Comments: 35%
  - Status changes: 5%

### Economic Health
- **Target:** 95%+ payment success rate
- **Measurement:** Successful ILP payments / attempted payments
- **Spam Rate:** <2% (measured by reported/deleted content)
- **Average cost per user/month:** <$1.00

### Technical Performance
- **Uptime:** 99.9%+
- **Event propagation time:** <10s P99
- **Arweave upload success:** >99%
- **Page load time:** <3s P95

### Data Permanence
- **Arweave storage:** 100GB+ code by month 6
- **Data availability:** 99.99% (Arweave SLA)
- **Object deduplication:** ≥30% savings

### Network Effects
- **Relay coverage:** ≥5 major relays carrying events
- **Client diversity:** ≥3 clients supporting NIP-34
- **Integrations:** ≥2 other tools using our events

---

## Timeline & Milestones

### Phase 1: MVP (Months 1-3)

**Month 1:**
- ✅ Nostr authentication (completed)
- 🔨 ILP payment integration
- 🔨 Arweave client implementation
- 🔨 Repository announcement (kind 30617)
- 🔨 Basic event ingestion from relays

**Month 2:**
- 🔨 Patch submission (kind 1617)
- 🔨 Pull request creation (kind 1618)
- 🔨 Issue tracking (kind 1621)
- 🔨 Comments (kind 1622)
- 🔨 Payment verification pipeline
- 🔨 Database models and migrations

**Month 3:**
- 🔨 Status management (kinds 1630-1633)
- 🔨 ACL enforcement
- 🔨 Relay health monitoring
- 🔨 Admin configuration UI
- 🔨 Documentation and onboarding
- 🎯 **Milestone: Beta Launch**
  - Support 100 repositories
  - 500 users
  - 5000+ events

### Phase 2: Enhanced Features (Months 4-6)

**Month 4:**
- Repository state tracking (kind 30618)
- PR updates (kind 1619)
- Search and discovery
- Notifications (Nostr DM)

**Month 5:**
- Access control improvements
- Fork detection
- Web of trust integration
- Performance optimization

**Month 6:**
- Code review tools
- Analytics dashboard
- Migration tools (GitHub → Nostr)
- 🎯 **Milestone: Public Launch**
  - Support 1000 repositories
  - 2000 users
  - Full NIP-34 compliance

### Phase 3: Ecosystem Growth (Months 7-12)

**Month 7-9:**
- Git protocol compatibility
- CI/CD integration
- Mobile apps (iOS/Android)
- Browser extension

**Month 10-12:**
- Static web viewer (client-only)
- Repository mirroring (GitHub sync)
- Advanced search (code search)
- Marketplace (paid repositories)
- 🎯 **Milestone: Production Ready**
  - 5000+ repositories
  - 10,000+ users
  - Ecosystem integrations

---

## Risks & Mitigations

### Technical Risks

**Risk 1: Arweave Costs Too High**
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:**
  - Use Bundlr for batch uploads (10x cheaper)
  - Aggressive deduplication (SHA-256 content addressing)
  - Only store unique objects
  - Offer maintainer-pays vs. contributor-pays options
  - Implement compression for text files
- **Fallback:** IPFS + Filecoin for lower-cost option

**Risk 2: Nostr Relay Reliability**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:**
  - Connect to 5-10 relays simultaneously
  - Automatic failover on disconnect
  - Run own dedicated relay for critical events
  - Cache events in PostgreSQL
  - REQ subscription recovery on reconnect
- **Monitoring:** Alert if <3 relays connected

**Risk 3: ILP Payment Failures**
- **Likelihood:** Medium
- **Impact:** High (blocks all operations)
- **Mitigation:**
  - Retry logic with exponential backoff
  - Multiple payment providers (Alby, Strike, Coil)
  - Graceful degradation (allow operations, verify async)
  - Clear error messages with recovery steps
  - Support alternative payment methods (on-chain Bitcoin)
- **Monitoring:** Track payment success rate, alert if <90%

**Risk 4: Git Operations Don't Map Well to Events**
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:**
  - NIP-34 already designed by git experts
  - Prototype early with real repositories
  - Support both event-based and git protocol
  - Provide migration path for users
- **Validation:** User testing with 10+ real-world repos

**Risk 5: Performance Degradation at Scale**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:**
  - Horizontal scaling (event processors)
  - Aggressive caching (Redis + CDN)
  - Database indexing on event IDs, pubkeys
  - Rate limiting on expensive operations
  - Load testing before launch
- **Monitoring:** Response time, throughput, error rates

### Business Risks

**Risk 6: Low User Adoption**
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:**
  - Focus on niche use case (censorship resistance)
  - Target existing Nostr community first
  - Make migration from GitHub easy
  - Highlight unique benefits (permanence, ownership)
  - Offer hosted service + self-hostable
- **Validation:** User interviews, beta feedback

**Risk 7: Too Expensive for Users**
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:**
  - Keep costs minimal (<$1/month typical use)
  - Offer free tier for viewers (only writes cost)
  - Maintainer can sponsor contributors
  - Batch operations to reduce costs
  - Transparent cost calculator
- **Validation:** Price sensitivity testing

**Risk 8: Regulatory Concerns (AML/KYC)**
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:**
  - Micropayments likely below reporting thresholds
  - System doesn't custody funds (direct ILP)
  - Users responsible for own compliance
  - Operate in crypto-friendly jurisdiction
  - Legal review before launch
- **Monitoring:** Regulatory landscape changes

### Operational Risks

**Risk 9: Spam Despite Payments**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:**
  - Adjust costs dynamically based on spam levels
  - Reputation system (web of trust)
  - Maintainer can block specific pubkeys
  - Community moderation tools
  - Report/flag mechanisms
- **Monitoring:** Spam rate, user reports

**Risk 10: Key Management Issues**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:**
  - Educate users on Nostr key backup
  - Support multiple keys per account
  - Key recovery via email (optional)
  - Hardware wallet integration (future)
  - Clear warnings about key loss
- **Documentation:** Comprehensive key management guide

---

## Open Questions

### Technical Questions

1. **Q: Should we run our own Nostr relay or only use public relays?**
   - **Considerations:** Reliability vs. decentralization
   - **Recommendation:** Run own relay + 3-5 public relays for redundancy
   - **Decision Needed By:** Month 1

2. **Q: How do we handle very large repositories (>10GB)?**
   - **Options:**
     - A. Require Git LFS with separate Arweave upload
     - B. Selective cloning (sparse checkout)
     - C. Set hard limit for MVP
   - **Recommendation:** Option C for MVP, A for production
   - **Decision Needed By:** Month 2

3. **Q: Should ILP be the only payment method?**
   - **Alternatives:** Lightning direct, on-chain Bitcoin, fiat via Stripe
   - **Recommendation:** Start with ILP, add Lightning in Phase 2
   - **Decision Needed By:** Month 1

4. **Q: How do we handle merge conflicts in a distributed system?**
   - **Options:**
     - A. Last valid event wins (optimistic)
     - B. Require maintainer to sign merge event
     - C. CRDT-based automatic resolution
   - **Recommendation:** Option B (maintainer authority)
   - **Decision Needed By:** Month 2

### Product Questions

5. **Q: Do we build a standalone app or extend existing Forgejo?**
   - **Options:**
     - A. Fork Forgejo and heavily modify
     - B. Plugin/extension architecture
     - C. Separate app with migration path
   - **Recommendation:** Option A for tight integration
   - **Decision Needed By:** Month 1

6. **Q: Should we support private repositories?**
   - **Challenges:** Encryption on Arweave, access control
   - **Recommendation:** Public-only for MVP, encrypted repos in Phase 3
   - **Decision Needed By:** Month 3

7. **Q: How do users discover the right Nostr relays for a repository?**
   - **Options:**
     - A. Repository event includes relay list
     - B. NIP-65 style relay hints
     - C. Centralized registry
   - **Recommendation:** Option A (already in NIP-34)
   - **Decision Needed By:** Month 1

### Business Questions

8. **Q: What's our business model?**
   - **Options:**
     - A. Hosted service (SaaS) with markup on costs
     - B. Open-source only, funded by grants/donations
     - C. Premium features (analytics, support)
   - **Recommendation:** A + B (freemium)
   - **Decision Needed By:** Month 3

9. **Q: Do we need legal entity / terms of service?**
   - **Considerations:** Liability, DMCA, illegal content
   - **Recommendation:** Yes, legal review required
   - **Decision Needed By:** Before public launch

10. **Q: How do we handle DMCA takedowns on a censorship-resistant platform?**
    - **Challenge:** Can't delete from Arweave
    - **Options:**
      - A. Publish takedown notice as Nostr event, hide in UI
      - B. Geofence content (hide in certain jurisdictions)
      - C. No takedown mechanism (pure censorship resistance)
    - **Recommendation:** Option A (balance legality and ethos)
    - **Decision Needed By:** Month 2

---

## Dependencies & Assumptions

### External Dependencies

**Nostr Ecosystem:**
- **CRITICAL:** Nostr relays remain available and reliable for reads (discovery depends on this)
- **CRITICAL:** At least 3-5 public relays support NIP-01 filtering with tag queries
- Assumes NIP-34 standard remains stable (no breaking changes)
- Assumes nostr-tools (JS) and go-nostr (Go) libraries maintained
- Assumes relays implement efficient tag filtering for discovery (#a, #d, #t tags)

**Arweave:**
- **CRITICAL:** Arweave network remains operational for permanent storage
- Assumes storage costs remain affordable (<$10/GB, target <$5/GB with Bundlr)
- Assumes data retrieval performance acceptable (<5s uncached)
- Assumes multiple gateways available (arweave.net, ar.io, etc.)
- Assumes 99.99% data availability SLA maintained

**ILP / Lightning:**
- Assumes ILP connectors (Rafiki) production-ready for payments
- Assumes Lightning Network capacity sufficient for micropayments
- Assumes Web Monetization API adoption continues
- **Alternative:** Can fall back to direct Lightning payments if ILP unavailable

### Assumptions

**User Behavior:**
- **Readers:** Don't need accounts, browse freely via P2P (client queries relays directly)
- **Writers:** Willing to pay small amounts for quality (<$1/month typical)
- Users value censorship resistance enough to learn new tools
- Users have or will acquire Nostr keys (via browser extensions like nos2x, Alby)
- Users have Lightning wallets or willing to get one for write operations

**Technical - Client-Side:**
- **CRITICAL:** Modern browsers support WebSocket connections to multiple relays
- Browsers allow IndexedDB for caching events and Arweave data (1GB+)
- JavaScript performance sufficient for event parsing/filtering on client
- Static hosting (CDN) can handle 10,000+ concurrent viewers
- Users accept 2-5 second load times for initial discovery queries

**Technical - Server-Side:**
- PostgreSQL can handle payment receipt tracking (lower scale than full event index)
- Git operations map cleanly to Nostr events (validated by NIP-34 spec)
- Arweave provides sufficient data availability guarantees
- Backend only needed for writes, not reads (much lower scale)

**Relay Assumptions:**
- Public relays will serve NIP-34 events (not specialized/paid-only relays)
- Relays implement efficient tag-based filtering per NIP-01 spec
- At least 50% of relays in our default list stay online at any time
- Relays don't censor NIP-34 events (or we can route around censoring relays)

**Discovery Assumptions:**
- **No search backend needed** - NIP-01 relay filtering + client-side filtering sufficient for MVP
- Relay filtering provides adequate performance for repository discovery
- Users accept eventual consistency (new repos appear within 30 seconds across network)
- 100-1000 repositories discoverable with client-side pagination and filtering

**Market:**
- Demand exists for decentralized code hosting
- Nostr ecosystem continues to grow (currently 10M+ users)
- Regulatory environment allows microtransactions
- Developer community values open protocols over proprietary platforms

---

## Appendix

### A. Glossary

**Arweave:** Permanent, decentralized storage network using proof-of-access consensus

**ILP (Interledger Protocol):** Protocol for sending payments across different payment networks

**Lightning Network:** Layer 2 Bitcoin payment protocol for instant micropayments

**NIP (Nostr Implementation Possibility):** Standards for Nostr protocol extensions

**NIP-34:** Standard for git operations on Nostr

**Nostr:** "Notes and Other Stuff Transmitted by Relays" - decentralized social protocol

**Relay:** Server that stores and forwards Nostr events

**Satoshi (sat):** Smallest unit of Bitcoin (0.00000001 BTC)

**Schnorr signature:** Cryptographic signature scheme used by Nostr (secp256k1)

**Web Monetization:** W3C standard for streaming micropayments to websites

### B. Reference Links

**Nostr:**
- NIP-34 Specification: https://github.com/nostr-protocol/nips/blob/master/34.md
- NIP-01 (Basic Protocol): https://github.com/nostr-protocol/nips/blob/master/01.md
- go-nostr Library: https://github.com/nbd-wtf/go-nostr

**Arweave:**
- Arweave Docs: https://docs.arweave.org/
- Bundlr/Irys: https://docs.bundlr.network/
- ArDrive: https://ardrive.io/

**ILP:**
- Interledger.org: https://interledger.org/
- Rafiki: https://rafiki.dev/
- Web Monetization: https://webmonetization.org/

**Git:**
- git-format-patch: https://git-scm.com/docs/git-format-patch
- Git Protocol: https://git-scm.com/book/en/v2/Git-Internals-Transfer-Protocols

### C. Competitive Analysis

**GitHub/GitLab (Traditional):**
- ✅ Pros: Feature-rich, established, free tiers
- ❌ Cons: Centralized, censorship risk, platform lock-in
- 🎯 Our Advantage: Censorship resistance, permanence, data ownership

**Radicle (P2P Git):**
- ✅ Pros: Decentralized, peer-to-peer
- ❌ Cons: Complex setup, no spam prevention, limited adoption
- 🎯 Our Advantage: Easier UX, spam prevention, standards-based

**IPFS Git Remote:**
- ✅ Pros: Content-addressed storage
- ❌ Cons: No coordination layer, no collaboration tools
- 🎯 Our Advantage: Full collaboration suite, event-based coordination

**Gitea/Forgejo (Self-hosted):**
- ✅ Pros: Self-hosted, open source
- ❌ Cons: Still centralized per instance, no permanence guarantee
- 🎯 Our Advantage: We extend Forgejo with decentralization

### D. User Research Findings

*(To be added after user interviews)*

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-23 | Jonathan Green, Claude | Initial draft |

---

## Approval

**Product Owner:** _______________________  Date: __________

**Engineering Lead:** _______________________  Date: __________

**Legal Review:** _______________________  Date: __________

---

*End of Document*
