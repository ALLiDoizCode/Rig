# Non-Functional Requirements

## Performance

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

## Security

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

## Accessibility

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

## Reliability & Availability

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

## Integration & Interoperability

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

## Scalability

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
