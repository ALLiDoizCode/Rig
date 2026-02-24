---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
validationStatus: 'PASSED'
validationDate: '2026-02-24'
inputDocuments:
  - '/Users/jonathangreen/Documents/Rig/_bmad-output/planning-artifacts/prd.md'
  - '/Users/jonathangreen/Documents/Rig/_bmad-output/planning-artifacts/architecture.md'
  - '/Users/jonathangreen/Documents/Rig/_bmad-output/planning-artifacts/ux-design-specification.md'
---

# Rig - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Rig, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Repository Discovery & Browsing (FR1-FR5)**
- **FR1**: Users can browse a list of repositories announced via Nostr kind 30617 events
- **FR2**: Users can view repository metadata including name, description, maintainers, and ArNS URL
- **FR3**: Users can filter repositories by name using client-side search
- **FR4**: Users can navigate to a repository detail view to explore its contents
- **FR5**: Users can view which Nostr relays are currently providing repository data

**Commit & Change History (FR6-FR10)**
- **FR6**: Users can view a chronological list of commits for a repository
- **FR7**: Users can view commit details including author, message, timestamp, and Nostr event ID
- **FR8**: Users can view the diff (changes) for each commit with syntax highlighting
- **FR9**: Users can navigate between related commits (parent/child relationships)
- **FR10**: Users can view commit metadata including Arweave transaction IDs for storage verification

**File Exploration (FR11-FR15)**
- **FR11**: Users can navigate a repository's file tree structure
- **FR12**: Users can view file contents with syntax highlighting for code files
- **FR13**: Users can navigate between different file versions across commits
- **FR14**: Users can view file metadata including size and last modified timestamp
- **FR15**: Users can access "View on Arweave" links to verify permanent storage

**Issue & Pull Request Management (FR16-FR22)**
- **FR16**: Users can browse a list of issues for a repository
- **FR17**: Users can view issue details including title, description, status, and comments
- **FR18**: Users can view issue comment threads with proper threading (NIP-10 references)
- **FR19**: Users can browse a list of pull requests for a repository
- **FR20**: Users can view pull request details including title, description, status, and discussion
- **FR21**: Users can view pull request discussion threads with proper threading
- **FR22**: Users can see issue and PR status indicators (open, closed, merged)

**Decentralization & Verification (FR23-FR29)**
- **FR23**: Users can view which Nostr relays successfully responded to queries
- **FR24**: Users can verify Nostr event signatures for data authenticity
- **FR25**: Users can view Arweave transaction IDs for all stored content
- **FR26**: Users can verify Arweave transaction hashes for data integrity
- **FR27**: Users can see ArNS name resolution details (ArNS → Arweave TX mapping)
- **FR28**: Users can view relay connection health status (connected/disconnected)
- **FR29**: Users can export permanent citation-ready URLs (ArNS + Arweave TX)

**User Education & Transparency (FR30-FR34)**
- **FR30**: Users can access educational content explaining Nostr, Arweave, and ILP concepts
- **FR31**: Users can view visual indicators showing decentralization status (relay count, Arweave confirmation)
- **FR32**: Users can see explanations of why data is permanent and censorship-resistant
- **FR33**: Users can access technical documentation about NIP-34 event structures
- **FR34**: Users can view information about how the frontend is hosted on Arweave

**Performance & Offline Access (FR35-FR39)**
- **FR35**: Users can view cached repository data when offline (service worker support)
- **FR36**: Users can see visual indicators of data freshness (e.g., "Last updated 30s ago from 4/5 relays")
- **FR37**: Users can access previously viewed content without re-querying relays
- **FR38**: Users can see loading states during data fetching from decentralized sources
- **FR39**: Users can continue browsing if some relays fail (graceful degradation)

**Accessibility & Responsive Design (FR40-FR44)**
- **FR40**: Users can navigate all interactive elements using keyboard only
- **FR41**: Users can access all functionality via screen readers with proper semantic HTML and ARIA labels
- **FR42**: Users can browse repositories on mobile devices with touch-optimized interfaces
- **FR43**: Users can adjust browser zoom to 200% without breaking the layout
- **FR44**: Users can distinguish information by means other than color alone (e.g., diff symbols, not just colors)

**Developer & Ecosystem Integration (FR45-FR48)**
- **FR45**: Developers can inspect NIP-34 event structures in the browser DevTools
- **FR46**: Developers can view source code architecture and implementation patterns (GitHub repository)
- **FR47**: Developers can understand relay query logic and Arweave retrieval patterns for reuse
- **FR48**: Users can share ArNS URLs that permanently resolve to specific repositories

### Non-Functional Requirements

**Performance - Page Load (NFR-P1 to NFR-P5)**
- **NFR-P1**: Repository pages load with Largest Contentful Paint (LCP) <2.5s on standard broadband connections
- **NFR-P2**: User interactions (clicks, navigation) have First Input Delay (FID) <100ms
- **NFR-P3**: Layout shift during content loading (CLS) <0.1
- **NFR-P4**: Time to Interactive (TTI) <3.5s for initial page load
- **NFR-P5**: P95 page load time <3s when querying Nostr relays and retrieving from Arweave

**Performance - Multi-Relay Queries (NFR-P6 to NFR-P8)**
- **NFR-P6**: Relay queries complete within 3s for ≥90% of requests (at least 1 relay must respond)
- **NFR-P7**: System races queries across 5+ relays in parallel, using first successful response
- **NFR-P8**: Failed relay queries time out within 2s to avoid blocking user experience

**Performance - Arweave Retrieval (NFR-P9 to NFR-P10)**
- **NFR-P9**: Arweave gateway requests complete within 3s for ≥95% of file retrievals
- **NFR-P10**: System automatically retries failed gateway requests with alternate gateways within 1s timeout per gateway

**Performance - Bundle Size (NFR-P11 to NFR-P14)**
- **NFR-P11**: Initial JavaScript bundle size <500KB gzipped
- **NFR-P12**: Total bundle size stays under ArDrive subsidy threshold for free Arweave hosting
- **NFR-P13**: Code-split vendor libraries (React, nostr-tools, Arweave SDK) loaded separately
- **NFR-P14**: Route-based code splitting defers non-critical page loads

**Performance - Caching (NFR-P15 to NFR-P17)**
- **NFR-P15**: Service worker caches static assets for offline access
- **NFR-P16**: Previously viewed content accessible offline via IndexedDB cache
- **NFR-P17**: Stale-while-revalidate strategy shows cached data immediately, updates in background

**Security - Cryptographic Verification (NFR-S1 to NFR-S3)**
- **NFR-S1**: All Nostr event signatures verified using secp256k1 cryptographic verification before display
- **NFR-S2**: Arweave transaction hashes verified to ensure data integrity
- **NFR-S3**: Invalid signatures rejected with clear error messaging

**Security - Content Security (NFR-S4 to NFR-S6)**
- **NFR-S4**: Content Security Policy (CSP) implemented to prevent XSS attacks from untrusted relay data
- **NFR-S5**: All user-generated content from Nostr events sanitized before rendering in DOM
- **NFR-S6**: No execution of untrusted scripts from external sources

**Security - Network Security (NFR-S7 to NFR-S9)**
- **NFR-S7**: System assumes hostile network environment (untrusted relays, gateways)
- **NFR-S8**: No sensitive user data stored or transmitted (read-only MVP, no authentication)
- **NFR-S9**: All external connections use HTTPS/WSS secure protocols

**Security - Data Integrity (NFR-S10 to NFR-S12)**
- **NFR-S10**: Multi-relay data consistency checks (compare data from multiple relays)
- **NFR-S11**: Arweave transaction ID verification links displayed for user validation
- **NFR-S12**: Permanent audit trail via Arweave storage (immutable data)

**Accessibility - WCAG 2.1 Level AA (NFR-A1 to NFR-A4)**
- **NFR-A1**: All functionality accessible via keyboard navigation (no mouse required)
- **NFR-A2**: Logical tab order follows visual layout
- **NFR-A3**: Visible focus indicators on all interactive elements (2px solid border minimum)
- **NFR-A4**: Skip links provided for screen readers ("Skip to main content")

**Accessibility - Screen Reader (NFR-A5 to NFR-A8)**
- **NFR-A5**: Semantic HTML structure with proper heading hierarchy (h1 → h2 → h3)
- **NFR-A6**: ARIA labels for all icon-only buttons and interactive elements
- **NFR-A7**: Live regions announce dynamic content updates (e.g., "Repository loaded from 4 relays")
- **NFR-A8**: Descriptive alt text for all images and visual elements

**Accessibility - Visual (NFR-A9 to NFR-A12)**
- **NFR-A9**: Color contrast ratios ≥4.5:1 for normal text, ≥3:1 for large text
- **NFR-A10**: Information not conveyed by color alone (diff markers use +/- symbols, not just green/red)
- **NFR-A11**: Minimum 16px body text size with relative units (rem/em) for scalability
- **NFR-A12**: Layout functional at 200% browser zoom without horizontal scrolling

**Accessibility - Touch & Mobile (NFR-A13 to NFR-A15)**
- **NFR-A13**: Minimum touch target size 44x44px for all interactive elements
- **NFR-A14**: Mobile-responsive design from 320px viewport width
- **NFR-A15**: Form inputs have associated labels (visible or aria-label)

**Accessibility - Testing (NFR-A16 to NFR-A18)**
- **NFR-A16**: Lighthouse accessibility audit score ≥90 in CI/CD pipeline
- **NFR-A17**: Manual keyboard-only navigation testing for core user journeys
- **NFR-A18**: Screen reader testing with VoiceOver (Safari), NVDA (Firefox), JAWS (Chrome)

**Reliability - Frontend Uptime (NFR-R1 to NFR-R2)**
- **NFR-R1**: Frontend hosted on Arweave achieves 99%+ availability (limited only by Arweave/ArNS network health)
- **NFR-R2**: Static hosting eliminates server-side failure points

**Reliability - Graceful Degradation (NFR-R3 to NFR-R6)**
- **NFR-R3**: System functions with minimum 1/5 relays responding successfully
- **NFR-R4**: System continues operating if 2/3 Arweave gateways fail (automatic failover)
- **NFR-R5**: Offline mode displays cached content when no network connectivity
- **NFR-R6**: Clear error messaging when relays/gateways unavailable

**Reliability - Fault Tolerance (NFR-R7 to NFR-R9)**
- **NFR-R7**: Individual relay failures do not block user workflows
- **NFR-R8**: Gateway failures automatically trigger fallback to alternate gateways
- **NFR-R9**: Network errors display user-friendly messages with retry options

**Reliability - Data Freshness (NFR-R10 to NFR-R12)**
- **NFR-R10**: Visual indicators show data age ("Last updated 30s ago from 4/5 relays")
- **NFR-R11**: Cache expiration policy: 1 hour TTL for Nostr events, persistent for Arweave data
- **NFR-R12**: Manual refresh option available when cached data is stale

**Integration - Nostr Protocol (NFR-I1 to NFR-I4)**
- **NFR-I1**: Full NIP-01 (Basic Protocol) compliance for relay communication
- **NFR-I2**: Full NIP-10 (Threading) compliance for comment/discussion threading
- **NFR-I3**: Full NIP-34 (Git Stuff) compliance for repository event structures
- **NFR-I4**: Event filters conform to Nostr relay specifications

**Integration - Relay (NFR-I5 to NFR-I8)**
- **NFR-I5**: Configurable relay list (minimum 5 relays recommended)
- **NFR-I6**: WebSocket connections to relays with automatic reconnection on disconnect
- **NFR-I7**: Relay health monitoring (latency, uptime, event coverage)
- **NFR-I8**: Support for both public and private relay URLs

**Integration - Arweave Gateway (NFR-I9 to NFR-I12)**
- **NFR-I9**: Integration with ar.io gateway network for Arweave data retrieval
- **NFR-I10**: Multi-gateway fallback strategy (try 3+ gateways per request)
- **NFR-I11**: Support for custom gateway URLs (user-configurable)
- **NFR-I12**: Gateway health monitoring and automatic routing adjustments

**Integration - ArNS (NFR-I13 to NFR-I15)**
- **NFR-I13**: ArNS name resolution to Arweave transaction IDs <2s
- **NFR-I14**: ArNS SDK integration for permanent naming
- **NFR-I15**: Display both ArNS names and underlying Arweave TX IDs for verification

**Integration - Browser (NFR-I16 to NFR-I21)**
- **NFR-I16**: Full support for Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- **NFR-I17**: ES2020+ JavaScript feature support (optional chaining, nullish coalescing)
- **NFR-I18**: Web Crypto API for cryptographic verification
- **NFR-I19**: IndexedDB for offline caching
- **NFR-I20**: WebSocket support for relay connections
- **NFR-I21**: Service Worker support for PWA capabilities

**Scalability - Frontend (NFR-SC1 to NFR-SC2)**
- **NFR-SC1**: Static frontend scales infinitely via Arweave decentralized hosting
- **NFR-SC2**: No backend infrastructure limits (all data from decentralized sources)

**Scalability - Dependency (NFR-SC3 to NFR-SC5)**
- **NFR-SC3**: System performance gracefully degrades with increased relay load (automatic load distribution)
- **NFR-SC4**: Gateway selection algorithm distributes load across available ar.io gateways
- **NFR-SC5**: System remains functional if relay/gateway availability drops to 60% of configured sources

**Scalability - User Growth (NFR-SC6 to NFR-SC7)**
- **NFR-SC6**: Frontend handles 10x user growth without code changes (static asset delivery)
- **NFR-SC7**: No per-user server costs (all users query public infrastructure)

### Additional Requirements

#### From Architecture Document

**Starter Template & Technology Stack**
- Starter Template: Vite + React-TypeScript + shadcn/ui (Manual Setup)
- Framework: React 19 with TypeScript strict mode
- Build Tool: Vite 7 for fast development and optimized production builds
- UI Library: shadcn/ui (Radix UI primitives + Tailwind CSS 4)
- State Management: TanStack Query v5 for async state, React Context for global state
- Routing: React Router DOM v6 with Forgejo-compatible URL patterns

**Project Initialization Commands**
```bash
npm create vite@latest rig-frontend -- --template react-ts
cd rig-frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
npm install nostr-tools @ardrive/turbo-sdk @ar.io/wayfinder @ar.io/sdk
npm install @tanstack/react-query react-router-dom
npm install react-markdown remark-gfm react-syntax-highlighter dexie zod
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Three-Layer Decentralized Architecture**
- **Layer 1 - Nostr**: NIP-34 events for metadata, issues, PRs, patches (kinds 30617, 1617, 1618, 1621, 1622, 1630-1633)
- **Layer 2 - ArNS**: Permanent, human-friendly repository naming (e.g., user.ar/repo)
- **Layer 3 - Arweave**: Immutable storage for git objects and source code files

**Core Architectural Decisions**
- **Nostr Relay Strategy**: Static relay pool with 3-5 hardcoded reliable relays (relay.damus.io, nos.lol, relay.nostr.band)
- **Arweave Gateway Strategy**: ar.io Gateway Network with Wayfinder SDK for automatic failover
- **Event Validation**: Schema validation with Zod for all NIP-34 event kinds + signature verification
- **Caching Strategy**: Hybrid TTL (Repository metadata: 1 hour, Issues/PRs/Comments: 5 minutes, Arweave content: Permanent)
- **Component Organization**: Feature-based (features/repository/, features/issues/, features/pulls/, features/patches/)
- **Error Handling**: Layered approach (Service throws RigError → Hook propagates via TanStack Query → Component displays)
- **Real-Time Subscriptions**: Page-level subscriptions (mount/unmount lifecycle), separate hooks for subscriptions vs. queries
- **Deployment**: Arweave static hosting via ArDrive, accessible via ArNS

**Implementation Patterns**
- Naming: PascalCase for components/types, camelCase for hooks/utilities, SCREAMING_SNAKE_CASE for constants
- Testing: Co-located tests with .test suffix (Component.tsx → Component.test.tsx)
- Types: Centralized in src/types/ with domain-specific files (nostr.ts, repository.ts, arweave.ts, etc.)
- Transformations: Service layer transforms NIP-34 events → domain models (eventToRepository, eventToIssue, etc.)
- Loading States: Use TanStack Query status field ('pending' | 'error' | 'success')
- Event Validation Timing: Signature validation first (verifyEvent()), schema validation second (Zod parse()), at service layer

#### From UX Design Document

**Six Target User Personas**
1. **Alex - Open Source Maintainer**: Fears deplatforming, needs censorship-resistant hosting with permanence guarantees
2. **Jordan - Contributor**: Frustrated by VPN workarounds for blocked GitHub, needs fast reliable access from any location
3. **Sam - Archivist/Researcher**: Crisis of link rot, needs permanent citation-ready URLs for academic references
4. **Casey - Web3 Developer**: Building decentralized apps but hosting code centrally, needs tech stack alignment
5. **Anonymous Visitor - Curious Newcomer**: Skeptical of decentralization claims, needs zero-friction browsing without crypto knowledge
6. **Taylor - Ecosystem Builder**: Researching if Crosstown pattern works for non-git apps, needs well-documented architecture

**Key Design Challenges**
1. **Trust Through Transparency**: Show decentralization working (relay connections, Arweave TXs, event signatures) without overwhelming users
2. **Performance Perception**: Multi-relay + Arweave inherently slower (<3s vs. <1s GitHub) - make delays feel intentional, not broken
3. **Progressive Complexity**: Serve crypto-natives and complete newcomers with same interface via progressive disclosure
4. **Graceful Degradation**: "4 out of 5 relays responded" vs. "Error" - never block user workflows on infrastructure failures
5. **Mobile-Responsive Code Browsing**: Desktop-first experience must work on 320px+ mobile for on-the-go access

**Experience Principles**
1. **Transparency Over Abstraction**: Show decentralized infrastructure working, don't hide it
2. **Progressive Disclosure**: Simple surface for browsing, deep verification available on demand
3. **Familiarity First, Innovation Second**: Match GitHub UX exactly, then add decentralized superpowers
4. **Performance Delays Must Tell a Story**: "Querying 5 Nostr relays..." not generic "Loading..."
5. **Offline Capability = Competitive Advantage**: Treat offline mode as celebrated feature (works when relays down)
6. **Errors Are Learning Opportunities**: Educate users about decentralized resilience when failures occur

**Critical Success Moments**
- **First 3 Seconds**: "This Actually Works" - Homepage loads fast, no account wall, polished design
- **First 10 Seconds**: "I See It's Decentralized" - Visible relay connections, verification badges, Arweave indicators
- **First 30 Seconds**: "I Can Browse Code" - GitHub-like file browsing with syntax highlighting
- **First 1 Minute**: "This Can't Be Taken Down" - User verifies Arweave permanence and relay consensus
- **First 5 Minutes**: "I Want to Share This" - User copies ArNS link, screenshots verification badges
- **First Hour**: "I Understand the Vision" - User reads architecture docs, explores Crosstown pattern

**Effortless Interactions**
- Zero authentication for browsing (no login wall, no crypto wallet requirement)
- Automatic multi-relay failover (race queries, display from first responders)
- Progressive loading with meaningful status (explain what's happening in infrastructure)
- GitHub-familiar navigation (same keyboard shortcuts, URL patterns, layouts)
- One-click permanent citations (BibTeX, APA, MLA formats with ArNS + Arweave TX)
- Inline verification without disruption (collapsed badges, expandable cryptographic details)
- Graceful degradation with transparency ("Loaded from 2 relays, 3 unavailable" with retry options)

### FR Coverage Map

**Repository Discovery & Browsing:**
- FR1 → Epic 2: Browse repositories announced via Nostr kind 30617 events
- FR2 → Epic 2: View repository metadata (name, description, maintainers, ArNS URL)
- FR3 → Epic 2: Filter repositories by name using client-side search
- FR4 → Epic 2: Navigate to repository detail view
- FR5 → Epic 2: View which Nostr relays are providing repository data

**Commit & Change History:**
- FR6 → Epic 4: View chronological commit list for a repository
- FR7 → Epic 4: View commit details (author, message, timestamp, Nostr event ID)
- FR8 → Epic 4: View commit diffs with syntax highlighting
- FR9 → Epic 4: Navigate between related commits (parent/child relationships)
- FR10 → Epic 4: View commit metadata including Arweave transaction IDs

**File Exploration:**
- FR11 → Epic 3: Navigate repository file tree structure
- FR12 → Epic 3: View file contents with syntax highlighting
- FR13 → Epic 3: Navigate between different file versions across commits
- FR14 → Epic 3: View file metadata (size, last modified timestamp)
- FR15 → Epic 3: Access "View on Arweave" links to verify permanent storage

**Issue & Pull Request Management:**
- FR16 → Epic 5: Browse list of issues for a repository
- FR17 → Epic 5: View issue details (title, description, status, comments)
- FR18 → Epic 5: View issue comment threads with NIP-10 threading
- FR19 → Epic 5: Browse list of pull requests for a repository
- FR20 → Epic 5: View pull request details (title, description, status, discussion)
- FR21 → Epic 5: View pull request discussion threads with threading
- FR22 → Epic 5: See issue and PR status indicators (open, closed, merged)

**Decentralization & Verification:**
- FR23 → Epic 6: View which Nostr relays successfully responded to queries
- FR24 → Epic 6: Verify Nostr event signatures for data authenticity
- FR25 → Epic 6: View Arweave transaction IDs for all stored content
- FR26 → Epic 6: Verify Arweave transaction hashes for data integrity
- FR27 → Epic 6: See ArNS name resolution details (ArNS → Arweave TX mapping)
- FR28 → Epic 6: View relay connection health status (connected/disconnected)
- FR29 → Epic 6: Export permanent citation-ready URLs (ArNS + Arweave TX)

**User Education & Transparency:**
- FR30 → Epic 7: Access educational content explaining Nostr, Arweave, and ILP concepts
- FR31 → Epic 7: View visual indicators showing decentralization status
- FR32 → Epic 7: See explanations of data permanence and censorship resistance
- FR33 → Epic 7: Access technical documentation about NIP-34 event structures
- FR34 → Epic 7: View information about Arweave-hosted frontend

**Performance & Offline Access:**
- FR35 → Epic 8: View cached repository data when offline (service worker support)
- FR36 → Epic 8: See visual indicators of data freshness
- FR37 → Epic 8: Access previously viewed content without re-querying relays
- FR38 → Epic 8: See loading states during data fetching from decentralized sources
- FR39 → Epic 8: Continue browsing if some relays fail (graceful degradation)

**Accessibility & Responsive Design:**
- FR40 → Epic 9: Navigate all interactive elements using keyboard only
- FR41 → Epic 9: Access all functionality via screen readers with semantic HTML/ARIA
- FR42 → Epic 9: Browse repositories on mobile devices with touch-optimized interfaces
- FR43 → Epic 9: Adjust browser zoom to 200% without breaking layout
- FR44 → Epic 9: Distinguish information by means other than color alone

**Developer & Ecosystem Integration:**
- FR45 → Epic 10: Inspect NIP-34 event structures in browser DevTools
- FR46 → Epic 10: View source code architecture and implementation patterns
- FR47 → Epic 10: Understand relay query logic and Arweave retrieval patterns for reuse
- FR48 → Epic 10: Share ArNS URLs that permanently resolve to specific repositories

**Coverage Summary:**
- Total FRs: 48
- Total Epics: 10
- Coverage: 100% (all FRs mapped to epics)

## Epic List

### Epic 1: Project Foundation & Infrastructure

**Goal:** Development team can build the Rig application with all foundational infrastructure in place.

**User Outcome:** Complete development environment with React frontend, Nostr relay connections, Arweave integration, caching layer, and core architectural patterns ready for feature development.

**What This Epic Delivers:**
- Project initialized with Vite + React + TypeScript + shadcn/ui starter template
- Nostr relay connection service using nostr-tools SimplePool
- Arweave/ar.io gateway integration using Wayfinder SDK
- IndexedDB caching layer with Dexie (hybrid TTL: repos 1hr, issues 5min)
- TanStack Query configuration for async state management
- React Router setup with Forgejo-compatible URL patterns
- Core layout components (Header, Sidebar, Footer)
- Service layer architecture (Nostr service, Arweave service, cache service)
- Type definitions for NIP-34 events and domain models
- Zod schemas for event validation
- Development environment configuration (.env files)

**FRs Covered:** None directly (infrastructure epic)

**NFRs Addressed:**
- NFR-I1 to NFR-I21: Integration requirements (Nostr, Arweave, browser support)
- NFR-P11 to NFR-P14: Bundle size and code splitting
- NFR-SC1, NFR-SC2: Scalability foundations

**Implementation Notes:**
- **Story 1.1 MUST be**: Project initialization using Architecture doc commands
- Establishes three-layer architecture: Nostr (metadata) + ArNS (naming) + Arweave (storage)
- Sets up implementation patterns: naming conventions, service layer transformations, error handling
- Critical dependency: All other epics depend on this foundation

**Technical Decisions from Architecture:**
- Static relay pool: relay.damus.io, nos.lol, relay.nostr.band (3-5 relays)
- ar.io Gateway Network with automatic failover
- Event signature validation using verifyEvent() from nostr-tools
- Feature-based component organization (features/repository/, features/issues/, etc.)
- Co-located tests with .test suffix

---

### Epic 2: Repository Discovery & Exploration

**Goal:** Users can discover repositories from Nostr relays and view repository metadata.

**User Outcome:** Users can browse a list of repositories announced via NIP-34 events, search/filter by name, view repository details, and see which decentralized relays are providing the data.

**What This Epic Delivers:**
- Repository list page querying Nostr kind 30617 events
- Repository card components showing metadata (name, description, maintainers)
- Client-side search/filter functionality
- Repository detail page with metadata display
- ArNS URL display for permanent repository links
- Relay status indicators showing which relays responded
- Real-time repository updates via WebSocket subscriptions

**FRs Covered:** FR1, FR2, FR3, FR4, FR5

**NFRs Addressed:**
- NFR-P1 to NFR-P8: Page load performance, relay query performance
- NFR-R3, NFR-R7: Graceful degradation with relay failures
- NFR-S1: Event signature verification

**User Personas Served:**
- **Anonymous Visitor**: "This actually works" - first impression of browsing repositories
- **Alex (OSS Maintainer)**: Discovery of decentralized repos
- **Casey (Web3 Dev)**: Ecosystem exploration

**Implementation Notes:**
- Uses: Epic 1 infrastructure (Nostr service, caching, routing)
- Components: RepoList.tsx, RepoCard.tsx, RepoDetail.tsx
- Hooks: useRepositories.ts, useRepository.ts, useRealtimeRepository.ts
- Service: lib/nostr.ts → fetchRepositories()
- Transformer: lib/transformers/eventToRepository.ts
- Routes: / (home), /:owner/:repo (detail)

**Standalone Value:** Complete repository browsing functionality independent of other features

---

### Epic 3: Code Browsing & File Navigation

**Goal:** Users can navigate repository file trees and view code with syntax highlighting.

**User Outcome:** Users can explore file structures retrieved from Arweave, view file contents with syntax highlighting for 20+ languages, navigate between file versions, and verify permanent storage via Arweave transaction links.

**What This Epic Delivers:**
- File tree navigation component with collapsible directories
- File viewer with syntax highlighting (react-syntax-highlighter)
- File version navigation across commits
- File metadata display (size, last modified timestamp)
- "View on Arweave" links for permanent storage verification
- Markdown rendering for README files
- Mobile-responsive file browsing (collapsible tree on mobile)

**FRs Covered:** FR11, FR12, FR13, FR14, FR15

**NFRs Addressed:**
- NFR-P9, NFR-P10: Arweave gateway retrieval performance
- NFR-P16: Offline access to cached file content
- NFR-A14: Mobile-responsive design from 320px

**User Personas Served:**
- **Jordan (Contributor)**: Code review and patch exploration
- **Anonymous Visitor**: Simple code exploration
- **Taylor (Ecosystem Builder)**: Pattern study for derivative applications

**Implementation Notes:**
- Uses: Epic 1 (Arweave service), Epic 2 (repository context)
- Components: FileBrowser.tsx, FileViewer.tsx, CodeViewer.tsx
- Service: lib/arweave.ts → fetchManifest(), fetchFile()
- Routes: /:owner/:repo/src/:branch/:path*
- Dependencies: react-syntax-highlighter, react-markdown, remark-gfm

**Standalone Value:** Complete file browsing functionality that builds on repository discovery

---

### Epic 4: Commit History & Code Changes

**Goal:** Users can explore commit history and review code changes with diffs.

**User Outcome:** Users can view a chronological list of commits, see commit details with author/message/timestamp, view syntax-highlighted diffs, navigate commit relationships, and verify commits via Arweave transaction IDs.

**What This Epic Delivers:**
- Commit history list page for repositories
- Commit detail page with metadata (author, message, timestamp, Nostr event ID)
- Diff viewer component with syntax highlighting
- Parent/child commit navigation
- Arweave transaction ID display for commit verification
- Commit search and filtering
- Mobile-responsive diff viewing (stacked layout on mobile)

**FRs Covered:** FR6, FR7, FR8, FR9, FR10

**NFRs Addressed:**
- NFR-P5: P95 page load <3s for commit data
- NFR-S2: Arweave transaction hash verification
- NFR-R10: Visual indicators of data age

**User Personas Served:**
- **Jordan (Contributor)**: Patch review and change tracking
- **Alex (OSS Maintainer)**: History verification and change auditing
- **Sam (Archivist/Researcher)**: Archival timestamps and commit permanence

**Implementation Notes:**
- Uses: Epic 1 (Nostr service), Epic 2 (repository context), Epic 3 (file context)
- Components: CommitHistory.tsx, CommitDetail.tsx, DiffViewer.tsx
- Hooks: useCommits.ts, useCommit.ts
- Service: lib/nostr.ts → fetchCommits()
- Transformer: lib/transformers/eventToCommit.ts
- Routes: /:owner/:repo/commits, /:owner/:repo/commit/:hash

**Standalone Value:** Complete commit browsing functionality that enhances repository exploration

---

### Epic 5: Issue & Pull Request Tracking

**Goal:** Users can browse issues and pull requests with threaded discussions.

**User Outcome:** Users can view issue lists with filtering, read issue details with threaded comments (NIP-10), browse pull requests, view PR discussions, and see status indicators (open/closed/merged).

**What This Epic Delivers:**
- Issue list page with filtering by label/status
- Issue detail page with threaded comments
- Pull request list page
- Pull request detail page with discussion threads
- Comment threading using NIP-10 references
- Status indicators and badges (open, closed, merged)
- Real-time updates for new issues/comments/PRs
- Mobile-responsive issue/PR browsing

**FRs Covered:** FR16, FR17, FR18, FR19, FR20, FR21, FR22

**NFRs Addressed:**
- NFR-I2: NIP-10 threading compliance for comments
- NFR-R11: Cache expiration policy (5min TTL for issues/PRs)
- NFR-P7: Multi-relay query racing

**User Personas Served:**
- **Jordan (Contributor)**: Collaboration tracking and discussion participation
- **Alex (OSS Maintainer)**: Project management and issue tracking
- **Casey (Web3 Dev)**: Ecosystem participation and contribution tracking

**Implementation Notes:**
- Uses: Epic 1 (Nostr service), Epic 2 (repository context)
- Components: IssueList.tsx, IssueDetail.tsx, CommentThread.tsx, PullRequestList.tsx, PullRequestDetail.tsx, DiffViewer.tsx
- Hooks: useIssues.ts, useIssue.ts, useRealtimeIssues.ts, usePullRequests.ts, usePullRequest.ts
- Service: lib/nostr.ts → fetchIssues(), fetchPullRequests(), fetchComments()
- Transformers: lib/transformers/eventToIssue.ts, eventToPullRequest.ts, eventToComment.ts
- Routes: /:owner/:repo/issues, /:owner/:repo/issues/:id, /:owner/:repo/pulls, /:owner/:repo/pulls/:id
- NIP-34 kinds: 1621 (issues), 1618 (pull requests), 1622 (comments), 1630-1633 (status events)

**Standalone Value:** Complete issue/PR tracking that builds on repository browsing

---

### Epic 6: Decentralization Transparency & Verification

**Goal:** Users can verify decentralization claims through cryptographic proofs and relay status.

**User Outcome:** Users can see which relays responded to queries, verify Nostr event signatures, view Arweave transaction IDs, check ArNS name resolution, monitor relay health, and export permanent citation-ready URLs.

**What This Epic Delivers:**
- Relay status panel showing connected/disconnected relays with latencies
- Event signature verification modal with cryptographic details
- Arweave transaction detail modal with permanence guarantees
- ArNS resolution inspector showing ArNS → Arweave TX mapping
- Relay health monitoring dashboard
- Citation generator with multiple formats (APA, MLA, BibTeX, plain URL)
- "Verify Permanence" buttons throughout the UI
- Verification badges on all content (✓ Verified on X relays)

**FRs Covered:** FR23, FR24, FR25, FR26, FR27, FR28, FR29

**NFRs Addressed:**
- NFR-S1: Nostr event signature verification using secp256k1
- NFR-S2: Arweave transaction hash verification
- NFR-S10: Multi-relay data consistency checks
- NFR-I13: ArNS name resolution <2s

**User Personas Served:**
- **Alex (OSS Maintainer)**: "No one can take this down" - cryptographic proof
- **Sam (Archivist/Researcher)**: Citation needs and permanent URL verification
- **Taylor (Ecosystem Builder)**: Cryptographic verification and pattern study

**Implementation Notes:**
- Enhances: All previous epics with verification overlays
- Components: RelayStatusPanel.tsx, SignatureVerification.tsx, ArweaveTransactionDetail.tsx, ArNSResolution.tsx, CitationGenerator.tsx
- Hooks: useRelayStatus.ts, useEventVerification.ts
- Utils: lib/crypto.ts (signature verification), lib/citations.ts (citation formatting)
- Progressive disclosure pattern: Collapsed badges → Expandable panels

**Standalone Value:** Verification features that enhance trust across all browsing features

---

### Epic 7: User Education & Trust Building

**Goal:** Users understand why decentralization matters through integrated educational content.

**User Outcome:** Users can access explanations of Nostr/Arweave/ILP concepts, see visual indicators of decentralization status, understand permanence guarantees, read technical documentation, and learn about the Arweave-hosted frontend.

**What This Epic Delivers:**
- Educational tooltips and "Learn More" modals throughout UI
- Visual indicators showing decentralization in action
- Permanence and censorship resistance explainers
- NIP-34 technical documentation pages
- Arweave hosting information and guarantees
- Progressive disclosure educational content
- Contextual help system
- Onboarding tour for first-time users

**FRs Covered:** FR30, FR31, FR32, FR33, FR34

**NFRs Addressed:**
- NFR-R10: Visual indicators of data age and relay status
- NFR-A7: Live regions announcing dynamic content updates

**User Personas Served:**
- **Anonymous Visitor**: Learning journey from skepticism to understanding
- **Sam (Archivist/Researcher)**: Understanding permanence guarantees
- **Casey (Web3 Dev)**: Ecosystem education and architecture understanding

**Implementation Notes:**
- Enhances: All previous epics with educational overlays
- Components: Tooltip.tsx, LearnMoreModal.tsx, OnboardingTour.tsx, TechnicalDocs.tsx
- Content: Markdown files with educational content (docs/education/)
- Design principle: "Performance delays tell a story" - loading states become educational

**Standalone Value:** Educational layer that builds trust and understanding across all features

---

### Epic 8: Performance & Offline Capability

**Goal:** Users can access repositories offline and experience fast, resilient performance.

**User Outcome:** Users can browse cached repositories when offline, see data freshness indicators, access previously viewed content without network, view meaningful loading states, and continue browsing despite relay failures.

**What This Epic Delivers:**
- Service worker implementation for offline caching
- IndexedDB persistence for repositories, files, issues, PRs
- Data freshness indicators ("Last updated 30s ago from 4/5 relays")
- Offline mode badge and functionality
- Progressive loading states with relay status
- Graceful degradation when relays fail
- Stale-while-revalidate caching strategy
- Cache management and clearing utilities

**FRs Covered:** FR35, FR36, FR37, FR38, FR39

**NFRs Addressed:**
- NFR-P15 to NFR-P17: Service worker caching, IndexedDB, stale-while-revalidate
- NFR-R3 to NFR-R9: Graceful degradation and fault tolerance
- NFR-R11: Cache expiration policy

**User Personas Served:**
- **Jordan (Contributor)**: Intermittent connectivity scenarios
- **Alex (OSS Maintainer)**: Reliability and uptime concerns
- **Anonymous Visitor**: Performance perception and "it just works" experience

**Implementation Notes:**
- Enhances: All previous epics with offline and performance features
- Files: service-worker.ts, lib/cache.ts (Dexie database)
- Hooks: useCache.ts, useOnlineStatus.ts
- Strategy: Application shell caching + dynamic content caching
- TTL: Repos 1hr, Issues/PRs 5min, Arweave content permanent

**Standalone Value:** Performance and offline features that make all browsing faster and more resilient

---

### Epic 9: Accessibility & Universal Design

**Goal:** All users can access Rig regardless of ability, device, or assistive technology.

**User Outcome:** Users can navigate entirely by keyboard, use screen readers with full functionality, browse on mobile devices down to 320px, zoom to 200% without layout breaking, and distinguish information without relying on color.

**What This Epic Delivers:**
- Full keyboard navigation with visible focus indicators
- Semantic HTML structure with proper heading hierarchy
- ARIA labels for all interactive elements
- Skip links for screen readers
- Mobile-responsive layouts (320px to 1440px+)
- Touch-optimized tap targets (44x44px minimum)
- 200% zoom support without horizontal scrolling
- Color-independent information design (diff symbols, not just colors)
- Screen reader testing and optimization

**FRs Covered:** FR40, FR41, FR42, FR43, FR44

**NFRs Addressed:**
- NFR-A1 to NFR-A18: Complete WCAG 2.1 Level AA compliance
- NFR-A16: Lighthouse accessibility audit score ≥90

**User Personas Served:**
- **All Users**: Ensures universal access
- **Jordan (Contributor)**: Mobile access for on-the-go code review

**Implementation Notes:**
- Enhances: All previous epics with accessibility features
- Testing: Lighthouse, VoiceOver (Safari), NVDA (Firefox), JAWS (Chrome)
- Components: All existing components enhanced with ARIA labels, semantic HTML
- Responsive breakpoints: 320px (mobile), 768px (tablet), 1024px+ (desktop)
- Keyboard shortcuts: j/k (navigation), t (file finder), ? (help)

**Standalone Value:** Accessibility layer ensuring all features work for all users

---

### Epic 10: Developer Experience & Ecosystem Integration

**Goal:** Developers can inspect internals, understand architecture, and build derivative applications.

**User Outcome:** Developers can inspect NIP-34 events in DevTools, access architecture documentation, understand implementation patterns for reuse, and share permanent ArNS URLs.

**What This Epic Delivers:**
- DevTools panel for NIP-34 event inspection
- Architecture documentation pages
- Implementation pattern guides
- Code examples and snippets
- API documentation for reuse
- Embeddable components guide
- ArNS URL sharing utilities
- Developer-focused educational content
- "Powered by Crosstown Pattern" branding

**FRs Covered:** FR45, FR46, FR47, FR48

**NFRs Addressed:**
- NFR-I3: NIP-34 compliance documentation
- NFR-SC2: No backend infrastructure (all client-side for easy forking)

**User Personas Served:**
- **Taylor (Ecosystem Builder)**: Pattern replication for derivative apps
- **Casey (Web3 Dev)**: Integration into existing applications
- **Alex (OSS Maintainer)**: Transparency and understanding

**Implementation Notes:**
- Enhances: All previous epics with developer tools
- Components: DevToolsPanel.tsx, ArchitectureDocs.tsx, PatternGuide.tsx
- Documentation: Links to architecture.md, implementation guides
- DevTools: Event inspector showing Nostr event structure, relay sources
- Sharing: One-click ArNS URL copying, social media OpenGraph tags

**Standalone Value:** Developer features that enable ecosystem growth and derivative applications

---

## Epic 1: Project Foundation & Infrastructure

**Goal:** Development team can build the Rig application with all foundational infrastructure in place.

### Story 1.1: Project Initialization with Starter Template

As a **developer**,
I want **the project initialized with Vite + React + TypeScript + shadcn/ui following the Architecture specifications**,
So that **I have a clean, modern foundation for building the Rig frontend application**.

**Acceptance Criteria:**

**Given** I need to start developing the Rig frontend
**When** I execute the project initialization commands from Architecture.md
**Then** The project structure is created with all specified dependencies installed

**And** The following tools are configured and functional:
- Vite 7 development server with HMR
- React 19 with TypeScript strict mode
- Tailwind CSS 4 with PostCSS
- shadcn/ui component library initialized
- Path aliases configured (@/ resolves to src/)

**And** The following core dependencies are installed:
- nostr-tools (for Nostr relay connections)
- @ardrive/turbo-sdk, @ar.io/wayfinder, @ar.io/sdk (for Arweave integration)
- @tanstack/react-query (for async state management)
- react-router-dom (for routing)
- dexie (for IndexedDB caching)
- zod (for schema validation)
- react-markdown, remark-gfm (for markdown rendering)
- react-syntax-highlighter (for code highlighting)

**And** Development dependencies are installed:
- vitest, @testing-library/react, @testing-library/jest-dom (for testing)

**And** The project starts successfully with `npm run dev` on port 5173

**And** The initial build completes successfully with `npm run build`

**And** The dist/ output is optimized and under 500KB gzipped (per NFR-P11)

**Technical Implementation Notes:**
- Follow exact commands from Architecture.md section "Project Initialization Commands"
- Configure tsconfig.json with baseUrl and path aliases
- Configure vite.config.ts with path alias resolution
- Initialize shadcn/ui with: Style: Default, Base color: Slate, CSS variables: Yes
- Verify all dependencies are compatible versions

**References:**
- Architecture.md: "Starter Template Evaluation" section
- Architecture.md: "Initialization Commands" section
- NFR-P11: Initial JavaScript bundle size <500KB gzipped

---

### Story 1.2: Nostr Relay Service Layer

As a **developer**,
I want **a service layer that connects to multiple Nostr relays and queries NIP-34 events**,
So that **the application can fetch decentralized repository data from the Nostr network**.

**Acceptance Criteria:**

**Given** The project is initialized (Story 1.1 complete)
**When** I implement the Nostr service layer in src/lib/nostr.ts
**Then** The service provides a shared SimplePool instance from nostr-tools

**And** The service connects to the configured relay list:
- wss://relay.damus.io
- wss://nos.lol
- wss://relay.nostr.band
(Static relay pool per Architecture decision)

**And** The service provides functions for querying NIP-34 event kinds:
- fetchRepositories() → queries kind 30617 events
- fetchIssues() → queries kind 1621 events
- fetchPullRequests() → queries kind 1618 events
- fetchPatches() → queries kind 1617 events
- fetchComments() → queries kind 1622 events

**And** All Nostr events are signature-verified using verifyEvent() from nostr-tools (per NFR-S1)

**And** Invalid event signatures are rejected with clear error messages (per NFR-S3)

**And** Failed relay queries timeout within 2 seconds (per NFR-P8)

**And** The service races queries across all relays in parallel and uses the first successful response (per NFR-P7)

**And** Constants are defined in src/constants/nostr.ts:
```typescript
export const REPO_ANNOUNCEMENT = 30617
export const ISSUE = 1621
export const PULL_REQUEST = 1618
export const PATCH = 1617
export const COMMENT = 1622
export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band'
]
```

**And** Unit tests verify:
- SimplePool connection handling
- Event signature verification
- Timeout behavior
- Parallel relay querying

**Technical Implementation Notes:**
- Use nostr-tools SimplePool for connection management
- Single shared pool instance for entire application (per Architecture)
- Implement proper cleanup on connection close
- Handle WebSocket disconnections with automatic reconnection (per NFR-I6)

**References:**
- Architecture.md: "Nostr Relay Strategy" decision
- Architecture.md: "Event Signature Validation" decision
- NFR-S1: Event signature verification
- NFR-P7: Multi-relay query racing
- NFR-P8: Timeout within 2s
- NFR-I6: WebSocket auto-reconnection

---

### Story 1.3: Arweave & ar.io Gateway Integration

As a **developer**,
I want **a service layer that retrieves files and manifests from Arweave via ar.io gateways**,
So that **the application can fetch permanent code storage from decentralized Arweave infrastructure**.

**Acceptance Criteria:**

**Given** The project is initialized (Story 1.1 complete)
**When** I implement the Arweave service layer in src/lib/arweave.ts
**Then** The service integrates with @ar.io/wayfinder SDK for automatic gateway selection

**And** The service provides functions for:
- fetchManifest(txId: string) → retrieves Arweave manifest for repository
- fetchFile(txId: string, path: string) → retrieves file content from Arweave
- resolveArNS(name: string) → resolves ArNS name to Arweave transaction ID (per NFR-I13)

**And** Failed gateway requests automatically retry with alternate gateways within 1s timeout per gateway (per NFR-P10)

**And** The service tries 3+ ar.io gateways per request with automatic failover (per NFR-I10)

**And** Arweave transaction hashes are verified for data integrity (per NFR-S2)

**And** Gateway requests complete within 3s for ≥95% of file retrievals (per NFR-P9)

**And** Constants are defined in src/constants/arweave.ts with gateway URLs

**And** Unit tests verify:
- Wayfinder SDK gateway selection
- Automatic failover behavior
- Transaction hash verification
- Timeout handling

**Technical Implementation Notes:**
- Use @ar.io/wayfinder for decentralized gateway routing
- Implement exponential backoff for retry logic
- Cache gateway health metrics for future requests
- Support custom gateway URLs (user-configurable per NFR-I11)

**References:**
- Architecture.md: "Arweave Gateway Strategy" decision
- NFR-P9: Arweave retrieval <3s for 95% of requests
- NFR-P10: Auto-retry with alternate gateways
- NFR-S2: Transaction hash verification
- NFR-I9: ar.io gateway network integration
- NFR-I10: Multi-gateway fallback (3+ gateways)
- NFR-I13: ArNS resolution <2s

---

### Story 1.4: IndexedDB Caching Layer

As a **developer**,
I want **a caching layer using IndexedDB with hybrid TTL policies**,
So that **the application provides fast offline access and reduces relay/gateway load**.

**Acceptance Criteria:**

**Given** The project is initialized (Story 1.1 complete)
**When** I implement the caching layer in src/lib/cache.ts using Dexie
**Then** The cache database is created with tables for:
- repositories (kind 30617 events)
- issues (kind 1621 events)
- pullRequests (kind 1618 events)
- patches (kind 1617 events)
- comments (kind 1622 events)
- files (Arweave file content)

**And** The cache implements hybrid TTL policies per Architecture decision:
- Repository metadata: 1 hour TTL
- Issues/PRs/Comments: 5 minutes TTL
- Arweave file content: Permanent cache (immutable)

**And** The cache provides functions:
- cacheEvent(eventKind, eventId, data, ttl) → stores event with TTL
- getCachedEvent(eventKind, eventId) → retrieves if not expired
- cacheFile(txId, path, content) → stores Arweave file (no TTL)
- getCachedFile(txId, path) → retrieves cached file
- invalidateCache(eventKind, filter) → clears specific cache entries
- clearExpired() → removes expired entries

**And** Previously viewed content is accessible offline via IndexedDB cache (per NFR-P16)

**And** The stale-while-revalidate strategy shows cached data immediately and updates in background (per NFR-P17)

**And** Cache storage uses IndexedDB per NFR-I19

**And** Unit tests verify:
- TTL expiration logic
- Cache hit/miss scenarios
- Stale-while-revalidate behavior
- Cache invalidation

**Technical Implementation Notes:**
- Use Dexie wrapper for IndexedDB
- Implement LRU eviction when storage quota reached
- Store timestamps for TTL calculation
- Background worker for expired entry cleanup

**References:**
- Architecture.md: "Caching Policies" decision
- NFR-P16: Offline access via IndexedDB
- NFR-P17: Stale-while-revalidate strategy
- NFR-I19: IndexedDB for offline caching
- NFR-R11: Cache expiration policy (1hr repos, 5min issues)

---

### Story 1.5: TanStack Query Configuration

As a **developer**,
I want **TanStack Query configured with balanced settings for async state management**,
So that **data fetching, caching, and real-time updates are handled efficiently across the application**.

**Acceptance Criteria:**

**Given** Stories 1.1-1.4 are complete (caching layer exists)
**When** I implement TanStack Query configuration in src/lib/query-client.ts
**Then** A QueryClient is created with the following configuration:
- staleTime: Varies by query type (repos: 1hr, issues: 5min per Architecture)
- cacheTime: 1 hour default
- refetchOnWindowFocus: true
- retry: 3 with exponential backoff

**And** The QueryClientProvider wraps the application in src/main.tsx

**And** Query keys follow a consistent convention:
- ['repositories'] → all repositories
- ['repository', repoId] → specific repository
- ['issues', repoId] → issues for repository
- ['pullRequests', repoId] → PRs for repository
- ['file', txId, path] → specific file

**And** The configuration integrates with the IndexedDB cache layer (Story 1.4)

**And** Failed queries are retried 3 times with exponential backoff per Architecture decision

**And** Query invalidation works correctly for cache updates

**And** Unit tests verify:
- QueryClient configuration
- Query key consistency
- Retry behavior
- Cache integration

**Technical Implementation Notes:**
- Use @tanstack/react-query v5
- Create custom hooks that wrap useQuery with correct staleTime per data type
- Document query key conventions in query-client.ts comments
- Set up React Query DevTools for development

**References:**
- Architecture.md: "State Management" decision
- Architecture.md: "TanStack Query Configuration"
- Architecture.md: "Caching Strategy"

---

### Story 1.6: React Router & Navigation Setup

As a **developer**,
I want **React Router configured with Forgejo-compatible URL patterns**,
So that **the application has clean, familiar routing that matches GitHub/Forgejo conventions**.

**Acceptance Criteria:**

**Given** The project is initialized (Story 1.1 complete)
**When** I implement routing in src/App.tsx using React Router DOM v6
**Then** The router is configured with the following route structure:
```
/ → Home (repository discovery)
/:owner/:repo → Repository detail
/:owner/:repo/src/:branch/:path* → File browser
/:owner/:repo/commits → Commit history
/:owner/:repo/commit/:hash → Commit detail
/:owner/:repo/issues → Issue list
/:owner/:repo/issues/:id → Issue detail
/:owner/:repo/pulls → Pull request list
/:owner/:repo/pulls/:id → Pull request detail
```

**And** Route-based code splitting is implemented using React.lazy() per NFR-P14:
```typescript
const RepoDetail = lazy(() => import('./features/repository/RepoDetail'))
const IssueList = lazy(() => import('./features/issues/IssueList'))
```

**And** All route components are wrapped in Suspense with loading fallbacks

**And** 404 Not Found page handles unmatched routes

**And** Constants for route paths are defined in src/constants/routes.ts

**And** Navigation works correctly with browser back/forward buttons

**And** Unit tests verify:
- Route matching for all defined patterns
- Code splitting behavior
- 404 handling

**Technical Implementation Notes:**
- Use react-router-dom v6
- Implement lazy loading for all feature routes
- Create route constants to avoid hardcoded strings
- Match Forgejo URL patterns exactly for familiarity

**References:**
- Architecture.md: "Routing Strategy" decision
- Architecture.md: "Performance Optimization" (code splitting)
- NFR-P14: Route-based code splitting

---

### Story 1.7: Core Layout Components

As a **developer**,
I want **core layout components (Header, Sidebar, Footer) implemented with shadcn/ui**,
So that **the application has a consistent, accessible structure that frames all feature content**.

**Acceptance Criteria:**

**Given** Stories 1.1 and 1.6 are complete (shadcn/ui and routing exist)
**When** I implement layout components in src/components/layout/
**Then** The following components are created:
- Header.tsx → Top navigation bar with logo and main menu
- Sidebar.tsx → Optional side navigation (collapsible on mobile)
- Footer.tsx → Bottom footer with links and branding

**And** Header component includes:
- Rig logo/branding
- Search input (placeholder for future functionality)
- Theme toggle (light/dark mode)
- "Powered by Crosstown Pattern" branding per UX design

**And** All components use shadcn/ui primitives where applicable

**And** All components are responsive across breakpoints:
- 320-767px (Mobile): Header with hamburger menu, collapsible sidebar
- 768-1023px (Tablet): Header with partial nav, toggleable sidebar
- 1024px+ (Desktop): Full header nav, persistent sidebar option

**And** All interactive elements have minimum 44x44px touch targets (per NFR-A13)

**And** Semantic HTML structure is used (per NFR-A5):
- <header>, <nav>, <main>, <aside>, <footer> elements
- Proper heading hierarchy (h1 → h2 → h3)

**And** Skip links are provided for screen readers per NFR-A4

**And** All layouts are keyboard navigable (per NFR-A1)

**And** Unit tests verify:
- Component rendering
- Responsive behavior
- Accessibility attributes

**Technical Implementation Notes:**
- Use shadcn/ui components: Button, DropdownMenu, Sheet (for mobile menu)
- Implement responsive breakpoints matching Architecture specs
- Follow WCAG 2.1 Level AA compliance
- Co-locate tests: Header.test.tsx, Sidebar.test.tsx, Footer.test.tsx

**References:**
- Architecture.md: "Project Structure" section (components/layout/)
- UX Design: "Platform Strategy" (responsive breakpoints)
- NFR-A1: Keyboard navigation
- NFR-A4: Skip links
- NFR-A5: Semantic HTML
- NFR-A13: Touch targets 44x44px
- NFR-A14: Mobile-responsive from 320px

---

### Story 1.8: Type Definitions & Validation Schemas

As a **developer**,
I want **comprehensive TypeScript type definitions and Zod validation schemas for NIP-34 events and domain models**,
So that **the application has type safety and runtime validation for all decentralized data**.

**Acceptance Criteria:**

**Given** The project is initialized with TypeScript strict mode (Story 1.1 complete)
**When** I implement type definitions in src/types/
**Then** The following type files are created:
- index.ts → Re-exports all types
- common.ts → RigError interface, shared utility types
- nostr.ts → NIP-34 event types, relay types
- repository.ts → Repository domain model
- issue.ts → Issue, Comment domain models
- pull-request.ts → PullRequest domain model
- patch.ts → Patch domain model
- arweave.ts → ArweaveManifest, Gateway types

**And** Zod schemas are defined for all NIP-34 event kinds:
- RepoAnnouncementSchema (kind 30617)
- IssueSchema (kind 1621)
- PullRequestSchema (kind 1618)
- PatchSchema (kind 1617)
- CommentSchema (kind 1622)
- StatusEventSchemas (kinds 1630-1633)

**And** The RigError interface is defined per Architecture pattern:
```typescript
export interface RigError {
  code: 'RELAY_TIMEOUT' | 'VALIDATION_FAILED' | 'GATEWAY_ERROR' | 'SIGNATURE_INVALID'
  message: string // Technical details
  userMessage: string // User-friendly message
  context?: Record<string, unknown>
}
```

**And** Domain model interfaces are defined for:
- Repository (transformed from kind 30617)
- Issue (transformed from kind 1621)
- PullRequest (transformed from kind 1618)
- Patch (transformed from kind 1617)
- Comment (transformed from kind 1622)

**And** All types can be imported from @/types via the index.ts barrel export

**And** TypeScript strict mode compiles with zero errors

**And** Unit tests verify:
- Zod schema validation for valid/invalid events
- Type exports from index.ts

**Technical Implementation Notes:**
- Use Zod v3.23+ for runtime validation
- Follow naming conventions: PascalCase for types/interfaces
- Organize by domain (nostr, repository, issue, etc.)
- Document complex types with JSDoc comments

**References:**
- Architecture.md: "NIP-34 Event Validation" decision
- Architecture.md: "Type Definitions Organization"
- Architecture.md: "Error Structure Format" pattern
- NFR-S1: Event signature validation (types support this)

---

### Story 1.9: Service Layer Architecture & Error Handling

As a **developer**,
I want **service layer functions that transform NIP-34 events into domain models with layered error handling**,
So that **components receive clean, typed data and errors are handled consistently across the application**.

**Acceptance Criteria:**

**Given** Stories 1.2, 1.3, and 1.8 are complete (services and types exist)
**When** I implement transformer functions in src/lib/transformers/
**Then** The following transformer functions are created:
- eventToRepository.ts → NIP-34 kind 30617 → Repository
- eventToIssue.ts → NIP-34 kind 1621 → Issue
- eventToPullRequest.ts → NIP-34 kind 1618 → PullRequest
- eventToComment.ts → NIP-34 kind 1622 → Comment
- eventToPatch.ts → NIP-34 kind 1617 → Patch

**And** Each transformer function:
- Takes a validated Nostr event (after Zod schema validation)
- Returns a typed domain model or null (if transformation fails)
- Logs warnings for invalid transformations (does not throw)

**And** Service layer functions implement layered error handling per Architecture pattern:
- Service layer (lib/nostr.ts, lib/arweave.ts): Throws structured RigError objects
- Hook layer: Propagates errors via TanStack Query (no try-catch)
- Component layer: Displays errors using status === 'error'

**And** Error handling example flow:
```typescript
// Service layer (lib/nostr.ts)
export async function fetchRepositories(): Promise<Repository[]> {
  try {
    const events = await pool.list(relays, [{ kinds: [REPO_ANNOUNCEMENT] }])
    return events
      .filter(event => verifyEvent(event))
      .map(event => RepoEventSchema.parse(event))
      .map(eventToRepository)
      .filter(Boolean) as Repository[]
  } catch (err) {
    throw {
      code: 'RELAY_TIMEOUT',
      message: err.message,
      userMessage: 'Failed to load repositories. Retrying...'
    } as RigError
  }
}
```

**And** All transformer functions are unit tested with valid/invalid inputs

**And** Error boundaries are created in components/ui/error-boundary.tsx to catch unhandled errors

**Technical Implementation Notes:**
- Validation happens at service layer before transformation
- Transformers are pure functions (no side effects)
- Co-locate tests with transformers
- Follow Architecture pattern: Service throws → Hook propagates → Component displays

**References:**
- Architecture.md: "Event Transformation Pattern"
- Architecture.md: "Error Handling Placement" pattern
- Architecture.md: "Event Validation Timing" pattern
- Architecture.md: "Error Structure Format"

---

### Story 1.10: Development Environment Configuration

As a **developer**,
I want **environment configuration files for development and production**,
So that **the application connects to appropriate relays and gateways in each environment**.

**Acceptance Criteria:**

**Given** The project is initialized (Story 1.1 complete)
**When** I create environment configuration files
**Then** The following files are created in the project root:
- .env.development → Local development settings
- .env.production → Production deployment settings
- .env.example → Template for team members (no secrets)

**And** .env.development contains:
```bash
VITE_NOSTR_RELAYS=wss://relay.damus.io,wss://nos.lol,wss://relay.nostr.band
VITE_ARWEAVE_GATEWAY=https://arweave.net
VITE_ENABLE_DEVTOOLS=true
```

**And** .env.production contains:
```bash
VITE_NOSTR_RELAYS=wss://relay.damus.io,wss://nos.lol,wss://relay.nostr.band
VITE_ARWEAVE_GATEWAY=https://arweave.net
VITE_ENABLE_DEVTOOLS=false
```

**And** Environment variables are accessed using Vite's import.meta.env pattern:
```typescript
const relays = import.meta.env.VITE_NOSTR_RELAYS.split(',')
```

**And** .gitignore includes .env.local and .env.*.local (for personal overrides)

**And** .env.example is committed to git with placeholder values

**And** README.md is updated with environment setup instructions

**And** The application correctly reads environment variables in both dev and production builds

**Technical Implementation Notes:**
- Use Vite's standard environment variable pattern (VITE_ prefix)
- Never commit actual secrets (use .env.example template)
- Document all environment variables in .env.example with comments
- Support local overrides with .env.local for developer customization

**References:**
- Architecture.md: "Environment Configuration" decision
- Architecture.md: "Development Workflow Integration"

---

## Epic 2: Repository Discovery & Exploration

**Goal:** Users can discover repositories from Nostr relays and view repository metadata.

### Story 2.1: Repository List Page with Nostr Query

As a **user**,
I want **to see a list of repositories announced on Nostr**,
So that **I can discover decentralized repositories available on the network**.

**Acceptance Criteria:**

**Given** Epic 1 is complete (Nostr service layer exists)
**When** I navigate to the home page (/)
**Then** The application queries all configured Nostr relays for kind 30617 repository announcement events

**And** Repositories are displayed in a grid layout (3 columns on desktop, 2 on tablet, 1 on mobile)

**And** The query races across all relays in parallel and displays results from the first responders (per NFR-P7)

**And** If only 1 of 5 relays responds successfully, the repositories from that relay are still displayed (per NFR-R3)

**And** A loading state is shown during the query with meaningful status:
- "Connecting to Nostr relays..."
- "Querying 5 relays for repositories..."
- "Loaded from X of 5 relays"

**And** If all relays fail, a clear error message is displayed with retry option (per NFR-R6)

**And** The page loads with LCP <2.5s on standard broadband (per NFR-P1)

**And** Previously viewed repositories are shown from cache immediately, then updated when relays respond (stale-while-revalidate per NFR-P17)

**And** Unit tests verify:
- Multi-relay querying behavior
- Loading state progression
- Error handling for relay failures
- Cache integration

**Technical Implementation Notes:**
- Component: src/pages/Home.tsx
- Hook: src/features/repository/hooks/useRepositories.ts
- Service: Uses lib/nostr.ts → fetchRepositories()
- Uses TanStack Query with staleTime: 1 hour (per Architecture)
- Implements optimistic UI with cached data

**References:**
- FR1: Browse repositories announced via Nostr kind 30617 events
- FR5: View which Nostr relays are providing repository data
- NFR-P1: LCP <2.5s
- NFR-P7: Multi-relay query racing
- NFR-P17: Stale-while-revalidate
- NFR-R3: Functions with minimum 1/5 relays
- NFR-R6: Clear error messaging

---

### Story 2.2: Repository Card Component with Metadata

As a **user**,
I want **to see repository metadata displayed in clear, scannable cards**,
So that **I can quickly assess repositories and understand what they contain**.

**Acceptance Criteria:**

**Given** Story 2.1 is complete (repository list displays)
**When** I view the repository list
**Then** Each repository is displayed in a card component showing:
- Repository name (prominent heading)
- Repository description (truncated to 3 lines with "read more")
- Maintainer(s) names/npubs
- ArNS URL (if available)
- Last updated timestamp (relative time: "2 hours ago")

**And** Repository cards use shadcn/ui Card component for consistent styling

**And** Repository name is a clickable link to the detail page (/:owner/:repo)

**And** ArNS URL is displayed with a copy button for one-click copying

**And** Verification badge shows "✓ Verified on X relays" where X is the number of relays that returned this repo

**And** Cards have hover states that indicate interactivity

**And** Touch targets for all clickable elements are minimum 44x44px (per NFR-A13)

**And** Card layout is responsive across all breakpoints (per NFR-A14)

**And** Screen readers can navigate cards with proper ARIA labels (per NFR-A6)

**And** Component tests verify:
- Metadata display
- Responsive behavior
- Accessibility attributes
- Click navigation

**Technical Implementation Notes:**
- Component: src/features/repository/RepoCard.tsx
- Uses shadcn/ui: Card, CardHeader, CardContent, Badge, Button
- Implements progressive disclosure: collapsed description with expand option
- Co-locate test: RepoCard.test.tsx

**References:**
- FR2: View repository metadata (name, description, maintainers, ArNS URL)
- FR5: View which Nostr relays are providing data (verification badge)
- NFR-A6: ARIA labels for interactive elements
- NFR-A13: Touch targets 44x44px
- NFR-A14: Mobile-responsive from 320px

---

### Story 2.3: Client-Side Search and Filtering

As a **user**,
I want **to search and filter repositories by name**,
So that **I can quickly find specific repositories I'm looking for**.

**Acceptance Criteria:**

**Given** Story 2.2 is complete (repository cards display)
**When** I type in the search input field
**Then** The repository list filters in real-time as I type (client-side filtering)

**And** Filtering is case-insensitive and matches partial strings

**And** A count indicator shows "Showing X of Y repositories"

**And** A "Clear search" button (X icon) appears when search input has text

**And** If no repositories match the search, a helpful empty state is shown:
- "No repositories found matching '[search term]'"
- "Clear search" button to reset

**And** The search input has proper accessibility:
- aria-label="Search repositories"
- Associated label (visible or sr-only)
- Clear focus indicator (per NFR-A3)

**And** Keyboard shortcut "/" focuses the search input (GitHub convention)

**And** Search input works on mobile with appropriate keyboard type

**And** Unit tests verify:
- Filtering logic with various inputs
- Empty state display
- Clear search functionality
- Keyboard shortcut

**Technical Implementation Notes:**
- Add search input to Home.tsx header
- Use debounced filtering (300ms) for performance
- Use shadcn/ui Input component
- Filter locally (no backend query needed)

**References:**
- FR3: Filter repositories by name using client-side search
- NFR-A3: Visible focus indicators
- NFR-A15: Form inputs have associated labels

---

### Story 2.4: Repository Detail Page

As a **user**,
I want **to view detailed information about a specific repository**,
So that **I can learn more about the repository before exploring its code**.

**Acceptance Criteria:**

**Given** Stories 2.1-2.3 are complete (repository list and navigation exist)
**When** I click on a repository card or navigate to /:owner/:repo
**Then** The repository detail page loads showing:
- Repository name as h1 heading
- Full description (not truncated)
- Complete list of maintainers with npub display
- ArNS URL with copy functionality
- Repository topics/tags (if available in event)
- Repository statistics (stars, forks - if available)
- Last updated timestamp

**And** README.md file is fetched from Arweave and rendered using react-markdown (if available)

**And** Markdown rendering supports:
- GitHub-flavored markdown (remark-gfm)
- Syntax highlighting for code blocks
- Proper heading hierarchy
- Links open in new tabs (external links)

**And** The page is accessible via direct URL (deep linking works)

**And** Browser back button returns to previous page correctly

**And** The page loads with TTI <3.5s (per NFR-P4)

**And** Unit tests verify:
- Repository data fetching
- Markdown rendering
- ArNS URL copy functionality
- Deep linking

**Technical Implementation Notes:**
- Component: src/features/repository/RepoDetail.tsx
- Hook: src/features/repository/hooks/useRepository.ts
- Uses react-markdown + remark-gfm for README rendering
- Uses react-syntax-highlighter for code blocks
- Uses shadcn/ui: Card, Separator, Button
- Route: /:owner/:repo
- **Navigation Strategy**: Tabbed navigation will be added progressively as features become available (Epic 3 adds Code tab, Epic 4 adds Commits tab, Epic 5 adds Issues and PRs tabs). This story delivers a standalone repository detail page without tabs.

**References:**
- FR2: View repository metadata
- FR4: Navigate to repository detail view
- NFR-P4: TTI <3.5s

---

### Story 2.5: Relay Status Indicators

As a **user**,
I want **to see which Nostr relays successfully provided repository data**,
So that **I can verify the decentralization of the data I'm viewing**.

**Acceptance Criteria:**

**Given** Story 2.4 is complete (repository detail page exists)
**When** I view a repository (list or detail)
**Then** A relay status indicator is displayed showing:
- Number of relays that responded successfully
- Visual badge: "✓ Verified on 3 of 5 relays"
- Color coding: Green (4-5 relays), Yellow (2-3 relays), Red (1 relay)

**And** Clicking the badge expands a panel showing:
- List of relay URLs that responded
- Response time for each relay (latency in ms)
- List of relay URLs that failed/timed out
- Timestamp of last successful query

**And** The expanded panel uses progressive disclosure pattern (collapsed by default)

**And** If some relays failed, a "Retry All Relays" button is provided

**And** The retry button re-queries all relays and updates the status

**And** Relay connection health status is displayed per FR28

**And** Visual indicators show data age: "Last updated 30s ago from 4/5 relays" (per NFR-R10)

**And** The status panel is accessible:
- Keyboard navigable (tab to expand)
- Screen reader announces relay status
- Focus visible on interactive elements

**And** Unit tests verify:
- Status calculation logic
- Panel expand/collapse
- Retry functionality
- Accessibility

**Technical Implementation Notes:**
- Component: src/components/RelayStatusBadge.tsx
- Hook: src/hooks/useRelayStatus.ts (tracks which relays responded)
- Uses shadcn/ui: Badge, Popover, Button
- Store relay response metadata in TanStack Query cache

**References:**
- FR5: View which Nostr relays are providing repository data
- FR28: View relay connection health status (connected/disconnected)
- NFR-R10: Visual indicators show data age
- UX Design: "Transparency Over Abstraction" principle
- UX Design: "Progressive Disclosure" principle

---

### Story 2.6: Real-Time Repository Updates

As a **user**,
I want **to see new repositories appear automatically without refreshing the page**,
So that **I always see the latest repositories announced on the network**.

**Acceptance Criteria:**

**Given** Stories 2.1-2.5 are complete (repository list and status display)
**When** A new kind 30617 repository announcement event is published to the relays
**Then** The application receives the new event via WebSocket subscription

**And** The new repository appears in the list automatically (no manual refresh required)

**And** The TanStack Query cache is invalidated and refetches repository data

**And** A subtle notification is shown: "New repository added: [repo name]" (toast notification)

**And** The notification auto-dismisses after 5 seconds

**And** WebSocket subscriptions are managed per page lifecycle:
- Subscription created when Home page mounts
- Subscription closed when Home page unmounts

**And** The subscription only listens for kind 30617 events (repository announcements)

**And** Real-time updates work correctly with the relay status indicators (updates show which relays received the new event)

**And** If WebSocket connection is lost, automatic reconnection occurs within 5 seconds (per NFR-I6)

**And** Unit tests verify:
- Subscription lifecycle (mount/unmount)
- Cache invalidation on new events
- Toast notification display
- Reconnection behavior

**Technical Implementation Notes:**
- Hook: src/features/repository/hooks/useRealtimeRepositories.ts
- Uses nostr-tools subscribeMany() for WebSocket subscriptions
- Uses TanStack Query's queryClient.invalidateQueries() for cache updates
- Uses shadcn/ui Toast for notifications
- Separate hook from useRepositories (per Architecture pattern)

**References:**
- Architecture.md: "Real-Time Subscription Management" pattern
- Architecture.md: "Cache Update Strategy"
- NFR-I6: WebSocket connections with automatic reconnection
- UX Design: Real-time updates for live data

---

## Epic 3: Code Browsing & File Navigation

**Goal:** Users can navigate repository file trees and view code with syntax highlighting.

### Story 3.1: File Tree Navigation Component

As a **user**,
I want **to navigate the hierarchical file and folder structure of a repository**,
So that **I can explore the codebase and find specific files I'm interested in**.

**Acceptance Criteria:**

**Given** Epic 1 and Epic 2 are complete (Arweave service and repository context exist)
**When** I navigate to /:owner/:repo/src/:branch
**Then** The file tree is fetched from the Arweave manifest for the repository

**And** The file tree displays as a hierarchical structure showing:
- Folders (with folder icon and expand/collapse arrows)
- Files (with file type icons based on extension)
- Nested structure with proper indentation

**And** Clicking a folder toggles its expand/collapse state

**And** Clicking a file navigates to the file viewer page (/:owner/:repo/src/:branch/:path)

**And** The currently selected file/folder is highlighted

**And** The file tree is collapsible on mobile devices (< 768px) with a toggle button

**And** On desktop (≥1024px), the file tree is displayed in a persistent left sidebar

**And** On tablet (768-1023px), the file tree is toggleable with a button

**And** The file tree is keyboard navigable:
- Arrow keys navigate up/down
- Right arrow expands folder, left arrow collapses
- Enter key opens file/folder

**And** Screen readers can navigate the tree structure with proper ARIA roles (tree, treeitem, group)

**And** The component handles large file trees efficiently (virtual scrolling if >100 items)

**And** Unit tests verify:
- Tree rendering from manifest data
- Expand/collapse functionality
- File/folder navigation
- Responsive behavior
- Keyboard navigation
- Accessibility attributes

**Technical Implementation Notes:**
- Component: src/features/repository/FileBrowser.tsx
- Hook: src/hooks/useFileTree.ts
- Service: Uses lib/arweave.ts → fetchManifest(txId)
- Uses shadcn/ui: Collapsible, ScrollArea
- Implement virtual scrolling for large trees (consider react-window)
- Store expand/collapse state in component state (not URL)

**References:**
- FR11: Navigate repository's file tree structure
- NFR-A1: Keyboard navigation
- NFR-A5: Semantic HTML with ARIA roles
- NFR-A14: Mobile-responsive from 320px
- Architecture.md: "Arweave Service" for manifest fetching

---

### Story 3.2: File Viewer with Syntax Highlighting

As a **user**,
I want **to view file contents with proper syntax highlighting**,
So that **code is readable and I can understand the structure at a glance**.

**Acceptance Criteria:**

**Given** Story 3.1 is complete (file tree navigation exists)
**When** I click on a file in the file tree or navigate to /:owner/:repo/src/:branch/:path
**Then** The file content is fetched from Arweave and displayed

**And** Code files are syntax highlighted based on file extension using react-syntax-highlighter

**And** Syntax highlighting supports at least 20 common languages:
- JavaScript, TypeScript, Python, Rust, Go, Java, C, C++, C#
- Ruby, PHP, Swift, Kotlin, Scala, Elixir
- HTML, CSS, SCSS, JSON, YAML, Markdown

**And** Line numbers are displayed in the left gutter

**And** The user can toggle line wrapping (wrap/no-wrap button in toolbar)

**And** The user can select and copy code (no restrictions on text selection)

**And** Long lines don't break the layout (horizontal scroll for no-wrap mode)

**And** A "Copy" button at the top-right copies entire file content to clipboard

**And** Copy confirmation is shown via toast notification

**And** The file viewer is responsive:
- Desktop: Full width with sidebar
- Mobile: Full width (file tree collapsible)
- Horizontal scroll works on mobile for long lines

**And** Dark mode syntax theme matches the application theme

**And** File loading shows progress indicator for large files (>100KB)

**And** Unit tests verify:
- Syntax highlighting for various languages
- Line numbers display
- Copy functionality
- Responsive behavior
- Loading states

**Technical Implementation Notes:**
- Component: src/features/repository/FileViewer.tsx, CodeViewer.tsx
- Use react-syntax-highlighter with prism or hljs theme
- Fetch file content from Arweave via lib/arweave.ts → fetchFile(txId, path)
- Cache file content in IndexedDB (permanent cache per Architecture)
- Use shadcn/ui: Button (for copy), ScrollArea

**References:**
- FR12: View file contents with syntax highlighting for code files
- NFR-P9: Arweave gateway requests <3s for ≥95% of retrievals
- NFR-P16: Previously viewed content accessible offline (cached files)
- Architecture.md: "Arweave Service" for file retrieval

---

### Story 3.3: Branch and Tag Selection

As a **user**,
I want **to switch between different branches and tags of a repository**,
So that **I can view the file tree and code at different points in the repository's history**.

**Acceptance Criteria:**

**Given** Stories 3.1 and 3.2 are complete (file tree and viewer exist)
**When** I view the file browser page (/:owner/:repo/src/:branch)
**Then** A branch/tag selector dropdown is displayed in the header

**And** The dropdown shows:
- Current branch/tag (highlighted)
- List of all branches (from repository metadata)
- List of all tags (from repository metadata)
- Search input to filter branches/tags

**And** Selecting a different branch/tag:
- Updates the URL to /:owner/:repo/src/[new-branch]
- Fetches the file tree for the new branch from Arweave
- Preserves current file path if it exists in new branch
- Falls back to root if current path doesn't exist

**And** The dropdown is keyboard navigable (arrow keys + Enter to select)

**And** The dropdown has proper ARIA attributes for accessibility

**And** Branch/tag names are displayed with appropriate icons (branch vs tag)

**And** The most commonly used branch (usually "main" or "master") is listed first

**And** Loading state is shown when fetching new branch file tree

**And** Unit tests verify:
- Branch/tag list rendering
- Selection and URL update
- File tree refetch on branch change
- Path preservation logic
- Keyboard navigation

**Technical Implementation Notes:**
- Component: src/features/repository/BranchSelector.tsx
- Use shadcn/ui: Select or ComboBox component
- Store available branches/tags in repository metadata (NIP-34 event)
- Update React Router with new branch parameter
- Re-fetch Arweave manifest for new branch

**References:**
- FR13: Navigate between different file versions across commits
- Architecture.md: "React Router" setup
- NFR-A1: Keyboard navigation

---

### Story 3.4: File Metadata Display

As a **user**,
I want **to see metadata about the file I'm viewing**,
So that **I understand the file's size, when it was last modified, and its location in the repository**.

**Acceptance Criteria:**

**Given** Stories 3.2 and 3.3 are complete (file viewer and branch selection exist)
**When** I view a file at /:owner/:repo/src/:branch/:path
**Then** File metadata is displayed in a header above the file content showing:
- File name (with appropriate icon for file type)
- File size (formatted: "1.5 KB", "234 bytes", "2.3 MB")
- Last modified timestamp (relative: "2 hours ago", absolute on hover)
- Commit hash that last modified this file (if available in metadata)

**And** A breadcrumb navigation is displayed showing the path:
- Repository name > folder > subfolder > file.ext
- Each breadcrumb segment is clickable (navigates to that folder)
- Breadcrumb truncates gracefully on mobile (shows last 2-3 segments)

**And** The file path can be copied with a "Copy path" button

**And** If the file is particularly large (>1MB), a warning is displayed:
- "Large file (2.3 MB) - may take longer to display"

**And** File metadata is fetched from the Arweave manifest

**And** All metadata is accessible via screen readers

**And** Unit tests verify:
- Metadata display for various file sizes
- Breadcrumb navigation and truncation
- Copy path functionality
- Large file warning

**Technical Implementation Notes:**
- Component: src/features/repository/FileMetadata.tsx
- Extract metadata from Arweave manifest
- Use shadcn/ui: Breadcrumb component
- Format file sizes using utility function (lib/utils.ts)
- Format timestamps using relative time library (date-fns or similar)

**References:**
- FR14: View file metadata including size and last modified timestamp
- NFR-A8: Descriptive text for all elements
- Architecture.md: "Arweave Service" for manifest metadata

---

### Story 3.5: Markdown Rendering for README Files

As a **user**,
I want **README.md files to render as formatted markdown instead of raw text**,
So that **documentation is readable and properly formatted**.

**Acceptance Criteria:**

**Given** Story 3.2 is complete (file viewer exists)
**When** I view a .md or .markdown file (especially README.md)
**Then** The file content is rendered as formatted markdown instead of plain text

**And** Markdown rendering supports GitHub-Flavored Markdown (GFM) including:
- Headings (h1-h6)
- Bold, italic, strikethrough
- Lists (ordered, unordered, task lists with checkboxes)
- Code blocks with syntax highlighting
- Inline code with backticks
- Blockquotes
- Tables
- Horizontal rules
- Links (internal and external)
- Images (from Arweave URLs)

**And** External links open in new tabs with rel="noopener noreferrer"

**And** Internal repository links (like `./docs/guide.md`) are converted to proper routes

**And** Code blocks within markdown are syntax highlighted matching the file viewer

**And** A toggle button allows switching between "Rendered" and "Raw" views

**And** Images are lazy-loaded for performance

**And** The markdown renderer sanitizes HTML to prevent XSS attacks (per NFR-S5)

**And** Markdown content is responsive and readable on mobile

**And** Heading hierarchy is preserved for accessibility (proper h1 → h2 → h3 nesting)

**And** Unit tests verify:
- GFM feature rendering
- Link handling (external vs internal)
- XSS prevention (sanitization)
- Raw/Rendered toggle
- Responsive behavior

**Technical Implementation Notes:**
- Use react-markdown with remark-gfm plugin (already installed in Story 1.1)
- Use react-syntax-highlighter for code blocks in markdown
- Sanitize HTML using rehype-sanitize plugin
- Component: src/features/repository/MarkdownViewer.tsx
- Detect .md extension and route to markdown viewer instead of code viewer

**References:**
- FR12: View file contents (markdown as formatted output)
- NFR-S5: Sanitize user-generated content (markdown may contain HTML)
- Architecture.md: "react-markdown + remark-gfm" dependencies
- Epic 2 Story 2.4: README rendering pattern (reuse here)

---

### Story 3.6: Arweave Verification Links for Files

As a **user**,
I want **to verify that files are permanently stored on Arweave**,
So that **I can trust the permanence claims and inspect the storage details**.

**Acceptance Criteria:**

**Given** Story 3.2 is complete (file viewer exists)
**When** I view any file in the repository
**Then** A "View on Arweave" button is displayed in the file header toolbar

**And** Clicking "View on Arweave" opens the Arweave transaction page in a new tab:
- URL format: https://viewblock.io/arweave/tx/[transaction-id]
- Or direct Arweave.net: https://arweave.net/[transaction-id]

**And** The Arweave transaction ID is displayed next to the button (truncated: "abc...xyz")

**And** A "Copy TX ID" button copies the full transaction ID to clipboard

**And** Hovering over the truncated TX ID shows the full ID in a tooltip

**And** The transaction ID is verified against the manifest to ensure integrity (per NFR-S2)

**And** If the transaction ID cannot be verified, a warning is shown (but content still displays)

**And** The verification button has proper ARIA labels for accessibility

**And** On mobile, the button text may be icon-only with tooltip to save space

**And** Unit tests verify:
- Transaction ID display and truncation
- Copy TX ID functionality
- Link generation to Arweave explorers
- Transaction verification logic
- Responsive behavior (text vs icon-only)

**Technical Implementation Notes:**
- Component: Add verification toolbar to FileViewer.tsx
- Extract transaction ID from Arweave manifest
- Use shadcn/ui: Button, Tooltip
- Implement transaction hash verification (lib/arweave.ts)
- Support multiple Arweave block explorers (ViewBlock, ArDrive, direct arweave.net)

**References:**
- FR15: Access "View on Arweave" links to verify permanent storage
- FR25: View Arweave transaction IDs for all stored content (Epic 6 will expand this)
- NFR-S2: Arweave transaction hashes verified for data integrity
- UX Design: "Trust Through Transparency" principle
- UX Design: "One-Click Permanent Citations" interaction pattern

---

## Epic 4: Commit History & Code Changes

**Goal:** Users can explore commit history and review code changes with diffs.

### Story 4.1: Commit History List Page

As a **user**,
I want **to view a chronological list of commits for a repository**,
So that **I can see the development history and track changes over time**.

**Acceptance Criteria:**

**Given** Epic 1 is complete (Nostr service exists)
**When** I navigate to /:owner/:repo/commits
**Then** A list of commits is displayed, fetched from NIP-34 kind 1617 patch events

**And** Each commit in the list shows:
- Commit message (first line, truncated to 80 chars)
- Author name/npub
- Commit timestamp (relative: "2 hours ago")
- Short commit hash (first 7 chars)
- Arweave transaction icon (linking to Epic 4.5)

**And** Commits are ordered reverse chronologically (newest first)

**And** Clicking a commit navigates to the commit detail page (/:owner/:repo/commit/:hash)

**And** The list supports infinite scroll or pagination for repositories with many commits

**And** A loading skeleton is shown while fetching commits

**And** If no commits exist, a helpful empty state is displayed

**And** The page is mobile-responsive with appropriate card layouts

**And** Unit tests verify commit list rendering, navigation, and pagination

**Technical Implementation Notes:**
- Component: src/features/repository/CommitHistory.tsx
- Hook: src/features/repository/hooks/useCommits.ts
- Service: lib/nostr.ts → fetchCommits() queries kind 1617
- Transformer: lib/transformers/eventToCommit.ts
- Route: /:owner/:repo/commits

**References:** FR6, NFR-P5, Architecture.md commit history mapping

---

### Story 4.2: Commit Detail Page with Metadata

As a **user**,
I want **to view detailed information about a specific commit**,
So that **I understand what changed, who made the change, and when it occurred**.

**Acceptance Criteria:**

**Given** Story 4.1 is complete
**When** I navigate to /:owner/:repo/commit/:hash
**Then** The commit detail page displays:
- Full commit message (multi-line)
- Author name/npub with avatar (if available)
- Commit timestamp (both relative and absolute)
- Full commit hash (with copy button)
- Nostr event ID (with copy button)
- Parent commit hash(es) (with navigation links)
- Arweave transaction ID for permanent storage verification

**And** A "View Parent Commit" button navigates to the parent commit

**And** For merge commits, multiple parent commit links are shown

**And** All metadata is accessible and copyable

**And** The page layout is responsive on mobile

**And** Unit tests verify metadata display and navigation

**Technical Implementation Notes:**
- Component: src/features/repository/CommitDetail.tsx
- Hook: src/features/repository/hooks/useCommit.ts
- Parse commit relationships from NIP-34 event tags
- Route: /:owner/:repo/commit/:hash

**References:** FR7, FR10, Architecture.md NIP-34 event structure

---

### Story 4.3: Diff Viewer with Syntax Highlighting

As a **user**,
I want **to see a syntax-highlighted diff showing what changed in a commit**,
So that **I can review code changes easily and understand the modifications**.

**Acceptance Criteria:**

**Given** Story 4.2 is complete
**When** I view a commit detail page
**Then** A diff viewer displays all file changes in the commit showing:
- Added lines (green background, "+" prefix)
- Removed lines (red background, "-" prefix)
- Unchanged context lines (gray, no prefix)
- Line numbers for both old and new file versions

**And** Syntax highlighting is applied based on file extension

**And** Large diffs are collapsible by file (expand/collapse per file)

**And** A summary shows: "X files changed, Y insertions(+), Z deletions(-)"

**And** Diff symbols (+/-) are used alongside colors for accessibility (per NFR-A10)

**And** Users can toggle between unified diff and split diff views

**And** On mobile, unified diff is default (split view optional)

**And** Copy buttons allow copying the entire diff or individual file diffs

**And** Unit tests verify diff rendering, syntax highlighting, and view toggling

**Technical Implementation Notes:**
- Component: src/features/repository/DiffViewer.tsx
- Use react-diff-view or similar library
- Apply syntax highlighting per language
- Extract diff data from NIP-34 patch event content

**References:** FR8, NFR-A10 (color independence), Architecture.md diff visualization

---

### Story 4.4: Commit Navigation and Relationships

As a **user**,
I want **to navigate between related commits (parent/child relationships)**,
So that **I can trace the development history forward and backward**.

**Acceptance Criteria:**

**Given** Stories 4.1-4.3 are complete
**When** I view a commit detail page
**Then** Navigation controls are provided:
- "← Previous Commit" button (navigates to parent)
- "Next Commit →" button (navigates to child, if exists)
- Keyboard shortcuts: ← (previous), → (next)

**And** For merge commits with multiple parents:
- All parent commits are listed
- User can choose which parent to navigate to

**And** Breadcrumb shows position in commit history:
- "Latest → ... → Current Commit (abc1234) → ... → Initial"

**And** Navigation preserves scroll position when returning

**And** Disabled navigation buttons are grayed out (no previous/next available)

**And** Keyboard navigation works correctly

**And** Unit tests verify navigation logic and keyboard shortcuts

**Technical Implementation Notes:**
- Store commit relationships in TanStack Query cache
- Use React Router history for navigation
- Implement keyboard event listeners for shortcuts
- Handle edge cases: first commit (no parent), latest commit (no child)

**References:** FR9, NFR-A1 (keyboard navigation), Architecture.md routing

---

### Story 4.5: Commit Arweave Verification

As a **user**,
I want **to verify that commits are permanently stored on Arweave**,
So that **I can trust the commit history is immutable and permanent**.

**Acceptance Criteria:**

**Given** Story 4.2 is complete
**When** I view any commit detail page
**Then** Arweave verification information is displayed:
- "Stored permanently on Arweave" badge
- Arweave transaction ID (truncated with full ID in tooltip)
- "View on Arweave" button linking to transaction explorer
- Copy transaction ID button

**And** Transaction hash is verified against expected hash (per NFR-S2)

**And** Storage guarantee information is shown: "200+ year permanent storage"

**And** Link opens Arweave block explorer (viewblock.io or arweave.net)

**And** Verification badge uses progressive disclosure (collapsed by default, expandable)

**And** All verification UI is accessible via keyboard and screen readers

**And** Unit tests verify transaction ID display, verification logic, and links

**Technical Implementation Notes:**
- Extract Arweave TX ID from NIP-34 commit event
- Verify hash using lib/arweave.ts verification functions
- Reuse verification UI patterns from Epic 3 Story 3.6
- Component: Enhanced CommitDetail.tsx with verification section

**References:** FR10, FR25 (Epic 6 expands), NFR-S2, UX Design transparency principle

---

## Epic 5: Issue & Pull Request Tracking

**Goal:** Users can browse issues and pull requests with threaded discussions.

### Story 5.1: Issue List Page with Filtering

As a **user**,
I want **to browse a list of issues for a repository with filtering options**,
So that **I can find relevant issues quickly and track project status**.

**Acceptance Criteria:**

**Given** Epic 1 is complete (Nostr service exists)
**When** I navigate to /:owner/:repo/issues
**Then** A list of issues is displayed, fetched from NIP-34 kind 1621 events

**And** Each issue card shows:
- Issue number (#123)
- Issue title
- Status badge (Open/Closed)
- Author npub/name
- Created timestamp (relative)
- Comment count icon with number
- Labels/tags (if available)

**And** Filter controls are provided:
- Status filter: All / Open / Closed
- Label filter: Multi-select labels
- Sort options: Newest / Oldest / Most commented

**And** URL query parameters preserve filter state (shareable filtered URLs)

**And** Client-side filtering with instant updates

**And** Search input filters by title/description

**And** Empty states for "No issues match your filters"

**And** Mobile-responsive card layout

**And** Unit tests verify filtering logic and URL parameter handling

**Technical Implementation Notes:**
- Component: src/features/issues/IssueList.tsx
- Hook: src/features/issues/hooks/useIssues.ts
- Service: lib/nostr.ts → fetchIssues() queries kind 1621
- Transformer: lib/transformers/eventToIssue.ts
- Route: /:owner/:repo/issues

**References:** FR16, Architecture.md issue features mapping

---

### Story 5.2: Issue Detail Page with Threaded Comments

As a **user**,
I want **to view issue details with threaded comment discussions**,
So that **I can follow conversations and understand the issue context**.

**Acceptance Criteria:**

**Given** Story 5.1 is complete
**When** I navigate to /:owner/:repo/issues/:id
**Then** The issue detail page displays:
- Issue title (h1)
- Issue description (markdown rendered)
- Status badge (Open/Closed)
- Author info with timestamp
- Labels/tags
- Arweave verification badge (per Epic 4.5 pattern)

**And** Comments are displayed below the issue description in threaded format:
- Root comments directly on issue
- Replies indented under parent comments (NIP-10 threading)
- Up to 3 levels of nesting visually indicated
- Deeper nesting collapses with "Show replies" toggle

**And** Each comment shows:
- Author npub/name
- Comment content (markdown rendered)
- Timestamp (relative)
- Reply count (if has replies)

**And** Comment threading follows NIP-10 references correctly

**And** Markdown content is sanitized (per NFR-S5)

**And** Mobile layout stacks comments vertically with reduced nesting

**And** Unit tests verify threading logic, markdown rendering, and responsive layout

**Technical Implementation Notes:**
- Component: src/features/issues/IssueDetail.tsx, CommentThread.tsx
- Hook: src/features/issues/hooks/useIssue.ts
- Service: lib/nostr.ts → fetchComments() queries kind 1622
- Transformer: lib/transformers/eventToComment.ts
- Implement NIP-10 threading algorithm
- Route: /:owner/:repo/issues/:id

**References:** FR17, FR18, NFR-I2 (NIP-10 threading), NFR-S5 (sanitization)

---

### Story 5.3: Pull Request List Page

As a **user**,
I want **to browse a list of pull requests for a repository**,
So that **I can see proposed changes and their review status**.

**Acceptance Criteria:**

**Given** Epic 1 is complete (Nostr service exists)
**When** I navigate to /:owner/:repo/pulls
**Then** A list of pull requests is displayed, fetched from NIP-34 kind 1618 events

**And** Each PR card shows:
- PR number (#456)
- PR title
- Status badge (Open/Merged/Closed/Draft)
- Author npub/name
- Created timestamp (relative)
- Target branch and source branch (main ← feature-branch)
- Comment/review count
- Changes summary (+123, -45)

**And** Filter controls:
- Status: All / Open / Merged / Closed / Draft
- Sort: Newest / Oldest / Most comments / Recently updated

**And** URL parameters preserve filter state

**And** Status badges are color-coded:
- Open: Blue
- Merged: Purple
- Closed: Red
- Draft: Gray

**And** Mobile-responsive layout

**And** Unit tests verify PR list rendering and filtering

**Technical Implementation Notes:**
- Component: src/features/pulls/PullRequestList.tsx
- Hook: src/features/pulls/hooks/usePullRequests.ts
- Service: lib/nostr.ts → fetchPullRequests() queries kind 1618
- Transformer: lib/transformers/eventToPullRequest.ts
- Route: /:owner/:repo/pulls

**References:** FR19, FR22 (status indicators), Architecture.md PR features

---

### Story 5.4: Pull Request Detail Page with Discussion

As a **user**,
I want **to view pull request details with threaded discussions**,
So that **I can review proposed changes and follow the review conversation**.

**Acceptance Criteria:**

**Given** Story 5.3 is complete
**When** I navigate to /:owner/:repo/pulls/:id
**Then** The PR detail page displays:
- PR title (h1)
- PR description (markdown rendered)
- Status badge (Open/Merged/Closed/Draft)
- Author info with timestamp
- Target and source branches clearly indicated
- Merge commit hash (if merged)
- Arweave verification badge

**And** Discussion/review comments are displayed in threaded format (same as issues)

**And** Comments follow NIP-10 threading (same component as Story 5.2)

**And** PR-specific metadata is shown:
- Commits included in PR (count and list)
- Files changed (count and summary)
- Reviewers (if available in NIP-34 events)

**And** A "View Changes" tab shows the diff (reuses Epic 4 diff viewer)

**And** Mobile layout is responsive

**And** Unit tests verify PR detail rendering and discussion threading

**Technical Implementation Notes:**
- Component: src/features/pulls/PullRequestDetail.tsx
- Reuse CommentThread.tsx from Story 5.2
- Reuse DiffViewer.tsx from Epic 4 Story 4.3
- Hook: src/features/pulls/hooks/usePullRequest.ts
- Route: /:owner/:repo/pulls/:id

**References:** FR20, FR21, NFR-I2 (NIP-10), Architecture.md PR features

---

### Story 5.5: Status Indicators for Issues and PRs

As a **user**,
I want **to see clear visual status indicators for issues and pull requests**,
So that **I can quickly identify open, closed, merged, and draft items**.

**Acceptance Criteria:**

**Given** Stories 5.1-5.4 are complete
**When** I view any issue or PR list/detail page
**Then** Status badges are consistently displayed with:
- **Issues**: Open (green), Closed (red/purple)
- **Pull Requests**: Open (blue), Merged (purple), Closed (red), Draft (gray)

**And** Badge colors meet WCAG AA contrast requirements (per NFR-A9)

**And** Icons accompany color for accessibility (per NFR-A10):
- Open: Circle outline icon
- Closed: Circle with X icon
- Merged: Git merge icon
- Draft: Document icon

**And** Status badges have aria-labels for screen readers

**And** Status is displayed prominently at the top of detail pages

**And** Status updates are reflected via real-time subscriptions (Story 5.6)

**And** Unit tests verify status badge rendering and accessibility

**Technical Implementation Notes:**
- Component: src/components/StatusBadge.tsx (reusable)
- Use shadcn/ui: Badge component with custom variants
- Define status types in src/types/issue.ts and pull-request.ts
- Ensure icon + color combination per accessibility requirements

**References:** FR22, NFR-A9 (contrast), NFR-A10 (color independence)

---

### Story 5.6: Real-Time Updates for Issues and PRs

As a **user**,
I want **issues and pull requests to update automatically when new comments or status changes occur**,
So that **I always see the latest information without manual refresh**.

**Acceptance Criteria:**

**Given** Stories 5.1-5.5 are complete
**When** A new comment (kind 1622) or status event (kinds 1630-1633) is published
**Then** The relevant issue or PR automatically updates via WebSocket subscription

**And** New comments appear in the thread without refresh

**And** Status changes (Open → Closed, Open → Merged) update badges automatically

**And** A subtle notification indicates the update: "New comment added"

**And** Subscriptions are page-specific:
- Issue list page: Subscribe to issue status changes only
- Issue detail page: Subscribe to issue and comments
- PR list page: Subscribe to PR status changes
- PR detail page: Subscribe to PR and comments/reviews

**And** Subscriptions are created on mount and cleaned up on unmount

**And** Cache is invalidated and refetched on relevant events

**And** Unit tests verify subscription lifecycle and cache invalidation

**Technical Implementation Notes:**
- Hooks: useRealtimeIssues.ts, useRealtimePullRequests.ts
- Subscribe to kinds: 1621, 1622 (issues/comments), 1618, 1630-1633 (PRs/status)
- Use TanStack Query invalidateQueries for cache updates
- Follow Architecture pattern: separate subscription hooks from query hooks

**References:** Architecture.md real-time subscription pattern, NFR-I6 (WebSocket reconnection)

---

## Epic 6: Decentralization Transparency & Verification

**Goal:** Users can verify decentralization claims through cryptographic proofs and relay status.

### Story 6.1: Comprehensive Relay Status Dashboard

As a **user**,
I want **a detailed relay status dashboard showing all relay connections**,
So that **I can verify the multi-relay decentralization and monitor connection health**.

**Acceptance Criteria:**

**Given** Epic 1 is complete (Nostr service with multi-relay exists)
**When** I click the relay status badge (from Epic 2 Story 2.5) or access relay dashboard
**Then** A comprehensive relay dashboard is displayed showing:
- List of all configured relays (5+ relays)
- Connection status for each: Connected (green) / Disconnected (red) / Connecting (yellow)
- Latency for each connected relay (ms)
- Last successful query timestamp
- Total events received from each relay
- Relay URL (with copy button)

**And** A summary shows: "Connected to 4 of 5 relays"

**And** A "Retry All" button re-attempts connections to failed relays

**And** A "Test Relay" button for each relay sends a test query and displays results

**And** The dashboard updates in real-time as relay status changes

**And** Historical uptime graph shows relay availability over time (optional enhancement)

**And** Relay health is persistently monitored per NFR-I7

**And** Unit tests verify status display, retry logic, and real-time updates

**Technical Implementation Notes:**
- Component: src/components/RelayDashboard.tsx
- Hook: src/hooks/useRelayStatus.ts (enhanced from Epic 2)
- Monitor relay connections continuously
- Store relay metrics in component state or TanStack Query cache
- Use shadcn/ui: Card, Badge, Button, Separator

**References:** FR23, FR28, NFR-I7 (relay health monitoring)

---

### Story 6.2: Event Signature Verification UI

As a **user**,
I want **to verify Nostr event signatures for any content**,
So that **I can cryptographically confirm data authenticity**.

**Acceptance Criteria:**

**Given** Epic 1 is complete (signature verification in service layer exists)
**When** I view any content derived from Nostr events (repo, issue, PR, commit)
**Then** A "Verify Signature" button or icon is displayed

**And** Clicking opens a verification modal showing:
- Event ID (with copy button)
- Event signature (truncated, full in tooltip, copy button)
- Public key / npub of author
- Signature verification status: ✓ Valid / ✗ Invalid
- Verification algorithm: "secp256k1"
- Timestamp of event creation

**And** For valid signatures, a green checkmark and "Signature verified" message is shown

**And** For invalid signatures (if any), a red X and "Invalid signature - data may be tampered" warning is shown

**And** The modal explains: "This cryptographic signature proves the data came from the stated author and hasn't been modified"

**And** An "Advanced" section shows:
- Raw event JSON (formatted)
- Signature verification process explanation

**And** The modal is accessible via keyboard (ESC closes, tab navigation)

**And** Unit tests verify signature display and validation UI

**Technical Implementation Notes:**
- Component: src/components/SignatureVerificationModal.tsx
- Use lib/nostr.ts verifyEvent() function (already exists from Story 1.2)
- Display raw Nostr event structure for transparency
- Use shadcn/ui: Dialog, Code block, Badge

**References:** FR24, NFR-S1 (signature verification), UX Design transparency principle

---

### Story 6.3: Arweave Transaction Verification Modal

As a **user**,
I want **to verify Arweave transaction details for permanent storage**,
So that **I can confirm data is permanently stored with 200+ year guarantees**.

**Acceptance Criteria:**

**Given** Epic 3 Story 3.6 exists (basic Arweave links)
**When** I click "View on Arweave" or "Verify Permanence" on any content
**Then** An Arweave verification modal opens showing:
- Transaction ID (full, with copy button)
- Transaction hash (with verification checkmark)
- Block height and confirmations
- Storage size (bytes/KB/MB)
- Upload timestamp
- Storage guarantee: "Paid for 200+ years of permanent storage"
- Link to Arweave block explorer (opens in new tab)

**And** Transaction hash is verified against stored hash per NFR-S2

**And** The modal explains Arweave's economic endowment model simply:
- "This content was paid for upfront and will be stored permanently"
- "Arweave's economic model ensures 200+ year availability"

**And** A "Why is this permanent?" help section explains the mechanism

**And** For files, the modal includes a "Download from Arweave" button (direct gateway link)

**And** The modal is keyboard accessible

**And** Unit tests verify transaction display and hash verification

**Technical Implementation Notes:**
- Component: src/components/ArweaveVerificationModal.tsx
- Use lib/arweave.ts for transaction verification
- Fetch transaction metadata via ar.io SDK
- Use shadcn/ui: Dialog, Tabs (for basic/advanced views)

**References:** FR25, FR26, NFR-S2, UX Design "Trust Building" principle

---

### Story 6.4: ArNS Name Resolution Inspector

As a **user**,
I want **to see how ArNS names resolve to Arweave transaction IDs**,
So that **I understand the permanent naming layer and can verify the resolution**.

**Acceptance Criteria:**

**Given** Epic 1 includes ArNS integration (Story 1.3)
**When** I view any repository with an ArNS name (e.g., `owner.ar/repo`)
**Then** An ArNS information badge is displayed

**And** Clicking the badge opens an inspector modal showing:
- ArNS name (e.g., `owner.ar`)
- Resolved Arweave transaction ID
- Resolution timestamp
- TTL (time-to-live) for the mapping
- Undername structure (if applicable: `owner.ar/repo@v1.0`)

**And** The modal explains: "ArNS provides human-friendly permanent names that resolve to Arweave content addresses"

**And** A "Copy ArNS URL" button copies the full ArNS URL

**And** A "Copy Arweave TX ID" button copies the resolved transaction ID

**And** Resolution time is displayed (per NFR-I13: <2s resolution target)

**And** If resolution fails, a clear error message explains the issue

**And** Unit tests verify ArNS resolution display and copy functionality

**Technical Implementation Notes:**
- Component: src/components/ArNSInspector.tsx
- Use lib/arweave.ts → resolveArNS() function (from Story 1.3)
- Display resolution process transparently
- Use shadcn/ui: Dialog, Code display

**References:** FR27, NFR-I13 (ArNS resolution <2s), NFR-I14, NFR-I15

---

### Story 6.5: Permanent Citation Generator

As a **user**,
I want **to generate citation-ready permanent URLs in multiple formats**,
So that **I can cite code in academic papers, documentation, and references**.

**Acceptance Criteria:**

**Given** Epics 2-4 are complete (repositories, files, commits viewable)
**When** I click "Copy Permanent Link" or "Generate Citation" on any content (file, commit, issue)
**Then** A citation modal opens with multiple format options:
- **Plain URL**: `https://rig.ar-io.dev/owner/repo/blob/commit/file.ts`
- **ArNS URL**: `arns://owner.ar/repo/blob/commit/file.ts`
- **Arweave TX**: `https://arweave.net/[tx-id]`
- **BibTeX**: Formatted citation with ArNS URL + Arweave TX ID
- **APA**: Formatted academic citation
- **MLA**: Formatted academic citation

**And** Each format has a "Copy" button that copies to clipboard

**And** BibTeX format includes:
```bibtex
@misc{repo_name,
  title={Repository Name},
  author={Author NPub},
  year={2026},
  url={arns://owner.ar/repo},
  note={Permanent storage: Arweave TX abc123...}
}
```

**And** APA/MLA formats include both ArNS URL and Arweave TX ID for verification

**And** A timestamp shows when the citation was generated

**And** The modal explains: "These URLs are permanent and will work indefinitely"

**And** Copy confirmation is shown via toast notification

**And** Unit tests verify citation generation for all formats

**Technical Implementation Notes:**
- Component: src/components/CitationGenerator.tsx
- Utility: src/lib/citations.ts (format templates)
- Extract metadata (repo name, author, date, URLs) from context
- Use shadcn/ui: Dialog, Tabs (format selection), Button

**References:** FR29, UX Design "Citation-Friendly UX Innovation" opportunity

---

## Epic 7: User Education & Trust Building

**Goal:** Users understand why decentralization matters through integrated educational content.

### Story 7.1: Educational Tooltips Throughout UI

As a **user**,
I want **helpful tooltips explaining decentralization concepts as I encounter them**,
So that **I learn about Nostr, Arweave, and ILP naturally without leaving my workflow**.

**Acceptance Criteria:**

**Given** Epics 2-6 are complete (all UI features exist)
**When** I hover over or focus on decentralization-related terms/icons
**Then** Educational tooltips appear explaining the concept simply

**And** Tooltips are provided for key terms:
- "Nostr": "Decentralized protocol for relay-based data distribution"
- "Arweave": "Permanent storage blockchain with 200+ year guarantees"
- "ArNS": "Human-friendly permanent naming for Arweave content"
- "ILP": "Interledger Protocol for micropayments" (mentioned but read-only in MVP)
- "NIP-34": "Nostr protocol for git operations"
- "Kind 30617": "Repository announcement event type"
- "Relay": "Server that stores and distributes Nostr events"

**And** Tooltips include:
- Simple 1-sentence definition
- "Learn More" link to full documentation

**And** Tooltips are accessible:
- Triggered by hover or keyboard focus
- Screen reader compatible
- Dismissible with ESC key

**And** Tooltips don't obstruct important content

**And** Unit tests verify tooltip rendering and accessibility

**Technical Implementation Notes:**
- Component: src/components/EducationalTooltip.tsx (reusable)
- Use shadcn/ui: Tooltip component
- Create tooltip content dictionary in src/content/tooltips.ts
- Add tooltips to technical terms throughout UI

**References:** FR30, UX Design "Educational UX Without Friction" opportunity

---

### Story 7.2: Decentralization Status Indicators

As a **user**,
I want **visual indicators showing decentralization in action**,
So that **I can see the system working decentrally in real-time**.

**Acceptance Criteria:**

**Given** Epic 6 is complete (relay status and verification exist)
**When** I view any page in the application
**Then** Decentralization indicators are visible showing:
- "✓ Data from 4 of 5 relays" badge
- "Stored permanently on Arweave" icon for content
- "Real-time updates via Nostr" indicator when subscriptions active

**And** Loading states show decentralization working:
- "Connecting to 5 Nostr relays..." (not just "Loading...")
- "Querying relays: relay1 (45ms), relay2 (89ms), relay3 (102ms)..."
- "Fetching from Arweave..." with progress indicator

**And** Success states reinforce decentralization:
- "Loaded from 4 relays" confirmation message
- "Verified on Arweave" checkmark after content loads

**And** Visual consistency across all indicators (icons, colors, placement)

**And** Indicators are accessible via screen readers

**And** Unit tests verify indicator display logic

**Technical Implementation Notes:**
- Create indicator components in src/components/DecentralizationIndicators/
- Integrate with loading states throughout the application
- Use consistent iconography (relay icon, Arweave logo, checkmarks)
- Follow UX Design principle: "Performance delays tell a story"

**References:** FR31, UX Design "Transparency as Competitive Advantage"

---

### Story 7.3: Permanence and Censorship Resistance Explainers

As a **user**,
I want **clear explanations of why data is permanent and censorship-resistant**,
So that **I understand the value proposition and trust the system**.

**Acceptance Criteria:**

**Given** Epic 7 Stories 7.1-7.2 are complete (tooltips and indicators exist)
**When** I view the first repository or click "Learn More" links
**Then** An educational modal or page explains:
- **Permanence**: "Data stored on Arweave is paid for upfront and guaranteed for 200+ years"
- **Censorship Resistance**: "No single entity controls your data - it's distributed across multiple independent relays"
- **Multi-Relay Resilience**: "If some relays go down, others continue serving data"

**And** Real-world examples are provided:
- "Unlike GitHub, no company can suspend your account"
- "Unlike centralized hosting, domain seizures can't take down your code"
- "Arweave storage survives even if Rig the application disappears"

**And** Visual diagrams show:
- Multi-relay distribution diagram
- Arweave permanent storage timeline (200+ years)
- Comparison: Centralized (single server) vs Decentralized (multiple relays)

**And** The content is progressive:
- Simple overview for newcomers
- Technical details for advanced users (expandable sections)

**And** "Why This Matters" sections for each persona (Alex, Jordan, Sam, etc.)

**And** Unit tests verify content rendering and progressive disclosure

**Technical Implementation Notes:**
- Create educational content in src/content/education/
- Component: src/pages/LearnMore.tsx or modal
- Use markdown files for easy content updates
- Include diagrams/illustrations (SVG or images)

**References:** FR32, UX Design user personas and success moments

---

### Story 7.4: NIP-34 Technical Documentation

As a **user**,
I want **access to technical documentation about NIP-34 event structures**,
So that **I can understand how git operations work on Nostr and build derivative applications**.

**Acceptance Criteria:**

**Given** Epic 7 Stories 7.1-7.3 are complete
**When** I access the documentation page or click "Technical Docs" links
**Then** Comprehensive NIP-34 documentation is available showing:
- Overview of NIP-34 specification
- Event kind reference (30617, 1617, 1618, 1621, 1622, 1630-1633)
- Example events with JSON structure
- Tag structure explanations (d-tag, a-tag, e-tag for NIP-10 threading)
- How repositories are announced and discovered
- How issues/PRs/patches are structured

**And** Interactive examples allow viewing real events from the network

**And** Code snippets show how to:
- Query events using nostr-tools
- Parse and validate events
- Implement NIP-10 threading
- Integrate with Arweave for file storage

**And** Links to official NIP-34 specification on GitHub

**And** Search functionality within documentation

**And** Mobile-responsive documentation layout

**And** Unit tests verify documentation page rendering

**Technical Implementation Notes:**
- Create documentation pages in src/pages/docs/
- Use markdown files with syntax-highlighted code blocks
- Include interactive event inspector (shows real events)
- Link to external resources (NIP-34 spec, Nostr docs)

**References:** FR33, FR45 (developer ecosystem), UX Design Taylor persona needs

---

### Story 7.5: Frontend Hosting Information

As a **user**,
I want **information about how the Rig frontend itself is hosted on Arweave**,
So that **I understand the complete decentralization story including the application itself**.

**Acceptance Criteria:**

**Given** The application is deployed to Arweave (per Architecture deployment strategy)
**When** I view the About page or footer information
**Then** Hosting information is displayed explaining:
- "This application is hosted on Arweave permanent storage"
- Current version transaction ID (the Arweave TX hosting the frontend)
- "This means even Rig's interface is permanent and censorship-resistant"
- Instructions for accessing via ArNS: `arns://rig`

**And** A "View This App on Arweave" link points to the current version's Arweave transaction

**And** Version history shows previous deployments (if available)

**And** The footer displays: "Hosted permanently on Arweave | Version: [TX ID]"

**And** Explanation of progressive decentralization roadmap:
- "Current: Static hosting for development speed"
- "Future: Full IPFS + ArNS deployment for complete decentralization"

**And** "Powered by Crosstown Pattern" branding per UX Design requirements

**And** Unit tests verify information display

**Technical Implementation Notes:**
- Create About page in src/pages/About.tsx
- Store current version TX ID in environment variable (injected at build time)
- Display in footer component (from Epic 1 Story 1.7)
- Link to deployment documentation

**References:** FR34, Architecture.md deployment strategy, UX Design branding

---

## Epic 8: Performance & Offline Capability

**Goal:** Users can access repositories offline and experience fast, resilient performance.

### Story 8.1: Service Worker Implementation

As a **user**,
I want **the application to work offline after my first visit**,
So that **I can access previously viewed content without an internet connection**.

**Acceptance Criteria:**

**Given** Epic 1 is complete (project infrastructure exists)
**When** I visit the Rig application for the first time
**Then** A service worker is registered and caches the application shell:
- HTML entry point
- JavaScript bundles
- CSS stylesheets
- Static assets (icons, images)
- Web fonts

**And** On subsequent visits, the app loads from the service worker cache (fast initial load)

**And** When offline, the app shell loads successfully

**And** A "You're offline" indicator is displayed when network is unavailable

**And** Previously viewed content (repos, files, issues) loads from IndexedDB cache

**And** Service worker updates automatically when a new version is deployed

**And** Update notification prompts user: "New version available. Refresh to update?"

**And** Cache versioning prevents stale content issues

**And** The service worker meets NFR-P15 requirements

**And** Unit tests verify service worker registration and caching logic

**Technical Implementation Notes:**
- Create service worker: public/sw.js or use Vite PWA plugin
- Cache strategy: Network-first for data, cache-first for assets
- Integrate with IndexedDB cache (from Epic 1 Story 1.4)
- Use Workbox or implement custom service worker
- Test offline functionality with DevTools offline mode

**References:** FR35, NFR-P15, NFR-P16, NFR-I21 (Service Worker support)

---

### Story 8.2: Data Freshness Indicators

As a **user**,
I want **to see how fresh the data I'm viewing is**,
So that **I understand if I'm seeing cached data or live data from the network**.

**Acceptance Criteria:**

**Given** Epic 8 Story 8.1 is complete (caching exists)
**When** I view any cached content
**Then** Data freshness indicators are displayed showing:
- "Last updated 30 seconds ago from 4 of 5 relays"
- "Viewing cached data (offline)" when network unavailable
- "Updated just now" after fresh fetch

**And** Timestamps are relative for recent data:
- < 1 minute: "30 seconds ago"
- < 1 hour: "15 minutes ago"
- < 24 hours: "2 hours ago"
- Older: "2 days ago" or absolute date

**And** A "Refresh" button manually triggers refetch

**And** Visual indicators distinguish:
- Fresh data (green checkmark)
- Stale but acceptable data (yellow clock icon)
- Offline cached data (gray cloud-off icon)

**And** Tooltips explain: "Data is cached for fast loading. Click refresh for latest updates."

**And** Freshness indicators are accessible via screen readers

**And** Unit tests verify timestamp calculation and indicator display

**Technical Implementation Notes:**
- Component: src/components/DataFreshnessIndicator.tsx
- Use TanStack Query metadata (dataUpdatedAt) for timestamps
- Integrate with useOnlineStatus hook
- Display prominently but non-intrusively

**References:** FR36, NFR-R10, UX Design "Performance Perception Management"

---

### Story 8.3: Offline Cache Access

As a **user**,
I want **to access previously viewed content when offline**,
So that **I can browse repositories without an internet connection**.

**Acceptance Criteria:**

**Given** Epic 8 Stories 8.1-8.2 are complete
**When** I go offline (network disconnected)
**Then** The application continues functioning with cached data:
- Repository lists show cached repositories
- File content shows cached files
- Issues/PRs show cached discussions
- Commit history shows cached commits

**And** An "Offline Mode" banner is displayed at the top of the page:
- "You're offline. Viewing 12 cached repositories."
- Dismissible with X button
- Persists across page navigation

**And** Actions that require network are disabled or show warnings:
- Real-time updates paused (WebSocket subscriptions closed)
- "Cannot fetch new data while offline" messages

**And** When network returns, the app automatically:
- Removes offline banner
- Re-establishes WebSocket connections
- Refetches stale data
- Shows "Back online" toast notification

**And** Offline experience meets NFR-R5 requirements

**And** Unit tests verify offline mode detection and cached data access

**Technical Implementation Notes:**
- Hook: src/hooks/useOnlineStatus.ts (navigator.onLine + event listeners)
- Component: src/components/OfflineBanner.tsx
- Integrate with TanStack Query (pauseQuery when offline)
- Test with DevTools offline simulation

**References:** FR37, NFR-R5, UX Design "Offline Capability = Competitive Advantage"

---

### Story 8.4: Progressive Loading States

As a **user**,
I want **to see meaningful loading states that explain what's happening**,
So that **I understand the decentralized data fetching process and don't think the app is broken**.

**Acceptance Criteria:**

**Given** All previous epics are complete
**When** Any data is being fetched from Nostr relays or Arweave
**Then** Progressive loading states are displayed showing:
- "Connecting to Nostr relays..." (initial connection)
- "Querying 5 relays..." (during query)
- "Relay 1 responded (45ms), Relay 2 responded (89ms)..." (as responses arrive)
- "Fetching from Arweave..." (when retrieving files)
- "Loading complete - Verified on 4 of 5 relays" (success)

**And** Loading skeletons match the content being loaded:
- Repository cards → card skeletons
- File content → code editor skeleton
- Issue list → list item skeletons

**And** Never show generic "Loading..." spinners

**And** Loading states are accessible:
- aria-live regions announce progress to screen readers
- Loading text is descriptive

**And** Timeout handling shows helpful messages:
- "Taking longer than usual... still trying 2 relays"
- Option to "Cancel and use cached data"

**And** Unit tests verify loading state display and progression

**Technical Implementation Notes:**
- Create loading state components in src/components/LoadingStates/
- Use shadcn/ui: Skeleton components
- Integrate with relay status tracking for detailed progress
- Follow UX Design principle: "Performance delays tell a story"

**References:** FR38, UX Design "Performance Delays Must Tell a Story" principle

---

### Story 8.5: Graceful Degradation on Relay Failures

As a **user**,
I want **the application to continue working even when some relays fail**,
So that **I can still browse repositories despite infrastructure problems**.

**Acceptance Criteria:**

**Given** Epic 8 Stories 8.1-8.4 are complete
**When** Some Nostr relays fail or timeout (but at least 1 succeeds)
**Then** The application continues functioning normally

**And** A subtle notification explains the situation:
- "Loaded from 2 of 5 relays (3 unavailable)"
- "Some relays timed out, but data loaded successfully"

**And** The relay status badge shows the degraded state (yellow warning color)

**And** A "Retry Failed Relays" button allows manual retry

**And** Automatic retry occurs in the background after 30 seconds

**And** If ALL relays fail:
- Cached data is shown (if available)
- Clear error message: "Unable to connect to Nostr relays. Showing cached data."
- "Retry" button to attempt reconnection

**And** User workflows are never blocked by relay failures per NFR-R7

**And** Error messages are user-friendly, not technical (no "ERR_TIMEOUT" messages)

**And** Unit tests verify degradation scenarios (1/5, 2/5, 0/5 relays working)

**Technical Implementation Notes:**
- Enhance error handling in lib/nostr.ts
- Accept partial results (any relay succeeds = success)
- Display relay failure reasons in expandable section (technical users)
- Use shadcn/ui: Toast, Alert components

**References:** FR39, NFR-R3, NFR-R6, NFR-R7, UX Design "Errors Are Learning Opportunities"

---

## Epic 9: Accessibility & Universal Design

**Goal:** All users can access Rig regardless of ability, device, or assistive technology.

### Story 9.1: Complete Keyboard Navigation

As a **user**,
I want **to navigate the entire application using only my keyboard**,
So that **I can use Rig without a mouse or trackpad**.

**Acceptance Criteria:**

**Given** All previous epics are complete (full UI exists)
**When** I use only keyboard for navigation
**Then** All interactive elements are accessible via Tab key:
- Navigation links
- Buttons
- Form inputs
- Dropdowns/selects
- Expandable sections
- Modal dialogs

**And** Tab order follows logical visual flow (left-to-right, top-to-bottom)

**And** All focusable elements have visible focus indicators (2px solid border per NFR-A3)

**And** Keyboard shortcuts work throughout the app:
- `/` focuses search input
- `?` shows keyboard shortcuts help
- `Esc` closes modals/dropdowns
- Arrow keys navigate lists/trees
- `Enter` activates buttons/links

**And** Focus is trapped within modal dialogs (Tab cycles within modal)

**And** Focus returns to trigger element when modal closes

**And** Skip links allow jumping to main content ("Skip to main content")

**And** No keyboard traps (focus can always escape)

**And** Manual testing confirms keyboard-only navigation for all core user journeys

**Technical Implementation Notes:**
- Audit all components for tabIndex and focus management
- Implement focus trap for modals (focus-trap-react library)
- Add skip links to layout components (Epic 1 Story 1.7)
- Test with keyboard only (unplug mouse during testing)
- Document keyboard shortcuts in Help page

**References:** FR40, NFR-A1, NFR-A2, NFR-A3, NFR-A4

---

### Story 9.2: Screen Reader Optimization

As a **user who relies on screen readers**,
I want **all content and functionality accessible via screen reader**,
So that **I can use Rig effectively with assistive technology**.

**Acceptance Criteria:**

**Given** All previous epics are complete
**When** I use a screen reader (VoiceOver, NVDA, JAWS)
**Then** All content is properly announced:
- Semantic HTML elements (header, nav, main, aside, footer)
- Proper heading hierarchy (h1 → h2 → h3, no skipped levels)
- Lists use ul/ol elements
- Tables have proper headers

**And** All interactive elements have descriptive labels:
- Buttons: "Copy transaction ID" not just "Copy"
- Links: "View repository [name]" not just "View"
- Form inputs: Associated label elements

**And** ARIA attributes enhance understanding:
- aria-label for icon-only buttons
- aria-labelledby for complex components
- aria-describedby for help text
- aria-live regions for dynamic updates ("New comment added")

**And** Images have descriptive alt text per NFR-A8

**And** Loading states are announced: "Loading repositories from Nostr relays"

**And** Status changes are announced: "Repository loaded successfully"

**And** Screen reader testing passes on:
- VoiceOver (Safari, macOS/iOS)
- NVDA (Firefox, Windows)
- JAWS (Chrome, Windows)

**Technical Implementation Notes:**
- Audit all components for semantic HTML and ARIA
- Add aria-live regions for dynamic content
- Use shadcn/ui components (already accessible)
- Test with actual screen readers per NFR-A18

**References:** FR41, NFR-A5, NFR-A6, NFR-A7, NFR-A8, NFR-A18

---

### Story 9.3: Mobile-Responsive Touch Optimization

As a **mobile user**,
I want **the application optimized for touch interaction**,
So that **I can browse repositories comfortably on my phone or tablet**.

**Acceptance Criteria:**

**Given** All previous epics are complete
**When** I access Rig on a mobile device (320px to 767px width)
**Then** The layout is fully responsive:
- Single column layout on mobile
- Collapsible navigation (hamburger menu)
- Collapsible file tree (toggle button)
- Stacked content (no side-by-side)

**And** All touch targets are minimum 44x44px per NFR-A13:
- Buttons
- Links
- Icon buttons
- Expandable sections
- List items

**And** Touch gestures work intuitively:
- Tap to select
- Swipe to scroll
- Pull-to-refresh for lists (optional)
- Double-tap to zoom on code

**And** No horizontal scrolling required (except code viewer with long lines)

**And** Font sizes are readable (minimum 16px body text per NFR-A11)

**And** Form inputs use appropriate mobile keyboards:
- text for search
- email for email inputs (if any)
- url for URL inputs

**And** Mobile-specific optimizations:
- Sticky headers on scroll
- Bottom-sheet modals (easier to reach)
- Compact layouts for small screens

**And** Testing on real devices confirms usability:
- iPhone SE (320px width)
- iPhone 12 (390px width)
- iPad (768px width)
- Android phones (various sizes)

**Technical Implementation Notes:**
- Use responsive Tailwind classes throughout
- Test on real devices and simulators
- Implement mobile-specific components where needed
- Follow mobile-first design approach

**References:** FR42, NFR-A13, NFR-A14, NFR-A11, Architecture.md responsive breakpoints

---

### Story 9.4: Zoom and Text Scaling Support

As a **user with vision impairment**,
I want **the application to work at 200% browser zoom**,
So that **I can read content comfortably at my preferred text size**.

**Acceptance Criteria:**

**Given** All previous epics are complete
**When** I zoom the browser to 200% (Cmd/Ctrl + +)
**Then** The layout remains functional:
- No horizontal scrolling (unless code with long lines)
- No overlapping text
- No truncated content
- No broken layouts

**And** Text remains readable and properly spaced

**And** Interactive elements remain accessible and clickable

**And** Responsive breakpoints adjust appropriately:
- Desktop layout may switch to tablet layout at 200% zoom
- Tablet layout may switch to mobile layout at 200% zoom

**And** All content is accessible (no information hidden by zoom)

**And** Relative units (rem, em, %) are used for sizing per NFR-A11

**And** Testing confirms 200% zoom works on:
- All major pages (home, repo detail, file viewer, issue list)
- All interactive components (modals, dropdowns, forms)

**And** Lighthouse accessibility audit passes zoom requirements

**Technical Implementation Notes:**
- Use rem/em units instead of px for text sizing
- Use flexible layouts (flexbox, grid) that adapt to content size
- Avoid fixed widths where possible
- Test at 200% zoom on all major pages

**References:** FR43, NFR-A11, NFR-A12, WCAG 2.1 Level AA zoom requirements

---

### Story 9.5: Color-Independent Information Design

As a **colorblind user**,
I want **information conveyed through means other than color alone**,
So that **I can understand all content regardless of my color perception**.

**Acceptance Criteria:**

**Given** All previous epics are complete
**When** I view any content that uses color to convey meaning
**Then** Additional indicators are present:
- Diff viewer: Green/red background PLUS +/- symbols (per NFR-A10)
- Status badges: Color PLUS icons (✓ for success, ✗ for error, etc.)
- Relay status: Green/yellow/red PLUS "Connected"/"Connecting"/"Disconnected" text
- Charts/graphs: Colors PLUS patterns/textures

**And** Color contrast meets WCAG AA requirements per NFR-A9:
- Normal text: ≥4.5:1 contrast ratio
- Large text (18px+ or 14px+ bold): ≥3:1 contrast ratio
- Interactive elements: ≥3:1 contrast ratio

**And** Focus indicators use outline/border, not just color change

**And** Links are distinguishable from text by underline, not just color

**And** Testing with colorblind simulation tools confirms usability

**And** Lighthouse accessibility audit confirms contrast ratios

**Technical Implementation Notes:**
- Add symbols to all color-coded UI elements
- Use icon + color combinations
- Test with Chrome DevTools colorblind simulation
- Run contrast checks on all text/background combinations

**References:** FR44, NFR-A9, NFR-A10, WCAG 2.1 Level AA color requirements

---

### Story 9.6: Accessibility Testing and Compliance

As a **developer**,
I want **automated and manual accessibility testing integrated into the development workflow**,
So that **we maintain WCAG 2.1 Level AA compliance continuously**.

**Acceptance Criteria:**

**Given** All previous Epic 9 stories are complete
**When** The application is built or deployed
**Then** Automated accessibility tests run:
- Lighthouse accessibility audit (CI/CD pipeline)
- Minimum score: 90 per NFR-A16
- Build fails if score drops below threshold

**And** Manual testing is conducted per NFR-A17:
- Keyboard-only navigation for all core user journeys
- Test on Windows, macOS, Linux

**And** Screen reader testing is conducted per NFR-A18:
- VoiceOver on Safari (macOS, iOS)
- NVDA on Firefox (Windows)
- JAWS on Chrome (Windows)

**And** Accessibility checklist is completed for each release:
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes
- [ ] Zoom to 200% works
- [ ] Touch targets ≥44px
- [ ] No keyboard traps
- [ ] Skip links present
- [ ] Semantic HTML used
- [ ] ARIA labels correct

**And** Accessibility issues are tracked and prioritized

**And** Documentation includes accessibility compliance statement

**Technical Implementation Notes:**
- Add Lighthouse CI to GitHub Actions
- Create accessibility testing checklist document
- Schedule regular manual testing sessions
- Document testing procedures in CONTRIBUTING.md

**References:** NFR-A16, NFR-A17, NFR-A18, WCAG 2.1 Level AA compliance

---

## Epic 10: Developer Experience & Ecosystem Integration

**Goal:** Developers can inspect internals, understand architecture, and build derivative applications.

### Story 10.1: NIP-34 Event Inspector (DevTools)

As a **developer**,
I want **to inspect raw NIP-34 events in my browser DevTools**,
So that **I can understand the event structure and debug issues**.

**Acceptance Criteria:**

**Given** All previous epics are complete (full application working)
**When** I open browser DevTools and enable the Rig DevTools panel
**Then** A "Rig Events" tab appears in DevTools showing:
- List of all Nostr events received (kinds 30617, 1617, 1618, 1621, 1622, etc.)
- Event details: kind, id, pubkey, created_at, tags, content
- Formatted JSON view of raw event
- Signature verification status

**And** Events are filterable by:
- Event kind (dropdown)
- Author pubkey (search)
- Timestamp range
- Verification status (valid/invalid)

**And** Clicking an event shows detailed view:
- Full event JSON (syntax highlighted)
- Parsed tag structure (human-readable)
- Which relay(s) provided this event
- Timestamp and relative time

**And** A "Copy Event JSON" button copies the raw event

**And** An "Export Events" button exports filtered events as JSON file

**And** The DevTools panel explains: "This inspector shows raw NIP-34 git events from Nostr relays"

**And** Unit tests verify event inspector UI and filtering

**Technical Implementation Notes:**
- Create DevTools panel using browser extension or in-page panel
- Hook into Nostr service to capture all events
- Component: src/components/DevTools/EventInspector.tsx
- Toggle panel with keyboard shortcut (Ctrl+Shift+D)
- Only show in development or when enabled in settings

**References:** FR45, UX Design Taylor persona (ecosystem builder needs)

---

### Story 10.2: Architecture Documentation and Patterns

As a **developer**,
I want **comprehensive architecture documentation**,
So that **I can understand how Rig works and replicate patterns for my own projects**.

**Acceptance Criteria:**

**Given** The application is fully implemented
**When** I access the architecture documentation
**Then** Complete documentation is available covering:
- Three-layer architecture overview (Nostr + ArNS + Arweave)
- Nostr relay connection strategy (multi-relay racing)
- Arweave gateway integration (Wayfinder SDK)
- Caching strategy (hybrid TTL policies)
- Real-time subscriptions (WebSocket lifecycle)
- Service layer architecture (transformation pattern)
- Type definitions and validation (Zod schemas)
- Error handling (layered approach)

**And** Code examples are provided for key patterns:
- Querying Nostr events with nostr-tools
- Fetching files from Arweave
- Implementing real-time subscriptions
- Transforming events to domain models
- Handling relay failures gracefully

**And** Architecture diagrams illustrate:
- Data flow (User → Component → Hook → Service → Nostr/Arweave)
- Multi-relay query racing
- Cache hierarchy (Service Worker → IndexedDB → Nostr/Arweave)

**And** Links to source code on GitHub for reference implementation

**And** Documentation is searchable and mobile-responsive

**And** "Reusable Patterns" section highlights code ready for copy-paste

**Technical Implementation Notes:**
- Create docs site in src/pages/docs/architecture/
- Include architecture.md content from Epic 1
- Add interactive diagrams (Mermaid or similar)
- Provide code snippets with syntax highlighting
- Link to actual implementation files on GitHub

**References:** FR46, UX Design Taylor persona, Crosstown pattern validation

---

### Story 10.3: Relay Query and Arweave Retrieval Pattern Guides

As a **developer**,
I want **detailed guides for relay querying and Arweave retrieval patterns**,
So that **I can implement similar functionality in my own applications**.

**Acceptance Criteria:**

**Given** Story 10.2 is complete (architecture docs exist)
**When** I access the pattern guides
**Then** Comprehensive guides are available for:

**Relay Query Patterns:**
- Multi-relay setup and connection
- Event filter construction for NIP-34
- Racing queries across relays
- Handling timeouts and failures
- Deduplicating events from multiple relays
- Signature verification workflow
- Real-time subscriptions and lifecycle

**Arweave Retrieval Patterns:**
- ar.io gateway selection with Wayfinder
- Manifest fetching and parsing
- File retrieval from transaction IDs
- ArNS name resolution
- Gateway failover strategy
- Transaction verification

**And** Each pattern includes:
- Problem statement ("Why this pattern?")
- Implementation code (copy-paste ready)
- Error handling examples
- Performance considerations
- Testing approaches

**And** Live code sandboxes demonstrate patterns (CodeSandbox or similar)

**And** "Common Pitfalls" sections warn about mistakes

**And** Links to relevant NIP specifications and Arweave docs

**Technical Implementation Notes:**
- Create pattern guide pages in src/pages/docs/patterns/
- Extract reusable code from lib/nostr.ts and lib/arweave.ts
- Add extensive code comments
- Create runnable examples (minimal reproductions)

**References:** FR47, UX Design ecosystem multiplication goal

---

### Story 10.4: Permanent ArNS URL Sharing

As a **user**,
I want **to easily share permanent ArNS URLs**,
So that **others can access the same content indefinitely**.

**Acceptance Criteria:**

**Given** All previous epics are complete
**When** I view any content (repository, file, commit, issue)
**Then** A "Share" button is prominently displayed

**And** Clicking "Share" opens a modal with:
- Current page URL (rig.ar-io.dev/owner/repo/...)
- ArNS permanent URL (arns://owner.ar/repo/...)
- Arweave transaction URL (arweave.net/[tx-id])
- Social media sharing buttons (Twitter, Reddit, Telegram)

**And** Each URL has a "Copy" button

**And** A QR code is generated for mobile sharing

**And** OpenGraph meta tags are optimized for rich previews:
- og:title with repository/content name
- og:description with summary
- og:image with preview (repository icon or code snippet)
- og:url with permanent ArNS URL

**And** Twitter Card meta tags provide rich Twitter previews

**And** Copied URLs include context: "Rig - Decentralized Git Hosting: [repo name]"

**And** Unit tests verify URL generation and social meta tags

**Technical Implementation Notes:**
- Component: src/components/ShareModal.tsx
- Generate QR codes with qrcode library
- Add OpenGraph and Twitter Card meta tags in index.html and per-page
- Use shadcn/ui: Dialog, Button components

**References:** FR48, Epic 6 Story 6.5 (citation generator pattern)

---

### Story 10.5: Powered by Crosstown Branding and Ecosystem Links

As a **visitor**,
I want **to learn about the Crosstown pattern and ecosystem**,
So that **I understand Rig is part of a larger decentralized infrastructure movement**.

**Acceptance Criteria:**

**Given** The application is complete
**When** I view any page in Rig
**Then** "Powered by Crosstown Pattern" branding is displayed in the footer

**And** Clicking the branding opens an explainer:
- What is the Crosstown pattern?
- How Rig demonstrates the pattern
- Other applications using the pattern
- Links to Crosstown/Connector documentation

**And** Footer includes ecosystem links:
- Nostr protocol website
- Arweave network website
- ar.io gateway network
- ILP (Interledger Protocol) website
- NIP-34 specification on GitHub

**And** Community links are provided:
- Rig GitHub repository (source code)
- Community Discord/Telegram
- Developer documentation
- Report issues / feedback

**And** About page includes:
- Rig's role in validating the Crosstown pattern
- "First major application proving the pattern scales"
- Vision for ecosystem growth

**And** All links open in new tabs with proper security attributes

**Technical Implementation Notes:**
- Enhance footer component from Epic 1 Story 1.7
- Create About page (src/pages/About.tsx)
- Add Crosstown explainer modal
- Link to external ecosystem resources

**References:** UX Design "Powered by Crosstown Pattern" branding, ecosystem proof goal
