---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - '/Users/jonathangreen/Documents/Rig/_bmad-output/planning-artifacts/prd.md'
  - '/Users/jonathangreen/Documents/Rig/_bmad-output/planning-artifacts/architecture.md'
  - '/Users/jonathangreen/Documents/Rig/_bmad-output/planning-artifacts/prd-validation-report.md'
  - '/Users/jonathangreen/Documents/Rig/_bmad-output/planning-artifacts/measurability-validation-report.md'
  - '/Users/jonathangreen/Documents/Rig/docs/PRD-NIP34-Decentralized-Forgejo.md'
  - '/Users/jonathangreen/Documents/Rig/docs/PRD-CHANGES-SUMMARY.md'
  - '/Users/jonathangreen/Documents/Rig/docs/NIP34-EVENT-REFERENCE.md'
workflowType: 'ux-design'
project_name: 'Rig'
user_name: 'Jonathan'
date: '2026-02-24'
---

# UX Design Specification Rig

**Author:** Jonathan
**Date:** 2026-02-24

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

Rig is a decentralized, censorship-resistant code collaboration platform that serves as a true Web3 alternative to GitHub. Built on a three-layer architecture (Nostr for metadata/events, ArNS for permanent naming, Arweave for immutable storage), Rig enables developers to browse repositories through a pure P2P client without accounts, backends, or centralized control.

The frontend is a read-only static application using React + shadcn/ui that queries Nostr relays directly via WebSocket, reconstructs repository data from NIP-34 events, and fetches code from Arweave permanent storage. This creates a browsing experience where no single entity can censor, delete, or control access to code.

**Core Value Proposition:**
- **Permanence**: 200+ year storage guarantees via Arweave
- **Censorship Resistance**: No single point of failure or control
- **True P2P Reads**: Browser queries relays directly, no backend required
- **Ecosystem Proof**: First major application validating the Crosstown pattern scales to production complexity

### Target Users

Rig serves **six distinct personas** with different motivations but shared need for decentralized code hosting:

**1. Alex - Open Source Maintainer (High Technical Skill)**
- **Fear**: GitHub account suspension, years of work disappearing
- **Need**: Censorship-resistant hosting with guaranteed permanence
- **Success Moment**: "No one can take this down. Not GitHub. Not any government. Not anyone."
- **Usage Pattern**: Late-night worry sessions checking repo status, verifying permanence

**2. Jordan - Contributor (Medium-High Technical Skill)**
- **Frustration**: VPN workarounds for blocked GitHub access, slow/unreliable connections
- **Need**: Fast, reliable access from any geographic location
- **Success Moment**: "I'm accessing code without asking any platform for permission"
- **Usage Pattern**: On-the-go patch reviews, mobile access during intermittent connectivity

**3. Sam - Archivist/Researcher (Medium Technical Skill)**
- **Crisis**: Link rot, disappearing repositories (Google Code, Sourceforge)
- **Need**: Permanent, citation-ready URLs for academic references
- **Success Moment**: "These ArNS URLs can go in academic citations"
- **Usage Pattern**: Research desk work, cryptographic verification, long-term archival

**4. Casey - Web3 Developer (High Technical Skill)**
- **Contradiction**: Building decentralized apps while hosting code on centralized GitHub
- **Need**: Tech stack alignment with decentralized ethos
- **Success Moment**: "I can integrate this into my dApp's developer dashboard"
- **Usage Pattern**: Development workflow integration, ecosystem building

**5. Anonymous Visitor - Curious Newcomer (Unknown/Low Technical Skill)**
- **Skepticism**: "Decentralized usually means broken or scam"
- **Need**: Zero-friction browsing without crypto knowledge or accounts
- **Success Moment**: "This actually works. No blockchain wallet required, no crypto needed to browse, just... works."
- **Usage Pattern**: Quick exploration from social media links, casual discovery

**6. Taylor - Ecosystem Builder (High Technical Skill)**
- **Research Question**: "Can the Crosstown pattern work for non-git apps?"
- **Need**: Well-documented architecture to replicate for other applications
- **Success Moment**: "If Rig can do git operations (highly stateful, complex queries), our documentation platform is easier"
- **Usage Pattern**: Deep architecture study with DevTools open, reverse engineering patterns

### Key Design Challenges

**1. Trust Through Transparency**
- **Challenge**: Users need to *see* decentralization working, not just believe marketing claims
- **Complexity**: Show relay connections, Arweave transaction IDs, event signatures WITHOUT overwhelming users
- **Persona Variance**: Anonymous Visitor wants simplicity; Taylor wants DevTools-level detail
- **Design Tension**: Transparency vs. cognitive overload

**2. Performance Perception Management**
- **Challenge**: Multi-relay queries + Arweave fetches inherently slower than centralized GitHub (<3s P95 target vs. <1s typical)
- **Risk**: Users perceive slowness as "broken" rather than "decentralized"
- **Solution Direction**: Make loading feel intentional through progressive status ("Querying 5 Nostr relays...", "Fetching from Arweave...")
- **Success Metric**: Users understand delays = decentralization working, not system failing

**3. Progressive Complexity for Diverse Technical Levels**
- **Challenge**: Serve both crypto-natives (Alex, Casey, Taylor) and complete newcomers (Anonymous Visitor) with same interface
- **Requirement**: Zero crypto/Nostr knowledge required just to browse
- **But Also**: Power users must be able to inspect events, verify signatures, check Arweave transactions
- **Solution Direction**: Progressive disclosure - simple surface, deep dive available on demand

**4. Graceful Degradation & Error Resilience**
- **Challenge**: Relays fail, gateways timeout, networks disconnect frequently in P2P environments
- **Anti-Pattern**: Blank screens, generic "Error 500", confusing technical errors
- **Solution Direction**: "4 out of 5 relays responded" vs. "Error", offline mode with cached data, never blocking user workflows
- **Success Metric**: Users continue browsing despite infrastructure failures

**5. Mobile-Responsive Code Browsing**
- **Challenge**: Code browsing, diffs, file trees, threaded comments are desktop-first experiences
- **But**: Jordan needs mobile access (on-the-go patch reviews, VPN scenarios, geographic restrictions)
- **Constraint**: 320px+ responsive design requirement
- **Solution Direction**: Simplified mobile layouts, collapsible file trees, readable code on small screens

### Design Opportunities

**1. Transparency as Competitive Advantage**
- **Insight**: Instead of hiding decentralization complexity, make it a trust-building feature
- **Implementation**: "Verified on 3 relays" badges, "Stored permanently on Arweave" indicators, visible relay status
- **Differentiation**: GitHub can't show this level of transparency = our unique selling point
- **User Benefit**: Alex and Sam get cryptographic proof; Anonymous Visitor learns through visual cues

**2. Educational UX Without Friction**
- **Opportunity**: Teach users *why* decentralization matters through natural interactions, not documentation
- **Implementation**: "Learn More" tooltips, progressive disclosure, contextual help, inline explanations
- **Journey Design**: Turn Sam's "Aha! These URLs won't rot" moment into designed experience
- **Growth Path**: Help Anonymous Visitor become Casey (advocate who builds on the platform)

**3. GitHub Familiarity Pattern Leverage**
- **Insight**: Users have muscle memory for GitHub's UX (layouts, terminology, keyboard shortcuts)
- **Strategy**: Match GitHub patterns exactly, then add decentralized superpowers on top
- **Benefit**: Near-zero learning curve for developers, immediate productivity
- **Examples**: Same repository structure, same issue tracker layout, same file browser navigation

**4. Offline-First as Speed Advantage**
- **Opportunity**: Service worker caching + IndexedDB makes second visits FASTER than GitHub (no server round-trip)
- **Marketing**: "Works offline" becomes visible, celebrated feature, not hidden technical detail
- **User Benefit**: Jordan's intermittent connectivity scenario transforms from frustration to delight
- **Performance Flip**: Decentralization can beat centralization on cached data access

**5. Citation-Friendly UX Innovation**
- **Unique Use Case**: Sam's archival/citation needs are impossible to serve with centralized platforms (link rot)
- **Opportunity**: One-click "Copy permanent citation" button with multiple formats
- **Implementation**: Generate APA, MLA, BibTeX citations with ArNS URLs + Arweave transaction IDs
- **Market Differentiation**: Make archivists and researchers LOVE this product, build academic adoption

---

## Core User Experience

### Defining Experience

**Core User Loop: Repository Discovery → Exploration → Trust Verification**

The fundamental Rig experience centers on **browsing code with cryptographic proof of permanence**. Unlike GitHub where trust is delegated to a corporation, Rig users directly verify decentralization through visible infrastructure interactions.

**Primary User Flow:**
1. **Discovery**: User arrives at Rig via ArNS URL (e.g., `rig.ar-io.dev`) or shared repository link
2. **Connection**: Browser establishes WebSocket connections to 5+ Nostr relays simultaneously (visible in UI)
3. **Query**: Application queries relays for NIP-34 repository events (visible loading states)
4. **Reconstruction**: Repository metadata reconstructed from relay responses (shows which relays responded)
5. **Fetch**: Code content fetched from Arweave permanent storage (shows transaction IDs)
6. **Browse**: User navigates repository structure, views files, explores commits, reads issues/PRs
7. **Verify**: User can inspect event signatures, check Arweave permanence proofs, validate relay consensus
8. **Share**: User shares ArNS permanent links with confidence they won't rot

**Trust-Building Through Transparency:**
- Every action shows its decentralized nature: "Verified on 3 of 5 relays" badges, Arweave transaction links, event signature checksums
- Users aren't asked to "trust" decentralization—they see it working in real-time
- Progressive disclosure: Simple surface for browsing, deep verification available on demand

**Success Moment Definition:**
A user successfully experiences Rig when they think: *"I can see this isn't controlled by any single entity. This code truly can't be taken down."*

### Platform Strategy

**Web-First Pure Static Deployment**

Rig is a **single-page React application** deployed as static files to ArDrive, served via ArNS (`rig.ar-io.dev`). No backend servers, no databases, no centralized infrastructure.

**Architectural Constraints:**
- **Pure Frontend**: All logic runs in browser (React 19 + TypeScript + Vite)
- **Direct P2P**: WebSocket connections to Nostr relays (no proxy servers)
- **Immutable Deployment**: Each version published to Arweave with new transaction ID
- **Permanent URLs**: ArNS provides stable naming layer over Arweave content addresses

**Desktop + Mobile Responsive**

**Desktop Experience (Primary Development Target):**
- **Screen Size**: Optimized for 1280px+ displays
- **Interaction Model**: Mouse + keyboard navigation, hover states, keyboard shortcuts
- **Information Density**: Rich layouts with sidebars, split views, file trees
- **Power User Features**: Keyboard navigation (`j/k` for files, `?` for help), multi-panel layouts

**Mobile Experience (Fully Supported):**
- **Screen Size**: Responsive down to 320px width (iPhone SE)
- **Interaction Model**: Touch-optimized tap targets (44x44px minimum), swipe gestures
- **Information Density**: Simplified layouts, collapsible sections, bottom sheets
- **Critical Use Cases**: On-the-go code review (Jordan's patch review scenario), quick repository lookup

**Responsive Breakpoints:**
- **320-767px (Mobile)**: Single column, stacked layouts, hamburger navigation
- **768-1023px (Tablet)**: Hybrid layouts, collapsible sidebars
- **1024px+ (Desktop)**: Full multi-column layouts, persistent sidebars

**Offline-Capable Progressive Web App**

**Service Worker Caching Strategy:**
- **Application Shell**: React bundle, CSS, static assets cached on first load
- **Nostr Events**: Repository metadata cached in IndexedDB after first fetch
- **Arweave Content**: Code files cached in IndexedDB with LRU eviction
- **Relay Status**: Background sync when online, graceful degradation when offline

**Offline Capabilities:**
1. **Browse Previously Viewed Repositories**: Full navigation of cached repos
2. **View Cached Code Files**: Read cached file content without network
3. **Inspect Cached Events**: View repository metadata, commits, issues from cache
4. **Queue Actions**: (Future write capability) Queue pushes/comments for sync when online

**Online/Offline Indicator:**
- Persistent status badge showing: "Online - 5 relays connected" or "Offline - Viewing cached data"
- Users always know their connection state

**Performance Target:**
- **First Load (Cold Cache)**: LCP <2.5s on broadband
- **Repeat Load (Warm Cache)**: LCP <1s (faster than GitHub via service worker)
- **Offline Load**: LCP <500ms (pure cache, no network)

### Effortless Interactions

Rig must feel **simpler than GitHub**, not more complex, despite underlying decentralized infrastructure.

**1. Zero Authentication for Browsing**

**Interaction:** User opens `rig.ar-io.dev` → sees repository list immediately (no login wall, no account creation, no crypto wallet)

**Implementation:**
- No auth modals, no "Sign in to continue" prompts
- Browse all public repositories anonymously
- Future write operations (push, comment) require ILP wallet (progressive disclosure)

**User Benefit:** Eliminates friction for Anonymous Visitor persona ("This actually works. No blockchain wallet required")

**2. Automatic Multi-Relay Failover**

**Interaction:** User clicks repository → application queries 5 relays simultaneously → displays results from first 3 responders → continues displaying if 2 more relays timeout

**Implementation:**
- Race multiple relay queries in parallel
- Display content as soon as minimum threshold met (e.g., 2 of 5 relays agree)
- Never block on slow/failed relays
- Show transparent status: "Loaded from 3 of 5 relays" (not just "Loading...")

**User Benefit:** Eliminates perception that decentralization = slow/unreliable

**3. Progressive Loading with Meaningful Status**

**Interaction:** User navigates to repository → sees granular loading states:
- "Connecting to Nostr relays..." (0-500ms)
- "Querying 5 relays for repository events..." (500ms-2s)
- "Fetching code from Arweave..." (2s-3s)
- "Loading complete - Verified on 4 of 5 relays" (3s+)

**Implementation:**
- Never show generic "Loading..." spinner
- Each loading state explains what's happening in decentralized infrastructure
- Users learn about architecture through natural interactions

**User Benefit:** Delays feel intentional (showing decentralization working) rather than broken

**4. GitHub-Familiar Navigation Patterns**

**Interaction:** Keyboard shortcuts, URL patterns, layout structures match GitHub exactly

**Examples:**
- `<owner>/<repo>` URL structure (e.g., `rig.ar-io.dev/nostr/rig`)
- `j/k` keys navigate file lists
- `t` activates fuzzy file finder
- `?` shows keyboard shortcuts
- Repository tabs: Code | Issues | Pull Requests (same order as GitHub)

**Implementation:**
- GitHub-compatible keyboard shortcut library
- Identical visual hierarchy and layout structure
- Same terminology (repository, not "project"; pull request, not "merge request")

**User Benefit:** Zero learning curve for developers, immediate productivity

**5. One-Click Permanent Citations**

**Interaction:** User viewing any file/commit → clicks "Copy Permanent Link" button → gets dropdown with citation formats:
- **Plain URL**: `https://rig.ar-io.dev/owner/repo/blob/commit-hash/file.ts`
- **Arweave TX**: `https://arweave.net/tx-id`
- **BibTeX**: Pre-formatted citation with ArNS URL + Arweave TX ID
- **APA/MLA**: Pre-formatted academic citation

**Implementation:**
- Citation generator utility
- Clipboard API integration
- Format templates for major citation styles

**User Benefit:** Serves Sam's archival use case, builds academic adoption

**6. Inline Verification Without Disruption**

**Interaction:** User browses normally → sees subtle verification indicators → can click to expand cryptographic details

**Examples:**
- Repository card shows: ✓ "Verified on 4 relays" (collapsed)
- Click expands: List of relay URLs, event signature, Arweave TX link
- Commit shows: Arweave icon with TX ID (collapsed)
- Click expands: Full transaction details, storage guarantee, gateway link

**Implementation:**
- Progressive disclosure pattern
- Collapsed state for normal browsing
- Expanded state for verification-focused users

**User Benefit:** Serves both Anonymous Visitor (wants simplicity) and Taylor (wants DevTools-level detail)

**7. Graceful Degradation with Transparency**

**Interaction:** 3 of 5 relays fail → user sees: "Loaded from 2 relays (3 unavailable)" → browsing continues normally → clicking badge shows which relays failed and why

**Implementation:**
- Never fail completely unless ALL relays down
- Always show what succeeded vs. failed
- Provide actionable information (retry button, relay status page link)

**User Benefit:** Eliminates fear that decentralization = fragile

### Critical Success Moments

Users form lasting impressions in the first seconds/minutes. Rig must nail these moments.

**First 3 Seconds: "This Actually Works"**

**User Mental State:** Skepticism ("Decentralized usually means broken or scam")

**Success Criteria:**
- Homepage loads fast (LCP <2.5s)
- Repository list visible immediately
- No account wall, no crypto wallet popup, no confusing terminology
- Visual design feels polished (not prototype-quality)

**User Thought:** *"Okay, this looks legitimate. I can browse without jumping through hoops."*

**Implementation Priorities:**
- Aggressive bundle size optimization (<500KB initial)
- Instant repository list render (even if still loading in background)
- GitHub-level design polish (shadcn/ui components, professional typography)

**First 10 Seconds: "I See It's Decentralized"**

**User Mental State:** Curiosity ("How is this different from GitHub?")

**Success Criteria:**
- Visible relay connections in UI ("Querying 5 Nostr relays...")
- Repository cards show verification badges ("✓ Verified on 4 relays")
- Arweave permanence indicators on commits/files
- Loading states explain what's happening ("Fetching from Arweave...")

**User Thought:** *"I can see this querying multiple relays. This isn't talking to a single server."*

**Implementation Priorities:**
- Transparent loading states with relay count
- Visible verification badges on repository cards
- Arweave transaction icons/links

**First 30 Seconds: "I Can Browse Code"**

**User Mental State:** Evaluation ("Can I actually use this for work?")

**Success Criteria:**
- User navigates to repository detail page
- Views file tree, browses files, sees syntax highlighting
- Reads README, explores commits, checks issues
- Experience feels as fast as GitHub (cached relays + Arweave)

**User Thought:** *"This works like GitHub. I can browse code without learning a new interface."*

**Implementation Priorities:**
- Fast file tree rendering
- Syntax highlighting for 20+ languages
- GitHub-compatible file viewer layout

**First 1 Minute: "This Can't Be Taken Down"**

**User Mental State:** Trust verification ("Is this marketing hype or real?")

**Success Criteria:**
- User clicks "Verify Permanence" button on commit → sees Arweave transaction details with 200+ year storage guarantee
- User clicks relay status badge → sees list of responding relays with latencies
- User clicks event signature → sees cryptographic verification details

**User Thought:** *"I can verify these claims. This really is permanent and decentralized."*

**Implementation Priorities:**
- Arweave transaction detail modal
- Relay status panel with live connection info
- Event signature verification panel

**First 5 Minutes: "I Want to Share This"**

**User Mental State:** Advocacy ("This is cool, I should tell others")

**Success Criteria:**
- User copies repository ArNS link to share
- User screenshots relay verification badge for social media
- User bookmarks Rig as GitHub alternative
- User checks if their own projects are on Rig

**User Thought:** *"People need to know about this. Especially projects worried about censorship."*

**Implementation Priorities:**
- One-click link sharing
- Social media OpenGraph tags for shared links
- Prominent "Add Your Repository" CTA (even if disabled in read-only phase)

**First Hour: "I Understand the Vision"**

**User Mental State:** Deep understanding ("How does this fit into broader Web3 ecosystem?")

**Success Criteria:**
- User reads architecture documentation
- User explores example repository demonstrating Crosstown pattern
- User joins community chat/Discord
- User considers building on Rig infrastructure

**User Thought (Taylor persona):** *"If Rig can do git operations, our project is easier. This validates the pattern."*

**Implementation Priorities:**
- Link to architecture.md documentation
- Example "meta" repository showcasing Rig's own source
- Community links in footer
- "Powered by Crosstown Pattern" branding

### Experience Principles

**1. Transparency Over Abstraction**

**Principle:** Show decentralized infrastructure working, don't hide it.

**Application:**
- ✅ **Do:** "Verified on 4 of 5 Nostr relays (relay1.com, relay2.com, relay3.com, relay4.com)"
- ❌ **Don't:** "Loaded successfully" (hides that it's decentralized)

**Rationale:** Trust comes from seeing the system work, not from marketing claims. Users should witness multi-relay consensus, Arweave permanence, and cryptographic verification through natural interactions.

**2. Progressive Disclosure: Simple Surface, Deep Verification**

**Principle:** Serve both crypto newcomers and power users with same interface through progressive complexity.

**Application:**
- **Layer 1 (Default):** Repository card shows "✓ Verified" badge (simple)
- **Layer 2 (Hover):** Tooltip shows "Verified on 4 of 5 relays" (intermediate)
- **Layer 3 (Click):** Panel shows relay URLs, latencies, event signatures (expert)

**Rationale:** Anonymous Visitor needs zero friction to browse; Taylor needs DevTools-level detail. Progressive disclosure serves both without compromise.

**3. Familiarity First, Innovation Second**

**Principle:** Match GitHub UX exactly, then add decentralized superpowers on top.

**Application:**
- **GitHub Pattern:** Repository has Code | Issues | Pull Requests tabs (familiar)
- **Rig Innovation:** Each tab shows Nostr relay source badges (innovation)
- **Result:** Users navigate with muscle memory, discover decentralization naturally

**Rationale:** Developers have 15+ years of GitHub muscle memory. Breaking conventions adds friction. Matching conventions builds trust, then surprises with decentralized benefits.

**4. Performance Delays Must Tell a Story**

**Principle:** If something takes time, explain WHY in a way that builds trust.

**Application:**
- ❌ **Generic:** "Loading..." (user thinks: broken or slow)
- ✅ **Storytelling:** "Querying 5 Nostr relays... Relay 1 responded (45ms), Relay 2 responded (89ms), Relay 3 responded (102ms)..." (user thinks: wow, it's checking multiple sources)

**Rationale:** Multi-relay queries + Arweave fetches are inherently slower than centralized GitHub. Users must understand delays = decentralization working, not system failing.

**5. Offline Capability = Competitive Advantage**

**Principle:** Treat offline mode as a celebrated feature, not a fallback.

**Application:**
- Persistent online/offline indicator shows: "Offline Mode - Viewing 12 cached repositories" (not hidden)
- Offline browsing is faster than GitHub (pure cache, no network)
- Marketing positions this as censorship resistance ("Works even if relays go down")

**Rationale:** Service worker caching enables offline browsing. This transforms decentralization "weakness" (multiple network hops) into unique strength (works without internet).

**6. Errors Are Learning Opportunities**

**Principle:** When something fails, educate users about decentralized infrastructure resilience.

**Application:**
- ❌ **Generic:** "Error loading repository"
- ✅ **Educational:** "2 of 5 relays timed out, but we loaded the repository from the 3 responding relays. Decentralization means no single point of failure. [Retry All Relays]"

**Rationale:** Relay failures are inevitable in P2P systems. Instead of hiding failures, show how the system continues working despite failures. This builds trust in decentralized architecture.

---

## Desired Emotional Response

### Primary Emotional Goals

**Core Emotional Transformation: Skepticism → Trust → Advocacy**

Rig's primary emotional objective is to transform users from initial skepticism about decentralized technology into deep trust through verifiable proof, ultimately creating advocates who promote censorship-resistant infrastructure.

**Primary Emotions:**

1. **Empowered and In Control**
   - **Manifestation**: Users feel sovereign over their code, free from platform dependency
   - **Trigger**: Realizing no single entity can censor, delete, or revoke access
   - **Success Indicator**: "No one can take this down. Not GitHub. Not any government. Not anyone." (Alex persona)

2. **Confident and Trusting**
   - **Manifestation**: Users understand how decentralization works through transparent, visible infrastructure
   - **Trigger**: Seeing relay connections, event signatures, Arweave permanence proofs in real-time
   - **Success Indicator**: Moving from "Is this real?" to "I can verify this is real"

3. **Relieved and Secure**
   - **Manifestation**: Freedom from anxiety about account suspension, platform changes, link rot
   - **Trigger**: 200+ year storage guarantees, permanent ArNS URLs, cryptographic verification
   - **Success Indicator**: Peace of mind when sharing links in academic papers (Sam persona) or hosting controversial code (Alex persona)

4. **Surprised and Delighted**
   - **Manifestation**: Decentralized technology that defies expectations by actually working smoothly
   - **Trigger**: "This actually works. No blockchain wallet required, no crypto needed to browse, just... works." (Anonymous Visitor persona)
   - **Success Indicator**: Users share Rig with friends/colleagues unprompted

5. **Validated and Inspired**
   - **Manifestation**: Web3 builders see proof that decentralized patterns scale to production complexity
   - **Trigger**: "If Rig can do git operations (highly stateful, complex queries), our documentation platform is easier" (Taylor persona)
   - **Success Indicator**: Ecosystem builders replicate Crosstown pattern for other applications

**Emotional Differentiator vs. GitHub:**

- **GitHub**: Trust through corporate reputation and convenience (delegation model)
- **Rig**: Trust through cryptographic verification and transparency (sovereignty model)

The emotional shift is from *"I trust GitHub because it's big and reliable"* to *"I trust Rig because I can verify it's decentralized and permanent."*

### Emotional Journey Mapping

**Stage 1: Discovery (0-3 seconds)**

**Current Emotional State**: Skepticism, cautious curiosity
- **User Thought**: "Decentralized usually means broken or scam. Let's see if this actually works."
- **Emotional Need**: Quick proof of legitimacy
- **Design Response**: Professional design quality, immediate functionality, no account walls
- **Target Emotion**: Cautious optimism ("Okay, this looks legitimate")

**Stage 2: First Interaction (3-30 seconds)**

**Current Emotional State**: Evaluation, comparison to GitHub
- **User Thought**: "Can I actually use this for work? How is this different?"
- **Emotional Need**: Familiarity + visible differentiation
- **Design Response**: GitHub-compatible navigation, visible relay connections, transparent loading states
- **Target Emotion**: Confident curiosity ("This works like GitHub, but I can see it's decentralized")

**Stage 3: Core Experience (30 seconds - 1 minute)**

**Current Emotional State**: Active engagement, trust building
- **User Thought**: "Is this marketing hype or real permanence?"
- **Emotional Need**: Verifiable proof of decentralization
- **Design Response**: Arweave transaction links, relay verification badges, event signature inspection
- **Target Emotion**: Growing trust ("I can verify these claims. This really is permanent.")

**Stage 4: Task Completion (1-5 minutes)**

**Current Emotional State**: Satisfaction, decision-making
- **User Thought**: "Should I tell others about this? Should I use it for my projects?"
- **Emotional Need**: Desire to share, confidence in recommendation
- **Design Response**: Easy link sharing, permanent citations, visible ecosystem indicators
- **Target Emotion**: Advocacy ("People need to know about this")

**Stage 5: Return Visit (Second session)**

**Current Emotional State**: Habit formation, loyalty assessment
- **User Thought**: "Is this better than GitHub for my workflow?"
- **Emotional Need**: Continued value delivery, performance
- **Design Response**: Offline mode faster than GitHub (service worker cache), cached repositories accessible without network
- **Target Emotion**: Delight + loyalty ("This is actually better in some ways")

**Failure/Error State (Any stage)**

**Current Emotional State**: Potential frustration, system distrust
- **User Thought**: "I knew decentralized tech was unreliable"
- **Emotional Need**: Reassurance, understanding, resilience proof
- **Design Response**: Transparent failures ("2 of 5 relays timed out, but loaded from 3"), educational error messages, graceful degradation
- **Target Emotion**: Informed confidence ("Even failures prove the system is resilient")

### Micro-Emotions

**Critical Emotional States That Determine Success:**

**1. Trust vs. Skepticism (HIGHEST PRIORITY)**

**Why Critical**: Overcoming "decentralized = broken/scam" perception is the fundamental barrier to adoption.

**Emotional Spectrum:**
- **Negative Pole**: "This is vaporware. Decentralized tech never works as advertised."
- **Target State**: "I can cryptographically verify permanence. This is real."

**Design Levers:**
- Show relay connections in real-time (transparency)
- Link to Arweave transaction IDs (verifiability)
- Display event signatures with verification status (cryptographic proof)
- Expose which relays responded vs. failed (honesty about infrastructure)

**Success Metric**: Anonymous Visitor persona converts from skeptic to advocate within first 5 minutes.

**2. Confidence vs. Confusion (HIGH PRIORITY)**

**Why Critical**: Decentralized infrastructure is inherently more complex than centralized. Users must understand without feeling overwhelmed.

**Emotional Spectrum:**
- **Negative Pole**: "What's a relay? What's Arweave? Why is this taking so long?"
- **Target State**: "I understand this is querying multiple sources for consensus. That's why it's trustworthy."

**Design Levers:**
- Meaningful loading states ("Querying 5 Nostr relays..." not "Loading...")
- Educational micro-copy in tooltips ("Learn More" links)
- Progressive disclosure (simple surface, deep detail available)
- GitHub-familiar patterns (reduce cognitive load on navigation)

**Success Metric**: Users comprehend decentralization benefits from natural interactions without reading documentation.

**3. Delight vs. Satisfaction (MEDIUM-HIGH PRIORITY)**

**Why Critical**: Creates advocates who promote Rig organically. Functional satisfaction = retention. Delight = growth.

**Emotional Spectrum:**
- **Negative Pole**: "This works fine. It's like GitHub but slower."
- **Target State**: "Wow, offline mode is FASTER than GitHub. And these permanent citations are brilliant."

**Design Levers:**
- Celebrate offline capability as feature ("You're offline, but Rig still works!")
- One-click citation generator (unique value for Sam persona)
- Visual permanence timeline ("Accessible until year 2226")
- Performance surprises (cached second visits faster than GitHub)

**Success Metric**: Users share Rig on social media unprompted, highlighting unique features.

**4. Accomplishment vs. Frustration (MEDIUM PRIORITY)**

**Why Critical**: P2P infrastructure has inherent latency vs. centralized GitHub. Users must feel productive, not blocked.

**Emotional Spectrum:**
- **Negative Pole**: "Why is this taking so long? GitHub loads instantly."
- **Target State**: "Loading takes a moment because it's verifying across multiple relays. That's the tradeoff for permanence."

**Design Levers:**
- Progress indicators that explain delays (storytelling loading states)
- Never block on slow relays (display content from fast responders)
- Skeleton loaders (perceived performance)
- Transparent about why things take time (education)

**Success Metric**: Users accept 3-second load times without perceiving system as "slow" or "broken."

**5. Belonging vs. Isolation (MEDIUM PRIORITY)**

**Why Critical**: Users need to feel part of a movement, not using niche/fringe technology.

**Emotional Spectrum:**
- **Negative Pole**: "Am I the only person using this? Is this dead?"
- **Target State**: "There's an active ecosystem building on this pattern. I'm part of something important."

**Emotional Design:**
- Show repository count, active projects, ecosystem growth
- Community links visible (Discord, GitHub discussions)
- "Powered by Crosstown Pattern" branding
- Taylor persona's ecosystem builder journey

**Success Metric**: Users perceive Rig as "growing movement" not "abandoned experiment."

**6. Excitement vs. Anxiety (LOWER PRIORITY)**

**Why Lower Priority**: Once trust and confidence are established, excitement follows naturally.

**Emotional Spectrum:**
- **Negative Pole**: "Do I need a crypto wallet? Do I need to buy tokens?"
- **Target State**: "I can browse without any blockchain knowledge. Write operations will need ILP wallet, but I understand why."

**Design Levers:**
- Zero-auth browsing (no wallet popup on first visit)
- Progressive disclosure of write capabilities
- Plain language, avoid crypto jargon
- ILP wallet explanation only when needed (future write operations)

**Success Metric**: Anonymous Visitor browses successfully without encountering crypto concepts.

### Design Implications

**Emotion-Driven UX Decisions:**

**To Build TRUST (Skepticism → Verification):**

1. **Transparent Infrastructure Visibility**
   - Display relay connection status: "Connected to 5 relays" with latency indicators
   - Show Arweave transaction IDs for every commit/file
   - Expose event signatures with verification status
   - **Rationale**: Trust requires proof, not promises

2. **Progressive Verification Depth**
   - **Layer 1 (Default)**: "✓ Verified on 4 relays" badge
   - **Layer 2 (Hover)**: Tooltip showing relay names
   - **Layer 3 (Click)**: Panel with full relay URLs, event signatures, Arweave TX links
   - **Rationale**: Serves both Anonymous Visitor (simple) and Taylor (deep inspection)

3. **Honest Failure Communication**
   - Show partial success: "Loaded from 3 of 5 relays (2 timed out)"
   - Explain what failed and why: "relay.example.com: Connection timeout after 5s"
   - Prove resilience: "No single point of failure - system continues working"
   - **Rationale**: Transparency about failures builds more trust than hiding them

4. **Cryptographic Proof On Demand**
   - Every claim linkable to verifiable source (Arweave transaction, relay event)
   - "Verify Permanence" button links to Arweave explorer
   - Event signature verification panel available on all events
   - **Rationale**: "Trust but verify" - give users tools to verify

**To Build CONFIDENCE (Confusion → Understanding):**

1. **Meaningful Status Communication**
   - ❌ Generic: "Loading..."
   - ✅ Educational: "Querying 5 Nostr relays for repository events..."
   - ✅ Storytelling: "Relay 1 responded (45ms), Relay 2 responded (89ms)..."
   - **Rationale**: Users learn about architecture through natural interactions

2. **GitHub-Compatible Patterns**
   - Same keyboard shortcuts (`j/k`, `t`, `?`)
   - Same URL structure (`owner/repo/blob/commit/file`)
   - Same visual hierarchy (repository tabs, file tree layout)
   - **Rationale**: Leverage 15+ years of GitHub muscle memory

3. **Progressive Disclosure Education**
   - Tooltips explain concepts without interrupting flow
   - "Learn More" links for deep dives (optional)
   - First-time user hints (dismissible)
   - **Rationale**: Educate without overwhelming

4. **Always-Visible System Status**
   - Persistent online/offline indicator
   - Relay connection count in header
   - Cache status when offline
   - **Rationale**: Users should never wonder "Is this working?"

**To Create DELIGHT (Satisfaction → Advocacy):**

1. **Celebrate Offline Capability**
   - Positive framing: "You're offline, but Rig still works!"
   - Show cached repository count: "12 repositories available offline"
   - Frame as censorship resistance: "This is decentralization in action"
   - **Rationale**: Transform "weakness" (P2P complexity) into strength (offline resilience)

2. **Performance Surprises**
   - Second visit faster than GitHub (service worker cache)
   - Show speed comparison: "Loaded in 450ms (typical GitHub: 800ms)"
   - **Rationale**: Exceed expectations with cached performance

3. **Unique Value Moments**
   - One-click citation generator (APA, MLA, BibTeX with permanent URLs)
   - Permanence timeline visualization ("Accessible until 2226")
   - Relay consensus visualization (animated relay responses)
   - **Rationale**: Features GitHub can't offer = differentiation

4. **Shareability**
   - One-click permanent link copying
   - Social media preview optimization (OpenGraph tags)
   - "Powered by Rig" badges for embedding
   - **Rationale**: Make advocacy easy

**To Prevent FRUSTRATION (Accomplishment vs. Blocking):**

1. **Never Block on Slow Infrastructure**
   - Display content from first N responding relays (don't wait for all)
   - Parallel relay queries (race condition)
   - Timeout slow relays gracefully
   - **Rationale**: P2P latency is inherent, mitigate impact

2. **Skeleton Loaders for Perceived Performance**
   - Show layout structure while data loads
   - Avoid blank screens (feel "broken")
   - Progressive rendering as data arrives
   - **Rationale**: Users tolerate delays better when they see progress

3. **Explain Performance Tradeoffs**
   - "Loading takes a moment while we verify across 5 relays" (education)
   - Help users understand: delay = security benefit
   - **Rationale**: Informed users accept necessary tradeoffs

**To Foster BELONGING (Isolation → Community):**

1. **Ecosystem Visibility**
   - Show total repository count on homepage
   - "Trending repositories" feed
   - Active project highlights
   - **Rationale**: Prove this is a living ecosystem

2. **Community Presence**
   - Discord/community links in footer
   - "Join the Movement" CTA
   - Crosstown Pattern branding
   - **Rationale**: Connect users to broader community

3. **Contribution Pathways**
   - "Add Your Repository" CTA (even if disabled in read-only phase)
   - "Help Build the Ecosystem" links
   - **Rationale**: Invite participation, build ownership

### Emotional Design Principles

**Guiding Principles for Creating the Right Emotional Experience:**

**1. Transparency Builds Trust, Abstraction Breeds Skepticism**

**Principle**: Every decentralized component should be visible and verifiable, not hidden behind abstractions.

**Application**:
- Show relay connections, don't hide them
- Link to Arweave transactions, don't just say "permanent"
- Display event signatures, don't just say "verified"

**Anti-Pattern**: GitHub-style black box ("It just works, trust us")

**Rig Pattern**: Glass box ("You can see how it works, verify it yourself")

**Emotional Impact**: Skepticism → Trust through visible proof

---

**2. Delays Must Tell a Story, Not Signal Failure**

**Principle**: Multi-relay queries and Arweave fetches are inherently slower than centralized GitHub. Users must understand delays = decentralization working, not system failing.

**Application**:
- Loading states explain what's happening: "Querying 5 relays..."
- Show relay response times: "Relay 1: 45ms, Relay 2: 89ms..."
- Frame delays as security/permanence benefits

**Anti-Pattern**: Generic "Loading..." (users think: slow/broken)

**Rig Pattern**: "Verifying across 5 relays..." (users think: thorough/secure)

**Emotional Impact**: Frustration → Confidence through understanding

---

**3. Progressive Disclosure: Everyone Gets What They Need**

**Principle**: Serve crypto newcomers and power users with the same interface through layered complexity.

**Application**:
- **Layer 1**: Simple indicators ("✓ Verified")
- **Layer 2**: Intermediate details (hover tooltips with relay count)
- **Layer 3**: Expert inspection (click for full event signatures, Arweave TX)

**Anti-Pattern**: Forcing all users through crypto complexity or dumbing down for everyone

**Rig Pattern**: Simple surface, deep verification available on demand

**Emotional Impact**: Anonymous Visitor not overwhelmed, Taylor can deep dive

---

**4. Familiarity First, Then Surprise**

**Principle**: Match GitHub UX exactly to reduce friction, then add decentralized superpowers that delight.

**Application**:
- GitHub-compatible navigation, then + relay verification badges
- GitHub-compatible shortcuts, then + offline mode
- GitHub-compatible layouts, then + permanence proofs

**Anti-Pattern**: Redesigning Git UX "better" (adds learning curve)

**Rig Pattern**: GitHub muscle memory works, discover decentralization naturally

**Emotional Impact**: Confidence (familiar) → Delight (unexpected benefits)

---

**5. Failures Should Prove Resilience, Not Undermine Trust**

**Principle**: Relay timeouts and gateway failures are inevitable in P2P systems. Show how the system continues working despite failures.

**Application**:
- "2 of 5 relays timed out, but we loaded successfully from 3 remaining relays"
- Explain: "This is decentralization - no single point of failure"
- Offer: [Retry All Relays] button for user control

**Anti-Pattern**: Generic "Error loading repository" (feels broken)

**Rig Pattern**: "Partial failure, full functionality" (proves resilience)

**Emotional Impact**: Anxiety → Confidence in system robustness

---

**6. Offline is a Feature, Not a Fallback**

**Principle**: Service worker caching enables offline browsing. This is a competitive advantage, not a limitation to hide.

**Application**:
- Celebrate offline mode: "You're offline, but Rig still works!"
- Show cache stats: "12 repositories available offline"
- Frame as censorship resistance: "Works even if relays go down"

**Anti-Pattern**: Hiding offline status, treating it as degraded mode

**Rig Pattern**: Offline mode is faster than GitHub, marketed as feature

**Emotional Impact**: Anxiety (disconnected) → Delight (it works better!)

---

**7. Education Through Interaction, Not Documentation**

**Principle**: Users should learn why decentralization matters through natural product interactions, not separate documentation.

**Application**:
- Loading states teach about relays and consensus
- Error messages teach about resilience
- Verification badges teach about cryptographic proof
- Offline mode teaches about censorship resistance

**Anti-Pattern**: Requiring users to read architecture docs to understand value

**Rig Pattern**: "Show, don't tell" - users learn by using

**Emotional Impact**: Confusion → Understanding through natural discovery

---

**8. Make Advocacy Easy and Rewarding**

**Principle**: Delighted users become advocates if given easy sharing tools and clear value propositions.

**Application**:
- One-click permanent link copying
- Citation generator for academic use
- Social media optimization (OpenGraph previews)
- "Share this repository" CTA with messaging suggestions

**Anti-Pattern**: Assuming users will figure out how to share on their own

**Rig Pattern**: Frictionless sharing with pre-crafted value propositions

**Emotional Impact**: Satisfaction → Advocacy through easy promotion

---

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

We analyzed two primary inspiration sources that directly inform Rig's UX design:

**1. GitHub - Industry Standard for Code Hosting**

**Core Problem Solved Elegantly:**
- **Code collaboration at scale**: Millions of developers can discover, contribute to, and maintain projects
- **Git complexity abstraction**: Makes Git (inherently complex) accessible through visual diff viewers, PR workflows, branch management UI
- **Social coding**: Transforms version control into a social network (stars, follows, activity feeds)

**Onboarding Excellence:**
- **Zero friction for browsing**: No account required to view public repos
- **Progressive feature disclosure**: Basic features (view code) → Intermediate (fork, star) → Advanced (PR creation, CI/CD)
- **Familiar patterns**: Even new users understand "repository" concept from folder metaphor

**Navigation & Information Hierarchy:**
- **Persistent context bar**: Owner/Repo name always visible, tab navigation (Code/Issues/PRs)
- **File tree + content split view**: Left sidebar for structure, main panel for content
- **Breadcrumb navigation**: Clear path hierarchy in file browser
- **Keyboard shortcuts**: Power users can navigate entirely via keyboard (`j/k`, `t`, `?`)

**Innovative & Delightful Interactions:**
- **Fuzzy file finder** (`t` key): Instant file search without leaving keyboard
- **Inline code comments**: Attach discussions directly to line numbers
- **Syntax highlighting**: 200+ languages automatically detected
- **Blame view**: See commit history per line with author info
- **Compare view**: Visual diffs with side-by-side or unified modes

**Visual Design Excellence:**
- **Monospace consistency**: Code always in monospace fonts, UI in system fonts (clear distinction)
- **Color-coded diffs**: Green (additions), red (deletions), yellow (modifications)
- **White/dark mode**: Professional, accessible color schemes
- **Minimal chrome**: Interface gets out of the way, code is primary focus

**Error Handling:**
- **404 pages with search**: "Repository not found" → suggests similar repos or search
- **Empty states**: "No issues yet" with clear CTA to create first issue
- **Rate limiting**: Clear messaging about API limits with countdown timers

---

**2. Forgejo - Self-Hosted Git Platform**

**Core Problem Solved Elegantly:**
- **Self-hosted Git freedom**: Full GitHub-like experience without SaaS lock-in
- **Privacy-first collaboration**: No tracking, no external dependencies, complete data sovereignty
- **Lightweight performance**: Fast server-rendered pages with progressive enhancement (Vue.js for interactive features)

**Onboarding Excellence:**
- **Familiar GitHub patterns**: Deliberately mimics GitHub UX so users have zero learning curve
- **Server-side rendering first**: Pages load fast even without JavaScript (progressive enhancement)
- **Minimal dependencies**: Works with minimal resources, no heavy client framework required

**Navigation & Information Hierarchy:**
- **Three-level hierarchy**:
  - **Primary**: Owner/Repo header (always visible)
  - **Secondary**: Repository menu (commits/branches/tags stats)
  - **Tertiary**: Tab navigation (Code/Issues/PRs)
- **Responsive labels**: Uses `.not-mobile` and `.only-mobile` classes to optimize for different screens
- **Contextual buttons**: Action buttons grouped logically (Watch/Star/Fork together)

**Innovative & Delightful Interactions:**
- **Language statistics bar**: Collapsible visual breakdown of repository languages with color-coded percentages
- **Repository size tooltip**: Shows detailed breakdown (Git LFS, files, releases) on hover
- **Icon-based mobile navigation**: Replaces text labels with tooltips on small screens
- **Branch/tag dropdowns**: Inline filtering and switching without page reload
- **Citation support**: Built-in `@citation-js` libraries (BibTeX, software citation formats)

**Visual Design Excellence:**
- **Fomantic UI design system**: Consistent, accessible component library (Semantic UI fork)
- **Octicons**: GitHub-compatible SVG icons for familiarity
- **Muted link colors**: Subtle hierarchy (`.muted` class for secondary navigation)
- **Tailwind utilities**: Modern utility classes for spacing/flex (`tw-` prefixed)
- **Segment-based layouts**: Clear visual grouping of related information

**Error Handling:**
- **Archived repository warnings**: Yellow warning banner explaining archive status with date
- **Permission-based UI**: Buttons disabled with tooltips explaining why (e.g., "no permission to accept transfer")
- **Empty states**: "No description" with italic styling rather than blank space
- **Progressive feature visibility**: Admin-only features hidden from regular users

**Tech Stack Insights:**
- **Backend**: Go templates (`.tmpl` files)
- **Frontend**: Vue.js components for interactive features
- **Styling**: Fomantic UI + Tailwind CSS utilities
- **Icons**: Octicons (GitHub-compatible SVGs)
- **Special**: Citation.js integration for academic citations (BibTeX, software formats)

### Transferable UX Patterns

**Navigation Patterns:**

**1. Owner/Repo Persistent Header**
- **Source**: Both GitHub and Forgejo
- **Pattern**: Always-visible context showing repository ownership and name
- **Adaptation for Rig**: Replace "Owner/Repo" with npub-based identity + repo name, add relay verification badge
- **Benefit**: Users always know context, familiar mental model
- **Supports**: Familiarity First principle

**2. Three-Level Information Hierarchy**
- **Source**: Forgejo's primary/secondary/tertiary structure
- **Pattern**: Primary = Header, Secondary = Stats/Summary, Tertiary = Tab Navigation
- **Adaptation for Rig**: Primary = Repo header + Nostr badges, Secondary = Stats (commits/branches via NIP-34), Tertiary = Tabs
- **Benefit**: Clear information architecture, doesn't overwhelm
- **Supports**: Confidence building, progressive disclosure

**3. Keyboard-First Navigation**
- **Source**: GitHub's keyboard shortcuts
- **Pattern**: `j/k` for list navigation, `t` for file finder, `?` for help
- **Adaptation for Rig**: Identical shortcuts (`j/k`, `t`, `?`) plus Rig-specific ones (verify permanence, show relay status)
- **Benefit**: Power users stay productive, zero learning curve
- **Supports**: Developer productivity, familiarity

**Interaction Patterns:**

**4. Progressive Enhancement (Server-rendered → Interactive)**
- **Source**: Forgejo's hybrid approach
- **Pattern**: Initial HTML load → JavaScript enhancement for interactivity
- **Adaptation for Rig**: Initial static HTML from Arweave → React hydration → Vue/React components for interactive features
- **Benefit**: Fast initial load, works offline, degrades gracefully
- **Supports**: Offline-first capability, performance goals

**5. Collapsible Detail Panels**
- **Source**: Forgejo's language stats `<details>` element
- **Pattern**: Summary view collapsed by default, expand for details
- **Adaptation for Rig**: Relay status details, event signature verification, Arweave transaction details
- **Benefit**: Progressive disclosure, simple surface with deep dive available
- **Supports**: Serves both Anonymous Visitor and Taylor personas

**6. Button Grouping by Context**
- **Source**: Both GitHub and Forgejo
- **Pattern**: Related actions clustered together (Watch/Star/Fork)
- **Adaptation for Rig**: Watch/Star/Fork → Browse/Verify/Share (aligned with read-only nature)
- **Benefit**: Related actions discoverable together
- **Supports**: Intuitive action discovery

**Visual Patterns:**

**7. Muted Secondary Navigation**
- **Source**: Forgejo's `.muted` class for links
- **Pattern**: Visual hierarchy through color saturation
- **Adaptation for Rig**: Primary content = code, secondary = metadata (relay sources, verification status)
- **Benefit**: Clear visual hierarchy, code stays focused
- **Supports**: Content-first design

**8. Icon + Label Pattern**
- **Source**: Both platforms (Octicons everywhere)
- **Pattern**: SVG icon paired with text label for clarity
- **Adaptation for Rig**: Use Octicons + custom icons for Nostr/Arweave (relay icon, permanence icon)
- **Benefit**: Visual consistency with GitHub, immediate recognition
- **Supports**: Familiarity, visual communication

**9. Responsive Label Strategy**
- **Source**: Forgejo's `.not-mobile` / `.only-mobile` classes
- **Pattern**: Show/hide content based on screen size
- **Adaptation for Rig**: Desktop shows full relay URLs, mobile shows relay count with icons
- **Benefit**: Serves Jordan's mobile use case without desktop clutter
- **Supports**: Mobile responsiveness, information density management

**Unique High-Value Pattern:**

**10. Built-in Citation Support**
- **Source**: Forgejo's `@citation-js` integration
- **Pattern**: One-click generation of academic citations in multiple formats
- **Adaptation for Rig**: One-click citation generator with ArNS permanent URLs + Arweave TX IDs
- **Benefit**: Directly serves Sam (Archivist) persona, enables academic adoption
- **Supports**: Permanence value proposition, unique differentiation

### Anti-Patterns to Avoid

**From GitHub's Centralized Model:**

**1. Black Box Infrastructure**
- **Anti-Pattern**: Hiding backend operations, "trust us" messaging without transparency
- **Why Avoid**: Contradicts Rig's core value proposition (transparency, verifiable decentralization)
- **Rig Alternative**: Show relay connections, Arweave transactions, event signatures visibly
- **Conflicts With**: Transparency principle, trust-building strategy

**2. Account Walls for Basic Browsing**
- **Anti-Pattern**: "Sign in to see more" prompts on public repositories, login-gated content
- **Why Avoid**: Creates friction for Anonymous Visitor persona, contradicts zero-auth promise
- **Rig Alternative**: Complete browsing without authentication, ILP only for writes (future)
- **Conflicts With**: Zero-friction onboarding, "This actually works" success moment

**3. Platform Lock-in UX Patterns**
- **Anti-Pattern**: Features that only work within GitHub ecosystem (GitHub Actions tight coupling, proprietary workflows)
- **Why Avoid**: Rig is about sovereignty, not creating new lock-in
- **Rig Alternative**: Standards-based patterns (NIP-34, Arweave), interoperable with other clients
- **Conflicts With**: Decentralization ethos, user sovereignty

**From Decentralized/Web3 Projects:**

**4. Crypto Jargon Overload**
- **Anti-Pattern**: Forcing users to understand "relays", "events", "npub", "Arweave TX" terminology before browsing
- **Why Avoid**: Intimidates Anonymous Visitor, creates unnecessary cognitive barrier
- **Rig Alternative**: Progressive disclosure - simple labels with "Learn More" tooltips, plain language
- **Conflicts With**: Confidence building, accessibility for non-crypto users

**5. Wallet Popups on Landing**
- **Anti-Pattern**: MetaMask/crypto wallet connection prompts before users can see any content
- **Why Avoid**: Kills "This actually works" moment, creates immediate friction
- **Rig Alternative**: Zero-auth browsing, wallet only mentioned for future write operations
- **Conflicts With**: Anonymous Visitor success criteria, zero-friction browsing

**6. Broken/Slow UX Excused by "Decentralization"**
- **Anti-Pattern**: 10+ second load times, blank error screens, "it's P2P so it's slow" mentality
- **Why Avoid**: Reinforces "decentralized = broken" perception, drives user abandonment
- **Rig Alternative**: <3s P95 load times, graceful degradation, meaningful progress indicators
- **Conflicts With**: Performance perception goals, accomplishment vs. frustration balance

**From Self-Hosted Git Platforms:**

**7. Desktop-Only Design**
- **Anti-Pattern**: Non-responsive layouts, tiny tap targets, horizontal scrolling on mobile devices
- **Why Avoid**: Jordan persona needs mobile access for on-the-go patch reviews
- **Rig Alternative**: 320px+ responsive design, 44x44px minimum touch targets
- **Conflicts With**: Mobile responsiveness requirement, Jordan's use cases

**8. Generic Error Messages**
- **Anti-Pattern**: "Error 500", "Failed to load", no context or recovery options
- **Why Avoid**: Doesn't educate users about P2P resilience, creates confusion
- **Rig Alternative**: "2 of 5 relays timed out, loaded from 3" with [Retry All Relays] button
- **Conflicts With**: Educational UX principle, errors as learning opportunities

**9. Feature Bloat for Admin Users**
- **Anti-Pattern**: Exposing self-hosting admin features in UI (admin panels, server configuration)
- **Why Avoid**: Rig is read-only static client, no administrative functionality needed
- **Rig Alternative**: Clean, focused browsing interface without administrative noise
- **Conflicts With**: Simplicity goals, frontend-only architecture

**From Early Web3 Projects:**

**10. Assuming Technical Literacy**
- **Anti-Pattern**: No onboarding, no tooltips, assuming users understand Nostr/Arweave concepts
- **Why Avoid**: Limits growth to crypto-native users only, excludes broader developer audience
- **Rig Alternative**: Educational UX, contextual tooltips, "Learn More" links, natural discovery
- **Conflicts With**: Anonymous Visitor success criteria, growth strategy

**11. Prototype-Quality Visual Design**
- **Anti-Pattern**: Unstyled forms, inconsistent spacing, poor typography, amateur aesthetics
- **Why Avoid**: Signals "experiment" not "production infrastructure", undermines trust
- **Rig Alternative**: GitHub-level polish using shadcn/ui, professional design system
- **Conflicts With**: Production-ready perception, trust building through polish

### Design Inspiration Strategy

**What to Adopt (Use Directly):**

**1. GitHub's Owner/Repo Header Pattern**
- **Implementation**: `npub.../repository-name` structure with persistent header
- **Rationale**: 15+ years of user muscle memory, instant recognition
- **Supports**: Familiarity First principle, confidence building
- **Timeline**: MVP Phase 1

**2. GitHub's Keyboard Shortcuts**
- **Implementation**: Identical shortcuts for navigation (`j/k`, `t`, `?`), plus Rig-specific ones
- **Rationale**: Power users expect these to work, zero learning curve
- **Supports**: Developer productivity, GitHub familiarity
- **Timeline**: MVP Phase 1

**3. Forgejo's Citation.js Integration**
- **Implementation**: One-click BibTeX/APA/MLA generation with ArNS permanent URLs
- **Rationale**: Already proven solution for academic citations, serves Sam persona
- **Supports**: Academic adoption, permanence value proposition
- **Timeline**: Phase 2

**4. Forgejo's Progressive Enhancement Architecture**
- **Implementation**: Static HTML → React hydration → interactive components
- **Rationale**: Fast initial load, works without JS, graceful degradation
- **Supports**: Offline-first capability, performance goals
- **Timeline**: MVP Phase 1

**5. Both Platforms' File Tree Navigation**
- **Implementation**: Left sidebar file tree + main content panel
- **Rationale**: Standard pattern for code browsing, proven UX
- **Supports**: GitHub familiarity, efficient code exploration
- **Timeline**: MVP Phase 1

---

**What to Adapt (Modify for Rig's Unique Context):**

**6. GitHub's Repository Stats → Decentralized Verification Badges**
- **Adaptation**: Instead of "stars/forks/watchers", show "Verified on 4/5 relays", "Stored on Arweave"
- **Rationale**: Rig's value is permanence/decentralization, not social metrics
- **Supports**: Trust building, transparency principle
- **Timeline**: MVP Phase 1

**7. Forgejo's Language Stats Bar → Relay Status Visualization**
- **Adaptation**: Color-coded bar showing relay response status (green = responded, red = timeout)
- **Rationale**: Makes P2P infrastructure visible and understandable
- **Supports**: Confidence building, educational UX
- **Timeline**: Phase 2

**8. GitHub's "Watch/Star/Fork" Buttons → "Browse/Verify/Share" Actions**
- **Adaptation**: Read-only phase means different action set aligned with current capabilities
- **Rationale**: No write operations yet, need honest feature disclosure
- **Supports**: Prevents frustration, aligns with read-only architecture
- **Timeline**: MVP Phase 1

**9. Forgejo's Responsive Labels → Context-Aware Detail Levels**
- **Adaptation**: Desktop shows full relay URLs, mobile shows "4 relays ✓" icon
- **Rationale**: Mobile users (Jordan) need simplified view, desktop users (Taylor) want details
- **Supports**: Progressive disclosure principle, mobile responsiveness
- **Timeline**: MVP Phase 1

**10. GitHub's Loading Spinners → Educational Loading States**
- **Adaptation**: "Querying 5 Nostr relays..." instead of generic "Loading..."
- **Rationale**: Delays must tell the decentralization story, build understanding
- **Supports**: Performance delays storytelling principle, confidence building
- **Timeline**: MVP Phase 1

---

**What to Avoid (Anti-Patterns Identified):**

**11. GitHub's Black Box Infrastructure**
- **Why**: Contradicts transparency principle
- **Instead**: Glass box - show all decentralized components visibly

**12. Web3 Projects' Wallet Popups**
- **Why**: Creates friction for browsing
- **Instead**: Zero-auth browsing, no crypto requirements to view code

**13. Self-Hosted Platforms' Desktop-Only Design**
- **Why**: Excludes mobile users (Jordan persona)
- **Instead**: 320px+ responsive with touch-optimized interactions

**14. Decentralized Apps' "Slow is OK" Mentality**
- **Why**: Reinforces negative perceptions
- **Instead**: <3s P95 load times with meaningful progress indicators

**15. Early Web3's Prototype-Quality Design**
- **Why**: Signals "experiment" not "production"
- **Instead**: GitHub-level polish using shadcn/ui professional components

---

**Strategic Implementation Priorities:**

**Phase 1 (MVP - Browsing Foundation):**
- ✅ Adopt GitHub navigation patterns (keyboard shortcuts, file tree, header)
- ✅ Adapt repository stats to show relay verification instead of social metrics
- ✅ Avoid all crypto jargon and wallet requirements
- ✅ Implement educational loading states
- ✅ Progressive enhancement architecture

**Phase 2 (Trust Building):**
- ✅ Adapt loading states to educational storytelling
- ✅ Implement relay status visualization
- ✅ Add citation generator (direct adoption from Forgejo)
- ✅ Enhanced verification badges with progressive disclosure

**Phase 3 (Power User Features):**
- ✅ Progressive disclosure layers for deep verification (event signatures, Arweave TX details)
- ✅ Advanced keyboard shortcuts for Rig-specific actions
- ✅ Developer-focused transparency tools (relay latency monitoring, event inspection)

This strategy ensures Rig is **familiar enough to feel like GitHub** (zero learning curve), **transparent enough to prove decentralization** (trust building), and **polished enough to signal production-ready infrastructure** (credibility).

---

## Design System Foundation

### Design System Choice

**Selected System: shadcn/ui**

Rig will use **shadcn/ui** as its design system foundation - a modern, themeable component library built on Radix UI primitives and styled with Tailwind CSS.

**System Characteristics:**
- **Foundation**: Radix UI primitives (accessibility, keyboard navigation, ARIA)
- **Styling**: Tailwind CSS utility classes (minimal CSS footprint)
- **Architecture**: Copy-paste components (you own the code, no package dependencies)
- **Type Safety**: TypeScript-native with full type definitions
- **Component Count**: 40+ pre-built, accessible components
- **License**: MIT (fully permissive)

**Why shadcn/ui vs. Alternatives:**

| Criterion | shadcn/ui | Material UI | Ant Design | Chakra UI | Custom |
|-----------|-----------|-------------|------------|-----------|---------|
| **Speed to MVP** | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Good | ❌ Slow |
| **Bundle Size** | ✅ Minimal | ⚠️ Large | ⚠️ Large | ✅ Good | ✅ Minimal |
| **Customization** | ✅ Full control | ⚠️ Theme-based | ⚠️ Theme-based | ✅ Good | ✅ Full control |
| **Accessibility** | ✅ WCAG 2.1 AA | ✅ WCAG 2.1 AA | ✅ Good | ✅ Good | ⚠️ Manual |
| **GitHub Aesthetic** | ✅ Compatible | ❌ Material look | ❌ Ant look | ✅ Neutral | ✅ Perfect match |
| **Code Ownership** | ✅ In repo | ❌ npm package | ❌ npm package | ❌ npm package | ✅ In repo |
| **React 19 Support** | ✅ Yes | ✅ Yes | ⚠️ Limited | ✅ Yes | ✅ N/A |

### Rationale for Selection

**1. Performance Requirements Alignment**

**Bundle Size Target: <500KB (ArDrive free hosting eligibility)**
- shadcn/ui components are tree-shakeable - only include what you use
- Tailwind CSS generates minimal CSS (purges unused classes)
- No runtime overhead from component library framework
- Code splitting friendly (each component is independent)

**Measured Impact:**
- Base shadcn/ui setup: ~50KB gzipped
- Per-component cost: ~2-5KB each
- Estimated 20 components for MVP: ~150KB total
- Leaves ample budget for React, Nostr libraries, Arweave SDK

**2. GitHub Familiarity Strategy Support**

**Design Principle: "Familiarity First, Then Surprise"**
- shadcn/ui has clean, professional aesthetic similar to GitHub
- Minimal visual opinions (not Material Design or Ant Design branded look)
- Customizable enough to add decentralized UX elements without fighting the system
- Developer-focused design language (monospace code blocks, subtle chrome, content-first)

**Visual Continuity:**
- Users familiar with GitHub see similar button styles, input fields, navigation patterns
- Then surprised by Rig-specific elements (relay badges, Arweave permanence indicators)
- Doesn't break mental model with radically different UI framework aesthetic

**3. Accessibility Compliance (NFR-A16)**

**Requirement: Lighthouse accessibility score ≥90**
- Radix UI primitives provide WCAG 2.1 Level AA compliance out of the box
- Keyboard navigation handled automatically (Tab, Arrow keys, Escape)
- ARIA attributes managed by primitives (roles, labels, live regions)
- Focus management for dialogs, dropdowns, accordions

**Critical for Rig:**
- Progressive disclosure patterns (relay details, event signatures) need proper ARIA
- Keyboard shortcuts (`j/k`, `t`, `?`) must coexist with component keyboard navigation
- Screen reader support for decentralized infrastructure transparency (relay status announcements)

**4. Progressive Disclosure UX Pattern Enablement**

**Design Principle: "Simple Surface, Deep Verification"**

shadcn/ui provides perfect primitives for progressive disclosure:
- **Accordion**: Collapsible relay status details (default collapsed, expand on demand)
- **Dialog**: Deep dive modals for event signature verification, Arweave transaction details
- **Popover**: Hover tooltips for relay names, quick verification info
- **Collapsible**: Expandable sections for file tree navigation, commit details
- **Tabs**: Repository tabs (Code/Issues/PRs), verification tabs (Relays/Events/Storage)

**Three-Layer Information Hierarchy:**
- **Layer 1 (Default)**: "✓ Verified on 4 relays" badge (Radix Badge primitive)
- **Layer 2 (Hover)**: Popover showing relay names and latencies
- **Layer 3 (Click)**: Dialog with full relay URLs, event signatures, Arweave TX links

**5. Development Velocity for MVP**

**Timeline Constraint: MVP needs core browsing features quickly**
- 40+ pre-built components cover 80% of UI needs (Button, Input, Card, Dialog, Dropdown, Table, Tabs)
- Copy-paste approach = instant customization without learning complex theming API
- Good documentation with React code examples
- TypeScript definitions prevent integration bugs

**Estimated Time Savings vs. Custom:**
- Custom design system: 4-6 weeks of component development
- shadcn/ui setup: 1 day installation + 1 week customization
- Net savings: 3-5 weeks (critical for MVP timeline)

**6. Code Ownership and Future-Proofing**

**Anti-Pattern Avoidance: Package Dependency Lock-in**
- Unlike MUI/Ant/Chakra, shadcn/ui components are copied into your codebase
- No npm package dependency that could introduce breaking changes
- Full control to modify components for Rig-specific needs
- No version upgrade treadmill (components are frozen at copy time)

**React 19 Compatibility:**
- shadcn/ui works with React 19 server components
- Future optimization: server-render initial HTML, hydrate interactivity
- Supports Rig's progressive enhancement architecture strategy

### Implementation Approach

**Phase 1: Foundation Setup (Week 1)**

**Installation:**
```bash
# Initialize shadcn/ui in Rig project
npx shadcn-ui@latest init

# Configuration choices:
# - Style: Default
# - Base color: Slate (neutral, GitHub-like)
# - CSS variables: Yes (enables theming)
# - Components path: @/components/ui
```

**Tailwind Configuration:**
```typescript
// tailwind.config.ts - Extend with Rig-specific tokens
export default {
  theme: {
    extend: {
      colors: {
        // shadcn/ui semantic colors (keep defaults)
        // Add Rig-specific colors
        relay: {
          active: 'hsl(142, 76%, 36%)',    // Green - responding relays
          timeout: 'hsl(0, 84%, 60%)',      // Red - failed relays
          pending: 'hsl(48, 96%, 53%)',     // Yellow - pending
        },
        arweave: {
          permanent: 'hsl(262, 83%, 58%)',  // Purple - permanence
        },
        nostr: {
          verified: 'hsl(217, 91%, 60%)',   // Blue - verified events
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'], // Code blocks
        sans: ['Inter', 'system-ui', 'sans-serif'],          // UI text
      }
    }
  }
}
```

**Core Components Install:**
```bash
# Install MVP-critical components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add skeleton
```

**Phase 2: Rig-Specific Component Development (Week 2-3)**

**Custom Components Built on shadcn/ui Primitives:**

**1. RelayStatusBadge Component**
```typescript
// Built on: shadcn/ui Badge + Popover
// Purpose: Show relay verification status with progressive disclosure
// Layer 1: "✓ Verified on 4/5 relays" badge
// Layer 2 (hover): Popover with relay names and latencies
// Layer 3 (click): Opens RelayDetailsDialog
```

**2. ArweaveTransactionLink Component**
```typescript
// Built on: shadcn/ui Button (variant="link")
// Purpose: Link to Arweave transaction with permanence indicator
// Visual: Purple Arweave icon + Transaction ID (truncated)
// Interaction: Opens Arweave explorer in new tab
```

**3. NostrEventCard Component**
```typescript
// Built on: shadcn/ui Card + Accordion
// Purpose: Display NIP-34 repository/commit/issue events
// Layout: Event type header + collapsible content + verification badge
// Supports: Repository announcements, commits, issues, PRs
```

**4. RepositoryHeader Component**
```typescript
// Built on: shadcn/ui custom layout + Badge
// Purpose: npub-based owner + repo name with verification
// Pattern: "npub1abc.../repository-name" + relay verification badge
// Matches: GitHub's Owner/Repo header pattern
```

**5. RelayStatusVisualization Component**
```typescript
// Built on: Custom component inspired by Forgejo language stats
// Purpose: Color-coded bar showing relay response status
// Visual: Horizontal bar with segments (green/red/yellow)
// Interaction: Hover shows relay URL, click expands details
```

**6. EducationalLoadingState Component**
```typescript
// Built on: shadcn/ui Skeleton + custom text
// Purpose: Meaningful loading messages during P2P operations
// Content: "Querying 5 Nostr relays..." with animated progress
// Pattern: Storytelling delays, not generic spinners
```

**7. FileTreeNavigator Component**
```typescript
// Built on: shadcn/ui Accordion + custom tree logic
// Purpose: GitHub-style file tree for repository browsing
// Features: Collapsible folders, file icons, keyboard navigation
// Responsive: Desktop = sidebar, Mobile = bottom sheet
```

**8. CitationGenerator Component**
```typescript
// Built on: shadcn/ui Dialog + DropdownMenu
// Purpose: One-click academic citation generation
// Formats: BibTeX, APA, MLA, plain URL
// Integration: Uses @citation-js (from Forgejo pattern)
```

**Phase 3: GitHub Aesthetic Alignment (Week 4)**

**Visual Design Tokens:**

**Color Palette:**
- **Primary**: Slate-based neutrals (GitHub-compatible grays)
- **Accent**: Blue for interactive elements (matches GitHub's link blue)
- **Success**: Green for verified/success states
- **Warning**: Yellow for pending/caution states
- **Error**: Red for failures/errors
- **Code**: Syntax highlighting colors matching GitHub's theme

**Typography:**
- **UI Text**: Inter (clean, modern sans-serif similar to GitHub's system font stack)
- **Code**: JetBrains Mono or Fira Code (monospace with ligatures for code blocks)
- **Scale**: GitHub-compatible sizing (14px base for UI, 13px for code)

**Spacing & Layout:**
- **Container**: Max-width 1280px (GitHub's repository page width)
- **Spacing**: Tailwind's default scale (matches GitHub's generous whitespace)
- **Borders**: Subtle 1px borders with low-contrast gray (minimal chrome)

**Component Styling:**
- **Buttons**: Subtle shadows, rounded corners (GitHub's button style)
- **Inputs**: Simple borders, focus rings (blue accent)
- **Cards**: Light borders, no heavy shadows (flat design)
- **Code Blocks**: Dark background with syntax highlighting

### Customization Strategy

**Design Token Architecture:**

**1. Semantic Color System**
```typescript
// themes/tokens.ts
export const rigTokens = {
  // Infrastructure status colors
  relay: {
    active: 'relay-active',      // Maps to hsl(142, 76%, 36%)
    timeout: 'relay-timeout',    // Maps to hsl(0, 84%, 60%)
    pending: 'relay-pending',    // Maps to hsl(48, 96%, 53%)
  },
  // Permanence & verification colors
  permanence: 'arweave-permanent',  // Purple for Arweave
  verified: 'nostr-verified',       // Blue for verified events
  // Standard semantic colors (inherit from shadcn/ui)
  success: 'green',
  warning: 'yellow',
  error: 'red',
  info: 'blue',
}
```

**2. Component Customization Approach**

**Principle: Composition Over Modification**
- **Keep**: shadcn/ui base components unchanged (Button, Input, Card)
- **Wrap**: Create Rig-specific components that compose base components
- **Extend**: Add custom variants without forking base components

**Example Pattern:**
```typescript
// ✅ Good: Compose base components
<Button variant="outline">
  <RelayIcon className="relay-active" />
  Verified on 4 relays
</Button>

// ❌ Avoid: Forking base Button component to add relay-specific logic
```

**3. Responsive Strategy**

**Breakpoints (Tailwind defaults):**
- **sm**: 640px (mobile landscape)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)

**Mobile Adaptations (Jordan Persona):**
- **Desktop (lg+)**: Full relay URLs visible, file tree sidebar, multi-column layouts
- **Tablet (md)**: Abbreviated relay names, collapsible sidebar, hybrid layouts
- **Mobile (sm)**: Icons + counts, bottom sheets, single column, 44x44px touch targets

**Forgejo Pattern Adoption:**
```typescript
// Use utility classes for responsive visibility
<span className="hidden lg:inline">relay1.example.com</span>  // Desktop only
<span className="lg:hidden">4 relays ✓</span>                // Mobile only
```

**4. Accessibility Enhancements**

**Beyond Radix UI Defaults:**

**Keyboard Shortcuts:**
- Ensure shadcn/ui keyboard navigation doesn't conflict with Rig shortcuts
- `j/k`: Navigate lists (override only when not in input fields)
- `t`: File finder (global shortcut, should work from any context)
- `?`: Help modal (global shortcut)
- `Escape`: Close modals/popovers (standard Radix behavior)

**Screen Reader Announcements:**
```typescript
// Relay status changes announce to screen readers
<div role="status" aria-live="polite" aria-atomic="true">
  Loaded repository from 4 of 5 relays
</div>
```

**Focus Management:**
- Progressive disclosure dialogs trap focus (Radix default)
- Return focus to trigger element on close (Radix default)
- Skip navigation link for keyboard users (custom addition)

**5. Dark Mode Strategy**

**Implementation:**
- shadcn/ui supports dark mode via Tailwind's `dark:` variant
- Use CSS variables for theme switching (shadcn/ui default)
- Match GitHub's dark theme color palette

**Rig-Specific Dark Mode:**
- Relay status colors remain distinct in dark mode (adjusted saturation)
- Code syntax highlighting switches to GitHub's dark theme
- Arweave purple and Nostr blue adjusted for dark backgrounds

**Toggle Placement:**
- Header right side (standard pattern)
- Persists choice to localStorage
- Respects system preference on first visit

**6. Progressive Enhancement Architecture**

**Loading Strategy:**
- **Static HTML**: Initial page load shows skeleton UI (shadcn/ui Skeleton)
- **React Hydration**: Attach interactivity to static markup
- **Progressive Fetch**: Load relay data, Arweave content as available
- **Offline Mode**: Service worker serves cached shadcn/ui components

**Component Lazy Loading:**
```typescript
// Heavy components load on demand
const CitationGenerator = lazy(() => import('@/components/CitationGenerator'))
const RelayDetailsDialog = lazy(() => import('@/components/RelayDetailsDialog'))
```

**7. Testing & Quality Assurance**

**Accessibility Testing:**
- Lighthouse CI: Ensure ≥90 accessibility score (automated)
- axe DevTools: Catch ARIA issues during development
- Keyboard navigation testing: All interactions work without mouse
- Screen reader testing: VoiceOver (macOS), NVDA (Windows)

**Visual Regression:**
- Chromatic or Percy for component screenshot testing
- Ensure customizations don't break shadcn/ui base styles
- Test dark mode variants

**Performance Monitoring:**
- Bundle analyzer: Ensure <500KB target maintained
- Lighthouse performance: LCP <2.5s
- Core Web Vitals tracking in production

This customization strategy ensures Rig maintains shadcn/ui's quality foundation while adding unique decentralized UX elements that differentiate from GitHub.

---

## Defining Interaction

### The Core Experience

**Rig's Defining Interaction: "Browse code and see cryptographic proof that no one can take it down"**

Every successful product has a defining experience - the core interaction that, if nailed perfectly, makes everything else follow. For Rig, this is:

**"Transparent decentralized verification while browsing"**

Users don't just browse repositories - they **witness** decentralization working through visible relay connections, Arweave permanence indicators, and event signatures.

**Comparison to Other Products:**
- **Tinder**: "Swipe to match with people"
- **Spotify**: "Discover and play any song instantly"
- **Instagram**: "Share perfect moments with filters"
- **Rig**: "Browse code and see it can't be taken down"

**What users will tell their friends:**
- "I can see which relays verified the code"
- "There's a permanent Arweave link for every commit"
- "No single server can censor it - I watched it query 5 different relays"

**The successful feeling:**
When users click "Verify Permanence" and see the Arweave transaction ID with "200+ year storage guarantee" - that's the validation moment that transforms skepticism into trust.

**The ONE thing we must nail:**
Make decentralization visible and trustworthy through transparent infrastructure, not hidden promises.

### User Mental Model

**Current Problem-Solving Approaches:**

**1. GitHub (Centralized Trust Model)**
- **Mental Model**: Trust through corporate reputation
- **Assumption**: "Big companies don't lose data"
- **Reality**: Fear of account suspension, link rot, geofencing
- **User Love**: Instant loading, familiar interface, network effects
- **User Hate**: Platform control, censorship risk, link rot in citations

**2. Self-Hosted Git (Ownership Model)**
- **Mental Model**: Trust through ownership
- **Assumption**: "I control the server, so it's safe"
- **Reality**: Single point of failure, maintenance burden, costs
- **User Love**: Complete control, privacy
- **User Hate**: Complexity, still centralized (one server)

**3. Local Git Clones (Backup Model)**
- **Mental Model**: Trust through possession
- **Assumption**: "I have it on my machine"
- **Reality**: Not shareable, not permanent, no collaboration
- **User Love**: Offline access
- **User Hate**: Isolated, no URLs to share

**User Expectations for Rig:**

**Brought Mental Models:**
- **GitHub familiarity**: Should work like GitHub (browse repos, view code, commits)
- **Plus verification**: Some additional proof of permanence/decentralization
- **No crypto complexity**: Browsing shouldn't require blockchain understanding
- **URL permanence**: Links should work forever (unlike their GitHub citation experience)

**Likely Confusion Points:**

1. **"How can there be no server?"**
   - Users expect single URL = single server
   - Need to understand: ArNS URL → Arweave static site → queries multiple relays

2. **"What's a relay? Why 5?"**
   - No mental model for "relay consensus"
   - Need education: Relays = independent servers, 5 = redundancy proof

3. **"Why 3 seconds when GitHub loads in 1 second?"**
   - Perception: Slower = broken
   - Reality: Multi-relay verification takes time
   - Need reframing: Delay = security benefit, not performance problem

4. **"What's Arweave? How does 200 years work?"**
   - No mental model for permanent storage economics
   - Need metaphor: "Like writing in stone, not sand"

**Existing Solution Pain Points:**

**What Makes Current Solutions Feel Terrible:**
- **GitHub 404s on cited URLs** (link rot in academic papers)
- **"This repository has been removed"** (no recourse, years of work gone)
- **VPN workarounds** just to view public code (geofencing)
- **Account suspension fear** (Alex persona's nightmare)

**What Makes Current Solutions Feel Magical:**
- **GitHub's fuzzy file search** (`t` key) - instant results
- **Inline blame view** - see history with code
- **Syntax highlighting** that "just works"

**User Shortcuts/Workarounds (Proof of Pain):**
- Multiple git remotes (GitHub + GitLab + self-hosted) - hedging bets
- Regular backups to external drives - manual permanence
- Archiving to IPFS/Internet Archive - manual decentralization
- Mirrors across platforms - manual redundancy

**Rig's Mental Model Shift:**

**From**: "Trust the platform" (GitHub) or "Trust yourself" (self-hosted)
**To**: "Verify don't trust" (cryptographic proof via visible infrastructure)

**Key Insight**: Users already distrust centralized platforms (hence the workarounds), but don't trust decentralized alternatives either (scam perception). Rig must show, not tell.

### Success Criteria

**"This Just Works" Indicators:**

**1. Fast Enough to Feel Intentional**
- Repository loads in <3 seconds with visible relay status
- Not GitHub-instant, but delay feels purposeful
- Loading states educate: "Querying 5 Nostr relays..." builds understanding
- No blank screens or generic spinners

**2. Verification Obvious but Not Intrusive**
- "✓ Verified on 4 of 5 relays" badge visible in repository header
- Can browse code without thinking about relays (passive verification)
- Deep verification available on demand (click badge → dialog with details)
- Progressive disclosure: simple surface, deep dive optional

**3. GitHub Muscle Memory Preserved**
- `j/k` navigation works identically
- `t` file finder launches fuzzy search
- `?` shows keyboard shortcuts help
- Same layout, terminology, visual hierarchy

**4. Professional Code Display**
- Syntax highlighting matches GitHub quality (200+ languages)
- Monospace fonts, readable diffs, clean file tree
- Dark mode available, color-coded diffs (green/red/yellow)
- No "Web3 prototype" aesthetic - production polish

**Smart/Accomplished Moments:**

**1. First "Verify Permanence" Click (Validation Moment)**
- User clicks purple Arweave icon or "Verify Permanence" button
- Opens Arweave transaction page in new tab
- Sees: Transaction ID, block height, storage endowment
- Reads: "This data is guaranteed to be stored until at least year 2226"
- **User Thought**: "This is real permanence, not marketing hype"

**2. Offline Mode Discovery (Delight Moment)**
- User closes laptop with cached repositories
- Opens laptop on plane (no internet)
- Visits Rig URL → Still works
- Toast: "You're offline, but Rig still works! 12 repositories cached."
- **User Thought**: "This is actually better than GitHub offline"

**3. Permanent Link Sharing (Utility Moment)**
- User copies repository ArNS URL for academic paper
- One-click citation generator: BibTeX, APA, MLA formats
- Citation includes permanent ArNS URL + Arweave transaction ID
- **User Thought**: "This won't rot like my GitHub citations did"

**4. Graceful Failure Understanding (Trust Moment)**
- User sees: "2 of 5 relays timed out, loaded from 3 remaining relays"
- No error screen, browsing continues normally
- Click status → See which relays responded, which failed
- **User Thought**: "Even failures prove resilience - no single point of failure"

**Feedback Mechanisms:**

**How Users Know They're Succeeding:**

1. **Progressive Status Updates**
   - "Connecting to relays..." (0-500ms)
   - "Relay 1 responded (45ms), Relay 2 responded (89ms)..." (500ms-2s)
   - "Loading code from Arweave..." (2s-3s)
   - "Complete - Verified on 4 of 5 relays" (3s+)

2. **Verification Badges Everywhere**
   - Repository cards: "✓ Verified" badge
   - Repository header: Relay count with status
   - Commits: Purple Arweave permanence icons
   - Files: Cache indicators for offline-ready content

3. **Performance Surprises**
   - Second visit: "Loaded in 450ms from cache (typical GitHub: 800ms)"
   - User sees they're getting speed benefits from decentralization

**Performance Expectations:**

- **Initial load**: <2.5s (LCP - Core Web Vitals target)
- **Navigation**: Instant (<100ms client-side routing)
- **Code fetch**: <3s (Arweave content retrieval)
- **Relay queries**: <2s (parallel queries, display when N of M respond)

**Automatic System Behaviors:**

✅ **Multi-relay verification** - background parallel queries
✅ **Service worker caching** - second visit 2-3x faster
✅ **Syntax highlighting** - automatic language detection
✅ **ArNS resolution** - permanent URLs "just work"
✅ **Graceful degradation** - failed relays handled transparently
✅ **Offline capability** - cached repos accessible without network

**Measurable Success Indicators:**

✅ User browses for 5+ minutes without confusion (usability)
✅ User clicks "Verify Permanence" at least once (engagement with unique value)
✅ User shares Rig link with others (advocacy/growth)
✅ User returns for second visit within 7 days (retention)
✅ User understands relay status without reading docs (educational UX success)

### Novel UX Patterns

**Pattern Classification: Innovative Combination of Familiar Elements**

Rig's core experience **combines familiar patterns in innovative ways** - not entirely novel, but the synthesis is unique.

**Established Patterns (Zero Innovation Needed):**

**1. Repository Browsing (GitHub Clone)**
- File tree navigation with Accordion component
- Code viewer with syntax highlighting
- Commit history, diffs, blame view
- **Strategy**: Copy GitHub exactly, leverage 15 years of user muscle memory
- **Benefit**: Zero learning curve for core browsing

**2. Keyboard Navigation (Developer Standard)**
- `j/k` list navigation, `t` file finder, `?` help modal
- **Strategy**: Match GitHub shortcuts exactly, add Rig-specific (e.g., `v` for verify)
- **Benefit**: Power users instantly productive

**3. Progressive Disclosure (Universal Pattern)**
- Collapsed → Hover tooltip → Click for details
- **Strategy**: Use shadcn/ui Accordion, Dialog, Popover primitives
- **Benefit**: Serves both casual browsers and deep-dive verifiers

**Novel Patterns (Require User Education):**

**1. Visible Multi-Source Verification ✨ NEW**

**The Pattern:**
Showing "4 of 5 relays verified" as primary trust indicator instead of corporate logo.

**Why Novel:**
Users have no mental model for "relay consensus" - GitHub's trust is implicit (logo = reliable), Rig's trust is explicit (relays = verifiable).

**Education Strategy:**

- **Layer 1 (Immediate)**: Visual language
  - Green checkmark ✓ = verified (universal symbol)
  - Numbers "4 of 5" = partial success (intuitive fraction)
  - Color-coded bar: Green segments = responding relays

- **Layer 2 (Hover - 1-2s)**: Tooltip explanation
  - "Verified on 4 of 5 relays"
  - Tooltip: "Rig checked 5 independent Nostr servers - 4 confirmed this data"

- **Layer 3 (Click - Curious users)**: Deep verification
  - Dialog with relay URLs: relay1.com (45ms), relay2.com (89ms)...
  - Event signatures for cryptographic verification
  - NIP-34 event raw data (for Taylor persona)

**Familiar Metaphor:**
"Like asking 5 different libraries for the same book - if they all have it, you know it's real"

**2. Educational Loading States ✨ INNOVATIVE**

**The Pattern:**
"Querying 5 Nostr relays..." instead of generic "Loading..." spinner.

**Why Innovative:**
Loading states usually hide complexity. Rig reveals infrastructure to build understanding.

**Education Strategy:**

- **First visit**: Detailed status
  - "Connecting to 5 relays..."
  - "Relay 1 responded (45ms)"
  - "Relay 2 responded (89ms)"
  - Shows P2P working in real-time

- **Return visits**: Simplified
  - "Loading from 4 relays..."
  - Users already understand the pattern

- **Fast connections**: Brief acknowledgment
  - "Verified on 5 relays" (appears for 1s, then fades)

**Learning Mechanism:**
Users naturally learn through repeated exposure - delays become explanations, not frustrations.

**3. Permanence Proof as Feature ✨ NEW**

**The Pattern:**
Arweave transaction links with "200+ year guarantee" as browsable UI element.

**Why Novel:**
Permanence is usually assumed (GitHub "won't go away") or ignored (self-hosted "good enough"). Rig makes permanence verifiable and prominent.

**Education Strategy:**

- **Visual**: Purple permanence icon on every commit
- **Metaphor**: "Like writing in stone, not sand"
- **Action**: Click icon → Opens Arweave explorer showing transaction details
- **Copy**: "This code will be accessible until year 2226"
- **Proof**: Storage endowment calculation visible

**Citation Integration:**
One-click generate academic citation with permanent ArNS URL + Arweave TX ID (solves Sam persona's link rot problem).

**Innovative Pattern Combinations:**

**1. GitHub UI + Blockchain Transparency**
- **Familiar foundation**: GitHub layout, navigation, terminology
- **Innovation layer**: Every element shows its decentralized source
- **User benefit**: Browse with zero learning curve, gradually understand decentralization
- **Anti-pattern avoided**: Don't force crypto education before browsing

**2. Offline-First as Premium Feature**
- **Familiar mechanism**: Service worker PWA caching (standard)
- **Innovation framing**: Market offline as censorship resistance, not fallback
- **User benefit**: "Works offline" becomes desirable feature
- **Messaging**: "You're offline, but Rig still works!" (positive, not apologetic)

**3. Errors as Trust Builders**
- **Familiar pattern**: Error handling with retry buttons
- **Innovation twist**: Errors prove system resilience
- **User benefit**: "2 of 5 relays failed, system continues" builds confidence
- **Messaging**: "This is normal in P2P networks - no single point of failure"

**Teaching Through Progressive Complexity:**

**Entry-Level Users (Anonymous Visitor):**
- See green checkmarks and "Verified" badges
- Don't need to understand relays or Arweave
- Can browse like GitHub
- Gradually curious about purple icons and verification badges

**Intermediate Users (Jordan, Sam):**
- Hover for tooltips explaining verification
- Click for relay status details
- Use citation generator
- Understand permanence benefits

**Power Users (Taylor, Casey):**
- Inspect event signatures and raw NIP-34 data
- Check relay latencies and consensus
- Verify Arweave transaction details
- Integrate Rig patterns into own projects

**Our Unique Twist:**

**GitHub pattern + Decentralized transparency layer**

Every familiar GitHub element gets a decentralized enhancement:
- Repository header → + relay verification badge
- Commit list → + Arweave permanence icons
- Loading states → + educational relay status
- Error messages → + resilience proof
- Offline mode → + censorship resistance framing

The innovation isn't inventing new patterns - it's making decentralization feel like an upgrade to familiar tools, not a confusing alternative.

### Experience Mechanics

**Core Interaction Flow: "Browse code and see cryptographic proof that no one can take it down"**

**1. INITIATION: How Users Start**

**Entry Point A: Direct URL Visit**

```
User action: Type or click rig.ar-io.dev/owner/repo
              ↓
System: ArNS resolves to Arweave static site (200+ year URL)
              ↓
System: React app loads, service worker registers
              ↓
User sees: Skeleton loader with "Loading repository..." text
```

**Entry Point B: Discovery from Shared Link**

```
User action: Click link from social media, academic paper, forum
              ↓
System: Deep linking navigates directly to repository/file/commit
              ↓
User sees: No account wall, no crypto wallet popup
              ↓
Result: Immediate browsing access (zero friction)
```

**Entry Point C: Repository Search (Future Phase)**

```
User action: Search for "rust blockchain" on Rig homepage
              ↓
System: Query relays for matching repositories
              ↓
User sees: List of repos with relay verification badges
              ↓
User action: Click repository card
              ↓
Result: Enter repository view
```

**Visual Invitations to Core Experience:**

**Repository Header (Always Visible)**
- npub-based owner + repository name: "npub1abc.../linux"
- Verification badge: "✓ Verified on 4 relays" (subtle pulsing green glow)
- "Verify Permanence" button (secondary action, non-intrusive)

**Curiosity Triggers:**
- Purple Arweave icons next to each commit
- "Stored permanently" tooltip on hover
- Color-coded relay status bar below description (green/yellow/red segments)
- Visual intrigue without overwhelming

**2. INTERACTION: What Users Do**

**Primary Browsing Actions (GitHub-Compatible):**

**File Tree Navigation**
```
Desktop:
  Click folder → Accordion expands, shows files
  Click file → Code loads in main panel (split view)
  Keyboard: j/k navigate, Enter opens, Esc closes

Mobile:
  Tap folder → Bottom sheet with file list
  Tap file → Full-screen code view
  Swipe down → Dismiss, return to tree
```

**Code Viewing**
```
Scroll through code with syntax highlighting (200+ languages)
Click line numbers → Permalink (e.g., file.rs#L42-L58)
Switch to Blame view → See commit history per line
View Diff → Color-coded changes (green add, red delete)
```

**Verification Actions (Novel - Progressive Disclosure):**

**Passive Verification (Always Visible, No Action Required)**
```
Glance at header → See "✓ Verified on 4 relays" badge
Glance at commits → See purple Arweave icons
Glance at status bar → See color-coded relay status (green/red/yellow)
```

**Active Verification Layer 1 (Hover - 1-2s engagement)**
```
Hover relay badge → Tooltip appears:
  "relay1.com (45ms) ✓
   relay2.com (89ms) ✓
   relay3.com (102ms) ✓
   relay4.com (156ms) ✓
   relay5.com (timeout) ✗"
```

**Active Verification Layer 2 (Click - Deep dive)**
```
Click relay badge → Dialog opens with:
  - Full relay URLs with response times
  - NIP-34 event signature verification
  - Raw event data (JSON for Taylor persona)
  - [Retry Failed Relays] button

Click Arweave icon → New tab opens to Arweave explorer:
  - Transaction ID: abc123def456...
  - Block Height: 1,234,567
  - Storage Endowment: 0.005 AR (~200 years)
  - Timestamp: 2026-02-24T15:32:18Z
  - Message: "This data is guaranteed until at least year 2226"
```

**System Response (Real-Time):**

**Background Processing**
```
WebSocket connections to 5 relays (parallel)
              ↓
Query NIP-34 events for repository metadata
              ↓
First 3 relays respond → Display content (don't wait for all 5)
              ↓
Remaining 2 relays: Update badge count as responses arrive
```

**Progress Indicators**
```
0-500ms:    "Connecting to 5 Nostr relays..."
500ms-1s:   "Relay 1 responded (45ms)"
1s-1.5s:    "Relay 2 responded (89ms), Relay 3 responded (102ms)"
1.5s-2s:    "Loading code from Arweave..."
2s-3s:      Progress bar: [████████░░] 80%
3s+:        "Complete - Verified on 4 of 5 relays"
```

**Transparent Infrastructure (Power Users)**
```
DevTools Network Tab:
  - Shows WebSocket connections to relay1.com, relay2.com, etc.
  - Shows Arweave gateway fetches

DevTools Console (debug mode):
  - Logs relay responses with timing
  - Logs event signature verification
  - Logs cache hits/misses
```

**3. FEEDBACK: How Users Know They're Succeeding**

**Immediate Feedback (<100ms):**
```
Click file → Instant highlight (optimistic UI, assume success)
Hover Arweave icon → Tooltip appears immediately
Keyboard j/k → Smooth scroll animation, focus ring
```

**Loading Feedback (100ms-3s):**
```
Educational loading states (not generic spinners):
  "Querying 5 Nostr relays for repository events..."
  "Fetching code from Arweave (2.3s)..."

Skeleton loaders show content structure:
  [▓▓▓▓░░░░] Repository header
  [▓▓▓░░░░░] File tree
  [▓▓▓▓▓▓░░] Code viewer
  (No blank white screens)
```

**Success Feedback (Completion):**
```
Verification badge animates to full opacity
Green checkmark micro-animation (200ms pulse)
Status message (3s auto-dismiss): "Loaded from 4 of 5 relays"
File content renders with syntax highlighting
Scroll position preserved if navigating back
```

**Continuous Feedback (Throughout Session):**
```
Header: Online/offline indicator
  "Online - 5 relays connected" (green dot)
  "Offline - Viewing cached data" (gray dot)

Relay status bar (live updates):
  Green segments = active relays
  Yellow segments = reconnecting
  Red segments = failed (but system continues)

Cache indicators:
  "⚡ Cached" badge on previously viewed files
  Faster load times on repeat visits
```

**Error/Warning Feedback (Graceful Degradation):**
```
Partial failure (not error):
  "2 of 5 relays timed out, loaded from 3 remaining relays"
  [Retry All Relays] button (actionable)
  System continues working normally

Complete failure (rare):
  "All relays unavailable. [Switch to cached version]"
  Shows last cached time: "Last updated: 2 hours ago"
  Educational: "This is temporary - your data is safe on Arweave"

Network disconnect:
  Toast notification: "You're offline, but Rig still works!"
  "12 repositories available in cache"
  Positive framing, not apologetic
```

**Micro-Interactions (Delight):**
```
Relay badge hover → Scale 1.05, glow intensifies
Verification complete → Checkmark draw animation (SVG stroke)
Offline mode → Celebratory toast with rocket icon 🚀
Citation copied → Checkmark toast: "✓ Permanent citation copied"
```

**4. COMPLETION: How Users Know They're Done**

**Browsing Task Complete:**
```
User has viewed desired files/commits/issues
No explicit "done" signal (matches GitHub pattern)
Can navigate away or close tab freely
Session state persists via service worker
```

**Verification Task Complete:**
```
Relay badge shows final count: "✓ Verified on 4 of 5 relays"
User has clicked through to Arweave transaction (curiosity satisfied)
Understanding achieved: "This is real permanence"
```

**Success Outcomes:**
```
✅ User found the code they needed
✅ User understands code is verifiable and permanent
✅ User feels confident sharing Rig links
✅ User has cryptographic proof (can cite in academic paper)
```

**Immediate Next Actions:**
```
Copy Repository Link:
  Click [Share] → Dropdown:
    - Copy ArNS URL (permanent)
    - Copy Arweave TX URL (immutable)
    - Generate Citation → BibTeX/APA/MLA

Bookmark for Later:
  Browser bookmark saves ArNS URL
  Service worker cache keeps data for offline

View Another Repository:
  Click back to explore page
  Or use search (future)

Share with Colleagues:
  Paste link in Slack, email, academic paper
  Advocacy moment: "Check out this censorship-resistant Git host"
```

**Long-Term Next Actions:**
```
Return Visit (Retention):
  Service worker cache makes load 2-3x faster
  IndexedDB persists repository data
  "Loaded in 450ms from cache" (beats GitHub)

Offline Access:
  Close laptop, board plane, open Rig
  Cached repositories still fully browsable
  Delight: "This works better offline than GitHub"

Advocacy (Growth):
  Share Rig with colleagues who fear censorship
  Write blog post about permanent code hosting
  Cite Rig-hosted code in academic papers (permanent URLs)

Future Write Operations:
  User returns when write capability launches
  Already familiar with verification patterns
  Understands trust model from browsing experience
```

**Exit Signals:**
```
User closes tab:
  → Session persists via service worker
  → Cache remains in IndexedDB
  → ArNS URL resolves identically on next visit

User navigates away:
  → Cached repos still accessible
  → No "logout" needed (no account)

User goes offline:
  → Cached repos fully browsable
  → "Offline - 12 repositories cached" indicator
  → Seamless degradation
```

**Experience Flow Summary:**

```
ENTRY (ArNS URL or shared link)
  ↓
LOAD (Educational progress: "Querying 5 relays...")
  ↓
BROWSE (GitHub-familiar: file tree, code viewer, diffs)
  ↓
VERIFY (Novel: Click relay badge → See 4/5 consensus)
  ↓
TRUST (Novel: Click Arweave → See 200-year guarantee)
  ↓
COMPLETE (Copy permanent link, generate citation, bookmark)
  ↓
RETURN (Faster via cache, works offline, advocate to others)
```

The mechanics ensure that every interaction teaches users about decentralization while maintaining GitHub's familiar efficiency.

---

## Visual Design Foundation

### Color System

**Foundation Strategy: GitHub-Compatible Neutrals + Decentralized Infrastructure Accents**

Rig's color system balances familiar GitHub aesthetics with novel decentralized infrastructure visualization. The palette ensures users feel at home while gradually understanding new concepts through color-coded system status.

**Base Palette:**

**Slate Neutrals (GitHub-Compatible)**
```
slate-50:  #f8fafc  - Backgrounds, subtle surfaces
slate-100: #f1f5f9  - Hover states, secondary backgrounds  
slate-200: #e2e8f0  - Borders, dividers
slate-300: #cbd5e1  - Disabled states, placeholder text
slate-400: #94a3b8  - Muted text, secondary icons
slate-500: #64748b  - Body text (meets 4.5:1 contrast)
slate-600: #475569  - Emphasized text
slate-700: #334155  - Headers, primary text
slate-800: #1e293b  - High-emphasis text
slate-900: #0f172a  - Maximum contrast text
slate-950: #020617  - Dark mode backgrounds
```

**Rationale:** Slate provides professional, neutral base that matches GitHub's aesthetic. Users perceive Rig as "GitHub alternative" not "different platform."


**Semantic Color System:** Primary Blue (interactive), Success Green (relay active), Warning Yellow (relay pending), Error Red (relay timeout), Permanence Purple (Arweave).

**Typography System:** Inter (UI text), JetBrains Mono (code). GitHub-compatible sizing: 14px body, 13px code.

**Spacing & Layout:** 4px base unit (Tailwind), 1280px max width (GitHub-compatible), balanced density (~35 files visible).

**Accessibility:** WCAG 2.1 AA compliant, 4.5:1+ contrast ratios, 44x44px touch targets, keyboard navigation, screen reader support.

See Design System Foundation section (Step 6) for complete implementation details including CSS variables, responsive breakpoints, and component specifications.


---

## Design Direction Exploration

### Process Overview

**Date:** 2026-02-24  
**Directions Explored:** 8 distinct visual approaches  
**Selection Method:** Collaborative evaluation against persona needs and design challenges  
**Selected Directions:** Direction 2 (GitHub Evolved) + Direction 5 (Progressive Disclosure)  
**Implementation Artifact:** `/ux-design-directions.html` (shadcn/ui v4 components)

To identify the optimal visual direction for Rig, we created 8 complete design mockups representing fundamentally different approaches to presenting decentralized git infrastructure. Each direction was implemented using production-grade shadcn/ui v4 components (Card, Badge, Button) with unique aesthetic treatments to explore the full spectrum of possibilities.

### The 8 Directions Explored

#### Direction 1: Technical Transparency
**Concept:** DevTools-inspired interface making decentralization visible  
**Aesthetic:** Terminal/console aesthetics, monospace fonts (JetBrains Mono), dark backgrounds (#010409)  
**Key Features:**
- Live relay connection status in header (●●●●○ 4/5 relays • 23ms avg)
- Debug-style information display (event IDs, Arweave transaction hashes visible)
- Console-like output showing query performance metrics
- Badges: "SIG_OK", "AR_STORED" in terminal green

**Strengths:**
- Perfect for Taylor (Ecosystem Builder) - can inspect every technical detail
- Communicates "nothing hidden" transparency principle effectively
- Appeals to developers who appreciate seeing system internals
- Distinctive aesthetic differentiates from GitHub immediately

**Weaknesses:**
- Overwhelming for Anonymous Visitor - too much technical jargon
- Console aesthetic may signal "developer tool only" rather than "GitHub alternative"
- Monospace everything reduces readability for non-code content
- May be perceived as "prototype" rather than "production application"

**User Fit:** Excellent for Casey (Web3 Dev), Taylor (Ecosystem Builder). Poor for Anonymous Visitor, Sam (Archivist).

---

#### Direction 2: GitHub Evolved ⭐ SELECTED
**Concept:** Familiar GitHub patterns enhanced with subtle verification indicators  
**Aesthetic:** GitHub-compatible dark mode (#0d1117 backgrounds), familiar tab navigation, comfortable spacing  
**Key Features:**
- Tab navigation (Repositories | Issues | Pull Requests) - instant recognition
- Repository cards matching GitHub's visual language exactly
- Subtle verification badges: "✓ Verified" (green border), "♦ Permanent" (purple border)
- Search box + "New Repository" button in expected positions
- Stars/forks displayed prominently with familiar icons

**Strengths:**
- **Zero learning curve** - users immediately understand interface
- Verification badges are additive (don't disrupt GitHub muscle memory)
- Builds trust through familiarity before introducing novel concepts
- Appeals to widest user range: Alex knows where everything is, Anonymous Visitor isn't confused
- Positions Rig as "drop-in GitHub replacement" rather than "different thing"

**Weaknesses:**
- Less distinctive - users might not immediately recognize as decentralized
- Verification badges are subtle - power users might miss technical details
- Doesn't fully leverage opportunity to educate about decentralization

**User Fit:** Excellent universal fit. Serves all personas with varying success:
- Alex: Familiar, productive immediately ✓
- Jordan: Same GitHub workflow ✓
- Sam: Standard research interface ✓
- Casey: Familiar but want more Web3 aesthetic (moderate fit)
- Anonymous Visitor: Zero friction ✓✓
- Taylor: Want more transparency (needs supplemental views)

**Selection Rationale:**
- **Minimizes adoption friction** - primary barrier to competing with GitHub
- **Familiar = Trustworthy** - users trust interfaces they recognize
- **Progressive enhancement ready** - can layer disclosure without breaking familiarity
- **Best for onboarding Anonymous Visitor** - mission-critical persona

---

#### Direction 3: Minimal Trust Proof
**Concept:** Spacious light design emphasizing permanence guarantees  
**Aesthetic:** White backgrounds, generous spacing, large typography, bold trust signals  
**Key Features:**
- Hero section: "Permanent. Verifiable. Unstoppable." with explanatory copy
- Large visual trust indicators (✓ VERIFIED, ♦ PERMANENT as prominent badges)
- Stats grid: Stars/Forks/Language/License in large, readable format
- Green verification panel: "✓ Signature Verified" with full npub display
- "200+ Year Storage Guarantee" badge prominently displayed

**Strengths:**
- Perfect for Sam (Archivist) - emphasizes permanence immediately
- Trust signals are impossible to miss - addresses skepticism directly
- Clean, professional aesthetic - feels like "serious infrastructure"
- Excellent for marketing/landing pages - communicates value proposition instantly

**Weaknesses:**
- **Not space-efficient** - generous spacing means fewer repos visible per screen
- Light backgrounds less preferred by developers (dark mode expectation)
- Too different from GitHub - higher learning curve
- Emphasis on trust *before* functionality may seem defensive

**User Fit:** Excellent for Sam (Archivist), good for Anonymous Visitor. Poor for Alex/Casey (want productivity over marketing).

---

#### Direction 4: P2P Network Dashboard
**Concept:** Visual network health and relay connection status front-and-center  
**Aesthetic:** Dark with neon accents (#3b82f6, #8b5cf6), glassmorphism cards, animated network nodes  
**Key Features:**
- Network visualization: animated nodes representing relays (visual P2P proof)
- Stats grid: Connected Relays (4/5), Avg Latency (23ms), Network Health (98%)
- Relay status sidebar: live connection indicators with latency per relay
- Repository cards showing which relays served each result
- Arweave storage status per repository

**Strengths:**
- **Makes decentralization tangible** - users *see* P2P in action
- Excellent for Casey (Web3 Dev) - aligns with Web3 aesthetic expectations
- Addresses "Performance Perception" challenge - shows why delays happen
- Network health metrics build trust through transparency
- Educational for Anonymous Visitor - passive learning

**Weaknesses:**
- **Network status dominates** - repos become secondary to infrastructure
- Visual noise - many elements competing for attention
- May emphasize complexity rather than reliability
- Stats require explanation (is 4/5 relays good? bad?)

**User Fit:** Excellent for Casey, Taylor. Good for Alex (wants relay visibility). Poor for Jordan (just wants code fast).

---

#### Direction 5: Progressive Disclosure ⭐ SELECTED
**Concept:** Simple surface with expandable technical details for varying skill levels  
**Aesthetic:** Clean white design, comfortable spacing, "Show Details" buttons for technical content  
**Key Features:**
- Simple repository cards: name, description, stars/forks, language (GitHub-familiar)
- "Show Details" button reveals: Nostr npub, Arweave transaction, signature status, relay status
- Technical details in subtle gray panel (doesn't disrupt reading flow when closed)
- Grid layout: 2 columns for technical details (scannable)
- Labels: "Nostr Public Key", "Arweave Transaction", "Signature Status", "Storage Status"

**Strengths:**
- **Serves all technical levels simultaneously** - addresses Challenge #3 perfectly
- Anonymous Visitor sees clean interface (no crypto jargon)
- Taylor clicks "Show Details" → full technical breakdown
- Doesn't hide information - makes it accessible on demand
- Encourages exploration ("What's under here?") - educational
- Can combine with any visual direction (pattern, not aesthetic)

**Weaknesses:**
- Requires intentional action to verify - less passive trust building
- "Show Details" button might be overlooked by power users
- Technical details panel requires careful design to avoid clutter
- Needs good default state (closed or open on first visit?)

**User Fit:** **UNIVERSAL SOLUTION to technical diversity problem**
- Alex: Clicks details immediately, sees everything needed ✓✓
- Jordan: Ignores details, browses quickly ✓✓
- Sam: Expands for cryptographic verification ✓✓
- Casey: Explores technical implementation ✓✓
- Anonymous Visitor: Never clicks, has zero-friction experience ✓✓
- Taylor: Lives in expanded mode, copies values ✓✓

**Selection Rationale:**
- **Solves Challenge #3** (progressive complexity) completely
- **Pattern, not just aesthetic** - can be combined with Direction 2
- **Enables trust without requiring it** - user chooses depth
- **No persona left behind** - serves minimum and maximum technical needs
- **Scales with user learning** - Anonymous Visitor today, power user tomorrow

---

#### Direction 6: Ecosystem Native
**Concept:** Web3 aesthetics with gradients, glassmorphism, Nostr-native branding  
**Aesthetic:** Purple gradient backgrounds (#667eea → #764ba2), glassmorphic cards (backdrop-filter), glowing effects  
**Key Features:**
- Hero: "Nostr-Native Git Hosting" with bold gradient headline
- "⚡ Nostr Native" badges on repositories (ecosystem identity)
- Glassmorphic cards with rgba backgrounds and blur effects
- Verification/Permanence badges as glowing indicators (✓ Verified, ♦ Permanent)
- Monospace Arweave transaction IDs on dark overlay panels

**Strengths:**
- **Signals decentralized identity immediately** - no confusion about platform type
- Appeals strongly to Casey (Web3 Dev) - matches dApp aesthetic expectations
- Distinctive, memorable branding - stands out from GitHub
- "Nostr Native" badge creates community belonging
- Gradient aesthetic = modern, cutting-edge feeling

**Weaknesses:**
- **Alienates traditional developers** - "too crypto" for mainstream adoption
- Gradients reduce text readability (accessibility concern)
- May be perceived as "trend-chasing" rather than reliable infrastructure
- Glassmorphism performance cost (backdrop-filter expensive)
- Locks Rig into Web3 niche rather than "GitHub for everyone"

**User Fit:** Excellent for Casey, Taylor. Moderate for Alex (wants reliability over aesthetics). Poor for Jordan, Sam, Anonymous Visitor (too different).

---

#### Direction 7: Data-First Table
**Concept:** Dense tabular layout optimized for information density and power users  
**Aesthetic:** Spreadsheet-inspired, monospace fonts (Berkeley Mono), high-contrast rows  
**Key Features:**
- Header: "REPOSITORIES" with aggregate stats (Total: 2,145 | Verified: 2,145 | Storage: 847 GB)
- Table columns: NAME | DESCRIPTION | STARS | FORKS | LANG | LICENSE | STATUS | UPDATED
- Status indicators: Green dot + "LIVE" for active repositories
- Monospace everything for alignment precision
- Pagination: "Showing 1-4 of 2,145 repositories" with PREV/NEXT buttons

**Strengths:**
- **Maximum information density** - see many repositories at once
- Excellent for Taylor (Ecosystem Builder) scanning entire ecosystem
- Sortable columns enable research workflows (Sam's use case)
- Familiar to power users (GitHub's own table views)
- Fast scanning - eye travels down columns efficiently

**Weaknesses:**
- **Zero onboarding support** - overwhelming wall of data
- No space for educational elements (trust signals, verification explanation)
- Description column truncated - can't read full repo purpose
- Feels utilitarian rather than trustworthy
- Poor mobile experience (table doesn't adapt to narrow screens)

**User Fit:** Excellent for Taylor (researching patterns). Good for Alex (power user). Poor for Anonymous Visitor, Jordan (too dense).

---

#### Direction 8: Mobile-First Cards
**Concept:** Large touch targets with avatar-driven card-based stacked layout  
**Aesthetic:** Light backgrounds, colorful avatars, generous padding, single-column cards  
**Key Features:**
- Search box prominent: "Search repositories..." (full-width, large tap target)
- Repository avatars: 56x56px colorful gradients with first letter (B for Bitcoin, N for Nostr)
- Badges: "✓ Verified" (green), "♦ Permanent" (purple) as pills
- Stats grid: 3 columns (Stars | Forks | Language) with large numbers
- Full-width "View Repository" button (16px padding, easy to tap)

**Strengths:**
- **Perfect for Jordan** (Contributor) - on-the-go access optimized
- Touch-friendly: 44x44px minimum targets, generous spacing
- Avatar system creates visual memory (recognize repos by color/letter)
- Works perfectly on mobile (where Jordan uses VPN on phone)
- Accessible: large text, high contrast, simple navigation

**Weaknesses:**
- **Desktop inefficient** - huge whitespace on large screens
- Single column = vertical scrolling forever
- Cards take 2-3x space of compact views
- Avatar system less useful for discovering new repos
- Doesn't leverage desktop screen real estate

**User Fit:** Excellent for Jordan. Poor for everyone else on desktop. (Mobile-specific direction, not primary experience.)

---

### Selection Decision Matrix

#### Evaluation Criteria

Each direction was evaluated against three critical factors:

1. **Persona Coverage** - Which users does this serve well? (Weight: 40%)
2. **Design Challenge Solutions** - Does this solve our key challenges? (Weight: 40%)  
3. **Implementation Feasibility** - Can this be built with our stack/timeline? (Weight: 20%)

#### Scoring Summary

| Direction | Persona Coverage | Challenge Solutions | Feasibility | Total Score |
|-----------|-----------------|--------------------:|------------:|------------:|
| 1. Technical Transparency | 3/6 (Taylor, Casey, Alex) | Trust ✓ Perf ✗ Complex ✗ | High | 58% |
| **2. GitHub Evolved** ⭐ | **6/6 (Universal)** | **Trust ✓ Perf ○ Complex ○** | **High** | **88%** |
| 3. Minimal Trust Proof | 3/6 (Sam, Anon, Alex) | Trust ✓✓ Perf ✗ Complex ✗ | High | 65% |
| 4. P2P Network Dashboard | 3/6 (Casey, Taylor, Alex) | Trust ✓ Perf ✓✓ Complex ○ | Medium | 67% |
| **5. Progressive Disclosure** ⭐ | **6/6 (Universal)** | **Trust ✓ Perf ○ Complex ✓✓** | **High** | **95%** |
| 6. Ecosystem Native | 2/6 (Casey, Taylor) | Trust ○ Perf ✗ Complex ✗ | Medium | 42% |
| 7. Data-First Table | 2/6 (Taylor, Alex) | Trust ✗ Perf ✗ Complex ✗ | High | 38% |
| 8. Mobile-First Cards | 1/6 (Jordan mobile) | Trust ○ Perf ○ Complex ✓ | High | 52% |

**Legend:**
- ✓✓ Excellent solution
- ✓ Good solution
- ○ Partial solution
- ✗ Does not address

#### Key Findings

**Direction 5 (Progressive Disclosure) is the clear winner** when evaluated objectively:
- **Only pattern that serves all 6 personas equally** (Anonymous Visitor through Taylor)
- **Directly solves Challenge #3** (Progressive Complexity) - the hardest challenge
- **Enables both trust strategies** - passive (visible badges) and active (click to verify)
- **Is a pattern, not an aesthetic** - can be combined with other directions

**Direction 2 (GitHub Evolved) is the strategic choice** for adoption:
- **Minimizes switching cost** from GitHub - critical for initial adoption
- **Universal fit** across all personas (even if not perfect for each)
- **Trustworthy through familiarity** - users trust what they recognize
- **Allows progressive enhancement** - can add transparency without breaking UX

### Synthesis: The Combined Approach

**Selected Strategy: GitHub Evolved (aesthetic foundation) + Progressive Disclosure (information architecture pattern)**

Rather than treating these as competing directions, we combine them into a unified design system:

#### Base Layer: GitHub Evolved Aesthetic
- Tab navigation (Repositories | Issues | Pull Requests)
- Dark mode color palette (#0d1117 backgrounds, #c9d1d9 text)
- Familiar repository cards with stars/forks/language
- Search box + action buttons in expected positions
- GitHub-compatible spacing and density

**Rationale:** Establishes comfort and trust through recognition. Users immediately understand "this is like GitHub, but permanent."

#### Information Architecture: Progressive Disclosure Pattern
- Default view: Clean repository cards (name, description, stats)
- Collapsed state: Subtle badges ("✓ Verified", "♦ Permanent") hint at more
- Expansion trigger: "Technical Details" button or badge click
- Expanded state: Nostr npub, Arweave TX, relay status, signature verification
- User-controlled: Preference persists (power users default-expanded, casual users default-collapsed)

**Rationale:** Serves all technical levels without compromise. Anonymous Visitor sees GitHub-simple. Taylor sees everything.

#### Enhancement Layer: Selective P2P Dashboard Elements
- Relay status indicator in header (subtle, like WiFi icon)
- Click relay badge → modal with Direction 4's relay status panel
- Network health: background indicator (green = good, yellow = degraded)
- Loading states borrow from Direction 4 ("Querying relays...")

**Rationale:** Addresses Performance Perception challenge without making infrastructure the hero. Users understand *why* delays happen.

#### Mobile Optimization: Direction 8 Patterns
- Responsive: Direction 2 on desktop, Direction 8 card layout on mobile
- Touch targets: 44x44px minimum (from Direction 8)
- Search-first mobile UI: Jordan's on-the-go access prioritized

**Rationale:** Different contexts need different layouts. Jordan on mobile has different needs than Taylor on desktop.

### Implementation Guidance

#### Component Architecture

**Repository Card (Base)**
```typescript
<RepositoryCard
  mode="default|expanded"  // Controls disclosure state
  showTechnicalDetails={user.preference.powerMode}
  variant="github|dashboard|mobile"  // Adapts to context
>
  <Card.Header>
    <RepoTitle />
    <TrustBadges collapsed />  // "✓ Verified" "♦ Permanent"
  </Card.Header>
  
  <Card.Content>
    <Description />
    <Stats />  // Stars, forks, language
  </Card.Content>
  
  <Card.Footer>
    <ExpandButton onClick={toggleTechnicalDetails}>
      Show Technical Details
    </ExpandButton>
  </Card.Footer>
  
  {expanded && (
    <Card.TechnicalPanel>
      <TechnicalGrid>
        <Field label="Nostr Public Key" value={npub} copy />
        <Field label="Arweave Transaction" value={arTx} copy />
        <Field label="Signature Status" value="✓ Verified" />
        <Field label="Storage Status" value="♦ Permanent" />
        <Field label="Connected Relays" value="4/5 online" />
      </TechnicalGrid>
    </Card.TechnicalPanel>
  )}
</RepositoryCard>
```

#### State Management

**User Preferences (localStorage)**
- `displayMode`: "simple" | "technical" (default: "simple")
- `expandedRepos`: Set<repoId> (persist which repos user expanded)
- `relayVisibility`: "hidden" | "header" | "always" (default: "header")

**Progressive Enhancement Flow:**
1. Anonymous Visitor: Default simple, never sees technical details
2. First technical detail expansion: Show tooltip "You can always expand technical details. Want to default-expand for all repos?"
3. Power user: Defaults to expanded, sees technical details immediately
4. Network issues: Auto-show relay status, teach user about P2P

#### Responsive Breakpoints

**Desktop (≥1024px): GitHub Evolved**
- Two-column repository grid
- Sidebar space for filters
- Technical details expand inline (don't push content down)

**Tablet (768px - 1023px): Compact GitHub**
- Single-column repository list
- Collapsed filters (hamburger menu)
- Technical details expand below card

**Mobile (<768px): Mobile-First Cards**
- Full-width cards with avatars (Direction 8)
- Search-first interface
- Technical details in modal (don't expand inline)

### Design Tokens

#### Trust Signal Colors
```css
--verified-green: #10b981;
--permanent-purple: #8b5cf6;
--relay-active: #3b82f6;
--relay-timeout: #ef4444;
--signature-valid: #10b981;
```

#### Badge Styles (shadcn/ui variants)
```typescript
<Badge variant="outline" className="border-[--verified-green] text-[--verified-green]">
  ✓ Verified
</Badge>
<Badge variant="outline" className="border-[--permanent-purple] text-[--permanent-purple]">
  ♦ Permanent
</Badge>
```

### Testing Strategy

**Persona-Specific Testing:**
- Anonymous Visitor: Never show technical details by default → measure activation rate
- Alex (Maintainer): Default-expand technical details → measure time-to-trust
- Jordan (Mobile): Test on throttled 3G connection → measure perceived performance
- Taylor (Ecosystem Builder): Verify all event IDs copyable → measure DevTools usage

**A/B Testing Candidates:**
- Badge placement: Inline vs. top-right vs. collapsible
- Technical details default: Collapsed vs. expanded (segmented by referrer)
- Relay status visibility: Always vs. on-error vs. never
- "Show Details" button text: "Technical Details" vs. "Verify" vs. "Decentralization Info"

### Open Questions

**1. Should relay status be visible by default, or only during queries?**
- **Pro always-visible:** Builds trust passively, users see decentralization constantly
- **Pro on-query-only:** Reduces noise, only shows when relevant
- **Recommendation:** Header indicator (like WiFi) + expand on click → Direction 4 modal

**2. How much technical jargon in expanded state?**
- **Option A:** Explain everything ("Nostr Public Key: The cryptographic identifier...")
- **Option B:** Label only ("Nostr Public Key: npub1...")
- **Option C:** Progressive explanation (tooltip on hover)
- **Recommendation:** Option C - labels + "?" tooltip for explanations (doesn't clutter)

**3. Should we gamify verification actions?**
- **Idea:** "X users have verified this repo" counter, "Verify Now" CTA
- **Risk:** Feels like social proof manipulation rather than transparency
- **Recommendation:** No gamification - let cryptographic proof speak for itself

**4. Mobile: Cards (Direction 8) or compact list (Direction 2 responsive)?**
- **Trade-off:** Cards = easier tapping, list = see more repos
- **Data needed:** Measure Jordan's session length vs. repos viewed
- **Recommendation:** A/B test, likely cards win (Jordan's primary use case)

---

### Rationale Summary

**Why GitHub Evolved + Progressive Disclosure wins:**

1. **Lowest Barrier to Entry:** Anonymous Visitor sees familiar interface, zero crypto jargon → addresses Challenge #3 (Progressive Complexity) for entry-level users

2. **Highest Power User Ceiling:** Taylor clicks "Show Details" → sees everything (npub, Arweave TX, relay status, signatures) → addresses Challenge #3 for advanced users

3. **Trust Through Familiarity First, Then Transparency:** Users trust GitHub UX → reduces skepticism → *then* they expand technical details → verification feels like discovery, not homework

4. **Universal Persona Coverage:** Only approach that serves all 6 personas without compromising any → critical for ecosystem growth

5. **Scalable Implementation:** Pattern-based (not aesthetic-locked) → can iterate visual design without rebuilding information architecture → future-proof

6. **Addresses All Three Challenges:**
   - Challenge #1 (Trust Through Transparency): Progressive disclosure lets users choose depth
   - Challenge #2 (Performance Perception): Borrowed relay status UI from Direction 4
   - Challenge #3 (Progressive Complexity): **This is the solution** - simple surface, deep dive available

**What we're NOT doing (and why):**

- **Not** Direction 1 (Technical Transparency): Overwhelming for casual users, locks us into developer-only niche
- **Not** Direction 3 (Minimal Trust Proof): Too marketing-focused, not productive enough for daily use
- **Not** Direction 6 (Ecosystem Native): Alienates traditional developers, "too crypto" perception risk
- **Not** Direction 7 (Data-First Table): Zero onboarding support, poor trust-building
- **Not** Direction 8 alone (Mobile-First): Desktop users are 70%+ of initial audience per market research

**But we ARE borrowing:**
- Direction 4's relay status UI (for expanded state and loading)
- Direction 8's mobile card layout (responsive breakpoint)
- Direction 1's debug aesthetics (for Taylor's "Developer Mode" future feature)

This synthesis creates a design system that meets users where they are (GitHub familiarity) while enabling them to explore as deep as they want (progressive disclosure), all while maintaining Rig's core value proposition (visible decentralization through transparency).

---

**Next Steps:**
- High-fidelity mockups of selected direction combination (Figma)
- Component library implementation (shadcn/ui v4 + custom trust badges)
- Interactive prototype with real Nostr data (validate disclosure depth)
- User testing with all 6 personas (measure activation, trust, time-to-verification)

---


---

## User Journey Flows

### Journey 1: Anonymous Visitor - Zero-Friction Discovery

**Journey Goal:** Take a complete newcomer from initial skepticism through casual browsing to subtle trust building, ultimately leading to bookmark/share without any authentication barriers.

**Design Principle:** Never ask for authentication, never show overwhelming technical jargon, and progressively reveal complexity only if the user actively seeks it.

#### Flow Diagram

```mermaid
flowchart TD
    Start[Tweet/Social Link Click:<br/>arns://rig-demo] --> Load{Page Loading}
    
    Load --> |Fast <2s| LandingPage[Landing: Repository List<br/>GitHub-familiar layout]
    Load --> |Slow >2s| LoadingState[Loading Indicator:<br/>"Querying 5 Nostr relays..."]
    LoadingState --> LandingPage
    
    LandingPage --> Browse{User Action?}
    
    Browse --> |Click Repo| RepoDetail[Repository Detail View<br/>README + file tree visible]
    Browse --> |Scroll List| SeeMore[See more repositories<br/>Infinite scroll loads more]
    Browse --> |Notice Footer| LearnMore[Click "Powered by Nostr + Arweave"<br/>Educational modal opens]
    
    RepoDetail --> Explore{Exploration Actions}
    
    Explore --> |Browse Files| FileView[File Content View<br/>Syntax highlighting, line numbers]
    Explore --> |View Commits| CommitList[Commit History<br/>Standard git log view]
    Explore --> |Notice Badges| BadgeHover["✓ Verified" badge visible<br/>Subtle, not intrusive]
    
    BadgeHover --> |Ignore| ContinueBrowsing[Continue browsing normally<br/>Trust builds passively]
    BadgeHover --> |Hover/Click| BadgeTooltip[Tooltip: "This repo is verified<br/>on 4 of 5 Nostr relays"]
    
    BadgeTooltip --> |Click "Learn More"| TechnicalPanel[Expandable panel:<br/>Simple explanation of verification]
    BadgeTooltip --> |Dismiss| ContinueBrowsing
    
    FileView --> OpenDevTools{Tech-Savvy User?}
    OpenDevTools --> |Yes| InspectNetwork[DevTools open:<br/>See relay queries, Arweave requests]
    OpenDevTools --> |No| CasualUser[Regular browsing continues]
    
    InspectNetwork --> Realization["Aha! This IS decentralized<br/>No central server visible"]
    
    CasualUser --> Trust{Build Trust?}
    ContinueBrowsing --> Trust
    Realization --> Trust
    
    Trust --> |Yes| Bookmark[Bookmark specific repository<br/>Copy ArNS URL to share]
    Trust --> |Not Yet| LearnMore
    
    LearnMore --> Educational[Educational Content:<br/>Simple language, no jargon<br/>"Code stored permanently"<br/>"No account needed"]
    
    Educational --> |Still Interested| ReturnBrowsing[Return to browsing<br/>Now with context]
    Educational --> |Not Convinced| Exit[Leave site<br/>But no friction experienced]
    
    ReturnBrowsing --> Trust
    Bookmark --> Advocate[Share with coworkers:<br/>"Check this out, it actually works"]
    
    Advocate --> Success[Journey Complete:<br/>Anonymous → Early Adopter]
```

#### Flow Optimization

**Entry Point Optimization:**
- **No splash screen** - Load directly to repository list (familiar = trustworthy)
- **Educational loading indicator** - "Querying relays..." teaches P2P concept without explicit explanation
- **ArNS URL visible but not explained** - Progressive disclosure allows discovery

**Passive Trust Building:**
- Verification badges present but subtle (✓ Verified, ♦ Permanent)
- Hover reveals simple tooltip ("Verified on 4/5 relays")
- Click expands to technical panel (optional depth)
- User controls information depth completely

**Zero Friction Points:**
- No authentication prompts
- No "sign up to continue" walls
- No rate limiting messages
- No wallet connection popups
- No crypto jargon in default view

**Success Metrics:**
- Time to first repository view: <5 seconds
- Repositories viewed before exit: target >3
- Educational content engagement: 30-40% click "Learn More"
- Bookmark/share rate: target 15-20%

---

### Journey 2: Alex - Trust Through Verification

**Journey Goal:** Enable a security-conscious maintainer to independently verify all permanence and decentralization claims through deep technical inspection while maintaining GitHub-familiar productivity.

**Design Principle:** Enable deep technical inspection without overwhelming casual users through progressive disclosure. Alex should be able to verify cryptographic signatures, check multi-relay consensus, and inspect Arweave storage independently.

#### Flow Diagram

```mermaid
flowchart TD
    Start[Nostr Post Click:<br/>arns://rig-demo] --> Skeptical{Initial Reaction}
    
    Skeptical --> |"Probably vaporware"| LoadWithCaution[Page loads<br/>DevTools already open]
    
    LoadWithCaution --> FirstImpression[Sees: GitHub-like interface<br/>Familiar tabs, layout, structure]
    
    FirstImpression --> TestClick[Click random repository<br/>Testing if it's real]
    
    TestClick --> LoadSpeed{Load Time}
    LoadSpeed --> |<2s| Surprised["Hmm, that was fast<br/>Not what I expected"]
    LoadSpeed --> |>3s| Concerned["Slow... but watching Network tab<br/>See relay queries happening"]
    
    Surprised --> InspectCommit[Click through commits<br/>Looking for proof]
    Concerned --> InspectCommit
    
    InspectCommit --> SeeIDs["Each commit shows:<br/>• Nostr event ID<br/>• Arweave transaction ID"]
    
    SeeIDs --> VerifyArweave[Click "View on Arweave" link<br/>Opens Arweave explorer]
    
    VerifyArweave --> BlockExplorer[Arweave Block Explorer:<br/>Raw git object visible<br/>SHA-256 hash matches<br/>Timestamp confirmed]
    
    BlockExplorer --> FirstProof["This is REAL data<br/>Actually stored on Arweave"]
    
    FirstProof --> ReturnRig[Return to Rig interface<br/>Now looking closer]
    
    ReturnRig --> ExpandTechnical[Click "Show Technical Details"<br/>Progressive disclosure activated]
    
    ExpandTechnical --> TechnicalPanel[Technical Panel Expands:<br/>━━━━━━━━━━━━━━━<br/>Nostr Public Key: npub1...<br/>Arweave TX: ar://abc...<br/>Signature Status: ✓ Verified<br/>Connected Relays: 4/5 online<br/>━━━━━━━━━━━━━━━]
    
    TechnicalPanel --> CopyVerify[Copy npub to verify signature<br/>Use external Nostr client]
    
    CopyVerify --> ExternalCheck[Nostr Client:<br/>Event exists on multiple relays<br/>Signature validates]
    
    ExternalCheck --> CheckRelays[Back to Rig:<br/>Open relay status modal]
    
    CheckRelays --> RelayDashboard[Relay Status Dashboard:<br/>━━━━━━━━━━━━━━━<br/>● relay.nostr.band - 18ms<br/>● nos.lol - 24ms<br/>● relay.damus.io - 31ms<br/>○ relay.snort.social - timeout<br/>● nostr.wine - 19ms<br/>━━━━━━━━━━━━━━━]
    
    RelayDashboard --> UnderstandRedundancy["4/5 working = system healthy<br/>P2P redundancy works"]
    
    UnderstandRedundancy --> TestOwnRepo[Search for own repo<br/>Published last week via Crosstown]
    
    TestOwnRepo --> FindOwn[Own repo appears<br/>Same data across all relays]
    
    FindOwn --> CloseInspect[Close laptop to test<br/>Waiting 10 minutes...]
    
    CloseInspect --> ReopenDifferentNetwork[Reopen on different network<br/>Different location]
    
    ReopenDifferentNetwork --> SameData["Same URL loads same data<br/>No server to ban account<br/>No platform owner to delete"]
    
    SameData --> Realization["BREAKTHROUGH MOMENT:<br/>'No one can take this down.<br/>Not GitHub. Not any government.<br/>Not anyone.'"]
    
    Realization --> DecisionMade[Decision: Migrate sensitive project]
    
    DecisionMade --> ThreeWeeksLater[3 weeks later:<br/>Sensitive project on Rig<br/>GitHub becomes mirror]
    
    ThreeWeeksLater --> ShareTeam[Share ArNS link in README:<br/>"Primary hosting: Rig<br/>GitHub: backup mirror"]
    
    ShareTeam --> Advocate[Contributors ask why?<br/>Alex explains permanence proof]
    
    Advocate --> Success[Journey Complete:<br/>Fear → Confidence<br/>Skeptic → Advocate]
```

#### Flow Optimization

**Power User Expectations:**
- **DevTools-friendly** - Network tab shows relay queries, not obfuscated
- **Technical details default-expanded** - For returning users (localStorage preference)
- **Copy buttons on all IDs** - npub, Arweave TX, event IDs all copyable
- **External verification encouraged** - Direct links to block explorers, Nostr clients

**Trust Building Through Verification:**
- Multiple verification paths (Arweave explorer, Nostr signature, relay consensus)
- No "trust us" marketing claims - user verifies independently
- Redundancy made visible (4/5 relays = healthy system, not "broken")
- Permanent URLs proven through repeated testing (close/reopen still works)

**Progressive Disclosure for Power Users:**
- Simple view available but Alex immediately clicks "Show Technical Details"
- Technical panel stays expanded (localStorage: `displayMode: "technical"`)
- Relay status modal available on demand (header icon)
- Event IDs copyable for external verification tools

**Critical Success Criteria:**
- Time to first verification: <2 minutes (Alex is impatient)
- Verification completion rate: 80%+ (if Alex can't verify, they don't trust)
- External tool usage: 60%+ check Arweave explorer or Nostr client
- Migration decision rate: 40-50% of maintainers who fully verify

---

### Journey 3: Jordan - Reliable Mobile Access

**Journey Goal:** Enable a contributor in a region with intermittent connectivity and GitHub restrictions to reliably access code repositories on mobile without VPN, with graceful degradation under poor network conditions.

**Design Principle:** Optimize for small screens, poor networks, and geographic relay distribution. Ensure graceful degradation so single relay failures never block access.

#### Flow Diagram

```mermaid
flowchart TD
    Start[Maintainer Nostr Post:<br/>arns://nostr-client-mirror<br/>Mobile phone, no VPN] --> LoadMobile{Mobile Detection}
    
    LoadMobile --> |Screen <768px| MobileLayout[Mobile-First Card Layout<br/>Large touch targets<br/>Single-column design]
    
    MobileLayout --> QueryRelays[Query Nostr relays<br/>Looking for geographic relay]
    
    QueryRelays --> RelaySelection{Relay Response}
    
    RelaySelection --> |Local relay fast| LocalRelay[Connected to relay in country<br/>18ms response time]
    RelaySelection --> |Local relay blocked| FallbackRelay[Fallback to international relays<br/>45ms response time]
    
    LocalRelay --> FastLoad[Repository loads <2s<br/>No VPN overhead]
    FallbackRelay --> SlowerLoad[Repository loads in 3s<br/>Still acceptable, no timeout]
    
    FastLoad --> MobileRepoView[Mobile Repository View:<br/>━━━━━━━━━━━━<br/>Search box full-width<br/>Avatar: B (Bitcoin)<br/>bitcoin/bitcoin<br/>✓ Verified ♦ Permanent<br/>━━━━━━━━━━━━<br/>Stats: 79.2k ⭐ | 38.4k 🔱<br/>View Repository button<br/>━━━━━━━━━━━━]
    
    SlowerLoad --> MobileRepoView
    
    MobileRepoView --> AccessRealization["No VPN required<br/>No 'unavailable in your region'<br/>No slow proxy"]
    
    AccessRealization --> BrowsePR[Tap "Pull Requests" tab<br/>Touch target 44x44px]
    
    BrowsePR --> PRList[PR List loads:<br/>Card-based stacked layout]
    
    PRList --> OpenPR[Tap target PR<br/>The patch to review]
    
    OpenPR --> LoadDiff[Diff View loads:<br/>Mobile-optimized<br/>Side-by-side → stacked on mobile]
    
    LoadDiff --> ReviewCode[Scroll through diff:<br/>Green additions<br/>Red deletions<br/>Line numbers visible]
    
    ReviewCode --> SpotIssue[Spot potential race condition<br/>Want to comment...]
    
    SpotIssue --> ReadOnly["Read-only in MVP<br/>But can view all code"]
    
    ReadOnly --> Bookmark[Bookmark repository<br/>Mobile browser bookmark]
    
    Bookmark --> TestResilience[Test: Turn on airplane mode<br/>Then turn back on]
    
    TestResilience --> ServiceWorker[Service worker cache works<br/>Previously viewed page available offline]
    
    ServiceWorker --> BlockLocalRelay[Hypothetical test:<br/>Block local relay in DevTools]
    
    BlockLocalRelay --> AutoFallback[Frontend automatically queries<br/>International relays<br/>Seamless to user]
    
    AutoFallback --> GracefulDegradation["Graceful degradation proven:<br/>No single point of failure"]
    
    GracefulDegradation --> DailyUse[Next day: Check patch queue<br/>No VPN needed]
    
    DailyUse --> GitHubBlocked[GitHub blocked today<br/>Jordan doesn't care anymore]
    
    GitHubBlocked --> RigWorks["Rig works regardless<br/>P2P access reliable"]
    
    RigWorks --> SharePeers[Share with contributors<br/>in restricted regions]
    
    SharePeers --> ThreeContributors[3 new contributors join<br/>Specifically because Rig accessible]
    
    ThreeContributors --> Inclusion["Feel included in global OSS<br/>Not second-class citizen"]
    
    Inclusion --> Success[Journey Complete:<br/>Frustration → Reliable Access<br/>Excluded → Included]
```

#### Flow Optimization

**Mobile-First Design:**
- **Responsive breakpoint** - <768px triggers card layout (Direction 8 from design exploration)
- **Touch targets** - Minimum 44x44px (Apple/Google accessibility guidelines)
- **Single-column cards** - No horizontal scrolling
- **Search-first interface** - Large, prominent search box at top
- **Avatar system** - Visual memory aids (B for Bitcoin, N for Nostr)

**Network Resilience:**
- **Geographic relay priority** - Connect to nearest relay first
- **Automatic fallback** - If primary relay fails, query others silently
- **Loading indicators** - "Querying relays..." shows progress, manages expectations
- **Service worker caching** - Offline capability for previously viewed pages
- **Graceful degradation** - Never show "connection failed" unless all relays timeout

**Performance Perception Management:**
- Progress indicators during multi-relay queries
- Skeleton screens while loading (show structure immediately)
- Optimistic UI (render cached data while fresh data loads)
- Network status icon (subtle WiFi-like indicator: green = good, yellow = degraded)

**Critical Success Criteria:**
- Mobile load time: <3s on 3G connection (Jordan's reality)
- Relay fallback success rate: 95%+ (if local relay blocked, international works)
- Offline cache hit rate: 70%+ for previously viewed pages
- Daily active usage: Jordan checks patch queue daily without VPN

---

## Journey Patterns

Analyzing the three critical flows reveals several reusable patterns that should be standardized across all Rig user experiences:

### Navigation Patterns

#### 1. Progressive Depth Navigation
```
Repository List → Repository Detail → File Tree → File Content → Commit History → Commit Diff
```
**Implementation:** Each level maintains context breadcrumb: `Home > bitcoin/bitcoin > src/ > main.cpp`

**Rationale:** Users can jump directly to any level without losing orientation. Back button works intuitively at each level.

#### 2. Tab-Based Feature Switching
```
Repositories | Issues | Pull Requests | Settings
```
**Implementation:** GitHub-familiar tabs with active state persisting across page reloads (localStorage)

**Rationale:** Familiar to GitHub users, reduces learning curve. Tab state persistence enables efficient multi-session workflows.

#### 3. Modal-Based Inspection
```
Badge hover → Tooltip → Click → Modal with full details
```
**Implementation:** Non-disruptive—clicking "Relay Status" opens modal, closing returns to exact scroll position

**Rationale:** Technical details available without disrupting browsing flow. Modal preserves context.

---

### Decision Patterns

#### 1. Implicit Exploration (No Forced Decisions)
- Never force user to choose between "simple" or "advanced" mode upfront
- Default to simple view, reveal advanced functionality on demand
- User's exploration choices inform interface (expand technical details → preference saved in localStorage)

**Rationale:** Forced decisions create friction. Implicit learning through interaction feels natural.

#### 2. Trust Verification Decision Tree
```
See badge → (Ignore OR Hover)
Hover tooltip → (Dismiss OR Click)
Click badge → (Read simple explanation OR Click "View on Arweave")
View external proof → (Return satisfied OR Copy IDs for deeper verification)
```

**Rationale:** Multiple verification depths serve different user trust thresholds. Anonymous Visitor stops at badge visibility; Alex verifies cryptographically.

#### 3. Error Recovery Decision Pattern
```
Relay timeout → Frontend auto-retries alternate relays (no user action needed)
All relays timeout → Show "Retry" button + explanation
User clicks Retry → Query relays again with exponential backoff
Still fails → Show "View cached data" option (service worker)
```

**Rationale:** Silent recovery for transient errors. Explicit recovery options only when automatic retry fails.

---

### Feedback Patterns

#### 1. Loading State Progression
```
Stage 1 (0-500ms): Skeleton screen (show structure immediately)
Stage 2 (500ms-2s): "Querying 5 Nostr relays..." (educational + progress)
Stage 3 (2s-5s): "Connected to 4/5 relays, loading data..." (reassurance)
Stage 4 (>5s): "This is taking longer than usual. Retrying..." (transparency)
```

**Rationale:** Each stage manages user expectations. Educational feedback teaches P2P concepts passively.

#### 2. Success Confirmation Feedback
```
✓ Verified badge appears after signature validation
♦ Permanent badge appears after Arweave storage confirmed
Toast notification: "Repository verified on 4 of 5 relays"
Subtle animation: badge fades in (not jarring popup)
```

**Rationale:** Visible confirmation builds trust. Subtle animations feel polished without being distracting.

#### 3. Trust Signal Hierarchy
```
Level 1 (Passive): Badges visible, no explanation required for casual browsing
Level 2 (Hover): Tooltip with simple explanation ("Verified on 4/5 relays")
Level 3 (Click): Expandable panel with technical details (npub, Arweave TX)
Level 4 (External): Link to block explorer for cryptographic proof
```

**Rationale:** Progressive disclosure of trust signals. Anonymous Visitor sees badges passively; Alex drills down to cryptographic verification.

#### 4. Network Status Feedback
```
Green dot: 4-5 relays connected, <50ms latency (healthy)
Yellow dot: 2-3 relays connected, or >100ms latency (degraded)
Red dot: 0-1 relays connected, significantly degraded experience
Click status dot: Open relay dashboard modal
```

**Rationale:** Ambient awareness without demanding attention. Power users click for details; casual users ignore if green.

---

## Flow Optimization Principles

### 1. Minimize Steps to Value

**Anonymous Visitor:** Click link → See repositories → Browse code (3 steps to first value)  
**Alex:** Browse repo → Click Arweave link → See cryptographic proof (3 steps to verification)  
**Jordan:** Open on mobile → View PR → Read diff (3 steps to productivity)

**Principle:** Every journey should deliver core value within 3 user actions. No artificial friction.

**Anti-pattern:** Multi-step onboarding wizards, forced tutorial overlays, account creation gates.

---

### 2. Reduce Cognitive Load at Decision Points

- Never present more than 2 choices simultaneously
- Default actions clearly indicated (primary button styling)
- Progressive disclosure: show simple choice first, advanced choices on expansion
- Example: "Show Details" button (1 choice) vs. "Technical | Advanced | Debug" dropdown (3 choices = cognitive overload)

**Principle:** Decision fatigue leads to abandonment. Simplify choices, make defaults intelligent.

**Anti-pattern:** Settings pages with 20 toggles, multi-column action menus, ambiguous button labels.

---

### 3. Provide Clear Feedback and Progress Indicators

- Every user action has visible feedback (<100ms response time)
- Loading states are educational ("Querying relays...") not just generic spinners
- Success states are confirmatory (✓ Verified badge appears with subtle animation)
- Error states are actionable ("Relay timeout. Retry?" with visible button)

**Principle:** Users tolerate delays when they understand *why* and *what's happening*. Silence breeds anxiety.

**Anti-pattern:** Blank screens during loading, generic "Loading..." text, errors without recovery options.

---

### 4. Create Moments of Delight or Accomplishment

**Anonymous Visitor:** "This actually works" moment when they realize no login required after viewing 8 pages  
**Alex:** Breakthrough moment seeing own repo data identical across 4 relays = "no one can take this down"  
**Jordan:** Relief moment when GitHub blocked but Rig still works instantly without VPN

**Principle:** Delight comes from exceeding expectations, not adding features. Jordan expected friction (VPN), got seamlessness.

**Anti-pattern:** Confetti animations on trivial actions, achievement badges for basic usage, gamification that feels manipulative.

---

### 5. Handle Edge Cases and Error Recovery Gracefully

**Single Relay Timeout:** Silent fallback to healthy relays, user sees no error  
**All Relays Timeout:** "Connection issues. Retry?" with explanation "Relays temporarily unavailable"  
**Slow Load:** Progressive feedback shows system working ("Querying 5 relays... 3 responded... loading...")  
**Offline:** Service worker cache shows last viewed data with banner "Viewing offline. Connect to see updates."

**Principle:** Errors should never dead-end. Always provide recovery path or degraded functionality.

**Anti-pattern:** "Error 500" without explanation, disabled buttons with no hint why, dead-end error states.

---

## Journey Success Matrix

| Journey | Primary Success Metric | Secondary Metrics | Critical Failure Point |
|---------|----------------------|-------------------|----------------------|
| **Anonymous Visitor** | >3 repositories viewed before exit | 15-20% bookmark rate, 30-40% "Learn More" clicks | Abandonment at first page load (>5s) |
| **Alex (Verification)** | 80%+ complete verification flow | 60%+ use external verification tools, 40-50% migration decision | Unable to verify cryptographic claims |
| **Jordan (Mobile)** | <3s mobile load on 3G | 95%+ relay fallback success, 70%+ offline cache hits | All relay timeout with no recovery |

**Tracking Implementation:** These metrics should be instrumented via privacy-respecting analytics (no user tracking, aggregated patterns only).

---

## Implementation Prioritization

Based on journey criticality and technical complexity:

### Phase 1 (MVP - Month 1-3)
**Critical Path:** Anonymous Visitor + Alex verification flows

- ✅ Repository list/detail views (GitHub Evolved layout)
- ✅ Progressive disclosure (Show Details button + technical panel)
- ✅ Arweave verification links ("View on Arweave")
- ✅ Basic relay status indicator (header icon)
- ✅ Loading state progression (educational feedback)
- ✅ Mobile-responsive breakpoints (<768px card layout)

### Phase 2 (Post-MVP - Month 4-6)
**Enhancement:** Jordan mobile optimization + advanced features

- ⚙️ Service worker caching (offline capability)
- ⚙️ Geographic relay priority (nearest relay first)
- ⚙️ Relay status modal (detailed dashboard)
- ⚙️ Network status feedback (green/yellow/red dot)
- ⚙️ Advanced error recovery (retry with exponential backoff)

### Phase 3 (Future - Month 7+)
**Polish:** Delight moments + ecosystem features

- 🔮 Ambient trust animations (badges fade in subtly)
- 🔮 Power user preferences (default-expanded technical details)
- 🔮 Developer mode toggle (Taylor's DevTools-heavy experience)
- 🔮 Citation export (Sam's academic use case)

---

## Next Step: Component Strategy

With user journeys mapped, we now move to defining the component library strategy—translating these flows into reusable shadcn/ui v4 components that implement the GitHub Evolved + Progressive Disclosure design system.


---

## Component Strategy

### Design System Foundation: shadcn/ui v4

**Chosen Design System:** shadcn/ui v4 (as specified in project requirements and design direction)

**Rationale for shadcn/ui v4:**
- Production-tested, accessible component primitives
- Tailwind-native (matches our React + Tailwind stack)
- Radix UI foundations (robust interaction patterns)
- Composable architecture (can extend with custom logic)
- Consistent with "GitHub Evolved" design direction (familiar patterns)
- Active maintenance and community support

**Available Components from shadcn/ui v4:**

**Layout & Structure:**
- Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Tabs, TabsList, TabsTrigger, TabsContent
- Collapsible, CollapsibleTrigger, CollapsibleContent
- Sheet, SheetTrigger, SheetContent (mobile drawer)
- Dialog, DialogTrigger, DialogContent (modals)

**Data Display:**
- Table, TableHeader, TableBody, TableRow, TableCell
- Badge (variants: default, secondary, destructive, outline)
- Avatar, AvatarImage, AvatarFallback
- Skeleton (loading states)

**Form & Input:**
- Button (variants: default, outline, ghost, destructive)
- Input, Textarea
- Select, SelectTrigger, SelectContent, SelectItem
- Checkbox, RadioGroup, Switch

**Feedback:**
- Toast, ToastAction, ToastTitle, ToastDescription
- Alert, AlertTitle, AlertDescription
- Progress
- Tooltip

**Navigation:**
- Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink
- NavigationMenu, NavigationMenuItem, NavigationMenuTrigger

---

### Component Gap Analysis

Based on user journey requirements (Anonymous Visitor, Alex, Jordan) and design direction (GitHub Evolved + Progressive Disclosure), we analyzed what components are needed versus what shadcn/ui provides:

| Component Needed | Available in shadcn/ui? | Strategy |
|------------------|------------------------|----------|
| Repository Card | ✅ Card primitive | ⚙️ **Compose:** Card + Badge + custom progressive disclosure |
| Technical Details Panel | ✅ Collapsible primitive | ⚙️ **Compose:** Collapsible + custom grid layout |
| Relay Status Dashboard | ❌ Not available | ✅ **Build Custom:** Nostr-specific, real-time status |
| Mobile Repository Card | ✅ Card + Avatar | ⚙️ **Variant:** Mobile-optimized Card composition |
| Code Diff Viewer | ❌ Not available | ✅ **Build Custom:** Git-specific, syntax highlighting |
| Educational Loading States | ✅ Skeleton primitive | ⚙️ **Enhance:** Skeleton + custom educational text |
| Trust Badge System | ✅ Badge primitive | ⚙️ **Style:** Custom badge variants with icons |
| Network Status Indicator | ❌ Not available | ✅ **Build Custom:** Real-time network health |
| File Tree Navigator | ❌ Not available | ✅ **Build Custom:** Hierarchical tree with git semantics |

**Coverage Summary:**
- **70% shadcn/ui coverage:** Standard UI patterns (Card, Badge, Button, Dialog, Tabs, Collapsible)
- **20% composition:** shadcn primitives + custom domain logic (Repository Card, Technical Panel)
- **10% fully custom:** Domain-specific components (Relay Dashboard, Diff Viewer, File Tree, Network Status)

---

## Custom Components

### Component 1: RelayStatusDashboard

**Purpose:** Display real-time status of Nostr relay connections with latency metrics and health indicators. Critical for Alex's verification journey (trust through transparency) and all users' understanding of P2P network health.

**Usage:** Opened via Network Status Indicator click in header. Shows detailed breakdown when users need to understand relay performance or debug connection issues.

**Anatomy:**
```
┌─ RelayStatusDashboard ─────────────────────┐
│ ✕ Close                                     │
│                                             │
│ Relay Connections                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ ● relay.nostr.band          18ms [Copy URL] │
│ ● nos.lol                   24ms [Copy URL] │
│ ● relay.damus.io            31ms [Copy URL] │
│ ○ relay.snort.social     timeout [Retry]    │
│ ● nostr.wine                19ms [Copy URL] │
│                                             │
│ Health: 4/5 connected • 23ms avg            │
│                          [Reconnect All]     │
└─────────────────────────────────────────────┘
```

**States:**
- **Connected:** Green dot (●), relay name, latency (18ms), "Copy URL" button
- **Timeout:** Red dot (○), relay name, "timeout" text, "Retry" button
- **Connecting:** Yellow dot (◐ animated), relay name, spinner, "Connecting..." text
- **Disabled:** Gray dot (○), relay name, muted text (user disabled this relay)

**Variants:**
- **Modal (Desktop):** Full dashboard in Dialog component, centered overlay
- **Sheet (Mobile):** Bottom drawer using Sheet component, swipe to dismiss
- **Inline (Future):** Embedded in settings page for configuration

**Accessibility:**
- `role="status"` with `aria-live="polite"` for connection state changes
- `aria-label="Relay connection status dashboard"` on modal
- Keyboard navigation: Tab through relays, Enter to copy URL or retry
- Screen reader announces: "Relay [name] connected with [latency]ms latency" or "Relay [name] timeout"
- Focus trap within modal (Escape to close)

**Content Guidelines:**
- Relay URLs displayed in full (not truncated): `wss://relay.nostr.band`
- Latency format: Always include units ("18ms" not "18")
- Status text: Use exact strings "Connected" | "Timeout" | "Connecting" | "Disabled"
- Health summary format: "[X]/[Total] connected • [Avg]ms avg"

**Interaction Behavior:**
- Polls relay status every 5 seconds while modal open
- Auto-dismiss option: Close automatically when all relays connect (user preference)
- Manual refresh: "Reconnect All" button queries all relays immediately
- Copy URL: Copies WebSocket URL to clipboard with toast confirmation
- Retry: Re-attempts connection to specific relay with exponential backoff

**Implementation Notes:**
- Uses `SimplePool` from nostr-tools for relay management
- Latency measured via WebSocket ping/pong round-trip
- Timeout threshold: 3 seconds per relay
- Connection state stored in Zustand store (global state)

---

### Component 2: CodeDiffViewer

**Purpose:** Display git commit diffs with syntax highlighting, optimized for both mobile and desktop viewing. Critical for Jordan's code review journey and all users examining repository changes.

**Usage:** Shown when viewing individual commits or pull request patches. Must handle various file types (code, markdown, binary) and render additions/deletions clearly.

**Anatomy:**
```
┌─ CodeDiffViewer ───────────────────────────┐
│ src/components/RepositoryCard.tsx          │
│ +5 -3 • View on Arweave                    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  1  1 | import { Card } from '@/components' │
│  2  2 | import { Badge } from '@/components'│
│  3    | - const verified = false;           │ (red background)
│     3 | + const verified = true;            │ (green background)
│  4  4 | const RepoCard = ({ data }) => {    │
│  5  5 |   return (                          │
│ ...   | (collapsed 20 unchanged lines)      │
│ 25 25 | export default RepoCard;            │
└─────────────────────────────────────────────┘
```

**States:**
- **Desktop (Split View):** Side-by-side columns (old line numbers | old code | new line numbers | new code)
- **Mobile (Unified View):** Single column, deletions then additions, stacked vertically
- **Loading:** Skeleton showing line structure with animated shimmer
- **Error:** "Diff unavailable. [Retry]" with error icon and retry button

**Variants:**
- **Unified Diff:** Single column, mobile default, can be toggled on desktop
- **Split Diff:** Two columns, desktop default, side-by-side comparison
- **Compact Mode:** Collapsed unchanged context (show 3 lines above/below changes), expandable

**Accessibility:**
- `role="region"` with `aria-label="Code diff for [filename]"`
- Table structure for screen readers: `<table role="table">` with proper row/cell semantics
- Keyboard navigation: Arrow keys move between lines, Tab moves between files
- High contrast mode: Borders instead of background colors for additions/deletions
- Line numbers linkable (allow copy of permalink to specific line)

**Content Guidelines:**
- Max line length: 120 characters before horizontal scroll trigger
- Context lines: Show 3 unchanged lines above/below each change region
- File header format: `[path] • +[additions] -[deletions] • View on Arweave`
- Syntax highlighting: Use Prism.js with language auto-detection from file extension

**Interaction Behavior:**
- **Desktop:** Arrow keys navigate between files in multi-file diff
- **Mobile:** Swipe left/right to switch files, vertical scroll within diff
- **Expand context:** Click "... (collapsed N lines)" to reveal unchanged code
- **Copy permalink:** Click line number to copy URL with line anchor (`#L42`)
- **Auto-scroll:** On load, scroll to first change (first + or - line)

**Implementation Notes:**
- Syntax highlighting: Prism.js or Monaco Editor (TBD based on bundle size)
- Diff algorithm: myers diff (standard git diff algorithm)
- Lazy render: Virtualize for large diffs (>1000 lines) using react-window
- Mobile detection: `window.innerWidth < 768px` triggers unified view

---

### Component 3: NetworkStatusIndicator

**Purpose:** Ambient, always-visible indicator of P2P network health in application header. Provides at-a-glance network status with one-click access to detailed Relay Status Dashboard.

**Usage:** Permanently visible in header (top-right). Users glance to confirm network health; click for details when curious or debugging connection issues.

**Anatomy:**
```
Desktop:  ● 4/5 relays • 23ms    [clickable]
Mobile:   ●                       [clickable]
```

**States:**
- **Healthy:** Green dot (●), "4/5 relays", latency "<50ms avg"
- **Degraded:** Yellow dot (●), "2/3 relays", latency "50-100ms avg"
- **Critical:** Red dot (●), "0-1 relays", latency ">100ms or timeout"
- **Connecting:** Animated pulse (◐), "Connecting...", no latency shown

**Variants:**
- **Full (Desktop Header):** Dot + relay count + latency text
- **Compact (Mobile Header):** Dot only (tooltip on long-press)
- **Hidden (User Preference):** Can be toggled off in settings

**Accessibility:**
- `aria-live="polite"` announces status changes to screen readers
- `aria-label="Network status: [Healthy/Degraded/Critical]. [X] of [Y] relays connected. [Z]ms average latency"`
- Keyboard: Tab to focus indicator, Enter to open Relay Status Dashboard
- Tooltip on keyboard focus (not just mouse hover)
- Color-blind safe: Dot + text redundancy (not color-only)

**Content Guidelines:**
- Status text mapping:
  - 4-5 relays + <50ms = "Healthy"
  - 2-3 relays OR 50-100ms = "Degraded"  
  - 0-1 relays OR >100ms = "Critical"
- Relay count format: Always "[X]/[Y]" (e.g., "4/5 relays")
- Latency format: Always include units and "avg" (e.g., "23ms avg")

**Interaction Behavior:**
- Updates every 5 seconds (polling relay status)
- Tooltip appears after 500ms hover (desktop) or long-press (mobile)
- Click opens RelayStatusDashboard modal
- Color transition animated (fade 300ms) when status changes
- Pulse animation on "Connecting" state (1s duration, infinite loop)

**Implementation Notes:**
- Subscribes to global relay status store (Zustand)
- Tooltip uses shadcn/ui Tooltip component
- Click handler opens RelayStatusDashboard in Dialog (desktop) or Sheet (mobile)
- Responsive: Hide text <768px, show dot only

---

### Component 4: FileTreeNavigator

**Purpose:** Hierarchical file browser for repository contents, providing GitHub-familiar navigation through file system structure.

**Usage:** Left sidebar on desktop, drawer on mobile. Shows repository file/folder hierarchy with expand/collapse, allowing users to navigate to any file.

**Anatomy:**
```
┌─ FileTreeNavigator ────────┐
│ bitcoin/bitcoin   [branch] │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ ∨ 📁 src/                  │
│   ∨ 📁 components/         │
│     📄 Card.tsx      2.4KB │
│     📄 Badge.tsx     1.1KB │
│   > 📁 lib/                │
│   📄 main.tsx        4.2KB │
│ > 📁 public/               │
│ 📄 README.md         8.7KB │
│ 📄 package.json      1.2KB │
└────────────────────────────┘
```

**States:**
- **Folder Collapsed:** Right-pointing arrow (>), children hidden
- **Folder Expanded:** Down-pointing arrow (∨), children visible
- **File/Folder Selected:** Blue background highlight (#e3f2fd)
- **Loading:** Skeleton tree structure with animated shimmer

**Variants:**
- **Sidebar (Desktop):** Fixed left panel, 280px width
- **Drawer (Mobile):** Sheet component from left, overlay
- **Inline (Tablet):** Embedded in page layout, collapsible

**Accessibility:**
- `role="tree"` on container
- `role="treeitem"` on each file/folder
- `aria-expanded="true|false"` on folders
- `aria-level="[depth]"` indicates nesting level (1-indexed)
- Keyboard navigation:
  - Arrow Up/Down: Navigate between items
  - Arrow Right: Expand folder (if collapsed)
  - Arrow Left: Collapse folder (if expanded) or move to parent
  - Enter: Open file or toggle folder
  - Home/End: First/last item

**Content Guidelines:**
- File names: Display full name, no truncation (tooltip on hover if long)
- Folder names: Bold weight to differentiate from files
- File sizes: Human-readable format (2.4KB, 1.1MB, not bytes)
- Icons: 📁 Folder, 📄 Generic file, with file-type-specific icons (⚛️ .tsx, 🎨 .css)
- Max depth: Show all levels, vertical scroll if needed

**Interaction Behavior:**
- Single-click: Select item (highlight)
- Double-click file: Open file view
- Single-click folder: Toggle expand/collapse
- Folder expansion state persists in localStorage (`fileTreeState: { [repoId]: expandedPaths }`)
- Auto-scroll: Selected item scrolls into view if off-screen
- Lazy-load: Directories with >100 items load in chunks (virtualized)
- Right-click context menu: "Copy Path" (future: also "Copy File URL")

**Implementation Notes:**
- Tree structure built from NIP-34 repository events
- Virtualized rendering for large trees (react-window or TanStack Virtual)
- Icons: lucide-react icon library for file type icons
- Folder expansion: Recursive component structure
- Search (Phase 2): Add search input to filter tree by filename

---

## Composed Components

These components combine shadcn/ui primitives with custom domain logic:

### RepositoryCard (Composition)

**Base Components:** Card + Badge + Button + Collapsible  
**Custom Logic:** Progressive disclosure state management, trust badge styling

**Structure:**
```typescript
<Card variant={isMobile ? "mobile" : "default"} className="repository-card">
  <CardHeader>
    <div className="flex items-start justify-between">
      <CardTitle className="text-xl font-semibold">
        {owner}/{name}
      </CardTitle>
      <div className="flex gap-2">
        <Badge variant="outline" className="border-green-500 text-green-500">
          ✓ Verified
        </Badge>
        <Badge variant="outline" className="border-purple-500 text-purple-500">
          ♦ Permanent
        </Badge>
      </div>
    </div>
  </CardHeader>
  
  <CardContent>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    <div className="flex gap-4 text-sm">
      <span>⭐ {stars.toLocaleString()}</span>
      <span>🔱 {forks.toLocaleString()}</span>
      <span>{language}</span>
      <span>{license}</span>
    </div>
  </CardContent>
  
  <CardFooter>
    <Button 
      variant="outline" 
      onClick={toggleTechnicalDetails}
      className="w-full"
    >
      {expanded ? "Hide Details" : "Show Technical Details"}
    </Button>
  </CardFooter>
  
  <Collapsible open={expanded}>
    <CollapsibleContent>
      <TechnicalDetailsPanel data={technicalData} />
    </CollapsibleContent>
  </Collapsible>
</Card>
```

**Custom Enhancements:**
- **Progressive disclosure state:** Stored in localStorage (`expandedRepos: Set<repoId>`)
- **Custom badge variants:** Tailwind classes for trust signal colors (green = verified, purple = permanent)
- **Responsive variant:** Mobile (<768px) uses full-width card with larger touch targets
- **Animation:** Smooth collapse/expand transition (200ms ease)

---

### TechnicalDetailsPanel (Composition)

**Base Components:** Collapsible + custom grid  
**Custom Logic:** Field layout, copy buttons, external links

**Structure:**
```typescript
<div className="technical-details-panel bg-muted p-6 rounded-lg border">
  <h4 className="text-sm font-semibold mb-4">Technical Details</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <TechnicalField 
      label="Nostr Public Key" 
      value={npub} 
      copyable 
    />
    <TechnicalField 
      label="Arweave Transaction" 
      value={arweaveTx} 
      copyable 
      externalLink={`https://viewblock.io/arweave/tx/${arweaveTx}`}
    />
    <TechnicalField 
      label="Signature Status" 
      value="✓ Verified" 
      variant="success"
    />
    <TechnicalField 
      label="Storage Status" 
      value="♦ Permanent" 
      variant="purple"
    />
    <TechnicalField 
      label="Last Updated" 
      value={relativeTime(lastUpdate)} 
    />
    <TechnicalField 
      label="Connected Relays" 
      value={`${connected}/${total} online`}
      clickable
      onClick={openRelayDashboard}
    />
  </div>
</div>
```

**Custom Enhancements:**
- **2-column responsive grid:** Desktop shows 2 columns, mobile stacks to 1 column
- **Copy functionality:** Each field with `copyable` prop has copy-to-clipboard button
- **External link indicators:** Arweave TX shows external link icon, opens in new tab
- **Color-coded status:** Success (green), warning (yellow), error (red), purple (permanence)
- **Clickable fields:** "Connected Relays" field opens Relay Status Dashboard

**TechnicalField Component:**
```typescript
const TechnicalField = ({ 
  label, 
  value, 
  copyable, 
  externalLink,
  variant,
  clickable,
  onClick 
}) => (
  <div className="technical-field">
    <label className="text-xs text-muted-foreground">{label}</label>
    <div className="flex items-center gap-2 mt-1">
      <span className={cn("text-sm font-mono", variantStyles[variant])}>
        {value}
      </span>
      {copyable && (
        <Button size="icon" variant="ghost" onClick={() => copyToClipboard(value)}>
          <CopyIcon className="h-4 w-4" />
        </Button>
      )}
      {externalLink && (
        <Button size="icon" variant="ghost" asChild>
          <a href={externalLink} target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
  </div>
);
```

---

## Component Implementation Strategy

### Building on shadcn/ui Foundation

**Strategy:** Maximize use of shadcn/ui primitives, extend with custom domain logic only when necessary.

**Principles:**

1. **Composition over Creation**
   - Prefer combining shadcn components over building from scratch
   - Example: RepositoryCard = Card + Badge + Collapsible, not custom component
   - Reduces maintenance burden, leverages battle-tested accessibility

2. **Domain Logic Separation**
   - Keep domain logic (Nostr queries, Arweave fetches) separate from UI components
   - Use custom hooks: `useRelayStatus()`, `useRepositoryData()`, `useArweaveVerification()`
   - Components consume hooks, remain presentation-focused

3. **Progressive Enhancement**
   - Start with shadcn primitive (Card)
   - Add domain-specific state (progressive disclosure)
   - Style with Tailwind classes (trust badge colors)
   - Never fork shadcn source, always extend via props/composition

4. **Consistent Styling**
   - Use shadcn/ui design tokens (CSS variables from theme)
   - Trust signals: Custom colors but follow shadcn Badge patterns
   - Spacing: Tailwind scale (4px base unit)
   - Typography: Inter for UI, JetBrains Mono for code (from design system)

### Custom Component Development Guidelines

**When to Build Custom:**

1. **Domain-Specific State Management**
   - RelayStatusDashboard: Real-time relay polling, connection state
   - NetworkStatusIndicator: Aggregated network health calculation
   - Component requires WebSocket subscriptions, polling, or P2P-specific logic

2. **Unique Interaction Patterns**
   - CodeDiffViewer: Git-specific diff rendering, syntax highlighting
   - FileTreeNavigator: Hierarchical tree with git-aware folding
   - Interaction not covered by standard UI primitives

3. **Complex Data Visualization**
   - Relay latency graphs (future)
   - Repository activity timeline (future)
   - Requires canvas, SVG, or specialized rendering

**Custom Component Requirements:**

- **Accessibility First:** WCAG 2.1 AA compliant, keyboard navigable
- **Mobile Optimized:** Responsive breakpoints, touch-friendly targets (44x44px minimum)
- **Loading States:** Skeleton screens while data fetches
- **Error States:** Clear error messages with retry actions
- **Documentation:** Storybook stories showing all states/variants

### Implementation Approach by Phase

**Phase 1 (MVP):** Composition-heavy
- Use shadcn/ui for 90% of UI
- Build only critical custom components (NetworkStatusIndicator)
- Compose heavily (RepositoryCard, TechnicalDetailsPanel)

**Phase 2 (Post-MVP):** Targeted custom development
- FileTreeNavigator (complex interaction)
- CodeDiffViewer (domain-specific rendering)
- RelayStatusDashboard (real-time data)

**Phase 3 (Polish):** Refinement and optimization
- Animations and transitions
- Advanced keyboard shortcuts
- Dark mode variants
- Component performance optimization

---

## Implementation Roadmap

### Phase 1: MVP Core Components (Month 1-3)

**Goal:** Enable Anonymous Visitor browsing and Alex verification journeys

| Week | Components | Dependencies | Success Criteria |
|------|-----------|-------------|------------------|
| **1-2** | RepositoryCard, TechnicalDetailsPanel | shadcn Card, Badge, Collapsible | User can browse repos and expand technical details |
| **3-4** | NetworkStatusIndicator, Badge variants | shadcn Badge, Tooltip | Network health visible, trust badges render correctly |
| **5-6** | Loading states, error handling | shadcn Skeleton, Alert | Educational loading ("Querying relays..."), graceful errors |

**Deliverables:**
- ✅ Repository list view with cards
- ✅ Progressive disclosure (Show Details button)
- ✅ Trust badges (✓ Verified, ♦ Permanent)
- ✅ Network status indicator in header
- ✅ Loading states with educational text
- ✅ Error states with retry actions

**Testing Focus:**
- Anonymous Visitor: Zero-friction browsing, no jargon
- Alex: Can expand technical details, verify claims
- Mobile: Touch targets >44px, cards stack properly

---

### Phase 2: Mobile & Advanced Features (Month 4-6)

**Goal:** Optimize Jordan mobile journey, add power user features

| Month | Components | Dependencies | Success Criteria |
|-------|-----------|-------------|------------------|
| **4** | Mobile RepositoryCard variant, FileTreeNavigator | shadcn Sheet, Tree components | Mobile cards with avatars, file tree navigation works |
| **5** | CodeDiffViewer (unified view only) | Prism.js syntax highlighting | Diffs render correctly, mobile-optimized |
| **6** | RelayStatusDashboard | shadcn Dialog, Sheet | Detailed relay inspection available |

**Deliverables:**
- ✅ Mobile-optimized repository cards (Direction 8 style)
- ✅ File tree navigator (hierarchical browsing)
- ✅ Code diff viewer (unified view for mobile)
- ✅ Relay status dashboard (detailed metrics)
- ✅ Service worker caching (offline capability)

**Testing Focus:**
- Jordan: Mobile access on 3G, relay fallback works
- Alex: Relay dashboard provides verification details
- All users: File tree navigation intuitive

---

### Phase 3: Polish & Optimization (Month 7+)

**Goal:** Delight moments, power user optimizations

| Priority | Components | Dependencies | Success Criteria |
|----------|-----------|-------------|------------------|
| **P2** | CodeDiffViewer (split view), Keyboard shortcuts | Monaco Editor (or Prism) | Desktop split diffs, keyboard navigation |
| **P2** | Dark mode variants, Theme switcher | shadcn dark mode support | Dark mode available, respects system preference |
| **P3** | Component animations, Micro-interactions | Framer Motion (optional) | Badge fade-ins, smooth transitions |

**Deliverables:**
- ⚙️ Split-view code diffs (desktop)
- ⚙️ Keyboard shortcuts (Alex power user)
- ⚙️ Dark mode (developer preference)
- ⚙️ Smooth animations (delight moments)
- ⚙️ Component performance optimization

**Testing Focus:**
- Taylor: DevTools-heavy usage, keyboard efficiency
- Alex: Dark mode for late-night verification sessions
- All users: Animations feel polished, not distracting

---

### Dependency Management

**Required Libraries:**

**Core Dependencies:**
- `shadcn/ui` - Component library (via CLI installation)
- `@radix-ui/*` - Primitives (installed with shadcn components)
- `tailwindcss` - Styling framework
- `lucide-react` - Icons for shadcn/ui

**Custom Component Dependencies:**
- `nostr-tools` - Relay connection management (already in stack)
- `prismjs` or `monaco-editor` - Syntax highlighting (TBD based on bundle size)
- `react-window` or `@tanstack/react-virtual` - Virtualization for large lists
- `zustand` - Global state management (relay status, preferences)

**Bundle Size Budget:**
- Phase 1: <500KB total JavaScript (gzipped)
- Phase 2: <600KB (includes CodeDiffViewer, FileTreeNavigator)
- Phase 3: <650KB (includes animations, optimizations)

**Strategy:** Lazy-load heavy components (CodeDiffViewer, FileTreeNavigator) to keep initial bundle small for Anonymous Visitor journey.

---

## Component Testing Strategy

### Unit Testing (Vitest + React Testing Library)

**Test Coverage Target:** ≥80% for all custom components

**Critical Test Cases:**

**RepositoryCard:**
- Renders correctly with mock data
- "Show Details" button toggles TechnicalDetailsPanel
- Trust badges display correct colors/icons
- Mobile variant renders on narrow viewports

**RelayStatusDashboard:**
- Displays all relay statuses correctly
- "Copy URL" copies to clipboard
- "Retry" re-attempts connection
- Polling updates status every 5s

**CodeDiffViewer:**
- Renders unified diff on mobile (<768px)
- Renders split diff on desktop (≥768px)
- Syntax highlighting applies correctly
- Expand/collapse context works

**NetworkStatusIndicator:**
- Shows correct color for health state (green/yellow/red)
- Click opens RelayStatusDashboard
- Tooltip appears on hover

### Integration Testing (Playwright)

**User Journey Testing:**

**Anonymous Visitor:**
1. Load repository list → cards render
2. Click repository → detail view loads
3. Trust badges visible, not intrusive
4. No authentication prompts

**Alex Verification:**
1. Browse repository → click "Show Technical Details"
2. Technical panel expands with npub, Arweave TX
3. Click "View on Arweave" → opens block explorer
4. Click network indicator → relay dashboard opens

**Jordan Mobile:**
1. Load on mobile viewport (<768px)
2. Repository cards use mobile variant (avatar, large touch targets)
3. File tree accessible via drawer (swipe or tap)
4. Diffs render in unified view (not split)

### Accessibility Testing

**Automated (Lighthouse CI):**
- Accessibility score ≥90 required for PR merge
- Run on every component story in Storybook

**Manual (Keyboard + Screen Reader):**
- Tab through all components, verify focus order
- Enter/Space activate buttons and expand/collapse
- Arrow keys navigate trees and lists
- Screen reader announces status changes (relay connections, loading states)

---

## Next Step: UX Consistency Patterns

With component strategy defined, we now move to defining UX consistency patterns—establishing interaction conventions, animation standards, and pattern libraries that ensure cohesive experience across all components.


---

## UX Consistency Patterns

### Pattern Philosophy

Rig's UX patterns prioritize **educational transparency** over simplicity for its own sake. Every interaction should teach users about decentralization while maintaining GitHub-familiar productivity. Patterns serve users across all technical skill levels through progressive disclosure, never hiding complexity but making it optional.

**Core Pattern Principles:**

1. **Educational Feedback:** Loading/error states explain *what* and *why* (P2P context)
2. **Progressive Disclosure:** Simple surface, technical depth on demand
3. **Trust Through Transparency:** Network health always visible, verification always verifiable
4. **GitHub Familiarity:** Familiar patterns reduce cognitive load for primary actions
5. **Graceful Degradation:** Errors provide recovery paths, never dead-end users

---

## Button Hierarchy

**Purpose:** Establish clear visual hierarchy for user actions, ensuring users can quickly identify primary actions while maintaining GitHub familiarity.

**When to Use:**
- Any interface requiring user decisions or actions
- Repository cards (View, Show Details)
- Modals and dialogs (Close, Retry, Reconnect)
- Forms (Submit, Cancel) - future

### Visual Design Specifications

**Primary Button:**
```css
Background: #238636 (GitHub green)
Text: #ffffff (white)
Padding: 12px 24px
Border-radius: 6px
Font-weight: 600
Font-size: 14px
Hover: #2ea043 (lighter green)
Active: #26a641
Focus: 2px ring #238636 with 2px offset
```

**Secondary Button (Outline):**
```css
Background: transparent
Border: 1px solid #30363d
Text: #c9d1d9
Padding: 12px 24px
Border-radius: 6px
Hover: Background #161b22
Active: Background #0d1117
```

**Destructive Button:**
```css
Background: #da3633 (red)
Text: #ffffff
Padding: 12px 24px
Border-radius: 6px
Hover: #f85149
Active: #d1242f
```

**Ghost Button:**
```css
Background: transparent
Border: none
Text: #58a6ff (link blue)
Padding: 12px 24px
Hover: Background rgba(88, 166, 255, 0.1)
Active: Background rgba(88, 166, 255, 0.15)
```

### Behavior Rules

**Action Hierarchy:**
- **One primary action per view maximum** - Most important user action
- **Secondary actions use outline or ghost variants** - Supporting actions
- **Destructive actions (future: delete, force push) use red** - Dangerous operations
- **Loading state:** Button disabled + spinner replaces text, maintains width
- **Success state (if needed):** Green checkmark icon briefly (500ms), then reset

**State Transitions:**
```
Default → Hover (immediate)
Click → Loading (disabled, spinner) → Success (checkmark, 500ms) → Default
```

### Accessibility Requirements

- **Minimum touch target:** 44x44px on mobile (iOS/Android guidelines)
- **Focus ring:** 2px solid #58a6ff with 2px offset (visible, clear)
- **Loading state:** `aria-busy="true"` + `aria-label="[Action] in progress"`
- **Disabled state:** `disabled` attribute + `aria-disabled="true"`
- **Action clarity:** `aria-label` clarifies action ("Show technical details for bitcoin/bitcoin repository")

### Mobile Considerations

- **Full-width buttons on mobile (<768px)** for easy tapping
- **Larger vertical padding:** 16px (instead of 12px desktop)
- **Stack buttons vertically** on mobile (no horizontal button groups)
- **Touch target spacing:** Minimum 8px between stacked buttons

### Implementation Examples

**Repository Card Footer:**
```tsx
<CardFooter className="flex gap-3">
  <Button variant="default">View Repository</Button>
  <Button variant="outline" onClick={toggleDetails}>
    {expanded ? "Hide" : "Show"} Technical Details
  </Button>
</CardFooter>
```

**Relay Dashboard:**
```tsx
<DialogFooter>
  <Button variant="default" onClick={reconnectAll}>
    Reconnect All Relays
  </Button>
  <Button variant="outline" onClick={closeDialog}>
    Close
  </Button>
</DialogFooter>
```

**Error Recovery:**
```tsx
<Alert variant="destructive">
  <AlertDescription>
    Connection failed. Could not reach any Nostr relays.
  </AlertDescription>
  <div className="flex gap-2 mt-4">
    <Button variant="default" size="sm" onClick={retry}>
      Retry Connection
    </Button>
    <Button variant="outline" size="sm" onClick={viewCached}>
      View Cached Data
    </Button>
  </div>
</Alert>
```

---

## Feedback Patterns

**Purpose:** Provide clear, educational feedback for all system states, turning loading/error moments into opportunities to teach users about decentralization.

### Loading States

**When to Use:** Anytime data is being fetched from Nostr relays or Arweave

**Progressive Loading Feedback:**
```
Stage 1 (0-500ms):     Skeleton screens only (immediate visual feedback)
Stage 2 (500ms-2s):    Skeleton + "Querying 5 Nostr relays..."
Stage 3 (2s-5s):       Skeleton + "Connected to 4/5 relays, loading data..."
Stage 4 (>5s):         Skeleton + "This is taking longer than usual. Retrying..."
```

**Visual Design:**
- **Skeleton screens:** shadcn Skeleton component matching content structure
- **Educational overlay text:** 13px, #8b949e (muted), centered or top-aligned
- **Optional spinner:** 16px spinner for indeterminate progress

**Behavior:**
- Show skeleton immediately (0ms delay)
- Add educational text after 500ms (avoid flashing for fast loads)
- Update text every 2-3 seconds with more context
- Never show generic "Loading..." without context

**Variants:**

**Repository List Loading:**
```tsx
<div className="space-y-4" aria-live="polite" aria-label="Loading repositories">
  {[1, 2, 3, 4, 5].map(i => (
    <Skeleton key={i} className="h-40 w-full rounded-lg" />
  ))}
  {loadingTime > 500 && (
    <div className="text-center text-sm text-muted-foreground mt-4">
      Querying 5 Nostr relays...
    </div>
  )}
  {loadingTime > 2000 && connectedRelays > 0 && (
    <div className="text-center text-sm text-muted-foreground mt-4">
      Connected to {connectedRelays}/5 relays, loading data...
    </div>
  )}
</div>
```

**File Content Loading:**
```tsx
<div className="code-skeleton">
  {[...Array(20)].map((_, i) => (
    <Skeleton key={i} className="h-6 mb-2" style={{ width: `${60 + Math.random() * 40}%` }} />
  ))}
  {loadingTime > 500 && (
    <div className="loading-overlay">
      Fetching file from Arweave...
    </div>
  )}
</div>
```

**Accessibility:**
- `aria-live="polite"` region announces loading text changes
- `aria-label="Loading [content type] from decentralized relays"`
- Screen reader announces each stage transition
- Don't announce skeleton rendering (use `aria-hidden="true"` on skeletons)

---

### Success Feedback

**When to Use:** After successful actions (future: publish repo, create issue) or verification completion

**Visual Design:**
- **Toast notification:** Green background (#dcfce7), green border (#16a34a), checkmark icon
- **Inline badge appearance:** Verification badges fade in (200ms)
- **Micro-animations:** Subtle scale-in or fade-in (avoid jarring effects)

**Behavior:**
- Non-blocking (doesn't require user acknowledgment)
- Auto-dismiss after 3-5 seconds
- User can dismiss early (X button or swipe on mobile)
- Multiple toasts stack vertically (max 3 visible)
- Oldest toast dismissed first when stack exceeds limit

**Toast Structure:**
```tsx
<Toast duration={3000} variant="success">
  <div className="flex items-center gap-3">
    <CheckCircleIcon className="h-5 w-5 text-green-600" />
    <div className="flex-1">
      <ToastTitle>Repository Verified</ToastTitle>
      <ToastDescription>
        Cryptographic signatures validated on 4 of 5 relays
      </ToastDescription>
    </div>
    <ToastClose />
  </div>
</Toast>
```

**Variants:**

**Verification Success:**
- Title: "Repository Verified"
- Description: "Signatures valid on [X] of [Y] relays"
- Duration: 4 seconds

**Copy Success:**
- Title: "Copied to Clipboard"
- Description: Truncated value that was copied
- Duration: 2 seconds

**Badge Fade-In (After Verification):**
```tsx
<Badge 
  variant="outline" 
  className="border-green-500 text-green-500 animate-in fade-in duration-200"
>
  ✓ Verified
</Badge>
```

**Accessibility:**
- `role="status"` with `aria-live="polite"`
- Toast content read by screen reader on appear
- Toast is focusable (can tab to it)
- Escape key dismisses focused toast
- Close button has `aria-label="Close notification"`

---

### Error Feedback

**When to Use:** Network failures, relay timeouts, data not found, validation errors

**Error Message Formula:**
```
[What happened] • [Why it happened] • [What to do]
```

**Visual Design:**
- **Alert component:** Red border (#f87171), error icon (❌ or ⚠️), structured content
- **Inline errors:** Small text below form field (future)
- **Modal errors:** Critical failures requiring immediate attention

**Behavior:**
- **Clear error message:** What went wrong in user-friendly language
- **Contextual explanation:** Why it happened (P2P context when relevant)
- **Recovery actions:** Buttons for what user can do next
- **Non-blocking when possible:** Show cached data + error banner

**Error Examples:**

**All Relays Timeout:**
```tsx
<Alert variant="destructive" className="mb-6">
  <AlertCircleIcon className="h-5 w-5" />
  <AlertTitle>Connection Issues</AlertTitle>
  <AlertDescription>
    Could not connect to any Nostr relays. This may be due to network 
    issues or temporary relay unavailability.
  </AlertDescription>
  <div className="flex gap-2 mt-4">
    <Button variant="default" size="sm" onClick={retryConnection}>
      Retry Connection
    </Button>
    <Button variant="outline" size="sm" onClick={viewCached}>
      View Cached Data
    </Button>
  </div>
</Alert>
```

**Partial Relay Failure (Degraded):**
```tsx
<Alert variant="warning" className="mb-6">
  <InfoIcon className="h-5 w-5" />
  <AlertTitle>Degraded Performance</AlertTitle>
  <AlertDescription>
    Connected to 2 of 5 relays. Data may load slower than usual.
  </AlertDescription>
  <Button variant="ghost" size="sm" onClick={openRelayDashboard}>
    View Relay Status →
  </Button>
</Alert>
```

**Repository Not Found:**
```tsx
<Alert variant="destructive">
  <AlertTitle>Repository Not Found</AlertTitle>
  <AlertDescription>
    The repository "user/repo" does not exist on connected relays.
    
    <ul className="list-disc list-inside mt-2 space-y-1">
      <li>Check the repository name for typos</li>
      <li>Verify the repository has been published to Nostr</li>
    </ul>
  </AlertDescription>
  <Button variant="outline" size="sm" onClick={searchRepositories}>
    Search Repositories
  </Button>
</Alert>
```

**Accessibility:**
- **Critical errors:** `role="alert"` (interrupts screen reader immediately)
- **Degraded states:** `role="status"` (announces politely, non-interrupting)
- **Error icon:** `aria-hidden="true"` (message text conveys error)
- **Focus management:** Focus moves to error alert when it appears
- **Action buttons:** Clear `aria-label` describing what will happen

**Mobile Considerations:**
- Error alerts full-width on mobile
- Action buttons stack vertically (<768px)
- Detailed error explanations collapsible on mobile (show summary + "Learn More")

---

## Progressive Disclosure Patterns

**Purpose:** Serve users across all technical skill levels by showing simple interface by default with optional depth for power users. Core principle: Never hide information, make it accessible on demand.

**When to Use:**
- Technical details (npub, Arweave TX, relay status, event IDs)
- Advanced settings (future: relay configuration, cache management)
- Debug information (future: developer mode, event inspection)

### Visual Structure

**Collapsed State (Default):**
- Compact summary visible (trust badges, high-level stats)
- "Show Details" button or expandable section header
- Visual hint: Chevron icon (>) indicating expansion available
- Subtle styling (don't draw attention away from primary content)

**Expanded State:**
- Full technical details in muted panel (background: #f8f9fa or #161b22 dark mode)
- "Hide Details" button
- Chevron rotates (∨) to indicate collapse available
- Smooth height transition (200ms ease)

### Pattern Implementation

**Repository Card with Technical Panel:**
```tsx
<Card className="repository-card">
  <CardHeader>
    <div className="flex items-start justify-between">
      <CardTitle>{owner}/{name}</CardTitle>
      <div className="flex gap-2">
        <Badge variant="outline" className="border-green-500 text-green-500">
          ✓ Verified
        </Badge>
        <Badge variant="outline" className="border-purple-500 text-purple-500">
          ♦ Permanent
        </Badge>
      </div>
    </div>
  </CardHeader>
  
  <CardContent>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    <div className="flex gap-4 text-sm text-muted-foreground">
      <span>⭐ {stars.toLocaleString()}</span>
      <span>🔱 {forks.toLocaleString()}</span>
      <span>{language}</span>
    </div>
  </CardContent>
  
  <CardFooter>
    <Button 
      variant="outline" 
      onClick={toggleDetails}
      aria-expanded={expanded}
      aria-controls="technical-details"
      className="w-full"
    >
      <ChevronRightIcon className={cn(
        "h-4 w-4 mr-2 transition-transform",
        expanded && "rotate-90"
      )} />
      {expanded ? "Hide" : "Show"} Technical Details
    </Button>
  </CardFooter>
  
  <Collapsible open={expanded}>
    <CollapsibleContent id="technical-details">
      <div className="bg-muted p-6 border-t">
        <h4 className="text-sm font-semibold mb-4">Technical Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TechnicalField label="Nostr Public Key" value={npub} copyable />
          <TechnicalField label="Arweave TX" value={arTx} copyable link />
          <TechnicalField label="Signature Status" value="✓ Verified" />
          <TechnicalField label="Connected Relays" value="4/5 online" />
        </div>
      </div>
    </CollapsibleContent>
  </Collapsible>
</Card>
```

### Behavior Rules

**State Persistence:**
- User's expand/collapse choice persists in localStorage
- Key: `expandedRepos` → `Set<repoId>`
- Power users who expand once: default to expanded for all repos on next visit
- Anonymous visitors: always default collapsed

**Animation:**
- Smooth height transition: 200ms ease
- Chevron rotation: 200ms ease
- Content fade-in: 150ms (slight delay for polish)

**Layout Consideration:**
- Expansion should not dramatically shift page layout
- Use CSS `max-height` transition (not `height: auto` which doesn't animate)
- Measure expanded height dynamically, apply as inline style

### Variants

**Inline Collapsible (Repository Card):**
- Full Collapsible component
- Technical details in structured grid
- Best for desktop

**Tooltip Progressive Disclosure:**
- Hover/focus shows simple explanation
- Click badge opens detail modal
- Best for inline trust signals

**Modal Deep Dive (Relay Status):**
- Icon + summary in header (4/5 relays)
- Click opens full dashboard modal
- Best for complex data that needs space

### Accessibility Requirements

- **`aria-expanded="true|false"`** on toggle button
- **`aria-controls="panel-id"`** references collapsible content ID
- **Keyboard:** Enter/Space toggles expansion
- **Screen reader:** Announces "Expanded" or "Collapsed" state change
- **Focus management:** Focus stays on toggle button (doesn't move to content)

### Mobile Considerations

- **Larger toggle button:** 44px minimum height
- **Technical panel:** Scrollable if content overflows viewport
- **Sheet alternative:** For very long technical content, consider Sheet (bottom drawer) instead of inline expansion

### Content Guidelines

**Collapsed State Shows:**
- Essential information only (repository name, description, stats)
- Trust badges visible (✓ Verified, ♦ Permanent)
- No technical identifiers (npub, Arweave TX hidden)

**Expanded State Shows:**
- Technical details in logical groups:
  - **Identity:** Nostr Public Key, Maintainer npub
  - **Storage:** Arweave transaction ID, storage timestamp
  - **Network:** Connected relays, signature status
  - **Metadata:** Last updated, event kind, event ID

**Label Clarity:**
- Use descriptive labels: "Nostr Public Key" not "npub1..."
- Provide context: "Arweave Transaction" not "TX"
- Explain status: "Signature Status: ✓ Verified" not just checkmark

---

## Network Status Patterns

**Purpose:** Provide ambient awareness of P2P network health while maintaining focus on primary content. Critical for managing performance perception and building trust through transparency.

**When to Use:**
- Always visible in header (Network Status Indicator)
- Detailed view on demand (Relay Status Dashboard)
- Loading states (educational relay query feedback)

### Network Status Indicator (Header)

**Visual Design by State:**

**Healthy (4-5 relays connected, <50ms avg latency):**
```
Desktop: ● 4/5 relays • 23ms
Mobile:  ●
Color: Green (#10b981)
```

**Degraded (2-3 relays, or 50-100ms latency):**
```
Desktop: ● 2/5 relays • 87ms
Mobile:  ●
Color: Yellow (#f59e0b)
```

**Critical (0-1 relays, or >100ms/timeout):**
```
Desktop: ● 0/5 relays • offline
Mobile:  ●
Color: Red (#ef4444)
```

**Connecting (initial connection):**
```
Desktop: ◐ Connecting...
Mobile:  ◐ (animated pulse)
Color: Blue (#3b82f6), pulsing animation
```

### Behavior

**Updates:**
- Poll relay status every 5 seconds while page active
- Pause polling when tab backgrounded (Page Visibility API)
- Resume polling when tab becomes active

**Visual Transitions:**
- Color fade transition: 300ms ease
- Text updates: Immediate (no fade, clear instant feedback)
- Pulse animation on "Connecting": 1s duration, infinite loop

**Interactions:**
- **Click:** Opens Relay Status Dashboard modal
- **Hover (desktop):** Tooltip after 500ms with status summary
- **Long-press (mobile):** Tooltip with status summary

**Tooltip Content:**
```
Network Status: Healthy
4 of 5 relays connected
23ms average latency

Click for details
```

### Accessibility

- **`aria-live="polite"`** announces significant status changes
  - "Network healthy: 4 of 5 relays connected"
  - "Network degraded: Only 2 relays connected"
  - "Network offline: No relays available"
- **`aria-label`** describes current state:
  - "Network status: Healthy. 4 of 5 Nostr relays connected. 23 millisecond average latency. Click to open relay dashboard."
- **Keyboard:** Tab to focus, Enter opens Relay Status Dashboard
- **Focus visible:** Clear focus ring on tab (2px #58a6ff)
- **Color-blind safe:** Dot + text redundancy (not color-only)

### Mobile Considerations

- **Compact display (<576px):** Show dot only, hide text
- **Tap target:** Minimum 44x44px (add padding to dot)
- **Tooltip on long-press:** Hold 500ms to see status
- **Dashboard opens as Sheet:** Bottom drawer instead of centered modal

### Implementation

```tsx
<button
  onClick={openRelayDashboard}
  className="network-status-indicator"
  aria-label={networkStatusAriaLabel}
  aria-live="polite"
>
  <span 
    className={cn(
      "status-dot",
      healthStatus === "healthy" && "bg-green-500",
      healthStatus === "degraded" && "bg-yellow-500",
      healthStatus === "critical" && "bg-red-500",
      healthStatus === "connecting" && "bg-blue-500 animate-pulse"
    )}
  />
  <span className="hidden md:inline text-sm text-muted-foreground">
    {connectedRelays}/{totalRelays} relays • {avgLatency}ms
  </span>
</button>
```

---

### Relay Status Dashboard (Modal)

**Purpose:** Detailed breakdown of each relay's connection status, latency, and health metrics.

**Visual Structure:**
```
┌─ Relay Connections ──────────────────────┐
│ ✕ Close                                   │
│                                           │
│ ● relay.nostr.band          18ms [Copy]  │
│ ● nos.lol                   24ms [Copy]  │
│ ● relay.damus.io            31ms [Copy]  │
│ ○ relay.snort.social     timeout [Retry] │
│ ● nostr.wine                19ms [Copy]  │
│                                           │
│ Health: 4/5 connected • 23ms avg          │
│                       [Reconnect All]     │
└───────────────────────────────────────────┘
```

**Per-Relay Information:**
- Connection status icon: ● (connected), ○ (timeout), ◐ (connecting)
- Relay URL: Full WebSocket URL
- Latency: Measured round-trip time in milliseconds
- Actions: Copy URL button, Retry button (if timeout)

**Aggregate Information:**
- Health summary: "[X]/[Y] connected"
- Average latency: Calculated from connected relays only
- Global action: "Reconnect All" button retries all failed relays

### Behavior

**Real-Time Updates:**
- Poll relay status every 5 seconds while dashboard open
- Update UI immediately when status changes
- Smooth transitions for status icon color changes

**User Actions:**
- **Copy URL:** Copies WebSocket URL to clipboard, shows toast confirmation
- **Retry (single relay):** Re-attempts connection to specific relay, shows connecting state
- **Reconnect All:** Retries all failed relays simultaneously
- **Close:** Dismisses dashboard, returns focus to Network Status Indicator

**Auto-Dismiss (Optional):**
- User preference: Auto-close dashboard when all relays connect
- Default: Off (user manually closes dashboard)

### Accessibility

- **`role="dialog"`** with **`aria-modal="true"`**
- **`aria-labelledby="dashboard-title"`** references "Relay Connections" heading
- **Focus trap:** Tab cycles within modal, Escape closes
- **Focus management:**
  - Focus moves to dashboard on open
  - Focus returns to Network Status Indicator on close
- **Live updates:** `aria-live="polite"` on relay list announces connection changes
- **Action buttons:** Clear `aria-label` values
  - "Copy WebSocket URL for relay.nostr.band"
  - "Retry connection to relay.snort.social"

### Mobile Variant (Sheet)

- Opens as bottom Sheet (drawer) on mobile (<768px)
- Swipe down to dismiss gesture
- Rounded top corners, drag handle
- Max-height: 85vh (scrollable content)

---

## Navigation Patterns

### Tab Navigation

**When to Use:** Primary feature switching (Repositories | Issues | Pull Requests)

**Visual Design:**
- GitHub-style horizontal tabs with underline indicator
- Active tab: 2px solid border-bottom #f78166 (GitHub orange)
- Inactive tabs: Transparent border, #8b949e text color
- Hover: #c9d1d9 text (lighter gray), no border

**Spacing:**
- Tab padding: 12px 20px
- Gap between tabs: 0 (tabs touch, borders separate)
- Border-bottom on tab container: 1px solid #30363d (subtle separator)

### Behavior

- **Single-click:** Switches active tab immediately
- **State persistence:** Active tab saved to URL hash or localStorage
- **Content loading:** Tab remains active, content area shows loading skeleton
- **No page reload:** SPA navigation, content updates without full refresh

### Accessibility

- **`role="tablist"`** on tab container
- **`role="tab"`** on each tab button
- **`aria-selected="true"`** on active tab, `"false"` on others
- **`aria-controls="panel-id"`** references associated content panel
- **Keyboard navigation:**
  - Left/Right Arrow: Move between tabs
  - Home/End: First/last tab
  - Enter/Space: Activate focused tab (if not auto-activating)
- **Focus follows activation:** When tab changes, focus moves to tab button (not content)

### Mobile Considerations

- **Horizontal scroll (<768px):** Tabs scroll horizontally if they overflow
- **Swipe gesture:** Swipe left/right to switch tabs (optional enhancement)
- **Active tab visibility:** Auto-scroll active tab into view if off-screen

---

### Breadcrumb Navigation

**When to Use:** Deep navigation hierarchies (Repository → Directory → Subdirectory → File)

**Visual Design:**
```
Home > bitcoin/bitcoin > src > components > Card.tsx
```

- Separator: `>` character with spacing (8px margin on each side)
- Clickable segments: Link color (#58a6ff), underline on hover
- Current page (last segment): Not clickable, regular text weight
- Truncation: Home > ... > parent > current (if path too long)

### Behavior

- **Click segment:** Navigate to that level of hierarchy
- **Last segment:** Current page, not clickable, slightly bolder (font-weight: 600)
- **Hover:** Underline on clickable segments only

### Accessibility

- **`nav`** element with `aria-label="Breadcrumb navigation"`
- **`aria-current="page"`** on last segment
- **Keyboard:** Tab through clickable segments, Enter navigates
- **Separator:** `aria-hidden="true"` (decorative, not semantic)

### Mobile Truncation

- **Narrow screens (<576px):** Show only last 2 segments
  - `Home > ... > Card.tsx`
- **Medium screens (576-768px):** Show last 3 segments
  - `Home > ... > components > Card.tsx`
- **Always show:** First segment (Home) and last segment (current page)

---

## Modal & Overlay Patterns

### Standard Modal (Dialog)

**When to Use:**
- Relay Status Dashboard
- Educational content modals ("Learn More" about Nostr/Arweave)
- Confirmation dialogs (future: destructive actions)

**Visual Design:**
- **Backdrop:** rgba(0, 0, 0, 0.7) with backdrop-blur(4px)
- **Content card:** Centered, max-width 600px desktop, full-width - 32px padding mobile
- **Background:** White (#ffffff) light mode, #1a1a1a dark mode
- **Border-radius:** 12px
- **Close button:** X icon, top-right corner (12px from edge)

### Behavior

- **Open animation:** Fade-in 200ms + subtle scale-in (0.95 → 1.0)
- **Close triggers:**
  - Click backdrop
  - Click X button
  - Press Escape key
- **Scroll lock:** Body scroll disabled while modal open
- **Focus trap:** Tab cycles within modal only
- **Restore state:** On close, restore scroll position and return focus to trigger element

### Accessibility

- **`role="dialog"`** with `aria-modal="true"`
- **`aria-labelledby`** references modal title element ID
- **`aria-describedby`** references modal description (if applicable)
- **Focus management:**
  - Focus moves to first focusable element on open (or close button if no other)
  - Focus returns to trigger element on close
- **Escape key:** Always closes modal (cannot be disabled)

---

### Bottom Sheet (Mobile)

**When to Use:** Mobile alternative to centered modals for better thumb ergonomics

**Visual Design:**
- Slides up from bottom of screen
- Rounded top corners: 16px
- Drag handle: 32px wide × 4px tall, centered, 12px from top
- Max-height: 90vh (content scrolls if taller)

### Behavior

- **Open animation:** Slide up from bottom (300ms spring animation)
- **Dismiss triggers:**
  - Swipe down gesture
  - Tap backdrop
  - Tap X button or back button
- **Partial dismiss:** Can be partially swiped down then released (springs back)
- **Full dismiss:** Swipe down past threshold (30% of height) fully dismisses

### Accessibility

- Same `role="dialog"` and `aria-*` attributes as standard modal
- Touch gestures don't affect keyboard navigation (full keyboard support maintained)
- Screen readers announce "Bottom sheet [title]" on open

---

## Empty States

**Purpose:** Guide users when content is unavailable, turning "nothing here" into helpful next steps.

### No Repositories Found

**When to Use:** Search returns zero results, relay has no matching repositories

**Visual Design:**
```
🔍 No Repositories Found

We couldn't find any repositories matching your search.

• Check your spelling
• Try different keywords  
• Browse all repositories

[Clear Search] [Browse All]
```

**Content Structure:**
- Icon: Relevant emoji or icon (🔍 for search, 📡 for network)
- Title: Clear, factual statement
- Body: Brief explanation + helpful suggestions (bullet list)
- Actions: 1-2 buttons for recovery paths

### Behavior

- Maintain search context (don't auto-clear search input)
- Buttons provide clear next steps (Clear Search, Browse All, Try Example)
- Non-blocking (user can still access other UI elements)

### Accessibility

- `role="status"` announces "No repositories found" to screen readers
- Action buttons keyboard accessible (Tab to focus, Enter to activate)

---

### Disconnected Relays

**When to Use:** All relay connections fail, network entirely offline

**Visual Design:**
```
📡 All Relays Disconnected

Rig needs Nostr relay connections to load repositories.

• Check your internet connection
• Some relays may be temporarily unavailable
• Cached data is available offline

[Retry Connection] [View Cached Data]
```

### Behavior

- Explain problem in user-friendly terms (not "Error 500")
- Offer recovery actions (Retry, View Cached)
- Don't block access to cached/offline data
- Show network status indicator state (red dot, 0/5 relays)

---

## Trust Signal Patterns

**Purpose:** Communicate verification and permanence without technical jargon, building trust through consistent visual language.

### Trust Badges

**✓ Verified Badge:**
```
Background: transparent
Border: 1px solid #3fb950 (green)
Text: #3fb950 (green)
Icon: ✓ (U+2713 checkmark)
Padding: 4px 8px
Border-radius: 4px
Font-size: 11px
Font-weight: 600
```

**♦ Permanent Badge:**
```
Background: transparent
Border: 1px solid #bb93f0 (purple)
Text: #bb93f0 (purple)
Icon: ♦ (U+25C6 diamond)
Padding: 4px 8px
Border-radius: 4px
Font-size: 11px
Font-weight: 600
```

### Usage

**When to Use:**
- Repository cards (always visible, top-right or below title)
- Repository detail header (prominent placement)
- Commit views (per-commit verification status)

### Behavior

- **Static display:** Not animated or pulsing (trust is permanent, not temporary)
- **Hover interaction:** Tooltip appears after 500ms with plain-language explanation
- **Click interaction:** Expands to Technical Details panel (progressive disclosure)

### Tooltip Content

**Verified Badge Tooltip:**
```
Cryptographic signatures validated on 4 of 5 relays.
This repository is authentically published by the maintainer.

Click for technical details
```

**Permanent Badge Tooltip:**
```
Stored permanently on Arweave with 200+ year guarantee.
This code cannot be deleted or censored.

Click for technical details
```

### Accessibility

- **`aria-label`** provides full context:
  - "Verified: Repository cryptographic signatures validated on 4 of 5 Nostr relays. Click to view technical details."
  - "Permanent: Repository stored on Arweave with 200-year permanence guarantee. Click to view Arweave transaction."
- **Tooltip on focus:** Keyboard users see tooltip when badge receives focus
- **Color + icon redundancy:** Not color-only (color-blind accessible)

### Consistency Rules

**Trust Signal Color Mapping (Never Vary):**
- ✓ Verified = Green (#3fb950)
- ♦ Permanent = Purple (#bb93f0)
- ⚠️ Pending/Unverified = Yellow (#f59e0b)
- ❌ Failed/Invalid = Red (#ef4444)

**Icon Consistency:**
- Verification always uses checkmark (✓)
- Permanence always uses diamond (♦)
- No variation or "creative" alternatives

---

## Design System Integration

### Integration with shadcn/ui v4

**How Patterns Leverage shadcn/ui:**

1. **Button Hierarchy** → shadcn `Button` component with `variant` prop (default, outline, ghost, destructive)
2. **Loading States** → shadcn `Skeleton` component + custom educational text overlay
3. **Success Feedback** → shadcn `Toast` component with custom success variant
4. **Error Feedback** → shadcn `Alert` component with `variant="destructive"`
5. **Progressive Disclosure** → shadcn `Collapsible` component
6. **Tab Navigation** → shadcn `Tabs` component with custom GitHub-style underline
7. **Modals** → shadcn `Dialog` (desktop) and `Sheet` (mobile) components
8. **Trust Badges** → shadcn `Badge` component with custom color variants

**Customization Strategy:**
- Never fork shadcn component source code
- Extend via composition and custom variants
- Use Tailwind classes for custom styling
- Store custom variants in `components/ui/` alongside shadcn components

---

### Custom Pattern Rules

**1. Educational Loading Text Rule:**
All loading states must explain *what* is being loaded and *from where*.

✅ **Good:**
- "Querying 5 Nostr relays..."
- "Fetching file from Arweave..."
- "Connected to 4/5 relays, loading repository data..."

❌ **Bad:**
- "Loading..."
- "Please wait..."
- Generic spinner with no text

**2. Error Recovery Rule:**
All error states must provide at least one actionable recovery path.

✅ **Good:**
- "Connection failed. [Retry] [View Cached Data]"
- "Repository not found. [Search Repositories] [Browse All]"

❌ **Bad:**
- "Error 500"
- "Something went wrong" (with no action)

**3. Progressive Disclosure Rule:**
Technical details default hidden, expandable on demand. Never require understanding of npub, Arweave TX, or relay mechanics for basic browsing.

✅ **Good:**
- Simple repository card → "Show Details" button → Technical panel with npub, etc.
- Trust badges visible → Tooltip on hover → Full verification modal on click

❌ **Bad:**
- npub displayed prominently on all repository cards by default
- Arweave TX shown in main content (only in expanded state or external link)

**4. Trust Signal Consistency Rule:**
✓ = Verified (green), ♦ = Permanent (purple). Always. No exceptions.

✅ **Good:**
- Consistent green checkmark for all verification
- Consistent purple diamond for all permanence

❌ **Bad:**
- Using different icons or colors for same concept
- "Verified" badge that's blue instead of green

**5. Network Transparency Rule:**
Network health always visible but not intrusive. Users should always know relay status but it shouldn't dominate the interface.

✅ **Good:**
- Small status indicator in header (● 4/5 relays)
- Click for detailed dashboard
- Educational loading text mentions relays

❌ **Bad:**
- Hiding network status completely
- Huge relay dashboard blocking primary content
- Network status changes triggering disruptive modals

---

## Pattern Testing & Compliance

### Consistency Testing

**Automated Testing (Storybook + Chromatic):**
- All patterns documented as Storybook stories
- Visual regression testing catches unintended changes
- Accessibility audit per story using `@axe-core/react`

**Manual Review Checklist:**

Before merging UI changes, verify:
- [ ] Button hierarchy follows primary/secondary/destructive rules
- [ ] Loading states include educational text (not generic "Loading...")
- [ ] Error states provide recovery actions (buttons for next steps)
- [ ] Technical details use progressive disclosure (collapsed by default)
- [ ] Trust badges use correct colors/icons (✓ green, ♦ purple)
- [ ] Network status visible in header where appropriate
- [ ] Mobile breakpoints implemented correctly (<768px triggers mobile variants)
- [ ] Keyboard navigation works (Tab, Enter, Escape, Arrow keys)
- [ ] Screen reader announcements tested (VoiceOver, NVDA, or JAWS)
- [ ] Focus management correct (modal trapping, return focus, visible focus rings)

### Pattern Compliance Enforcement

**Pre-Commit Hooks:**
- ESLint rules for pattern violations (custom rules for loading text, etc.)
- Stylelint for color consistency (only allow approved trust signal colors)

**Code Review Guidelines:**
- Reviewers check pattern compliance before approving PR
- Pattern violations tagged with "needs-pattern-fix" label

**Documentation:**
- Link to this UX pattern specification in CONTRIBUTING.md
- Onboarding checklist for new developers includes pattern review

---

## Next: Responsive Design & Accessibility

With UX consistency patterns established, we now move to defining responsive breakpoints and comprehensive accessibility strategy, ensuring Rig works beautifully across all devices and for all users.


## Responsive Design & Accessibility

### Responsive Strategy

**Desktop Strategy (1024px+):**
- Multi-column layouts with repository list (60%) and relay status sidebar (40%)
- Expanded technical details visible by default for power users
- Dense information display matching GitHub conventions
- Persistent side navigation with keyboard shortcut support
- Desktop-specific features: multi-tab browsing, split-pane diffs, inline code reviews

**Tablet Strategy (768px - 1023px):**
- Simplified two-column layout with collapsible sidebar
- Touch-optimized tabs with 48px height targets
- Progressive disclosure by default (technical details collapsed)
- Swipe gestures for tab navigation
- Bottom sheet modals for better touch ergonomics

**Mobile Strategy (320px - 767px):**
- Single-column stacked card layout
- Bottom navigation for easier thumb access (Home, Browse, Account)
- All technical details collapsed by default
- Large touch targets (minimum 44x44px, preferred 48x48px)
- Mobile-first critical info: repo name, description, stars/forks, verification badge
- Pull-up gesture for relay status from persistent bottom indicator

### Breakpoint Strategy

**Mobile-First Approach:**

```css
/* Base: Mobile (320px+) */
.repository-card { /* single column, collapsed details */ }

/* Tablet: 768px */
@media (min-width: 768px) {
  .repository-grid { grid-template-columns: 1fr; }
  .technical-details { display: block; }
}

/* Desktop Small: 1024px */
@media (min-width: 1024px) {
  .repository-grid { grid-template-columns: 2fr 1fr; }
  .technical-details { display: block; } /* always visible */
}

/* Desktop Large: 1440px */
@media (min-width: 1440px) {
  .repository-grid { grid-template-columns: 3fr 1fr; }
  .code-diff { display: split-pane; }
}
```

**Rationale:** Start with constrained mobile experience, progressively enhance with more screen space. Aligns with Rig's performance-first NFRs (small bundle size) and progressive disclosure UX pattern.

### Accessibility Strategy

**Target: WCAG 2.1 Level AA Compliance**

Meeting industry standard for OSS projects, organizational procurement requirements, and serving the 15% of global population with disabilities. Level AA provides robust accessibility without Level AAA's excessive requirements for developer tools.

**Key Accessibility Requirements:**

**1. Color Contrast (WCAG 1.4.3):**
- Normal text: 4.5:1 minimum contrast ratio
- Large text (18pt+): 3:1 minimum
- Verification badge green (#238636) on white: 4.8:1 ✓
- Error states: Use red + icon combination (not color alone)

**2. Keyboard Navigation (WCAG 2.1.1):**
- All interactive elements reachable via Tab key
- Skip links: "Skip to repository list", "Skip to technical details"
- Focus indicators: 2px solid blue outline on all focusable elements
- Keyboard shortcuts: `/` for search, `?` for help panel

**3. Screen Reader Support (WCAG 4.1.2):**
- ARIA labels on all icon buttons: `<button aria-label="Show relay dashboard">⚡ 4/5</button>`
- Live regions for loading states: `<div role="status" aria-live="polite">Querying relays...</div>`
- Semantic HTML structure: `<nav>`, `<main>`, `<article>` over `<div>` soup

**4. Touch Targets (WCAG 2.5.5):**
- Minimum 44x44px for all interactive elements
- Mobile: 48x48px preferred for primary actions
- Adequate spacing: 8px minimum between adjacent targets

**5. Focus Management:**
- Modal open: focus moves to modal first interactive element
- Modal close: focus returns to trigger button
- Progressive disclosure: "Show Details" click moves focus to first expanded detail

### Testing Strategy

**Responsive Testing:**

**Device Testing Matrix:**
- iPhone 12/13 (iOS Safari) - 390x844px
- Pixel 5 (Chrome Android) - 393x851px
- iPad Air (Safari) - 820x1180px
- MacBook Pro (Chrome, Firefox, Safari)

**Browser Compatibility:**
- Chrome 120+ (60% developer market share)
- Firefox 120+ (15% developer market share)
- Safari 17+ (20% macOS, 100% iOS requirement)
- Edge 120+ (5% enterprise users)

**Network Performance Testing:**
- Throttled 3G (4Mbps down, 1.6Mbps up) for mobile experience validation
- Fast 3G (1.6Mbps down) for relay timeout graceful degradation testing

**Accessibility Testing:**

**Automated Testing (CI/CD Pipeline):**
- Lighthouse accessibility audit ≥90 score on every PR (blocks merge if failed)
- axe-core integration in Vitest/Playwright component tests
- Pa11y automated WCAG compliance scans

**Manual Testing:**
- Screen readers: VoiceOver (macOS/iOS), NVDA (Windows), JAWS (enterprise environments)
- Keyboard-only navigation: Complete app navigation with Tab/Enter/Escape
- Color blindness simulation: Browser DevTools color vision deficiency emulation
- Zoom testing: 200% browser zoom without layout breakage

**User Testing with Disabilities:**
- Recruit 3-5 users with disabilities for beta testing phase
- Test with actual assistive technologies (not simulations)
- Compensate accessibility testers fairly for their expertise ($75-150/hour standard rate)

### Implementation Guidelines

**Responsive Development Rules:**

1. **Use Relative Units:**
```css
/* Correct */
font-size: 1rem; /* 16px base, scales with user preferences */
padding: 0.5rem; /* responsive spacing */
width: 100%; max-width: 80rem; /* fluid container */

/* Avoid */
font-size: 16px; /* ignores user font size settings */
width: 1200px; /* breaks on smaller screens */
```

2. **Mobile-First Media Queries:**
```css
/* Base mobile styles */
.button { padding: 0.75rem 1rem; }

/* Enhance for larger screens */
@media (min-width: 768px) {
  .button { padding: 0.5rem 1.5rem; }
}
```

3. **Touch Target Visual Feedback:**
```tsx
<Button 
  className="min-w-[44px] min-h-[44px] active:scale-95 transition-transform"
  aria-label="View repository details"
>
  {/* content */}
</Button>
```

4. **Responsive Images:**
```tsx
<img 
  src={avatar} 
  srcSet={`${avatar} 1x, ${avatar2x} 2x`}
  alt="Repository owner avatar"
  loading="lazy"
/>
```

**Accessibility Development Rules:**

1. **Semantic HTML Structure:**
```tsx
<main>
  <nav aria-label="Main navigation">
    <ul><li><a href="/repos">Repositories</a></li></ul>
  </nav>
  <article aria-labelledby="repo-title">
    <h1 id="repo-title">{repoName}</h1>
  </article>
</main>
```

2. **ARIA Labels for Icon Buttons:**
```tsx
<Button variant="ghost" size="icon" aria-label="View relay status">
  <Network className="h-4 w-4" />
</Button>
```

3. **Keyboard Navigation Support:**
```tsx
<Collapsible>
  <CollapsibleTrigger 
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDetails();
      }
    }}
  >
    Show Details
  </CollapsibleTrigger>
</Collapsible>
```

4. **Focus Management:**
```tsx
const dialogRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);

<Dialog ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true">
  {/* content */}
</Dialog>
```

5. **High Contrast Mode Support:**
```css
@media (prefers-contrast: high) {
  .button {
    border: 2px solid currentColor;
  }
}
```

**shadcn/ui v4 Accessibility Integration:**
- shadcn components include proper ARIA attributes by default
- Radix UI primitives handle focus management automatically
- Custom icon buttons require explicit `aria-label` attributes
- Verify Collapsible/Accordion keyboard navigation in manual testing
