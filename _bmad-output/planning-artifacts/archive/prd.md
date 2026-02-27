---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments:
  - '/Users/jonathangreen/Documents/Rig/docs/PRD-NIP34-Decentralized-Forgejo.md'
  - '/Users/jonathangreen/Documents/Rig/docs/PRD-CHANGES-SUMMARY.md'
  - '/Users/jonathangreen/Documents/Rig/docs/NIP34-EVENT-REFERENCE.md'
  - '/Users/jonathangreen/Documents/Rig/_bmad-output/planning-artifacts/architecture.md'
workflowType: 'prd'
project_name: 'Rig'
user_name: 'Jonathan'
date: '2026-02-24'
briefCount: 0
researchCount: 0
brainstormingCount: 0
projectDocsCount: 4
classification:
  projectType: 'web_app'
  domain: 'blockchain_web3'
  complexity: 'high'
  projectContext: 'brownfield'
---

# Product Requirements Document - Rig

**Author:** Jonathan
**Date:** 2026-02-24

## Executive Summary

Rig is a React-based frontend application that demonstrates decentralized git hosting using the Crosstown ecosystem pattern. It targets Web3/Nostr ecosystem developers who need decentralized, censorship-resistant code collaboration without relying on centralized platforms like GitHub or GitLab.

The application provides a read-only interface to git repositories stored across a three-layer decentralized architecture: **Nostr** relays for metadata and event coordination (NIP-34), **Arweave** for permanent storage of git objects, and **ArNS** for human-friendly repository naming. Users can browse repositories, view commits, explore pull requests, and track issues—all sourced from decentralized infrastructure.

Rig solves the critical problem of git hosting platform centralization and censorship risk. Developers lose access to code, history, and collaboration tools when platforms ban accounts or repositories. Rig eliminates this single point of failure by distributing repository data across censorship-resistant networks while maintaining familiar git workflows.

The frontend demonstrates the Crosstown pattern: **free peer-to-peer reads** via nostr-tools querying multiple relays, and **paid ILP-gated writes** through Crosstown/Connector infrastructure. This proves that complex, production-grade applications can be built on ILP-gated Nostr relays as the universal decentralized database—the core Crosstown ecosystem vision.

### What Makes This Special

**Rig is the first major application proving the Crosstown ecosystem pattern scales to production complexity.** While Nostr has demonstrated success for social media, Rig validates that ILP-gated Nostr relays can handle stateful, high-complexity applications like git hosting.

The three-layer architecture separates concerns elegantly:
- **Nostr (NIP-34 events)**: Lightweight metadata, event coordination, and query interface
- **ArNS**: Permanent, human-friendly naming that survives domain seizures
- **Arweave**: Immutable storage ensuring code permanence across decades

This separation makes the pattern reusable for any application requiring decentralized state management—not just git hosting.

**Economic sustainability through micropayments** solves the relay funding crisis. Traditional Nostr relays face unsustainable costs or resort to surveillance capitalism. Rig demonstrates that **free reads + paid writes** via ILP creates healthy incentives: users pay only for state changes they create, relays earn sustainable revenue, and the network remains permissionless.

**Inspired by git-native state management from beads/Gastown/Seeds**, Rig extends the insight that content-addressed storage enables merge-safe concurrent workflows. Where those projects proved the pattern works locally for AI agent state, Crosstown/Rig prove it works network-wide with economic incentives via ILP.

If Rig succeeds with git hosting—one of the most complex stateful applications—the Crosstown pattern can power **anything**: social networks, collaboration tools, data marketplaces, AI agent coordination. Rig is the proof of concept that validates the entire ecosystem vision.

## Project Classification

- **Project Type**: Web Application (Single-Page Application)
- **Domain**: Blockchain/Web3
- **Complexity**: High
- **Project Context**: Brownfield (building on existing Crosstown/Connector infrastructure and Forgejo NIP-34 reference implementation)

## Success Criteria

### User Success

**Primary User Goal:** Developers can confidently browse and discover git repositories stored on decentralized infrastructure without relying on centralized platforms.

**Success Moments:**
- **First Load Success**: User navigates to a repository and sees it load from Nostr/Arweave within 3 seconds, proving decentralized data actually works
- **Trust Building**: User explores commits, views file trees, reads issues—all sourced from distributed relays—and realizes "there's no GitHub server behind this"
- **Censorship Resistance Validation**: User searches for a repository by ArNS name, finds it permanently accessible, and understands "no one can take this down"
- **Ecosystem Discovery**: Developer sees Rig working and thinks "I can build my own app on Crosstown using this same pattern"

**User Delight Indicators:**
- Users bookmark Rig as their primary interface for decentralized repos
- Developers share ArNS URLs knowing they're permanent
- Users trust the UI enough to use it for critical code review
- Power users query multiple relays and see data consistency

### Business Success

**3-Month Success (MVP Validation):**
- **50+ repositories** successfully indexed and browsable through the frontend
- **200+ unique visitors** exploring decentralized repos via Rig
- **3+ external developers** expressing interest in building their own Crosstown apps after seeing Rig
- **5+ Nostr relays** successfully queried by the frontend with <10% failure rate

**12-Month Success (Ecosystem Proof):**
- **500+ repositories** with active browsing traffic
- **2,000+ monthly active users** choosing Rig over centralized alternatives for specific repos
- **10+ derivative applications** built using the Crosstown pattern, citing Rig as proof-of-concept
- **Ecosystem adoption**: At least 3 other clients can read the same NIP-34 events Rig displays

**Business Value Realized:**
- Rig validates that complex, stateful applications (not just social media) can be built on ILP-gated Nostr relays
- Pattern reusability proven: Other developers fork/adapt Rig's architecture for non-git applications
- Crosstown ecosystem credibility: "If it works for git, it works for anything"

### Technical Success

**Frontend Performance:**
- **Page Load**: <3s P95 for repository homepage loading from Nostr/Arweave
- **Relay Query Success**: ≥90% success rate when querying repositories from configured relays
- **Data Availability**: ≥95% success rate retrieving git objects from Arweave via ar.io gateways
- **ArNS Resolution**: <2s to resolve repository names to Arweave transaction IDs
- **Multi-Relay Consistency**: Data matches across ≥3 relays within 30 seconds of event publication

**Frontend Reliability:**
- **Uptime**: 99%+ (static hosting = naturally high)
- **Error Handling**: Graceful degradation when individual relays/gateways fail
- **Offline Capability**: Service worker caching enables viewing previously loaded repos offline
- **Browser Compatibility**: Works on latest Chrome, Firefox, Safari, Edge

**Code Quality:**
- **Bundle Size**: <500KB initial JavaScript bundle (gzipped)
- **Accessibility**: WCAG 2.1 AA compliance for core user journeys
- **Type Safety**: 100% TypeScript strict mode, zero `any` types in production code
- **Test Coverage**: ≥80% coverage for critical data fetching/display logic

### Measurable Outcomes

**Month 1 Targets:**
- Frontend deployed to static hosting (Vercel/Netlify)
- Successfully loads repository metadata from ≥2 Nostr relays
- Displays basic repository info (name, description, ArNS link)
- Achieves <5s P95 page load time

**Month 2 Targets:**
- Full repository browsing: commits, file tree, file contents from Arweave
- Query optimization: <3s P95 page load
- User feedback from ≥10 test users
- ArNS name resolution working for ≥10 test repositories

**Month 3 Targets (MVP Complete):**
- Issue/PR browsing from NIP-34 events
- Multi-relay querying with fallback logic
- 50+ real repositories indexed
- Public beta launch with documentation

## Product Scope

### MVP - Minimum Viable Product (Frontend Read-Only)

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

### Growth Features (Post-MVP)

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

### Vision (Future)

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

## User Journeys

### Journey 1: Alex - Open Source Maintainer

**Opening Scene: The Deplatforming Fear**

Alex maintains three popular open-source cryptography libraries with 50K+ combined stars on GitHub. It's 3am and they can't sleep. Earlier today, they read about another developer whose entire account was suspended—6 years of projects, issues, discussions, gone in minutes. "Terms of Service violation" with no appeal.

Alex's hands shake slightly as they think about their projects. The cryptography work. The controversial privacy tools. The contributors across 40 countries. If GitHub decides their work violates some policy—real or imagined—it all disappears. Years of community contributions, lost.

**Rising Action: Discovery**

The next morning, Alex sees a Nostr post from Casey about "Rig - decentralized git hosting that actually works." Skeptical but desperate, Alex clicks the ArNS link: `arns://rig-demo`

The interface loads. Clean, familiar—looks like GitHub but the URL is different. No corporate branding. Alex notices the "Powered by Nostr + Arweave" footer and thinks "this is probably vaporware."

They click on a test repository. It loads in 2 seconds. File tree appears. Alex clicks through commits—each one shows the Nostr event ID and Arweave transaction ID. They click "View on Arweave" and see the raw git object, permanently stored, with a timestamp and cryptographic proof.

Alex's heart rate picks up. This is real. They open DevTools, watch the network tab—queries to multiple Nostr relays, fallback logic when one times out, Arweave gateway requests succeeding. No central server. No single point of failure.

**Climax: The Moment of Trust**

Alex searches for their own test repo they published last week via Crosstown. Types the ArNS name. It loads instantly. Same data across all relays. File contents pulled from Arweave, byte-perfect.

They close their laptop. Reopen it 10 minutes later, different network, different location. Same URL. Same data. No server to ban their account. No platform owner to change terms.

The realization hits: **"No one can take this down. Not GitHub. Not any government. Not anyone."**

**Resolution: New Reality**

Three weeks later, Alex has migrated their most sensitive project to Rig. They share the ArNS link in their README with a note: "Primary hosting on decentralized infrastructure. GitHub is now the mirror."

When contributors ask "why?", Alex sends them the Rig URL. "Click it. View source. Check Arweave. That code will be accessible in 100 years. No platform owner can delete it. This is how open source should work."

Alex sleeps better now. The fear of deplatforming has transformed into confidence. They're planning to migrate the other two projects next month.

**Journey Requirements:** Repository browsing, commit history viewing, file tree navigation, Arweave permanence verification, multi-relay querying, ArNS name resolution, "View on Arweave" links for verification.

---

### Journey 2: Jordan - Contributor

**Opening Scene: The VPN Workaround**

Jordan lives in a country where GitHub access is intermittent. Some days it works. Some days it's blocked. The VPN helps but it's slow—30-second page loads, timeouts during git operations, constant connection drops.

Today Jordan wants to review a patch for a Nostr client they contribute to. GitHub is blocked again. They fire up the VPN. Wait. Wait more. Page loads... partially. Images broken. JavaScript fails. They refresh. Timeout.

Jordan closes the laptop in frustration. They have 30 minutes before work. The patch review won't happen today. Again.

**Rising Action: A Different Path**

Later that evening, the project maintainer posts on Nostr: "Repo now available on Rig: arns://nostr-client-mirror. Should work everywhere."

Jordan is skeptical. Every "decentralized GitHub" has been broken, slow, or vaporware. But they click the link anyway.

It loads. Fast. No VPN. The repository appears—same structure as GitHub but pulling from Nostr relays and Arweave. Jordan checks: they're connected to 3 relays, all responding in under a second. One relay is in their country.

They navigate to the pull request section. The patch they wanted to review is there. Full diff, commit history, file changes. Jordan reads the code, spots a potential race condition, wants to comment—but wait, this is read-only for now.

**Climax: Access Without Permission**

Jordan realizes: **They're accessing code without asking any platform for permission.** No VPN. No slow proxy. No account required. No "this service is unavailable in your region."

They browse 10 more repositories. All load quickly. All accessible. The relay in their country is fast, but when Jordan blocks it in DevTools, the frontend seamlessly queries international relays. Graceful degradation.

**Resolution: Reliable Access**

Jordan bookmarks 5 repositories on Rig. Every morning, they check the patch queue without VPN overhead. When GitHub is blocked, Jordan doesn't care anymore—Rig works.

They start recommending Rig to other contributors in their country. "It's not blocked because there's nothing to block. You're querying relays directly. P2P."

Three contributors from restricted regions join the project specifically because Rig makes access reliable. Jordan feels included in global open source again, not as a second-class citizen working around restrictions.

**Journey Requirements:** Fast page loads from multiple relays, geographic relay distribution, graceful relay failure handling, no authentication required for public browsing, PR/patch viewing, diff rendering, mobile-responsive design for on-the-go access.

---

### Journey 3: Sam - Archivist/Researcher

**Opening Scene: The Link Rot Crisis**

Sam works at a digital preservation institute. Their job: ensure software history survives. Last week they tried accessing source code from a 2010 paper citation. Google Code shut down. Sourceforge link broken. GitHub fork deleted. The code is gone.

Sam maintains a spreadsheet: 847 research papers citing code repositories. 312 links are already dead. The spreadsheet grows every month. Software history is evaporating.

Today Sam is cataloging Nostr protocol implementations for a graduate student's thesis. They need permanent, citable, verifiable links. Not "current as of 2026"—permanent.

**Rising Action: Verifiable Permanence**

A colleague mentions Rig: "Built on Arweave. 200-year storage guarantee. Cryptographic verification."

Sam is intrigued but skeptical. "Permanent" usually means "until the company runs out of money." They visit the Rig demo instance.

They pick a random repository, click through to a commit. Below the diff: "Stored on Arweave: [transaction ID] | Nostr Event: [event ID]"

Sam clicks the Arweave transaction link. Opens the Arweave block explorer. There's the raw git object, SHA-256 hash matching, stored on-chain with a timestamp. The Arweave economics page explains: paid upfront for 200+ years of storage, cryptographically guaranteed.

Sam's academic training kicks in. They verify the hash locally, check the Nostr event signature, cross-reference with multiple relays. Everything matches. This is verifiable, not just claimed.

**Climax: Citation-Ready Archives**

Sam realizes: **These ArNS URLs can go in academic citations.**

Unlike GitHub URLs that might 404 in 5 years, these links point to Arweave transactions. Even if Rig the frontend disappears, the data persists. Anyone can query Nostr relays and retrieve the metadata. Anyone can fetch the Arweave transaction. The code survives independent of any platform.

Sam drafts a citation:
```
Repository: arns://example-project (Arweave TX: abc123...)
Verified: 2026-02-24
Permanent Storage: Arweave blockchain
```

**Resolution: Future-Proof Archival**

Sam updates their preservation workflow:
1. Identify historically significant repos
2. Request maintainers publish to Rig/Arweave
3. Cite ArNS + Arweave TX in archival records
4. Sleep soundly knowing the links won't rot

Six months later, 40 repositories from at-risk platforms have been preserved via Rig. When the graduate student defends their thesis in 2027, every code citation still works. When a researcher reads the paper in 2045, they'll still be able to access the exact code.

Sam has stopped maintaining the "dead links" spreadsheet. They've started a new one: "Permanently Preserved."

**Journey Requirements:** Arweave transaction verification links, cryptographic hash verification, Nostr event signature verification, ArNS resolution with permanent TX IDs, citation-friendly URL formats, metadata timestamps, long-term accessibility guarantees visible in UI.

---

### Journey 4: Casey - Web3 Developer

**Opening Scene: The Contradiction**

Casey builds decentralized applications. Smart contracts on Ethereum. Frontend on IPFS. State on Ceramic. User identity on Nostr. Every piece carefully chosen to be decentralized, censorship-resistant, user-owned.

Except the code. That's all on GitHub. Centralized. Corporate-owned. Subject to arbitrary moderation. Casey feels the hypocrisy every time they tell users "your data, your rules" while their own source code lives on Microsoft's servers.

They've tried alternatives. IPFS? No git semantics. Radicle? Requires running a node. GitTorrent? Dead project. Nothing works well enough.

**Rising Action: Ecosystem Alignment**

Casey sees Rig trending on Nostr. "Finally, git hosting built on our stack: Nostr + Arweave + ILP."

They click through. The architecture documentation excites them: NIP-34 for git events, Arweave for immutable storage, ArNS for naming, ILP for spam prevention. This isn't just "decentralized GitHub"—it's **native to the ecosystem Casey already builds on**.

Casey opens their Nostr client, sees the same npub keys from their social network now hosting code. The UX clicks: "This is just another Nostr client, but for git instead of notes."

They browse a few repos, check the NIP-34 event structures, realize they could build their own client that reads the same data. Rig is just one interface to open protocols.

**Climax: Ecosystem Integration**

Casey has a breakthrough: **"I can integrate this into my dApp's developer dashboard."**

Their application framework could display available smart contract templates, all sourced from Rig/NIP-34. Users could browse audited contracts, verify them on Arweave, deploy directly. All without leaving the decentralized ecosystem.

Casey opens DevTools, watches Rig query Nostr relays using nostr-tools—the same library Casey already uses. The patterns are familiar: SimplePool, subscriptions, event kinds. They could fork Rig's frontend, adapt it for contract templates in a weekend.

**Resolution: Ecosystem Native**

Two weeks later, Casey has:
1. Migrated their main dApp repos to Rig
2. Integrated NIP-34 contract browsing into their framework dashboard
3. Written a blog post: "Why Web3 developers should use Rig"
4. Started building a mobile Nostr client with built-in code browsing

The contradiction is resolved. Casey's entire stack is now aligned: decentralized smart contracts, decentralized frontend hosting, decentralized database (Nostr relays), decentralized code hosting (Rig).

When VCs ask "what makes your framework different?", Casey demonstrates: "We're the only framework where you can verify every layer of the stack—including our own source code—on decentralized infrastructure. No trust required."

Casey has become Rig's biggest advocate, not because it's better than GitHub feature-wise, but because **it's native to the ecosystem they're building**.

**Journey Requirements:** NIP-34 event inspection, developer-friendly documentation, embeddable components, API access for integration, Nostr-tools compatibility, ecosystem branding (Nostr/Arweave/ILP logos), code snippet sharing, technical architecture visibility.

---

### Journey 5: Anonymous Visitor - Curiosity to Trust

**Opening Scene: Twitter Link Click**

Someone with no Nostr identity, no crypto wallet, no Web3 experience sees a tweet: "Check out this decentralized git hosting thing: arns://rig-demo"

They're skeptical. "Decentralized" usually means "broken" or "scam." But they're curious—they click.

The page loads. Looks... normal? Clean interface, familiar GitHub-like layout, no wallet connection popup, no "connect to Web3" prompt. Just repositories.

They think: "Okay, so where's the catch?"

**Rising Action: Exploring Without Commitment**

They click a random repository. It loads in 2 seconds. File tree on the left, README on the right. They navigate to a source file—syntax highlighting works, line numbers render correctly.

They click "Commits." A list appears. They click a commit. Full diff loads. Green/red highlighting for additions/deletions.

They notice something: no login required. No "sign up to continue." No rate limits warning. They've now viewed 8 pages without being asked for credentials.

At the bottom of each page: "Powered by Nostr + Arweave." They click "Learn More," read a simple explanation: "Data is stored on decentralized networks. No central server. No one can delete it."

**Climax: The "It Just Works" Moment**

The visitor decides to test the "no central server" claim. They open DevTools Network tab, refresh the page. Watch requests go to multiple relay URLs they've never heard of. Watch Arweave gateway requests succeed.

They disconnect WiFi for 5 seconds, reconnect. The page they were viewing is still cached—service worker offline support works.

They realize: **"This actually works. No blockchain wallet required, no crypto needed to browse, just... works."**

They bookmark a repository about Rust web frameworks. The URL is weird (`arns://...`) but it's permanent. They can share it with their team.

**Resolution: Advocate Through Curiosity**

The visitor doesn't have Nostr. Doesn't own crypto. But they understand: **"decentralized" doesn't mean "complicated for users."**

They share the Rig link on their company Slack: "Found this interesting—GitHub but decentralized. Actually works though, not like those other attempts."

Three coworkers click. All browse without friction. One developer asks: "How do I publish my repo here?" The visitor doesn't know yet, but they're interested enough to find out.

The anonymous visitor has become an early adopter, not through ideology, but through **"it just works"** user experience.

**Journey Requirements:** Zero authentication for browsing, fast page loads, familiar UI patterns, educational "Learn More" content, no Web3 jargon on public pages, service worker caching, simple sharing (copy ArNS URL), mobile-responsive design, graceful loading states.

---

### Journey 6: Ecosystem Builder - Proof of Concept to Pattern

**Opening Scene: The Research Question**

Taylor is a senior developer at a Nostr client company. Their CTO asks: "Can we build a decentralized documentation platform on ILP-gated relays? Is the Crosstown pattern viable for non-social apps?"

Taylor's job: research, prototype, prove feasibility. They've read the Crosstown/Connector docs but need **proof** it works for complex state management.

They've heard about Rig: "Git hosting on Crosstown. First major app proving the pattern."

**Rising Action: Reverse Engineering**

Taylor visits Rig, but instead of browsing repos like a normal user, they open DevTools immediately. Network tab open. Console watching relay connections. Source code inspection.

They watch Rig query 4 Nostr relays in parallel using SimplePool. They see the filter logic for NIP-34 events. They inspect how Rig handles relay timeouts—graceful degradation, fallback to healthy relays, no user-facing errors.

Taylor opens the GitHub repo (ironically, Rig's source is on GitHub... for now). They read the architecture:
- `src/lib/nostr/` - relay connection management
- `src/lib/arweave/` - gateway selection and fallback
- `src/components/` - shadcn/ui components for repository browsing

The patterns are clear, well-documented, reusable.

**Climax: The "This Solves Our Problem" Moment**

Taylor realizes: **"If Rig can do git operations (highly stateful, complex queries, multi-event threading), our documentation platform is easier."**

Git hosting requires:
- Complex NIP-34 event threading (patches → PRs → comments)
- Large file handling (git objects → Arweave)
- Real-time collaboration (multiple contributors)

Documentation platform requirements:
- Simple event types (docs, versions, comments)
- Smaller file sizes
- Similar collaboration patterns

**Rig's patterns solve 80% of Taylor's technical challenges:**
- Multi-relay querying? Copy Rig's SimplePool logic
- Arweave storage? Adapt Rig's gateway selection
- Event threading? NIP-10 references, same as Rig uses

Taylor screenshots the codebase architecture, opens Figma, starts designing their documentation platform UI using Rig's patterns.

**Resolution: Ecosystem Multiplication**

Two months later, Taylor's company launches "NostrDocs" - decentralized technical documentation using the Crosstown pattern. In their launch blog post:

> "We studied Rig's architecture extensively. They proved that ILP-gated Nostr relays can handle complex, stateful applications. We adapted their patterns for documentation. If you're building on Crosstown, study Rig first—it's the reference implementation."

Taylor has forked Rig's relay connection logic, Arweave client utilities, and UI component patterns. 60% of NostrDocs' codebase traces lineage to Rig's architectural decisions.

The Crosstown ecosystem grows: Rig (git) → NostrDocs (documentation) → NostrWiki (knowledge base) → NostrForms (data collection). Each new application validates the pattern further, cites Rig as proof-of-concept.

**Rig's success multiplies**: it's not just a git hosting tool, it's **the architectural blueprint for an entire class of applications**.

**Journey Requirements:** Public GitHub repository with well-documented code, architecture documentation (how it works, not just what it does), reusable component library, developer API documentation, technical blog posts explaining design decisions, embeddable code snippets, open-source license encouraging forks, clear separation of concerns (relay/storage/UI layers).

---

### Journey Requirements Summary

These six journeys reveal the following capability requirements:

**Core Browsing Capabilities (All Journeys):**
- Fast repository discovery and browsing (<3s page loads)
- Commit history viewing with diffs
- File tree navigation and file content display
- Issue and PR browsing (read-only for MVP)
- ArNS name resolution to Arweave transactions
- Multi-relay querying with graceful degradation
- Mobile-responsive interface

**Trust & Verification (Alex, Sam):**
- "View on Arweave" links for permanent storage verification
- Cryptographic hash verification (Nostr event signatures, Arweave TX hashes)
- Timestamp display for archival purposes
- Citation-friendly URL formats (ArNS + Arweave TX)
- Permanent storage guarantees visible in UI

**Accessibility & Performance (Jordan, Anonymous Visitor):**
- Zero authentication required for public browsing
- Fast loads from geographically distributed relays
- Graceful relay failure handling (automatic fallback)
- Service worker for offline capability
- No Web3 jargon on public-facing pages
- Simple sharing (copy ArNS URL)

**Ecosystem Integration (Casey, Taylor):**
- NIP-34 event inspection and debugging tools
- Developer-friendly documentation and architecture guides
- Reusable component library and code patterns
- Public API for integration into other apps
- Well-documented source code (GitHub repo)
- Embeddable widgets for displaying repo data
- Clear technical architecture visibility

**Educational Content (All):**
- "Learn More" sections explaining Nostr/Arweave/ILP
- Visual indicators of decentralization (relay status, Arweave confirmation)
- Progressive disclosure: simple for casual users, detailed for power users
- Success states that reinforce trust ("Verified on 3 relays")

## Domain-Specific Requirements

### Compliance & Regulatory

**Cryptocurrency & Payment Regulations:**
- ILP micropayment integration (future feature) may trigger money transmitter licensing requirements in certain jurisdictions
- Monitor regulatory landscape as Web3 regulations evolve (particularly EU MiCA, US SEC guidance)
- Design payment flows to minimize regulatory burden (users pay relays directly, not through Rig)

**Data Sovereignty & Immutability Conflict:**
- GDPR "right to be forgotten" incompatible with Arweave permanence
- Solution: Clear user consent before publishing to Arweave ("This data is permanent and cannot be deleted")
- Consider geo-blocking EU users from write operations until regulatory clarity emerges
- Maintain compliance documentation explaining immutability vs. deletion rights

**Content Moderation vs. Censorship Resistance:**
- Rig's mission is censorship resistance, but illegal content creates liability
- Frontend-level content filtering without compromising protocol neutrality
- Clear ToS: Rig displays data from decentralized networks, does not host or control content
- Relay operators handle content policy independently (Rig just queries)

**Export Controls for Cryptographic Software:**
- Nostr event signing uses cryptographic primitives (secp256k1)
- May trigger ITAR/EAR export restrictions in some countries
- Include export compliance disclaimers in documentation
- Monitor BIS guidelines for open-source cryptographic software

### Technical Constraints

**Decentralization vs. Performance Tradeoffs:**
- Multi-relay queries inherently slower than centralized server (<3s target vs. <1s typical for GitHub)
- Mitigation: Parallel relay queries with race conditions, aggressive caching, optimistic UI
- Accept slightly slower loads as acceptable tradeoff for censorship resistance
- Progressive enhancement: show cached data immediately, update when relays respond

**Economic Incentive Alignment:**
- Spam prevention via ILP micropayments (write operations cost money, reads are free)
- Cost transparency: display estimated costs before write operations ("~10 sats to publish")
- Market-based pricing prevents relay operator price gouging (users choose relays)
- Economic signaling: frame payments as spam prevention, not profit extraction

**Cryptographic Key Management:**
- Nostr identity tied to cryptographic keys (npub/nsec)
- Key loss = permanent identity loss (no password reset)
- User education: prominent warnings, key backup flows, export functionality
- Future: social recovery mechanisms, multi-sig schemes, key rotation support

**Data Permanence & Economic Sustainability:**
- Arweave claims 200+ year storage via upfront endowment
- Risk: Arweave economic model fails, storage becomes unavailable
- Mitigation: Monitor Arweave network health, document fallback strategies, consider multi-storage redundancy (Filecoin, Storj)
- Transparently display storage costs and endowment calculations

**Frontend Centralization Risk:**
- Rig frontend deployed to centralized hosting (Vercel/Netlify) creates single point of failure
- Mitigation strategy: Deploy frontend to IPFS, use ArNS/ENS for permanent domain
- Progressive decentralization: start centralized for development speed, migrate to decentralized hosting post-MVP
- Open-source frontend allows community to deploy alternative instances

### Integration Requirements

**NIP Protocol Compliance:**
- **NIP-01 (Basic Protocol)**: Mandatory for relay communication, event structure, filters
- **NIP-10 (Threading)**: Required for issue/PR comment threading, event references
- **NIP-34 (Git Stuff)**: Core spec - repository announcements, patches, issues, PRs (kinds 30617, 1617, 1618, 1621, 1622, 1630-1633)
- **NIP-07 (Browser Extension Signing)**: Future auth via Alby, nos2x, other signing extensions
- Strict spec compliance ensures interoperability with other NIP-34 clients

**Relay Diversity & Health Monitoring:**
- Configure connections to ≥5 geographically distributed relays
- Implement relay health checks (latency, uptime, event coverage)
- Automatic failover when relays timeout or return errors
- User-configurable relay list (power users can add custom relays)
- Incentivize relay operators through clear documentation and ILP payment flows

**Arweave Gateway Network Integration:**
- Integrate with ar.io gateway network for Arweave data retrieval
- Multi-gateway fallback logic (if primary gateway fails/censors, try alternates)
- Support direct Arweave node connections for power users (bypass gateways entirely)
- Monitor gateway health and routing performance
- Future: Client-side Arweave light node for trustless verification

**ArNS Resolution System:**
- Integrate ArNS for human-friendly repository naming (arns://project-name)
- ArNS → Arweave transaction ID resolution
- Handle ArNS conflicts and first-come-first-serve registration
- Display both ArNS name and underlying Arweave TX ID for verification

**Browser Extension Ecosystem:**
- NIP-07 compatibility for future authentication (window.nostr API)
- Test against popular extensions: Alby, nos2x, Flamingo
- Graceful degradation when extensions unavailable (read-only mode works without auth)

### Risk Mitigations

**Relay Centralization Risk:**
- **Risk**: If only 2-3 relays carry NIP-34 events, censorship resistance fails
- **Mitigation**:
  - Incentivize relay operators via ILP revenue potential
  - Document relay setup process, lower barrier to entry
  - Partner with existing relay operators to add NIP-34 support
  - Monitor relay diversity metrics, alert if concentration occurs

**Arweave Gateway Censorship:**
- **Risk**: Gateways can refuse to serve specific transactions (gateway-level censorship)
- **Mitigation**:
  - Multi-gateway fallback (query 3+ gateways for each transaction)
  - Direct Arweave node option for advanced users
  - Monitor gateway censorship incidents, adjust routing
  - Support community-run gateways to increase diversity

**Economic Attack Vectors:**
- **Relay Spam**: Solved by ILP write costs (attackers must pay for each spam event)
- **DoS via Read Queries**: Rate limiting without authentication required (IP-based, with user education about "you're being rate limited because of heavy use")
- **ArNS Name Squatting**: First-come-first-serve creates front-running risk. Mitigation: Clear naming guidelines, support for verified identities, future: name auction mechanisms

**Privacy & Pseudonymity:**
- **Risk**: All Nostr events are public, repository metadata linkable to npub
- **Mitigation**:
  - Clear user education: "Your npub is pseudonymous but public and linkable"
  - Privacy best practices documentation (separate identities for sensitive projects)
  - Future: NIP-04/NIP-44 encryption for private repositories
  - Network analysis tools to help users understand their privacy footprint

**Key Loss & Recovery:**
- **Risk**: Users lose Nostr private keys → permanent identity loss
- **Mitigation**:
  - Prominent warnings during key generation/import
  - Key backup flows with multiple export formats (nsec, hex, mnemonic)
  - Educational content: "Your key is your identity - no password reset"
  - Future: Social recovery (trusted contacts can help recover), multi-sig schemes

**Frontend Single Point of Failure:**
- **Risk**: Rig frontend on centralized hosting defeats censorship resistance
- **Mitigation**:
  - Post-MVP: Deploy to IPFS, use ArNS/ENS for permanent domain
  - Open-source allows community forks if primary instance censored
  - Document self-hosting instructions
  - Progressive decentralization roadmap clearly communicated

### Domain-Specific Patterns & Best Practices

**Progressive Decentralization:**
- Start with centralized components for development speed (hardcoded relay list, gateway list)
- Gradually decentralize: DHT-based relay discovery, P2P gateway finding, decentralized frontend hosting
- Roadmap transparency: communicate current centralization points and decentralization timeline

**Optimistic UI:**
- Show cached/stale data immediately, update when fresh data arrives from relays
- Visual indicators of data freshness ("Last updated 30s ago from 4/5 relays")
- Never block user interactions waiting for slow relays

**Graceful Degradation:**
- 5 relays configured, 1 responds → works (show warning)
- All relays fail → show cached data with prominent "offline mode" indicator
- Gateway fails → try alternate gateways automatically, only error if all fail

**Economic Transparency:**
- Display costs before write operations ("Publishing this repository will cost ~1000 sats")
- Explain why payments exist ("Micropayments prevent spam without gatekeepers")
- Show relay payment distribution (users understand where money goes)
- Avoid profit-seeking framing (payments = sustainability, not revenue)

**Security by Default:**
- Assume hostile network environment (untrusted relays, gateways)
- Verify all cryptographic signatures (Nostr events, Arweave transactions)
- Content Security Policy to prevent XSS from untrusted relay data
- Sanitize all user-generated content displayed in UI

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Three-Layer Architecture Pattern**

Rig introduces a novel separation of concerns across decentralized protocols:
- **Nostr (NIP-34 events)**: Lightweight metadata, event coordination, and query interface
- **ArNS**: Permanent, human-friendly naming that survives domain seizures
- **Arweave**: Immutable storage ensuring code permanence across decades

**Why This Is Novel:** Previous decentralized git attempts used single-layer solutions (IPFS alone, blockchain alone). Rig proves you can separate concerns across decentralized protocols, with each layer optimized for its specific role. This architectural pattern is reusable for any application requiring decentralized state management.

**2. Economic Sustainability Model**

Rig demonstrates a novel economic approach to decentralized infrastructure:
- **Free P2P reads**: No server costs, no rate limits, censorship-resistant browsing
- **Paid ILP writes**: Micropayments prevent spam without gatekeepers or moderation

**Why This Is Novel:** Previous attempts either had no spam prevention (becoming unusable) or used centralized moderation (defeating the decentralization purpose). Rig's economic incentives solve spam without requiring trusted moderators. Users pay only for state changes they create, relays earn sustainable revenue, and the network remains permissionless.

**3. Ecosystem Proof-of-Concept**

Rig is the **first major application proving the Crosstown ecosystem pattern** scales to production complexity:
- **Claim**: "If complex git operations work on ILP-gated Nostr relays, anything works"
- **Impact**: Validates entire architectural pattern for future applications

**Why This Is Novel:** While Nostr has demonstrated success for social media, Rig validates that ILP-gated Nostr relays can handle stateful, high-complexity applications. This isn't just a product innovation—it's validation of an entire class of decentralized applications. If Rig succeeds, the Crosstown pattern can power social networks, collaboration tools, data marketplaces, AI agent coordination, and more.

**4. Decentralized UX Without Compromise**

Rig aims to match centralized UX expectations while maintaining full decentralization:
- **Target**: <3s page loads from multi-relay queries
- **Techniques**: Optimistic UI, aggressive caching, parallel relay racing, service worker offline support
- **Goal**: Users can't distinguish decentralized from centralized in blind testing

**Why This Is Novel:** Most decentralized applications sacrifice user experience for decentralization. Rig proves that with the right architectural choices (optimistic updates, graceful degradation, progressive enhancement), decentralization doesn't have to mean poor UX.

### Market Context & Competitive Landscape

**Existing Solutions & Their Limitations:**

| Solution | Approach | Limitation |
|----------|----------|------------|
| **GitHub/GitLab** | Centralized hosting | Single point of failure, censorship risk, account bans |
| **Radicle** | P2P git with distributed identity | Requires running a node, complex setup, low adoption |
| **GitTorrent** | Git + BitTorrent | Dead project, no incentive model for seeders |
| **IPFS + Git** | Git objects on IPFS | No metadata layer, no spam prevention, poor discoverability |
| **Git on Blockchain** | Git commits as blockchain transactions | Prohibitively expensive, slow, doesn't scale |

**Rig's Novel Combination:**
- **Better than Radicle**: Fast metadata queries without running a node (Nostr relays provide this)
- **Better than blockchain git**: Permanent storage without transaction costs (Arweave storage is upfront, not per-operation)
- **Better than IPFS git**: Human-friendly naming that survives domain seizures (ArNS provides this)
- **Better than free-for-all**: Micropayments prevent spam without gatekeepers (ILP provides economic spam prevention)

**Why This Combination Hasn't Been Done:**
- Crosstown/Connector infrastructure (ILP-gated Nostr relays) didn't exist until recently
- NIP-34 (git operations on Nostr) is a new specification
- ArNS (Arweave Name System) is relatively new
- Requires deep understanding of 4+ protocols simultaneously (high barrier to entry)
- No single team had incentive to prove the pattern until Crosstown ecosystem needed validation

### Validation Approach

**Technical Validation:**
- **Hypothesis**: Multi-relay querying can achieve <3s P95 page loads despite decentralization
- **Test Method**: Benchmark against 5+ geographically distributed relays with realistic network latency
- **Success Criteria**: ≥90% of queries return within 3 seconds from ≥1 relay
- **Measurement**: P95 latency metrics, relay response time distribution
- **Fallback**: If too slow, implement relay-side caching layer or CDN-like relay selection

**Economic Validation:**
- **Hypothesis**: ILP micropayments prevent spam without blocking legitimate users
- **Test Method**: Cost analysis - repository operations should cost <$0.10, attractive vs GitHub ($0 but censorship risk)
- **Success Criteria**: <2% spam rate, ≥80% user satisfaction with cost/benefit tradeoff
- **Measurement**: Spam reports per 1000 events, user surveys on pricing perception
- **Fallback**: If too expensive, optimize event structures (TOON format reduces size 5-10%), increase compression

**Ecosystem Validation:**
- **Hypothesis**: Developers will build derivative applications using Rig's architectural patterns
- **Test Method**: Open-source architecture documentation, measure GitHub forks, blog post citations, derivative projects
- **Success Criteria**: ≥3 derivative applications within 12 months citing Rig as proof-of-concept
- **Measurement**: GitHub network graph, search for "inspired by Rig", community project registry
- **Fallback**: If no adoption, pattern may not generalize (Rig still valuable as standalone product)

**UX Validation:**
- **Hypothesis**: Decentralized UX can match centralized user expectations
- **Test Method**: Blind user testing - can users distinguish Rig from GitHub in functionality/speed tests?
- **Success Criteria**: ≥70% users rate Rig UX as "good" or better, <5s perceived difference in workflows
- **Measurement**: User satisfaction scores, task completion time, subjective experience ratings
- **Fallback**: If UX suffers, rethink offline-first architecture, invest more in service workers, prefetching

### Risk Mitigation

**Risk 1: Pattern Doesn't Generalize Beyond Git**
- **Risk Description**: Rig works for git hosting, but Crosstown pattern fails for other use cases (docs, social, collaboration)
- **Impact**: Ecosystem proof-of-concept claim fails; Rig remains valuable but less impactful
- **Likelihood**: Medium (git is uniquely complex, may not represent typical app)
- **Mitigation Strategy**:
  - Work with ecosystem builders early (Taylor journey - documentation platform)
  - Test pattern on diverse use cases (simple and complex) during beta
  - Document where pattern works well vs. poorly
- **Fallback**: Pivot messaging from "ecosystem proof" to "best-in-class decentralized git hosting"

**Risk 2: Performance Doesn't Meet User Expectations**
- **Risk Description**: Multi-relay queries are too slow (<3s target fails), users abandon for GitHub
- **Impact**: Product unusable despite technical correctness, innovation fails in practice
- **Likelihood**: Medium (decentralization inherently adds latency)
- **Mitigation Strategy**:
  - Aggressive performance testing in closed beta before public launch
  - Implement relay-side caching if client-side insufficient
  - Set realistic user expectations (slightly slower for censorship resistance)
- **Fallback**: Accept 5s loads, market to users who prioritize censorship resistance over speed (archivists, activists)

**Risk 3: Economic Model Breaks Down**
- **Risk Description**: ILP costs too high → no users adopt; costs too low → spam overwhelms relays
- **Impact**: Product unusable due to spam or unaffordable for typical users
- **Likelihood**: Low (ILP is designed for micropayments, market competition regulates pricing)
- **Mitigation Strategy**:
  - Dynamic pricing based on relay costs
  - Cost transparency (show estimated costs before operations)
  - User choice of relays (market competition prevents price gouging)
- **Fallback**: Implement alternative spam prevention (proof-of-work, reputation systems, invite codes)

**Risk 4: Ecosystem Infrastructure Dependency Fails**
- **Risk Description**: Crosstown/Connector shut down, Arweave economics collapse, ArNS abandoned
- **Impact**: Entire innovation stack collapses, product becomes unmaintainable
- **Likelihood**: Low (multiple independent protocols, strong economic incentives)
- **Mitigation Strategy**:
  - Monitor health metrics of dependent protocols (Arweave storage pricing, relay count, ArNS adoption)
  - Contribute to sustainability of upstream protocols
  - Design architecture to allow layer swapping
- **Fallback**: Rig's open architecture allows replacing layers (Filecoin for Arweave, ENS for ArNS, alternative payment rails for ILP)

**Risk 5: Regulatory Crackdown on Decentralized Infrastructure**
- **Risk Description**: Governments ban Nostr relays, Arweave gateways, or ILP micropayments in key jurisdictions
- **Impact**: Product becomes illegal or inaccessible in certain regions
- **Likelihood**: Medium (regulatory landscape uncertain for Web3)
- **Mitigation Strategy**:
  - Progressive decentralization (deploy frontend to IPFS, not just centralized hosting)
  - Geographic relay diversity (ensure relays in favorable jurisdictions)
  - Tor support for censorship-resistant access
  - Clear legal disclaimers (Rig displays data, doesn't control it)
- **Fallback**: Focus on jurisdictions with favorable crypto/Web3 regulations, provide VPN/Tor guides for restricted regions

## Web App Specific Requirements

### Project-Type Overview

Rig is a **single-page application (SPA)** built with React, TypeScript, and Vite, providing a GitHub-like interface for browsing decentralized git repositories. The frontend queries multiple Nostr relays in parallel and retrieves git objects from Arweave via ar.io gateways. Static hosting (Vercel/Netlify) with progressive enhancement toward decentralized hosting (IPFS/ArNS) post-MVP.

### Technical Architecture Considerations

**Frontend Stack:**
- **Framework**: React 18+ with hooks and modern patterns
- **Build Tool**: Vite for fast development and optimized production builds
- **Type Safety**: TypeScript strict mode (zero `any` types in production code)
- **UI Components**: shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React Context + hooks (avoid complex state libraries for MVP)
- **Routing**: React Router for client-side navigation

**Decentralized Data Layer:**
- **Nostr Integration**: nostr-tools SimplePool for multi-relay queries
- **Arweave Integration**: Arweave client via ar.io gateway network
- **ArNS Resolution**: ArNS SDK for human-friendly name resolution
- **Caching Strategy**: Service worker + IndexedDB for offline-first progressive enhancement

### Browser Matrix

| Browser | Minimum Version | Support Level | Notes |
|---------|----------------|---------------|-------|
| **Chrome** | 100+ | Full support | Primary development target |
| **Firefox** | 100+ | Full support | Test regularly during development |
| **Safari** | 15+ | Full support | Test on macOS and iOS |
| **Edge** | 100+ | Full support | Chromium-based, generally works if Chrome works |
| **Mobile Safari** | iOS 15+ | Full support | Responsive design tested on iPhone/iPad |
| **Mobile Chrome** | Android 100+ | Full support | Responsive design tested on Android devices |
| **IE11** | N/A | Not supported | Modern JavaScript features incompatible |

**Browser Feature Requirements:**
- **ES2020+ Support**: Modern JavaScript features (optional chaining, nullish coalescing)
- **Web Crypto API**: For Nostr event signature verification
- **IndexedDB**: For offline caching and service worker storage
- **WebSocket**: For future real-time Nostr relay subscriptions
- **Service Workers**: For progressive web app (PWA) offline capabilities

### Responsive Design

**Breakpoint Strategy:**

| Breakpoint | Min Width | Target Devices | Layout Considerations |
|------------|-----------|----------------|----------------------|
| **Mobile** | 320px | Phones | Single column, collapsible navigation, touch-optimized |
| **Tablet** | 768px | Tablets, small laptops | Two-column layouts, side navigation appears |
| **Desktop** | 1024px | Laptops, desktops | Three-column layouts, full sidebar navigation |
| **Wide** | 1440px+ | Large monitors | Max content width constraint (prevent line length issues) |

**Responsive Components:**
- **Repository Browser**: Collapsible file tree on mobile, persistent sidebar on desktop
- **Commit View**: Stacked layout on mobile, side-by-side diff on desktop
- **Issue/PR Lists**: Card layout on mobile, table layout on desktop
- **Navigation**: Hamburger menu on mobile, persistent top/side nav on desktop

**Touch Optimization:**
- Minimum touch target size: 44x44px (iOS HIG, WCAG guidelines)
- Swipe gestures for mobile navigation (file tree collapse, back/forward)
- Pull-to-refresh for repository data updates

### Performance Targets

**Core Web Vitals (Target Metrics):**

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Largest Contentful Paint (LCP)** | <2.5s | Repository page should load main content quickly |
| **First Input Delay (FID)** | <100ms | Interactive elements respond immediately |
| **Cumulative Layout Shift (CLS)** | <0.1 | Minimal layout shift during data loading |
| **Time to Interactive (TTI)** | <3.5s | App should be fully interactive within 3.5s |
| **Page Load (P95)** | <3s | 95th percentile page load from Nostr/Arweave |

**Bundle Size Targets:**
- **Initial JavaScript Bundle**: <500KB gzipped (prevents slow load on slower connections)
- **Vendor Chunks**: Code-split react, nostr-tools, arweave separately
- **Route-Based Code Splitting**: Lazy load non-critical routes (e.g., settings page)
- **Asset Optimization**: Images/icons served as WebP with fallbacks, SVG icons inlined

**Network Performance:**
- **Multi-Relay Query Optimization**: Race condition (first successful response wins)
- **Parallel Requests**: Query 5+ relays simultaneously, aggregate results
- **Request Deduplication**: Cache identical relay queries (same filter, same relay)
- **Gateway Fallback**: If primary Arweave gateway fails, try alternates within 1s timeout

**Caching Strategy:**
- **Service Worker**: Cache static assets (HTML, JS, CSS) for offline access
- **IndexedDB**: Cache Nostr events and Arweave data for 1 hour TTL
- **Stale-While-Revalidate**: Show cached data immediately, update in background
- **Cache Invalidation**: Clear cache on version updates

### SEO Strategy

**MVP SEO Approach (Minimal):**
- **Primary Discovery**: Direct ArNS links shared on Nostr, Twitter, GitHub
- **Not Optimized For**: Google search discovery (developers find via social)
- **Basic Meta Tags**: Title, description, Open Graph, Twitter Cards for link previews

**Meta Tag Template:**
```html
<title>{{repo-name}} - Rig Decentralized Git</title>
<meta name="description" content="Browse {{repo-name}} on decentralized infrastructure. Permanent, censorship-resistant code hosting via Nostr + Arweave.">
<meta property="og:title" content="{{repo-name}} on Rig">
<meta property="og:description" content="Decentralized git repository hosted on Nostr + Arweave">
<meta property="og:image" content="{{repo-avatar-url}}">
<meta name="twitter:card" content="summary_large_image">
```

**Future SEO Enhancements (Post-MVP):**
- **Pre-rendering**: Static HTML generation for popular repositories (improves crawlability)
- **Structured Data**: Schema.org markup for code repositories (SoftwareSourceCode type)
- **Sitemap Generation**: Dynamic sitemap of public repositories for search engines
- **Server-Side Rendering (SSR)**: If decentralized hosting allows (e.g., edge functions)

**SEO Trade-offs Accepted:**
- **Client-Side Rendering**: SPA architecture means initial HTML is minimal (poor for SEO)
- **Dynamic Content**: Repository data loaded client-side (search engines see loading state)
- **Trade-off Justification**: Primary users find via social links, not Google search

### Accessibility Level

**Target Compliance: WCAG 2.1 Level AA**

**Keyboard Navigation:**
- **All Interactive Elements**: Keyboard accessible (buttons, links, form inputs)
- **Logical Tab Order**: Sequential focus order matches visual layout
- **Skip Links**: "Skip to main content" link at page top for screen readers
- **Focus Indicators**: Visible focus outline on all focusable elements (2px solid border)
- **Keyboard Shortcuts**: Optional power-user shortcuts (e.g., `/` for search, `g+r` for repository view)

**Screen Reader Compatibility:**
- **Semantic HTML**: Proper heading hierarchy (h1 → h2 → h3), semantic elements (nav, main, aside)
- **ARIA Labels**: Descriptive labels for icon-only buttons ("Close menu", "View commit")
- **Live Regions**: Announce dynamic content updates (e.g., "Repository loaded from 4 relays")
- **Alt Text**: Descriptive alt text for user avatars, repository icons

**Visual Accessibility:**
- **Color Contrast**: Minimum 4.5:1 contrast ratio for normal text, 3:1 for large text (WCAG AA)
- **Color Independence**: Information not conveyed by color alone (diff shows +/- symbols, not just green/red)
- **Text Sizing**: Minimum 16px body text, relative units (rem/em) for scalability
- **Zoom Support**: Layout doesn't break at 200% browser zoom

**Interactive Element Accessibility:**
- **Touch Targets**: Minimum 44x44px (WCAG AAA recommendation, iOS HIG requirement)
- **Form Labels**: All inputs have associated labels (visible or aria-label)
- **Error Messages**: Clear, actionable error messages linked to form fields (aria-describedby)
- **Loading States**: Screen reader announces when data is loading ("Loading repository...")

**Accessibility Testing:**
- **Automated Tools**: Lighthouse accessibility audit in CI/CD (minimum score: 90)
- **Manual Testing**: Keyboard-only navigation testing for core user journeys
- **Screen Reader Testing**: VoiceOver (Safari), NVDA (Firefox), JAWS (Chrome)
- **User Testing**: Recruit users with accessibility needs for beta testing

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

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

### MVP Feature Set (Phase 1: Months 1-3)

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

### Post-MVP Features

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

### Risk Mitigation Strategy

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

## Functional Requirements

### Repository Discovery & Browsing

- **FR1**: Users can browse a list of repositories announced via Nostr kind 30617 events
- **FR2**: Users can view repository metadata including name, description, maintainers, and ArNS URL
- **FR3**: Users can filter repositories by name using client-side search
- **FR4**: Users can navigate to a repository detail view to explore its contents
- **FR5**: Users can view which Nostr relays are currently providing repository data

### Commit & Change History

- **FR6**: Users can view a chronological list of commits for a repository
- **FR7**: Users can view commit details including author, message, timestamp, and Nostr event ID
- **FR8**: Users can view the diff (changes) for each commit with syntax highlighting
- **FR9**: Users can navigate between related commits (parent/child relationships)
- **FR10**: Users can view commit metadata including Arweave transaction IDs for storage verification

### File Exploration

- **FR11**: Users can navigate a repository's file tree structure
- **FR12**: Users can view file contents with syntax highlighting for code files
- **FR13**: Users can navigate between different file versions across commits
- **FR14**: Users can view file metadata including size and last modified timestamp
- **FR15**: Users can access "View on Arweave" links to verify permanent storage

### Issue & Pull Request Management

- **FR16**: Users can browse a list of issues for a repository
- **FR17**: Users can view issue details including title, description, status, and comments
- **FR18**: Users can view issue comment threads with proper threading (NIP-10 references)
- **FR19**: Users can browse a list of pull requests for a repository
- **FR20**: Users can view pull request details including title, description, status, and discussion
- **FR21**: Users can view pull request discussion threads with proper threading
- **FR22**: Users can see issue and PR status indicators (open, closed, merged)

### Decentralization & Verification

- **FR23**: Users can view which Nostr relays successfully responded to queries
- **FR24**: Users can verify Nostr event signatures for data authenticity
- **FR25**: Users can view Arweave transaction IDs for all stored content
- **FR26**: Users can verify Arweave transaction hashes for data integrity
- **FR27**: Users can see ArNS name resolution details (ArNS → Arweave TX mapping)
- **FR28**: Users can view relay connection health status (connected/disconnected)
- **FR29**: Users can export permanent citation-ready URLs (ArNS + Arweave TX)

### User Education & Transparency

- **FR30**: Users can access educational content explaining Nostr, Arweave, and ILP concepts
- **FR31**: Users can view visual indicators showing decentralization status (relay count, Arweave confirmation)
- **FR32**: Users can see explanations of why data is permanent and censorship-resistant
- **FR33**: Users can access technical documentation about NIP-34 event structures
- **FR34**: Users can view information about how the frontend is hosted on Arweave

### Performance & Offline Access

- **FR35**: Users can view cached repository data when offline (service worker support)
- **FR36**: Users can see visual indicators of data freshness (e.g., "Last updated 30s ago from 4/5 relays")
- **FR37**: Users can access previously viewed content without re-querying relays
- **FR38**: Users can see loading states during data fetching from decentralized sources
- **FR39**: Users can continue browsing if some relays fail (graceful degradation)

### Accessibility & Responsive Design

- **FR40**: Users can navigate all interactive elements using keyboard only
- **FR41**: Users can access all functionality via screen readers with proper semantic HTML and ARIA labels
- **FR42**: Users can browse repositories on mobile devices with touch-optimized interfaces
- **FR43**: Users can adjust browser zoom to 200% without breaking the layout
- **FR44**: Users can distinguish information by means other than color alone (e.g., diff symbols, not just colors)

### Developer & Ecosystem Integration

- **FR45**: Developers can inspect NIP-34 event structures in the browser DevTools
- **FR46**: Developers can view source code architecture and implementation patterns (GitHub repository)
- **FR47**: Developers can understand relay query logic and Arweave retrieval patterns for reuse
- **FR48**: Users can share ArNS URLs that permanently resolve to specific repositories

## Non-Functional Requirements

### Performance

**Page Load Performance:**
- **NFR-P1**: Repository pages load with Largest Contentful Paint (LCP) <2.5s on standard broadband connections
- **NFR-P2**: User interactions (clicks, navigation) have First Input Delay (FID) <100ms
- **NFR-P3**: Layout shift during content loading (CLS) <0.1
- **NFR-P4**: Time to Interactive (TTI) <3.5s for initial page load
- **NFR-P5**: P95 page load time <3s when querying Nostr relays and retrieving from Arweave

**Multi-Relay Query Performance:**
- **NFR-P6**: Relay queries complete within 3s for ≥90% of requests (at least 1 relay must respond)
- **NFR-P7**: System races queries across 5+ relays in parallel, using first successful response
- **NFR-P8**: Failed relay queries time out within 2s to avoid blocking user experience

**Arweave Retrieval Performance:**
- **NFR-P9**: Arweave gateway requests complete within 3s for ≥95% of file retrievals
- **NFR-P10**: System automatically retries failed gateway requests with alternate gateways within 1s timeout per gateway

**Bundle Size & Load Time:**
- **NFR-P11**: Initial JavaScript bundle size <500KB gzipped
- **NFR-P12**: Total bundle size stays under ArDrive subsidy threshold for free Arweave hosting
- **NFR-P13**: Code-split vendor libraries (React, nostr-tools, Arweave SDK) loaded separately
- **NFR-P14**: Route-based code splitting defers non-critical page loads

**Caching & Offline Performance:**
- **NFR-P15**: Service worker caches static assets for offline access
- **NFR-P16**: Previously viewed content accessible offline via IndexedDB cache
- **NFR-P17**: Stale-while-revalidate strategy shows cached data immediately, updates in background

### Security

**Cryptographic Verification:**
- **NFR-S1**: All Nostr event signatures verified using secp256k1 cryptographic verification before display
- **NFR-S2**: Arweave transaction hashes verified to ensure data integrity
- **NFR-S3**: Invalid signatures rejected with clear error messaging

**Content Security:**
- **NFR-S4**: Content Security Policy (CSP) implemented to prevent XSS attacks from untrusted relay data
- **NFR-S5**: All user-generated content from Nostr events sanitized before rendering in DOM
- **NFR-S6**: No execution of untrusted scripts from external sources

**Network Security:**
- **NFR-S7**: System assumes hostile network environment (untrusted relays, gateways)
- **NFR-S8**: No sensitive user data stored or transmitted (read-only MVP, no authentication)
- **NFR-S9**: All external connections use HTTPS/WSS secure protocols

**Data Integrity:**
- **NFR-S10**: Multi-relay data consistency checks (compare data from multiple relays)
- **NFR-S11**: Arweave transaction ID verification links displayed for user validation
- **NFR-S12**: Permanent audit trail via Arweave storage (immutable data)

### Accessibility

**WCAG 2.1 Level AA Compliance:**
- **NFR-A1**: All functionality accessible via keyboard navigation (no mouse required)
- **NFR-A2**: Logical tab order follows visual layout
- **NFR-A3**: Visible focus indicators on all interactive elements (2px solid border minimum)
- **NFR-A4**: Skip links provided for screen readers ("Skip to main content")

**Screen Reader Compatibility:**
- **NFR-A5**: Semantic HTML structure with proper heading hierarchy (h1 → h2 → h3)
- **NFR-A6**: ARIA labels for all icon-only buttons and interactive elements
- **NFR-A7**: Live regions announce dynamic content updates (e.g., "Repository loaded from 4 relays")
- **NFR-A8**: Descriptive alt text for all images and visual elements

**Visual Accessibility:**
- **NFR-A9**: Color contrast ratios ≥4.5:1 for normal text, ≥3:1 for large text
- **NFR-A10**: Information not conveyed by color alone (diff markers use +/- symbols, not just green/red)
- **NFR-A11**: Minimum 16px body text size with relative units (rem/em) for scalability
- **NFR-A12**: Layout functional at 200% browser zoom without horizontal scrolling

**Touch & Mobile Accessibility:**
- **NFR-A13**: Minimum touch target size 44x44px for all interactive elements
- **NFR-A14**: Mobile-responsive design from 320px viewport width
- **NFR-A15**: Form inputs have associated labels (visible or aria-label)

**Accessibility Testing:**
- **NFR-A16**: Lighthouse accessibility audit score ≥90 in CI/CD pipeline
- **NFR-A17**: Manual keyboard-only navigation testing for core user journeys
- **NFR-A18**: Screen reader testing with VoiceOver (Safari), NVDA (Firefox), JAWS (Chrome)

### Reliability & Availability

**Frontend Uptime:**
- **NFR-R1**: Frontend hosted on Arweave achieves 99%+ availability (limited only by Arweave/ArNS network health)
- **NFR-R2**: Static hosting eliminates server-side failure points

**Graceful Degradation:**
- **NFR-R3**: System functions with minimum 1/5 relays responding successfully
- **NFR-R4**: System continues operating if 2/3 Arweave gateways fail (automatic failover)
- **NFR-R5**: Offline mode displays cached content when no network connectivity
- **NFR-R6**: Clear error messaging when relays/gateways unavailable

**Fault Tolerance:**
- **NFR-R7**: Individual relay failures do not block user workflows
- **NFR-R8**: Gateway failures automatically trigger fallback to alternate gateways
- **NFR-R9**: Network errors display user-friendly messages with retry options

**Data Freshness:**
- **NFR-R10**: Visual indicators show data age ("Last updated 30s ago from 4/5 relays")
- **NFR-R11**: Cache expiration policy: 1 hour TTL for Nostr events, persistent for Arweave data
- **NFR-R12**: Manual refresh option available when cached data is stale

### Integration & Interoperability

**Nostr Protocol Compliance:**
- **NFR-I1**: Full NIP-01 (Basic Protocol) compliance for relay communication
- **NFR-I2**: Full NIP-10 (Threading) compliance for comment/discussion threading
- **NFR-I3**: Full NIP-34 (Git Stuff) compliance for repository event structures
- **NFR-I4**: Event filters conform to Nostr relay specifications

**Relay Integration:**
- **NFR-I5**: Configurable relay list (minimum 5 relays recommended)
- **NFR-I6**: WebSocket connections to relays with automatic reconnection on disconnect
- **NFR-I7**: Relay health monitoring (latency, uptime, event coverage)
- **NFR-I8**: Support for both public and private relay URLs

**Arweave Gateway Integration:**
- **NFR-I9**: Integration with ar.io gateway network for Arweave data retrieval
- **NFR-I10**: Multi-gateway fallback strategy (try 3+ gateways per request)
- **NFR-I11**: Support for custom gateway URLs (user-configurable)
- **NFR-I12**: Gateway health monitoring and automatic routing adjustments

**ArNS Resolution:**
- **NFR-I13**: ArNS name resolution to Arweave transaction IDs <2s
- **NFR-I14**: ArNS SDK integration for permanent naming
- **NFR-I15**: Display both ArNS names and underlying Arweave TX IDs for verification

**Browser Compatibility:**
- **NFR-I16**: Full support for Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- **NFR-I17**: ES2020+ JavaScript feature support (optional chaining, nullish coalescing)
- **NFR-I18**: Web Crypto API for cryptographic verification
- **NFR-I19**: IndexedDB for offline caching
- **NFR-I20**: WebSocket support for relay connections
- **NFR-I21**: Service Worker support for PWA capabilities

### Scalability

**Frontend Scalability:**
- **NFR-SC1**: Static frontend scales infinitely via Arweave decentralized hosting
- **NFR-SC2**: No backend infrastructure limits (all data from decentralized sources)

**Dependency Scalability:**
- **NFR-SC3**: System performance gracefully degrades with increased relay load (automatic load distribution)
- **NFR-SC4**: Gateway selection algorithm distributes load across available ar.io gateways
- **NFR-SC5**: System remains functional if relay/gateway availability drops to 60% of configured sources

**User Growth:**
- **NFR-SC6**: Frontend handles 10x user growth without code changes (static asset delivery)
- **NFR-SC7**: No per-user server costs (all users query public infrastructure)
