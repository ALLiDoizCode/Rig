---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '/Users/jonathangreen/Documents/Rig/docs/PRD-NIP34-Decentralized-Forgejo.md'
  - '/Users/jonathangreen/Documents/Rig/docs/PRD-CHANGES-SUMMARY.md'
  - '/Users/jonathangreen/Documents/Rig/docs/NIP34-EVENT-REFERENCE.md'
workflowType: 'architecture'
project_name: 'Rig'
user_name: 'Jonathan'
date: '2026-02-23'
architecturalDecision: 'React + shadcn Frontend with Three-Layer Architecture (Nostr + ArNS + Arweave)'
starterTemplate: 'Vite + React-TypeScript + shadcn/ui (Manual Setup)'
lastStep: 8
status: 'complete'
completedAt: '2026-02-23'
---

# Architecture Decision Document: Rig (Decentralized Git Hosting)

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Executive Context

**Project:** Rig - Decentralized, censorship-resistant code collaboration platform
**Decision Focus:** Frontend architecture migration from Vue.js (Forgejo reference) to React + shadcn/ui
**Date:** 2026-02-23
**Architect:** Winston (AI) + Jonathan Green

---

## Current State Analysis

### Forgejo Reference Implementation
- **Framework:** Vue 3.5.28
- **UI Library:** Fomantic UI (Semantic UI fork)
- **Build Tool:** Webpack 5
- **Styling:** Tailwind CSS 3.4.18
- **Components:** ~24 Vue components
- **Code Editor:** CodeMirror 6
- **Purpose:** Feature reference only - NOT being forked/modified

### Target Architecture (from PRD)
- **Frontend:** Static HTML/JS using nostr-tools
- **Purpose:** Pure P2P read-only client
- **Deployment:** Static hosting (Netlify, GitHub Pages, IPFS)
- **Backend:** Crosstown/Connector (ILP payment gateway for writes only)
- **Key Principle:** Reads are free and P2P via Nostr relays

---

## Architecture Decision: React + shadcn Migration

### New Decision (Today)
**Decision:** Rebuild Forgejo frontend using React + TypeScript + shadcn/ui, using Forgejo Vue components as reference material for understanding features and UX patterns.

**Rationale:**
1. **React Ecosystem Maturity** - Larger component ecosystem, better TypeScript support
2. **shadcn/ui Advantages** - Modern, accessible, composable components built on Radix UI + Tailwind
3. **Developer Experience** - Vite (faster than Webpack), better DX tooling
4. **Team Preference** - React is the target framework
5. **Keep What Works** - Tailwind CSS already used in Forgejo, shadcn uses Tailwind

---

## Project Context Analysis

### Requirements Overview

**Scope:** Read-only frontend that replicates Forgejo UI experience using decentralized data sources (Nostr + Arweave).

**Functional Requirements - Frontend (Read-Only):**

**Phase 1 MVP - Core Features:**
1. **Repository Discovery & Browsing** (Nostr kind 30617)
   - Search and filter repositories by name, tags, author
   - Display repository metadata (name, description, topics, owner)
   - Real-time updates via WebSocket subscriptions
   - Client-side caching in IndexedDB

2. **File Browser & Code Viewer** (Arweave via ar.io)
   - Navigate directory tree from Arweave manifest
   - View file contents with syntax highlighting
   - Display README.md (markdown rendering)
   - Commit history from git objects on Arweave
   - Branch and tag listing

3. **Issue Tracker** (Nostr kinds 1621, 1622, 1630-1633)
   - List issues with filtering by labels, status
   - View issue details with threaded comments (NIP-10)
   - Display status indicators (open/closed/resolved)
   - Real-time comment updates

4. **Pull Request Management** (Nostr kinds 1618, 1622, 1631-1632)
   - List PRs with metadata (title, description, author)
   - View PR discussions with threaded comments
   - Display status (open/merged/closed/draft)
   - PR diff viewing (from Arweave)

5. **Patch Viewer** (Nostr kind 1617)
   - Display patch series with inline diffs (<60KB)
   - Syntax highlighting for diff content
   - Link patches to repositories

**Out of Scope for Frontend:**
- Creating repositories, issues, PRs, comments (write operations)
- ILP payment integration (handled by Crosstown/Connector)
- Publishing events to Nostr relays (backend responsibility)

---

### Three-Layer Data Architecture

**Layer 1: Identity & Metadata (Nostr)**
- Repository announcements (kind 30617)
- Issues (1621), Pull Requests (1618), Patches (1617)
- Comments (1622) with NIP-10 threading
- Status events (1630-1633)
- References to Arweave TXIDs
- Real-time updates via WebSocket

**Layer 2: Naming (ArNS - Arweave Name System)**
- Permanent, user-friendly URLs: `user.ar/repo`
- Primary names for wallet addresses
- Undernames for repository versioning: `user.ar/repo@v1.0`
- Points to Arweave transaction IDs
- Censorship-resistant naming

**Layer 3: Storage (Arweave)**
- Git objects (blobs, trees, commits)
- Source code files
- Binary assets
- Repository manifests
- Permanent, immutable storage
- Accessed via ar.io gateways

---

### Non-Functional Requirements

**Performance:**
- Nostr relay connection: <2 seconds
- Initial repository discovery: <3 seconds for 100 repos
- File fetch from Arweave: <2 seconds (first load), <100ms (cached)
- Real-time event updates: <10 seconds P99
- Page load time: <3 seconds P95
- Support 10,000 concurrent viewers (static hosting)

**Security:**
- Client-side event signature verification (Nostr schnorr/secp256k1)
- Arweave data integrity verification via Wayfinder SDK
- No authentication required for reading
- Browser-based cryptographic operations
- Content Security Policy for XSS prevention

**Scalability:**
- Infinitely scalable frontend (static files on CDN)
- Multi-relay coordination (3-5+ Nostr relays)
- Multiple ar.io gateway support for redundancy
- Client-side caching reduces relay/gateway load
- Progressive enhancement (works offline with cached data)

**Availability:**
- Frontend: 99.99% (static hosting SLA)
- No single point of failure for reads
- Graceful degradation on relay failures
- Automatic failover between relays and gateways
- IndexedDB persistence for offline access

---

### Technical Constraints & Dependencies

**Critical Dependencies:**

1. **Nostr Ecosystem:**
   - At least 3-5 public relays support NIP-01 filtering
   - NIP-34 standard remains stable (no breaking changes)
   - nostr-tools library maintained and compatible
   - Browser WebSocket support required

2. **Arweave + ar.io Ecosystem:**
   - ar.io gateways operational for data access
   - Arweave network availability (99.99% SLA)
   - Turbo SDK for uploads (development tool)
   - Wayfinder SDK for decentralized retrieval
   - ArNS system for naming resolution

3. **Browser Capabilities:**
   - Modern browsers (Chrome, Firefox, Safari, Edge)
   - WebSocket support for Nostr relay connections
   - IndexedDB for caching (1GB+ storage)
   - JavaScript performance for event parsing
   - Crypto API for signature verification

**Deployment Constraints:**
- Must be deployable to static hosting (Netlify, Vercel, GitHub Pages, IPFS)
- No server-side rendering or API endpoints
- All business logic client-side
- Build output must be optimized (<5MB initial bundle)

---

### Scale & Complexity Assessment

**Project Complexity: MEDIUM-HIGH**

**Complexity Indicators:**

✅ **Decentralized Architecture:**
- No centralized database or API
- Pure P2P coordination across multiple relays
- Multi-gateway Arweave access with failover
- Event-based state management

✅ **Real-Time Features:**
- WebSocket subscriptions to 3-5+ Nostr relays
- Live updates for issues, PRs, comments
- Reconnection logic and subscription management
- Event deduplication across relays

✅ **Cryptographic Operations:**
- Nostr event signature verification (secp256k1)
- Arweave data integrity checks
- Client-side crypto in browser

✅ **Data Integration:**
- Combine data from two sources (Nostr + Arweave)
- Parse NIP-34 event structures
- Transform events to UI-friendly models
- Resolve ArNS names to Arweave TXIDs

✅ **UI Complexity:**
- 24+ components to migrate from Vue to React
- Syntax highlighting for 50+ languages
- Diff visualization for patches and PRs
- Markdown rendering
- Threaded comment displays (NIP-10)
- Virtual scrolling for large lists

**Estimated Architectural Components:**
- 8-10 core services (Nostr, Arweave, ArNS, caching, etc.)
- 30+ React components (shadcn + custom)
- 15+ data models/types
- 5+ custom hooks for data fetching
- 3+ context providers for state management

**Primary Technical Domain:** Decentralized web frontend (P2P, crypto, WebSocket, permanent storage)

---

### Cross-Cutting Concerns

**1. Relay Connection Management:**
- Multi-relay health monitoring
- Automatic failover on disconnect
- Subscription recovery after reconnection
- Load balancing across relays
- Rate limiting per relay

**2. Event Verification:**
- Signature validation for all Nostr events
- Arweave data integrity checks via Wayfinder
- Malformed event handling
- Spam/malicious event filtering

**3. Caching Strategy:**
- IndexedDB for Nostr events (by kind, author, tags)
- Arweave manifest and file caching
- Cache invalidation policies
- Stale-while-revalidate pattern
- Offline-first approach

**4. Real-Time Updates:**
- WebSocket subscription management
- Optimistic UI updates
- Event ordering and deduplication
- Backpressure handling for high-volume events

**5. Performance Optimization:**
- Virtual scrolling for long lists
- Code splitting and lazy loading
- Query batching to reduce relay requests
- Debouncing search inputs
- Image optimization for avatars

**6. Error Handling:**
- Relay timeout handling
- Malformed event recovery
- Arweave gateway failures
- Network disconnection
- User-friendly error messages

**7. Progressive Enhancement:**
- Core functionality works without JavaScript (SEO)
- Offline support with service workers
- Cached data when relays unavailable
- Graceful degradation

---

### ArNS Integration Benefits

**User-Friendly Permanent URLs:**
```
Traditional: github.com/torvalds/linux
Rig:        torvalds.ar/linux
```

**Features:**
- Permanent identity via ArNS primary names
- Repository versioning via undernames (`repo@v1.0`)
- User owns namespace (ARIO token-based)
- Censorship-resistant naming
- Resolves to Arweave TXIDs

**Frontend Integration:**
```typescript
// URL: torvalds.ar/linux
// 1. Extract ArNS name: "torvalds.ar/linux"
// 2. Resolve via ar.io SDK → Arweave TXID
// 3. Fetch manifest from Arweave
// 4. Query Nostr for metadata (issues, PRs)
// 5. Display combined view
```

---

### Data Flow Architecture

**Repository Page Load:**
```
User visits: user.ar/repo
  ↓
1. Parse URL → extract ArNS name
  ↓
2. ar.io SDK: resolve ArNS → Arweave TXID
  ↓
3. Wayfinder SDK: fetch manifest from Arweave
  ↓
4. nostr-tools: query for repository metadata (kind 30617)
  ↓
5. Combine: manifest (files) + metadata (issues, PRs)
  ↓
6. Render React UI with shadcn components
```

**Real-Time Updates:**
```
User viewing issue list
  ↓
WebSocket subscription active (kind 1621)
  ↓
New issue event arrives from relay
  ↓
Verify signature + parse event
  ↓
Update UI optimistically
  ↓
Cache in IndexedDB
```

**Offline Access:**
```
User offline
  ↓
Check IndexedDB cache
  ↓
Serve cached events + manifests
  ↓
Display "Offline mode" indicator
  ↓
Queue updates for when online
```

---

### Success Criteria

**MVP Delivery:**
- ✅ Full Forgejo-like UI in React + shadcn
- ✅ Repository browsing via Nostr + Arweave
- ✅ File viewer with syntax highlighting
- ✅ Issue tracker with real-time updates
- ✅ PR management with discussions
- ✅ Patch viewer with diffs
- ✅ ArNS-based permanent URLs
- ✅ Works on static hosting (no backend)
- ✅ Offline support with cached data

**Performance Targets:**
- <2s relay connection time
- <3s initial page load
- <100ms cached file access
- Support 10,000+ concurrent users

**Quality Metrics:**
- 95%+ event signature verification success
- 99.9% data availability (multi-relay + multi-gateway)
- <1% malformed event rate
- Zero backend API calls for reads

---

## Starter Template Evaluation

### Primary Technology Domain

**Decentralized Web Frontend** - Static React application with P2P data layer (Nostr + Arweave)

**Requirements:**
- React 18+ with TypeScript for type safety
- shadcn/ui (Radix UI + Tailwind CSS) for accessible components
- Vite for fast build tooling and HMR
- Static deployment capability (CDN, IPFS)
- Clean integration points for nostr-tools + ar.io SDKs

---

### Starter Options Considered

#### **Option 1: Official Vite + Manual shadcn/ui Setup** ⭐ **SELECTED**

**Approach:** Start with official Vite React-TypeScript template, then add shadcn/ui manually

**Pros:**
- Official, well-maintained foundation (Vite v7, React 19)
- Clean, minimal setup - no unnecessary dependencies
- Full control over configuration
- Easy to integrate custom SDKs (nostr-tools, ar.io)
- Official shadcn/ui documentation for Vite integration
- Latest tooling (Vite 7, React 19, Tailwind 4)

**Cons:**
- Requires manual setup steps (though well-documented)
- Need to configure linting/formatting separately

---

#### **Option 2: vite-react-ts-shadcn-ui Boilerplate**

Pre-configured template with React 19, TypeScript, Shadcn/ui, TailwindCSS 4, Vite 7, SWC, ESLint 9, Husky

**Pros:** Everything pre-configured, faster initial setup
**Cons:** May include unnecessary dependencies, less flexibility for Rig's specific needs

---

#### **Option 3: shadcn-create CLI Tool**

Official scaffolding from shadcn/ui team

**Pros:** Automated setup, official tooling
**Cons:** Newer tool, may include features we don't need

---

### Selected Starter: Vite + React-TypeScript + shadcn/ui (Manual Setup)

**Rationale for Selection:**

1. **Clean Foundation:** Official Vite template provides minimal, well-tested base
2. **Custom Integration:** Easier to add nostr-tools, ar.io SDKs, TanStack Query without conflicts
3. **Learning & Control:** Team understands every piece of the stack
4. **Maintainability:** Following official docs = easier long-term maintenance
5. **Latest Versions:** Vite 7, React 19, Tailwind 4, shadcn/ui latest
6. **No Bloat:** Only includes what we need for decentralized architecture

---

### Initialization Commands

**Step 1: Create Vite Project**
```bash
npm create vite@latest rig-frontend -- --template react-ts
cd rig-frontend
npm install
```

**Step 2: Add Tailwind CSS**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 3: Configure TypeScript Paths**

Edit `tsconfig.json` and `tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Step 4: Configure Vite for Path Aliases**

Edit `vite.config.ts`:
```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

**Step 5: Initialize shadcn/ui**
```bash
npx shadcn@latest init
```

Configuration selections:
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Tailwind config: tailwind.config.js
- Components location: @/components
- Utils location: @/lib/utils
- React Server Components: No
- Write tsconfig paths: Yes

**Step 6: Install Core SDKs**
```bash
# Nostr integration
npm install nostr-tools

# Arweave/ar.io integration
npm install @ardrive/turbo-sdk @ar.io/wayfinder @ar.io/sdk

# Data fetching & state
npm install @tanstack/react-query

# Routing
npm install react-router-dom

# Markdown rendering
npm install react-markdown remark-gfm

# Syntax highlighting
npm install react-syntax-highlighter @types/react-syntax-highlighter

# IndexedDB wrapper (for caching)
npm install dexie
```

---

### Architectural Decisions Provided by Starter

#### **Language & Runtime**
- **TypeScript:** Strict mode enabled for type safety
- **React 19:** Latest with concurrent features and improved performance
- **ECMAScript Target:** ES2020 for modern browser support
- **Module System:** ESM (ES Modules) native support

#### **Styling Solution**
- **Tailwind CSS 4:** Utility-first CSS with JIT compilation
- **shadcn/ui:** Accessible component library (Radix UI primitives + Tailwind)
- **CSS Variables:** Theme system for light/dark mode (built-in)
- **Design Tokens:** Consistent spacing, colors, typography via Tailwind config

#### **Build Tooling**
- **Vite 7:** Ultra-fast HMR (~200ms updates), optimized production builds
- **esbuild:** Dependency pre-bundling for faster dev server startup
- **Rollup:** Production bundling with tree-shaking and code splitting
- **Automatic Code Splitting:** Via dynamic imports and React.lazy()
- **Asset Optimization:** Image optimization, CSS minification, JS compression

#### **Testing Framework** (To be added)
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event happy-dom
```

Vitest recommended for:
- Vite-native testing (fast, no config needed)
- Compatible with Jest API
- Component testing with React Testing Library
- Built-in coverage reports

#### **Code Organization**

```
rig-frontend/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn components (Button, Card, etc.)
│   │   ├── repo/
│   │   │   ├── RepoList.tsx   # Repository listing
│   │   │   ├── RepoCard.tsx   # Repository card
│   │   │   └── FileBrowser.tsx # File tree navigation
│   │   ├── issue/
│   │   │   ├── IssueList.tsx  # Issue listing
│   │   │   ├── IssueDetail.tsx # Issue detail view
│   │   │   └── CommentThread.tsx # Threaded comments
│   │   ├── pr/
│   │   │   ├── PullRequestList.tsx
│   │   │   ├── PullRequestDetail.tsx
│   │   │   └── DiffViewer.tsx  # Diff visualization
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── utils.ts           # shadcn utilities
│   │   ├── nostr.ts           # Nostr service layer
│   │   ├── arweave.ts         # Arweave/ar.io service layer
│   │   └── cache.ts           # IndexedDB caching logic
│   ├── hooks/
│   │   ├── useNostr.ts        # Nostr relay hooks
│   │   ├── useArweave.ts      # Arweave data hooks
│   │   ├── useRepository.ts   # Repository data hook
│   │   └── useCache.ts        # Caching hooks
│   ├── types/
│   │   ├── nostr.ts           # NIP-34 event types
│   │   ├── repo.ts            # Repository types
│   │   └── arweave.ts         # Arweave types
│   ├── pages/
│   │   ├── Home.tsx           # Repository discovery
│   │   ├── RepoDetail.tsx     # Repository detail page
│   │   ├── IssueList.tsx      # Issue tracker page
│   │   └── NotFound.tsx       # 404 page
│   ├── contexts/
│   │   ├── NostrContext.tsx   # Nostr connection state
│   │   └── ThemeContext.tsx   # Theme provider (light/dark)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── assets/
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── package.json
```

#### **Development Experience Features**

- **Hot Module Replacement (HMR):** Instant updates without full reload (~200ms)
- **TypeScript:** Full IntelliSense, type checking, auto-completion
- **Fast Refresh:** Preserves React component state during edits
- **Path Aliases:** Clean imports using `@/` prefix instead of `../../`
- **Optimized Dev Server:** Starts in <2 seconds, minimal configuration
- **Error Overlay:** Clear error messages directly in browser
- **TypeScript Errors:** Inline type errors during development

---

### What This Starter Provides

✅ **Modern React Stack:**
- React 19 with concurrent features
- TypeScript strict mode
- Vite 7 build tooling

✅ **Beautiful, Accessible UI:**
- shadcn/ui components (40+ components)
- Radix UI primitives (WCAG 2.1 Level AA)
- Dark mode built-in via CSS variables
- Responsive by default

✅ **Clean Architecture:**
- Clear separation of concerns (components, services, hooks)
- Type-safe throughout
- Easy to test and maintain

✅ **P2P Integration Ready:**
- No conflicting dependencies
- Easy to add nostr-tools
- Easy to add ar.io SDKs
- TanStack Query for async state

✅ **Fast Development:**
- HMR in ~200ms
- Path aliases for clean imports
- TypeScript autocomplete
- Vite dev server starts <2s

✅ **Production Ready:**
- Static build output
- Optimized bundles (<200KB gzipped for initial load)
- Code splitting automatic
- Asset optimization built-in

✅ **Offline Capable:**
- IndexedDB for caching
- Service worker ready
- Progressive web app (PWA) compatible

---

### Implementation Notes

**First Story:** Project initialization using these commands should be the very first implementation story. This establishes the foundation before any feature development.

**Component Migration Strategy:**
1. Start with shadcn/ui base components (Button, Card, Input, etc.)
2. Build custom Rig components on top (RepoCard, IssueList, etc.)
3. Reference Forgejo Vue components for UX patterns
4. Implement same layouts in React + shadcn

**Integration Order:**
1. Setup base project (Vite + React + shadcn)
2. Add nostr-tools and implement basic relay connection
3. Add ar.io SDKs and test Arweave data fetch
4. Build first page (Repository Discovery)
5. Add routing and navigation
6. Implement remaining pages

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Nostr relay connection strategy (static pool)
- Arweave gateway access (ar.io network with Wayfinder)
- NIP-34 event validation (Zod schemas)
- Component organization (feature-based)
- Routing structure (Forgejo-compatible)
- Event signature validation (always validate)

**Important Decisions (Shape Architecture):**
- Caching policies (hybrid: repos 1hr, issues 5min)
- TanStack Query configuration (balanced)
- Error handling strategy (graceful degradation)
- Subscription management (page-level)
- Connection pooling (single shared pool)

**Deferred Decisions (Post-MVP):**
- ArNS naming (cost consideration)
- GitHub Actions CI/CD (manual deployment for MVP)
- Sentry error monitoring (console logging for MVP)

---

### Data Architecture

**Nostr Relay Strategy:**
- **Decision**: Static relay pool with 3-5 hardcoded reliable relays
- **Implementation**: Hardcode relay URLs (relay.damus.io, nos.lol, relay.nostr.band)
- **Rationale**: Immediate reliability without configuration UI complexity
- **Version**: nostr-tools latest (verified via npm)

**Arweave Gateway Strategy:**
- **Decision**: ar.io Gateway Network with Wayfinder SDK
- **Implementation**: Use @ar.io/wayfinder for automatic gateway selection and failover
- **Rationale**: Decentralized gateway infrastructure with built-in resilience, aligns with ar.io ecosystem
- **Affects**: File browser, code viewer, commit history features

**NIP-34 Event Validation:**
- **Decision**: Schema validation with Zod for all 9 NIP-34 event kinds
- **Implementation**: Define TypeScript/Zod schemas for kinds 30617, 1621, 1618, 1617, 1622, 1630-1633
- **Rationale**: Runtime type safety for untrusted P2P data, prevents malformed events from breaking UI
- **Version**: Zod ^3.23 (current stable)

**Caching Policies:**
- **Decision**: Hybrid strategy with differentiated TTLs
- **Implementation**:
  - Repository metadata (kind 30617): 1 hour TTL
  - Issues/PRs/Comments (1621, 1618, 1622): 5 minutes TTL
  - Arweave content: Permanent cache (immutable)
- **Storage**: IndexedDB via Dexie
- **Rationale**: Balances performance (repos change rarely) with freshness (active discussions)

---

### Authentication & Security

**Event Signature Validation:**
- **Decision**: Always validate Nostr event signatures
- **Implementation**: Use `verifyEvent()` from nostr-tools on all received events
- **Rationale**: Prevents spoofed/tampered events from untrusted relays, ensures cryptographic authenticity
- **Performance**: Small overhead per event, acceptable for security

**Security Posture:**
- Read-only application (no user authentication required)
- Public Nostr events (no authorization needed)
- Cryptographic validation at data layer (signature verification)

---

### API & Communication Patterns

**Error Handling Strategy:**
- **Decision**: Graceful degradation with user feedback
- **Implementation**:
  - Toast notifications for relay failures
  - Display partial results if some relays succeed
  - Error boundaries to prevent UI crashes
  - Automatic retries via TanStack Query
  - User-friendly error messages
- **Rationale**: P2P networks are inherently flaky, users should see progress and partial data

**Real-Time Subscription Management:**
- **Decision**: Page-level subscriptions (mount/unmount lifecycle)
- **Implementation**: Subscribe to Nostr events when page mounts, unsubscribe on unmount
- **Rationale**: Efficient, no background connections, simpler state management for MVP
- **Deferred**: Global subscription manager for "watch" functionality (post-MVP)

**Relay Connection Pooling:**
- **Decision**: Single shared SimplePool instance
- **Implementation**: One `SimplePool` from nostr-tools for entire application
- **Rationale**: Efficient connection reuse, handles reconnects, standard nostr-tools pattern
- **Lifecycle**: Created at app initialization, reused across all features

---

### Frontend Architecture

**Component Organization:**
- **Decision**: Feature-based organization
- **Structure**:
```
src/
├── features/
│   ├── repository/
│   │   ├── RepoList.tsx
│   │   ├── RepoDetail.tsx
│   │   ├── FileBrowser.tsx
│   │   └── hooks/useRepository.ts
│   ├── issues/
│   │   ├── IssueList.tsx
│   │   ├── IssueDetail.tsx
│   │   └── hooks/useIssues.ts
│   └── pulls/
│       ├── PRList.tsx
│       ├── PRDetail.tsx
│       └── hooks/usePulls.ts
```
- **Rationale**: Groups by domain feature, collocates related code, easy mapping to Forgejo Vue.js codebase

**State Management:**
- **Decision**: TanStack Query with balanced configuration
- **Configuration**:
  - `staleTime`: Varies by query (repos: 1hr, issues: 5min)
  - `cacheTime`: 1 hour
  - `refetchOnWindowFocus`: true
  - `retry`: 3 with exponential backoff
- **Version**: @tanstack/react-query ^5.59
- **Rationale**: Aligns with hybrid caching strategy, automatic cache invalidation

**Routing Strategy:**
- **Decision**: Forgejo-compatible route structure
- **Routes**:
```
/                          → Explore/Home
/:owner/:repo              → Repository view
/:owner/:repo/issues       → Issue list
/:owner/:repo/issues/:id   → Issue detail
/:owner/:repo/pulls        → PR list
/:owner/:repo/pulls/:id    → PR detail
/:owner/:repo/src/:branch  → File browser
/:owner/:repo/commits      → Commit history
```
- **Implementation**: React Router DOM v6
- **Rationale**: Matches Forgejo URL patterns, familiar to users, clean mapping (owner=npub, repo=d-tag)

**Performance Optimization:**
- **Decision**: Route-based code splitting
- **Implementation**: Lazy load route components with React.lazy()
- **Example**:
```typescript
const RepoView = lazy(() => import('./features/repository/RepoView'))
const IssueList = lazy(() => import('./features/issues/IssueList'))
```
- **Rationale**: Users only download code for pages they visit, simple implementation, good performance gains

---

### Infrastructure & Deployment

**Deployment Platform:**
- **Decision**: Arweave (static hosting)
- **ArNS**: Deferred to post-MVP (cost consideration)
- **Rationale**: Aligns with decentralized architecture, permanent storage for frontend itself
- **Access**: Via Arweave transaction ID initially, ArNS naming later

**CI/CD Pipeline:**
- **Decision**: Manual deployment script for MVP
- **Implementation**:
```bash
# scripts/deploy.sh
npm run build
ardrive upload-folder dist/
```
- **Migration Path**: GitHub Actions + ArDrive CLI post-MVP
- **Rationale**: Simple setup during iteration phase, migrate to automation when deploying regularly

**Environment Configuration:**
- **Decision**: .env files with Vite
- **Structure**:
```bash
# .env.development
VITE_NOSTR_RELAYS=wss://localhost:7777
VITE_ARWEAVE_GATEWAY=http://localhost:1984

# .env.production
VITE_NOSTR_RELAYS=wss://relay.damus.io,wss://nos.lol,wss://relay.nostr.band
VITE_ARWEAVE_GATEWAY=https://arweave.net
```
- **Rationale**: Standard Vite pattern, type-safe, different configs for dev/prod

**Monitoring & Logging:**
- **Decision**: Simple console logging for MVP
- **Implementation**: console.log/error/warn for development and production
- **Migration Path**: Add Sentry post-MVP if error tracking becomes critical
- **Rationale**: No backend to aggregate logs, browser DevTools sufficient for MVP

---

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (Vite + React + TypeScript + shadcn/ui)
2. Environment configuration (.env files for relay/gateway URLs)
3. Nostr service layer (SimplePool, signature validation)
4. Arweave service layer (Wayfinder SDK integration)
5. Zod schemas for NIP-34 events (validation layer)
6. TanStack Query configuration (cache policies)
7. IndexedDB caching (Dexie setup)
8. Feature-based components (repositories, issues, pulls)
9. Routing (React Router with Forgejo-compatible URLs)
10. Error handling (boundaries, toasts, graceful degradation)
11. Route-based code splitting (lazy loading)
12. Deployment script (ArDrive CLI)

**Cross-Component Dependencies:**
- Nostr service layer → All features (repositories, issues, pulls)
- Arweave service layer → File browser, code viewer
- Zod schemas → Data fetching hooks
- TanStack Query → All data-dependent components
- Error boundaries → Page-level components
- SimplePool → All Nostr queries
- Environment config → Service layer initialization

---

## Implementation Patterns & Consistency Rules

_These patterns ensure all AI agents write consistent, compatible code that works together seamlessly._

### Pattern Categories Defined

**Critical Conflict Points Identified:** 11 areas where AI agents could make different choices without these patterns.

---

### Naming Patterns

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

### Structure Patterns

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

### Format Patterns

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

### Communication Patterns

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

### Process Patterns

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

### Enforcement Guidelines

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

### Pattern Verification

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

## Project Structure & Boundaries

_Complete project organization with architectural boundaries and requirements mapping._

### Complete Project Directory Structure

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

### Architectural Boundaries

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

### Requirements to Structure Mapping

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

### Integration Points

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

### File Organization Patterns

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

### Development Workflow Integration

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

## Architecture Validation Results

_Comprehensive validation confirming architectural coherence, completeness, and implementation readiness._

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are fully compatible. React 19, TypeScript, Vite 7, shadcn/ui, nostr-tools, @ar.io SDKs, TanStack Query, Dexie, and Zod work together without conflicts. All versions are current stable releases with active maintenance.

**Pattern Consistency:**
Implementation patterns perfectly align with architectural decisions. Naming conventions match React + TypeScript best practices, test organization is supported by Vite/Vitest, service layer transformations match the three-layer architecture, and all patterns are mutually supportive.

**Structure Alignment:**
Project structure fully supports all architectural decisions. Feature-based organization enables clear boundaries, centralized types provide single source of truth, service layer consolidates external integrations, and co-located tests simplify maintenance.

---

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
All 5 Phase 1 MVP features from PRD are fully architecturally supported:
- F1.1 Repository Discovery & Browsing: `features/repository/`, `lib/nostr.ts` (NIP-34 kind 30617)
- F1.2 File Browser & Code Viewer: `features/repository/FileBrowser`, `lib/arweave.ts` (Wayfinder SDK)
- F1.3 Issue Tracker: `features/issues/` (NIP-34 kinds 1621, 1622)
- F1.4 Pull Request Management: `features/pulls/` (NIP-34 kind 1618)
- F1.5 Patch Viewer: `features/patches/` (NIP-34 kind 1617)

**Functional Requirements Coverage:**
Every functional requirement has explicit architectural support with specific components, services, hooks, and routes mapped.

**Non-Functional Requirements Coverage:**
- **Performance**: Hybrid caching strategy (repos 1hr, issues 5min), route-based code splitting, IndexedDB offline access
- **Security**: Event signature validation (`verifyEvent()`), Zod schema validation, layered error handling
- **Scalability**: Static Arweave hosting, multi-relay coordination (3-5 relays), client-side caching
- **Availability**: Multi-relay failover, ar.io gateway network (Wayfinder SDK), graceful degradation

---

### Implementation Readiness Validation ✅

**Decision Completeness:**
All 11 critical architectural decisions documented with versions, rationale, and trade-offs:
- Data Architecture (4 decisions): Relay strategy, gateway strategy, validation, caching
- Frontend Architecture (4 decisions): Component organization, state management, routing, performance
- API & Communication (3 decisions): Error handling, subscriptions, connection pooling
- Authentication & Security (1 decision): Signature validation
- Infrastructure & Deployment (3 decisions): Platform, CI/CD, environment config, monitoring

**Structure Completeness:**
Complete project tree with 100+ files/directories explicitly defined. All features mapped to specific locations (features/repository/, features/issues/, features/pulls/, features/patches/). All integration points clearly specified (service layer, hooks, components). All boundaries well-defined (Nostr service, Arweave service, transformers, types).

**Pattern Completeness:**
All 11 potential conflict points addressed with comprehensive patterns:
- Naming (code, constants)
- Structure (tests, types)
- Format (transformations, errors, loading states)
- Communication (subscriptions, cache updates)
- Process (error handling, validation timing)
Includes good examples and anti-patterns for clarity.

---

### Gap Analysis Results

**Critical Gaps:** NONE
- All architectural decisions made
- All implementation patterns defined
- All requirements covered
- No blocking issues identified

**Important Gaps:** ADDRESSED
- Deployment platform corrected: Arweave (not Netlify/Vercel)
- ArNS deferred to post-MVP (cost consideration)
- CI/CD: Manual deployment for MVP, GitHub Actions automation post-MVP

**Nice-to-Have (Implementation Phase):**
- Vitest configuration (created during Story 1: Project Initialization)
- ESLint + Prettier configuration (standard React setup)
- Storybook for component development (post-MVP enhancement)

---

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed (PRD, NIP-34, Forgejo reference)
- [x] Scale and complexity assessed (MEDIUM-HIGH, decentralized P2P)
- [x] Technical constraints identified (Nostr relays, Arweave network, browser capabilities)
- [x] Cross-cutting concerns mapped (caching, error handling, real-time updates, theming)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions (11 decisions across 5 categories)
- [x] Technology stack fully specified (React 19, Vite 7, shadcn/ui, nostr-tools, @ar.io SDKs)
- [x] Integration patterns defined (service layer transformations, hook boundaries, TanStack Query)
- [x] Performance considerations addressed (hybrid caching, code splitting, multi-relay)

**✅ Implementation Patterns**
- [x] Naming conventions established (PascalCase components, camelCase utilities, SCREAMING_SNAKE_CASE constants)
- [x] Structure patterns defined (feature-based organization, co-located tests, centralized types)
- [x] Communication patterns specified (separate hooks for subscriptions vs queries, invalidate + refetch)
- [x] Process patterns documented (layered error handling, early validation at service layer)

**✅ Project Structure**
- [x] Complete directory structure defined (100+ files/directories with specific purposes)
- [x] Component boundaries established (service, hook, component layers with clear responsibilities)
- [x] Integration points mapped (Nostr relays, ar.io gateways, IndexedDB, browser APIs)
- [x] Requirements to structure mapping complete (all 5 MVP features mapped to specific locations)

---

### Architecture Readiness Assessment

**Overall Status:** ✅ **READY FOR IMPLEMENTATION**

**Confidence Level:** **HIGH**
- All decisions made with clear rationale
- All patterns comprehensive and consistent
- All requirements fully covered
- No critical gaps or blocking issues
- Structure is complete and specific

**Key Strengths:**
1. **Coherent Three-Layer Architecture** - Clean separation between Nostr (metadata), ArNS (naming), Arweave (storage)
2. **Comprehensive Pattern Library** - 11 conflict points addressed with good/bad examples
3. **Complete Requirements Coverage** - All 5 MVP features architecturally supported
4. **Implementation-Ready Structure** - Specific file/directory layout with 100+ defined locations
5. **Technology Stack Validation** - All dependencies compatible and actively maintained

**Areas for Future Enhancement (Post-MVP):**
- Add Storybook for component development and design system documentation
- Migrate to GitHub Actions for automated CI/CD deployment
- Add ArNS naming for user-friendly permanent URLs
- Implement Sentry for production error tracking
- Add "watch" functionality with global subscription manager

---

### Implementation Handoff

**AI Agent Guidelines:**
1. **Follow Architectural Decisions Exactly** - All 11 decisions documented with versions and rationale
2. **Use Implementation Patterns Consistently** - Refer to naming, structure, format, communication, and process patterns
3. **Respect Project Structure** - All files/directories defined, maintain boundaries
4. **Validate Early** - Signature + schema validation at service layer before data enters system
5. **Transform at Service Layer** - Components work with domain models, not raw events
6. **Handle Errors in Layers** - Service throws RigError, hooks propagate, components display
7. **Refer to Architecture Document** - Single source of truth for all architectural questions

**First Implementation Priority:**
Story 1 - Project Initialization using starter template commands:
```bash
npm create vite@latest rig-frontend -- --template react-ts
cd rig-frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
npm install nostr-tools @ardrive/turbo-sdk @ar.io/wayfinder @ar.io/sdk
npm install @tanstack/react-query react-router-dom
npm install react-markdown remark-gfm react-syntax-highlighter dexie
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

