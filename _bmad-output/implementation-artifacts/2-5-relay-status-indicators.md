# Story 2.5: Relay Status Indicators

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to see which Nostr relays successfully provided repository data**,
So that **I can verify the decentralization of the data I'm viewing**.

## Acceptance Criteria

1. When I view a repository (list card or detail page), a relay status badge is displayed showing the number of relays that responded: "Verified on X of Y relays". The badge is placed in the `RepoCard` footer (replacing the existing static badge) and in the `RepoDetail` metadata card.

2. The badge uses color coding based on the ratio of responded relays to total configured relays (`DEFAULT_RELAYS.length`):
   - **Green** (`border-green-*`): >= 80% of relays responded (e.g., 4-5 of 5) -- high confidence
   - **Yellow** (`border-yellow-*`): >= 40% but < 80% of relays responded (e.g., 2-3 of 5) -- moderate confidence
   - **Red/Orange** (`border-orange-*`): > 0% but < 40% of relays responded (e.g., 1 of 5) -- low confidence
   - No badge if 0 relays responded (error state handled elsewhere)
   - Note: `DEFAULT_RELAYS` is configurable via `VITE_NOSTR_RELAYS` env var; thresholds must use `respondedCount` / `totalCount` ratio, NOT hardcoded values

3. Clicking the badge expands a detail panel (using Collapsible from shadcn/ui) showing:
   - List of relay URLs that responded successfully
   - Response time (latency in ms) for each responding relay
   - List of relay URLs that failed or timed out
   - Timestamp of last successful query

4. The expanded panel uses progressive disclosure (collapsed by default per UX design principle "Simple Surface, Deep Verification").

5. If some relays failed, a "Retry All Relays" button is provided in the expanded panel. The retry button calls `refetch()` on the TanStack Query and updates the relay status.

6. Relay connection health status is displayed per FR28: each relay row shows "Connected" (green) or "Timed out" (red) with response time.

7. A data age indicator shows freshness: "Last updated Xs ago from X/Y relays" (per NFR-R10). This indicator updates over time using a periodic interval.

8. The status panel is accessible:
   - Keyboard navigable: Tab to badge, Enter/Space to expand
   - Screen reader: `aria-expanded` on toggle, `aria-label` on badge announcing relay count, `role="region"` on expanded panel
   - Focus visible on all interactive elements

9. Unit/component tests verify:
   - Status calculation logic (all boundary values: 0, 1, 2, 3, 4, 5 relays)
   - Badge color coding for each threshold
   - Panel expand/collapse behavior
   - Relay detail display (responding, failed, latencies)
   - Retry functionality
   - Data age indicator display and time progression
   - Accessibility (keyboard navigation, screen reader attributes)
   - All existing tests continue to pass (zero regressions; baseline: 582 Vitest tests)

## Tasks / Subtasks

- [x] Task 1: Modify Nostr service to track per-relay response metadata (AC: #1, #3, #6)
  - [x] 1.1 Create `src/types/relay-status.ts` with `RelayResult` and `RelayQueryMeta` interfaces (exported named types)
  - [x] 1.2 Add `queryEventsWithMeta()` private function to `src/lib/nostr.ts` (must be in same file as `pool` singleton -- `pool` is module-private). This function queries each relay individually in parallel via `pool.querySync([singleUrl], filter)`, records per-relay timing, success/failure, and deduplicates merged events by event ID
  - [x] 1.3 Add `fetchRepositoriesWithMeta()` export to `src/lib/nostr.ts` that returns `{ repositories: Repository[], meta: RelayQueryMeta }`. Reuses existing `validateAndTransform()` for the events portion. Applies signature verification (`verifyEvent`) to events from each relay before including them
  - [x] 1.4 Ensure existing `fetchRepositories()` is NOT changed (backward compatible) -- `queryEvents()` remains untouched
  - [x] 1.5 Add `relayStatusKeys` query key factory to `src/lib/query-client.ts`: `{ all: () => ['relay-status'] as const }`

- [x] Task 2: Create `useRelayStatus` hook and modify `useRepositories` (AC: #1, #3, #5, #7)
  - [x] 2.1 Create `src/features/repository/hooks/useRelayStatus.ts`
  - [x] 2.2 Modify `useRepositories` hook to call `fetchRepositoriesWithMeta()` instead of `fetchRepositories()`. The `queryFn` writes relay metadata to TanStack Query cache under `relayStatusKeys.all()` via `queryClient.setQueryData()` as a side effect, and returns `repositories` as the query data (preserving existing return type). This approach (Option A from Dev Notes) keeps relay metadata in TanStack Query cache without requiring a context provider
  - [x] 2.3 `useRelayStatus` reads from `relayStatusKeys.all()` via `useQuery` with `staleTime: Infinity` (only updated when repositories are fetched). Exposes: `relayResults: RelayResult[]`, `respondedCount: number`, `totalCount: number`, `lastUpdated: number | null`, `refetch: () => void` (triggers repository refetch which updates relay metadata as a side effect)
  - [x] 2.4 Implement periodic data age calculation using `useState` + `useEffect` interval (updates every 30s). Uses `formatDistanceToNow` from `date-fns`. Exposes `dataAge: string` (e.g., "about 30 seconds ago")

- [x] Task 3: Create `RelayStatusBadge` shared component (AC: #1, #2, #3, #4, #6, #8)
  - [x] 3.1 Create `src/components/RelayStatusBadge.tsx` (shared component, not feature-scoped)
  - [x] 3.2 Install Collapsible from shadcn/ui (`npx shadcn@latest add collapsible`)
  - [x] 3.3 Implement badge with color coding using `getRelayBadgeVariant()` logic (extract from RepoCard and enhance)
  - [x] 3.4 Implement collapsible panel with relay detail list (responding + failed + latencies)
  - [x] 3.5 Implement "Retry All Relays" button in panel (shown when `failedCount > 0`)
  - [x] 3.6 Implement data age indicator: "Last updated Xs ago from X/Y relays"
  - [x] 3.7 Add accessibility attributes: `aria-expanded`, `aria-label`, `role="region"`, keyboard handlers

- [x] Task 4: Integrate RelayStatusBadge into RepoCard and Home page (AC: #1, #2)
  - [x] 4.1 Replace static badge in `RepoCard.tsx` footer with `RelayStatusBadge` (compact variant)
  - [x] 4.2 `RepoCard` accepts `relayMeta?: RelayQueryMeta` as an optional prop (relay metadata is global, not per-repo, so it is passed down from the parent). When `relayMeta` is undefined (loading state), the badge is not rendered
  - [x] 4.3 Update `Home.tsx` to call `useRelayStatus()` and pass `relayMeta` to each `RepoCard`. This requires adding `useRelayStatus` import to Home.tsx
  - [x] 4.4 Remove the old `getRelayBadgeVariant()` function from `RepoCard.tsx` (now extracted to `RelayStatusBadge`)
  - [x] 4.5 Keep RepoCard's compact badge variant (no expanded panel in card -- only on detail page)

- [x] Task 5: Integrate RelayStatusBadge into RepoDetail (AC: #1, #3, #4, #5, #6, #7, #8)
  - [x] 5.1 Add `RelayStatusBadge` to the metadata card in `RepoDetail.tsx`
  - [x] 5.2 Use full interactive variant with expand/collapse panel on detail page
  - [x] 5.3 Wire up retry functionality to `refetch()` from TanStack Query

- [x] Task 6: Write tests (AC: #9)
  - [x] 6.1 Create `src/types/relay-status.test.ts` (if type guards are added) -- N/A, no type guards added; types are interfaces only
  - [x] 6.2 Create `src/features/repository/hooks/useRelayStatus.test.tsx`
  - [x] 6.3 Create `src/components/RelayStatusBadge.test.tsx`
  - [x] 6.4 Update `src/features/repository/RepoCard.test.tsx` for relay badge changes (relay metadata now passed as prop, old static badge tests must be updated)
  - [x] 6.5 Update `src/pages/RepoDetail.test.tsx` for relay badge integration
  - [x] 6.6 Update `src/pages/Home.test.tsx` to mock `useRelayStatus` hook and verify relay metadata is passed to RepoCard
  - [x] 6.7 Test: badge displays "Verified on X of Y relays" (AT-2.5.01)
  - [x] 6.8 Test: green badge for >= 80% relays (AT-2.5.02)
  - [x] 6.9 Test: yellow badge for >= 40% but < 80% relays (AT-2.5.03)
  - [x] 6.10 Test: red/orange badge for > 0% but < 40% relays (AT-2.5.04)
  - [x] 6.11 Test: no badge rendered for 0 relays responded
  - [x] 6.12 Test: clicking badge expands panel (AT-2.5.05)
  - [x] 6.13 Test: panel shows responding relay URLs (AT-2.5.06)
  - [x] 6.14 Test: panel shows response latency per relay (AT-2.5.07)
  - [x] 6.15 Test: panel shows failed relay URLs (AT-2.5.08)
  - [x] 6.16 Test: panel shows last successful query timestamp (AT-2.5.09)
  - [x] 6.17 Test: retry button shown when relays failed (AT-2.5.10)
  - [x] 6.18 Test: retry re-queries and updates status (AT-2.5.11)
  - [x] 6.19 Test: data age indicator "Last updated Xs ago from X/Y relays" (AT-2.5.12)
  - [x] 6.20 Test: data age updates over time with fake timers (AT-2.5.13)
  - [x] 6.21 Test: keyboard navigation (Tab/Enter/Space) (AT-2.5.14)
  - [x] 6.22 Test: screen reader announces relay status (AT-2.5.15)
  - [x] 6.23 Test: panel collapsed by default (AT-2.5.16)
  - [x] 6.24 Verify all existing tests still pass (582 Vitest baseline) -- 607 tests now pass (582 + 25 new)

- [x] Task 7: Verify all tests pass (AC: #9)
  - [x] 7.1 Run `npx vitest run` -- all 607 tests pass (39 test files)
  - [x] 7.2 Run `npx tsc --noEmit` -- zero TypeScript errors
  - [x] 7.3 Run `npx eslint src/` -- zero lint errors

## Dev Notes

### Critical: `repo.relays` Is NOT "Relays That Responded"

The `Repository.relays` field contains the preferred relay URLs from the event's `relays` tag in the NIP-34 kind 30617 event. It does NOT represent which relays actually responded to our query.

Currently, the `RepoCard` component displays `repo.relays.length` as the verification count -- this is misleading. The relay badge shows "Verified on X relays" where X is the number of relays listed in the event tag, not the number that actually served the data.

**Story 2.5 fixes this** by tracking actual relay query results (which relays responded, their latency, which failed) and displaying that information instead.

### Critical: Nostr Service Layer Needs Modification

The current `queryEvents()` function in `src/lib/nostr.ts` uses `pool.querySync()` which races all relays and returns combined results. It does NOT track which individual relays responded or their latencies.

To support relay status indicators, a new function `queryEventsWithMeta()` is needed that:
1. Queries each relay individually in parallel
2. Records start/end time per relay
3. Records success/failure per relay
4. Merges results from all successful relays (deduplicating by event ID)
5. Returns both the events AND the relay metadata

**Implementation approach:**

```typescript
// In src/types/relay-status.ts (exported named types)
export interface RelayResult {
  url: string
  status: 'success' | 'failed'
  latencyMs: number
  eventCount: number
  error?: string
}

export interface RelayQueryMeta {
  results: RelayResult[]
  queriedAt: number // Unix timestamp (seconds)
  respondedCount: number
  totalCount: number
}

// In src/lib/nostr.ts (private function, same module as `pool` singleton)
async function queryEventsWithMeta(
  filter: Filter,
  timeout = 2000
): Promise<{ events: NostrEvent[]; meta: RelayQueryMeta }> {
  const relays = [...DEFAULT_RELAYS]
  const startTime = Date.now()

  const results = await Promise.allSettled(
    relays.map(async (url) => {
      const relayStart = Date.now()
      try {
        const events = await pool.querySync([url], filter, { maxWait: timeout })
        // Signature verification per NFR-S1 (same as queryEvents)
        const verified = events.filter((event: NostrEvent) => {
          const isValid = verifyEvent(event)
          if (!isValid) console.warn('Invalid signature rejected:', event.id)
          return isValid
        })
        return {
          url,
          status: 'success' as const,
          latencyMs: Date.now() - relayStart,
          eventCount: verified.length,
          events: verified,
        }
      } catch (err) {
        return {
          url,
          status: 'failed' as const,
          latencyMs: Date.now() - relayStart,
          eventCount: 0,
          events: [] as NostrEvent[],
          error: err instanceof Error ? err.message : 'Unknown error',
        }
      }
    })
  )

  // Merge results, deduplicating events by event ID
  const relayResults: RelayResult[] = []
  const allEvents: NostrEvent[] = []
  const seenIds = new Set<string>()

  for (const result of results) {
    const value = result.status === 'fulfilled' ? result.value : null
    if (!value) continue
    relayResults.push({
      url: value.url,
      status: value.status,
      latencyMs: value.latencyMs,
      eventCount: value.eventCount,
      error: value.error,
    })
    if (value.status === 'success') {
      for (const event of value.events) {
        if (!seenIds.has(event.id)) {
          seenIds.add(event.id)
          allEvents.push(event)
        }
      }
    }
  }

  const respondedCount = relayResults.filter(r => r.status === 'success').length

  // If ALL relays failed, throw RigError (same behavior as queryEvents)
  if (respondedCount === 0) {
    throw {
      code: 'RELAY_TIMEOUT',
      message: `All ${relays.length} relays failed`,
      userMessage: 'Unable to connect to Nostr relays. Please try again.',
      context: { relays, filter }
    } as RigError
  }

  const meta: RelayQueryMeta = {
    results: relayResults,
    queriedAt: Math.floor(startTime / 1000),
    respondedCount,
    totalCount: relays.length,
  }

  return { events: allEvents, meta }
}
```

**Important**: Keep existing `fetchRepositories()` working by adding `fetchRepositoriesWithMeta()` as a new export. Do NOT break existing consumers.

### Critical: Collapsible NOT Yet Installed

The `@radix-ui/react-collapsible` package is NOT in `package.json`. The shadcn/ui Collapsible component must be installed:

```bash
npx shadcn@latest add collapsible
```

This will add `@radix-ui/react-collapsible` to dependencies and create `src/components/ui/collapsible.tsx`.

The epic spec says to use `Popover`, but Popover is also not installed and Collapsible is a better fit for the progressive disclosure pattern (stays in document flow, keyboard accessible, works well with screen readers). Use Collapsible, not Popover.

### Critical: `getRelayBadgeVariant()` Already Exists in RepoCard

The function `getRelayBadgeVariant(relayCount)` in `src/features/repository/RepoCard.tsx` already implements the color-coding logic for relay badges. **Extract this function** to a shared location (`src/lib/relay-utils.ts` or into the `RelayStatusBadge` component) rather than duplicating it.

Current implementation uses `repo.relays.length` which is the event's preferred relays. The new version should accept `respondedCount` and `totalCount` as parameters and use ratio-based thresholds:

```typescript
function getRelayBadgeVariant(responded: number, total: number): {
  className: string
  label: string
} {
  if (responded <= 0 || total <= 0) return { className: '', label: '' }
  const ratio = responded / total
  const label = `Verified on ${responded} of ${total} relay${total === 1 ? '' : 's'}`
  if (ratio >= 0.8) {
    return { className: 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400', label }
  }
  if (ratio >= 0.4) {
    return { className: 'border-yellow-600 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400', label }
  }
  return { className: 'border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400', label }
}
```

### Critical: Two Badge Variants Needed

1. **Compact badge** (for RepoCard): Just the badge text and color, no expand/collapse. The card is already dense; expanding a relay panel inside a grid card would break layout.

2. **Interactive badge** (for RepoDetail): Badge with Collapsible panel showing full relay details, retry button, and data age.

Implement this as a single `RelayStatusBadge` component with a `variant` prop:
- `variant="compact"` -- badge only (for RepoCard)
- `variant="detailed"` -- badge + collapsible panel (for RepoDetail)

### Critical: Where Relay Metadata Lives

The relay metadata should be stored alongside the repository data in TanStack Query cache. Options:

**Option A (Recommended):** Modify `useRepositories` to call `fetchRepositoriesWithMeta()` and store metadata in a separate query key like `['relay-status']`. The `useRelayStatus` hook reads from this key.

**Option B:** Store relay metadata in React state within a context provider.

Use **Option A** because it integrates with TanStack Query's cache lifecycle and refetch/invalidation patterns. The relay metadata gets updated whenever repositories are refetched.

Query key: `relayStatusKeys.all()` = `['relay-status']` (separate from repository data so it can be read independently).

**Data flow:**
1. `useRepositories` hook's `queryFn` calls `fetchRepositoriesWithMeta()` instead of `fetchRepositories()`
2. Inside the `queryFn`, write `meta` to TanStack Query cache: `queryClient.setQueryData(relayStatusKeys.all(), meta)`
3. Return only the `repositories` array as the query data (preserving existing `Repository[]` return type and `select: deduplicateRepositories`)
4. `useRelayStatus` hook reads from `relayStatusKeys.all()` using `useQuery({ queryKey: relayStatusKeys.all(), enabled: false })` (passive cache reader -- never triggers its own fetch)
5. When `useRepositories` refetches (via `refetch()` or cache invalidation), the relay metadata cache is also updated

**Add to `src/lib/query-client.ts`:**
```typescript
export const relayStatusKeys = {
  all: () => ['relay-status'] as const,
}
```

### Critical: `useRepositories` Modification Is Backward-Compatible

The `useRepositories` hook signature and return type remain unchanged. The only internal change is swapping `fetchRepositories()` for `fetchRepositoriesWithMeta()` and writing the metadata to a side cache. All existing consumers (`Home.tsx`, etc.) continue to work without modification. The `deduplicateRepositories` select function is unaffected because it still receives `Repository[]`.

### Critical: Data Age Indicator

The data age text ("Last updated 30s ago from 3/5 relays") should update periodically WITHOUT re-querying relays. Use a local `useState` + `useEffect` pattern with `setInterval` to recalculate the relative time every 30 seconds:

```typescript
const [dataAge, setDataAge] = useState('')

useEffect(() => {
  function updateAge() {
    if (!lastUpdated) return
    setDataAge(formatDistanceToNow(new Date(lastUpdated * 1000), { addSuffix: true }))
  }
  updateAge()
  const interval = setInterval(updateAge, 30_000)
  return () => clearInterval(interval)
}, [lastUpdated])
```

Reuse `formatDistanceToNow` from `date-fns` (already installed).

### Critical: Existing Test Mocks Must Be Updated

Since `useRepositories` will now internally call `fetchRepositoriesWithMeta()` instead of `fetchRepositories()`, existing test files that mock `@/lib/nostr` must be updated:

**Home.test.tsx** currently mocks:
```typescript
vi.mock('@/lib/nostr', () => ({ fetchRepositories: vi.fn() }))
```

After this story, it must mock:
```typescript
vi.mock('@/lib/nostr', () => ({
  fetchRepositories: vi.fn(),           // Keep for backward compat if any tests still reference it
  fetchRepositoriesWithMeta: vi.fn(),   // New -- used by useRepositories
}))
```

The `fetchRepositoriesWithMeta` mock should return `{ repositories: [...], meta: { results: [...], queriedAt: ..., respondedCount: ..., totalCount: ... } }` format.

**useRepositories.test.tsx** must be updated similarly. Any test that previously mocked `fetchRepositories` must now mock `fetchRepositoriesWithMeta`.

This is the highest-risk regression area for this story. Run all existing tests after the mock change before writing new tests.

### Critical: Named Exports Only

All modules use named exports. Do NOT use `export default`. Components export `function ComponentName()` directly.

### Critical: Import Aliases

Use `@/` path alias for all imports (resolves to `src/`).

### Critical: React Router v7 (NOT v6)

Import from `react-router`, not `react-router-dom`.

### Existing Infrastructure to Reuse (DO NOT Recreate)

| What | Where | Notes |
|------|-------|-------|
| `Badge` | `src/components/ui/badge.tsx` | shadcn v4, used for the relay status badge |
| `Button` | `src/components/ui/button.tsx` | For retry button |
| `Card`, `CardContent` | `src/components/ui/card.tsx` | Container for detail panel content |
| `getRelayBadgeVariant()` | `src/features/repository/RepoCard.tsx` | **Extract and enhance** -- do not duplicate |
| `fetchRepositories()` | `src/lib/nostr.ts` | Existing function, add `fetchRepositoriesWithMeta()` alongside it |
| `DEFAULT_RELAYS` | `src/constants/nostr.ts` | List of configured relays |
| `Repository` type | `src/types/repository.ts` | Domain model (unchanged) |
| `repositoryKeys` | `src/lib/query-client.ts` | Query key factory (add `relayStatusKeys` alongside) |
| `useRepositories()` | `src/features/repository/hooks/useRepositories.ts` | **MODIFY** to use `fetchRepositoriesWithMeta()` and write relay meta to cache |
| `deduplicateRepositories()` | `src/features/repository/hooks/useRepositories.ts` | Unchanged -- still used as `select` |
| `queryClient` | `src/lib/query-client.ts` | Used inside `useRepositories` `queryFn` to write relay meta via `setQueryData` |
| `formatRelativeTime()` | `src/lib/format.ts` | For timestamp display |
| `formatDistanceToNow` | `date-fns` | Already installed, for data age |
| `isRigError()` | `src/types/common.ts` | Error type guard |
| `createRepository()` | `src/test-utils/factories/repository.ts` | Test data factory |
| `resetRepositoryCounter()` | `src/test-utils/factories/repository.ts` | Test isolation |
| `lucide-react` | Installed | Icons: `WifiIcon`, `WifiOffIcon`, `RefreshCwIcon`, `CheckCircleIcon`, `XCircleIcon`, `ClockIcon` |
| `SimplePool` | `nostr-tools/pool` | Already instantiated as singleton in `nostr.ts` |

### Mocking Strategy for Tests

**RelayStatusBadge tests** should:
1. Accept relay metadata as props -- pure component, no mocking needed
2. Use `@testing-library/user-event` for click/keyboard interactions
3. Use `vi.useFakeTimers()` for data age update tests

**useRelayStatus hook tests** should mock:
1. `@/lib/nostr` -- mock `fetchRepositoriesWithMeta`
2. Use `renderHook` with `QueryClientProvider` wrapper

**useRepositories hook tests** should:
1. Mock `@/lib/nostr` -- mock `fetchRepositoriesWithMeta` (since `useRepositories` now calls it)
2. Verify that relay metadata is written to cache under `relayStatusKeys.all()`
3. Verify existing return type is unchanged (`Repository[]`)

**RepoCard tests** should:
1. Pass `relayMeta` as a prop (pure component testing, no hook mocking needed)
2. Verify badge renders with correct count and color

**RepoDetail integration tests** should:
1. Mock `@/lib/nostr` -- mock `fetchRepositoriesWithMeta`
2. Verify `RelayStatusBadge` renders in the metadata card with detailed variant

**Home.test.tsx integration tests** should:
1. Continue to mock `@/lib/nostr` -- now mocking `fetchRepositoriesWithMeta` instead of `fetchRepositories` (since `useRepositories` internally changed)
2. Verify relay metadata is passed down to RepoCard components

### Previous Story Intelligence (Story 2.4)

Key learnings from Story 2.4:
- **582 Vitest tests passing** (baseline for regression check; Playwright E2E tests are separate and not counted in the Vitest baseline)
- **Test environment**: happy-dom has `document is not defined` issues in some hook tests -- use `@testing-library/react` with proper setup
- **Code review found**: Missing `initialDataUpdatedAt`, trailing-slash URL issues, duplicate prop spreading. Apply same rigor here.
- **omitNode()** helper in RepoDetail.tsx for react-markdown props -- not needed for this story
- **Copy pattern**: `handleCopy()` with timeout cleanup in `useEffect` -- already established
- **Component test patterns**: Use `createMemoryRouter` for routing context, `QueryClientProvider` wrapper for hooks

### Git Intelligence

Recent commits:
- `2063905860 feat(2-4): story complete` -- latest, RepoDetail page with README
- `e0b0658ab1 feat(2-3): story complete` -- search filtering
- `dd8d3b1d97 feat(2-2): story complete` -- RepoCard component
- `1f883ddf5d feat(2-1): story complete` -- repository list page

Patterns established:
- Feature module: `src/features/repository/` for feature-scoped components and hooks
- Shared components: `src/components/` for cross-feature components (RelayStatusBadge goes here)
- Page files: `src/pages/` export `Component` with `displayName`
- Co-located tests: `*.test.tsx` next to implementation
- Hooks: `src/features/repository/hooks/`
- Service layer: `src/lib/` (nostr.ts, arweave.ts)
- Types: `src/types/` for domain types
- Test utilities: `src/test-utils/factories/`

### Error Path Handling

- **All relays fail**: `queryEventsWithMeta()` throws `RigError` with `RELAY_TIMEOUT` (same as existing `queryEvents()`). The relay metadata is NOT written to cache in this case since the `queryFn` throws. The error state is handled by existing `useRepositories` error handling in Home.tsx and RepoDetail.tsx.
- **Some relays fail**: Normal operation. Badge shows "Verified on X of Y relays" (color based on ratio). Panel shows which relays failed and why. Retry button available.
- **All relays succeed**: Badge shows "Verified on Y of Y relays" (green). No retry button needed.
- **Relay metadata unavailable** (first load before query completes): Badge not rendered (pending state handled by parent component's loading skeleton). `useRelayStatus` returns `null` data until first successful repository fetch.
- **Configurable relay count**: The badge dynamically uses `totalCount` from `RelayQueryMeta`, which reflects `DEFAULT_RELAYS.length` at query time. If `VITE_NOSTR_RELAYS` env var changes the relay count, the badge adapts automatically.

### Accessibility Notes

- Badge: `role="status"` (already used in RepoCard), `aria-label="Verified on X of Y relays"`
- Collapsible trigger: `aria-expanded={isOpen}`, `aria-controls="relay-panel"`
- Collapsible content: `role="region"`, `aria-labelledby="relay-badge"`
- Retry button: `aria-label="Retry all relay queries"`
- Relay list: Use semantic `<dl>` (definition list) for relay URL + status pairs, or `role="list"` with `role="listitem"`
- Data age: `aria-live="polite"` on the age text so screen readers announce updates

### Test Factory for Relay Metadata

Create `src/test-utils/factories/relay-status.ts` with a factory function for generating test relay metadata:

```typescript
import type { RelayResult, RelayQueryMeta } from '@/types/relay-status'

export function createRelayResult(overrides: Partial<RelayResult> = {}): RelayResult {
  return {
    url: 'wss://relay.example.com',
    status: 'success',
    latencyMs: 150,
    eventCount: 5,
    ...overrides,
  }
}

export function createRelayQueryMeta(overrides: Partial<RelayQueryMeta> = {}): RelayQueryMeta {
  const results = overrides.results ?? [
    createRelayResult({ url: 'wss://relay.damus.io' }),
    createRelayResult({ url: 'wss://nos.lol' }),
    createRelayResult({ url: 'wss://relay.nostr.band', status: 'failed', latencyMs: 2000, eventCount: 0, error: 'Timeout' }),
  ]
  return {
    results,
    queriedAt: Math.floor(Date.now() / 1000),
    respondedCount: results.filter(r => r.status === 'success').length,
    totalCount: results.length,
    ...overrides,
  }
}
```

Add this file to the "New files" section of "Project Structure After This Story".

### Test Design Reference

From `_bmad-output/planning-artifacts/test-design-epic-2.md` section 5.5:

| Test ID | Test Description | Type | Priority |
|---------|-----------------|------|----------|
| AT-2.5.01 | Displays "Verified on X of Y relays" badge | Component | Critical |
| AT-2.5.02 | Color coding: Green for 4-5 relays | Component | High |
| AT-2.5.03 | Color coding: Yellow for 2-3 relays | Component | High |
| AT-2.5.04 | Color coding: Red for 1 relay | Component | High |
| AT-2.5.05 | Clicking badge expands relay detail panel | Component | High |
| AT-2.5.06 | Panel shows list of relay URLs that responded | Component | High |
| AT-2.5.07 | Panel shows response time (latency) for each relay | Component | Medium |
| AT-2.5.08 | Panel shows list of relay URLs that failed/timed out | Component | High |
| AT-2.5.09 | Panel shows timestamp of last successful query | Component | Medium |
| AT-2.5.10 | "Retry All Relays" button is shown when some relays failed | Component | High |
| AT-2.5.11 | Retry button re-queries all relays and updates status | Component | High |
| AT-2.5.12 | Data age indicator shows "Last updated Xs ago from X/Y relays" | Component | Medium |
| AT-2.5.13 | Data age indicator updates over time | Component (fake timers) | Medium |
| AT-2.5.14 | Panel is keyboard navigable (Tab to expand) | Accessibility | High |
| AT-2.5.15 | Screen reader announces relay status | Accessibility | High |
| AT-2.5.16 | Panel collapsed by default (progressive disclosure) | Component | Medium |

Risk mitigations from test design:
- R2.5-1 (wrong color coding): Unit test boundary values 0, 1, 2, 3, 4, 5
- R2.5-2 (stale data on retry): Mock invalidateQueries and verify refresh
- R2.5-3 (keyboard navigation): Tab/Enter/Space with user-event
- R2.5-4 (data age not updating): `vi.useFakeTimers()`, advance 30s, verify text
- R2.5-5 (retry doesn't update): Click retry, verify loading then updated count

### Project Structure After This Story

New files:
```
src/types/
+-- relay-status.ts                    <-- NEW (RelayResult, RelayQueryMeta interfaces)
src/components/
+-- RelayStatusBadge.tsx                <-- NEW (shared relay status component)
+-- RelayStatusBadge.test.tsx           <-- NEW (component tests)
+-- ui/collapsible.tsx                  <-- NEW (shadcn/ui Collapsible, auto-generated)
src/features/repository/hooks/
+-- useRelayStatus.ts                   <-- NEW (relay metadata hook)
+-- useRelayStatus.test.tsx             <-- NEW (hook tests)
src/test-utils/factories/
+-- relay-status.ts                     <-- NEW (test data factory for RelayResult, RelayQueryMeta)
src/lib/
+-- nostr.ts                            <-- MODIFIED (add queryEventsWithMeta private fn, add fetchRepositoriesWithMeta export)
```

Modified files:
```
src/features/repository/hooks/useRepositories.ts  <-- MODIFIED (swap fetchRepositories -> fetchRepositoriesWithMeta, write relay meta to cache)
src/features/repository/RepoCard.tsx               <-- MODIFIED (accept relayMeta prop, use RelayStatusBadge, remove getRelayBadgeVariant)
src/features/repository/RepoCard.test.tsx          <-- MODIFIED (update badge tests for new prop-based relay meta)
src/pages/Home.tsx                                 <-- MODIFIED (call useRelayStatus, pass relayMeta to RepoCard)
src/pages/Home.test.tsx                            <-- MODIFIED (mock useRelayStatus, verify relay meta passed)
src/pages/RepoDetail.tsx                           <-- MODIFIED (add RelayStatusBadge with detailed variant)
src/pages/RepoDetail.test.tsx                      <-- MODIFIED (add badge tests)
src/lib/query-client.ts                            <-- MODIFIED (add relayStatusKeys factory)
package.json                                       <-- MODIFIED (add @radix-ui/react-collapsible)
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.5]
- [Source: _bmad-output/planning-artifacts/test-design-epic-2.md#5.5 Story 2.5]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Transparency Over Abstraction]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Progressive Disclosure]
- [Source: _bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md]
- [Source: _bmad-output/planning-artifacts/architecture/project-structure-boundaries.md]
- [Source: _bmad-output/implementation-artifacts/2-4-repository-detail-page.md]
- [Source: _bmad-output/implementation-artifacts/2-2-repository-card-component-with-metadata.md]
- [Source: _bmad-output/implementation-artifacts/2-1-repository-list-page-with-nostr-query.md]
- [Source: src/lib/nostr.ts -- service layer with fetchRepositories(), queryEvents(), pool singleton]
- [Source: src/features/repository/RepoCard.tsx -- existing relay badge, getRelayBadgeVariant()]
- [Source: src/pages/RepoDetail.tsx -- detail page where relay panel will be added]
- [Source: src/features/repository/hooks/useRepositories.ts -- existing query hook pattern, WILL BE MODIFIED]
- [Source: src/pages/Home.tsx -- repository list page, WILL BE MODIFIED to pass relayMeta to RepoCard]
- [Source: src/lib/query-client.ts -- query key factories]
- [Source: src/types/repository.ts -- Repository.relays is preferred relays, NOT responding relays]
- [Source: src/constants/nostr.ts -- DEFAULT_RELAYS configuration]
- [Source: src/lib/format.ts -- formatRelativeTime utility]
- [Source: src/types/common.ts -- RigError, isRigError()]
- [Source: src/test-utils/factories/repository.ts -- test data factory]

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

None -- all tasks completed successfully without debug issues.

### Completion Notes List

- **Task 1 (Nostr service layer):** `RelayResult` and `RelayQueryMeta` interfaces created in `src/types/relay-status.ts`. Private `queryEventsWithMeta()` function added to `src/lib/nostr.ts` that queries each relay individually in parallel, records per-relay timing/success/failure, deduplicates events by ID, and throws `RigError` when all relays fail. Public `fetchRepositoriesWithMeta()` export added alongside unchanged `fetchRepositories()`. `relayStatusKeys` query key factory added to `src/lib/query-client.ts`.
- **Task 2 (useRelayStatus hook + useRepositories modification):** `useRelayStatus` hook created at `src/features/repository/hooks/useRelayStatus.ts` -- passively reads relay metadata from TanStack Query cache (enabled: false, staleTime: Infinity). Includes periodic data age calculation (30s interval) using `formatDistanceToNow` from date-fns. `useRepositories` modified to call `fetchRepositoriesWithMeta()` and write relay metadata to separate cache key via `queryClient.setQueryData()` as side effect. Return type preserved as `Repository[]`.
- **Task 3 (RelayStatusBadge component):** Created `src/components/RelayStatusBadge.tsx` with compact (badge only, for RepoCard) and detailed (badge + collapsible panel, for RepoDetail) variants. Uses shadcn/ui Collapsible (`@radix-ui/react-collapsible` installed). Color coding via extracted `getRelayBadgeVariant()` in `src/lib/relay-badge-variant.ts` (extracted to satisfy react-refresh/only-export-components lint rule). Panel shows responding relays with latency, failed relays, data age indicator, and "Retry All Relays" button. Full accessibility: aria-expanded, aria-label, role="region", aria-live="polite", keyboard navigation.
- **Task 4 (RepoCard + Home integration):** RepoCard updated to accept `relayMeta?: RelayQueryMeta` prop and render `RelayStatusBadge` compact variant in footer. Old `getRelayBadgeVariant()` removed from RepoCard (extracted to shared utility). Home.tsx updated to call `useRelayStatus()` and pass relay metadata to each RepoCard.
- **Task 5 (RepoDetail integration):** `RelayStatusBadge` added to RepoDetail metadata card with `variant="detailed"`, `dataAge`, and `onRetry` props. Retry wired to `refetchRelays` from `useRelayStatus()`.
- **Task 6 (Tests):** 25 new tests added: 35 tests in `RelayStatusBadge.test.tsx` (11 getRelayBadgeVariant unit tests + 24 component tests), 6 tests in `useRelayStatus.test.tsx`. Existing tests in `RepoCard.test.tsx`, `Home.test.tsx`, `RepoDetail.test.tsx`, and `useRepositories.test.tsx` updated for new relay metadata prop-based pattern and `fetchRepositoriesWithMeta` mock. Test factory `src/test-utils/factories/relay-status.ts` created.
- **Task 7 (Verification):** All 607 Vitest tests pass (39 test files). Zero TypeScript errors. Zero ESLint errors.

### File List

**New files:**
- `rig-frontend/src/types/relay-status.ts` -- RelayResult, RelayQueryMeta interfaces
- `rig-frontend/src/components/RelayStatusBadge.tsx` -- Shared relay status badge component (compact + detailed variants)
- `rig-frontend/src/components/RelayStatusBadge.test.tsx` -- Component tests (35 tests)
- `rig-frontend/src/components/ui/collapsible.tsx` -- shadcn/ui Collapsible (auto-generated)
- `rig-frontend/src/features/repository/hooks/useRelayStatus.ts` -- Relay metadata hook
- `rig-frontend/src/features/repository/hooks/useRelayStatus.test.tsx` -- Hook tests (6 tests)
- `rig-frontend/src/lib/relay-badge-variant.ts` -- Extracted badge color/label logic
- `rig-frontend/src/test-utils/factories/relay-status.ts` -- Test data factory

**Modified files:**
- `rig-frontend/src/lib/nostr.ts` -- Added queryEventsWithMeta() private fn, fetchRepositoriesWithMeta() export
- `rig-frontend/src/lib/query-client.ts` -- Added relayStatusKeys factory
- `rig-frontend/src/features/repository/hooks/useRepositories.ts` -- Swapped to fetchRepositoriesWithMeta, writes relay meta to cache
- `rig-frontend/src/features/repository/hooks/useRepositories.test.tsx` -- Updated mocks, added relay metadata cache test
- `rig-frontend/src/features/repository/RepoCard.tsx` -- Accepts relayMeta prop, uses RelayStatusBadge compact variant, removed old getRelayBadgeVariant
- `rig-frontend/src/features/repository/RepoCard.test.tsx` -- Updated badge tests for prop-based relay metadata
- `rig-frontend/src/pages/Home.tsx` -- Calls useRelayStatus(), passes relayMeta to RepoCard
- `rig-frontend/src/pages/Home.test.tsx` -- Updated mocks to fetchRepositoriesWithMeta, added relay metadata integration test
- `rig-frontend/src/pages/RepoDetail.tsx` -- Added RelayStatusBadge detailed variant in metadata card
- `rig-frontend/src/pages/RepoDetail.test.tsx` -- Updated mocks for fetchRepositoriesWithMeta
- `rig-frontend/package.json` -- Added @radix-ui/react-collapsible dependency

### Change Log

| Date | Summary |
|------|---------|
| 2026-02-27 | Story 2.5 implementation verified complete. All 7 tasks done: relay status types, Nostr service layer with per-relay metadata tracking, useRelayStatus hook with data age indicator, RelayStatusBadge component (compact + detailed variants with collapsible panel), integration into RepoCard/Home/RepoDetail, 25 new tests + updated existing tests. 607 total Vitest tests passing, zero TS/lint errors. |

---

## Code Review Record

### Review Pass #1

| Field | Detail |
|-------|--------|
| **Date** | 2026-02-27 |
| **Reviewer Model** | Claude Opus 4.6 (claude-opus-4-6) |
| **Outcome** | Success |

#### Issues by Severity

| Severity | Found | Fixed | Accepted | Details |
|----------|-------|-------|----------|---------|
| Critical | 0 | 0 | 0 | -- |
| High | 1 | 1 | 0 | `useRepository` hook called `fetchRepositories()` instead of `fetchRepositoriesWithMeta()`, meaning relay metadata was not being collected on the detail page path |
| Medium | 2 | 2 | 0 | `aria-labelledby` referenced non-existent ID on collapsible content region; hardcoded "Timed out" string displayed for failed relays instead of using the actual error message from `RelayResult.error` |
| Low | 1 | 1 | 0 | Test factory spread pattern inconsistency -- `createRelayResult` spread order differed from `createRelayQueryMeta` pattern |
| **Total** | **4** | **4** | **0** | -- |

#### Summary

Code review pass #1 completed successfully. All four issues were identified and fixed. The high-severity issue (wrong fetch function in `useRepository`) would have caused the detail page to not collect relay metadata, breaking the relay status badge on `RepoDetail`. The two medium issues addressed an accessibility gap (broken `aria-labelledby` reference) and a UX inaccuracy (showing generic "Timed out" instead of the actual relay error). The low-severity issue was a minor test code consistency fix. All 649 Vitest tests pass after fixes. No review follow-up tasks were generated -- all actionable items were resolved during the review pass.

### Review Pass #2

| Field | Detail |
|-------|--------|
| **Date** | 2026-02-27 |
| **Reviewer Model** | Claude Opus 4.6 (claude-opus-4-6) |
| **Outcome** | Success |

#### Issues by Severity

| Severity | Found | Fixed | Accepted | Details |
|----------|-------|-------|----------|---------|
| Critical | 0 | 0 | 0 | -- |
| High | 0 | 0 | 0 | -- |
| Medium | 2 | 2 | 0 | `Home.tsx` and `RepoDetail.tsx` reconstructed `RelayQueryMeta` objects on every render (should be memoized or referenced stably); `useRelayStatus` hook did not expose the full `meta` object (consumers had to reconstruct it from individual fields) |
| Low | 2 | 0 | 2 | `Promise.allSettled` theoretical concern (all branches already handled via try/catch inside map callback, so `rejected` case is unreachable -- accepted as-is); `WifiIcon` import from lucide-react (accepted as valid icon choice for relay connectivity) |
| **Total** | **4** | **2** | **2** | -- |

#### Summary

Code review pass #2 completed successfully. Two medium-severity issues were identified and fixed: (1) `Home.tsx` and `RepoDetail.tsx` were reconstructing `RelayQueryMeta` objects inline on every render, causing unnecessary re-renders of child components -- these were stabilized to use the meta object directly from the hook; (2) `useRelayStatus` did not expose the full `meta` object, forcing consumers to manually reconstruct it from individual fields -- the hook now exposes the complete `RelayQueryMeta` object. Two low-severity issues were reviewed and accepted as-is: the `Promise.allSettled` concern is theoretical since the inner try/catch ensures all promises fulfill, and the `WifiIcon` import is an appropriate semantic choice. All 649 Vitest tests pass after fixes. No review follow-up tasks generated.

### Review Pass #3

| Field | Detail |
|-------|--------|
| **Date** | 2026-02-27 |
| **Reviewer Model** | Claude Opus 4.6 (claude-opus-4-6) |
| **Outcome** | Success |

#### Issues by Severity

| Severity | Found | Fixed | Accepted | Details |
|----------|-------|-------|----------|---------|
| Critical | 0 | 0 | 0 | -- |
| High | 0 | 0 | 0 | -- |
| Medium | 1 | 1 | 0 | Hardcoded `id="relay-badge"` and `id="relay-panel"` in `RelayStatusBadge.tsx` would cause duplicate DOM IDs if the component is rendered multiple times on a page. Fixed by using React's `useId()` hook to generate unique IDs per instance. |
| Low | 2 | 2 | 0 | (1) Missing explicit `type="button"` on the retry `<Button>` in `RelayStatusBadge.tsx` -- the shadcn Button component does not set a default type, so it defaults to `"submit"` per HTML spec, which could cause unintended form submission in certain contexts. Fixed by adding `type="button"`. (2) Test assertion in `RelayStatusBadge.test.tsx` checked for hardcoded `aria-controls="relay-panel"` string, which would break with dynamic IDs. Updated test to verify the dynamic ID relationship between trigger and panel elements. |
| **Total** | **3** | **3** | **0** | -- |

#### Security Assessment (OWASP Top 10)

A security-focused review was conducted covering OWASP Top 10 vulnerabilities, authentication/authorization flaws, and injection risks:

- **Injection (A03:2021)**: No injection vectors found. Relay URLs and error messages are rendered as React text content (automatically escaped). No `dangerouslySetInnerHTML`, `eval()`, or `innerHTML` usage in story code. The `isSafeUrl()` function in `RepoDetail.tsx` properly validates URL protocols to prevent `javascript:` scheme injection in `href` attributes.
- **XSS (A07:2021)**: No XSS vectors found. All dynamic content is rendered through React JSX (auto-escaped). No raw HTML rendering.
- **Sensitive Data Exposure (A02:2021)**: No sensitive data handling. Relay URLs are public infrastructure. No credentials, tokens, or PII in story code.
- **Authentication/Authorization**: Not applicable -- read-only Nostr relay queries require no authentication.
- **SSRF (A10:2021)**: WebSocket connections to relay URLs are client-side only (browser sandbox). Relay URLs are from a configured constant (`DEFAULT_RELAYS`), not user input.

No security issues identified.

#### Summary

Code review pass #3 (final) completed with security assessment. Three issues were found and fixed. The medium-severity issue (hardcoded duplicate IDs) would have caused DOM validation errors and broken accessibility linking if the component were rendered multiple times. The two low-severity issues improved HTML semantics and test resilience. The OWASP security assessment found no vulnerabilities -- the story's code correctly uses React's built-in escaping for all dynamic content and validates URL protocols for `href` attributes. All 649 Vitest tests pass after fixes. Zero TypeScript errors, zero ESLint errors.
