# Core Architectural Decisions

## Decision Priority Analysis

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

## Data Architecture

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

## Authentication & Security

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

## API & Communication Patterns

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

## Frontend Architecture

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

## Infrastructure & Deployment

**Deployment Platform:**
- **Decision**: Arweave (static hosting)
- **ArNS**: Deferred to post-MVP (cost consideration)
- **Rationale**: Aligns with decentralized architecture, permanent storage for frontend itself
- **Access**: Via Arweave transaction ID initially, ArNS naming later

**CI/CD Pipeline:**
- **Decision**: Manual deployment script for MVP
- **Implementation**:
```bash