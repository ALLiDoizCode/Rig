---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04c-aggregate
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: '2026-02-26'
workflowType: testarch-atdd
inputDocuments:
  - _bmad-output/implementation-artifacts/2-1-repository-list-page-with-nostr-query.md
  - _bmad-output/planning-artifacts/test-design-epic-2.md
  - rig-frontend/src/lib/nostr.ts
  - rig-frontend/src/lib/query-client.ts
  - rig-frontend/src/types/repository.ts
  - rig-frontend/src/types/common.ts
  - rig-frontend/src/pages/Home.tsx
  - rig-frontend/src/routes.tsx
  - rig-frontend/vitest.config.ts
  - _bmad/tea/testarch/knowledge/test-quality.md
  - _bmad/tea/testarch/knowledge/component-tdd.md
  - _bmad/tea/testarch/knowledge/data-factories.md
  - _bmad/tea/testarch/knowledge/selector-resilience.md
---

# ATDD Checklist - Epic 2, Story 2.1: Repository List Page with Nostr Query

**Date:** 2026-02-26
**Author:** Jonathan
**Primary Test Level:** Hook + Component (Vitest + React Testing Library)

---

## Story Summary

Story 2.1 is the first user-facing feature in Epic 2. It queries Nostr relays for kind 30617 repository announcement events, displays them in a responsive grid on the Home page, and handles loading, error, and empty states. It also establishes the first TanStack Query hook pattern (`useRepositories`) and the feature module directory structure (`src/features/repository/`).

**As a** user
**I want** to see a list of repositories announced on Nostr
**So that** I can discover decentralized repositories available on the network

---

## Acceptance Criteria

1. Home page queries all configured relays for kind 30617 events on mount using `fetchRepositories()`
2. Repositories displayed in responsive grid: 3 cols desktop, 2 cols tablet, 1 col mobile
3. `useRepositories` TanStack Query hook created with `staleTime: 1 hour`, `repositoryKeys.all()`
4. Loading state shows skeleton grid (6 cards) using shadcn/ui `Skeleton`
5. Error state shows `userMessage` from `RigError` + "Try Again" button calling `refetch()`
6. Empty state shows "No repositories found on the network"
7. Stale-while-revalidate: previously viewed repos shown from cache immediately
8. Repositories deduplicated by `id` using `select` option, keeping latest `createdAt`
9. Unit tests verify hook, component, deduplication, and all 392 existing tests pass

---

## Failing Tests Created (RED Phase)

### Hook Tests (13 tests)

**File:** `rig-frontend/src/features/repository/hooks/useRepositories.test.tsx` (193 lines)

**deduplicateRepositories (pure unit tests):**

- **Test:** `[P0] should deduplicate repositories by id, keeping the one with latest createdAt`
  - **Status:** RED - `it.skip()` (function returns input unchanged in stub)
  - **Verifies:** AC #8 - Deduplication logic with latest-wins strategy

- **Test:** `[P1] should return all items when there are no duplicates`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #8 - No false deduplication

- **Test:** `[P1] should return empty array when input is empty`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #8 - Edge case: empty input

- **Test:** `[P1] should return single item unchanged`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #8 - Edge case: single item

- **Test:** `[P2] should handle multiple groups of duplicates`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #8 - Complex deduplication with multiple duplicate groups

**useRepositories hook tests:**

- **Test:** `[P0] should fetch repositories successfully and return data with status success`
  - **Status:** RED - `it.skip()` (hook throws in stub)
  - **Verifies:** AC #1, #3 - AT-2.1.01

- **Test:** `[P0] should set status to error when fetchRepositories throws RigError`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #5 - AT-2.1.09

- **Test:** `[P0] should deduplicate repositories via the select option`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #8 - AT-2.1.14

- **Test:** `[P1] should return stale data immediately while refetch is in-flight`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #7 - AT-2.1.11

- **Test:** `[P0] should display repositories even when partial relay data is returned`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #1 - AT-2.1.05

- **Test:** `[P1] should use repositoryKeys.all() as the query key`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #3 - Correct query key factory usage

- **Test:** `[P1] should use arrow wrapper for queryFn (not bare function reference)`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #3 - Arrow wrapper prevents QueryFunctionContext mismatch

- **Test:** `[P2] should configure staleTime of 1 hour for repository data`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #3 - Correct staleTime configuration

### Component Tests (13 tests)

**File:** `rig-frontend/src/pages/Home.test.tsx` (172 lines)

**Loading State (AC #4):**

- **Test:** `[P0] should display loading skeleton with role="status" and aria-label while data is pending`
  - **Status:** RED - `it.skip()` (Home page is placeholder, no useRepositories call)
  - **Verifies:** AC #4 - AT-2.1.06

- **Test:** `[P1] should display 6 skeleton cards in the loading grid`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #4 - Skeleton grid structure

**Error State (AC #5):**

- **Test:** `[P0] should display error message with role="alert" when query fails with RigError`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #5 - AT-2.1.09

- **Test:** `[P0] should display a "Try Again" button when query fails`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #5 - Retry UI presence

- **Test:** `[P0] should refetch when "Try Again" button is clicked`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #5 - AT-2.1.10

- **Test:** `[P1] should handle generic Error objects (non-RigError) gracefully`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #5 - isRigError type guard fallback

**Empty State (AC #6):**

- **Test:** `[P1] should display empty state message when no repositories are returned`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #6 - AT-2.1.15

**Populated State (AC #2):**

- **Test:** `[P0] should display repository names in a grid after successful fetch`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #2 - AT-2.1.02

- **Test:** `[P1] should display repository descriptions`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #2 - Description rendering

- **Test:** `[P2] should display truncated owner pubkeys`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #2 - Owner display

- **Test:** `[P1] should render a responsive grid container`
  - **Status:** RED - `it.skip()`
  - **Verifies:** AC #2 - Responsive grid CSS classes

**Accessibility:**

- **Test:** `[P1] should have a page heading (h1)`
  - **Status:** RED - `it.skip()`
  - **Verifies:** Heading hierarchy (WCAG)

- **Test:** `[P1] should not render a <main> element (AppLayout already provides one)`
  - **Status:** RED - `it.skip()`
  - **Verifies:** No duplicate landmarks (WCAG)

---

## Data Factories Created

### Repository Factory

**File:** `rig-frontend/src/test-utils/factories/repository.ts`

**Exports:**

- `createRepository(overrides?)` - Create single Repository with optional overrides
- `createRepositories(count, overrides?)` - Create array of repositories
- `resetRepositoryCounter()` - Reset counter for test isolation

**Example Usage:**

```typescript
import { createRepository, createRepositories, resetRepositoryCounter } from '@/test-utils/factories/repository'

// In beforeEach for predictable IDs
resetRepositoryCounter()

// Create with defaults
const repo = createRepository()

// Create with overrides (explicit test intent)
const customRepo = createRepository({ id: 'my-repo', createdAt: 2000 })

// Create multiple
const repos = createRepositories(5)
```

---

## Fixtures Created

### Hook Test Wrapper

**Location:** Inline in `useRepositories.test.tsx`

**Fixtures:**

- `createTestQueryClient()` - Fresh QueryClient per test (retry: false, gcTime: 0)
- `createHookWrapper()` - QueryClientProvider wrapper for renderHook

### Component Test Wrapper

**Location:** Inline in `Home.test.tsx`

**Fixtures:**

- `createTestQueryClient()` - Fresh QueryClient per test
- `renderHome()` - Full component wrapper (QueryClientProvider + MemoryRouter)

---

## Mock Requirements

### Nostr Service Layer Mock

**Module:** `@/lib/nostr`

**Mocked Export:** `fetchRepositories`

**Success Response:**

```typescript
// Returns Repository[] from factory
vi.mocked(fetchRepositories).mockResolvedValue(createRepositories(3))
```

**Failure Response (RigError):**

```typescript
vi.mocked(fetchRepositories).mockRejectedValue({
  code: 'RELAY_TIMEOUT',
  message: 'Relay query failed: Timeout',
  userMessage: 'Unable to connect to Nostr relays. Please try again.',
  context: {},
})
```

**Failure Response (Generic Error):**

```typescript
vi.mocked(fetchRepositories).mockRejectedValue(new Error('Network failure'))
```

**Notes:** Mock at the service boundary (`@/lib/nostr`), NOT at the relay level (`nostr-tools/pool`). This is consistent with the project's testing convention established in Epic 1.

---

## Required data-testid Attributes

### Home Page

No `data-testid` attributes are required for this story. Tests use:

- `role="status"` + `aria-label="Loading repositories"` for skeleton container
- `role="alert"` for error messages
- `role="button"` with name "Try Again" for retry button
- `role="heading"` with level 1 for page title
- CSS class selectors for grid layout verification (`.grid`, `.grid-cols-1`, etc.)
- Text content selectors for repository names and descriptions

This follows the selector resilience hierarchy: ARIA roles > text content > CSS classes.

---

## Implementation Checklist

### Test: `deduplicateRepositories` pure function tests (5 tests)

**File:** `rig-frontend/src/features/repository/hooks/useRepositories.test.tsx`

**Tasks to make these tests pass:**

- [ ] Replace stub `deduplicateRepositories` in `useRepositories.ts` with Map-based deduplication logic
- [ ] Implement id-based grouping with latest-createdAt-wins strategy
- [ ] Export the function for direct unit testing
- [ ] Remove `it.skip()` from deduplication tests
- [ ] Run tests: `npx vitest run src/features/repository/hooks/useRepositories.test.tsx`
- [ ] All 5 deduplication tests pass (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: `useRepositories` hook tests (8 tests)

**File:** `rig-frontend/src/features/repository/hooks/useRepositories.test.tsx`

**Tasks to make these tests pass:**

- [ ] Replace stub `useRepositories` in `useRepositories.ts` with real TanStack Query hook
- [ ] Use `useQuery()` with `queryKey: repositoryKeys.all()`
- [ ] Use `queryFn: () => fetchRepositories()` (arrow wrapper)
- [ ] Use `select: deduplicateRepositories` for data transformation
- [ ] Set `staleTime: 60 * 60 * 1000` (1 hour)
- [ ] Remove `it.skip()` from hook tests
- [ ] Run tests: `npx vitest run src/features/repository/hooks/useRepositories.test.tsx`
- [ ] All 8 hook tests pass (green phase)

**Estimated Effort:** 1 hour

---

### Test: Home page loading state tests (2 tests)

**File:** `rig-frontend/src/pages/Home.test.tsx`

**Tasks to make these tests pass:**

- [ ] Replace Home.tsx placeholder with `useRepositories()` hook usage
- [ ] Implement `RepositoryGridSkeleton` component with 6 skeleton cards
- [ ] Add `role="status"` and `aria-label="Loading repositories"` to skeleton container
- [ ] Use responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- [ ] Render skeleton when `status === 'pending'`
- [ ] Remove `it.skip()` from loading state tests
- [ ] Run tests: `npx vitest run src/pages/Home.test.tsx`
- [ ] Both loading state tests pass (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: Home page error state tests (4 tests)

**File:** `rig-frontend/src/pages/Home.test.tsx`

**Tasks to make these tests pass:**

- [ ] Implement `isRigError` type guard function
- [ ] Implement error state UI with `role="alert"`
- [ ] Extract `userMessage` via `isRigError` type guard, fallback to "Something went wrong."
- [ ] Add shadcn/ui `Button` with "Try Again" calling `refetch()`
- [ ] Render error state when `status === 'error'`
- [ ] Remove `it.skip()` from error state tests
- [ ] Run tests: `npx vitest run src/pages/Home.test.tsx`
- [ ] All 4 error state tests pass (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: Home page empty state test (1 test)

**File:** `rig-frontend/src/pages/Home.test.tsx`

**Tasks to make these tests pass:**

- [ ] Implement empty state UI with "No repositories found on the network" message
- [ ] Render empty state when `status === 'success'` and `data.length === 0`
- [ ] Remove `it.skip()` from empty state test
- [ ] Run tests: `npx vitest run src/pages/Home.test.tsx`
- [ ] Empty state test passes (green phase)

**Estimated Effort:** 0.25 hours

---

### Test: Home page populated state tests (4 tests)

**File:** `rig-frontend/src/pages/Home.test.tsx`

**Tasks to make these tests pass:**

- [ ] Implement populated grid with temporary inline repository cards
- [ ] Each card shows: repository name, description (truncated), owner pubkey (truncated)
- [ ] Use responsive grid classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- [ ] Render populated state when `status === 'success'` and `data.length > 0`
- [ ] Remove `it.skip()` from populated state tests
- [ ] Run tests: `npx vitest run src/pages/Home.test.tsx`
- [ ] All 4 populated state tests pass (green phase)

**Estimated Effort:** 0.5 hours

---

### Test: Home page accessibility tests (2 tests)

**File:** `rig-frontend/src/pages/Home.test.tsx`

**Tasks to make these tests pass:**

- [ ] Add `<h1>` heading to Home page (page title)
- [ ] Ensure Home page does NOT render `<main>` (AppLayout provides it)
- [ ] Use `<section>` or `<div>` as top-level wrapper
- [ ] Remove `it.skip()` from accessibility tests
- [ ] Run tests: `npx vitest run src/pages/Home.test.tsx`
- [ ] Both accessibility tests pass (green phase)

**Estimated Effort:** 0.25 hours

---

## Running Tests

```bash
# Run all failing tests for this story (skipped in RED phase)
npx vitest run src/features/repository/hooks/useRepositories.test.tsx src/pages/Home.test.tsx

# Run specific test file (hook tests only)
npx vitest run src/features/repository/hooks/useRepositories.test.tsx

# Run specific test file (component tests only)
npx vitest run src/pages/Home.test.tsx

# Run tests in watch mode (interactive development)
npx vitest src/features/repository/hooks/useRepositories.test.tsx

# Run all tests (regression check)
npx vitest run

# Run tests with TypeScript check
npx tsc --noEmit && npx vitest run
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete)

**TEA Agent Responsibilities:**

- All tests written and skipped (`it.skip()`)
- Data factory created with auto-reset for test isolation
- Mock requirements documented (service boundary mock pattern)
- ARIA selector strategy documented (no data-testid needed)
- Implementation checklist created with per-test task mapping

**Verification:**

- 26 tests registered and skipped (13 hook + 13 component)
- 392 existing tests pass (zero regressions)
- 0 TypeScript errors
- 0 ESLint errors
- Tests fail due to missing implementation (stub hook throws, placeholder Home page)

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test group** from implementation checklist (start with deduplication)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Remove `it.skip()`** from the test
5. **Run the test** to verify it now passes (green)
6. **Check off the task** in implementation checklist
7. **Move to next test group** and repeat

**Recommended Order:**

1. `deduplicateRepositories` pure function (5 tests) - no dependencies
2. `useRepositories` hook (8 tests) - depends on deduplication
3. Home page loading state (2 tests) - depends on hook
4. Home page error state (4 tests) - depends on hook
5. Home page empty state (1 test) - depends on hook
6. Home page populated state (4 tests) - depends on hook
7. Home page accessibility (2 tests) - independent

**Key Principles:**

- One test group at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all 26 tests pass** (green phase complete)
2. **Verify all 392 existing tests still pass** (zero regressions)
3. **Review code for quality** (readability, maintainability, DRY)
4. **Ensure tests still pass** after each refactor
5. **Run `npx tsc --noEmit`** -- zero TypeScript errors
6. **Run `npx eslint src/`** -- zero lint errors

---

## Next Steps

1. **Share this checklist and failing tests** with the dev workflow (manual handoff)
2. **Begin implementation** using implementation checklist as guide
3. **Work one test group at a time** (red -> green for each)
4. **When all tests pass**, refactor code for quality
5. **When refactoring complete**, update story status to 'done'

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **test-quality.md** - Deterministic, isolated, explicit test patterns; no hard waits; <300 lines per test
- **component-tdd.md** - Red-Green-Refactor workflow; provider isolation with fresh QueryClient per test; accessibility assertions alongside functionality
- **data-factories.md** - Factory functions with overrides (`createRepository(overrides)`); sequential counters for deterministic data; `resetRepositoryCounter()` for test isolation
- **selector-resilience.md** - ARIA roles > text content > CSS classes hierarchy; `role="status"`, `role="alert"`, `role="button"` preferred over data-testid for semantic elements
- **test-design-epic-2.md** - AT-2.1.01 through AT-2.1.15 acceptance test matrix; risk register R2.1-1 through R2.1-7

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npx vitest run`

**Results:**

```
Test Files  30 passed | 2 skipped (32)
     Tests  392 passed | 26 skipped (418)
  Start at  21:16:48
  Duration  6.09s
```

**Summary:**

- Existing tests: 392 passing (zero regressions)
- New ATDD tests: 26 skipped (RED phase)
- Total: 418 tests (392 passing + 26 skipped)
- TypeScript errors: 0
- ESLint errors: 0
- Status: RED phase verified

**Expected Failure Reasons:**

- Hook tests: `useRepositories` stub throws `Error('useRepositories is not implemented yet (TDD RED PHASE)')`
- Deduplication tests: `deduplicateRepositories` stub returns input unchanged (no Map-based deduplication)
- Component tests: Home page is placeholder with no `useRepositories` hook, no skeleton, no error state, no grid layout

---

## Notes

- **First feature module**: This story establishes `src/features/repository/` as the template for ALL future feature modules
- **No @faker-js/faker dependency**: Factory uses sequential counters instead of faker to keep dependencies minimal. This is sufficient for the current test scale.
- **Stub file created**: `useRepositories.ts` contains minimal stubs so test files can import. DEV agent replaces the entire file during GREEN phase.
- **Vitest `it.skip()` used**: Vitest convention (equivalent to Playwright's `test.skip()`). Remove `it.skip()` when implementing each test group.
- **No E2E tests**: This project uses Vitest + RTL for component/hook tests. Playwright E2E is not configured. Visual layout verification deferred to Playwright MCP manual verification after implementation.

---

## Contact

**Questions or Issues?**

- Refer to `_bmad-output/implementation-artifacts/2-1-repository-list-page-with-nostr-query.md` for full story specification
- Refer to `_bmad-output/planning-artifacts/test-design-epic-2.md` for epic-level test strategy
- Consult existing test patterns in `src/lib/nostr.test.ts` and `src/components/layout/Header.test.tsx`

---

**Generated by BMad TEA Agent** - 2026-02-26
