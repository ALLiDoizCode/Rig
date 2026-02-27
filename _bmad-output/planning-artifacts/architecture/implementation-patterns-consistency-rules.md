# Implementation Patterns & Consistency Rules

_These patterns ensure all AI agents write consistent, compatible code that works together seamlessly._

## Pattern Categories Defined

**Critical Conflict Points Identified:** 11 areas where AI agents could make different choices without these patterns.

---

## Naming Patterns

**Code Naming Conventions:**

**Components & Files:**
- ✅ Components: `PascalCase` → `RepoList.tsx`, `IssueDetail.tsx`, `FileBrowser.tsx`
- ✅ Hooks: `camelCase` → `useRepository.ts`, `useNostr.ts`, `useRealtimeIssues.ts`
- ✅ Utilities: `camelCase` → `formatDate.ts`, `validateEvent.ts`, `parseNostrEvent.ts`
- ✅ Types: `PascalCase` → `Repository`, `NostrEvent`, `IssueData`, `PullRequest`
- ✅ Interfaces: `PascalCase` → `NostrService`, `ArweaveGateway`, `CacheManager`

**Examples:**
```typescript
// ✅ Correct
src/features/repository/RepoList.tsx
src/hooks/useRepository.ts
src/lib/formatDate.ts
src/types/nostr.ts → export interface NostrEvent

// ❌ Incorrect
src/features/repository/repo-list.tsx
src/hooks/use_repository.ts
src/lib/format_date.ts
src/types/nostr.ts → export interface nostr_event
```

**Constants & Configuration:**
- ✅ Event kinds: `SCREAMING_SNAKE_CASE` → `REPO_ANNOUNCEMENT = 30617`, `ISSUE = 1621`
- ✅ Configuration: `SCREAMING_SNAKE_CASE` → `DEFAULT_RELAYS`, `MAX_RETRY_ATTEMPTS`
- ✅ File location: `src/constants/nostr.ts`, `src/constants/arweave.ts`

**Examples:**
```typescript
// ✅ Correct
// constants/nostr.ts
export const REPO_ANNOUNCEMENT = 30617
export const ISSUE = 1621
export const PULL_REQUEST = 1618
export const COMMENT = 1622
export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band'
]

// ❌ Incorrect
export const repoAnnouncement = 30617
export const issue = 1621
export const defaultRelays = [...]
```

---

## Structure Patterns

**Test File Organization:**
- ✅ Co-located tests: Place `*.test.tsx` or `*.test.ts` next to implementation files
- ✅ Test naming: Match source file with `.test` suffix → `RepoList.tsx` → `RepoList.test.tsx`
- ✅ Test utilities: Shared test helpers in `src/test-utils/`

**Project Structure:**
```
src/
├── features/
│   ├── repository/
│   │   ├── RepoList.tsx
│   │   ├── RepoList.test.tsx        ← Co-located
│   │   ├── RepoDetail.tsx
│   │   ├── RepoDetail.test.tsx      ← Co-located
│   │   └── hooks/
│   │       ├── useRepository.ts
│   │       └── useRepository.test.ts ← Co-located
```

**Type Definitions Organization:**
- ✅ Centralized types directory: `src/types/`
- ✅ Domain-specific type files: `nostr.ts`, `repository.ts`, `arweave.ts`, `common.ts`
- ✅ Re-export from index: `src/types/index.ts` exports all types
- ✅ Import pattern: `import { Repository, NostrEvent } from '@/types'`

**Type File Structure:**
```
src/types/
├── index.ts           # Re-exports all types
├── nostr.ts          # NIP-34 event types, relay types
├── repository.ts     # Repository domain models
├── arweave.ts        # Arweave manifest, gateway types
├── issue.ts          # Issue, comment types
├── pull-request.ts   # PR types
└── common.ts         # Shared utility types (RigError, etc.)
```

---

## Format Patterns

**Event Transformation Pattern:**
- ✅ Service layer transforms NIP-34 events → domain models
- ✅ Components receive clean, typed domain objects
- ✅ Transformation functions: `eventToRepository()`, `eventToIssue()`, `eventToPullRequest()`
- ✅ Location: `src/lib/transformers/` or in service files

**Implementation:**
```typescript
// ✅ Correct - Service layer transforms
// lib/nostr.ts
import { eventToRepository } from './transformers'

export async function fetchRepositories(): Promise<Repository[]> {
  const events = await pool.list(relays, [{ kinds: [REPO_ANNOUNCEMENT] }])

  return events
    .filter(event => verifyEvent(event))
    .map(event => eventToRepository(event))
    .filter(Boolean)
}

// Component receives clean Repository[]
function RepoList() {
  const { data: repos } = useRepositories() // Repository[], not NostrEvent[]
  return <RepoGrid repos={repos} />
}

// ❌ Incorrect - Component handles raw events
function RepoList() {
  const { data: events } = useRepositories() // NostrEvent[]
  const repos = events.map(e => ({ id: e.id, name: e.tags[0][1] }))
}
```

**Error Structure Format:**
- ✅ Structured error objects with `code`, `message`, `userMessage`
- ✅ Type definition: `RigError` interface in `types/common.ts`
- ✅ User-facing messages separate from technical messages
- ✅ Error codes: `'RELAY_TIMEOUT' | 'VALIDATION_FAILED' | 'GATEWAY_ERROR' | 'SIGNATURE_INVALID'`

**Implementation:**
```typescript
// ✅ Correct
// types/common.ts
export interface RigError {
  code: 'RELAY_TIMEOUT' | 'VALIDATION_FAILED' | 'GATEWAY_ERROR' | 'SIGNATURE_INVALID'
  message: string        // Technical details for logging
  userMessage: string    // User-friendly message for UI
  context?: Record<string, unknown>
}

// lib/nostr.ts
async function fetchRepositories(): Promise<Repository[]> {
  try {
    const events = await pool.list(relays, [...])
    return events.map(eventToRepository)
  } catch (err) {
    throw {
      code: 'RELAY_TIMEOUT',
      message: `Relay connection failed: ${err.message}`,
      userMessage: 'Unable to connect to Nostr relays. Retrying...',
      context: { relays: DEFAULT_RELAYS }
    } as RigError
  }
}
```

**Loading State Pattern:**
- ✅ Use TanStack Query's `status` field: `'pending' | 'error' | 'success'`
- ✅ Check `status === 'pending'` for loading states
- ✅ Check `status === 'error'` for error states
- ✅ Data is guaranteed available when `status === 'success'`

**Implementation:**
```typescript
// ✅ Correct
function RepoList() {
  const { data, status, error } = useRepositories()

  if (status === 'pending') return <LoadingSpinner />
  if (status === 'error') return <ErrorState error={error} />

  return <RepoGrid repos={data} />
}
```

---

## Communication Patterns

**Subscription Management Pattern:**
- ✅ Separate hooks for subscriptions vs data queries
- ✅ Naming: `useRealtime*` for subscription hooks, `use*` for query hooks
- ✅ Subscription hooks invalidate cache, query hooks fetch data
- ✅ Page-level lifecycle: subscribe on mount, unsubscribe on unmount

**Implementation:**
```typescript
// ✅ Correct - Separate hooks
// hooks/useRealtimeIssues.ts
export function useRealtimeIssues(repoId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const sub = pool.subscribeMany(
      relays,
      [{ kinds: [ISSUE, COMMENT], '#a': [repoId] }],
      {
        onevent: (event) => {
          queryClient.invalidateQueries(['issues', repoId])
        }
      }
    )

    return () => sub.close()
  }, [repoId, queryClient])
}

// hooks/useIssues.ts
export function useIssues(repoId: string) {
  return useQuery({
    queryKey: ['issues', repoId],
    queryFn: () => fetchIssues(repoId),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// Component usage
function IssueList({ repoId }: { repoId: string }) {
  useRealtimeIssues(repoId)  // Subscribe to updates
  const { data, status } = useIssues(repoId)  // Fetch data

  if (status === 'pending') return <LoadingSpinner />
  return <IssueGrid issues={data} />
}
```

**Cache Update Strategy:**
- ✅ Invalidate and refetch on new events
- ✅ Use `queryClient.invalidateQueries()` in subscription handlers
- ✅ Let TanStack Query handle refetching automatically
- ✅ Rely on cache policies for freshness (repos: 1hr, issues: 5min)

**Implementation:**
```typescript
// ✅ Correct
onevent: (event) => {
  queryClient.invalidateQueries(['issues', repoId])
  // TanStack Query refetches automatically based on staleTime
}
```

---

## Process Patterns

**Error Handling Placement:**
- ✅ Service layer: Throw structured `RigError` objects
- ✅ Hook layer: Propagate errors via TanStack Query (no try-catch needed)
- ✅ Component layer: Display errors using `status === 'error'`
- ✅ Error boundaries: Wrap page-level components to catch unhandled errors

**Layered Approach:**
```typescript
// Layer 1: Service (lib/nostr.ts)
export async function fetchRepositories(): Promise<Repository[]> {
  try {
    const events = await pool.list(relays, [{ kinds: [REPO_ANNOUNCEMENT] }])
    return events
      .filter(event => verifyEvent(event))
      .map(event => RepoEventSchema.parse(event))
      .map(eventToRepository)
  } catch (err) {
    throw {
      code: 'RELAY_TIMEOUT',
      message: err.message,
      userMessage: 'Failed to load repositories. Retrying...'
    } as RigError
  }
}

// Layer 2: Hook (hooks/useRepositories.ts)
export function useRepositories() {
  return useQuery({
    queryKey: ['repositories'],
    queryFn: fetchRepositories,
    retry: 3
  })
}

// Layer 3: Component (features/repository/RepoList.tsx)
export function RepoList() {
  const { data, status, error } = useRepositories()

  if (status === 'error') return <ErrorState error={error as RigError} />
  if (status === 'pending') return <LoadingSpinner />
  return <RepoGrid repos={data} />
}
```

**Event Validation Timing:**
- ✅ Validate at service layer (early, single entry point)
- ✅ Signature validation first: `verifyEvent()` from nostr-tools
- ✅ Schema validation second: Zod `parse()` for structure
- ✅ Filter out invalid events before transformation
- ✅ Components receive guaranteed-valid data

**Implementation:**
```typescript
// ✅ Correct - Validate at service layer
import { verifyEvent } from 'nostr-tools'
import { RepoEventSchema } from '@/types/nostr'

export async function fetchRepositories(): Promise<Repository[]> {
  const events = await pool.list(relays, [{ kinds: [REPO_ANNOUNCEMENT] }])

  return events
    .filter(event => {
      if (!verifyEvent(event)) {
        console.warn('Invalid signature:', event.id)
        return false
      }
      return true
    })
    .map(event => {
      try {
        const validated = RepoEventSchema.parse(event)
        return eventToRepository(validated)
      } catch (err) {
        console.warn('Invalid event structure:', event.id, err)
        return null
      }
    })
    .filter(Boolean) as Repository[]
}
```

---

## Enforcement Guidelines

**All AI Agents MUST:**

1. **Follow Naming Conventions:**
   - PascalCase for components and types
   - camelCase for hooks, utilities, functions
   - SCREAMING_SNAKE_CASE for constants and event kinds
   - Co-locate tests with `.test` suffix

2. **Use Centralized Types:**
   - All type definitions in `src/types/`
   - Domain-specific files (nostr.ts, repository.ts, etc.)
   - Import types from `@/types`

3. **Transform at Service Layer:**
   - Service functions return domain models, not raw events
   - Components work with clean, typed objects
   - Transformation functions in `lib/transformers/`

4. **Handle Errors in Layers:**
   - Service: Throw structured `RigError` objects
   - Hook: Propagate via TanStack Query
   - Component: Display using `status === 'error'`
   - Error boundaries at page level

5. **Validate Early:**
   - Signature validation first (`verifyEvent()`)
   - Schema validation second (Zod `parse()`)
   - Filter invalid events at service layer

6. **Use TanStack Query Patterns:**
   - `status` field for loading/error states
   - Separate hooks for subscriptions vs queries
   - Invalidate and refetch for cache updates

7. **Structure Consistently:**
   - Feature-based organization under `src/features/`
   - Co-located tests next to implementation
   - Centralized types in `src/types/`

---

## Pattern Verification

**How to Verify Patterns:**
- Code review checklist against these patterns
- ESLint rules for naming conventions
- TypeScript strict mode catches type violations
- Test coverage ensures validation runs

**Pattern Violations:**
- Document in PR comments with reference to this section
- Update code to match established patterns
- If pattern doesn't fit, discuss before breaking convention

**Updating Patterns:**
- Patterns can evolve based on learnings
- Update this document when patterns change
- Communicate pattern changes to all agents

---
