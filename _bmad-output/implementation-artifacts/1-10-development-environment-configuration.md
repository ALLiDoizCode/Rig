# Story 1.10: Development Environment Configuration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **environment configuration files that drive application behavior for development and production**,
So that **the application connects to appropriate relays and gateways in each environment and constants are configurable without code changes**.

## Acceptance Criteria

1. **Environment files** exist in `rig-frontend/` project root:
   - `.env.development` with local/dev settings
   - `.env.production` with production settings
   - `.env.example` with documented placeholder values (committed to git)
   - `.gitignore` includes `.env.local` and `.env.*.local` for personal overrides

2. **`.env.development`** contains:
   ```bash
   VITE_NOSTR_RELAYS=wss://relay.damus.io,wss://nos.lol,wss://relay.nostr.band
   VITE_ARWEAVE_GATEWAY=https://arweave.net
   VITE_ENABLE_DEVTOOLS=true
   ```

3. **`.env.production`** contains:
   ```bash
   VITE_NOSTR_RELAYS=wss://relay.damus.io,wss://nos.lol,wss://relay.nostr.band
   VITE_ARWEAVE_GATEWAY=https://arweave.net
   VITE_ENABLE_DEVTOOLS=false
   ```

4. **TypeScript type safety**: Custom `ImportMetaEnv` interface declares all `VITE_` variables with proper types

5. **Constants read from environment**: `src/constants/nostr.ts` and `src/constants/arweave.ts` read from `import.meta.env` with hardcoded fallbacks

6. **DevTools controlled by env var**: `main.tsx` uses `VITE_ENABLE_DEVTOOLS` to conditionally render ReactQueryDevtools

7. **README.md** updated with environment setup instructions

8. **All existing 372+ tests continue to pass** (zero regressions)

## Tasks / Subtasks

- [x] Task 1: Create TypeScript type declarations for env vars (AC: #4)
  - [x] 1.1 Create `src/env.d.ts` with `ImportMetaEnv` interface declaring `VITE_NOSTR_RELAYS: string`, `VITE_ARWEAVE_GATEWAY: string`, `VITE_ENABLE_DEVTOOLS: string`
  - [x] 1.2 Extend `ImportMeta` interface with `readonly env: ImportMetaEnv`

- [x] Task 2: Update Nostr constants to read from env (AC: #5)
  - [x] 2.1 Modify `src/constants/nostr.ts`: `DEFAULT_RELAYS` reads `import.meta.env.VITE_NOSTR_RELAYS`, splits on comma, falls back to hardcoded array
  - [x] 2.2 Create `src/constants/nostr.test.ts` with env var parsing tests and fallback verification

- [x] Task 3: Update Arweave constants to read from env (AC: #5)
  - [x] 3.1 Modify `src/constants/arweave.ts`: Read `import.meta.env.VITE_ARWEAVE_GATEWAY` with URL validation and fallback to hardcoded default
  - [x] 3.2 Create `src/constants/arweave.test.ts` with env var validation tests and fallback verification

- [x] Task 4: Update DevTools rendering in main.tsx (AC: #6)
  - [x] 4.1 Change `import.meta.env.DEV` to `import.meta.env.VITE_ENABLE_DEVTOOLS === 'true'` in `src/main.tsx`

- [x] Task 5: Update environment files (AC: #1, #2, #3)
  - [x] 5.1 Verify `.env.development` has correct values (already exists)
  - [x] 5.2 Verify `.env.production` has correct values (already exists)
  - [x] 5.3 Enhance `.env.example` with detailed comments for each variable
  - [x] 5.4 Verify `.gitignore` has `.env.local` and `.env.*.local` (already present)

- [x] Task 6: Update README.md with environment docs (AC: #7)
  - [x] 6.1 Replace Vite template boilerplate with Rig project documentation
  - [x] 6.2 Add "Environment Setup" section with variable descriptions
  - [x] 6.3 Add "Development" section with `npm run dev` / `npm run build` / `npm test` commands
  - [x] 6.4 Document `.env.local` override pattern for developer customization

- [x] Task 7: Write tests for env configuration (AC: #8)
  - [x] 7.1 Create `src/lib/env.test.ts` to validate env reading logic (parsing, fallbacks)
  - [x] 7.2 Run full test suite: `npx vitest run` - all 385+ tests pass
  - [x] 7.3 Run TypeScript check: `npx tsc --noEmit` - zero errors

## Dev Notes

### Architecture Pattern: Environment-Driven Configuration

The architecture specifies `.env` files with Vite for environment configuration:
- Dev/prod use different relay and gateway URLs
- `VITE_` prefix required for client-side exposure (Vite security model)
- Access via `import.meta.env.VITE_*` pattern
- Constants modules act as the bridge: read env vars, provide typed fallbacks

```
.env.{mode} files (source of truth per environment)
  -> src/constants/nostr.ts, src/constants/arweave.ts (read env, provide defaults)
    -> src/lib/nostr.ts, src/lib/arweave.ts (import from constants, unchanged)
      -> Components (consume service layer, unchanged)
```

### Current State: What Already Exists

**Files that exist and are correct (verify, don't recreate):**
- `rig-frontend/.env.development` - Has relay/gateway/devtools values
- `rig-frontend/.env.production` - Has relay/gateway/devtools values
- `rig-frontend/.env.example` - Has basic template
- `rig-frontend/.gitignore` - Already has `.env.local` and `.env.*.local` at lines 16-17

**Files that need modification:**
- `src/constants/nostr.ts` - `DEFAULT_RELAYS` is hardcoded array, must read from env
- `src/constants/arweave.ts` - `TRUSTED_GATEWAYS` is hardcoded, primary gateway must come from env
- `src/main.tsx` - Uses `import.meta.env.DEV` instead of `VITE_ENABLE_DEVTOOLS`
- `README.md` - Contains Vite template boilerplate, needs project-specific docs

**Files that need creation:**
- `src/env.d.ts` - TypeScript type declarations for custom env vars

### Critical: How Constants Must Change

**`src/constants/nostr.ts` update pattern:**
```typescript
// Read from env, split comma-separated, fall back to defaults
const envRelays = import.meta.env.VITE_NOSTR_RELAYS
export const DEFAULT_RELAYS = envRelays
  ? envRelays.split(',').map((r: string) => r.trim()).filter(Boolean)
  : ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band']
```

**`src/constants/arweave.ts` update pattern:**
```typescript
// Read primary gateway from env, fall back to arweave.net
const envGateway = import.meta.env.VITE_ARWEAVE_GATEWAY
const primaryGateway = envGateway || 'https://arweave.net'

export const TRUSTED_GATEWAYS = [
  new URL(primaryGateway),
  new URL('https://permagate.io'),
]
```

**`src/main.tsx` update pattern:**
```typescript
// Change from built-in DEV flag to custom env var
{import.meta.env.VITE_ENABLE_DEVTOOLS === 'true' && <ReactQueryDevtools initialIsOpen={false} />}
```

### Critical: TypeScript Type Declaration

Create `src/env.d.ts` (NOT `vite-env.d.ts` - that's the default Vite one):
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NOSTR_RELAYS: string
  readonly VITE_ARWEAVE_GATEWAY: string
  readonly VITE_ENABLE_DEVTOOLS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Note: `tsconfig.app.json` already includes `"types": ["vite/client"]` at line 8, which provides base Vite env types. The custom `env.d.ts` extends these with project-specific variables.

### Critical: Env Vars Are Always Strings

All `import.meta.env.VITE_*` values are **strings** (or `undefined` if not set). Never assume boolean or number types:
- `VITE_ENABLE_DEVTOOLS` is `"true"` or `"false"` (string), compare with `=== 'true'`
- `VITE_NOSTR_RELAYS` is a comma-separated string, must `.split(',')` to get array
- `VITE_ARWEAVE_GATEWAY` is a URL string

### Critical: Test Environment

Vitest does NOT automatically load `.env.*` files. In the test environment (`happy-dom`), `import.meta.env.VITE_*` will be `undefined`. The constants MUST have hardcoded fallbacks that work when env vars are absent. This is why the fallback pattern is critical:

```typescript
// This works in tests (env var undefined) AND in dev/prod (env var set)
const envRelays = import.meta.env.VITE_NOSTR_RELAYS
export const DEFAULT_RELAYS = envRelays
  ? envRelays.split(',').map((r: string) => r.trim()).filter(Boolean)
  : ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.nostr.band']
```

### Critical: Do NOT Break Existing Imports

The service layer files (`lib/nostr.ts`, `lib/arweave.ts`) import from constants. Do NOT change any export names or signatures:
- `DEFAULT_RELAYS` must remain a `string[]` export from `@/constants/nostr`
- `TRUSTED_GATEWAYS` must remain a `URL[]` export from `@/constants/arweave`
- `GATEWAY_TIMEOUT_MS`, `GATEWAY_COUNT`, `GATEWAY_CACHE_TTL_SECONDS` remain unchanged

### Critical: Named Exports Pattern

All modules use named exports (no default exports). This was established in Story 1.1 and enforced consistently through Stories 1.2-1.9.

### Critical: React Router v7 (NOT v6)

Import from `react-router` not `react-router-dom`. Established in Story 1.6.

### Critical: Zod v4 API

String validators are top-level: `z.email()`, `z.url()`. Established in Story 1.8.

### Test Environment Details

- **Vitest** with **happy-dom** environment
- `fake-indexeddb/auto` imported in test setup
- Tests co-located with source files (e.g., `nostr.ts` -> `nostr.test.ts`)
- Current test count: 372 tests passing
- ThemeProvider wrapper required for component tests

### Previous Story Intelligence (from Story 1.9)

- All transformers are pure functions - same pattern should apply to env parsing
- `validateAndTransform()` pattern shows how to handle fallible parsing gracefully
- Code review found issues with misleading test comments - ensure test descriptions are accurate
- Error codes must match `RigError` types in `src/types/common.ts`
- Total test count after 1.9: 372 tests

### Git Intelligence

Recent commit pattern: `"Implement Story X.Y: <description> with code review fixes"`

Key patterns from recent work:
- Stories 1.1-1.9 all completed successfully
- Consistent use of named exports
- Co-located test files
- `@/` path alias for all imports

### README.md Content Guidance

Replace the existing Vite template boilerplate with project-relevant documentation. Include:
1. Project name and brief description (Rig - NIP-34 decentralized git hosting frontend)
2. Prerequisites (Node.js, npm)
3. Getting started (clone, install, setup env, run dev)
4. Environment variables table with descriptions
5. Available scripts (`dev`, `build`, `test`, `lint`, `preview`)
6. Project structure overview
7. Technology stack summary

### `.env.example` Enhancement

Add descriptive comments:
```bash
# Nostr Relay URLs (comma-separated WebSocket URLs)
# These relays are queried for NIP-34 git repository events
VITE_NOSTR_RELAYS=wss://relay.damus.io,wss://nos.lol,wss://relay.nostr.band

# Arweave Gateway URL
# Primary gateway for fetching permanent file storage
VITE_ARWEAVE_GATEWAY=https://arweave.net

# Enable React Query DevTools (true/false)
# Set to true for development debugging, false for production
VITE_ENABLE_DEVTOOLS=true
```

### Project Structure Notes

- Environment type declarations: `src/env.d.ts` (new file)
- Constants modified: `src/constants/nostr.ts`, `src/constants/arweave.ts`
- Entry point modified: `src/main.tsx`
- Documentation: `README.md`, `.env.example`
- All imports use `@/` path alias (resolves to `src/`)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Environment Configuration (lines 905-917)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Development Workflow Integration (lines 1829-1860)]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.10 (lines 1316-1368)]
- [Source: rig-frontend/src/constants/nostr.ts - Current hardcoded DEFAULT_RELAYS]
- [Source: rig-frontend/src/constants/arweave.ts - Current hardcoded TRUSTED_GATEWAYS]
- [Source: rig-frontend/src/lib/nostr.ts - Imports DEFAULT_RELAYS from constants]
- [Source: rig-frontend/src/lib/arweave.ts - Imports gateway constants]
- [Source: rig-frontend/src/main.tsx - Current import.meta.env.DEV usage]
- [Source: rig-frontend/tsconfig.app.json - "types": ["vite/client"] at line 8]
- [Source: rig-frontend/.gitignore - .env.local patterns at lines 16-17]
- [Source: _bmad-output/implementation-artifacts/1-9-service-layer-architecture-error-handling.md]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

None required - all implementation completed successfully without issues.

### Completion Notes List

✅ **Task 1 Complete** (AC #4): Created TypeScript type declarations
- Created `rig-frontend/src/env.d.ts` with `ImportMetaEnv` interface
- Declared all three VITE_ environment variables as readonly strings
- Extended `ImportMeta` interface with typed env property
- TypeScript compilation validates type safety

✅ **Task 2 Complete** (AC #5): Updated Nostr constants for environment-driven configuration
- Modified `rig-frontend/src/constants/nostr.ts` to read `VITE_NOSTR_RELAYS`
- Implemented comma-separated parsing with trim and filter
- Maintained hardcoded fallback for test environment compatibility
- All 10 Nostr constant tests pass

✅ **Task 3 Complete** (AC #5): Updated Arweave constants for environment-driven configuration
- Modified `rig-frontend/src/constants/arweave.ts` to read `VITE_ARWEAVE_GATEWAY`
- Primary gateway now reads from env with fallback to arweave.net
- Maintained permagate.io as secondary trusted gateway
- All 8 Arweave constant tests pass

✅ **Task 4 Complete** (AC #6): Updated DevTools conditional rendering
- Modified `rig-frontend/src/main.tsx` line 15
- Changed from `import.meta.env.DEV` to `import.meta.env.VITE_ENABLE_DEVTOOLS === 'true'`
- DevTools now controlled by explicit env var instead of Vite mode

✅ **Task 5 Complete** (AC #1, #2, #3): Environment files verified and enhanced
- Verified `.env.development` has correct values (relays, gateway, devtools=true)
- Verified `.env.production` has correct values (relays, gateway, devtools=false)
- Enhanced `.env.example` with detailed comments explaining each variable
- Verified `.gitignore` contains `.env.local` and `.env.*.local` (lines 16-17)

✅ **Task 6 Complete** (AC #7): README.md comprehensively updated
- Replaced Vite template boilerplate with project-specific documentation
- Added project description (Rig - NIP-34 decentralized git hosting)
- Added Getting Started section with prerequisites and setup instructions
- Added Environment Variables section with complete table and descriptions
- Added Available Scripts, Project Structure, Technology Stack sections
- Documented `.env.local` override pattern for developer customization
- Added Development Workflow section

✅ **Task 7 Complete** (AC #8): Environment configuration tests and validation
- Created `rig-frontend/src/lib/env.test.ts` with 13 comprehensive tests
- Added env parsing tests to `src/constants/nostr.test.ts` (4 new tests)
- Added env validation tests to `src/constants/arweave.test.ts` (2 new tests)
- Tests cover: type declarations, parsing logic, fallback behavior, URL validation, security
- Full test suite passes: **391/391 tests** (increased from 372, then 385, then 391 after code review)
- TypeScript check passes: **zero errors** (`npx tsc --noEmit`)

**Final Validation Results:**
- ✅ All acceptance criteria satisfied
- ✅ All 7 tasks and 19 subtasks completed
- ✅ Zero test regressions (391 tests passing after code review)
- ✅ Zero TypeScript errors
- ✅ Environment-driven configuration fully functional
- ✅ Fallback pattern works in test environment
- ✅ Documentation complete and accurate

### File List

#### Created Files
- `rig-frontend/src/env.d.ts` - TypeScript environment variable type declarations

#### Modified Files
- `rig-frontend/src/constants/nostr.ts` - Added env var reading with fallback
- `rig-frontend/src/constants/arweave.ts` - Added env var reading with fallback and URL validation
- `rig-frontend/src/main.tsx` - Updated DevTools conditional to use VITE_ENABLE_DEVTOOLS
- `rig-frontend/.env.example` - Enhanced with detailed comments
- `rig-frontend/README.md` - Complete rewrite with project documentation
- `rig-frontend/src/types/common.ts` - Added ARNS_RESOLUTION_FAILED error code (for future ArNS integration)
- `rig-frontend/src/env.d.ts` - Used stricter literal type for VITE_ENABLE_DEVTOOLS

#### Test Files Created/Updated
- `rig-frontend/src/lib/env.test.ts` - Environment configuration tests (13 tests)
- `rig-frontend/src/constants/nostr.test.ts` - Added env var parsing tests (14 tests total)
- `rig-frontend/src/constants/arweave.test.ts` - Added env var validation tests (10 tests total)

#### Verified Unchanged (Already Correct)
- `rig-frontend/.env.development` - Existing values correct
- `rig-frontend/.env.production` - Existing values correct
- `rig-frontend/.gitignore` - Already has .env.local patterns


### Code Review Fixes (AI)

**Code Review Date:** 2026-02-25
**Reviewer:** Claude Sonnet 4.5 (Adversarial Code Review Agent)
**Issues Found:** 5 Medium, 3 Low
**Issues Fixed:** 5 Medium (all)

**Medium Issues Fixed:**

1. **Added URL Validation for Gateway** - `src/constants/arweave.ts`
   - Added try-catch around `new URL()` to handle malformed `VITE_ARWEAVE_GATEWAY` values
   - Falls back to default with console warning if URL is invalid
   - Prevents runtime crashes from user configuration errors

2. **Improved Type Safety for DevTools Flag** - `src/env.d.ts`
   - Changed `VITE_ENABLE_DEVTOOLS: string` to `VITE_ENABLE_DEVTOOLS: 'true' | 'false'`
   - TypeScript now catches invalid values at compile time
   - Better developer experience with autocomplete

3. **Added Environment Variable Parsing Tests** - `src/constants/nostr.test.ts`
   - Added 4 new tests for comma-separated parsing, whitespace handling, and fallback behavior
   - Validates the actual parsing logic used in production code
   - Ensures env-driven behavior works correctly

4. **Added Environment Variable Validation Tests** - `src/constants/arweave.test.ts`
   - Added 2 new tests for URL validation and fallback behavior
   - Verifies that invalid URLs are handled gracefully
   - Confirms fallback mechanism works in test environment

5. **Updated File List and Task Descriptions**
   - Added missing `src/types/common.ts` to Modified Files section
   - Updated `src/env.d.ts` to reflect stricter type usage
   - Corrected task 2.2 and 3.2 descriptions from "Update (if needed)" to "Create" for accuracy
   - Updated test file counts: nostr (14 tests), arweave (10 tests), env (13 tests)

**Low Issues Noted (Not Fixed):**
- Test command documentation inconsistency (npm test vs npx vitest run)
- .env file timestamp discrepancy (files verified, not created)
- Integration test gap for whitespace handling (covered by unit tests in env.test.ts)

**Test Results After Fixes:**
- Total tests: 391 (increased from 385 due to new test cases)
- TypeScript: Zero errors
- All acceptance criteria: PASS

## Change Log

- **2026-02-25**: Story 1.10 code review completed and fixes applied
  - Adversarial code review found 5 MEDIUM and 3 LOW issues
  - Fixed all 5 MEDIUM issues:
    - Added URL validation for VITE_ARWEAVE_GATEWAY with try-catch and fallback
    - Improved type safety: VITE_ENABLE_DEVTOOLS now uses literal type 'true' | 'false'
    - Added environment variable parsing tests to nostr.test.ts (4 new tests)
    - Added environment variable validation tests to arweave.test.ts (2 new tests)
    - Updated story file documentation for accuracy and completeness
  - Test count increased from 385 to 391 tests (all passing)
  - TypeScript compilation: zero errors
  - Story marked as done

- **2026-02-25**: Story 1.10 implementation completed
  - Created TypeScript env type declarations (env.d.ts)
  - Updated Nostr and Arweave constants to read from environment variables
  - Modified DevTools rendering to use VITE_ENABLE_DEVTOOLS
  - Enhanced .env.example with detailed documentation
  - Completely rewrote README.md with project-specific documentation
  - Added 13 environment configuration tests
  - All 385 tests passing, zero TypeScript errors
  - Story marked ready for review
