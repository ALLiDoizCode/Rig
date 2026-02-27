# Story 2.6: Real-Time Repository Updates

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to see new repositories appear automatically without refreshing the page**,
So that **I always see the latest repositories announced on the network**.

## Acceptance Criteria

1. When a new kind 30617 repository announcement event is published to the relays, the application receives the new event via a WebSocket subscription managed by `pool.subscribeMany()` from nostr-tools.

2. The new repository appears in the repository list on the Home page automatically (no manual page refresh required). The TanStack Query cache is invalidated via `queryClient.invalidateQueries({ queryKey: repositoryKeys.all() })` (TanStack Query v5 object form), which triggers an automatic refetch by `useRepositories`.

3. A subtle toast notification is shown: "New repository added: [repo name]" using a shadcn/ui Toast (Sonner). The notification auto-dismisses after 5 seconds.

4. WebSocket subscriptions are managed per page lifecycle:
   - Subscription created when Home page mounts (via `useEffect`)
   - Subscription closed via `sub.close()` when Home page unmounts (via cleanup return)

5. The subscription only listens for kind 30617 events (repository announcements) -- `{ kinds: [REPO_ANNOUNCEMENT] }`.

6. Real-time updates work correctly with the relay status indicators: the refetch triggered by cache invalidation calls `fetchRepositoriesWithMeta()` which updates relay metadata as a side effect.

7. If a received event has the same `d` tag as an existing repository (updated announcement), the `deduplicateRepositories` select function in `useRepositories` handles deduplication on refetch. No special handling needed in the realtime hook.

8. If an event has an invalid signature (`verifyEvent()` returns false), it is silently discarded with a console warning. Invalid events do NOT trigger cache invalidation.

9. If the WebSocket connection is lost, the SimplePool's built-in `enableReconnect: true` handles automatic reconnection. The subscription resumes automatically after reconnect because `pool.subscribeMany()` manages the underlying relay connections.

10. Unit/component tests verify:
    - Subscription lifecycle (mount creates subscription, unmount calls `sub.close()`)
    - Subscription filter is `{ kinds: [REPO_ANNOUNCEMENT] }`
    - Cache invalidation on valid new events
    - Toast notification display with repo name
    - Toast auto-dismiss after 5 seconds (fake timers)
    - Invalid signature events are discarded (no cache invalidation)
    - No state updates after unmount (no "set state on unmounted component" warnings)
    - All existing tests continue to pass (zero regressions; baseline: 649 Vitest tests)

## Tasks / Subtasks

- [x] Task 1: Install shadcn/ui Toast (Sonner) component (AC: #3)
  - [x] 1.1 Run `npx shadcn@latest add sonner` to install the Sonner toast component
  - [x] 1.2 Add `<Toaster />` provider to `src/App.tsx` (wrap existing `<RouterProvider>` and new `<Toaster />` in a `<>...</>` React fragment since `App` currently returns a single element)
  - [x] 1.3 Verify existing tests still pass after adding `<Toaster />`

- [x] Task 2: Create `useRealtimeRepositories` hook (AC: #1, #2, #4, #5, #7, #8, #9)
  - [x] 2.1 Create `src/features/repository/hooks/useRealtimeRepositories.ts`
  - [x] 2.2 Import `pool` -- STOP: `pool` is module-private in `src/lib/nostr.ts`. You MUST add a new export function `subscribeToRepositories(onEvent: (event: NostrEvent) => void): SubCloser` to `src/lib/nostr.ts` that wraps `pool.subscribeMany()` with the correct filter. Do NOT export `pool` directly.
  - [x] 2.3 The `subscribeToRepositories` function in `src/lib/nostr.ts` should:
    - Call `pool.subscribeMany([...DEFAULT_RELAYS], { kinds: [REPO_ANNOUNCEMENT] }, { onevent })`
    - Verify event signature with `verifyEvent(event)` before calling the `onEvent` callback
    - Log a warning and discard events with invalid signatures
    - Return the `SubCloser` object from `pool.subscribeMany()`
  - [x] 2.4 The `useRealtimeRepositories` hook should:
    - Accept no parameters (subscribes to all repository announcements)
    - Call `subscribeToRepositories()` inside a `useEffect`
    - On each valid event: extract repo name from the event's tags (look for `name` tag, fallback to `d` tag), call `queryClient.invalidateQueries({ queryKey: repositoryKeys.all() })` (TanStack Query v5 object form), and show a toast: `toast("New repository added: [name]")`
    - Return cleanup function that calls `sub.close()`
  - [x] 2.5 Ensure the hook does NOT attempt to set state after unmount -- the cleanup function closes the subscription before any further events arrive

- [x] Task 3: Integrate `useRealtimeRepositories` into Home page (AC: #1, #4, #6)
  - [x] 3.1 Import and call `useRealtimeRepositories()` in the `Component` function of `src/pages/Home.tsx` (similar to how `useRelayStatus()` is called -- a hook call with no return value needed)
  - [x] 3.2 Ensure the hook is called unconditionally at the top of the component (React rules of hooks)
  - [x] 3.3 Verify that cache invalidation from the realtime hook triggers a refetch by `useRepositories`, which in turn updates relay metadata via `fetchRepositoriesWithMeta()` (AC #6)

- [x] Task 4: Write tests (AC: #10)
  - [x] 4.1 Create `src/lib/nostr.subscribeToRepositories.test.ts` -- test the new service-layer export:
    - Verify it calls `pool.subscribeMany` with `DEFAULT_RELAYS` and `{ kinds: [REPO_ANNOUNCEMENT] }`
    - Verify signature verification is applied to incoming events
    - Verify invalid-signature events do NOT trigger the `onEvent` callback
    - Verify the returned `SubCloser.close()` works
  - [x] 4.2 Create `src/features/repository/hooks/useRealtimeRepositories.test.tsx`:
    - AT-2.6.01: Subscription created when hook mounts
    - AT-2.6.02: Subscription closed when hook unmounts (verify `close()` called)
    - AT-2.6.03: Subscription filter includes only kind 30617
    - AT-2.6.05: Cache invalidated on new event (`repositoryKeys.all()`)
    - AT-2.6.06: Toast shown with "New repository added: [name]"
    - AT-2.6.07: Toast auto-dismisses after 5 seconds (use `vi.useFakeTimers()`)
    - AT-2.6.09: Reconnection behavior -- verify SimplePool's `enableReconnect: true` is configured (already tested in `nostr.test.ts`); no custom reconnection logic needed (document in test as delegation note)
    - AT-2.6.10: Updated repo (same d-tag) handled correctly (cache invalidation triggers refetch; dedup handled by `useRepositories`)
    - AT-2.6.11: Multiple rapid events handled without race conditions
    - AT-2.6.12: No state updates after unmount
  - [x] 4.3 Update `src/pages/Home.test.tsx`:
    - Mock `useRealtimeRepositories` to prevent subscription side effects in existing tests
    - AT-2.6.04: Integration test -- simulate new event arrival, verify repo appears in list
    - AT-2.6.08: Verify real-time updates interact correctly with relay status
  - [x] 4.4 Update `src/App.test.tsx` to account for `<Toaster />` component in the tree
  - [x] 4.5 Verify all 649+ existing tests still pass (zero regressions)

- [x] Task 5: Verify all tests pass (AC: #10)
  - [x] 5.1 Run `npx vitest run` -- all tests pass including new ones (666 tests, 41 files)
  - [x] 5.2 Run `npx tsc --noEmit` -- zero TypeScript errors
  - [x] 5.3 Run `npx eslint src/` -- zero lint errors

## Dev Notes

### Architecture Pattern: Subscription Hook

Per the architecture document (`implementation-patterns-consistency-rules.md`), this project uses a **separation pattern** for subscriptions vs queries:

```typescript
// ✅ Correct - Separate hooks
// hooks/useRealtimeRepositories.ts  -- subscription hook (this story)
// hooks/useRepositories.ts           -- query hook (already exists)
```

The subscription hook invalidates the cache; the query hook refetches data. They are used together in the component:

```typescript
function Component() {
  useRealtimeRepositories()  // Subscribe to updates (no return value)
  const { data, status } = useRepositories()  // Fetch data
}
```

### Pool Access Pattern

The `pool` instance in `src/lib/nostr.ts` is module-private (not exported). You MUST NOT export it. Instead, add a `subscribeToRepositories()` function that wraps `pool.subscribeMany()`:

```typescript
// In src/lib/nostr.ts -- ADD this export
import type { SubCloser } from 'nostr-tools/pool'

export function subscribeToRepositories(
  onEvent: (event: NostrEvent) => void
): SubCloser {
  return pool.subscribeMany(
    [...DEFAULT_RELAYS],
    { kinds: [REPO_ANNOUNCEMENT] },
    {
      onevent: (event: NostrEvent) => {
        const isValid = verifyEvent(event)
        if (!isValid) {
          console.warn('Invalid signature rejected in subscription:', event.id)
          return
        }
        onEvent(event)
      }
    }
  )
}
```

### Toast Component: Sonner (shadcn/ui)

shadcn/ui v4 uses **Sonner** for toasts (not the older radix-based toast). Install with:

```bash
npx shadcn@latest add sonner
```

This creates `src/components/ui/sonner.tsx` and installs the `sonner` npm package.

Usage in components:
```typescript
import { toast } from 'sonner'

toast("New repository added: My Repo")  // Simple string toast
```

The `<Toaster />` provider must be placed in `src/App.tsx` at the root level.

### Extracting Repository Name from Event

NIP-34 kind 30617 events store the repository name in a tag:
- Primary: look for a tag `["name", "value"]` in `event.tags`
- Fallback: use the `d` tag value (`event.tags.find(t => t[0] === 'd')?.[1]`)
- Final fallback: use `"Unknown repository"` if neither exists

### Cache Invalidation Strategy

Per architecture document (`implementation-patterns-consistency-rules.md`):

```typescript
// ✅ Correct
onevent: (event) => {
  queryClient.invalidateQueries({ queryKey: repositoryKeys.all() })
  // TanStack Query refetches automatically based on staleTime
}
```

Note: Use the object form `{ queryKey: repositoryKeys.all() }` for TanStack Query v5 (the array form is deprecated).

### Reconnection Behavior

The `SimplePool` is already configured with `enableReconnect: true` (line 40 of `src/lib/nostr.ts`). This means:
- WebSocket connections auto-reconnect on disconnect
- The `pool.subscribeMany()` subscription persists across reconnections
- No additional reconnection logic is needed in the hook

**Do NOT implement custom reconnection logic.** The pool handles it.

### Existing Infrastructure to Reuse (DO NOT Recreate)

| What | Where | Notes |
|------|-------|-------|
| `pool` singleton | `src/lib/nostr.ts` | Module-private SimplePool with `enableReconnect: true`. Do NOT export. Wrap with `subscribeToRepositories()` |
| `verifyEvent()` | `nostr-tools/pure` | Already imported in `nostr.ts`. Use for subscription event validation |
| `REPO_ANNOUNCEMENT` | `src/constants/nostr.ts` | Kind 30617 constant |
| `DEFAULT_RELAYS` | `src/constants/nostr.ts` | Configured relay URLs (env-configurable via `VITE_NOSTR_RELAYS`) |
| `repositoryKeys` | `src/lib/query-client.ts` | Query key factory -- use `repositoryKeys.all()` for cache invalidation |
| `queryClient` | `src/lib/query-client.ts` | TanStack Query client singleton |
| `useRepositories()` | `src/features/repository/hooks/useRepositories.ts` | Existing query hook, unchanged |
| `deduplicateRepositories()` | `src/features/repository/hooks/useRepositories.ts` | Handles duplicate events on refetch (same `d` tag) |
| `useRelayStatus()` | `src/features/repository/hooks/useRelayStatus.ts` | Relay metadata hook, already called in Home.tsx |
| `fetchRepositoriesWithMeta()` | `src/lib/nostr.ts` | Existing export, updates relay metadata as side effect on refetch |
| `SubCloser` type | `nostr-tools/pool` | Re-exported from `abstract-pool.ts`. Type for subscription handle with `.close()` method |
| `Input` | `src/components/ui/input.tsx` | shadcn v4, already used in Home.tsx |
| `Button` | `src/components/ui/button.tsx` | shadcn v4, already used throughout |
| `createRepository()` | `src/test-utils/factories/repository.ts` | Test data factory for repositories |
| `resetRepositoryCounter()` | `src/test-utils/factories/repository.ts` | Test isolation helper |
| `createRelayQueryMeta()` | `src/test-utils/factories/relay-status.ts` | Test data factory for relay metadata |
| `isRigError()` | `src/types/common.ts` | Error type guard |

### Test Mocking Strategy

- **Mock `subscribeToRepositories`**: In hook tests, mock `@/lib/nostr` to return a fake `SubCloser` and capture the `onEvent` callback. Then manually call `onEvent(fakeEvent)` to simulate incoming events.
- **Mock `toast`**: Mock `sonner` module to verify toast calls: `vi.mock('sonner', () => ({ toast: vi.fn() }))`
- **Mock `useRealtimeRepositories`**: In `Home.test.tsx`, mock the hook to prevent WebSocket side effects: `vi.mock('@/features/repository/hooks/useRealtimeRepositories', () => ({ useRealtimeRepositories: vi.fn() }))`
- **Fake Timers**: Use `vi.useFakeTimers()` for toast auto-dismiss tests (5-second timeout)
- **Fake Event Factory**: Create test events with valid structure: `{ id, pubkey, created_at, kind: 30617, tags: [['d', 'repo-id'], ['name', 'My Repo']], content: '', sig }`

### Error Path Handling

- **WebSocket connection never establishes**: SimplePool's `enableReconnect: true` handles retry. The subscription hook does not need to handle this -- the pool manages connection state internally. No error is surfaced to the user; the subscription simply waits for events.
- **Invalid event signature**: Silently discarded with `console.warn` in `subscribeToRepositories()`. No cache invalidation, no toast. Event is dropped.
- **Malformed event tags (no name or d tag)**: The hook extracts the repo name with fallback chain: `name` tag -> `d` tag -> `"Unknown repository"`. Toast still shows with fallback name. Cache is still invalidated (the event is valid even if tags are sparse).
- **Multiple rapid events**: Each event triggers a separate `invalidateQueries()` call. TanStack Query deduplicates rapid refetch requests automatically. The `deduplicateRepositories` select function handles duplicate `d` tags in the refetched data.
- **Events arriving after unmount**: The cleanup function in `useEffect` calls `sub.close()`, which stops the subscription. No further `onEvent` callbacks fire after close. No "set state on unmounted component" warnings.
- **Relay metadata after invalidation**: When `invalidateQueries({ queryKey: repositoryKeys.all() })` triggers a refetch, `useRepositories` calls `fetchRepositoriesWithMeta()` which updates relay metadata as a side effect. Relay status indicators update automatically (AC #6).

### NFR Requirements

- **NFR-I6**: WebSocket connections with automatic reconnection -- handled by SimplePool's `enableReconnect: true`
- **NFR-P7**: Multi-relay parallel queries -- `pool.subscribeMany()` subscribes to all relays simultaneously
- **NFR-S1**: Signature verification -- `verifyEvent()` applied to all incoming subscription events before processing

### Accessibility Notes

- **Toast notification**: Sonner's `<Toaster />` component renders toasts with `role="status"` and `aria-live="polite"` by default, so screen readers announce new toasts without interrupting the user
- **Toast dismissal**: Toasts auto-dismiss after 5 seconds (AC #3). Users can dismiss manually via close button or swipe
- **Toast stacking**: Multiple toasts stack vertically per UX spec (max 3 visible, oldest dismissed first)
- **No focus trap**: Toasts do not steal focus from the repository list -- they are non-blocking notifications

### Critical Conventions (from established project patterns)

- **Named Exports Only**: All modules use named exports. Do NOT use `export default`. Components export `function ComponentName()` directly. Exception: `App.tsx` already uses default export (established pattern).
- **Import Aliases**: Use `@/` path alias for all imports (resolves to `src/`)
- **React Router v7**: Import from `react-router`, not `react-router-dom`
- **TanStack Query v5**: Use object form for `invalidateQueries`: `{ queryKey: ... }` (array form is deprecated)

### Previous Story Intelligence (Story 2.5)

Key learnings from Story 2.5:
- **649 Vitest tests passing** (39 test files; baseline for regression check)
- **`useRelayStatus` hook already in Home.tsx**: Story 2.5 added `useRelayStatus()` to Home.tsx. The `useRealtimeRepositories()` call follows the same pattern (hook call at top of component, no return value needed)
- **Existing mock patterns**: `Home.test.tsx` currently mocks `@/lib/nostr` with `fetchRepositoriesWithMeta`. New mock for `subscribeToRepositories` must be added alongside existing mocks
- **`App.tsx` uses default export**: Unlike feature components which use named exports, `App.tsx` uses `export default function App()`. This is the established pattern for the root component
- **Fragment wrapper needed**: `App.tsx` currently returns `<RouterProvider router={router} />` as a single element. Adding `<Toaster />` requires wrapping in a `<>...</>` React fragment
- **Collapsible already installed**: `@radix-ui/react-collapsible` was installed in Story 2.5 -- no need to reinstall
- **`useId()` for unique IDs**: Story 2.5 code review found that hardcoded DOM IDs cause issues when components render multiple times. Use `useId()` if this hook generates any DOM IDs
- **Code review rigor**: Story 2.5 had 3 review passes finding 11 issues total. Apply same scrutiny here

### Git Intelligence

Recent commits:
- `b37250ff19 feat(2-5): story complete` -- relay status indicators
- `2063905860 feat(2-4): story complete` -- RepoDetail page with README
- `e0b0658ab1 feat(2-3): story complete` -- search filtering
- `dd8d3b1d97 feat(2-2): story complete` -- RepoCard component

Patterns established:
- Feature module: `src/features/repository/` for feature-scoped components and hooks
- Shared components: `src/components/` for cross-feature components
- Page files: `src/pages/` export `Component` with `displayName`
- Co-located tests: `*.test.tsx` next to implementation
- Hooks: `src/features/repository/hooks/`
- Service layer: `src/lib/` (nostr.ts, arweave.ts)
- Types: `src/types/` for domain types
- Test utilities: `src/test-utils/factories/`

### Test Design Reference

From `_bmad-output/planning-artifacts/test-design-epic-2.md` section 5.6:

| Test ID | Test Description | Type | Priority |
|---------|-----------------|------|----------|
| AT-2.6.01 | WebSocket subscription created when Home page mounts | Hook | Critical |
| AT-2.6.02 | WebSocket subscription closed when Home page unmounts | Hook | Critical |
| AT-2.6.03 | Subscription listens only for kind 30617 events | Hook | High |
| AT-2.6.04 | New repository appears in list automatically on new event | Integration | Critical |
| AT-2.6.05 | TanStack Query cache is invalidated on new event | Hook | High |
| AT-2.6.06 | Toast notification shown: "New repository added: [name]" | Component | High |
| AT-2.6.07 | Toast auto-dismisses after 5 seconds | Component (fake timers) | Medium |
| AT-2.6.08 | Real-time updates interact correctly with relay status | Integration | Medium |
| AT-2.6.09 | Automatic WebSocket reconnection within 5 seconds on disconnect | Hook | High |
| AT-2.6.10 | Updated repository (same d-tag, newer timestamp) replaces existing entry | Hook | High |
| AT-2.6.11 | Multiple rapid events are handled without race conditions | Hook | Medium |
| AT-2.6.12 | Subscription does not fire after unmount (no state updates on unmounted component) | Hook | High |

Risk mitigations from test design:
- R2.6-1 (subscription leak on unmount): Verify `sub.close()` called in cleanup
- R2.6-2 (invalid events trigger UI update): Verify `verifyEvent()` gates `onEvent` callback
- R2.6-3 (toast spam from rapid events): Test multiple rapid events, verify no race conditions
- R2.6-4 (cache invalidation loop): Verify invalidation triggers refetch, not re-invalidation
- R2.6-5 (reconnection): Delegated to SimplePool -- verify `enableReconnect: true` in existing pool config test

### Project Structure After This Story

New files:
```
src/components/ui/
+-- sonner.tsx                                    <-- NEW (shadcn/ui Sonner toast, auto-generated by npx shadcn@latest add sonner)
src/features/repository/hooks/
+-- useRealtimeRepositories.ts                    <-- NEW (subscription hook)
+-- useRealtimeRepositories.test.tsx              <-- NEW (hook tests)
src/lib/
+-- nostr.subscribeToRepositories.test.ts         <-- NEW (service function tests)
```

Modified files:
```
src/lib/nostr.ts                                  <-- MODIFIED (add subscribeToRepositories() export, SubCloser import)
src/App.tsx                                       <-- MODIFIED (add <Toaster /> in fragment wrapper)
src/pages/Home.tsx                                <-- MODIFIED (add useRealtimeRepositories() call)
src/pages/Home.test.tsx                           <-- MODIFIED (mock useRealtimeRepositories, add integration test)
src/App.test.tsx                                  <-- MODIFIED (account for <Toaster /> in tree)
package.json                                      <-- MODIFIED (add sonner dependency)
```

### References

- [Source: _bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md#Communication Patterns] -- Subscription management pattern, cache update strategy
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#Real-Time Subscription Management] -- Page-level subscription lifecycle
- [Source: _bmad-output/planning-artifacts/architecture/project-structure-boundaries.md#Real-Time Updates] -- Hook naming and integration pattern
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.6] -- Story definition, acceptance criteria, technical notes
- [Source: _bmad-output/planning-artifacts/test-design-epic-2.md#5.6] -- Test IDs AT-2.6.01 through AT-2.6.12
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Toast Structure] -- Toast behavior, auto-dismiss, accessibility
- [Source: rig-frontend/src/lib/nostr.ts] -- Pool singleton, queryEvents, queryEventsWithMeta, fetchRepositoriesWithMeta, subscribeToRepositories (new)
- [Source: rig-frontend/src/features/repository/hooks/useRepositories.ts] -- Query hook pattern, deduplicateRepositories, relayStatusKeys side effect
- [Source: rig-frontend/src/features/repository/hooks/useRelayStatus.ts] -- Relay metadata hook (already in Home.tsx)
- [Source: rig-frontend/src/lib/query-client.ts] -- repositoryKeys.all(), relayStatusKeys factory
- [Source: rig-frontend/src/constants/nostr.ts] -- REPO_ANNOUNCEMENT (30617), DEFAULT_RELAYS
- [Source: rig-frontend/src/App.tsx] -- Root app component, needs <Toaster /> addition
- [Source: rig-frontend/src/main.tsx] -- Entry point with QueryClientProvider, ThemeProvider
- [Source: rig-frontend/node_modules/nostr-tools/lib/types/abstract-pool.d.ts] -- SubCloser type, subscribeMany API signature

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

None required -- all tests passed on first run.

### Completion Notes List

- **Task 1 (Sonner Toast)**: Installed `sonner` npm package and created `src/components/ui/sonner.tsx` shadcn/ui wrapper component. Added `<Toaster />` to `src/App.tsx` wrapped in a React fragment alongside `<RouterProvider>`. The Sonner component was adapted to use the project's custom `ThemeProvider` (via `useTheme()`) instead of next-themes.
- **Task 2 (useRealtimeRepositories hook)**: Created `src/features/repository/hooks/useRealtimeRepositories.ts` with `useEffect`-based subscription lifecycle. Added `subscribeToRepositories()` export to `src/lib/nostr.ts` wrapping `pool.subscribeMany()` with signature verification via `verifyEvent()`. The hook extracts repo name from event tags (name tag -> d tag -> "Unknown repository" fallback), invalidates TanStack Query cache, and shows a Sonner toast with 5-second duration.
- **Task 3 (Home page integration)**: Added `useRealtimeRepositories()` call at the top of the Home page `Component` function, following the same pattern as `useRelayStatus()`.
- **Task 4 (Tests)**: Created `src/lib/nostr.subscribeToRepositories.test.ts` (5 tests) and `src/features/repository/hooks/useRealtimeRepositories.test.tsx` (12 tests) covering all AT-2.6.xx test IDs. Updated `src/pages/Home.test.tsx` and `src/App.test.tsx` with mocks for `useRealtimeRepositories` and `subscribeToRepositories` to prevent WebSocket side effects.
- **Task 5 (Verification)**: All 666 tests pass (17 new tests, 649 baseline preserved). Zero TypeScript errors. Zero ESLint errors.

### File List

| Action | File (relative to rig-frontend/) |
|--------|----------------------------------|
| Created | `src/components/ui/sonner.tsx` |
| Created | `src/features/repository/hooks/useRealtimeRepositories.ts` |
| Created | `src/features/repository/hooks/useRealtimeRepositories.test.tsx` |
| Created | `src/lib/nostr.subscribeToRepositories.test.ts` |
| Modified | `src/lib/nostr.ts` (added `subscribeToRepositories()` export) |
| Modified | `src/App.tsx` (added `<Toaster />` in fragment wrapper) |
| Modified | `src/pages/Home.tsx` (added `useRealtimeRepositories()` hook call) |
| Modified | `src/pages/Home.test.tsx` (added mock for `useRealtimeRepositories`) |
| Modified | `src/App.test.tsx` (added mocks for `subscribeToRepositories` and `useRealtimeRepositories`) |
| Modified | `package.json` (added `sonner` dependency) |

### Change Log

| Date | Summary |
|------|---------|
| 2026-02-27 | Story 2.6 implementation complete: Added real-time repository updates via WebSocket subscription. Installed Sonner toast component (shadcn/ui v4). Created `subscribeToRepositories()` service function in nostr.ts wrapping pool.subscribeMany() with signature verification. Created `useRealtimeRepositories` subscription hook that invalidates TanStack Query cache and shows toast notifications. Integrated hook into Home page. Added 17 new tests (666 total, zero regressions). All TypeScript and ESLint checks pass. |

## Code Review Record

### Review Pass #1

- **Date**: 2026-02-27
- **Reviewer Model**: Claude Opus 4.6 (claude-opus-4-6)
- **Issue Counts**: 0 critical, 0 high, 2 medium, 0 low (2 total)
- **Issues Found & Fixed**:
  1. **(Medium)** Changed `toast.info()` to plain `toast()` to match AC#3 "subtle" notification spec. The `toast.info()` variant applies an info icon and styling that is more prominent than the intended subtle behavior.
  2. **(Medium)** Removed undocumented `description` field from toast options. Sonner's `toast()` API does not support a `description` option in the string overload form used by this project.
- **Tests After Fixes**: All 672 tests pass (6 new tests added during review fixes, up from 666)
- **Outcome**: Pass -- all issues resolved, no remaining action items

### Review Pass #2

- **Date**: 2026-02-27
- **Reviewer Model**: Claude Opus 4.6 (claude-opus-4-6)
- **Issue Counts**: 0 critical, 0 high, 0 medium, 1 low (1 total)
- **Issues Found & Fixed**:
  1. **(Low)** Removed unused `richColors` prop from `<Toaster />` component. The prop was set but not contributing to the intended toast styling and is unnecessary for the subtle notification behavior specified in AC#3.
- **Tests After Fixes**: All 672 tests pass (no change from review pass #1)
- **Outcome**: Pass -- all issues resolved, no remaining action items

### Review Pass #3 (Security + Comprehensive)

- **Date**: 2026-02-27
- **Reviewer Model**: Claude Opus 4.6 (claude-opus-4-6)
- **Scope**: Full code review + OWASP Top 10 security audit + authentication/authorization + injection risk assessment
- **Issue Counts**: 1 critical, 0 high, 1 medium, 1 low (3 total)
- **Issues Found & Fixed**:
  1. **(Critical)** `subscribeToRepositories()` lacked a `since` filter parameter. Without it, `pool.subscribeMany()` causes relays to replay ALL stored kind 30617 events on subscription connect, triggering a flood of "New repository added" toast notifications for every historical repository. Fixed by adding `since: Math.floor(Date.now() / 1000)` to the filter so only events created after subscription start are delivered.
  2. **(Medium)** `extractRepoName()` did not enforce a length limit on repo names extracted from untrusted event tags. A malicious actor could craft an event with an extremely long `name` tag (e.g., 10KB string) causing UI display issues in toast notifications. Fixed by adding `MAX_REPO_NAME_LENGTH = 100` constant and truncating with `...` suffix.
  3. **(Low)** Sonner wrapper imports 5 Lucide icons for the `icons` prop, but the project only uses plain `toast()` (not `toast.success()`, `toast.error()`, etc.). Evaluated and accepted: icons add negligible bundle overhead since lucide-react is already used throughout, and removing them would break future toast type usage. No code change.
- **Security Assessment (OWASP Top 10)**:
  - A01 Broken Access Control: N/A (read-only public relay data)
  - A02 Cryptographic Failures: Pass (verifyEvent() gates all incoming events)
  - A03 Injection: Pass (Sonner renders text nodes via React JSX escaping; since param from Date.now())
  - A04 Insecure Design: Fixed (since filter prevents historical event replay)
  - A05 Security Misconfiguration: Pass (wss:// encrypted connections)
  - A06 Vulnerable Components: Pass (current dependency versions)
  - A07 Auth Failures: N/A (no auth in this feature)
  - A08 Data Integrity: Pass (signature verification prevents tampered events)
  - A09 Logging Failures: Pass (console.warn for invalid signatures)
  - A10 SSRF: N/A (no server-side requests)
- **Tests After Fixes**: All 673 tests pass (1 new test for name truncation, up from 672)
- **Outcome**: Pass -- all critical and medium issues resolved, low issue evaluated and accepted
