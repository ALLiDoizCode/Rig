# Executive Summary

Rig is a React-based frontend application that demonstrates decentralized git hosting using the Crosstown ecosystem pattern. It targets Web3/Nostr ecosystem developers who need decentralized, censorship-resistant code collaboration without relying on centralized platforms like GitHub or GitLab.

The application provides a read-only interface to git repositories stored across a three-layer decentralized architecture: **Nostr** relays for metadata and event coordination (NIP-34), **Arweave** for permanent storage of git objects, and **ArNS** for human-friendly repository naming. Users can browse repositories, view commits, explore pull requests, and track issues—all sourced from decentralized infrastructure.

Rig solves the critical problem of git hosting platform centralization and censorship risk. Developers lose access to code, history, and collaboration tools when platforms ban accounts or repositories. Rig eliminates this single point of failure by distributing repository data across censorship-resistant networks while maintaining familiar git workflows.

The frontend demonstrates the Crosstown pattern: **free peer-to-peer reads** via nostr-tools querying multiple relays, and **paid ILP-gated writes** through Crosstown/Connector infrastructure. This proves that complex, production-grade applications can be built on ILP-gated Nostr relays as the universal decentralized database—the core Crosstown ecosystem vision.

## What Makes This Special

**Rig is the first major application proving the Crosstown ecosystem pattern scales to production complexity.** While Nostr has demonstrated success for social media, Rig validates that ILP-gated Nostr relays can handle stateful, high-complexity applications like git hosting.

The three-layer architecture separates concerns elegantly:
- **Nostr (NIP-34 events)**: Lightweight metadata, event coordination, and query interface
- **ArNS**: Permanent, human-friendly naming that survives domain seizures
- **Arweave**: Immutable storage ensuring code permanence across decades

This separation makes the pattern reusable for any application requiring decentralized state management—not just git hosting.

**Economic sustainability through micropayments** solves the relay funding crisis. Traditional Nostr relays face unsustainable costs or resort to surveillance capitalism. Rig demonstrates that **free reads + paid writes** via ILP creates healthy incentives: users pay only for state changes they create, relays earn sustainable revenue, and the network remains permissionless.

**Inspired by git-native state management from beads/Gastown/Seeds**, Rig extends the insight that content-addressed storage enables merge-safe concurrent workflows. Where those projects proved the pattern works locally for AI agent state, Crosstown/Rig prove it works network-wide with economic incentives via ILP.

If Rig succeeds with git hosting—one of the most complex stateful applications—the Crosstown pattern can power **anything**: social networks, collaboration tools, data marketplaces, AI agent coordination. Rig is the proof of concept that validates the entire ecosystem vision.
