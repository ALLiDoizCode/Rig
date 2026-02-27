---
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
lastSaved: '2026-02-27'
---

# Test Design: Epic 3 - Code Browsing & File Navigation

**Date:** 2026-02-27
**Author:** Jonathan
**Status:** Draft

---

## Executive Summary

**Scope:** Full test design for Epic 3

**Risk Summary:**

- Total risks identified: 12
- High-priority risks (≥6): 5
- Critical categories: SEC (XSS), PERF (large files), TECH (virtual scrolling), DATA (path preservation)

**Coverage Summary:**

- P0 scenarios: 40 (~25-40 hours)
- P1 scenarios: 32 (~20-35 hours)
- P2/P3 scenarios: 23 (~12-25 hours)
- **Total effort**: ~57-100 hours (~12-18 days)

---

## Not in Scope

| Item | Reasoning | Mitigation |
|------|-----------|------------|
| **Backend file processing** | Epic 3 only covers frontend file browsing UI. File fetching from Arweave is handled by existing lib/arweave.ts service (Epic 1). | Arweave service already tested in Epic 1 with integration tests. |
| **Git operations** | NIP-34 repository protocol uses Nostr events, not native git. No git clone/fetch operations in scope. | Nostr service layer tested in Epic 1. |
| **File editing** | Epic 3 is read-only file browsing. Write operations deferred to future epic. | Document limitation in UX, no user expectation of editing. |
| **Search within files** | Ctrl+F browser search sufficient for MVP. Advanced file content search deferred. | Browser native search (Ctrl+F) available, document in help. |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
|---------|----------|-------------|-------------|--------|-------|------------|-------|----------|
| R-001 | SEC | **XSS vulnerability in markdown rendering** - User-generated markdown content (READMEs) could contain malicious HTML/JavaScript if not properly sanitized | 2 | 3 | 6 | MUST use rehype-sanitize (NOT rehype-raw per CLAUDE.md security rules). Test XSS payloads: script tags, iframe injection, event handlers, onclick attributes. Verify react-markdown configuration blocks dangerous HTML. | DEV | Before Story 3.5 |
| R-002 | PERF | **Large file rendering hangs browser** - Files >1MB may freeze UI during syntax highlighting. No progressive rendering strategy documented. react-syntax-highlighter runs synchronously. | 2 | 3 | 6 | Implement web worker for syntax highlighting offload, virtual scrolling for large files, progressive rendering with skeleton states. Show loading indicator for files >100KB. Test with 5MB+ files (large JSON, minified JS). | DEV | During Story 3.2 |
| R-003 | TECH | **Virtual scrolling library not installed** - Story 3.1 requires virtual scrolling for >100 items, but @tanstack/react-virtual (recommended) or react-window not in package.json. Epic 2 overview flagged this as critical decision. | 3 | 2 | 6 | Install @tanstack/react-virtual (or react-window) before Story 3.1 implementation. Prototype with 500+ item tree to validate performance (<16ms frame time, <100ms initial render). Document choice in architecture ADR. | DEV | Before Story 3.1 |
| R-004 | DATA | **Path preservation logic failure after branch switch** - Complex logic to check if current file path exists in new branch manifest. Edge cases: renamed files, moved files, deleted files, case-sensitive path mismatches. Manifest structure may vary by Arweave gateway. | 2 | 3 | 6 | Comprehensive manifest comparison logic with graceful fallback to root. Handle: (a) exact path match, (b) case-insensitive match, (c) parent directory exists (show tree), (d) complete miss (root + toast notification). Test: switch branches with missing paths, renamed files, moved directories, empty manifests. | DEV | During Story 3.3 |
| R-005 | BUS | **Syntax highlighting theme mismatch in dark mode** - Multiple theme options (Prism vs Highlight.js) create inconsistency risk. Dark mode theme not matching application theme creates jarring UX. react-syntax-highlighter has 50+ themes but not all support dark mode properly. | 2 | 2 | 4 | Select Prism theme early (matches GFM markdown from Epic 2), configure dark mode variant (e.g., vscDarkPlus or oneDark), test theme switching. Document selected theme in CLAUDE.md. Fallback: custom CSS override if theme doesn't match. | DEV | During Story 3.2 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---------|----------|-------------|-------------|--------|-------|------------|-------|
| R-006 | PERF | **Mobile horizontal scroll UX degradation** - Long code lines (>120 chars) may cause poor UX on mobile (<768px) with horizontal scroll. Touchscreen horizontal scroll is awkward. Epic 2 retrospective flagged mobile testing gaps. | 2 | 2 | 4 | CSS overflow-x: auto, test on actual mobile devices (not just emulation) with long lines (150+ chars). Consider line wrapping by default on mobile (toggle available). Add visual indicator for horizontal scrollable content. | QA |
| R-007 | TECH | **Language mapping incompleteness** - 20+ languages required, but mapping from file extension to language name may have gaps (.ts vs .tsx, .js vs .jsx, obscure extensions like .wasm, .proto, .svelte). react-syntax-highlighter supports 185 languages but requires explicit mapping. | 2 | 2 | 4 | Create centralized language map utility (lib/utils/languageMap.ts) with 30+ common extensions. Test with uncommon extensions. Fallback to plaintext (no highlighting) with warning log for missing mappings. Document extension → language map in codebase. | DEV |
| R-008 | OPS | **Arweave transaction verification logic complexity** - Transaction ID extraction from manifest + verification logic for data integrity (NFR-S2). May fail silently if manifest structure changes between Arweave gateways. Verification adds latency to file viewing. | 1 | 3 | 3 | Robust error handling, clear warning messages if verification fails (toast notification). Allow content display even if verification fails (warn, don't block). Test with: (a) valid TX ID, (b) malformed TX ID, (c) TX ID mismatch, (d) verification timeout. Verification should be async/non-blocking. | DEV |
| R-009 | DATA | **Breadcrumb truncation logic on mobile** - Complex CSS logic to show "last 2-3 segments" on mobile. May break for deeply nested paths (>5 levels), long folder names (>20 chars), or special characters in paths. Epic 2 breadcrumb pattern exists but not tested for deep paths. | 1 | 2 | 2 | Test with 10-level deep paths on 320px viewport, ensure ellipsis shows correctly (\u2026). Full path available on tap/hover (tooltip). Handle long segment names with CSS text-overflow. Test special characters in paths (spaces, unicode, emoji). | DEV |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
|---------|----------|-------------|-------------|--------|-------|--------|
| R-010 | OPS | **File type icon library completeness** - May not have icons for all file types (obscure extensions like .wasm, .proto, .svelte, .astro) | 1 | 1 | 1 | Use fallback generic file icon, document known gaps, add icons on-demand if users request |
| R-011 | BUS | **Copy button toast notification timing** - Toast may overlap other UI elements, disappear too quickly (<2s), or conflict with other toasts | 1 | 1 | 1 | Test with Sonner toast library (already installed Epic 2), adjust z-index/timing if needed, queue toasts if multiple |
| R-012 | OPS | **Branch/tag search input performance** - May be slow for repositories with 1000+ branches (unlikely in practice, GitHub has ~100 branches median) | 1 | 1 | 1 | Monitor in production, optimize only if users report issues (debounce search input, virtual list if needed) |

### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

## Entry Criteria

- [ ] Requirements and assumptions agreed upon by QA, Dev, PM
- [ ] Test environment provisioned and accessible (dev server running on localhost:5173)
- [ ] Test data available: Mock Nostr events for repositories with file manifests
- [ ] Feature deployed to test environment (dev branch)
- [ ] Epic 2 complete (repository detail page, markdown rendering patterns established)
- [ ] Dependencies resolved: Virtual scrolling library installed (@tanstack/react-virtual or react-window)
- [ ] Architecture decision: Syntax highlighting theme selected (Prism recommended)

## Exit Criteria

- [ ] All P0 tests passing (40/40 = 100%)
- [ ] All P1 tests passing (or failures triaged with waivers)
- [ ] No open high-priority / high-severity bugs
- [ ] Test coverage agreed as sufficient (≥90% for critical paths)
- [ ] All high-risk mitigations complete (R-001 through R-005 resolved or waived)
- [ ] XSS prevention verified (R-001): 10 XSS payload tests passing
- [ ] Large file handling verified (R-002): 5MB file renders without freeze
- [ ] Virtual scrolling verified (R-003): 500+ item tree renders at 60fps
- [ ] Path preservation verified (R-004): Branch switch with missing path falls back gracefully
- [ ] Accessibility tests passing: Keyboard navigation, screen reader support

---

## Test Coverage Plan

### P0 (Critical) - Run on every commit

**Criteria**: Blocks core journey + High risk (≥6) + No workaround

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| **3.1**: File tree navigation (virtual scrolling, keyboard, ARIA) | E2E + Component | R-003 | 8 | DEV | Virtual scroll with 500+ items, keyboard arrow/enter, ARIA tree/treeitem/group, expand/collapse state |
| **3.2**: Syntax highlighting (20+ languages, large files, dark mode) | E2E + Unit | R-002, R-005 | 12 | DEV | 20 language extensions, 5MB file render, dark mode theme match, progressive loading skeleton |
| **3.3**: Branch switching with path preservation | E2E + Unit | R-004 | 6 | DEV | Path exists → preserve, path missing → root fallback, renamed file, manifest refetch logic |
| **3.5**: Markdown XSS prevention (rehype-sanitize) | E2E + Unit | R-001 | 10 | DEV | Script tags, iframe, onclick, onerror, javascript: URLs, <svg><script>, data: URLs, meta refresh, object/embed, base href |
| **3.6**: Arweave TX verification (extraction + validation) | Component + Unit | R-008 | 4 | DEV | TX ID extraction from manifest, verification API call, graceful failure (warning, not block), timeout handling |

**Total P0**: 40 tests, ~25-40 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| **3.1**: Responsive file tree (mobile/tablet/desktop) | E2E | - | 6 | DEV | Mobile: collapsible with toggle, Tablet: toggle button, Desktop: persistent sidebar, Touch targets 44x44px |
| **3.2**: File viewer features (wrap, copy, scroll, languages) | Component | R-006, R-007 | 8 | DEV | Line wrap toggle, copy button + toast, horizontal scroll (mobile 320px), 30+ extension → language map |
| **3.3**: Branch dropdown UI (search, keyboard, icons) | Component | - | 4 | DEV | Search filter (case-insensitive), keyboard nav (arrow + enter), branch/tag icons, loading skeleton |
| **3.4**: File metadata display (breadcrumb, size, warnings) | Component + Unit | R-009 | 6 | DEV | Breadcrumb nav (clickable segments), mobile truncation (last 2-3 segments), large file warning (>1MB), file size format |
| **3.5**: Markdown rendering features (GFM, links, images) | E2E + Component | - | 8 | QA | GFM: tables, task lists, code blocks, strikethrough; internal links → routes; external links (new tab + noopener); image lazy load |

**Total P1**: 32 tests, ~20-35 hours

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement | Test Level | Test Count | Owner | Notes |
|-------------|------------|------------|-------|-------|
| **3.2**: Syntax theme variants (switch themes) | Visual | 4 | QA | Theme switching (light/dark), edge color schemes, theme persistence |
| **3.4**: Deep path breadcrumbs (10-level paths) | Component | 3 | DEV | 10-level deep path, ellipsis truncation, tooltip full path, special chars (spaces, unicode) |
| **3.5**: Markdown edge cases (empty, malformed, mixed HTML) | Unit | 8 | DEV | Empty file, malformed markdown (unclosed tags), mixed HTML/markdown, no heading, long code blocks |
| **3.6**: Multiple Arweave explorers (ViewBlock, ArDrive, arweave.net) | Unit | 3 | DEV | URL generation for 3 explorers, external link verification, fallback to arweave.net |

**Total P2**: 18 tests, ~10-20 hours

### P3 (Low) - Run on-demand

**Criteria**: Nice-to-have + Exploratory + Performance benchmarks

| Requirement | Test Level | Test Count | Owner | Notes |
|-------------|------------|------------|-------|-------|
| **3.1**: File tree performance benchmarks | Performance | 2 | QA | 500 items: <100ms initial render, 1000 items: <16ms frame time, scroll FPS ≥60 |
| **3.2**: Syntax highlighting performance | Performance | 2 | QA | 5MB file: <3s render, 10MB file: <5s render (or progressive), memory usage <200MB |
| **3.3**: Branch list with 100+ branches (search performance) | Performance | 1 | QA | 100 branches: search debounce <300ms, virtual list if needed |

**Total P3**: 5 tests, ~2-5 hours

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [ ] File tree renders (30s)
- [ ] File content displays (45s)
- [ ] Branch selector opens (20s)
- [ ] Markdown README renders (60s)

**Total**: 4 scenarios

### P0 Tests (<10 min)

**Purpose**: Critical path validation

- [ ] Virtual scrolling with 500+ items (E2E)
- [ ] XSS payload rejection (10 tests, Unit + E2E)
- [ ] Large file progressive loading (E2E)
- [ ] Branch switch path preservation (E2E)
- [ ] Arweave TX verification (Component)

**Total**: 40 scenarios

### P1 Tests (<30 min)

**Purpose**: Important feature coverage

- [ ] Responsive layouts (mobile/tablet/desktop, E2E)
- [ ] File viewer features (Component)
- [ ] Branch dropdown UI (Component)
- [ ] File metadata (Component)
- [ ] Markdown GFM features (E2E)

**Total**: 32 scenarios

### P2/P3 Tests (<60 min)

**Purpose**: Full regression coverage

- [ ] Theme switching (Visual)
- [ ] Edge cases (Unit)
- [ ] Performance benchmarks (Performance)

**Total**: 23 scenarios

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Hours/Test | Total Hours | Notes |
|----------|-------|------------|-------------|-------|
| P0 | 40 | 0.6-1.0 | ~25-40 | Complex setup (XSS payloads, large files, virtual scroll), security critical |
| P1 | 32 | 0.6-1.1 | ~20-35 | Standard coverage (responsive layouts, component props, UI interactions) |
| P2 | 18 | 0.6-1.1 | ~10-20 | Simple scenarios (edge cases, theme switching, fallbacks) |
| P3 | 5 | 0.4-1.0 | ~2-5 | Exploratory (performance benchmarks, stress tests) |
| **Total** | **95** | **-** | **~57-100** | **~12-18 days** (1 developer, sequential implementation) |

### Prerequisites

**Test Data:**

- createRepository() factory with file manifests (Faker-based, 500+ items for virtual scroll tests)
- createFileContent() fixture (setup/teardown, 5MB+ files for performance tests)
- XSS payload library (10 common attack vectors: script tags, iframe, onclick, etc.)

**Tooling:**

- @tanstack/react-virtual (or react-window) for virtual scrolling tests
- Playwright MCP tools for browser automation and accessibility snapshots
- Semgrep for XSS static analysis (complement runtime tests)
- Lighthouse for performance baselines (deferred to Epic 3 completion per retrospective)

**Environment:**

- Dev server running on localhost:5173
- Mock Nostr relays with NIP-34 repository events
- Mock Arweave gateway responses (file manifests, transaction IDs)

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions - blocks release)
- **P1 pass rate**: ≥95% (waivers required for failures, must justify + expiry date)
- **P2/P3 pass rate**: ≥90% (informational, does not block release)
- **High-risk mitigations**: 100% complete or approved waivers (R-001 through R-005)

### Coverage Targets

- **Critical paths** (file tree → file viewer → markdown): ≥90%
- **Security scenarios** (XSS prevention, Arweave verification): 100%
- **Business logic** (path preservation, language mapping): ≥80%
- **Edge cases** (large files, deep paths, missing branches): ≥70%

### Non-Negotiable Requirements

- [ ] All P0 tests pass (40/40 = 100%)
- [ ] No high-risk (≥6) items unmitigated (R-001 XSS, R-002 large files, R-003 virtual scroll, R-004 path preservation)
- [ ] Security tests (SEC category) pass 100% (R-001: 10 XSS payload tests all passing)
- [ ] Performance targets met: Large file <3s, virtual scroll <16ms frame time, initial render <100ms
- [ ] Accessibility targets met: WCAG 2.1 AA compliance (keyboard nav + screen reader support)

---

## Mitigation Plans

### R-001: XSS vulnerability in markdown rendering (Score: 6)

**Mitigation Strategy:**
1. **Use rehype-sanitize plugin** (NOT rehype-raw) in react-markdown configuration (per CLAUDE.md security rules)
2. **Test 10 XSS payloads** (unit + E2E):
   - `<script>alert('XSS')</script>` → should be stripped
   - `<iframe src="javascript:alert('XSS')"></iframe>` → should be stripped
   - `<img src=x onerror="alert('XSS')">` → should be stripped
   - `<a href="javascript:alert('XSS')">` → should be stripped
   - `<svg><script>alert('XSS')</script></svg>` → should be stripped
   - `<img src="data:text/html,<script>alert('XSS')</script>">` → should be stripped
   - `<meta http-equiv="refresh" content="0;url=javascript:alert('XSS')">` → should be stripped
   - `<object data="javascript:alert('XSS')">` → should be stripped
   - `<embed src="data:text/html,<script>alert('XSS')</script>">` → should be stripped
   - `<base href="javascript:alert('XSS')//">` → should be stripped
3. **Verify react-markdown configuration** blocks dangerous HTML (allowedElements, disallowedElements)
4. **Run Semgrep security scan** to detect dangerouslySetInnerHTML usage (should be zero)

**Owner:** DEV
**Timeline:** Before Story 3.5 implementation
**Status:** Planned
**Verification:** All 10 XSS payload tests passing + Semgrep scan clean

### R-002: Large file rendering hangs browser (Score: 6)

**Mitigation Strategy:**
1. **Implement web worker** for syntax highlighting offload (prevents main thread freeze)
2. **Progressive rendering** with skeleton states (show partial content, load incrementally)
3. **Virtual scrolling** for large files (only render visible portion)
4. **Loading indicator** for files >100KB (set user expectation)
5. **Test with 5MB+ files**:
   - 5MB JSON file (deeply nested, many keys)
   - 5MB minified JS file (single long line)
   - 10MB log file (many lines)

**Owner:** DEV
**Timeline:** During Story 3.2 implementation
**Status:** Planned
**Verification:** 5MB file renders in <3s without UI freeze

### R-003: Virtual scrolling library not installed (Score: 6)

**Mitigation Strategy:**
1. **Install @tanstack/react-virtual** (or react-window) before Story 3.1 starts
2. **Prototype with 500+ item tree** to validate performance (<16ms frame time, <100ms initial render)
3. **Document choice in architecture ADR** (justify @tanstack/react-virtual vs react-window)
4. **Test scenarios**:
   - 100 items: baseline (no virtual scroll needed)
   - 500 items: virtual scroll active, 60fps maintained
   - 1000 items: virtual scroll active, <100ms initial render

**Owner:** DEV
**Timeline:** Before Story 3.1 implementation
**Status:** Planned
**Verification:** 500+ item tree renders at 60fps (no frame drops)

### R-004: Path preservation logic failure after branch switch (Score: 6)

**Mitigation Strategy:**
1. **Comprehensive manifest comparison logic** with graceful fallback to root
2. **Handle 4 cases**:
   - (a) Exact path match → preserve path, navigate to file
   - (b) Case-insensitive match → normalize and navigate
   - (c) Parent directory exists → show tree, toast "file not found in this branch"
   - (d) Complete miss → root fallback, toast "navigated to root"
3. **Test scenarios**:
   - Branch A has /src/App.tsx, Branch B has /src/App.tsx → preserve
   - Branch A has /src/App.tsx, Branch B has /src/app.tsx (case change) → normalize
   - Branch A has /src/components/Button.tsx, Branch B has /src/ but no Button → show /src tree
   - Branch A has /src/old/File.tsx, Branch B has /lib/ (no /src/) → root fallback

**Owner:** DEV
**Timeline:** During Story 3.3 implementation
**Status:** Planned
**Verification:** 4 test scenarios passing with correct fallback behavior

### R-005: Syntax highlighting theme mismatch in dark mode (Score: 4)

**Mitigation Strategy:**
1. **Select Prism theme early** (matches GFM markdown from Epic 2)
2. **Configure dark mode variant**: vscDarkPlus or oneDark (test with theme toggle)
3. **Document selected theme in CLAUDE.md** (prevent future changes without review)
4. **Fallback**: Custom CSS override if theme doesn't match application theme

**Owner:** DEV
**Timeline:** During Story 3.2 implementation
**Status:** Planned
**Verification:** Theme matches application dark mode, no jarring color mismatches

---

## Assumptions and Dependencies

### Assumptions

1. Virtual scrolling library (@tanstack/react-virtual or react-window) will be installed before Story 3.1 implementation
2. Epic 2 markdown rendering patterns (react-markdown + remark-gfm) will be reused for Story 3.5
3. Arweave manifests follow consistent structure across gateways (path, size, hash fields)
4. File extensions accurately map to programming languages (e.g., .ts = TypeScript, .rs = Rust)
5. Repository size is reasonable (<1000 files in tree, <10MB max file size for MVP)

### Dependencies

1. **Epic 1 complete**: Arweave service (lib/arweave.ts) with fetchManifest() and fetchFile() - Required by 2026-02-27
2. **Epic 2 complete**: Repository detail page routing (:owner/:repo/src/:branch) - Required by 2026-02-27
3. **Virtual scrolling library installed**: @tanstack/react-virtual or react-window - Required before Story 3.1 (2026-03-03)
4. **Syntax highlighting theme selected**: Prism theme configured in react-syntax-highlighter - Required before Story 3.2 (2026-03-06)

### Risks to Plan

- **Risk**: Virtual scrolling library installation delayed (developer unfamiliar with library)
  - **Impact**: Story 3.1 blocked, epic timeline slips 2-3 days
  - **Contingency**: Fallback to react-window (simpler API), or defer virtual scroll to Story 3.1b

- **Risk**: Large file rendering performance worse than expected (web worker complexity)
  - **Impact**: Story 3.2 timeline extends, may need architecture change
  - **Contingency**: Implement file size limit (e.g., 5MB), warn users for larger files, defer progressive rendering

- **Risk**: XSS test payloads insufficient (new attack vectors discovered)
  - **Impact**: Security vulnerability missed, re-test required
  - **Contingency**: Expand XSS payload library, run OWASP ZAP scan as supplement

---

## Follow-on Workflows (Manual)

- Run `*atdd` to generate failing P0 tests (separate workflow; not auto-run).
- Run `*automate` for broader coverage once implementation exists.

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: Date:
- [ ] Tech Lead: Date:
- [ ] QA Lead: Date:

**Comments:**

---

## Interworking & Regression

| Service/Component | Impact | Regression Scope |
|-------------------|--------|------------------|
| **Epic 1: Arweave Service** | File fetching from Arweave gateway | All Epic 1 Arweave integration tests must pass (fetchManifest, fetchFile, caching) |
| **Epic 2: Repository Detail Page** | File browser route extends repository detail route pattern | All Epic 2 repository detail tests must pass (routing, metadata, README rendering) |
| **Epic 2: Markdown Rendering** | Epic 3 Story 3.5 reuses react-markdown + remark-gfm patterns | All Epic 2 markdown rendering tests must pass (GFM features, XSS prevention) |

---

## Appendix

### Knowledge Base References

- `risk-governance.md` - Risk classification framework (probability × impact matrix, score ≥6 = CONCERNS)
- `probability-impact.md` - Risk scoring methodology (1-3 scale, 9 = BLOCK)
- `test-levels-framework.md` - Test level selection (unit vs integration vs E2E)
- `test-priorities-matrix.md` - P0-P3 prioritization (P0 = revenue/security/compliance)

### Related Documents

- PRD: `_bmad-output/planning-artifacts/prd/*.md`
- Epic: `_bmad-output/planning-artifacts/epics.md` (Epic 3 section)
- Architecture: `_bmad-output/planning-artifacts/architecture/feature-module-pattern.md`
- Tech Spec: `_bmad-output/planning-artifacts/architecture/` (Arweave service, Nostr service)

---

**Generated by**: BMAD TEA Agent - Test Architect Module
**Workflow**: `_bmad/tea/testarch/test-design`
**Version**: 6.0 (BMAD v6)
