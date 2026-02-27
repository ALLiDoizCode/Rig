# Product Scope

## MVP - Minimum Viable Product (Frontend Read-Only)

**Core Functionality:**
- **Repository Discovery**: Browse repositories announced via kind 30617 events
- **Repository View**: Display repo metadata (name, description, maintainers, ArNS URL)
- **Commit History**: List commits from kind 1617 patch events, show commit details
- **File Browsing**: Navigate file tree, view file contents retrieved from Arweave
- **Issue Browsing**: Display issues from kind 1621 events, show issue details and comments
- **PR Browsing**: Display pull requests from kind 1618 events, show PR status and discussion

**Frontend Infrastructure:**
- React + TypeScript + Vite starter template
- shadcn/ui component library for consistent design
- nostr-tools for relay connections and event queries
- Arweave client for retrieving git objects via ar.io gateways
- ArNS resolver for name → transaction ID mapping

**User Experience:**
- Clean, GitHub-like interface (familiar patterns)
- Loading states for decentralized data fetching
- Error messaging when relays/gateways are unavailable
- Mobile-responsive design

**Out of Scope for MVP:**
- **Write operations**: No publishing events, no ILP payment integration (read-only demo)
- **Authentication**: No Nostr login required for browsing public repos
- **Search**: No full-text search (basic client-side filtering only)
- **Real-time updates**: No WebSocket subscriptions (polling or manual refresh)

## Growth Features (Post-MVP)

**Enhanced Browsing:**
- Full-text search across repository metadata
- Advanced filtering (by language, activity, maintainer)
- Real-time event subscriptions via WebSocket
- Bookmark/favorite repositories (localStorage)

**Write Capabilities (Crosstown Integration):**
- Nostr authentication (NIP-07 browser extension)
- Publish new repositories via Crosstown/Connector
- Submit issues and PR comments with ILP micropayments
- Repository forking (publish fork announcement event)

**Performance Optimizations:**
- Service worker for offline browsing
- Event caching and optimistic updates
- Parallel relay queries with race conditions
- CDN-backed Arweave gateway selection

**Developer Experience:**
- Public API for querying Rig's indexed data
- Embeddable widgets for displaying repo stats
- Browser extension for quick ArNS lookups
- Developer documentation and integration guides

## Vision (Future)

**Full Decentralized Git Workflow:**
- Git CLI integration: `git clone arns://myrepo` support
- Local git client that reads/writes to Nostr/Arweave
- Automated repository mirroring from GitHub
- Decentralized CI/CD pipeline integration

**Ecosystem Expansion:**
- Mobile apps (React Native) for repository browsing
- Desktop app (Electron) with full git client
- IDE extensions (VS Code) for browsing Arweave-backed code
- Integration with other NIP-34 clients

**Advanced Features:**
- Encrypted private repositories (NIP-04/NIP-44)
- Code review workflows with cryptographic signatures
- Dependency graph visualization across Nostr ecosystem
- Reputation system for maintainers (web of trust)

**Crosstown Pattern Validation:**
- Reference implementation for other Crosstown applications
- Reusable component library for Nostr/Arweave apps
- Best practices documentation for ILP-gated relay integration
- Case studies proving economic sustainability model
