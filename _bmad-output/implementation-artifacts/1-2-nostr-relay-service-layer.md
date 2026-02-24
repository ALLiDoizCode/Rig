# Story 1.2: Nostr Relay Service Layer

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **a service layer that connects to multiple Nostr relays and queries NIP-34 events**,
So that **the application can fetch decentralized repository data from the Nostr network**.

## Acceptance Criteria

**Given** The project is initialized (Story 1.1 complete)
**When** I implement the Nostr service layer in src/lib/nostr.ts
**Then** The service provides a shared SimplePool instance from nostr-tools

**And** The service connects to the configured relay list:
- wss://relay.damus.io
- wss://nos.lol
- wss://relay.nostr.band
(Static relay pool per Architecture decision)

**And** The service provides functions for querying NIP-34 event kinds:
- fetchRepositories() → queries kind 30617 events
- fetchIssues() → queries kind 1621 events
- fetchPullRequests() → queries kind 1618 events
- fetchPatches() → queries kind 1617 events
- fetchComments() → queries kind 1622 events

**And** All Nostr events are signature-verified using verifyEvent() from nostr-tools (per NFR-S1)

**And** Invalid event signatures are rejected with clear error messages (per NFR-S3)

**And** Failed relay queries timeout within 2 seconds (per NFR-P8)

**And** The service races queries across all relays in parallel and uses the first successful response (per NFR-P7)

**And** Constants are defined in src/constants/nostr.ts:
```typescript
export const REPO_ANNOUNCEMENT = 30617
export const ISSUE = 1621
export const PULL_REQUEST = 1618
export const PATCH = 1617
export const COMMENT = 1622
export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band'
]
```

**And** Unit tests verify:
- SimplePool connection handling
- Event signature verification
- Timeout behavior
- Parallel relay querying

## Tasks / Subtasks

- [x] Create Nostr constants file (AC: Constants defined)
  - [x] Create `rig-frontend/src/constants/nostr.ts`
  - [x] Define NIP-34 event kind constants (REPO_ANNOUNCEMENT, ISSUE, PULL_REQUEST, PATCH, COMMENT)
  - [x] Define DEFAULT_RELAYS array with hardcoded relay URLs
  - [x] Add JSDoc comments explaining each constant

- [x] Create Nostr service layer (AC: Service provides shared SimplePool)
  - [x] Create `rig-frontend/src/lib/nostr.ts`
  - [x] Import SimplePool from nostr-tools
  - [x] Create and export a single shared SimplePool instance
  - [x] Configure SimplePool with DEFAULT_RELAYS
  - [x] Enable automatic reconnection (enableReconnect: true)
  - [x] Enable ping for connection health monitoring (enablePing: true)

- [x] Implement fetchRepositories function (AC: Query kind 30617 events)
  - [x] Create fetchRepositories() async function
  - [x] Use pool.querySync() to query kind 30617 events across all relays
  - [x] Set timeout to 2 seconds via maxWait parameter (NFR-P8)
  - [x] Filter events with verifyEvent() signature validation (NFR-S1)
  - [x] Log warnings for invalid signatures (NFR-S3)
  - [x] Return array of validated events
  - [x] Handle errors with structured RigError

- [x] Implement fetch functions for other NIP-34 event types (AC: Query all event kinds)
  - [x] Create fetchIssues(repoId: string) for kind 1621
  - [x] Create fetchPullRequests(repoId: string) for kind 1618
  - [x] Create fetchPatches(repoId: string) for kind 1617
  - [x] Create fetchComments(eventId: string) for kind 1622
  - [x] All functions follow same pattern: query, verify signatures, timeout, return validated events

- [x] Implement parallel relay racing (AC: Races queries across relays, uses first response)
  - [x] pool.querySync() already implements parallel querying across all relays
  - [x] Verify timeout behavior works correctly (2 seconds per NFR-P8)
  - [x] Test that first successful response is used

- [x] Create unit tests for Nostr service (AC: Unit tests verify all behaviors)
  - [x] Create `rig-frontend/src/lib/nostr.test.ts`
  - [x] Mock SimplePool from nostr-tools
  - [x] Test: fetchRepositories returns validated events
  - [x] Test: Invalid signatures are rejected and logged
  - [x] Test: Timeout behavior (2 second limit)
  - [x] Test: All fetch functions query correct event kinds
  - [x] Test: Error handling returns structured RigError

- [x] Create unit tests for constants (AC: Constants defined correctly)
  - [x] Create `rig-frontend/src/constants/nostr.test.ts`
  - [x] Test: Event kind constants have correct values
  - [x] Test: DEFAULT_RELAYS contains expected relay URLs
  - [x] Test: DEFAULT_RELAYS are valid WebSocket URLs

- [x] Integration verification (AC: All acceptance criteria met)
  - [x] Verify all 5 fetch functions are exported from lib/nostr.ts
  - [x] Verify constants are exported from constants/nostr.ts
  - [x] Run all tests and ensure they pass
  - [x] Verify TypeScript compiles with no errors
  - [x] Build project and verify bundle size impact is minimal

## Dev Notes

### Critical Mission
🔥 **This is the CORE DATA LAYER for the entire Rig application!** 🔥
- ALL features depend on this Nostr service layer
- This establishes the P2P decentralized communication foundation
- Signature validation prevents malicious data from entering the system
- Timeout and parallel querying ensure good UX even with flaky relays

### Project Context
**Rig** is a decentralized, censorship-resistant code collaboration platform. This story implements the **Layer 1 (Nostr)** of the three-layer architecture:
1. **Nostr (Identity & Metadata)**: Repository announcements, issues, PRs, comments via NIP-34 events ← **THIS STORY**
2. **ArNS (Naming)**: Permanent user-friendly URLs like `user.ar/repo`
3. **Arweave (Storage)**: Permanent, immutable storage for git objects and source code

### Nostr Protocol Overview
**NIP-34 (Nostr Implementation Possibility 34)** defines git-related event kinds:
- **kind 30617**: Repository announcement (parameterized replaceable event)
- **kind 1621**: Issue
- **kind 1618**: Pull request
- **kind 1617**: Patch
- **kind 1622**: Comment (generic, used for issues/PRs)

All events are signed with secp256k1 cryptographic signatures, ensuring authenticity and tamper-resistance.

### Service Layer Responsibilities
This service layer:
1. **Connects to multiple Nostr relays** via SimplePool WebSocket connections
2. **Queries NIP-34 events** from relays using event kind filters
3. **Validates event signatures** using verifyEvent() to prevent spoofed data
4. **Races queries across relays** in parallel for best performance
5. **Returns validated events** to calling code (hooks, transformers, etc.)

This layer does NOT:
- Transform events into domain models (that's done in lib/transformers/)
- Cache events (that's done in lib/cache.ts via TanStack Query)
- Manage subscriptions (that's done in feature-specific useRealtime* hooks)

## Technical Requirements

### Required Technology Versions
**CRITICAL: Use these exact versions**
- **nostr-tools**: Latest stable (already installed in Story 1.1)
  - Version installed: Check `rig-frontend/package.json`
  - Latest version (2026): ^2.x or latest on npm
  - Documentation: https://github.com/nbd-wtf/nostr-tools

### nostr-tools SimplePool API
**SimplePool** is the core class for multi-relay communication:

```typescript
import { SimplePool } from 'nostr-tools/pool'

const pool = new SimplePool({
  enableReconnect: true,  // Auto-reconnect on WebSocket disconnect
  enablePing: true        // Send periodic pings for connection health
})

// Query events from multiple relays (races in parallel)
const events = await pool.list(
  ['wss://relay.damus.io', 'wss://nos.lol'],
  [{ kinds: [30617], limit: 100 }],
  { timeout: 2000 }
)

// Subscribe to real-time events
const sub = pool.subscribeMany(
  ['wss://relay.damus.io'],
  [{ kinds: [1621], '#a': ['owner/repo'] }],
  {
    onevent: (event) => { /* handle event */ },
    oneose: () => { /* end of stored events */ }
  }
)

// Close subscription
sub.close()
```

### verifyEvent API Usage
**verifyEvent** validates Nostr event signatures:

```typescript
import { verifyEvent } from 'nostr-tools/pure'

const isValid = verifyEvent(event)
if (!isValid) {
  console.warn('Invalid signature:', event.id)
  return null  // Reject event
}
```

**Performance**: Pure JavaScript implementation is sufficient for this application. WASM optimization is available but not necessary for MVP.

### Event Query Patterns
**Filtering events** by kind and tags:

```typescript
// Query all repository announcements
const repos = await pool.list(relays, [{ kinds: [30617], limit: 100 }])

// Query issues for specific repository
const issues = await pool.list(relays, [
  { kinds: [1621], '#a': ['<repo-reference>'], limit: 50 }
])

// Query comments for specific event
const comments = await pool.list(relays, [
  { kinds: [1622], '#e': ['<event-id>'] }
])
```

### Timeout and Error Handling
**Timeout** queries to prevent blocking UI:

```typescript
try {
  const events = await pool.list(relays, filters, { timeout: 2000 })
  return events.filter(event => verifyEvent(event))
} catch (err) {
  throw {
    code: 'RELAY_TIMEOUT',
    message: `Relay query timed out: ${err.message}`,
    userMessage: 'Unable to connect to Nostr relays. Retrying...',
    context: { relays }
  } as RigError
}
```

## Architecture Compliance

### Architectural Decisions Implemented

**1. Nostr Relay Strategy (Architecture.md lines 754-758)**
- ✅ **Decision**: Static relay pool with 3-5 hardcoded reliable relays
- ✅ **Implementation**: Hardcode relay URLs in `constants/nostr.ts`
- ✅ **Relays**: relay.damus.io, nos.lol, relay.nostr.band
- ✅ **Rationale**: Immediate reliability without configuration UI complexity

**2. Event Signature Validation (Architecture.md lines 785-789)**
- ✅ **Decision**: Always validate Nostr event signatures
- ✅ **Implementation**: Use `verifyEvent()` from nostr-tools on all received events
- ✅ **Rationale**: Prevents spoofed/tampered events from untrusted relays
- ✅ **Performance**: Small overhead per event, acceptable for security

**3. Relay Connection Pooling (Architecture.md lines 817-820)**
- ✅ **Decision**: Single shared SimplePool instance
- ✅ **Implementation**: One `SimplePool` from nostr-tools for entire application
- ✅ **Rationale**: Efficient connection reuse, handles reconnects
- ✅ **Lifecycle**: Created at module load, reused across all features

**4. Error Handling Strategy (Architecture.md lines 800-807)**
- ✅ **Decision**: Graceful degradation with user feedback
- ✅ **Implementation**: Throw structured RigError objects with user messages
- ✅ **Pattern**: Service layer throws errors, hooks propagate, components display

### Implementation Patterns from Architecture.md

**Naming Conventions (lines 968-1012):**
```typescript
// ✅ Correct
// constants/nostr.ts
export const REPO_ANNOUNCEMENT = 30617  // SCREAMING_SNAKE_CASE
export const DEFAULT_RELAYS = [...]      // SCREAMING_SNAKE_CASE

// lib/nostr.ts
export async function fetchRepositories() { ... }  // camelCase

// types/nostr.ts
export interface NostrEvent { ... }  // PascalCase
```

**Service Layer Pattern (lines 1568-1575):**
- **Responsibility**: All Nostr relay communication, event queries
- **Exports**: fetchRepositories(), fetchIssues(), fetchPullRequests(), etc.
- **Dependencies**: nostr-tools SimplePool, constants/nostr.ts
- **Boundary**: Returns raw NostrEvent[] (domain transformation happens in lib/transformers/)
- **Validation**: Performs signature validation (verifyEvent()) at service boundary

**Event Validation Timing (lines 1263-1294):**
- ✅ Validate at service layer (early, single entry point)
- ✅ Signature validation first: verifyEvent() from nostr-tools
- ✅ Filter out invalid events before returning
- ✅ Components receive guaranteed-valid events

**Error Structure Format (lines 1100-1124):**
```typescript
// types/common.ts
export interface RigError {
  code: 'RELAY_TIMEOUT' | 'VALIDATION_FAILED' | 'GATEWAY_ERROR' | 'SIGNATURE_INVALID'
  message: string        // Technical details for logging
  userMessage: string    // User-friendly message for UI
  context?: Record<string, unknown>
}
```

## Library & Framework Requirements

### nostr-tools Dependency
**Already installed in Story 1.1** - Check `rig-frontend/package.json`:
```json
{
  "dependencies": {
    "nostr-tools": "^2.x.x"
  }
}
```

### Key Imports
```typescript
// Pool for multi-relay connections
import { SimplePool } from 'nostr-tools/pool'

// Event signature verification (pure JS implementation)
import { verifyEvent } from 'nostr-tools/pure'

// Event types
import type { Event as NostrEvent } from 'nostr-tools'
```

### No Additional Dependencies
This story uses only nostr-tools (already installed). No new npm packages needed.

## File Structure Requirements

### Files to Create

**1. `rig-frontend/src/constants/nostr.ts`**
Purpose: Define NIP-34 event kind constants and relay URLs

**2. `rig-frontend/src/lib/nostr.ts`**
Purpose: Nostr service layer with SimplePool and fetch functions

**3. `rig-frontend/src/lib/nostr.test.ts`**
Purpose: Unit tests for Nostr service layer

**4. `rig-frontend/src/constants/nostr.test.ts`**
Purpose: Unit tests for Nostr constants

### Expected File Structure After This Story
```
rig-frontend/
├── src/
│   ├── constants/
│   │   ├── nostr.ts           ← NEW: Event kinds and relay URLs
│   │   └── nostr.test.ts      ← NEW: Tests for constants
│   ├── lib/
│   │   ├── nostr.ts           ← NEW: Nostr service layer
│   │   ├── nostr.test.ts      ← NEW: Tests for service
│   │   ├── utils.ts           (existing from Story 1.1)
│   │   └── ...
```

### Implementation Templates

**constants/nostr.ts:**
```typescript
/**
 * NIP-34 Event Kind Constants
 *
 * NIP-34 defines git-related event kinds for decentralized code collaboration.
 * See: https://github.com/nostr-protocol/nips/blob/master/34.md
 */

/** Repository announcement (kind 30617) - Parameterized replaceable event */
export const REPO_ANNOUNCEMENT = 30617

/** Issue (kind 1621) - Regular event */
export const ISSUE = 1621

/** Pull request (kind 1618) - Regular event */
export const PULL_REQUEST = 1618

/** Patch (kind 1617) - Regular event containing git diff */
export const PATCH = 1617

/** Comment (kind 1622) - Generic comment for issues/PRs */
export const COMMENT = 1622

/**
 * Default Nostr Relay URLs
 *
 * Static relay pool with 3 hardcoded reliable relays.
 * Multi-relay setup provides redundancy and censorship resistance.
 */
export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band'
]
```

**lib/nostr.ts:**
```typescript
import { SimplePool } from 'nostr-tools/pool'
import { verifyEvent } from 'nostr-tools/pure'
import type { Event as NostrEvent, Filter } from 'nostr-tools'
import {
  REPO_ANNOUNCEMENT,
  ISSUE,
  PULL_REQUEST,
  PATCH,
  COMMENT,
  DEFAULT_RELAYS
} from '@/constants/nostr'
import type { RigError } from '@/types/common'

/**
 * Shared SimplePool instance for all Nostr relay connections.
 *
 * Configured with automatic reconnection and ping for connection health.
 * Reused across the entire application for efficient connection management.
 */
export const pool = new SimplePool({
  enableReconnect: true,  // Auto-reconnect on WebSocket disconnect
  enablePing: true        // Send periodic pings for connection health
})

/**
 * Query events from Nostr relays with signature verification
 *
 * @param filters - Nostr event filters (kinds, tags, etc.)
 * @param timeout - Query timeout in milliseconds (default: 2000ms per NFR-P8)
 * @returns Validated NostrEvent array
 * @throws RigError with code 'RELAY_TIMEOUT' or 'SIGNATURE_INVALID'
 */
async function queryEvents(
  filters: Filter[],
  timeout = 2000
): Promise<NostrEvent[]> {
  try {
    const events = await pool.list(DEFAULT_RELAYS, filters, { timeout })

    // Signature validation (NFR-S1)
    const validatedEvents = events.filter(event => {
      const isValid = verifyEvent(event)
      if (!isValid) {
        // Log warning for invalid signatures (NFR-S3)
        console.warn('Invalid signature rejected:', event.id)
      }
      return isValid
    })

    return validatedEvents
  } catch (err) {
    throw {
      code: 'RELAY_TIMEOUT',
      message: `Relay query failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      userMessage: 'Unable to connect to Nostr relays. Retrying...',
      context: { relays: DEFAULT_RELAYS, filters }
    } as RigError
  }
}

/**
 * Fetch repository announcements (kind 30617)
 *
 * @param limit - Maximum number of repositories to fetch (default: 100)
 * @returns Array of validated repository announcement events
 */
export async function fetchRepositories(limit = 100): Promise<NostrEvent[]> {
  return queryEvents([{ kinds: [REPO_ANNOUNCEMENT], limit }])
}

/**
 * Fetch issues for a specific repository (kind 1621)
 *
 * @param repoId - Repository identifier (typically 'd' tag value)
 * @param limit - Maximum number of issues to fetch (default: 50)
 * @returns Array of validated issue events
 */
export async function fetchIssues(repoId: string, limit = 50): Promise<NostrEvent[]> {
  return queryEvents([{ kinds: [ISSUE], '#a': [repoId], limit }])
}

/**
 * Fetch pull requests for a specific repository (kind 1618)
 *
 * @param repoId - Repository identifier
 * @param limit - Maximum number of PRs to fetch (default: 50)
 * @returns Array of validated pull request events
 */
export async function fetchPullRequests(repoId: string, limit = 50): Promise<NostrEvent[]> {
  return queryEvents([{ kinds: [PULL_REQUEST], '#a': [repoId], limit }])
}

/**
 * Fetch patches for a specific repository (kind 1617)
 *
 * @param repoId - Repository identifier
 * @param limit - Maximum number of patches to fetch (default: 50)
 * @returns Array of validated patch events
 */
export async function fetchPatches(repoId: string, limit = 50): Promise<NostrEvent[]> {
  return queryEvents([{ kinds: [PATCH], '#a': [repoId], limit }])
}

/**
 * Fetch comments for a specific event (kind 1622)
 *
 * Comments use NIP-10 threading via 'e' tags.
 *
 * @param eventId - Event ID to fetch comments for
 * @param limit - Maximum number of comments to fetch (default: 100)
 * @returns Array of validated comment events
 */
export async function fetchComments(eventId: string, limit = 100): Promise<NostrEvent[]> {
  return queryEvents([{ kinds: [COMMENT], '#e': [eventId], limit }])
}
```

## Testing Requirements

### Unit Test Strategy
- **Service Layer Tests**: Mock SimplePool, test all fetch functions
- **Signature Validation Tests**: Test verifyEvent rejection of invalid events
- **Timeout Tests**: Test 2-second timeout behavior
- **Error Handling Tests**: Test structured RigError thrown on failures

### Test File: `lib/nostr.test.ts`
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchRepositories, fetchIssues, pool } from './nostr'
import * as nostrTools from 'nostr-tools/pure'

// Mock nostr-tools
vi.mock('nostr-tools/pool', () => ({
  SimplePool: vi.fn(() => ({
    list: vi.fn(),
    subscribeMany: vi.fn(),
    close: vi.fn()
  }))
}))

describe('Nostr Service Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchRepositories', () => {
    it('should query kind 30617 events', async () => {
      const mockEvents = [
        { id: '1', kind: 30617, content: 'test', pubkey: 'abc', sig: '123', tags: [], created_at: 123 }
      ]

      vi.spyOn(pool, 'list').mockResolvedValue(mockEvents)
      vi.spyOn(nostrTools, 'verifyEvent').mockReturnValue(true)

      const result = await fetchRepositories()

      expect(pool.list).toHaveBeenCalledWith(
        expect.arrayContaining(['wss://relay.damus.io']),
        [{ kinds: [30617], limit: 100 }],
        { timeout: 2000 }
      )
      expect(result).toEqual(mockEvents)
    })

    it('should reject events with invalid signatures', async () => {
      const mockEvents = [
        { id: '1', kind: 30617, content: 'valid', pubkey: 'abc', sig: 'valid', tags: [], created_at: 123 },
        { id: '2', kind: 30617, content: 'invalid', pubkey: 'def', sig: 'bad', tags: [], created_at: 456 }
      ]

      vi.spyOn(pool, 'list').mockResolvedValue(mockEvents)
      vi.spyOn(nostrTools, 'verifyEvent')
        .mockReturnValueOnce(true)   // First event valid
        .mockReturnValueOnce(false)  // Second event invalid

      const result = await fetchRepositories()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should timeout after 2 seconds', async () => {
      vi.spyOn(pool, 'list').mockRejectedValue(new Error('Timeout'))

      await expect(fetchRepositories()).rejects.toMatchObject({
        code: 'RELAY_TIMEOUT',
        userMessage: expect.stringContaining('Unable to connect')
      })
    })
  })

  // Similar tests for fetchIssues, fetchPullRequests, fetchPatches, fetchComments
})
```

### Test Coverage Goals
- **Line Coverage**: >80% for lib/nostr.ts
- **Branch Coverage**: >75% (test both success and error paths)
- **All Functions**: Every exported function has at least 2 tests

### Running Tests
```bash
cd rig-frontend
npm test                    # Run all tests
npm test nostr             # Run only nostr tests
npm run coverage           # Generate coverage report
```

## References

### Architecture Document
- **Source**: `_bmad-output/planning-artifacts/architecture.md`
- **Key Sections**:
  - "Nostr Relay Strategy" (lines 754-758)
  - "Event Signature Validation" (lines 785-789)
  - "Relay Connection Pooling" (lines 817-820)
  - "Error Handling Strategy" (lines 800-807)
  - "Service Layer Boundaries" (lines 1568-1575)
  - "Implementation Patterns" (lines 954-1359)

### Epics Document
- **Source**: Epic 1, Story 1.2 (lines 841-907 in epics.md)
- **Technical Implementation Notes**: Use nostr-tools SimplePool for connection management
- **References**: NFR-S1, NFR-P7, NFR-P8, NFR-I6

### Related Stories
- **Previous Story**: 1.1 (Project Initialization) - DONE ✅
- **Next Story**: 1.3 (Arweave & ar.io Gateway Integration)
- **Dependent Stories**: ALL data-fetching features depend on this service layer

### NFR References
- **NFR-S1**: Event signature verification (verifyEvent())
- **NFR-S3**: Invalid signatures rejected with clear error messages
- **NFR-P7**: Multi-relay query racing (SimplePool races queries in parallel)
- **NFR-P8**: Timeout within 2s (prevents blocking UI)
- **NFR-I6**: WebSocket auto-reconnection (enableReconnect: true)

### External Documentation
- **nostr-tools GitHub**: https://github.com/nbd-wtf/nostr-tools
- **nostr-tools npm**: https://www.npmjs.com/package/nostr-tools
- **nostr-tools JSR Docs**: https://jsr.io/@nostr/tools/doc
- **NIP-01** (Basic Protocol): https://github.com/nostr-protocol/nips/blob/master/01.md
- **NIP-34** (Git Events): https://github.com/nostr-protocol/nips/blob/master/34.md
- **Nostr Protocol Overview**: https://nostr.how/en/the-protocol
- **LearnNostr nostr-tools Guide**: https://www.learnnostr.org/getting-started/nostr-tools

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Implementation Notes

**Implementation Approach:**
Successfully implemented the Nostr relay service layer following TDD (Test-Driven Development) methodology:
1. **RED Phase**: Wrote failing tests first for all functionality
2. **GREEN Phase**: Implemented minimal code to pass tests
3. **REFACTOR Phase**: Code was clean from the start, minimal refactoring needed

**Key Technical Decisions:**
- **API Discovery**: Discovered that nostr-tools v2.23.1 uses `querySync()` instead of `list()` method
  - Used `maxWait` parameter instead of `timeout` for query timeout
  - This was not documented in the story but discovered through type definitions
- **Type Safety**: Added explicit type annotation `(event: NostrEvent)` in filter callback to resolve implicit any error
- **Error Handling**: Implemented RigError structure as specified in Architecture.md for consistent error handling
- **Created types/common.ts**: Added RigError interface as it didn't exist yet (required for error handling)

**Architecture Compliance:**
- ✅ Static relay pool with 3 hardcoded relays (Architecture decision)
- ✅ Event signature validation using verifyEvent() on all events (NFR-S1)
- ✅ 2-second timeout via maxWait parameter (NFR-P8)
- ✅ Parallel relay querying built into SimplePool.querySync() (NFR-P7)
- ✅ Graceful error handling with structured RigError objects
- ✅ Follows naming conventions: SCREAMING_SNAKE_CASE for constants, camelCase for functions

**Test Coverage:**
- 10 tests for constants (all event kinds, relay URLs, validation)
- 10 tests for service layer (fetch functions, signature validation, timeout, error handling)
- **Total: 30 new tests, all passing** (expanded from 20 during code review)
- **No regressions**: All existing tests (App.test.tsx) continue to pass

### Completion Checklist

- [x] constants/nostr.ts created with all event kinds and DEFAULT_RELAYS
- [x] lib/nostr.ts created with SimplePool and all 5 fetch functions
- [x] All functions use verifyEvent() for signature validation
- [x] Timeout set to 2 seconds via maxWait (NFR-P8)
- [x] Structured RigError thrown on failures
- [x] Unit tests created for lib/nostr.ts
- [x] Unit tests created for constants/nostr.ts
- [x] All tests passing (32/32 tests pass after code review expansion)
- [x] TypeScript compiles with zero errors
- [x] Code follows architectural patterns (naming, structure, validation)

### Files Created/Modified

**Created:**
- `rig-frontend/src/constants/nostr.ts` - NIP-34 event kind constants and relay URLs
- `rig-frontend/src/constants/nostr.test.ts` - Unit tests for constants (10 tests)
- `rig-frontend/src/lib/nostr.ts` - Nostr service layer with SimplePool and fetch functions
- `rig-frontend/src/lib/nostr.test.ts` - Unit tests for service layer (20 tests after review expansion)
- `rig-frontend/src/types/common.ts` - RigError interface for error handling

**Modified (during code review):**
- `rig-frontend/src/lib/nostr.ts` - Fixed error handling, removed pool export, corrected userMessage
- `rig-frontend/src/lib/nostr.test.ts` - Added 10 new tests for error paths, signature rejection, console.warn, and constructor config

### Debug Notes

**Issue 1: SimplePool API Mismatch**
- **Problem**: Initial implementation used `pool.list()` based on story template, but TypeScript build failed with "Property 'list' does not exist on type 'SimplePool'"
- **Root Cause**: nostr-tools v2.23.1 uses `querySync()` method, not `list()`
- **Solution**: Updated implementation and tests to use `querySync()` with `maxWait` parameter instead of `timeout`
- **Files Affected**: lib/nostr.ts, lib/nostr.test.ts

**Issue 2: Implicit Any Type Error**
- **Problem**: TypeScript error "Parameter 'event' implicitly has an 'any' type"
- **Solution**: Added explicit type annotation `(event: NostrEvent)` in filter callback
- **Files Affected**: lib/nostr.ts

**Issue 3: Test Mock Configuration**
- **Problem**: Initial mock setup didn't properly instantiate SimplePool as a constructor
- **Solution**: Updated mock to return mockPoolInstance from constructor function
- **Files Affected**: lib/nostr.test.ts

**Bundle Size Impact:**
- Total bundle: 225.31 kB (71.03 kB gzipped)
- Minimal impact considering nostr-tools cryptographic functionality
- Acceptable for MVP stage

### Latest Technical Information (Web Research)

**nostr-tools Version**: Latest stable (2.x as of 2026)
- **Installation**: Already installed in Story 1.1 via `npm install nostr-tools`
- **SimplePool API**:
  - `enableReconnect: true` for automatic reconnection on WebSocket disconnect
  - `enablePing: true` for connection health monitoring
  - `pool.list()` automatically races queries across all relays in parallel (NFR-P7)
  - Timeout can be set via options: `{ timeout: 2000 }` (NFR-P8)

**verifyEvent Usage**:
- Import from `nostr-tools/pure` for pure JavaScript implementation
- Returns boolean: `true` if signature valid, `false` if invalid
- Pure JS implementation is sufficient (WASM optimization not needed for MVP)
- Usage: `const isValid = verifyEvent(event)`

**Performance Considerations**:
- Pure JS signature verification: acceptable overhead for security
- WASM implementation available but not necessary
- Parallel relay querying provides <2s query times in most cases

**Sources**:
- [nostr-tools - npm](https://www.npmjs.com/package/nostr-tools)
- [GitHub - nbd-wtf/nostr-tools](https://github.com/nbd-wtf/nostr-tools)
- [nostr-tools README.md](https://github.com/nbd-wtf/nostr-tools/blob/master/README.md)
- [JSR nostr-tools Documentation](https://jsr.io/@nostr/tools)
- [LearnNostr - Understanding Nostr Events](https://learnnostr.org/tutorials/understanding-events)
- [LearnNostr - Nostr Tools Guide](https://www.learnnostr.org/getting-started/nostr-tools)
- [The Nostr Protocol](https://nostr.how/en/the-protocol)

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.6
**Date:** 2026-02-24
**Outcome:** Approved (after fixes applied)

### Issues Found: 3 High, 3 Medium, 3 Low

**All HIGH and MEDIUM issues were fixed during review.**

#### HIGH Issues (Fixed)

1. **H1: Misleading userMessage "Retrying..."** (`lib/nostr.ts:54`) - Error message claimed retry behavior that didn't exist. Fixed to "Please try again."
2. **H2: All errors thrown as RELAY_TIMEOUT** (`lib/nostr.ts:51-58`) - Catch block always used RELAY_TIMEOUT code regardless of error type. Fixed to differentiate RELAY_TIMEOUT vs GATEWAY_ERROR based on error message.
3. **H3: Pool instance exported without encapsulation** (`lib/nostr.ts:20`) - `export const pool` allowed bypass of signature validation. Fixed by removing export; tests updated to mock at module boundary.

#### MEDIUM Issues (Fixed)

4. **M1: Thin test coverage for error paths** - fetchIssues, fetchPullRequests, fetchPatches, fetchComments only had happy-path tests. Added signature rejection and error-path tests for each.
5. **M2: No console.warn test for invalid signatures** - NFR-S3 "clear error messages" was untested. Added test verifying console.warn is called with event ID.
6. **M3: SimplePool constructor config not verified** - enableReconnect/enablePing were untested. Added test capturing and verifying constructor arguments.

#### LOW Issues (Not Fixed - Acceptable for MVP)

7. **L1: No input validation on repoId/eventId** - Empty strings silently produce empty results.
8. **L2: No pool cleanup function** - No closePool/destroyPool export for WebSocket cleanup.
9. **L3: DEFAULT_RELAYS array mutable** - Could use `as const` for immutability.

### Review Summary

- **Tests:** 22 -> 32 (10 new tests added)
- **All 32 tests passing, TypeScript compiles clean**
- **All Acceptance Criteria verified as implemented**
- **All tasks marked [x] verified as actually done**
- **Git vs Story File List: No discrepancies**
