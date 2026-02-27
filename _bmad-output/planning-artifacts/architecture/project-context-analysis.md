# Project Context Analysis

## Requirements Overview

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

## Three-Layer Data Architecture

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

## Non-Functional Requirements

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

## Technical Constraints & Dependencies

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

## Scale & Complexity Assessment

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

## Cross-Cutting Concerns

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

## ArNS Integration Benefits

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

## Data Flow Architecture

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

## Success Criteria

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
