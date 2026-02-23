# PRD Changes Summary

## Date: 2026-02-23

## Major Architecture Changes

### ❌ REMOVED: Forgejo Backend Implementation
- **Old:** Forking/modifying Forgejo codebase
- **New:** Forgejo is feature reference only, not implementation

### ✅ CLARIFIED: Crosstown/Connector Backend
- **Role:** ILP payment verification + Nostr relay publishing gateway
- **Responsibility:** Gates event publishing on valid ILP payments
- **Out of Scope:** Implementation details (you're handling this separately)

### ✅ CLARIFIED: Frontend Architecture
- **Technology:** Static HTML/JS using nostr-tools
- **Purpose:** Read-only client that queries Nostr relays directly
- **Deployment:** Static hosting (Netlify, GitHub Pages, IPFS)
- **No Backend:** For reading operations, pure P2P

### ⏸️ DEFERRED: Arweave Integration
- **Status:** Explicitly out of scope for now
- **Reason:** You'll handle storage strategy later
- **Focus:** NIP-34 event structures and metadata only

## Updated Data Flows

### Repository Creation
```
User fills form → Frontend generates NIP-34 event (kind 30617)
→ User signs with Nostr key → User pays ILP
→ Submit to Crosstown/Connector → Connector verifies payment
→ Publishes to Nostr relays → Discoverable via nostr-tools
```

### Patch Submission
```
User creates patch → Frontend generates event (kind 1617)
→ User signs + pays → Submit to Crosstown/Connector
→ Connector verifies + publishes → Maintainer queries relay
→ Sees patch in viewer
```

## Technology Stack Changes

### Frontend
- **Added:** nostr-tools (explicit read-only usage)
- **Removed:** Vue.js, nos2x integration details
- **Simplified:** Focus on static client capabilities

### Backend
- **Changed:** From "Forgejo Backend" to "Crosstown/Connector"
- **Clarified:** Payment verification gateway role
- **Removed:** PostgreSQL, Redis details (your implementation)

### Storage
- **Status:** Deferred/out of scope
- **Removed:** All Arweave implementation details
- **Focus:** Event metadata only for MVP

## Feature Requirement Changes

### F1.1: Nostr Authentication → Frontend Read Client
- **Changed:** From authentication system to read-only nostr-tools client
- **Focus:** Querying relays, displaying events

### F1.2: Repository Announcement
- **Simplified:** Focus on NIP-34 event structure
- **Removed:** Arweave upload steps
- **Added:** Exact event JSON structure

### F1.3: ILP Payment Verification → Crosstown/Connector Integration
- **Changed:** From implementation details to interface contract
- **Added:** API endpoint specification
- **Note:** Implementation out of scope

### F1.4: Arweave Storage → Deferred
- **Status:** Explicitly out of scope
- **Reason:** Storage strategy TBD

### F1.5: Git Operations → Patches and PRs Event Structures
- **Focus:** NIP-34 event design (kinds 1617, 1618)
- **Removed:** Implementation details (applying patches, merging)
- **Added:** Complete event JSON examples

### F1.6: Issues and Comments
- **Focus:** Event structures (kinds 1621, 1622)
- **Added:** NIP-10 threading examples
- **Added:** Query patterns using nostr-tools

### F1.7: Relay Integration → Status Management
- **Changed:** From relay infrastructure to NIP-34 status events
- **Focus:** Status event structures (kinds 1630-1633)

## Removed Sections

- Database models (no centralized DB)
- Relay health monitoring (handled by nostr-tools)
- CI/CD integration (out of scope)
- Git protocol compatibility (deferred)
- Many "Phase 2" and "Phase 3" features

## Key Principles Established

1. **Read = P2P via nostr-tools**
   - No backend needed
   - Query relays directly
   - Pure client-side

2. **Write = ILP-Gated via Crosstown/Connector**
   - User signs event
   - User pays ILP
   - Connector verifies + publishes

3. **Storage = Deferred**
   - Focus on event structures first
   - Actual git objects TBD

4. **Forgejo = Feature Reference**
   - Not implementation target
   - Use feature list only

## Next Steps

### Immediate Priorities:
1. Frontend static viewer using nostr-tools
2. NIP-34 event generation (kinds 30617, 1617, 1618, 1621, 1622)
3. Crosstown/Connector API interface definition
4. Payment flow (Web Monetization API integration)

### Deferred:
- Git object storage strategy
- Arweave integration
- Actual code browsing/diffing
- Advanced features (CI/CD, code review)

## Questions Resolved

✅ **Q: Is there a Forgejo backend?**
A: No, Crosstown/Connector is the backend (ILP gateway)

✅ **Q: How are writes handled?**
A: Via Crosstown/Connector with ILP payment verification

✅ **Q: How are reads handled?**
A: Pure P2P via nostr-tools querying relays

✅ **Q: What about Arweave?**
A: Out of scope for now, you'll handle later

✅ **Q: What about git objects?**
A: Deferred, focus on metadata events first
