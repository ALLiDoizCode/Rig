# Domain-Specific Requirements

## Compliance & Regulatory

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

## Technical Constraints

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

## Integration Requirements

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

## Risk Mitigations

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

## Domain-Specific Patterns & Best Practices

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
