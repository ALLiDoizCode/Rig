# Web App Specific Requirements

## Project-Type Overview

Rig is a **single-page application (SPA)** built with React, TypeScript, and Vite, providing a GitHub-like interface for browsing decentralized git repositories. The frontend queries multiple Nostr relays in parallel and retrieves git objects from Arweave via ar.io gateways. Static hosting (Vercel/Netlify) with progressive enhancement toward decentralized hosting (IPFS/ArNS) post-MVP.

## Technical Architecture Considerations

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

## Browser Matrix

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

## Responsive Design

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

## Performance Targets

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

## SEO Strategy

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

## Accessibility Level

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
