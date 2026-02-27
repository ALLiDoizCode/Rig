# Story 1.8: Type Definitions & Validation Schemas

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **comprehensive TypeScript type definitions and Zod validation schemas for NIP-34 events and domain models**,
so that **the application has type safety and runtime validation for all decentralized data**.

## Acceptance Criteria

1. **Type files created in `src/types/`** with domain-organized structure:
   - `nostr.ts` — NIP-34 base event type, Nostr relay types, Zod schemas for all event kinds
   - `repository.ts` — Repository domain model (transformed from kind 30617)
   - `issue.ts` — Issue and Comment domain models (from kinds 1621, 1622)
   - `pull-request.ts` — PullRequest domain model (from kind 1618)
   - `patch.ts` — Patch domain model (from kind 1617)
   - `index.ts` — Barrel re-export of all types

2. **Zod validation schemas defined for all NIP-34 event kinds:**
   - `RepoAnnouncementEventSchema` (kind 30617)
   - `RepoStateEventSchema` (kind 30618)
   - `IssueEventSchema` (kind 1621)
   - `PullRequestEventSchema` (kind 1618)
   - `PatchEventSchema` (kind 1617)
   - `CommentEventSchema` (kind 1622)
   - `StatusEventSchema` (kinds 1630-1633)

3. **Domain model interfaces** defined for all entity types:
   - `Repository` — Transformed from kind 30617 with parsed tags
   - `Issue` — Transformed from kind 1621 with status derivation
   - `PullRequest` — Transformed from kind 1618 with status derivation
   - `Patch` — Transformed from kind 1617 with commit metadata
   - `Comment` — Transformed from kind 1622 with NIP-10 threading
   - `StatusEvent` — Parsed status from kinds 1630-1633

4. **RigError interface extended** (already exists in `common.ts`) — verify completeness

5. **All types importable** from `@/types` via barrel export in `index.ts`

6. **TypeScript strict mode compiles with zero errors**

7. **Unit tests verify:**
   - Zod schema validation accepts valid NIP-34 events
   - Zod schema validation rejects malformed events
   - All type exports accessible from `@/types`
   - Domain model interfaces cover all required fields

## Tasks / Subtasks

- [x] Task 1: Create/update Nostr event types and Zod schemas in `src/types/nostr.ts` (AC: #2)
  - [x] 1.1 Define base `NostrEvent` interface matching nostr-tools Event type
  - [x] 1.2 Define `NostrTag` type alias for tag arrays
  - [x] 1.3 Create `RepoAnnouncementEventSchema` (kind 30617) with all required/optional tags
  - [x] 1.4 Create `RepoStateEventSchema` (kind 30618)
  - [x] 1.5 Create `PatchEventSchema` (kind 1617) with commit metadata tags
  - [x] 1.6 Create `PullRequestEventSchema` (kind 1618) with subject, clone, branch tags
  - [x] 1.7 Create `IssueEventSchema` (kind 1621) with subject and label tags
  - [x] 1.8 Create `CommentEventSchema` (kind 1622) with NIP-10 threading tags
  - [x] 1.9 Create `StatusEventSchema` (kinds 1630-1633) with merge/applied tags
  - [x] 1.10 Export inferred TypeScript types from each schema
  - [x] 1.11 Write tests: `src/types/nostr.test.ts`
- [x] Task 2: Create Repository domain model in `src/types/repository.ts` (AC: #3)
  - [x] 2.1 Define `Repository` interface with all parsed fields
  - [x] 2.2 Write tests: `src/types/repository.test.ts`
- [x] Task 3: Create Issue and Comment domain models in `src/types/issue.ts` (AC: #3)
  - [x] 3.1 Define `Issue` interface with status derivation field
  - [x] 3.2 Define `Comment` interface with NIP-10 thread fields (rootId, replyToId)
  - [x] 3.3 Write tests: `src/types/issue.test.ts`
- [x] Task 4: Create PullRequest domain model in `src/types/pull-request.ts` (AC: #3)
  - [x] 4.1 Define `PullRequest` interface with commit/clone/branch metadata
  - [x] 4.2 Write tests: `src/types/pull-request.test.ts`
- [x] Task 5: Create Patch domain model in `src/types/patch.ts` (AC: #3)
  - [x] 5.1 Define `Patch` interface with commit/committer metadata
  - [x] 5.2 Write tests: `src/types/patch.test.ts`
- [x] Task 6: Update barrel export in `src/types/index.ts` (AC: #5)
  - [x] 6.1 Re-export all types from nostr, repository, issue, pull-request, patch
  - [x] 6.2 Preserve existing exports (common, arweave, cache)
- [x] Task 7: Verify RigError completeness in `src/types/common.ts` (AC: #4)
  - [x] 7.1 Verify all 5 error codes present, add any missing
- [x] Task 8: Run full test suite, ensure zero TypeScript errors (AC: #6, #7)
  - [x] 8.1 Run `npx vitest run` — all tests pass
  - [x] 8.2 Run `npx tsc --noEmit` — zero errors

## Dev Notes

### CRITICAL: Zod v4 API (NOT v3)

The project has **Zod v4.3.6** installed (NOT v3.23 as referenced in architecture docs). You MUST use Zod v4 API:

- **String format validators are top-level**: `z.email()`, `z.uuid()`, `z.url()` — NOT `z.string().email()`
- **`z.record()` requires TWO arguments**: `z.record(z.string(), z.number())` — NOT `z.record(z.number())`
- **Error customization**: Use unified `error` parameter — NOT `invalid_type_error`/`required_error`
- **`.merge()` is deprecated**: Use `.extend()` instead
- **Import**: Standard `import { z } from 'zod'` works

### NIP-34 Event Kind Tag Structures (Authoritative Reference)

All Nostr events share this base structure:
```typescript
{
  id: string          // 32-byte hex event ID
  pubkey: string      // 32-byte hex public key
  created_at: number  // Unix timestamp (seconds)
  kind: number        // Event kind
  tags: string[][]    // Array of tag arrays
  content: string     // Event content
  sig: string         // 64-byte hex signature
}
```

**Kind 30617 (Repository Announcement) — Parameterized Replaceable:**
- REQUIRED tag: `["d", "<repo-identifier>"]` (kebab-case)
- OPTIONAL tags: `["name", "..."]`, `["description", "..."]`, `["web", "..."]` (multiple), `["clone", "..."]` (multiple), `["relays", "wss://...", "wss://..."]`, `["r", "<commit>", "euc"]`, `["maintainers", "<pubkey>", ...]`, `["t", "<topic>"]` (multiple)
- Content: empty string

**Kind 30618 (Repository State) — Parameterized Replaceable:**
- REQUIRED tag: `["d", "<repo-identifier>"]` (matches 30617)
- Tags: `["refs/heads/<branch>", "<commit-hash>"]`, `["refs/tags/<tag>", "<commit-hash>"]`, `["HEAD", "ref: refs/heads/<branch>"]`
- Content: empty string

**Kind 1617 (Patch):**
- Tags: `["a", "30617:<pubkey>:<repo-d-tag>"]`, `["r", "<euc>"]`, `["p", "<owner-pubkey>"]`, `["t", "root"]` (first patch), `["commit", "<hash>"]`, `["parent-commit", "<hash>"]`, `["commit-pgp-sig", "<sig>"]`, `["committer", "<name>", "<email>", "<timestamp>", "<tz-offset>"]`
- Content: git format-patch output (diff text)
- Chaining: NIP-10 `e` reply tags to previous patches

**Kind 1618 (Pull Request):**
- Tags: `["a", "30617:<pubkey>:<repo-d-tag>"]`, `["r", "<euc>"]`, `["p", "<owner-pubkey>"]`, `["subject", "<title>"]`, `["c", "<tip-commit-hash>"]`, `["clone", "<clone-url>"]` (multiple), `["branch-name", "<name>"]`, `["merge-base", "<hash>"]`, `["t", "<label>"]` (multiple), `["e", "<root-patch-id>"]`
- Content: Markdown description

**Kind 1619 (PR Update):**
- Tags: `["a", "..."]`, `["r", "..."]`, `["p", "..."]`, `["E", "<original-pr-id>"]` (NIP-22), `["P", "<original-pr-author>"]` (NIP-22), `["c", "<new-tip-commit>"]`, `["clone", "..."]`, `["merge-base", "..."]`
- Content: empty string

**Kind 1621 (Issue):**
- Tags: `["a", "30617:<pubkey>:<repo-d-tag>"]`, `["p", "<owner-pubkey>"]`, `["subject", "<title>"]` (optional), `["t", "<label>"]` (multiple)
- Content: Markdown issue description

**Kind 1622 (Comment/Issue Update):**
- Follows NIP-22 comment format
- Tags: `["e", "<target-event-id>", "", "root"]` (NIP-10 threading), `["p", "<target-author>"]`, `["p", "<mention>"]`
- Content: Markdown comment text

**Kinds 1630-1633 (Status Events):**
- 1630=Open, 1631=Applied/Merged/Resolved, 1632=Closed, 1633=Draft
- Tags: `["e", "<target-event-id>", "", "root"]`, `["p", "<owner>"]`, `["p", "<author>"]`
- Kind 1631 optional: `["merge-commit", "<hash>"]`, `["applied-as-commits", "<hash>", ...]`, `["r", "<commit-hash>"]`
- Content: optional explanation
- **Most recent by `created_at` from author or maintainer wins**

### Domain Model Design Patterns

**Transformation principle**: Domain models contain PARSED data extracted from raw event tags. The dev agent in Story 1.9 will create the transformer functions — Story 1.8 only defines the target interfaces.

**Status derivation**: `Issue`, `PullRequest`, and `Patch` models include a `status` field typed as:
```typescript
type EntityStatus = 'open' | 'applied' | 'closed' | 'draft'
```
Status is derived from the most recent status event (kinds 1630-1633) by `created_at`. Default is `'open'`.

**Repository domain model fields** (parsed from kind 30617 tags):
- `id`: string (from `d` tag — repo identifier)
- `name`: string (from `name` tag, fallback to `d` tag)
- `description`: string (from `description` tag)
- `owner`: string (event pubkey)
- `maintainers`: string[] (from `maintainers` tag)
- `webUrls`: string[] (from `web` tags)
- `cloneUrls`: string[] (from `clone` tags)
- `relays`: string[] (from `relays` tag)
- `topics`: string[] (from `t` tags, excluding "personal-fork")
- `isPersonalFork`: boolean (has `["t", "personal-fork"]`)
- `earliestUniqueCommit`: string | null (from `r` tag with "euc")
- `eventId`: string (event.id)
- `createdAt`: number (event.created_at)

### Existing Types — DO NOT RECREATE

These files already exist and are tested. Verify but do not replace:

**`src/types/common.ts`** — Already has:
```typescript
export interface RigError {
  code: 'RELAY_TIMEOUT' | 'VALIDATION_FAILED' | 'GATEWAY_ERROR' | 'SIGNATURE_INVALID' | 'ARNS_RESOLUTION_FAILED'
  message: string
  userMessage: string
  context?: Record<string, unknown>
}
```

**`src/types/arweave.ts`** — Already has `ArweaveManifest`, `ArNSResolution`

**`src/types/cache.ts`** — Already has `CachedEvent`, `CachedFile`, `CacheResult<T>`

### Existing Constants — DO NOT RECREATE

**`src/constants/nostr.ts`** — Already defines:
```typescript
export const REPO_ANNOUNCEMENT = 30617
export const ISSUE = 1621
export const PULL_REQUEST = 1618
export const PATCH = 1617
export const COMMENT = 1622
export const DEFAULT_RELAYS = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band']
```

**Missing constants to ADD** (status event kinds not yet defined):
```typescript
export const STATUS_OPEN = 1630
export const STATUS_APPLIED = 1631
export const STATUS_CLOSED = 1632
export const STATUS_DRAFT = 1633
export const REPO_STATE = 30618
export const PR_UPDATE = 1619
```

**`src/constants/arweave.ts`** and **`src/constants/cache.ts`** — Already complete, do not modify.

### Existing Nostr Service — Types Must Be Compatible

**`src/lib/nostr.ts`** currently returns raw `NostrEvent[]` from nostr-tools. The Zod schemas you create must validate the raw events BEFORE Story 1.9 transforms them into domain models. The validation flow is:

```
Raw NostrEvent → verifyEvent() (signature) → Zod schema.parse() → eventToX() transformer → Domain Model
```

Your Zod schemas validate the RAW event structure (tags array format, required tags, kind number). The transformer functions (Story 1.9) then extract parsed fields into domain models.

### Zod Schema Design Guidance

**Base event schema** (shared by all NIP-34 events):
```typescript
const BaseNostrEventSchema = z.object({
  id: z.string(),
  pubkey: z.string(),
  created_at: z.number(),
  kind: z.number(),
  tags: z.array(z.array(z.string())),
  content: z.string(),
  sig: z.string(),
})
```

**Then extend per-kind** with `.extend()` to add kind-specific refinements:
```typescript
const RepoAnnouncementEventSchema = BaseNostrEventSchema.extend({
  kind: z.literal(30617),
}).refine(
  (event) => event.tags.some(tag => tag[0] === 'd' && tag[1]),
  { message: 'Missing required "d" tag' }
)
```

**Schema naming convention**: `XxxEventSchema` for raw event validation (e.g., `RepoAnnouncementEventSchema`). Inferred types: `type RepoAnnouncementEvent = z.infer<typeof RepoAnnouncementEventSchema>`.

### File Structure for New/Modified Files

```
src/types/
├── index.ts           ← UPDATE: add re-exports for new types
├── common.ts          ← VERIFY: RigError completeness (already exists)
├── arweave.ts         ← DO NOT MODIFY (already exists)
├── cache.ts           ← DO NOT MODIFY (already exists)
├── nostr.ts           ← CREATE: Zod schemas + NostrEvent types
├── repository.ts      ← CREATE: Repository domain model
├── issue.ts           ← CREATE: Issue, Comment domain models
├── pull-request.ts    ← CREATE: PullRequest domain model
├── patch.ts           ← CREATE: Patch domain model
├── nostr.test.ts      ← CREATE: Zod schema validation tests
├── repository.test.ts ← CREATE: Repository type tests
├── issue.test.ts      ← CREATE: Issue/Comment type tests
├── pull-request.test.ts ← CREATE: PullRequest type tests
└── patch.test.ts      ← CREATE: Patch type tests

src/constants/
└── nostr.ts           ← UPDATE: add missing status event kind constants
```

### Testing Strategy

**Test pattern** (established in previous stories):
```typescript
import { describe, it, expect } from 'vitest'
```

**Schema tests should cover:**
1. Valid event accepted (parse succeeds, returns typed object)
2. Missing required tags rejected (parse throws)
3. Wrong kind number rejected
4. Missing base fields rejected (no id, no sig, etc.)
5. Edge cases: empty tags array, extra unknown tags (should pass — Nostr events are extensible)

**Domain model tests should cover:**
1. Interface field completeness (type-level checks)
2. Status type union correctness
3. Export verification from `@/types`

### Project Structure Notes

- All new files in `src/types/` — matches existing pattern
- Co-located tests (`.test.ts` next to source) — matches project convention
- Import via `@/types` barrel — matches established pattern
- Named exports only (no default exports) — matches shadcn/project convention

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — "NIP-34 Event Validation" decision]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Type Definitions Organization"]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Error Structure Format" pattern]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1 Story 1.8]
- [Source: _bmad-output/planning-artifacts/prd.md — NFR-S1 Event signature verification]
- [Source: NIP-34 spec — https://nips.nostr.com/34]
- [Source: Zod v4 migration guide — https://zod.dev/v4/changelog]

### Previous Story Intelligence (from Story 1.7)

- **244/244 tests passing** — must maintain zero regressions
- **Vitest with happy-dom** — test environment configured in `vitest.config.ts`
- **Test setup**: `src/test-utils/setup.ts` with `fake-indexeddb/auto` import
- **ThemeProvider wrapper required** for any component tests using React Router
- **Named exports pattern** — all components and types use named exports
- **Import pattern**: `import type { X } from '@/types'` for type-only imports
- **React Router v7** (NOT v6) — use `react-router` not `react-router-dom` for imports
- **ARNS_RESOLUTION_FAILED** error code was added to `common.ts` in Story 1.7

### Git Intelligence

Recent commits show:
- Story 1.2 implemented Nostr relay service layer (most recent)
- Story 1.1 project initialization
- Stories 1.3-1.7 implemented but not yet committed (changes in working tree)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

No blocking issues encountered. Implementation followed red-green-refactor cycle with tests written before implementation.

### Completion Notes List

✅ **Task 1 Complete** - Created comprehensive Nostr event types and Zod schemas:
- Defined NostrEvent and NostrTag types matching nostr-tools Event type
- Created BaseNostrEventSchema with all required Nostr event fields
- Implemented 8 event-specific schemas with proper kind validation and tag refinements
- All schemas use Zod v4 API (z.literal, z.union, .extend() patterns)
- Added 28 comprehensive tests covering valid events, invalid events, edge cases (including PRUpdateEventSchema)
- All tests passing

✅ **Task 2 Complete** - Created Repository domain model with all parsed fields from kind 30617 events

✅ **Task 3 Complete** - Created Issue and Comment domain models with EntityStatus type and NIP-10 threading support

✅ **Task 4 Complete** - Created PullRequest domain model with commit/clone/branch metadata

✅ **Task 5 Complete** - Created Patch domain model with commit/committer metadata and git diff support

✅ **Task 6 Complete** - Created barrel export index.ts with all type exports, preserving existing common/arweave/cache exports

✅ **Task 7 Complete** - Verified RigError has all 5 error codes (RELAY_TIMEOUT, VALIDATION_FAILED, GATEWAY_ERROR, SIGNATURE_INVALID, ARNS_RESOLUTION_FAILED)

✅ **Task 8 Complete** - Full test suite: 298 tests passing, TypeScript compilation: 0 errors

**All Acceptance Criteria Met:**
1. ✅ All type files created in src/types/ with proper structure
2. ✅ Zod validation schemas defined for all 8 NIP-34 event kinds
3. ✅ Domain model interfaces defined for all 5 entity types (Repository, Issue, Comment, PullRequest, Patch)
4. ✅ RigError interface verified complete; EntityStatus moved to common.ts as shared type
5. ✅ All types importable from @/types via barrel export (verified by barrel export test)
6. ✅ TypeScript strict mode compiles with zero errors
7. ✅ Unit tests verify schema validation, type exports, and domain model completeness

### File List

**New Files Created:**
- rig-frontend/src/types/nostr.ts
- rig-frontend/src/types/nostr.test.ts
- rig-frontend/src/types/repository.ts
- rig-frontend/src/types/repository.test.ts
- rig-frontend/src/types/issue.ts
- rig-frontend/src/types/issue.test.ts
- rig-frontend/src/types/pull-request.ts
- rig-frontend/src/types/pull-request.test.ts
- rig-frontend/src/types/patch.ts
- rig-frontend/src/types/patch.test.ts
- rig-frontend/src/types/index.ts
- rig-frontend/src/types/index.test.ts

**Modified Files:**
- rig-frontend/src/constants/nostr.ts
- rig-frontend/src/types/common.ts

## Change Log

### 2026-02-25 - Code Review Fixes Applied
- **H1 Fixed**: Added PRUpdateEventSchema tests (2 new tests in nostr.test.ts)
- **H2 Fixed**: Corrected inflated test count from 74 to 54 in Dev Agent Record
- **M1 Fixed**: Moved EntityStatus from issue.ts to common.ts; updated imports in issue.ts, pull-request.ts, patch.ts, and barrel export
- **M2 Fixed**: Made PullRequest.tipCommit, branchName, mergeBase nullable (string | null) per NIP-34 optional tags
- **M3 Fixed**: Renamed PullRequest.description to PullRequest.content for consistency with Issue.content
- **M4 Fixed**: Added barrel export test (index.test.ts) verifying all @/types imports
- All 298 tests passing, TypeScript compilation: 0 errors

### 2026-02-25 - Story 1.8 Implementation Complete
- Added comprehensive TypeScript type definitions and Zod validation schemas for all NIP-34 event kinds
- Created domain model interfaces for Repository, Issue, Comment, PullRequest, and Patch entities
- Implemented 8 Zod schemas using v4 API: BaseNostrEventSchema, RepoAnnouncementEventSchema, RepoStateEventSchema, PatchEventSchema, PullRequestEventSchema, PRUpdateEventSchema, IssueEventSchema, CommentEventSchema, StatusEventSchema
- Added barrel export index.ts for centralized type imports via @/types
- Extended src/constants/nostr.ts with missing status event kind constants (1630-1633) and REPO_STATE, PR_UPDATE
- Created comprehensive unit tests for all schemas and domain models (54 new tests)
- All 298 tests passing, TypeScript compilation: 0 errors
- Ready for code review
