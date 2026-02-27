# Claude Instructions for Rig Project

> **Context Reference:** For comprehensive project details (architecture, tech stack, implementation status, patterns, and conventions), see `/Users/jonathangreen/Documents/Rig/_bmad-output/project-context.md`. This file is auto-generated and contains all technical context. CLAUDE.md focuses exclusively on behavioral instructions and tool usage that are NOT covered in project-context.md.

---

## Core Behavioral Rules

### 1. Default UI Library: shadcn-ui v4

**MANDATORY:** For ANY UI component task, use shadcn-ui v4. This is not negotiable.

**Workflow (MUST follow this order):**
1. Call `mcp__shadcn-ui__get_component_demo` FIRST to see usage examples
2. Study the demo to understand proper implementation patterns
3. Only call `mcp__shadcn-ui__get_component` if deep customization is needed
4. After implementation, verify with Playwright MCP tools in browser

**Prohibited:**
- Using alternative UI libraries (Material-UI, Ant Design, Chakra UI, etc.) unless explicitly requested
- Writing custom components for functionality shadcn-ui provides
- Skipping the demo step (this causes implementation errors)

**Why this matters:**
- Ensures consistent design system (Tailwind CSS + Radix UI)
- Prevents accessibility regressions (built-in WCAG 2.1 AA compliance)
- Avoids duplicate code (components are reusable)
- Maintains TypeScript type safety

### 2. Browser Verification with Playwright MCP

**MANDATORY:** After implementing or modifying UI, verify in browser with Playwright MCP tools.

**When to use Playwright automatically:**
- UI component implementation or changes
- Form creation/modification
- Layout changes
- Accessibility verification
- Visual/behavioral debugging
- E2E test writing

**Workflow:**
1. Implement UI with shadcn-ui
2. Use `mcp__playwright__browser_navigate` to open page
3. Use `mcp__playwright__browser_snapshot` for accessibility inspection (prefer over screenshot)
4. Use `mcp__playwright__browser_click`, `type`, `fill_form` for interaction testing
5. Verify console messages and network requests if needed

**Key tools:**
- `browser_snapshot` - Accessibility snapshot (preferred for actions)
- `browser_take_screenshot` - Visual verification
- `browser_navigate` - Page navigation
- `browser_click`, `type`, `fill_form` - Interactions
- `browser_console_messages`, `network_requests` - Debugging

---

## shadcn-ui MCP Tool Usage

### Tool Workflow by Task Type

**For any UI component:**
1. `list_components` - If unsure which component to use
2. `get_component_demo` - ALWAYS call this first (required)
3. `get_component` - Only if customization needed
4. `get_component_metadata` - For dependency/props info

**For complete UI patterns (dashboard, login page, etc.):**
1. `list_blocks` - Browse available blocks (optionally filter by category)
2. `get_block` - Fetch complete block implementation
3. `get_component_demo` - For individual component customization

**For theme application:**
1. `list_themes` - Browse available TweakCN themes
2. `get_theme` - Preview theme details
3. `apply_theme` - Apply theme (use `dryRun: true` for preview)

### Critical: Demo-First Workflow

**This is the most important rule for shadcn-ui integration:**

```
ALWAYS: get_component_demo → study patterns → implement
NEVER: get_component → guess usage → debug errors
```

**Why demos are required:**
- Shows HOW and WHY to use the component (not just what it is)
- Reveals proper imports, props, event handlers, composition patterns
- Demonstrates edge cases and common scenarios
- Prevents API misuse that wastes time debugging

**Example (correct):**
```
User: "Add a dropdown menu to the header"

1. Call get_component_demo("dropdown-menu")
2. Review demo patterns (trigger, content, items, submenus)
3. Implement using demo patterns
4. Verify with Playwright
```

**Example (incorrect):**
```
User: "Add a dropdown menu"

1. Call get_component("dropdown-menu") ❌
2. Guess prop structure ❌
3. Implement incorrectly ❌
4. Debug for 30 minutes ❌
```

---

## Playwright MCP Behavioral Guidelines

### When to Use (Automatic)

Trigger Playwright usage when the user's request mentions:
- "UI", "interface", "component", "page", "form", "button", "layout"
- "test", "verify", "check", "debug", "inspect"
- "browser", "screenshot", "accessibility", "visual"
- "click", "type", "fill", "navigate", "interact"

### Workflow Patterns

**UI Development Workflow:**
```
1. Implement UI with shadcn-ui (demo-first workflow)
2. Navigate to page: browser_navigate("http://localhost:5173/path")
3. Snapshot for inspection: browser_snapshot()
4. Test interactions: browser_click(), browser_type(), etc.
5. Check console: browser_console_messages() if errors occur
6. Verify network: browser_network_requests() if data issues occur
```

**Debugging Workflow:**
```
1. Navigate to problematic page
2. Take snapshot to understand current state
3. Inspect console messages for errors
4. Check network requests for API issues
5. Evaluate JavaScript if needed: browser_evaluate()
```

**Accessibility Verification Workflow:**
```
1. Navigate to page
2. Take snapshot (includes ARIA tree, roles, labels)
3. Verify keyboard navigation: browser_press_key()
4. Check focus management
5. Validate screen reader announcements (from snapshot)
```

### Best Practices

**Prefer snapshots over screenshots:**
- Snapshots provide actionable accessibility tree
- Screenshots are visual only (less useful for interactions)
- Use screenshots for visual regression testing only

**Always clean up:**
- Playwright server manages lifecycle, but be mindful of resources
- Close browser when done with extended testing sessions

**Combine with unit tests:**
- Playwright for E2E and visual verification
- Vitest for component logic and hooks
- Don't replace unit tests with E2E tests

---

## Example Task Workflows

### Task: "Create a contact form"

```
1. Call get_component_demo("form") → understand form patterns
2. Call get_component_demo("input") → understand input variants
3. Call get_component_demo("button") → understand button states
4. Implement form using demo patterns (Zod validation, React Hook Form)
5. Navigate to page with browser_navigate()
6. Test form interactions with browser_fill_form()
7. Verify validation with browser_type() (invalid data)
8. Check console for errors
9. Verify success submission flow
```

### Task: "Build a settings page with tabs"

```
1. Call list_blocks(category: "settings") → check for pre-built blocks
2. If block exists: get_block() and adapt
3. If no block: get_component_demo("tabs") → understand tab patterns
4. Implement tabs with shadcn-ui components
5. Navigate and verify with browser_snapshot()
6. Test keyboard navigation (Tab, Arrow keys, Enter)
7. Verify ARIA attributes in snapshot
```

### Task: "Debug why button click isn't working"

```
1. Navigate to page with browser_navigate()
2. Take snapshot to see button state (enabled/disabled, ARIA)
3. Click button with browser_click()
4. Check console_messages() for JavaScript errors
5. Check network_requests() for failed API calls
6. Use browser_evaluate() to inspect button state/handlers if needed
7. Fix issue based on findings
```

### Task: "Apply a dark theme"

```
1. Call list_themes() → browse available themes
2. Call get_theme("theme-name") → preview theme
3. Call apply_theme(query: "dark", dryRun: true) → preview application
4. Review preview, then apply_theme(query: "dark", dryRun: false)
5. Verify with browser_take_screenshot() → visual verification
```

---

## Important Notes

**shadcn-ui v4 Specifics:**
- This project uses v4, which has different APIs than v0-v3
- Always use the MCP tools (they access v4 specifically)
- Don't reference v3 documentation or Stack Overflow answers

**Context7 Integration:**
- Context7 MCP available for library documentation queries
- Use for React, TypeScript, TanStack Query, Nostr, Arweave docs
- Always resolve library ID first with `resolve-library-id` before `query-docs`

**File Organization:**
- Follow feature module pattern: `src/features/{domain}/hooks/`, `components/`, `pages/`
- See project-context.md for detailed architecture patterns
- Co-locate tests with implementation files

**Testing Requirements:**
- Write tests for all new features (Vitest + Playwright)
- Target 80% coverage (will be enforced when coverage reporting is configured)
- See project-context.md for test pyramid strategy

**Security:**
- Never use `dangerouslySetInnerHTML`
- Never add `rehype-raw` to markdown rendering
- Always verify Nostr event signatures
- See project-context.md for full security posture

---

## When in Doubt

1. **Check project-context.md first** - Contains all technical context, patterns, conventions
2. **Call get_component_demo** - For any UI task, start with the demo
3. **Verify in browser** - Use Playwright MCP after UI changes
4. **Ask the user** - If unclear about requirements or approach

---

**Last Updated:** 2026-02-27 (Epic 2 complete)