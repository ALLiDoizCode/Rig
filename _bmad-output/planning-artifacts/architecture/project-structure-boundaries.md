# Project Structure & Boundaries

_Complete project organization with architectural boundaries and requirements mapping._

## Complete Project Directory Structure

```
rig-frontend/
├── README.md
├── package.json
├── package-lock.json
├── .gitignore
├── .env.development
├── .env.production
├── .env.example
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── components.json                    # shadcn/ui config
├── index.html
│
├── scripts/
│   └── deploy.sh                      # ArDrive deployment script
│
├── src/
│   ├── main.tsx                       # Application entry point
│   ├── App.tsx                        # Root component with routing
│   ├── App.test.tsx
│   ├── index.css                      # Global styles + Tailwind imports
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── error-boundary.tsx
│   │   │
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Header.test.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Sidebar.test.tsx
│   │       ├── Footer.tsx
│   │       └── Footer.test.tsx
│   │
│   ├── features/
│   │   ├── repository/
│   │   │   ├── RepoList.tsx           # Repository discovery page
│   │   │   ├── RepoList.test.tsx
│   │   │   ├── RepoCard.tsx           # Repository card component
│   │   │   ├── RepoCard.test.tsx
│   │   │   ├── RepoDetail.tsx         # Repository detail page
│   │   │   ├── RepoDetail.test.tsx
│   │   │   ├── FileBrowser.tsx        # Directory tree navigation
│   │   │   ├── FileBrowser.test.tsx
│   │   │   ├── FileViewer.tsx         # File content display
│   │   │   ├── FileViewer.test.tsx
│   │   │   ├── CodeViewer.tsx         # Syntax-highlighted code
│   │   │   ├── CodeViewer.test.tsx
│   │   │   ├── CommitHistory.tsx      # Commit list
│   │   │   ├── CommitHistory.test.tsx
│   │   │   ├── BranchList.tsx         # Branch/tag selector
│   │   │   ├── BranchList.test.tsx
│   │   │   └── hooks/
│   │   │       ├── useRepository.ts
│   │   │       ├── useRepository.test.ts
│   │   │       ├── useRepositories.ts
│   │   │       ├── useRepositories.test.ts
│   │   │       ├── useRealtimeRepository.ts
│   │   │       └── useRealtimeRepository.test.ts
│   │   │
│   │   ├── issues/
│   │   │   ├── IssueList.tsx          # Issue listing page
│   │   │   ├── IssueList.test.tsx
│   │   │   ├── IssueCard.tsx          # Issue card component
│   │   │   ├── IssueCard.test.tsx
│   │   │   ├── IssueDetail.tsx        # Issue detail page
│   │   │   ├── IssueDetail.test.tsx
│   │   │   ├── CommentThread.tsx      # Threaded comments (NIP-10)
│   │   │   ├── CommentThread.test.tsx
│   │   │   ├── CommentCard.tsx        # Single comment
│   │   │   ├── CommentCard.test.tsx
│   │   │   ├── IssueFilters.tsx       # Filter by label/status
│   │   │   ├── IssueFilters.test.tsx
│   │   │   └── hooks/
│   │   │       ├── useIssues.ts
│   │   │       ├── useIssues.test.ts
│   │   │       ├── useIssue.ts
│   │   │       ├── useIssue.test.ts
│   │   │       ├── useRealtimeIssues.ts
│   │   │       └── useRealtimeIssues.test.ts
│   │   │
│   │   ├── pulls/
│   │   │   ├── PullRequestList.tsx    # PR listing page
│   │   │   ├── PullRequestList.test.tsx
│   │   │   ├── PullRequestCard.tsx    # PR card component
│   │   │   ├── PullRequestCard.test.tsx
│   │   │   ├── PullRequestDetail.tsx  # PR detail page
│   │   │   ├── PullRequestDetail.test.tsx
│   │   │   ├── DiffViewer.tsx         # Patch diff visualization
│   │   │   ├── DiffViewer.test.tsx
│   │   │   ├── PRDiscussion.tsx       # PR comments/discussion
│   │   │   ├── PRDiscussion.test.tsx
│   │   │   └── hooks/
│   │   │       ├── usePullRequests.ts
│   │   │       ├── usePullRequests.test.ts
│   │   │       ├── usePullRequest.ts
│   │   │       ├── usePullRequest.test.ts
│   │   │       ├── useRealtimePullRequests.ts
│   │   │       └── useRealtimePullRequests.test.ts
│   │   │
│   │   └── patches/
│   │       ├── PatchList.tsx          # Patch series listing
│   │       ├── PatchList.test.tsx
│   │       ├── PatchViewer.tsx        # Inline diff viewer (<60KB)
│   │       ├── PatchViewer.test.tsx
│   │       └── hooks/
│   │           ├── usePatches.ts
│   │           ├── usePatches.test.ts
│   │           ├── useRealtimePatches.ts
│   │           └── useRealtimePatches.test.ts
│   │
│   ├── pages/
│   │   ├── Home.tsx                   # Repository discovery landing
│   │   ├── Home.test.tsx
│   │   ├── NotFound.tsx               # 404 page
│   │   └── NotFound.test.tsx
│   │
│   ├── lib/
│   │   ├── utils.ts                   # shadcn utils (cn helper)
│   │   ├── utils.test.ts
│   │   ├── nostr.ts                   # Nostr service layer (SimplePool, queries)
│   │   ├── nostr.test.ts
│   │   ├── arweave.ts                 # Arweave/ar.io service (Wayfinder, gateways)
│   │   ├── arweave.test.ts
│   │   ├── cache.ts                   # IndexedDB caching (Dexie)
│   │   ├── cache.test.ts
│   │   ├── transformers/
│   │   │   ├── eventToRepository.ts   # NIP-34 kind 30617 → Repository
│   │   │   ├── eventToRepository.test.ts
│   │   │   ├── eventToIssue.ts        # NIP-34 kind 1621 → Issue
│   │   │   ├── eventToIssue.test.ts
│   │   │   ├── eventToPullRequest.ts  # NIP-34 kind 1618 → PullRequest
│   │   │   ├── eventToPullRequest.test.ts
│   │   │   ├── eventToComment.ts      # NIP-34 kind 1622 → Comment
│   │   │   ├── eventToComment.test.ts
│   │   │   ├── eventToPatch.ts        # NIP-34 kind 1617 → Patch
│   │   │   └── eventToPatch.test.ts
│   │   └── query-client.ts            # TanStack Query client config
│   │
│   ├── hooks/
│   │   ├── useNostrPool.ts            # Shared SimplePool instance
│   │   ├── useNostrPool.test.ts
│   │   ├── useCache.ts                # IndexedDB hooks
│   │   └── useCache.test.ts
│   │
│   ├── types/
│   │   ├── index.ts                   # Re-exports all types
│   │   ├── common.ts                  # RigError, LoadingStatus, etc.
│   │   ├── nostr.ts                   # NostrEvent, NIP-34 event types
│   │   ├── repository.ts              # Repository domain model
│   │   ├── issue.ts                   # Issue, Comment domain models
│   │   ├── pull-request.ts            # PullRequest domain model
│   │   ├── patch.ts                   # Patch domain model
│   │   └── arweave.ts                 # ArweaveManifest, Gateway types
│   │
│   ├── constants/
│   │   ├── nostr.ts                   # Event kinds, relay URLs
│   │   ├── arweave.ts                 # Gateway URLs, config
│   │   └── routes.ts                  # Route path constants
│   │
│   ├── contexts/
│   │   ├── NostrContext.tsx           # Nostr connection state provider
│   │   ├── NostrContext.test.tsx
│   │   ├── ThemeContext.tsx           # Light/dark theme provider
│   │   └── ThemeContext.test.tsx
│   │
│   └── test-utils/
│       ├── setup.ts                   # Vitest setup
│       ├── mocks/
│       │   ├── nostrEvents.ts         # Mock NIP-34 events
│       │   ├── repositories.ts        # Mock Repository data
│       │   └── relayPool.ts           # Mock SimplePool
│       └── providers.tsx              # Test wrapper providers
│
├── public/
│   └── assets/
│       ├── logo.svg
│       └── favicon.ico
│
└── vitest.config.ts                   # Vitest configuration (to be added)
```

---

## Architectural Boundaries

**Service Layer Boundaries:**

**Nostr Service (`src/lib/nostr.ts`):**
- **Responsibility**: All Nostr relay communication, event queries, subscriptions
- **Exports**: `fetchRepositories()`, `fetchIssues()`, `fetchPullRequests()`, `subscribeToEvents()`
- **Dependencies**: nostr-tools SimplePool, constants/nostr.ts
- **Boundary**: Returns domain models (Repository, Issue, etc.), NOT raw NostrEvent objects
- **Validation**: Performs signature validation (`verifyEvent()`) and schema validation (Zod)

**Arweave Service (`src/lib/arweave.ts`):**
- **Responsibility**: All Arweave gateway communication, manifest fetching, file retrieval
- **Exports**: `fetchManifest()`, `fetchFile()`, `resolveArNS()`
- **Dependencies**: @ar.io/wayfinder, @ar.io/sdk, constants/arweave.ts
- **Boundary**: Returns typed Arweave data (ArweaveManifest, file contents)
- **Gateway Selection**: Uses Wayfinder SDK for automatic failover

**Cache Service (`src/lib/cache.ts`):**
- **Responsibility**: IndexedDB operations, cache invalidation
- **Exports**: `cacheEvent()`, `getCachedEvents()`, `invalidateCache()`
- **Dependencies**: Dexie
- **Boundary**: Stores domain models, not raw events
- **TTL Management**: Implements hybrid caching strategy (repos: 1hr, issues: 5min)

**Transformer Layer (`src/lib/transformers/`):**
- **Responsibility**: Convert NIP-34 events → domain models
- **Exports**: `eventToRepository()`, `eventToIssue()`, `eventToPullRequest()`, etc.
- **Boundary**: Takes validated NostrEvent, returns typed domain model or null
- **Error Handling**: Returns null for invalid transformations, logs warnings

---

**Component Boundaries:**

**Feature Modules:**
- Each feature (repository, issues, pulls, patches) is self-contained
- Feature components ONLY import from:
  - `@/components/ui` (shadcn components)
  - `@/types` (domain types)
  - Local feature hooks (e.g., `./hooks/useIssues`)
  - `@/lib/utils` (shared utilities)
- Features DO NOT import from other features

**Shared Components (`src/components/`):**
- UI components (`ui/`) are pure presentation, no business logic
- Layout components (`layout/`) handle app shell, navigation
- Both can be imported by any feature

**Hook Boundaries:**
- Data hooks (`useRepositories`, `useIssues`) call service layer functions
- Subscription hooks (`useRealtimeIssues`) manage WebSocket subscriptions
- Hooks encapsulate TanStack Query configuration
- Hooks return typed data + TanStack Query status

---

**Data Flow Boundaries:**

```
User Action
  ↓
Component (features/repository/RepoList.tsx)
  ↓
Hook (hooks/useRepositories.ts)
  ↓
TanStack Query (manages caching, retries)
  ↓
Service Layer (lib/nostr.ts)
  ↓
Validation (verifyEvent + Zod schema)
  ↓
Transformation (lib/transformers/eventToRepository.ts)
  ↓
Domain Model (Repository)
  ↓
Cache (lib/cache.ts → IndexedDB)
  ↓
Component (receives Repository[])
```

Real-time updates flow:
```
Nostr Relay (WebSocket)
  ↓
Subscription Hook (useRealtimeIssues)
  ↓
Query Invalidation (queryClient.invalidateQueries)
  ↓
TanStack Query refetches
  ↓
Service Layer → Validation → Transform
  ↓
Component re-renders with fresh data
```

---

## Requirements to Structure Mapping

**Phase 1 MVP Features → Implementation Locations:**

**F1.1: Repository Discovery & Browsing**
- **Feature**: `src/features/repository/`
- **Components**: `RepoList.tsx`, `RepoCard.tsx`, `RepoDetail.tsx`
- **Hooks**: `hooks/useRepositories.ts`, `hooks/useRepository.ts`, `hooks/useRealtimeRepository.ts`
- **Service**: `lib/nostr.ts` → `fetchRepositories()`
- **Transformer**: `lib/transformers/eventToRepository.ts`
- **Types**: `types/repository.ts` → `Repository` interface
- **Constants**: `constants/nostr.ts` → `REPO_ANNOUNCEMENT = 30617`
- **Routes**: `/` (home), `/:owner/:repo` (detail)

**F1.2: File Browser & Code Viewer**
- **Feature**: `src/features/repository/`
- **Components**: `FileBrowser.tsx`, `FileViewer.tsx`, `CodeViewer.tsx`
- **Service**: `lib/arweave.ts` → `fetchManifest()`, `fetchFile()`
- **Types**: `types/arweave.ts` → `ArweaveManifest`, `FileNode`
- **Routes**: `/:owner/:repo/src/:branch/:path*`

**F1.3: Issue Tracker**
- **Feature**: `src/features/issues/`
- **Components**: `IssueList.tsx`, `IssueCard.tsx`, `IssueDetail.tsx`, `CommentThread.tsx`, `CommentCard.tsx`, `IssueFilters.tsx`
- **Hooks**: `hooks/useIssues.ts`, `hooks/useIssue.ts`, `hooks/useRealtimeIssues.ts`
- **Service**: `lib/nostr.ts` → `fetchIssues()`, `fetchComments()`
- **Transformers**: `lib/transformers/eventToIssue.ts`, `lib/transformers/eventToComment.ts`
- **Types**: `types/issue.ts` → `Issue`, `Comment` interfaces
- **Constants**: `constants/nostr.ts` → `ISSUE = 1621`, `COMMENT = 1622`
- **Routes**: `/:owner/:repo/issues`, `/:owner/:repo/issues/:id`

**F1.4: Pull Request Management**
- **Feature**: `src/features/pulls/`
- **Components**: `PullRequestList.tsx`, `PullRequestCard.tsx`, `PullRequestDetail.tsx`, `DiffViewer.tsx`, `PRDiscussion.tsx`
- **Hooks**: `hooks/usePullRequests.ts`, `hooks/usePullRequest.ts`, `hooks/useRealtimePullRequests.ts`
- **Service**: `lib/nostr.ts` → `fetchPullRequests()`
- **Transformer**: `lib/transformers/eventToPullRequest.ts`
- **Types**: `types/pull-request.ts` → `PullRequest` interface
- **Constants**: `constants/nostr.ts` → `PULL_REQUEST = 1618`
- **Routes**: `/:owner/:repo/pulls`, `/:owner/:repo/pulls/:id`

**F1.5: Patch Viewer**
- **Feature**: `src/features/patches/`
- **Components**: `PatchList.tsx`, `PatchViewer.tsx`
- **Hooks**: `hooks/usePatches.ts`, `hooks/useRealtimePatches.ts`
- **Service**: `lib/nostr.ts` → `fetchPatches()`
- **Transformer**: `lib/transformers/eventToPatch.ts`
- **Types**: `types/patch.ts` → `Patch` interface
- **Constants**: `constants/nostr.ts` → `PATCH = 1617`

---

**Cross-Cutting Concerns:**

**Authentication/Identity (Read-Only):**
- **Not Required**: No user authentication for reading public events
- **Future**: When adding "watch" or "star" features, use NIP-07 browser extension

**Caching:**
- **Service**: `lib/cache.ts`
- **Used By**: All data hooks (useRepositories, useIssues, etc.)
- **Storage**: IndexedDB via Dexie
- **Strategy**: Hybrid TTL (repos: 1hr, issues: 5min, Arweave: permanent)

**Error Handling:**
- **Types**: `types/common.ts` → `RigError` interface
- **Service Layer**: Throws structured errors
- **Components**: `components/ui/error-boundary.tsx`
- **Display**: Toast notifications for transient errors, error pages for fatal errors

**Theming:**
- **Context**: `contexts/ThemeContext.tsx`
- **CSS**: shadcn/ui CSS variables in `src/index.css`
- **Modes**: Light/dark mode toggle

**Real-Time Updates:**
- **Hooks**: `useRealtime*` hooks in each feature
- **Service**: `lib/nostr.ts` → WebSocket subscriptions
- **Pattern**: Page-level subscriptions (mount/unmount)
- **Cache Update**: Invalidate queries on new events

---

## Integration Points

**Internal Communication:**

**Feature → Hook → Service:**
```typescript
// Component uses hook
const { data, status } = useRepositories()

// Hook calls service via TanStack Query
useQuery({ queryFn: fetchRepositories })

// Service queries Nostr relays
await pool.list(relays, [{ kinds: [REPO_ANNOUNCEMENT] }])
```

**Real-Time Subscription Flow:**
```typescript
// Component subscribes
useRealtimeIssues(repoId)

// Hook manages subscription
useEffect(() => {
  const sub = pool.subscribeMany(relays, [...], {
    onevent: () => queryClient.invalidateQueries(['issues', repoId])
  })
  return () => sub.close()
}, [repoId])
```

**External Integrations:**

**Nostr Relay Network:**
- **Libraries**: nostr-tools (SimplePool)
- **Connections**: WebSocket to 3-5 public relays
- **Protocols**: NIP-01 (events), NIP-10 (threading), NIP-34 (git)
- **Configuration**: `constants/nostr.ts` → `DEFAULT_RELAYS`

**Arweave + ar.io:**
- **Libraries**: @ar.io/wayfinder, @ar.io/sdk, @ardrive/turbo-sdk
- **Gateway**: ar.io decentralized gateway network
- **Protocols**: Arweave protocol, ArNS resolution
- **Configuration**: `constants/arweave.ts` → gateway URLs

**Browser APIs:**
- **IndexedDB**: Dexie wrapper for caching
- **WebSocket**: Native for Nostr relay connections
- **Crypto API**: Used by nostr-tools for signature verification

---

## File Organization Patterns

**Configuration Files (Root Level):**
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite bundler config (path aliases, plugins)
- `tsconfig.json` - TypeScript compiler options (strict mode)
- `tailwind.config.js` - Tailwind CSS configuration
- `components.json` - shadcn/ui configuration
- `.env.development` - Development relay/gateway URLs
- `.env.production` - Production relay/gateway URLs
- `.env.example` - Template for environment variables

**Source Code Organization (`src/`):**
- **Entry Point**: `main.tsx` - Renders React app, wraps with providers
- **Root Component**: `App.tsx` - React Router setup, global error boundary
- **Features**: Feature-based folders with components + hooks
- **Services**: `lib/` for business logic and external communication
- **Types**: Centralized `types/` for all TypeScript interfaces
- **Constants**: `constants/` for event kinds, URLs, config values

**Test Organization:**
- Co-located with source: `Component.tsx` → `Component.test.tsx`
- Test utilities: `src/test-utils/` for shared mocks and helpers
- Mock data: `src/test-utils/mocks/` for NIP-34 events, relay pools

**Asset Organization:**
- Static assets: `public/assets/` for images, icons
- Built output: `dist/` (gitignored, created by Vite build)

---

## Development Workflow Integration

**Development Server:**
- **Command**: `npm run dev`
- **Tool**: Vite dev server
- **Port**: 5173 (default)
- **HMR**: Fast refresh preserves React state
- **Environment**: Uses `.env.development` for local relay/gateway

**Build Process:**
- **Command**: `npm run build`
- **Tool**: Vite production build
- **Output**: `dist/` directory
- **Optimizations**: Code splitting, tree shaking, minification, asset optimization
- **Environment**: Uses `.env.production` for production relay/gateway URLs

**Deployment Process:**
- **Script**: `scripts/deploy.sh`
- **Steps**:
  1. Run `npm run build` to create `dist/`
  2. Use ArDrive CLI: `ardrive upload-folder dist/`
  3. Output Arweave transaction ID
- **Platform**: Arweave permanent storage
- **Access**: Via Arweave TXID initially, ArNS post-MVP

**Testing Workflow:**
- **Tool**: Vitest (to be configured in `vitest.config.ts`)
- **Command**: `npm test`
- **Coverage**: `npm run coverage`
- **Pattern**: Co-located tests run automatically

---
