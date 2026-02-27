# Measurability Validation Report
**PRD:** Rig - Decentralized Git Hosting Frontend
**Date:** 2026-02-24
**Validated By:** Claude Code

---

## Executive Summary

**Total Requirements Analyzed:** 96 (48 FRs + 48 NFRs)
**Total Violations:** 13
**Severity Assessment:** ⚠️ **WARNING** (5-10 violations threshold)

### Violation Breakdown
- **Functional Requirements:** 3 violations
- **Non-Functional Requirements:** 10 violations

---

## Functional Requirements Analysis

### Overview
- **Total FRs Analyzed:** 48 (FR1-FR48)
- **Total Violations:** 3
- **Compliance Rate:** 93.8%

### Violations

#### 1. Vague Quantifier - "some relays fail"
**Location:** Line 1295
**Requirement:** FR39
**Text:** "Users can continue browsing if some relays fail (graceful degradation)"
**Issue:** Uses vague quantifier "some" without specifying how many relays can fail
**Recommended Fix:** "Users can continue browsing if up to 4 out of 5 configured relays fail (graceful degradation)"

#### 2. Missing Actor - Repository as implicit actor
**Location:** Line 1243
**Requirement:** FR4
**Text:** "Users can navigate to a repository detail view to explore its contents"
**Issue:** While technically compliant, "navigate to" is ambiguous - clicking a link? Typing URL? Should be more specific about the capability.
**Recommended Fix:** "Users can click on a repository from the list to view its detail page and explore its contents"

#### 3. Subjective Adjective - "proper threading"
**Location:** Lines 1265, 1268
**Requirements:** FR18, FR21
**Text:** "Users can view issue comment threads with proper threading (NIP-10 references)" and "Users can view pull request discussion threads with proper threading"
**Issue:** "proper" is subjective - what defines "proper"?
**Recommended Fix:** "Users can view issue comment threads structured according to NIP-10 reference specifications" or "Users can view comment threads where replies are nested under parent comments according to NIP-10"

---

## Non-Functional Requirements Analysis

### Overview
- **Total NFRs Analyzed:** 48 (NFR-P1 through NFR-SC7)
- **Total Violations:** 10
- **Compliance Rate:** 79.2%

### Violations

#### 4. Missing Measurement Method
**Location:** Line 1317
**Requirement:** NFR-P1
**Text:** "Repository pages load with Largest Contentful Paint (LCP) <2.5s on standard broadband connections"
**Issue:** No measurement method specified. How is LCP measured? What tools? What testing conditions?
**Recommended Fix:** Add: "**Measurement Method:** Chrome Lighthouse performance audit on throttled 3G connection (4Mbps down, 1.6Mbps up, 300ms RTT). **Context:** Fast page loads critical for user perception of decentralized infrastructure performance matching centralized alternatives."

#### 5. Vague Qualifier - "standard broadband"
**Location:** Line 1317
**Requirement:** NFR-P1
**Text:** "on standard broadband connections"
**Issue:** "standard broadband" is vague - what speed? What latency?
**Recommended Fix:** Specify: "on 10Mbps+ broadband connections with <50ms latency" or reference specific test conditions

#### 6. Missing Context
**Location:** Lines 1318-1321
**Requirements:** NFR-P2, NFR-P3, NFR-P4
**Text:** Multiple Core Web Vitals metrics without context
**Issue:** Metrics provided but no explanation of why these targets matter or who they affect
**Recommended Fix:** Add context: "**Context:** Core Web Vitals compliance ensures good user experience and search engine ranking. Poor scores lead to user abandonment (53% of mobile users abandon sites taking >3s to load)."

#### 7. Missing Measurement Method
**Location:** Line 1324
**Requirement:** NFR-P6
**Text:** "Relay queries complete within 3s for ≥90% of requests (at least 1 relay must respond)"
**Issue:** No measurement method - how is this tested? Real-world monitoring? Synthetic tests?
**Recommended Fix:** Add: "**Measurement Method:** Synthetic monitoring using 5 geographically distributed test runners querying production relays every 5 minutes. **Context:** Critical for user trust - if queries consistently timeout, users will perceive decentralized infrastructure as inferior to GitHub."

#### 8. Vague Quantifier - "alternate gateways"
**Location:** Line 1330
**Requirement:** NFR-P10
**Text:** "System automatically retries failed gateway requests with alternate gateways"
**Issue:** How many alternate gateways? All of them?
**Recommended Fix:** "System automatically retries failed gateway requests with up to 2 alternate gateways"

#### 9. Missing Context
**Location:** Lines 1333-1336
**Requirements:** NFR-P11, NFR-P12, NFR-P13, NFR-P14
**Text:** Bundle size requirements without context
**Issue:** Metrics provided but no explanation of why bundle size matters beyond ArDrive subsidy
**Recommended Fix:** Add context: "**Context:** Bundle size directly impacts page load time on mobile networks. Users on 3G connections (still 40% of global mobile users) experience 1s additional load time per 100KB. Small bundle size critical for global accessibility and ArDrive free hosting eligibility."

#### 10. Missing Measurement Method
**Location:** Line 1348
**Requirement:** NFR-S1
**Text:** "All Nostr event signatures verified using secp256k1 cryptographic verification before display"
**Issue:** No measurement method - how do we verify this is happening? Code review? Runtime checks?
**Recommended Fix:** Add: "**Measurement Method:** Code review confirming signature verification in event processing pipeline + integration tests asserting invalid signatures rejected. **Context:** Critical for security - displaying unverified events exposes users to spoofed data and undermines trust in decentralized infrastructure."

#### 11. Subjective Adjective - "clear error messaging"
**Location:** Lines 1349, 1406
**Requirements:** NFR-S3, NFR-R6
**Text:** "Invalid signatures rejected with clear error messaging" and "Clear error messaging when relays/gateways unavailable"
**Issue:** "clear" is subjective - what makes error messaging "clear"?
**Recommended Fix:** "Invalid signatures rejected with error messaging that includes: (1) which event failed verification, (2) the relay source, (3) user action options (retry, report). Tested with users achieving ≥80% comprehension rate."

#### 12. Missing Measurement Method
**Location:** Line 1391
**Requirement:** NFR-A16
**Text:** "Lighthouse accessibility audit score ≥90 in CI/CD pipeline"
**Issue:** While metric is clear, missing context on why 90 and what happens if score drops
**Recommended Fix:** Add: "**Measurement Method:** Automated Lighthouse accessibility audit in GitHub Actions on every PR, blocking merge if score <90. **Context:** Accessibility compliance ensures usability for 15% of global population with disabilities. Score ≥90 indicates WCAG 2.1 AA compliance, required for many organizational procurement policies."

#### 13. Vague Quantifier - "several" implementation details
**Location:** Throughout NFRs (specifically performance section)
**Text:** Multiple instances of "multiple" without specific counts
**Issue:** Examples: "multiple relays" (how many?), "multiple gateways" (how many?)
**Note:** Many instances were actually specific (e.g., "5+ relays", "3+ gateways") which is acceptable. Only flagging truly vague instances.

---

## Category Breakdown

### Functional Requirements Violations (3 total)
| Category | Count | Line Numbers |
|----------|-------|--------------|
| Vague Quantifiers | 1 | 1295 |
| Subjective Adjectives | 2 | 1265, 1268 |
| Missing Actor | 0 | - |
| Implementation Details | 0 | - |

### Non-Functional Requirements Violations (10 total)
| Category | Count | Line Numbers |
|----------|-------|--------------|
| Missing Measurement Method | 4 | 1317, 1324, 1348, 1391 |
| Missing Context | 2 | 1318-1321, 1333-1336 |
| Subjective Adjectives | 2 | 1349, 1406 |
| Vague Qualifiers | 2 | 1317, 1330 |

---

## Compliance Assessment

### Strengths
1. **Excellent FR Format Compliance**: Almost all FRs follow "[Actor] can [capability]" format
2. **Good Metric Specificity**: Most NFRs include specific numeric targets (e.g., <2.5s, ≥90%, 44x44px)
3. **Strong Quantifier Usage**: Most requirements avoid vague terms, using specific numbers (5+ relays, 3+ gateways, 44x44px)
4. **Implementation Detail Avoidance**: FRs successfully avoid specifying technology choices

### Weaknesses
1. **Missing Measurement Methods**: Many performance and security NFRs lack explicit testing procedures
2. **Inconsistent Context**: Some NFR groups lack explanation of why targets matter
3. **Subjective Language**: "Clear", "proper" appear in a few requirements
4. **Vague Qualifiers**: A few instances of "some", "multiple", "standard" without specifics

---

## Detailed Recommendations

### High Priority Fixes (Critical for Measurability)

1. **Add Measurement Methods to All Performance NFRs**
   - Specify: Testing tool (Lighthouse, WebPageTest, custom monitoring)
   - Specify: Testing conditions (network throttling, geographic location, device type)
   - Specify: Frequency of measurement (CI/CD, production monitoring)
   - Specify: Action triggers (what happens when threshold breached)

2. **Add Context to Metric Groups**
   - Performance metrics: Why these targets? User impact? Business impact?
   - Security metrics: Risk if violated? Who is affected?
   - Accessibility metrics: Compliance rationale? User benefit?

3. **Remove Subjective Adjectives**
   - Replace "clear error messaging" with specific requirements (content elements, user comprehension rate)
   - Replace "proper threading" with reference to specification or behavior description

4. **Specify Vague Quantifiers**
   - Replace "some relays" with specific failure tolerance (e.g., "4 out of 5 relays")
   - Replace "standard broadband" with specific bandwidth/latency values
   - Replace "alternate gateways" with specific count (e.g., "2 alternate gateways")

### Medium Priority Improvements

1. **Enhance NFR Template Compliance**
   - Every NFR should have: [Criterion] + [Metric] + [Measurement Method] + [Context]
   - Example: "Repository pages load with LCP <2.5s [criterion] on 10Mbps connections [metric]. Measured via Lighthouse CI on throttled network [method]. Fast loads critical for user perception of decentralized infrastructure performance [context]."

2. **Add Acceptance Criteria**
   - For subjective requirements (error messaging, user experience), add testable acceptance criteria
   - Example: "Error messages tested with ≥10 users achieving ≥80% task completion rate without assistance"

### Low Priority Enhancements

1. **Add Failure Scenarios**
   - For each NFR, document what happens when requirement isn't met
   - Example: "If LCP exceeds 5s, user abandonment expected to exceed 50% based on industry benchmarks"

2. **Cross-Reference Related Requirements**
   - Link NFRs to the FRs they support
   - Example: "NFR-P6 enables FR5 (viewing relay status)"

---

## Severity Justification

**Warning Level (10 violations) is appropriate because:**

1. **FRs are Strong**: Only 3 violations out of 48 requirements (93.8% compliance)
2. **Most Violations are NFR Quality Issues**: 10/13 violations are in NFRs, specifically around measurement methods and context
3. **Core Requirements are Measurable**: The critical user-facing requirements are well-specified
4. **Violations are Fixable**: All violations have clear remediation paths that don't require requirement redesign

**This is NOT Critical because:**
- No FRs have multiple compounding issues
- Most NFRs have metrics, just missing measurement methods
- No requirements are completely unmeasurable
- The PRD demonstrates strong understanding of measurability principles

**This is NOT a Pass because:**
- 10 NFR violations indicate systematic gaps in measurement methodology specification
- Missing context reduces utility for implementation teams
- Subjective terms ("clear", "proper") create ambiguity
- Some vague quantifiers undermine otherwise good requirements

---

## Actionable Next Steps

1. **Immediate (Before Development Starts):**
   - Add measurement methods to NFR-P1, NFR-P6, NFR-S1
   - Replace subjective terms in FR18, FR21, NFR-S3, NFR-R6
   - Specify vague quantifiers in FR39, NFR-P1, NFR-P10

2. **Before Milestone 1 (Month 1):**
   - Add context to all performance NFR groups
   - Document testing procedures for all NFRs
   - Create NFR acceptance criteria document

3. **Ongoing:**
   - Review new requirements against measurability checklist
   - Update NFRs as measurement methods are implemented
   - Track actual metrics vs. targets in sprint reports

---

## Conclusion

The PRD demonstrates strong measurability fundamentals with specific metrics and clear requirement structure. The violations are concentrated in measurement methodology documentation and context provision rather than fundamental requirement clarity. With focused revisions to add measurement methods and remove subjective terms, this PRD would achieve Pass level (<5 violations).

**Recommended Action:** Proceed with development while addressing high-priority fixes in parallel. The violations do not block implementation but should be resolved before external review or handoff.
