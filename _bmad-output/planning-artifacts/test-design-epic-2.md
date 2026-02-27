# Test Design: Epic 2 - Repository Discovery & Exploration

**Epic:** Epic 2 - Repository Discovery & Exploration
**Goal:** Users can discover repositories from Nostr relays and view repository metadata.
**Date:** 2026-02-26
**Author:** Test Architect (Claude Opus 4.6)

---

## Table of Contents

1. [Epic-Level Test Strategy](#1-epic-level-test-strategy)
2. [Risk Register & Test Mitigations](#2-risk-register--test-mitigations)
3. [Integration Test Scenarios (Between Stories)](#3-integration-test-scenarios-between-stories)
4. [Cross-Story Test Scenarios](#4-cross-story-test-scenarios)
5. [Acceptance Test Outline Per Story](#5-acceptance-test-outline-per-story)
6. [Test Data Requirements](#6-test-data-requirements)

---

## 1. Epic-Level Test Strategy

### 1.1 Testing Approaches

Epic 2 is the first user-facing epic. It bridges the infrastructure layer (Epic 1) to the UI layer, introducing components that render data fetched from Nostr relays. The testing strategy must cover this full vertical slice: service calls, caching behavior, React component rendering, routing, accessibility, and real-time WebSocket subscriptions.

| Testing Level | Purpose | Tools | Coverage Target |
|---|---|---|---|
| **Unit Tests** | Individual functions, hooks, components in isolation | Vitest, React Testing Library, msw | Every public function, hook, and component |
| **Component Tests** | Rendered component behavior with mocked data | React Testing Library, @testing-library/user-event | All user interactions, all rendering states (loading, error, empty, populated) |
| **Hook Tests** | TanStack Query hooks with mocked service layer | @testing-library/react (renderHook), QueryClientProvider wrapper | Query lifecycle, cache integration, subscription management |
| **Integration Tests** | Multi-component flows through React Router | createMemoryRouter, React Testing Library | Navigation flows, data passing between pages |
| **Accessibility Tests** | WCAG 2.1 AA compliance | @testing-library/jest-dom (toHaveAccessibleName, toHaveAttribute), axe-core (via vitest-axe or jest-axe) | All interactive elements, heading hierarchy, ARIA attributes, keyboard navigation |
| **Visual Verification** | UI rendering in real browser | Playwright MCP tools (post-implementation) | Layout correctness, responsive breakpoints, loading states |

### 1.2 Test Infrastructure Dependencies (from Epic 1)

Epic 1 delivered the following infrastructure that Epic 2 tests build upon:

- **Vitest + React Testing Library** (Story 1.1, 1.10): Test runner, DOM testing utilities
- **`fake-indexeddb`** (Story 1.4): IndexedDB mock for cache tests
- **TanStack Query test utilities** (Story 1.5): `QueryClient` factory functions, `repositoryKeys`
- **React Router test utilities** (Story 1.6): `createMemoryRouter`, route configuration
- **Zod schemas + transformers** (Story 1.8, 1.9): `RepoAnnouncementEventSchema`, `eventToRepository()`
- **Service layer** (Story 1.2, 1.9): `fetchRepositories()` returning `Repository[]`
- **Error handling** (Story 1.9): `RigError` types, `ErrorBoundary` component
- **391 existing tests** (all passing): Regression baseline

### 1.3 Test Conventions

Per the implementation patterns from the architecture document:

- **Co-located tests**: `RepoList.test.tsx` next to `RepoList.tsx`
- **Hook tests**: `useRepositories.test.ts` next to `useRepositories.ts`
- **Shared test utilities**: `src/test-utils/` for mock factories, render wrappers
- **Naming**: Test files use `.test.ts` / `.test.tsx` suffix
- **Mock pattern**: Mock at service boundary (`lib/nostr.ts`), not at relay level, for component/hook tests

### 1.4 Key Test Principles for Epic 2

1. **Mock at the right boundary**: Component tests mock `fetchRepositories()` and related service functions. They do NOT mock `SimplePool` or `verifyEvent()` -- those are unit-tested in the service layer (Epic 1).
2. **Test user behavior, not implementation**: Use `getByRole`, `getByText`, `findByText` -- not internal state inspection.
3. **Test all rendering states**: Every component that fetches data must have tests for `pending`, `error`, and `success` states.
4. **Accessibility is not optional**: Every component test must verify ARIA attributes, keyboard navigability, and semantic HTML.
5. **Cache behavior is a first-class concern**: Tests must verify stale-while-revalidate behavior, not just happy-path data fetching.

---

## 2. Risk Register & Test Mitigations

### 2.1 Story 2.1: Repository List Page with Nostr Query

| Risk ID | Risk | Severity | Likelihood | Test Mitigation |
|---|---|---|---|---|
| R2.1-1 | Multi-relay queries return inconsistent/duplicate repositories | High | Medium | Unit test deduplication logic in `useRepositories` hook. Test with fixtures containing duplicate repos from different relays. |
| R2.1-2 | All relays fail, leaving user with blank page and no feedback | High | Medium | Component test for all-relay-failure scenario: verify error message text, retry button presence and functionality. |
| R2.1-3 | Loading state progression messages are incorrect or stale | Medium | Medium | Component test for each loading state transition: "Connecting...", "Querying...", "Loaded from X of Y relays". |
| R2.1-4 | TanStack Query staleTime/gcTime misconfiguration causes stale data or excessive refetching | Medium | Low | Hook test verifying `staleTime: 1 hour` for repository queries. Test that `refetchOnWindowFocus` triggers correctly. |
| R2.1-5 | Grid layout breaks on tablet (2-col) or mobile (1-col) breakpoints | Medium | Medium | Playwright visual verification at 320px, 768px, and 1024px widths. |
| R2.1-6 | Cached data not shown while relay query is in-flight (stale-while-revalidate fails) | High | Low | Hook test: seed cache with stale data, trigger query, verify stale data is returned immediately while fresh data loads. |
| R2.1-7 | Performance: LCP exceeds 2.5s due to relay latency | Medium | Medium | Measure LCP with Playwright in CI. Verify skeleton/loading state renders within 200ms. |

### 2.2 Story 2.2: Repository Card Component with Metadata

| Risk ID | Risk | Severity | Likelihood | Test Mitigation |
|---|---|---|---|---|
| R2.2-1 | Card truncation logic ("read more") breaks with very long or very short descriptions | Medium | Medium | Component test with descriptions of 0, 1, 3, 5, and 50 lines. Verify truncation at 3 lines and "read more" toggle. |
| R2.2-2 | ArNS URL copy button fails on browsers without Clipboard API | Low | Low | Component test mocking `navigator.clipboard.writeText()`. Test fallback behavior when clipboard API is unavailable. |
| R2.2-3 | Maintainer npub display is too long and breaks card layout | Medium | Medium | Component test with maintainer lists of 0, 1, and 10 entries. Verify truncation/overflow behavior. |
| R2.2-4 | Card click navigation goes to wrong route (owner/repo encoding issues) | High | Low | Component test verifying `buildRepoPath(owner, repo)` generates correct links. Test with special characters in owner/repo names. |
| R2.2-5 | Verification badge shows incorrect relay count | Medium | Low | Component test with relay count of 0, 1, 3, 5. Verify badge text matches. |
| R2.2-6 | Screen reader cannot navigate cards meaningfully | High | Medium | Accessibility test: verify card has `role` attributes, `aria-label` on interactive elements, logical heading hierarchy. |
| R2.2-7 | Touch targets smaller than 44x44px on mobile | Medium | Medium | Playwright verification measuring actual rendered touch target sizes. |

### 2.3 Story 2.3: Client-Side Search and Filtering

| Risk ID | Risk | Severity | Likelihood | Test Mitigation |
|---|---|---|---|---|
| R2.3-1 | Search does not match partial strings or is case-sensitive | Medium | Low | Unit test filtering logic with: exact match, partial match, case mismatch, unicode characters. |
| R2.3-2 | Debounce delay (300ms) causes perceived lag or race conditions | Medium | Medium | Component test using `vi.useFakeTimers()` to verify debounce behavior. Test rapid typing followed by assertion after debounce settles. |
| R2.3-3 | "Showing X of Y repositories" counter is wrong after filtering | Low | Low | Component test verifying counter text after applying various search terms. |
| R2.3-4 | Keyboard shortcut "/" conflicts with browser search or other shortcuts | Low | Medium | Component test: simulate "/" keypress, verify search input gains focus. Test that "/" inside the input types the character instead of re-focusing. |
| R2.3-5 | Empty state not shown when search yields zero results | Medium | Low | Component test: enter a search term that matches nothing, verify "No repositories found" message and "Clear search" button. |
| R2.3-6 | Clear search button does not reset the list | Low | Low | Component test: enter search, click clear, verify full list is restored and count updates. |

### 2.4 Story 2.4: Repository Detail Page

| Risk ID | Risk | Severity | Likelihood | Test Mitigation |
|---|---|---|---|---|
| R2.4-1 | Deep linking to /:owner/:repo fails (route params not parsed correctly) | High | Low | Integration test: render router at `/:owner/:repo`, verify `useParams()` returns correct values. Test with URL-encoded characters. |
| R2.4-2 | README.md markdown rendering introduces XSS from untrusted content | Critical | Medium | Unit test: render markdown containing `<script>`, `<iframe>`, `javascript:` URLs. Verify they are sanitized/stripped. |
| R2.4-3 | react-markdown or remark-gfm adds significant bundle size | Medium | Low | Bundle size check in CI. Verify lazy loading of markdown dependencies. |
| R2.4-4 | README.md fetch from Arweave fails silently, leaving blank section | Medium | Medium | Component test: mock Arweave fetch failure, verify graceful fallback message ("README not available"). |
| R2.4-5 | External links in markdown do not open in new tabs | Low | Low | Component test: render markdown with external link, verify `target="_blank"` and `rel="noopener noreferrer"`. |
| R2.4-6 | Browser back button does not return to previous page | Medium | Low | Integration test: navigate Home -> Detail, click browser back, verify Home page renders. |
| R2.4-7 | Syntax highlighting for code blocks in README fails or is unstyled | Low | Medium | Component test: render markdown with fenced code block, verify syntax highlighter component renders. |

### 2.5 Story 2.5: Relay Status Indicators

| Risk ID | Risk | Severity | Likelihood | Test Mitigation |
|---|---|---|---|---|
| R2.5-1 | Relay status color coding is wrong (e.g., 3 relays shows red instead of yellow) | Medium | Low | Unit test for status calculation logic with all boundary values: 0, 1, 2, 3, 4, 5 relays. |
| R2.5-2 | Expanded relay panel shows stale data that does not update on retry | Medium | Medium | Component test: render panel, trigger retry, verify data refreshes. Mock `queryClient.invalidateQueries()`. |
| R2.5-3 | Keyboard navigation cannot expand/collapse the panel | High | Medium | Accessibility test: Tab to badge, press Enter/Space, verify panel expands. Tab through panel items. |
| R2.5-4 | Data age indicator ("Last updated 30s ago") does not update | Low | Medium | Component test with `vi.useFakeTimers()`: render, advance time by 30s, verify text updates. |
| R2.5-5 | Retry button re-queries but does not update the relay status display | Medium | Low | Component test: click retry, verify loading state, verify updated relay count after mock resolves. |

### 2.6 Story 2.6: Real-Time Repository Updates

| Risk ID | Risk | Severity | Likelihood | Test Mitigation |
|---|---|---|---|---|
| R2.6-1 | WebSocket subscription not closed on page unmount, causing memory leak | Critical | Medium | Hook test: render hook, unmount, verify subscription `.close()` was called. |
| R2.6-2 | New repository appears but duplicates an existing one (same d-tag, updated event) | High | Medium | Hook test: simulate incoming event with same d-tag as existing repo. Verify list updates (replaces) rather than appending a duplicate. |
| R2.6-3 | Toast notification never appears or never dismisses | Medium | Low | Component test: simulate new event, verify toast renders with correct repo name. Advance timer by 5s, verify toast dismissed. |
| R2.6-4 | Cache invalidation on new event causes full page re-render flicker | Medium | Medium | Integration test: verify that cache invalidation triggers a smooth update (no unmount/remount flash). |
| R2.6-5 | WebSocket reconnection fails after disconnect, new events stop arriving | High | Medium | Hook test: simulate WebSocket disconnect, verify reconnection attempt within 5s. Simulate reconnect success, verify subscription resumes. |
| R2.6-6 | Subscription listens for wrong event kinds (not limited to 30617) | Medium | Low | Hook test: verify subscription filter includes only `kinds: [30617]`. |

---

## 3. Integration Test Scenarios (Between Stories)

These tests verify that stories compose correctly when integrated. They should be placed in a dedicated integration test file (e.g., `src/features/repository/__tests__/integration.test.tsx`).

### INT-1: Home Page to Repository Detail Navigation

**Stories involved:** 2.1, 2.2, 2.4
**Priority:** Critical

**Scenario:**
1. Render the application at route `/` with mocked repository data (3 repositories).
2. Verify repository cards render with correct metadata (name, description, relay badge).
3. Click on the first repository card's name link.
4. Verify the URL changes to `/:owner/:repo`.
5. Verify the repository detail page renders with the correct repository data.
6. Click browser back button.
7. Verify the home page renders with the original repository list intact (from cache).

**Why this matters:** This is the primary user journey. If navigation or data passing between the list and detail pages is broken, the entire epic is unusable.

### INT-2: Search Filtering with Repository Cards

**Stories involved:** 2.2, 2.3
**Priority:** High

**Scenario:**
1. Render home page with 10 mocked repositories (varied names and descriptions).
2. Type a search term that matches 3 repositories.
3. Verify only 3 cards are displayed.
4. Verify "Showing 3 of 10 repositories" counter.
5. Click a card from the filtered list.
6. Verify navigation to the correct repository detail page.
7. Navigate back to home page.
8. Verify the search term is still in the input and the list is still filtered.

**Why this matters:** Search state must survive navigation. If the user loses their search context on back-navigation, the experience degrades significantly.

### INT-3: Relay Status on List Page and Detail Page

**Stories involved:** 2.1, 2.5
**Priority:** High

**Scenario:**
1. Render home page with mocked relay metadata (3 of 5 relays responded).
2. Verify the global relay status indicator shows "Verified on 3 of 5 relays".
3. Click to expand the relay status panel.
4. Verify relay URLs and latencies are displayed.
5. Navigate to a repository detail page.
6. Verify the repository-specific relay status badge is consistent with the data source.

**Why this matters:** Relay status is a key trust signal in the UX. If the numbers are inconsistent between pages, user trust erodes.

### INT-4: Real-Time Updates on Filtered List

**Stories involved:** 2.3, 2.6
**Priority:** Medium

**Scenario:**
1. Render home page with 5 repositories.
2. Apply search filter showing 2 repositories.
3. Simulate a real-time event for a new repository that matches the filter.
4. Verify the new repository appears in the filtered list.
5. Verify the counter updates to "Showing 3 of 6 repositories".
6. Simulate a real-time event for a new repository that does NOT match the filter.
7. Verify the counter updates to "Showing 3 of 7 repositories" but the visible list stays at 3.

**Why this matters:** Real-time updates must interact correctly with the search filter. New repos that don't match the filter should update the total count but not appear in the filtered view.

### INT-5: Error Recovery to Loaded State

**Stories involved:** 2.1, 2.5
**Priority:** High

**Scenario:**
1. Render home page with all relays failing (error state).
2. Verify error message and retry button are displayed.
3. Click retry button.
4. Mock relays responding successfully.
5. Verify the repository list renders with cards.
6. Verify relay status indicator updates from error to success state.

**Why this matters:** Error recovery is the critical path for P2P networks. The transition from error state to loaded state must be smooth and correctly update all dependent components (list, relay status, cache).

---

## 4. Cross-Story Test Scenarios

These scenarios test behaviors that span multiple stories and architectural layers.

### CROSS-1: Stale-While-Revalidate with Real-Time Updates

**Stories involved:** 2.1, 2.6
**Test location:** `src/features/repository/hooks/__tests__/cache-realtime.test.ts`

**Scenario:**
1. Pre-seed TanStack Query cache with 5 stale repositories.
2. Mount the `useRepositories` hook.
3. Verify stale data is returned immediately.
4. Before the background refetch completes, simulate a real-time event for a 6th repository.
5. Verify the 6th repository appears in the list.
6. When the background refetch completes, verify the list shows fresh data including the 6th repository.

**Why this matters:** The interaction between stale-while-revalidate and real-time subscriptions is the most complex data flow in Epic 2. If cache invalidation from the subscription conflicts with the in-flight refetch, users could see flickering or data loss.

### CROSS-2: Search Filtering Preserves Real-Time Updates

**Stories involved:** 2.3, 2.6
**Test location:** Home page component test

**Scenario:**
1. Load 5 repositories.
2. Filter to show 2 repos matching "rig".
3. Receive real-time event for "rig-mobile".
4. Verify "rig-mobile" appears in filtered view.
5. Receive real-time event for "unrelated-project".
6. Verify filtered view still shows 3 items (the 2 original + "rig-mobile").
7. Clear search to verify all 7 repos are visible.

### CROSS-3: Relay Status Updates Across Components

**Stories involved:** 2.2, 2.5, 2.6
**Test location:** Integration test

**Scenario:**
1. Load repositories from 3 of 5 relays.
2. Verify card badges show "Verified on 3 relays".
3. Receive a real-time event from a 4th relay.
4. Verify relay status updates to show 4 relays.
5. Verify card badges update to "Verified on 4 relays".

### CROSS-4: Responsive Layout with Search and Cards

**Stories involved:** 2.1, 2.2, 2.3
**Test location:** Playwright visual verification

**Scenario:**
1. Load home page at desktop width (1280px): verify 3-column grid.
2. Resize to tablet (768px): verify 2-column grid.
3. Resize to mobile (375px): verify 1-column grid.
4. On mobile: verify search input is full-width and usable.
5. On mobile: verify card touch targets are at least 44x44px.
6. On mobile: type a search term and verify filtering works.

### CROSS-5: Accessibility End-to-End Flow

**Stories involved:** 2.1, 2.2, 2.3, 2.4, 2.5
**Test location:** Accessibility integration test

**Scenario:**
1. Tab through the home page: verify logical focus order (skip link > header > search input > first card > relay status).
2. Press "/" to focus search input.
3. Type a search term using keyboard only.
4. Tab to a card, press Enter to navigate to detail page.
5. Verify heading hierarchy: h1 for repo name, h2 for sections.
6. Tab to relay status badge, press Enter to expand panel.
7. Verify screen reader announcements for dynamic content (aria-live regions).

### CROSS-6: Deep Link to Detail Page with Cache Miss

**Stories involved:** 2.1, 2.4
**Test location:** Route integration test

**Scenario:**
1. Navigate directly to `/:owner/:repo` (no prior visit to home page).
2. Verify the detail page fetches repository data independently (not from list cache).
3. Verify the page renders correctly with loading -> loaded states.
4. Navigate to home page via header link.
5. Verify the home page loads the full repository list.
6. Verify the previously viewed repository is now in cache.

---

## 5. Acceptance Test Outline Per Story

### 5.1 Story 2.1: Repository List Page with Nostr Query

**Component:** `src/pages/Home.tsx`
**Hook:** `src/features/repository/hooks/useRepositories.ts`

| Test ID | Test Description | Type | Priority |
|---|---|---|---|
| AT-2.1.01 | Queries all configured relays for kind 30617 events on page load | Hook | Critical |
| AT-2.1.02 | Displays repositories in a grid layout | Component | High |
| AT-2.1.03 | Grid is 3-column on desktop, 2 on tablet, 1 on mobile | Visual (Playwright) | Medium |
| AT-2.1.04 | Queries race across relays in parallel (uses `pool.querySync`) | Unit (service) | High |
| AT-2.1.05 | Displays repositories even if only 1 of 5 relays responds | Hook | Critical |
| AT-2.1.06 | Shows loading state: "Connecting to Nostr relays..." | Component | High |
| AT-2.1.07 | Shows loading state: "Querying 5 relays for repositories..." | Component | High |
| AT-2.1.08 | Shows loading state: "Loaded from X of 5 relays" | Component | High |
| AT-2.1.09 | Shows error message with retry button when all relays fail | Component | Critical |
| AT-2.1.10 | Retry button re-queries relays and shows loading state | Component | High |
| AT-2.1.11 | Shows cached data immediately (stale-while-revalidate) | Hook | High |
| AT-2.1.12 | Updates cached data when fresh data arrives from relays | Hook | High |
| AT-2.1.13 | LCP < 2.5s on standard broadband | Performance (Playwright) | Medium |
| AT-2.1.14 | Deduplicates repositories from multiple relays | Hook | High |
| AT-2.1.15 | Empty state when no repositories exist on any relay | Component | Medium |

### 5.2 Story 2.2: Repository Card Component with Metadata

**Component:** `src/features/repository/RepoCard.tsx`

| Test ID | Test Description | Type | Priority |
|---|---|---|---|
| AT-2.2.01 | Displays repository name as prominent heading | Component | Critical |
| AT-2.2.02 | Displays description truncated to 3 lines with "read more" toggle | Component | High |
| AT-2.2.03 | "read more" expands full description, "show less" collapses | Component | Medium |
| AT-2.2.04 | Displays maintainer(s) names/npubs | Component | High |
| AT-2.2.05 | Displays ArNS URL (if available) | Component | Medium |
| AT-2.2.06 | Displays ArNS copy button that copies URL to clipboard | Component | Medium |
| AT-2.2.07 | Displays "Last updated X ago" relative timestamp | Component | Medium |
| AT-2.2.08 | Uses shadcn/ui Card component | Component | Low |
| AT-2.2.09 | Repository name is a clickable link to /:owner/:repo | Component | Critical |
| AT-2.2.10 | Verification badge shows "Verified on X relays" | Component | High |
| AT-2.2.11 | Card has hover state indicating interactivity | Visual (Playwright) | Low |
| AT-2.2.12 | Touch targets are minimum 44x44px | Accessibility | Medium |
| AT-2.2.13 | Card is responsive across breakpoints | Visual (Playwright) | Medium |
| AT-2.2.14 | Screen reader can navigate card with proper ARIA labels | Accessibility | High |
| AT-2.2.15 | Card renders gracefully when optional fields are missing (no ArNS, no description) | Component | High |

### 5.3 Story 2.3: Client-Side Search and Filtering

**Component:** Search section in `src/pages/Home.tsx`

| Test ID | Test Description | Type | Priority |
|---|---|---|---|
| AT-2.3.01 | Repository list filters in real-time as user types | Component | Critical |
| AT-2.3.02 | Filtering is case-insensitive | Unit | High |
| AT-2.3.03 | Filtering matches partial strings | Unit | High |
| AT-2.3.04 | Shows "Showing X of Y repositories" count | Component | Medium |
| AT-2.3.05 | "Clear search" button (X icon) appears when search has text | Component | High |
| AT-2.3.06 | Clicking "Clear search" resets the list | Component | High |
| AT-2.3.07 | Empty state when no repos match: "No repositories found matching '[term]'" | Component | High |
| AT-2.3.08 | Empty state includes "Clear search" button | Component | Medium |
| AT-2.3.09 | Search input has aria-label="Search repositories" | Accessibility | High |
| AT-2.3.10 | Search input has visible focus indicator | Accessibility | Medium |
| AT-2.3.11 | Keyboard shortcut "/" focuses the search input | Component | Medium |
| AT-2.3.12 | "/" inside the search input types the character (no re-focus loop) | Component | Medium |
| AT-2.3.13 | Search input works on mobile with appropriate keyboard | Visual (Playwright) | Low |
| AT-2.3.14 | Debounce delay (300ms) prevents excessive filtering | Component (fake timers) | Medium |
| AT-2.3.15 | Search term persists after navigating to detail and back | Integration | High |

### 5.4 Story 2.4: Repository Detail Page

**Component:** `src/features/repository/RepoDetail.tsx` (or `src/pages/RepoDetail.tsx`)
**Hook:** `src/features/repository/hooks/useRepository.ts`

| Test ID | Test Description | Type | Priority |
|---|---|---|---|
| AT-2.4.01 | Displays repository name as h1 heading | Component | Critical |
| AT-2.4.02 | Displays full description (not truncated) | Component | High |
| AT-2.4.03 | Displays complete list of maintainers with npub display | Component | High |
| AT-2.4.04 | Displays ArNS URL with copy functionality | Component | Medium |
| AT-2.4.05 | Displays repository topics/tags (if available) | Component | Medium |
| AT-2.4.06 | Displays last updated timestamp | Component | Medium |
| AT-2.4.07 | README.md is fetched from Arweave and rendered as markdown | Component | High |
| AT-2.4.08 | Markdown supports GitHub-flavored markdown (tables, strikethrough, task lists) | Component | Medium |
| AT-2.4.09 | Syntax highlighting works for code blocks in README | Component | Medium |
| AT-2.4.10 | Heading hierarchy is correct in rendered markdown | Accessibility | Medium |
| AT-2.4.11 | External links open in new tabs with rel="noopener noreferrer" | Component | High |
| AT-2.4.12 | Page is accessible via direct URL (deep linking) | Integration | Critical |
| AT-2.4.13 | Browser back button returns to previous page | Integration | High |
| AT-2.4.14 | TTI < 3.5s | Performance (Playwright) | Medium |
| AT-2.4.15 | Loading state shown while fetching repository data | Component | High |
| AT-2.4.16 | Error state shown when fetch fails | Component | High |
| AT-2.4.17 | Graceful fallback when README.md is not available | Component | High |
| AT-2.4.18 | Markdown rendering sanitizes XSS vectors (script tags, javascript: URLs) | Security | Critical |

### 5.5 Story 2.5: Relay Status Indicators

**Component:** `src/components/RelayStatusBadge.tsx`
**Hook:** `src/hooks/useRelayStatus.ts`

| Test ID | Test Description | Type | Priority |
|---|---|---|---|
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

### 5.6 Story 2.6: Real-Time Repository Updates

**Hook:** `src/features/repository/hooks/useRealtimeRepositories.ts`

| Test ID | Test Description | Type | Priority |
|---|---|---|---|
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

---

## 6. Test Data Requirements

### 6.1 Mock Repository Fixtures

Create a shared fixture file: `src/test-utils/fixtures/repositories.ts`

#### Fixture: Minimal Repository
```typescript
export const minimalRepository: Repository = {
  id: 'test-repo',
  name: 'test-repo',
  description: '',
  owner: 'abc123pubkey',
  maintainers: [],
  webUrls: [],
  cloneUrls: [],
  relays: [],
  topics: [],
  isPersonalFork: false,
  earliestUniqueCommit: null,
  eventId: 'evt001',
  createdAt: 1708900000,
}
```

#### Fixture: Full Repository (all fields populated)
```typescript
export const fullRepository: Repository = {
  id: 'rig-frontend',
  name: 'Rig Frontend',
  description: 'A decentralized git repository browser built with React, shadcn/ui, Nostr, and Arweave. Browse NIP-34 repositories with permanent storage verification.',
  owner: 'npub1abc123def456...',
  maintainers: ['npub1abc123def456...', 'npub1xyz789ghi012...'],
  webUrls: ['https://rig.ar-io.dev'],
  cloneUrls: ['https://github.com/example/rig-frontend.git'],
  relays: ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band'],
  topics: ['nostr', 'arweave', 'decentralized', 'git-browser'],
  isPersonalFork: false,
  earliestUniqueCommit: 'abc123def456',
  eventId: 'evt_full_001',
  createdAt: 1708900000,
}
```

#### Fixture: Repository List (10 items for search/filter testing)
```typescript
export const repositoryList: Repository[] = [
  { ...minimalRepository, id: 'rig-frontend', name: 'Rig Frontend', description: 'Decentralized git browser' },
  { ...minimalRepository, id: 'rig-mobile', name: 'Rig Mobile', description: 'Mobile app for Rig' },
  { ...minimalRepository, id: 'rig-cli', name: 'Rig CLI', description: 'Command-line interface for Rig' },
  { ...minimalRepository, id: 'nostr-tools', name: 'nostr-tools', description: 'Nostr protocol utilities' },
  { ...minimalRepository, id: 'arweave-sdk', name: 'Arweave SDK', description: 'Arweave gateway SDK' },
  { ...minimalRepository, id: 'dexie-orm', name: 'Dexie ORM', description: 'IndexedDB wrapper' },
  { ...minimalRepository, id: 'react-query', name: 'React Query', description: 'Async state management' },
  { ...minimalRepository, id: 'shadcn-ui', name: 'shadcn-ui', description: 'UI component library' },
  { ...minimalRepository, id: 'personal-fork', name: 'My Fork', description: 'A personal fork', isPersonalFork: true },
  { ...minimalRepository, id: 'empty-desc', name: 'Empty Description', description: '' },
]
```

#### Fixture: Repository with Very Long Description (truncation testing)
```typescript
export const longDescriptionRepository: Repository = {
  ...fullRepository,
  id: 'long-desc',
  description: 'Line 1 of the description which is quite detailed.\nLine 2 provides additional context about the repository.\nLine 3 continues with more information.\nLine 4 is beyond the truncation threshold.\nLine 5 should definitely be hidden by default.',
}
```

### 6.2 Mock Nostr Event Fixtures

Create: `src/test-utils/fixtures/nostr-events.ts`

#### Fixture: Valid Repository Announcement Event (kind 30617)
```typescript
export const validRepoAnnouncementEvent: NostrEvent = {
  id: 'event_id_001',
  pubkey: 'pubkey_abc123',
  created_at: 1708900000,
  kind: 30617,
  tags: [
    ['d', 'rig-frontend'],
    ['name', 'Rig Frontend'],
    ['description', 'Decentralized git browser'],
    ['web', 'https://rig.ar-io.dev'],
    ['clone', 'https://github.com/example/rig.git'],
    ['relays', 'wss://relay.damus.io', 'wss://nos.lol'],
    ['maintainers', 'pubkey_abc123', 'pubkey_xyz789'],
    ['t', 'nostr'],
    ['t', 'arweave'],
  ],
  content: '',
  sig: 'sig_valid_001',
}
```

#### Fixture: Duplicate Repository Event (same d-tag, different relay)
```typescript
export const duplicateRepoEvent: NostrEvent = {
  ...validRepoAnnouncementEvent,
  id: 'event_id_002',  // Different event ID
  sig: 'sig_valid_002',
  // Same d-tag 'rig-frontend' - should deduplicate
}
```

#### Fixture: Updated Repository Event (same d-tag, newer timestamp)
```typescript
export const updatedRepoEvent: NostrEvent = {
  ...validRepoAnnouncementEvent,
  id: 'event_id_003',
  created_at: 1708910000,  // 10000s newer
  tags: [
    ...validRepoAnnouncementEvent.tags.filter(t => t[0] !== 'description'),
    ['description', 'Updated description for the repository'],
  ],
  sig: 'sig_valid_003',
}
```

### 6.3 Mock Relay Status Fixtures

Create: `src/test-utils/fixtures/relay-status.ts`

```typescript
export interface RelayStatusFixture {
  url: string
  connected: boolean
  latencyMs: number | null
  lastResponseAt: number | null
  error: string | null
}

export const allRelaysHealthy: RelayStatusFixture[] = [
  { url: 'wss://relay.damus.io', connected: true, latencyMs: 120, lastResponseAt: Date.now(), error: null },
  { url: 'wss://nos.lol', connected: true, latencyMs: 85, lastResponseAt: Date.now(), error: null },
  { url: 'wss://relay.nostr.band', connected: true, latencyMs: 200, lastResponseAt: Date.now(), error: null },
  { url: 'wss://relay.snort.social', connected: true, latencyMs: 150, lastResponseAt: Date.now(), error: null },
  { url: 'wss://nostr.wine', connected: true, latencyMs: 95, lastResponseAt: Date.now(), error: null },
]

export const partialRelayFailure: RelayStatusFixture[] = [
  { url: 'wss://relay.damus.io', connected: true, latencyMs: 120, lastResponseAt: Date.now(), error: null },
  { url: 'wss://nos.lol', connected: true, latencyMs: 85, lastResponseAt: Date.now(), error: null },
  { url: 'wss://relay.nostr.band', connected: true, latencyMs: 200, lastResponseAt: Date.now(), error: null },
  { url: 'wss://relay.snort.social', connected: false, latencyMs: null, lastResponseAt: null, error: 'Connection timeout after 2000ms' },
  { url: 'wss://nostr.wine', connected: false, latencyMs: null, lastResponseAt: null, error: 'WebSocket error: ECONNREFUSED' },
]

export const singleRelayAlive: RelayStatusFixture[] = [
  { url: 'wss://relay.damus.io', connected: true, latencyMs: 450, lastResponseAt: Date.now(), error: null },
  { url: 'wss://nos.lol', connected: false, latencyMs: null, lastResponseAt: null, error: 'Timeout' },
  { url: 'wss://relay.nostr.band', connected: false, latencyMs: null, lastResponseAt: null, error: 'Timeout' },
  { url: 'wss://relay.snort.social', connected: false, latencyMs: null, lastResponseAt: null, error: 'Timeout' },
  { url: 'wss://nostr.wine', connected: false, latencyMs: null, lastResponseAt: null, error: 'Timeout' },
]

export const allRelaysFailed: RelayStatusFixture[] = [
  { url: 'wss://relay.damus.io', connected: false, latencyMs: null, lastResponseAt: null, error: 'Connection refused' },
  { url: 'wss://nos.lol', connected: false, latencyMs: null, lastResponseAt: null, error: 'Timeout' },
  { url: 'wss://relay.nostr.band', connected: false, latencyMs: null, lastResponseAt: null, error: 'DNS resolution failed' },
  { url: 'wss://relay.snort.social', connected: false, latencyMs: null, lastResponseAt: null, error: 'Timeout' },
  { url: 'wss://nostr.wine', connected: false, latencyMs: null, lastResponseAt: null, error: 'Timeout' },
]
```

### 6.4 Mock Arweave/README Fixtures

Create: `src/test-utils/fixtures/readme.ts`

```typescript
export const simpleReadme = `# Rig Frontend

A decentralized git repository browser.

## Features

- Browse repositories from Nostr relays
- View code stored on Arweave
- Verify data integrity
`

export const readmeWithCodeBlock = `# Example

\`\`\`typescript
function hello(): string {
  return 'Hello, decentralized world!'
}
\`\`\`
`

export const readmeWithXssVectors = `# Malicious README

<script>alert('xss')</script>

[Click me](javascript:alert('xss'))

<iframe src="https://evil.com"></iframe>

<img src=x onerror="alert('xss')">
`

export const readmeWithGfm = `# GFM Features

| Feature | Status |
|---------|--------|
| Tables  | Yes    |
| Tasks   | Yes    |

- [x] Completed task
- [ ] Pending task

~~Strikethrough text~~
`
```

### 6.5 Test Utility Wrappers

Create or extend: `src/test-utils/render.tsx`

```typescript
// Wrapper providing QueryClient + Router for integration tests
export function renderWithProviders(
  ui: React.ReactElement,
  options?: {
    initialRoute?: string
    queryData?: Record<string, unknown>
  }
)

// Wrapper for hook tests with QueryClient
export function createTestQueryClient(): QueryClient

// Wrapper for router integration tests
export function renderWithRouter(
  routes: RouteObject[],
  initialEntries?: string[]
)
```

### 6.6 Mock Service Layer

Create: `src/test-utils/mocks/nostr.ts`

```typescript
// Mock fetchRepositories for component tests
export function mockFetchRepositories(
  result: Repository[] | RigError,
  delay?: number
): void

// Mock subscription for real-time tests
export function mockRealtimeSubscription(): {
  simulateEvent: (event: NostrEvent) => void
  simulateDisconnect: () => void
  simulateReconnect: () => void
  getCloseCallCount: () => number
}
```

### 6.7 Summary of Fixture Files Needed

| File | Purpose | Used By Stories |
|---|---|---|
| `src/test-utils/fixtures/repositories.ts` | Repository domain model fixtures | 2.1, 2.2, 2.3, 2.4, 2.6 |
| `src/test-utils/fixtures/nostr-events.ts` | Raw Nostr event fixtures | 2.1, 2.6 |
| `src/test-utils/fixtures/relay-status.ts` | Relay health/status fixtures | 2.1, 2.5, 2.6 |
| `src/test-utils/fixtures/readme.ts` | Markdown/README content fixtures | 2.4 |
| `src/test-utils/render.tsx` | Test render wrappers with providers | All stories |
| `src/test-utils/mocks/nostr.ts` | Service layer mocks | 2.1, 2.6 |

---

## Appendix A: Test Count Estimates

| Story | Unit Tests | Component Tests | Hook Tests | Integration Tests | Accessibility Tests | Total (est.) |
|---|---|---|---|---|---|---|
| 2.1 | 5 | 8 | 6 | 2 | 2 | ~23 |
| 2.2 | 3 | 10 | 0 | 2 | 4 | ~19 |
| 2.3 | 4 | 8 | 0 | 2 | 3 | ~17 |
| 2.4 | 4 | 10 | 4 | 3 | 3 | ~24 |
| 2.5 | 4 | 8 | 4 | 2 | 3 | ~21 |
| 2.6 | 2 | 4 | 6 | 3 | 0 | ~15 |
| **Cross-story** | 0 | 0 | 2 | 6 | 1 | ~9 |
| **Total** | **22** | **48** | **22** | **20** | **16** | **~128** |

Combined with Epic 1's 391 tests, Epic 2 completion should bring the total to approximately **519 tests**.

## Appendix B: Test Execution Order

Stories should be implemented and tested in order: 2.1 -> 2.2 -> 2.3 -> 2.4 -> 2.5 -> 2.6. Each story's tests should pass independently with mocked dependencies, but integration and cross-story tests should be written after their dependent stories are complete.

**Recommended integration test timing:**
- After Story 2.2: Write INT-1 (Home -> Detail navigation)
- After Story 2.3: Write INT-2 (Search + Cards), CROSS-4 (Responsive)
- After Story 2.5: Write INT-3 (Relay status), INT-5 (Error recovery), CROSS-5 (Accessibility)
- After Story 2.6: Write INT-4 (Real-time + Filter), CROSS-1 (Cache + Real-time), CROSS-2 (Search + Real-time), CROSS-3 (Relay status updates)

## Appendix C: Regression Safety

Every story implementation must verify that all 391 existing Epic 1 tests continue to pass. The CI pipeline should run the full test suite on every commit. Any regression in Epic 1 tests blocks the story from completion.

**Specific regression risks from Epic 2:**
- Modifying `lib/nostr.ts` (adding relay metadata tracking) could break existing service layer tests
- Modifying `routes.tsx` (updating page components) could break existing routing tests
- Adding new dependencies (`react-markdown`, `remark-gfm`, `react-syntax-highlighter`) could affect bundle size tests
- Modifying `pages/Home.tsx` or `pages/RepoDetail.tsx` (replacing placeholders) will change behavior tested by existing route tests
