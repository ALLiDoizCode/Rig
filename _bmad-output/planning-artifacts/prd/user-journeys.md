# User Journeys

## Journey 1: Alex - Open Source Maintainer

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

## Journey 2: Jordan - Contributor

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

## Journey 3: Sam - Archivist/Researcher

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

## Journey 4: Casey - Web3 Developer

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

## Journey 5: Anonymous Visitor - Curiosity to Trust

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

## Journey 6: Ecosystem Builder - Proof of Concept to Pattern

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

## Journey Requirements Summary

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
