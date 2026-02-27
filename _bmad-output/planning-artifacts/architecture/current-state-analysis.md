# Current State Analysis

## Forgejo Reference Implementation
- **Framework:** Vue 3.5.28
- **UI Library:** Fomantic UI (Semantic UI fork)
- **Build Tool:** Webpack 5
- **Styling:** Tailwind CSS 3.4.18
- **Components:** ~24 Vue components
- **Code Editor:** CodeMirror 6
- **Purpose:** Feature reference only - NOT being forked/modified

## Target Architecture (from PRD)
- **Frontend:** Static HTML/JS using nostr-tools
- **Purpose:** Pure P2P read-only client
- **Deployment:** Static hosting (Netlify, GitHub Pages, IPFS)
- **Backend:** Crosstown/Connector (ILP payment gateway for writes only)
- **Key Principle:** Reads are free and P2P via Nostr relays

---
