# Functional Requirements

## Repository Discovery & Browsing

- **FR1**: Users can browse a list of repositories announced via Nostr kind 30617 events
- **FR2**: Users can view repository metadata including name, description, maintainers, and ArNS URL
- **FR3**: Users can filter repositories by name using client-side search
- **FR4**: Users can navigate to a repository detail view to explore its contents
- **FR5**: Users can view which Nostr relays are currently providing repository data

## Commit & Change History

- **FR6**: Users can view a chronological list of commits for a repository
- **FR7**: Users can view commit details including author, message, timestamp, and Nostr event ID
- **FR8**: Users can view the diff (changes) for each commit with syntax highlighting
- **FR9**: Users can navigate between related commits (parent/child relationships)
- **FR10**: Users can view commit metadata including Arweave transaction IDs for storage verification

## File Exploration

- **FR11**: Users can navigate a repository's file tree structure
- **FR12**: Users can view file contents with syntax highlighting for code files
- **FR13**: Users can navigate between different file versions across commits
- **FR14**: Users can view file metadata including size and last modified timestamp
- **FR15**: Users can access "View on Arweave" links to verify permanent storage

## Issue & Pull Request Management

- **FR16**: Users can browse a list of issues for a repository
- **FR17**: Users can view issue details including title, description, status, and comments
- **FR18**: Users can view issue comment threads with proper threading (NIP-10 references)
- **FR19**: Users can browse a list of pull requests for a repository
- **FR20**: Users can view pull request details including title, description, status, and discussion
- **FR21**: Users can view pull request discussion threads with proper threading
- **FR22**: Users can see issue and PR status indicators (open, closed, merged)

## Decentralization & Verification

- **FR23**: Users can view which Nostr relays successfully responded to queries
- **FR24**: Users can verify Nostr event signatures for data authenticity
- **FR25**: Users can view Arweave transaction IDs for all stored content
- **FR26**: Users can verify Arweave transaction hashes for data integrity
- **FR27**: Users can see ArNS name resolution details (ArNS → Arweave TX mapping)
- **FR28**: Users can view relay connection health status (connected/disconnected)
- **FR29**: Users can export permanent citation-ready URLs (ArNS + Arweave TX)

## User Education & Transparency

- **FR30**: Users can access educational content explaining Nostr, Arweave, and ILP concepts
- **FR31**: Users can view visual indicators showing decentralization status (relay count, Arweave confirmation)
- **FR32**: Users can see explanations of why data is permanent and censorship-resistant
- **FR33**: Users can access technical documentation about NIP-34 event structures
- **FR34**: Users can view information about how the frontend is hosted on Arweave

## Performance & Offline Access

- **FR35**: Users can view cached repository data when offline (service worker support)
- **FR36**: Users can see visual indicators of data freshness (e.g., "Last updated 30s ago from 4/5 relays")
- **FR37**: Users can access previously viewed content without re-querying relays
- **FR38**: Users can see loading states during data fetching from decentralized sources
- **FR39**: Users can continue browsing if some relays fail (graceful degradation)

## Accessibility & Responsive Design

- **FR40**: Users can navigate all interactive elements using keyboard only
- **FR41**: Users can access all functionality via screen readers with proper semantic HTML and ARIA labels
- **FR42**: Users can browse repositories on mobile devices with touch-optimized interfaces
- **FR43**: Users can adjust browser zoom to 200% without breaking the layout
- **FR44**: Users can distinguish information by means other than color alone (e.g., diff symbols, not just colors)

## Developer & Ecosystem Integration

- **FR45**: Developers can inspect NIP-34 event structures in the browser DevTools
- **FR46**: Developers can view source code architecture and implementation patterns (GitHub repository)
- **FR47**: Developers can understand relay query logic and Arweave retrieval patterns for reuse
- **FR48**: Users can share ArNS URLs that permanently resolve to specific repositories
