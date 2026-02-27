# Epic 2 Start Report

## Overview
- **Epic**: 2 — Repository Discovery & Exploration
- **Git start**: `f319625b84342fcd2a2edca2b4bbc339723ba32d`
- **Duration**: ~30 minutes total pipeline execution
- **Pipeline result**: success
- **Previous epic retro**: reviewed (epic-1-retro-2026-02-26.md)
- **Baseline test count**: 392

## Previous Epic Action Items

| # | Action Item | Priority | Resolution |
|---|------------|----------|------------|
| 1 | Update architecture spec with Crosstown Docker infrastructure | Critical | Deferred — cross-team preparation task requiring infrastructure expertise |
| 2 | Build seed script using @crosstown/client for NIP-34 fixtures | Critical | Deferred — requires domain-specific tooling |
| 3 | Validate Zod v4 schemas against real NIP-34 events | Critical | Deferred — depends on seed script (item 2) |
| 4 | Add pool cleanup/destroy function to nostr.ts | High | **Fixed** — added `destroyPool()` function |
| 5 | Make DEFAULT_RELAYS immutable with `as const` | High | **Fixed** — typed as `readonly string[]` with `FALLBACK_RELAYS as const` |
| 6 | Improve Suspense fallback to skeleton UI | High | **Fixed** — replaced "Loading..." with `PageSkeleton` component using shadcn/ui Skeleton |
| 7 | Verify specs against installed package APIs | Recommended | Noted for process — will apply during story creation |
| 8 | Add error-path acceptance criteria to story template | Recommended | Noted for process |
| 9 | Update Epic 2 stories with local testing references | Recommended | Noted for process |
| 10 | Spike on pool.subscribeMany() lifecycle | Nice-to-have | Deferred |
| 11 | Verify react-markdown + react-syntax-highlighter | Nice-to-have | Deferred |
| 12 | Address 13 deferred LOW-severity code review items | Nice-to-have | Deferred |
| 13 | Track crosstown-peer1 node health | Nice-to-have | Monitoring — external team dependency |

## Baseline Status
- **Lint**: pass — 43 ESLint errors fixed across 11 files (TypeScript type-check and ESLint both green)
- **Tests**: 392/392 passing (0 fixed during cleanup — all green on first run)
- **Migrations**: N/A (no database migrations in this frontend project)

## Epic Analysis
- **Stories**: 6 stories
  - 2.1 Repository List Page with Nostr Query
  - 2.2 Repository Card Component with Metadata
  - 2.3 Client-Side Search and Filtering
  - 2.4 Repository Detail Page
  - 2.5 Relay Status Indicators
  - 2.6 Real-Time Repository Updates
- **Oversized stories** (>8 ACs): Stories 2.1 and 2.2 (9 ACs each) — recommend splitting
  - 2.1: Split data layer (useRepositories hook) from UI layout (responsive grid)
  - 2.2: Split core card component from accessibility/verification badge concerns
- **Dependencies**: Strictly sequential chain defined in epics (2.1→2.2→2.3→2.4→2.5→2.6), but analysis shows stories 2.3, 2.4, and 2.5 can be parallelized after 2.2
- **Design patterns needed**:
  - Feature module pattern (`src/features/repository/`) — first feature module, template for all future epics
  - TanStack Query hook pattern (useRepositories) — first real data-fetching hook
  - Subscription management pattern (useRealtimeRepositories) — first WebSocket subscription hook
  - Shared component pattern (RelayStatusBadge in src/components/)
- **Recommended story order**:
  1. **2.1** — Foundation: creates feature module structure, useRepositories hook, Home page grid
  2. **2.2** — Depends on 2.1: RepoCard component rendered inside the list
  3. **2.3 / 2.4 / 2.5 (parallel)** — All three can run independently after 2.2
  4. **2.6** — Must come last: integrates real-time subscriptions across all components

## Test Design
- **Epic test plan**: `_bmad-output/planning-artifacts/test-design-epic-2.md`
- **Key risks identified**:
  - XSS in markdown rendering (Story 2.4) — Critical: first time rendering untrusted content from Arweave
  - WebSocket subscription memory leaks (Story 2.6) — Critical: silent connection accumulation
  - Nostr relay availability/timeout handling (Story 2.1) — High: multi-relay failure scenarios
  - Search state persistence across navigation (Story 2.3) — Medium: UX regression risk
- **Estimated new tests**: ~128, bringing total from 392 to ~520

## Pipeline Steps

### Step 1: Previous Retro Check
- **Status**: success
- **Duration**: ~3 minutes
- **What changed**: none (read-only analysis)
- **Key decisions**: Categorized 13 action items by priority (3 critical path, 3 high, 3 recommended, 4 nice-to-have)
- **Issues found & fixed**: 0
- **Remaining concerns**: 3 critical-path preparation tasks (architecture spec, seed script, schema validation) deferred as cross-team dependencies

### Step 2: Tech Debt Cleanup
- **Status**: success
- **Duration**: ~5 minutes
- **What changed**: 7 files modified, 1 file created (skeleton.tsx)
- **Key decisions**: Used spread syntax for readonly array compatibility; removed SIGNATURE_INVALID rather than adding unused throw; added PageSkeleton with shadcn/ui components
- **Issues found & fixed**: 5/5 items addressed (pool cleanup, immutable relays, skeleton UI, NotFound recovery link, SIGNATURE_INVALID removal)
- **Remaining concerns**: none

### Step 3: Lint Baseline
- **Status**: success
- **Duration**: ~4 minutes
- **What changed**: 11 files modified
- **Key decisions**: Used eslint-disable for intentional patterns (component + variant exports, unused reserved params); replaced `any` with `unknown`/`Record<string, unknown>` for actual type safety
- **Issues found & fixed**: 43 ESLint errors (2 react-refresh, 4 no-explicit-any, 33 no-unused-vars, 4 other)
- **Remaining concerns**: none

### Step 4: Test Baseline
- **Status**: success
- **Duration**: ~30 seconds
- **What changed**: none (all 392 tests passed on first run)
- **Key decisions**: none needed
- **Issues found & fixed**: 0
- **Remaining concerns**: Minor Radix UI accessibility warning about missing DialogContent description (non-blocking)

### Step 5: Epic Overview Review
- **Status**: success
- **Duration**: ~8 minutes
- **What changed**: none (read-only analysis)
- **Key decisions**: Identified parallelization opportunity for stories 2.3/2.4/2.5; flagged 2.1 and 2.2 as oversized
- **Issues found & fixed**: 0
- **Remaining concerns**: Toast component needed for Story 2.6 should be verified as installed

### Step 6: Sprint Status Update
- **Status**: success
- **Duration**: ~30 seconds
- **What changed**: sprint-status.yaml — epic-2 status changed from backlog to in-progress
- **Key decisions**: Used targeted Edit to avoid accidental changes to other statuses
- **Issues found & fixed**: 0
- **Remaining concerns**: none

### Step 7: Test Design
- **Status**: success
- **Duration**: ~6 minutes
- **What changed**: Created _bmad-output/planning-artifacts/test-design-epic-2.md
- **Key decisions**: Mock at service layer rather than WebSocket level; elevated XSS risk to Critical; estimated ~128 new tests
- **Issues found & fixed**: 0
- **Remaining concerns**: msw not installed (team should decide whether to adopt or continue with vi.mock()); performance tests need Playwright CI configuration

## Ready to Develop
- [x] All critical retro actions resolved (3 HIGH-priority tech debt items fixed; 3 critical-path cross-team items deferred with documentation)
- [x] Lint and tests green (zero failures — 392/392 tests, 0 ESLint errors, 0 TypeScript errors)
- [x] Sprint status updated (epic-2 set to in-progress)
- [x] Story order established (2.1 → 2.2 → 2.3/2.4/2.5 parallel → 2.6)

## Next Steps
- **First story**: 2.1 — Repository List Page with Nostr Query
- **Preparation notes**:
  - Story 2.1 establishes the `src/features/repository/` directory structure — this is the template for all future feature modules
  - Consider splitting Story 2.1 (9 ACs) before implementation
  - The `useRepositories` TanStack Query hook created here will be the reference pattern for all data-fetching hooks
  - Existing stubs at `src/pages/Home.tsx` and `src/pages/RepoDetail.tsx` should be enhanced (not replaced)

---

## TL;DR
Epic 2 (Repository Discovery & Exploration) is ready to start. The pipeline resolved 5 tech debt items from the Epic 1 retro, fixed 43 lint issues to establish a green baseline, and confirmed all 392 tests pass. Sprint status is updated to in-progress, story order is established (2.1→2.2→2.3/2.4/2.5 parallel→2.6), and a risk-based test design covering ~128 new tests is in place. First story to implement: 2.1 — Repository List Page with Nostr Query.
