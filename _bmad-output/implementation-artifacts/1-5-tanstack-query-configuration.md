# Story 1.5: TanStack Query Configuration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **TanStack Query configured with balanced settings for async state management**,
So that **data fetching, caching, and real-time updates are handled efficiently across the application**.

## Acceptance Criteria

**Given** Stories 1.1-1.4 are complete (caching layer exists)
**When** I implement TanStack Query configuration in src/lib/query-client.ts
**Then** A QueryClient is created with the following configuration:
- staleTime: Varies by query type (repos: 1hr, issues: 5min per Architecture)
- cacheTime: 1 hour default
- refetchOnWindowFocus: true
- retry: 3 with exponential backoff

**And** The QueryClientProvider wraps the application in src/main.tsx

**And** Query keys follow a consistent convention:
- ['repositories'] → all repositories
- ['repository', repoId] → specific repository
- ['issues', repoId] → issues for repository
- ['pullRequests', repoId] → PRs for repository
- ['file', txId, path] → specific file

**And** The configuration integrates with the IndexedDB cache layer (Story 1.4)

**And** Failed queries are retried 3 times with exponential backoff per Architecture decision

**And** Query invalidation works correctly for cache updates

**And** Unit tests verify:
- QueryClient configuration
- Query key consistency
- Retry behavior
- Cache integration

## Tasks / Subtasks

- [x] Task 1: Create query client configuration (AC: QueryClient config)
  - [x] Create `src/lib/query-client.ts` with QueryClient instance
  - [x] Configure default options (staleTime, gcTime, refetchOnWindowFocus, retry)
  - [x] Document configuration decisions in comments
  - [x] Export QueryClient instance and query key factories
- [x] Task 2: Wrap application with QueryClientProvider (AC: Provider wraps app)
  - [x] Modify `src/main.tsx` to import QueryClientProvider
  - [x] Wrap <App /> with QueryClientProvider
  - [x] Add React Query DevTools for development
- [x] Task 3: Create query key factories (AC: Query key convention)
  - [x] Define query key functions in `src/lib/query-client.ts`
  - [x] Export factories: `repositoryKeys`, `issueKeys`, `pullRequestKeys`, `fileKeys`
  - [x] Document query key hierarchy in comments
- [x] Task 4: Integrate with IndexedDB cache layer (AC: Cache integration)
  - [x] Verify cache layer accessibility for future integration
  - [x] Align staleTime with cache TTLs (5min default = CACHE_TTL_ISSUE)
  - [x] Verify stale-while-revalidate support via gcTime > staleTime
- [x] Task 5: Write comprehensive unit tests (AC: Unit tests verify)
  - [x] Test QueryClient default configuration
  - [x] Test query key factory consistency
  - [x] Test retry behavior with exponential backoff
  - [x] Test cache integration alignment
  - [x] Test refetchOnWindowFocus behavior

## Dev Notes

### Architecture Compliance

**State Management Decision** [Source: architecture.md#State Management]:
- **Decision**: TanStack Query with balanced configuration
- **Configuration**:
  - `staleTime`: Varies by query type (repos: 1hr, issues: 5min)
  - `cacheTime`: 1 hour default
  - `refetchOnWindowFocus`: true
  - `retry`: 3 with exponential backoff
- **Version**: @tanstack/react-query ^5.59 minimum (v5.90.21 installed ✓)
- **Rationale**: Aligns with hybrid caching strategy from Story 1.4, automatic cache invalidation

**TanStack Query Integration Patterns** [Source: architecture.md#Pattern Consistency]:
- ✅ Use TanStack Query's `status` field: `'pending' | 'error' | 'success'`
- ✅ Check `status === 'pending'` for loading states
- ✅ Check `status === 'error'` for error states
- ✅ Data is guaranteed available when `status === 'success'`
- ✅ Hook layer: Propagate errors via TanStack Query (no try-catch needed)
- ✅ Invalidate and refetch on new events via `queryClient.invalidateQueries()`
- ✅ Let TanStack Query handle refetching automatically based on staleTime

**Data Flow with TanStack Query** [Source: architecture.md#Data Flow Boundaries]:
```
Component → Hook → TanStack Query → Service Layer → Validation → Transform → Domain Model → Cache → Component
```

Real-time update flow:
```
Nostr Relay (WebSocket) → Subscription Hook → Query Invalidation (queryClient.invalidateQueries) → TanStack Query refetches → Service Layer → Component re-renders
```

**Query Key Convention** [Source: architecture.md#Query Key Convention]:
- `['repositories']` → all repositories (kind 30617)
- `['repository', repoId]` → specific repository
- `['issues', repoId]` → issues for repository (kind 1621)
- `['pullRequests', repoId]` → PRs for repository (kind 1618)
- `['file', txId, path]` → specific Arweave file
- Query keys enable precise cache invalidation and scoped refetching

### Technical Requirements

**Required Exports from `src/lib/query-client.ts`**:
1. `queryClient` — Configured QueryClient instance (singleton)
2. `repositoryKeys` — Query key factory for repository queries
3. `issueKeys` — Query key factory for issue queries
4. `pullRequestKeys` — Query key factory for PR queries
5. `fileKeys` — Query key factory for file/Arweave queries

**QueryClient Configuration Specification**:
```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default (issues/PRs)
      gcTime: 60 * 60 * 1000, // 1 hour (previously cacheTime in v4)
      refetchOnWindowFocus: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s...max 30s
    },
  },
})
```

**CRITICAL API CHANGE**: TanStack Query v5 renamed `cacheTime` to `gcTime` (garbage collection time). DO NOT use `cacheTime` — it will be ignored.

**Stale Time Override Pattern**:
Per-query staleTime overrides should be set in custom hooks:
```typescript
// Example: repositories have 1hr staleTime
useQuery({
  queryKey: repositoryKeys.all(),
  queryFn: fetchRepositories,
  staleTime: 60 * 60 * 1000, // 1 hour
})
```

**Query Key Factory Pattern**:
```typescript
// Hierarchical key structure for efficient invalidation
export const repositoryKeys = {
  all: () => ['repositories'] as const,
  lists: () => [...repositoryKeys.all(), 'list'] as const,
  list: (filters: string) => [...repositoryKeys.lists(), filters] as const,
  details: () => [...repositoryKeys.all(), 'detail'] as const,
  detail: (id: string) => [...repositoryKeys.details(), id] as const,
}
```

### Library/Framework Requirements

**@tanstack/react-query v5.90.21** (installed ✓):
- **Breaking Changes from v4**:
  - `cacheTime` renamed to `gcTime`
  - `useQuery` no longer supports positional parameters (must use object syntax)
  - `onSuccess`, `onError`, `onSettled` callbacks removed from `useQuery` (use `useEffect` instead)
  - `isLoading` replaced with `isPending` (though `status === 'pending'` is preferred pattern)
- **Key Features**:
  - Automatic background refetching
  - Request deduplication
  - Query invalidation and cache updates
  - Retry with exponential backoff
  - Stale-while-revalidate built-in
  - Optimistic updates support
  - React 18+ Suspense support (not used in MVP)
- **DevTools**: `@tanstack/react-query-devtools` (already available via main package)
- **Documentation**: https://tanstack.com/query/v5/docs/react/overview

**Integration with Story 1.4 Cache Layer**:
- Cache layer provides: `getCachedEvent()`, `cacheEvent()`, `getCachedFile()`, `cacheFile()`
- TanStack Query queries should check cache first using `getCachedEvent()` which returns `{ data, isStale }`
- If cache returns stale data (`isStale: true`), show it immediately and let TanStack Query refetch in background
- After successful query, update cache via `cacheEvent()` or `cacheFile()`

**Example Cache-Aware Query**:
```typescript
import { getCachedEvent, cacheEvent } from './cache'
import { CACHE_TTL_REPOSITORY } from '@/constants/cache'

async function fetchRepositoriesWithCache() {
  // Check cache first
  const cached = await getCachedEvent(REPO_ANNOUNCEMENT, 'repositories')

  // Return cached data immediately if available (even if stale)
  // TanStack Query will refetch in background based on staleTime
  if (cached.data) {
    // Fetch fresh data in background (TanStack Query handles this)
    const fresh = await fetchRepositories() // Service layer call
    await cacheEvent(REPO_ANNOUNCEMENT, 'repositories', fresh, CACHE_TTL_REPOSITORY)
    return fresh
  }

  // No cache, fetch fresh
  const fresh = await fetchRepositories()
  await cacheEvent(REPO_ANNOUNCEMENT, 'repositories', fresh, CACHE_TTL_REPOSITORY)
  return fresh
}
```

**IMPORTANT**: This story creates the QueryClient configuration and wraps the app. Cache-aware query functions will be implemented in future stories (1.6-1.10) when building actual feature hooks.

### File Structure Requirements

**Files to Create**:
- `src/lib/query-client.ts` — QueryClient configuration and query key factories
- `src/lib/query-client.test.ts` — Unit tests for configuration and key factories

**Files to Modify**:
- `src/main.tsx` — Wrap <App /> with QueryClientProvider and add DevTools

**Existing Files (DO NOT MODIFY)**:
- `src/lib/cache.ts` — Cache layer from Story 1.4 (will be used by query functions later)
- `src/lib/nostr.ts` — Nostr service layer (will be wrapped in useQuery hooks later)
- `src/lib/arweave.ts` — Arweave service layer (will be wrapped in useQuery hooks later)
- `src/constants/cache.ts` — Cache TTL constants (reference for staleTime alignment)
- `package.json` — @tanstack/react-query ^5.90.21 already installed

**Project Structure Context** [Source: architecture.md#Project Structure]:
```
src/
├── lib/
│   ├── query-client.ts          # ← CREATE THIS
│   ├── query-client.test.ts     # ← CREATE THIS
│   ├── cache.ts                 # ← Exists (Story 1.4)
│   ├── nostr.ts                 # ← Exists (Story 1.2)
│   └── arweave.ts               # ← Exists (Story 1.3)
├── main.tsx                     # ← MODIFY THIS
└── constants/
    └── cache.ts                 # ← Exists (Story 1.4)
```

**Naming Conventions** [Source: architecture.md#Naming Patterns]:
- Module file: `camelCase` → `query-client.ts`
- Export singleton: `camelCase` → `queryClient`
- Factory functions: `camelCase` → `repositoryKeys`, `issueKeys`
- Constants: `SCREAMING_SNAKE_CASE` → (already defined in constants/cache.ts)
- Test file: Co-located `.test` suffix → `query-client.test.ts`

### Testing Requirements

**Test Environment**: Vitest with happy-dom (already configured)
- Config: `rig-frontend/vitest.config.ts`
- Setup: `src/test-utils/setup.ts`
- Environment: `happy-dom` with `globals: true`

**TanStack Query Testing Pattern**:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'

describe('QueryClient configuration', () => {
  let testQueryClient: QueryClient

  beforeEach(() => {
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }, // Disable retries in tests
      },
    })
  })

  it('configures exponential backoff', () => {
    const retryDelay = queryClient.getDefaultOptions().queries?.retryDelay
    expect(retryDelay).toBeDefined()
    expect(retryDelay!(0)).toBe(1000) // First retry: 1s
    expect(retryDelay!(1)).toBe(2000) // Second retry: 2s
    expect(retryDelay!(2)).toBe(4000) // Third retry: 4s
  })
})
```

**Test Coverage Requirements** (matching Stories 1.2-1.4 standards):
- Line Coverage: >80%
- Branch Coverage: >75%
- All exported functions: at least 2 tests each

**Required Test Cases**:
1. **QueryClient Configuration**:
   - Default staleTime is 5 minutes
   - Default gcTime is 1 hour
   - refetchOnWindowFocus is true
   - Retry count is 3
   - Retry delay uses exponential backoff (1s, 2s, 4s, max 30s)
2. **Query Key Factories**:
   - `repositoryKeys.all()` returns `['repositories']`
   - `repositoryKeys.detail(id)` returns `['repositories', 'detail', id]`
   - `issueKeys.list(repoId)` returns `['issues', repoId]`
   - `pullRequestKeys.detail(repoId, prId)` returns `['pullRequests', repoId, 'detail', prId]`
   - `fileKeys.file(txId, path)` returns `['file', txId, path]`
3. **Provider Integration**:
   - QueryClientProvider wraps app in main.tsx
   - DevTools component renders in development mode only

### Previous Story Intelligence

**From Story 1.4 (IndexedDB Caching Layer)** [Source: 1-4-indexeddb-caching-layer.md]:

**Cache API Available**:
- `cacheEvent(eventKind, eventId, data, ttl)` — stores with TTL
- `getCachedEvent(eventKind, eventId)` — returns `{ data, isStale }` (stale-while-revalidate)
- `cacheFile(txId, path, content)` — permanent Arweave storage
- `getCachedFile(txId, path)` — retrieve cached file
- `invalidateCache(eventKind, filter?)` — bulk delete
- `clearExpired()` — remove expired entries

**Cache TTL Constants** [Source: constants/cache.ts]:
- `CACHE_TTL_REPOSITORY = 3600000` (1 hour in ms)
- `CACHE_TTL_ISSUE = 300000` (5 minutes in ms)
- `CACHE_TTL_PULL_REQUEST = 300000`
- `CACHE_TTL_COMMENT = 300000`
- `CACHE_TTL_PATCH = 300000`

**CRITICAL ALIGNMENT**: TanStack Query `staleTime` should match cache TTLs:
- Repositories: `staleTime: 60 * 60 * 1000` (1 hour) = `CACHE_TTL_REPOSITORY`
- Issues/PRs: `staleTime: 5 * 60 * 1000` (5 min) = `CACHE_TTL_ISSUE`
- This prevents redundant refetches while cache is still fresh

**Stale-While-Revalidate Pattern**:
Story 1.4 cache layer returns `{ data, isStale }`. TanStack Query naturally implements stale-while-revalidate:
- If data is in cache but stale (`isStale: true`), show it immediately
- TanStack Query refetches in background based on `staleTime`
- UI updates when fresh data arrives

**Testing Pattern from Story 1.4**:
- Use fake-indexeddb for IndexedDB tests (already configured in `src/test-utils/setup.ts`)
- Clear database in `beforeEach()` for test isolation
- Use `vi.useFakeTimers()` for deterministic time-based tests
- Prefer real timers with short TTLs over excessive mocking

**From Story 1.2 (Nostr Relay Service)** [Source: 1-2-nostr-relay-service-layer.md]:
- Module-private singleton pattern: `const pool = new SimplePool()` (NOT exported)
- Export functions, not instances: `export async function fetchRepositories() { ... }`
- RigError structure for error handling with user-friendly messages
- Discovered API differences: nostr-tools v2 uses `querySync()` not `list()` — always verify actual API

**From Story 1.3 (Arweave/ar.io Gateway)** [Source: 1-3-arweave-ar-io-gateway-integration.md]:
- Same singleton pattern as nostr.ts
- Arweave content is immutable — no TTL needed (permanent cache)
- Gateway failover handled by Wayfinder SDK

**Code Review Learnings (Stories 1.2-1.4)**:
- ❌ Don't export internal instances (keep QueryClient module-private)
- ✅ Always test error paths, not just happy paths
- ✅ Verify every constant/config value has a test
- ✅ Comprehensive error handling with graceful degradation

### Git Intelligence

**Recent Commits**:
```
f21f893 Implement Story 1.2: Nostr relay service layer with code review fixes
b100bec Update Story 1.1 status and sprint tracking after code review
672b8f4 Implement Story 1.1: Project initialization
```

**Current Source Tree** (`rig-frontend/src/`):
- `lib/nostr.ts` + `lib/arweave.ts` + `lib/cache.ts` — Service layers complete (Stories 1.2-1.4)
- `constants/nostr.ts` + `constants/arweave.ts` + `constants/cache.ts` — Configuration constants
- `types/common.ts` + `types/arweave.ts` + `types/cache.ts` — Type definitions
- All tests co-located: `*.test.ts` next to source files

**Established Patterns from Previous Stories**:
1. **Module Organization**: Service modules in `lib/`, constants in `constants/`, types in `types/`
2. **Singleton Pattern**: Module-private instances, export only functions
3. **Error Handling**: Use `RigError` from `types/common.ts`
4. **Testing**: Co-located tests with >80% line coverage
5. **Documentation**: Inline JSDoc comments explaining decisions

### Latest Technical Information

**TanStack Query v5 Key Changes** (researched 2026-02-25):

**API Changes from v4 → v5**:
1. **`cacheTime` → `gcTime`**: Renamed to "garbage collection time" for clarity
2. **Callbacks Removed**: `onSuccess`, `onError`, `onSettled` removed from `useQuery` — use `useEffect` instead
3. **Object Syntax Required**: `useQuery(key, fn, options)` → `useQuery({ queryKey, queryFn })`
4. **`isLoading` Deprecated**: Use `isPending` or `status === 'pending'` (architecture standard)
5. **Suspense Improvements**: Better React 18 Suspense support (not used in MVP)

**Best Practices for v5**:
- Use query key factories for maintainability (hierarchical keys)
- Set `staleTime` appropriately to reduce unnecessary refetches
- Use `gcTime` to control memory usage (default 5min → we use 1hr per architecture)
- Prefer `status` checks over `isLoading`/`isError` booleans
- Use `queryClient.invalidateQueries()` for cache updates after mutations
- Leverage automatic retry with exponential backoff (no custom retry logic needed)

**Performance Considerations**:
- Query keys should be serializable (arrays of strings/numbers/objects)
- Avoid inline object query keys — causes cache misses: `['issues', { id }]` ❌ → `['issues', id]` ✅
- Use structural sharing for partial updates (TanStack Query does this automatically)
- `gcTime` should be longer than `staleTime` to keep data in cache while stale (our config: 1hr gcTime, 5min default staleTime)

**DevTools Setup** (v5 latest):
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// In App component or main.tsx
<QueryClientProvider client={queryClient}>
  <App />
  {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
</QueryClientProvider>
```

**Common Pitfalls to Avoid**:
1. ❌ Using `cacheTime` (v4 API) → ✅ Use `gcTime` (v5 API)
2. ❌ Positional parameters: `useQuery('key', fn)` → ✅ Object syntax: `useQuery({ queryKey, queryFn })`
3. ❌ Inline callbacks in useQuery → ✅ Use useEffect for side effects
4. ❌ Exporting QueryClient without configuration → ✅ Configure defaults in createQueryClient()
5. ❌ Misaligned staleTime/cache TTL → ✅ Match staleTime to cache TTL (1hr repos, 5min issues)

### Anti-Pattern Prevention

**DO NOT**:
1. ❌ **Use v4 API (`cacheTime`)** — v5 renamed it to `gcTime`
2. ❌ **Export unconfigured QueryClient** — Must set defaults (staleTime, gcTime, retry, etc.)
3. ❌ **Create multiple QueryClient instances** — Use singleton pattern (one instance for whole app)
4. ❌ **Implement custom retry logic** — TanStack Query's built-in exponential backoff is sufficient
5. ❌ **Create custom hooks in this story** — This story only configures QueryClient; hooks come in Story 1.6+
6. ❌ **Integrate with service layers yet** — Service integration happens in later stories
7. ❌ **Add React Router** — That's Story 1.6; this story focuses only on TanStack Query setup
8. ❌ **Wrap components with QueryClientProvider in tests** — That's for integration tests in later stories

**DO**:
1. ✅ **Use `gcTime` instead of `cacheTime`** (v5 API)
2. ✅ **Configure QueryClient with defaults** (staleTime, gcTime, refetchOnWindowFocus, retry)
3. ✅ **Export query key factories** (repositoryKeys, issueKeys, etc.) for consistency
4. ✅ **Align staleTime with cache TTLs** (1hr repos, 5min issues matches Story 1.4)
5. ✅ **Add DevTools for development** (conditional on `import.meta.env.DEV`)
6. ✅ **Follow singleton pattern** (module-private instance, export only config)
7. ✅ **Test configuration values** (verify retry delay, staleTime, gcTime)
8. ✅ **Document decisions in comments** (why these values, how to override per-query)

### Implementation Checklist

Before marking this story as complete, verify:

- [ ] `src/lib/query-client.ts` exists with configured QueryClient instance
- [ ] Default `staleTime` = 5 minutes (matches CACHE_TTL_ISSUE)
- [ ] Default `gcTime` = 1 hour (not `cacheTime` — v5 API!)
- [ ] `refetchOnWindowFocus` = true
- [ ] `retry` = 3 with exponential backoff (1s, 2s, 4s, max 30s)
- [ ] Query key factories exported: `repositoryKeys`, `issueKeys`, `pullRequestKeys`, `fileKeys`
- [ ] `src/main.tsx` wraps <App /> with QueryClientProvider
- [ ] React Query DevTools added (conditional on `import.meta.env.DEV`)
- [ ] Unit tests verify all configuration values
- [ ] Unit tests verify query key factory outputs
- [ ] Test coverage >80% line coverage, >75% branch coverage
- [ ] No new packages added (TanStack Query already installed)
- [ ] Follows established patterns (singleton, module-private instance, co-located tests)

### References

- [Source: architecture.md#State Management] — TanStack Query configuration specification
- [Source: architecture.md#TanStack Query Configuration] — Detailed config requirements
- [Source: architecture.md#Caching Strategy] — Hybrid TTL alignment with IndexedDB
- [Source: architecture.md#Data Flow Boundaries] — TanStack Query role in data pipeline
- [Source: architecture.md#Pattern Consistency] — Loading state patterns, error handling, cache updates
- [Source: epics.md#Story 1.5] — Original acceptance criteria
- [Source: 1-4-indexeddb-caching-layer.md] — Cache API and TTL constants
- [Source: 1-2-nostr-relay-service-layer.md] — Singleton pattern, RigError structure
- [Source: TanStack Query v5 Docs] — https://tanstack.com/query/v5/docs/react/overview
- [Source: TanStack Query v5 Migration Guide] — https://tanstack.com/query/v5/docs/react/guides/migrating-to-v5

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

None - implementation proceeded smoothly without debugging needed.

### Completion Notes List

**Implementation Summary:**
- Created `src/lib/query-client.ts` with fully configured QueryClient singleton
- Configured with v5 API: gcTime (not cacheTime), staleTime aligned with cache TTLs
- Implemented exponential backoff retry strategy: 1s, 2s, 4s, max 30s
- Created hierarchical query key factories for repositories, issues, PRs, and files
- Wrapped application with QueryClientProvider in `src/main.tsx`
- Added React Query DevTools (conditional on development mode)
- Wrote 27 comprehensive unit tests covering all configuration and functionality (25 original + 2 added during code review)
- All tests passing (138 total tests across codebase)
- No regressions introduced

**Key Technical Decisions:**
- Used v5 API (`gcTime` instead of deprecated `cacheTime`)
- Set default staleTime to 5 minutes to match CACHE_TTL_ISSUE
- Set gcTime to 1 hour (longer than staleTime) for stale-while-revalidate pattern
- Installed @tanstack/react-query-devtools as devDependency (was missing)
- Verified cache integration alignment with tests

**Cache Integration:**
- Configuration aligns with Story 1.4 cache layer
- staleTime values match cache TTLs (5min for issues, 1hr override for repos)
- gcTime > staleTime enables stale-while-revalidate pattern
- Cache-aware query functions will be implemented in Stories 1.6-1.10 as planned

### File List

**Files Created:**
- `src/lib/query-client.ts` - QueryClient configuration and query key factories
- `src/lib/query-client.test.ts` - Comprehensive unit tests (27 tests)

**Files Modified:**
- `src/main.tsx` - Added QueryClientProvider wrapper and DevTools
- `package.json` - Added @tanstack/react-query-devtools (devDependency)
- `package-lock.json` - Updated with devtools package

## Change Log

- **2026-02-25**: Story 1.5 implementation completed
  - Created QueryClient configuration with TanStack Query v5
  - Configured default options: staleTime (5min), gcTime (1hr), retry (3 with exponential backoff)
  - Implemented hierarchical query key factories for all resource types
  - Wrapped application with QueryClientProvider
  - Added React Query DevTools for development
  - Wrote 25 comprehensive unit tests - all passing
  - Verified alignment with IndexedDB cache layer (Story 1.4)
  - Ready for code review
- **2026-02-25**: Code review completed (Claude Opus 4.6)
  - **M1 Fixed**: Added query key convention clarity comment to `query-client.ts` explaining hierarchical factory pattern supersedes flat key convention from epics
  - **M2 Fixed**: Renamed misleading test "should return file key with path only (no txId)" → "should return file key with different txId and path"
  - **M3 Fixed**: Renamed cache integration test for accuracy, added missing `clearExpired` and `evictLRU` export checks
  - **M4 Fixed**: Added 2 query invalidation tests verifying parent-key and scoped invalidation behavior
  - All 138 tests passing, no regressions
  - Story status: done

