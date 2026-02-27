# Project Scoping & Phased Development

## MVP Strategy & Philosophy

**MVP Approach: Proof-of-Concept + Experience MVP**

Rig's MVP serves dual purposes:
1. **Proof-of-Concept**: Validate that the Crosstown pattern (ILP-gated Nostr relays) works for complex applications
2. **Experience MVP**: Demonstrate that decentralized UX can match centralized expectations

**Strategic Rationale:**
- **Primary Goal**: Prove the pattern works → Read-only browsing is sufficient
- **Secondary Goal**: Attract ecosystem builders → Must be polished, fast, delightful
- **Decentralization First**: Frontend hosted on Arweave from day 1 (via ArDrive subsidized uploads)
- **Risk Mitigation**: Avoid write complexity initially → Crosstown/Connector handles writes separately

**MVP Timeline: 3 Months**
- Month 1: Core infrastructure (relay queries, Arweave retrieval, basic UI)
- Month 2: Full browsing (commits, files, issues, PRs)
- Month 3: Polish, performance optimization, beta launch with Arweave-hosted frontend

**Resource Requirements:**
- **Team Size**: 1-2 frontend developers (can be solo with AI assistance)
- **Skills Needed**: React/TypeScript, Nostr protocol understanding, Arweave basics
- **Infrastructure**:
  - **Development**: Local Vite dev server
  - **Production**: Arweave hosting via ArDrive (subsidized uploads under size threshold)
  - **Data Sources**: ar.io gateways (public), Nostr relays (public)
  - **Naming**: ArNS for permanent frontend URL (`arns://rig`)

## MVP Feature Set (Phase 1: Months 1-3)

**Core User Journeys Supported:**

**Primary Journeys:**
1. **Alex (OSS Maintainer)** - Full support: Browse repos, verify permanence, check multi-relay consistency
2. **Sam (Archivist)** - Full support: Verify Arweave storage, export citation-ready URLs
3. **Anonymous Visitor** - Full support: Zero-friction browsing, educational content

**Partial Support:**
4. **Jordan (Contributor)** - Read-only support: Can browse PRs/patches but can't submit (write feature deferred)
5. **Casey (Web3 Dev)** - Partial support: Can explore NIP-34 events and architecture, write integration deferred
6. **Taylor (Ecosystem Builder)** - Full support: Well-documented codebase for pattern replication

**Must-Have Capabilities:**

**Repository Discovery & Browsing:**
- Browse repositories announced via kind 30617 events from configured Nostr relays
- Display repo metadata (name, description, maintainers, ArNS URL)
- Search/filter repositories by name (client-side only, no backend)

**Commit History:**
- List commits from kind 1617 patch events
- Display commit details (author, message, timestamp, Nostr event ID)
- Show commit diff with syntax highlighting

**File Browsing:**
- Navigate file tree structure
- View file contents retrieved from Arweave (syntax highlighting for code files)
- Display "View on Arweave" link for verification

**Issue & PR Browsing:**
- Display issues from kind 1621 events with status, comments
- Display pull requests from kind 1618 events with discussion threads
- Threading via NIP-10 references (reply chains)

**Decentralization Transparency:**
- Show relay connection status (connected to X/5 relays)
- Display Arweave transaction IDs for verification
- "Learn More" educational content explaining Nostr/Arweave/ILP
- **Fully decentralized frontend**: "This app is hosted on Arweave, accessible forever"

**Performance & Reliability:**
- Multi-relay querying with <3s P95 page loads
- Service worker caching for offline browsing
- Graceful degradation when relays/gateways fail
- **Bundle size optimization**: Stay under ArDrive subsidy threshold for free hosting

**Frontend Infrastructure:**
- React + TypeScript + Vite + shadcn/ui
- Mobile-responsive design (320px+)
- WCAG 2.1 AA accessibility compliance
- **Arweave-hosted frontend**: Deployed via ArDrive, accessible via ArNS (`arns://rig`)

**Explicitly Out of Scope for MVP:**
- ❌ Write operations (publishing repos, submitting issues/PRs/comments)
- ❌ Nostr authentication (read-only works without auth)
- ❌ Full-text search (just client-side filtering)
- ❌ Real-time updates (manual refresh only)
- ❌ Encrypted private repositories
- ❌ Repository forking/mirroring automation

## Post-MVP Features

**Phase 2: Growth Features (Months 4-6)**

**Write Capabilities via Crosstown Integration:**
- Nostr authentication (NIP-07 browser extension support)
- Publish new repositories with ILP micropayment
- Submit issues and PR comments (paid via Crosstown/Connector)
- Cost transparency UI ("This operation costs ~10 sats")

**Enhanced Browsing:**
- Full-text search across repository metadata and file contents
- Advanced filtering (by language, activity, maintainer, date range)
- Real-time event subscriptions via WebSocket (live updates for commits/issues)
- Bookmark/favorite repositories (localStorage, future: Nostr list events)

**Performance Optimizations:**
- Aggressive service worker caching strategies
- Parallel relay queries with smarter race conditions
- CDN-backed Arweave gateway selection
- Prefetching for likely user navigation paths

**Developer Experience:**
- Public API for querying Rig's indexed repository data
- Embeddable widgets for displaying repo stats
- Browser extension for quick ArNS lookups from any page

**Deployment Automation:**
- Automated ArDrive upload pipeline (GitHub Actions on release)
- ArNS update automation (point to new Arweave TX)
- Version management (multiple ArNS names for stable/beta/dev)

**Phase 3: Vision Features (Months 7-12+)**

**Full Decentralized Git Workflow:**
- Git CLI integration: `git clone arns://myrepo` support (custom git remote helper)
- Local git client that reads/writes directly to Nostr/Arweave
- Automated repository mirroring from GitHub (push to both)
- Decentralized CI/CD pipeline integration

**Ecosystem Expansion:**
- Mobile apps (React Native) for repository browsing on iOS/Android
- Desktop app (Electron/Tauri) with full git client capabilities
- IDE extensions (VS Code, JetBrains) for browsing Arweave-backed code inline
- Integration with other NIP-34 clients (data interoperability)

**Advanced Features:**
- Encrypted private repositories (NIP-04/NIP-44 for metadata, Arweave encryption for content)
- Code review workflows with cryptographic signatures and web of trust
- Dependency graph visualization across Nostr ecosystem
- Reputation system for maintainers (Nostr-native trust metrics)

**Crosstown Pattern Validation:**
- Reference implementation documentation for other apps
- Reusable component library (@rig/nostr-components, @rig/arweave-components)
- Best practices guides for ILP-gated relay integration
- Case studies proving economic sustainability model

## Risk Mitigation Strategy

**Technical Risks:**

**Risk: Bundle size exceeds ArDrive subsidy threshold**
- **Mitigation**: Aggressive code splitting, tree shaking, minimal dependencies
- **Monitoring**: Track bundle size in CI/CD, alert if approaching threshold
- **Contingency**: Pay for Arweave upload (still decentralized) or split into micro-frontends

**Risk: Multi-relay performance <3s fails**
- **Mitigation**: Aggressive parallel queries, optimistic UI, show cached data immediately
- **Contingency**: Accept 5s loads, market to users who prioritize censorship resistance

**Risk: Arweave data retrieval unreliable**
- **Mitigation**: Multi-gateway fallback (query 3+ ar.io gateways)
- **Contingency**: Direct Arweave node option for power users

**Risk: Nostr relay centralization (only 2-3 carry NIP-34)**
- **Mitigation**: Document relay setup, partner with existing relay operators
- **Contingency**: Run dedicated Rig relay if ecosystem doesn't provide coverage

**Risk: ArDrive subsidy program ends or changes terms**
- **Mitigation**: Design for minimal bundle size from day 1
- **Contingency**: Direct Arweave upload (paid but still decentralized)

**Market Risks:**

**Risk: Developers don't adopt (ecosystem proof fails)**
- **Validation**: Track GitHub forks, blog citations, derivative projects
- **Pivot**: Even if pattern doesn't generalize, Rig is still valuable as decentralized git

**Risk: Users demand write features immediately**
- **Validation**: User surveys during beta
- **Mitigation**: Prioritize Phase 2 write features if demand is high

**Risk: Regulatory crackdown**
- **Benefit of Arweave Hosting**: No server to seize, no domain to block
- **Contingency**: Provide Tor/I2P access guides, multiple ArNS mirror names

**Resource Risks:**

**Risk: Solo developer only**
- **Minimum Viable Team**: 1 developer + AI assistance
- **Infrastructure Advantage**: Arweave hosting costs nothing (subsidized), no ops overhead

**Risk: Crosstown/Connector infrastructure not ready**
- **MVP Independence**: Read-only MVP doesn't depend on Crosstown
- **Alternative**: Manual write workflows (users publish via CLI, Rig displays)

**Deployment & Operations Risks:**

**Risk: ArNS name management complexity**
- **Mitigation**: Document ArNS update process, automate where possible
- **Contingency**: Use simple versioning (arns://rig-v1, arns://rig-v2)

**Risk: Frontend updates require new Arweave uploads**
- **Trade-off Acceptance**: Immutability means no hot-patches
- **User Benefit**: Users can pin specific versions

**Development Workflow:**
1. **Local Development**: `npm run dev` (Vite dev server)
2. **Build**: `npm run build` (check size vs ArDrive threshold)
3. **Upload**: ArDrive upload (subsidized if under threshold)
4. **Update ArNS**: Point `arns://rig` to new Arweave TX
5. **Verify**: Test via `arns://rig`
