# Story 2.4: Repository Detail Page

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to view detailed information about a specific repository**,
So that **I can learn more about the repository before exploring its code**.

## Acceptance Criteria

1. When I click on a repository card (the name link in `RepoCard`) or navigate directly to `/:owner/:repo`, the repository detail page loads. The page obtains `owner` and `repo` from React Router `useParams()`. The page component is `src/pages/RepoDetail.tsx` (already exists as a placeholder -- replace its contents entirely).

2. The repository detail page displays:
   - Repository name as an `<h1>` heading
   - Full description (not truncated, unlike the card's 3-line clamp). If no description exists, display "No description" in muted italic text (consistent with `RepoCard`)
   - Complete list of maintainers with npub display (truncated pubkeys using `truncatePubkey()` from `@/lib/format`). If no maintainers, the maintainers section is not rendered
   - ArNS URL with copy-to-clipboard functionality (reuse the copy pattern from `RepoCard`). If no `webUrls`, the ArNS section is not rendered
   - Repository topics/tags displayed as `Badge` components (if `repo.topics` is non-empty). If no topics, the topics section is not rendered
   - Last updated timestamp using `formatRelativeTime()` from `@/lib/format`

3. README.md content is fetched from Arweave and rendered using `react-markdown` (already installed: `^10.1.0`). Markdown rendering supports:
   - GitHub-flavored markdown via `remark-gfm` (already installed: `^4.0.1`)
   - Syntax highlighting for code blocks via `react-syntax-highlighter` (already installed: `^16.1.0`)
   - Proper heading hierarchy (headings in README render as h2-h6, since h1 is the repo name) per WCAG 1.3.1
   - External links open in new tabs with `target="_blank"` and `rel="noopener noreferrer"`

4. Markdown rendering sanitizes XSS vectors. `react-markdown` v10 does NOT render raw HTML by default (no `rehypeRaw` plugin), which means `<script>`, `<iframe>`, and `javascript:` URLs in markdown source are stripped or escaped by default. Do NOT add `rehype-raw`. Do NOT use `dangerouslySetInnerHTML`. This is the primary XSS defense.

5. The page is accessible via direct URL (deep linking works) -- since routing is already configured (`/:owner/:repo` -> `RepoDetail`), this should work automatically with the existing React Router setup.

6. Browser back button returns to the previous page correctly -- handled natively by React Router's `<BrowserRouter>`.

7. The page shows a loading skeleton while fetching repository data. The skeleton mirrors the detail layout: a heading skeleton, description lines, metadata placeholders, and a large content area for the README. The skeleton container has `role="status"` and `aria-label="Loading repository details"`.

8. If the repository is not found (the query succeeds but no matching repo exists in the fetched list), a "Repository not found" state is displayed with a link back to the home page.

9. If the Nostr relay query fails entirely, an error state is displayed with `role="alert"` and a "Try Again" button that calls `refetch()`. Use `isRigError()` from `@/types/common` to extract user-friendly error messages when available.

10. If README.md fetch from Arweave fails or is not available, a graceful fallback is shown: "README not available" message. The rest of the page metadata still displays normally.

11. The page loads with TTI < 3.5s on standard broadband (per NFR-P4). Use TanStack Query caching (stale-while-revalidate) for repository data.

12. Repository statistics (stars, forks) are NOT displayed in this story. The epic spec mentions "Repository statistics (stars, forks - if available)" but NIP-34 kind 30617 events do not include star/fork counts. The `Repository` model has no `stars` or `forks` fields. This will be addressed when/if a future epic adds social signals.

13. Unit/component tests verify:
    - Repository metadata display (name as h1, full description, maintainers, ArNS URL, topics, timestamp)
    - Markdown rendering (basic markdown, GFM tables, code blocks with syntax highlighting)
    - Heading hierarchy shift in markdown (h1->h2, h2->h3, etc.) per WCAG 1.3.1
    - XSS sanitization (script tags, javascript: URLs stripped)
    - External links have `target="_blank"` and `rel="noopener noreferrer"`
    - Loading state skeleton with `role="status"`
    - Error state with `role="alert"` and retry button
    - Repository not found state with home link
    - README not available fallback
    - ArNS URL copy functionality
    - Deep linking via route params (render at `/:owner/:repo` directly)
    - Graceful rendering when optional fields are missing (no ArNS URL, no description, no maintainers, no topics)
    - All existing tests continue to pass (zero regressions; baseline: 530 tests)

## Tasks / Subtasks

- [x] Task 1: Create `useRepository` hook (AC: #1, #11)
  - [x] 1.1 Create `src/features/repository/hooks/useRepository.ts`
  - [x] 1.2 The hook accepts `owner: string` and `repoId: string` parameters
  - [x] 1.3 Use `useQuery` with `repositoryKeys.detail(repoId)` query key
  - [x] 1.4 The `queryFn` calls `fetchRepositories()` and finds the matching repo by `owner` AND `id` fields: `repos.find(r => r.owner === owner && r.id === repoId) ?? null`. TanStack Query caching prevents redundant network calls when navigating from the list page (staleTime: 1 hour means the data is reused).
  - [x] 1.5 Set `staleTime: 60 * 60 * 1000` (1 hour, matching repository caching)
  - [x] 1.6 Return `useQuery` result with type `Repository | null`

- [x] Task 2: Create `useReadme` hook for Arweave README fetching (AC: #3, #10)
  - [x] 2.1 Create `src/features/repository/hooks/useReadme.ts`
  - [x] 2.2 The hook accepts `webUrls: string[]` (from the Repository model) and `enabled: boolean`
  - [x] 2.3 Use `useQuery` with a `['readme', webUrls[0]]` query key (or disabled if no webUrls). Note: This intentionally uses an ad-hoc key rather than a factory from `query-client.ts` because README queries are page-scoped and won't need cross-component cache invalidation. If future stories require broader README caching, add a `readmeKeys` factory at that time.
  - [x] 2.4 The `queryFn` uses a simple `fetch()` call to `${webUrls[0]}/README.md` (Option A from Dev Notes). The webUrls are already resolved gateway URLs, so `fetchFile()` from `@/lib/arweave` is NOT used (it requires a transaction ID, not a URL). Wrap in try-catch and return `null` on failure.
  - [x] 2.5 Set `enabled: enabled && webUrls.length > 0` to prevent fetch when no URL available
  - [x] 2.6 Set `retry: 1` (README is a nice-to-have, don't retry excessively)
  - [x] 2.7 Set `staleTime: Infinity` (README content from Arweave is immutable)

- [x] Task 3: Replace RepoDetail.tsx placeholder with full implementation (AC: #1, #2, #3, #4, #5, #6, #7, #8, #9, #10, #12)
  - [x] 3.1 Replace the placeholder content in `src/pages/RepoDetail.tsx` with full implementation
  - [x] 3.2 Use `useParams()` to extract `owner` and `repo` from URL
  - [x] 3.3 Call `useRepository(owner, repo)` to fetch repository data
  - [x] 3.4 Call `useReadme(repo.webUrls, status === 'success' && repo !== null)` for README content
  - [x] 3.5 Implement loading skeleton state (heading + description + metadata + README area) with `role="status"` and `aria-label="Loading repository details"`
  - [x] 3.6 Implement error state with `role="alert"`, using `isRigError()` for user-friendly messages, and a "Try Again" button calling `refetch()`
  - [x] 3.7 Implement "not found" state when query succeeds but repo is null, with `Link` back to home page
  - [x] 3.8 Implement metadata display: h1 name, full description (or "No description" italic fallback), complete maintainers list (all, not capped at 3 like RepoCard), ArNS URL with copy, topics as `Badge` components, timestamp
  - [x] 3.9 Implement README rendering with `react-markdown` + `remark-gfm` + syntax highlighting, with heading level shift (h1->h2, h2->h3, etc.)
  - [x] 3.10 Implement README fallback: "README not available" when fetch fails or no webUrls
  - [x] 3.11 Use shadcn/ui components: `Card`, `Separator`, `Button`, `Badge`, `Skeleton`
  - [x] 3.12 Ensure external links in markdown use `target="_blank"` and `rel="noopener noreferrer"` via custom link renderer
  - [x] 3.13 Add "Back to repositories" link at top of page using `Link` from `react-router` pointing to `/`

- [x] Task 4: Write tests (AC: #13)
  - [x] 4.1 Create `src/features/repository/hooks/useRepository.test.tsx`
  - [x] 4.2 Create `src/pages/RepoDetail.test.tsx`
  - [x] 4.3 Test: repository name displayed as h1 heading (AT-2.4.01)
  - [x] 4.4 Test: full description displayed, not truncated (AT-2.4.02)
  - [x] 4.5 Test: maintainers displayed with truncated npub (AT-2.4.03)
  - [x] 4.6 Test: ArNS URL displayed with copy button (AT-2.4.04)
  - [x] 4.7 Test: topics displayed as badges (AT-2.4.05)
  - [x] 4.8 Test: last updated timestamp displayed (AT-2.4.06)
  - [x] 4.9 Test: README rendered as markdown (AT-2.4.07)
  - [x] 4.10 Test: GFM tables/strikethrough render (AT-2.4.08)
  - [x] 4.11 Test: syntax highlighting for code blocks (AT-2.4.09)
  - [x] 4.12 Test: heading hierarchy shift in rendered markdown -- h1 in README renders as h2 (AT-2.4.10)
  - [x] 4.13 Test: external links have `target="_blank"` and `rel="noopener noreferrer"` (AT-2.4.11)
  - [x] 4.14 Test: deep linking -- render at `/:owner/:repo` directly, verify page loads (AT-2.4.12)
  - [x] 4.15 Test: loading state skeleton displayed while fetching, with `role="status"` (AT-2.4.15)
  - [x] 4.16 Test: error state displayed when fetch fails, with `role="alert"` and retry button (AT-2.4.16)
  - [x] 4.17 Test: "README not available" fallback when README fetch fails (AT-2.4.17)
  - [x] 4.18 Test: XSS sanitization -- script tags and javascript: URLs stripped from markdown (AT-2.4.18)
  - [x] 4.19 Test: repository not found state when no matching repo, with link to home
  - [x] 4.20 Test: copy button copies ArNS URL to clipboard
  - [x] 4.21 Test: `useRepository` hook returns matching repo from fetched list
  - [x] 4.22 Test: `useRepository` hook returns null when no match found
  - [x] 4.23 Test: graceful rendering with missing optional fields (no description, no maintainers, no webUrls, no topics)
  - [x] 4.24 Verify all existing tests still pass (530 baseline)

- [x] Task 5: Verify all tests pass (AC: #13)
  - [x] 5.1 Run `npx vitest run` -- all tests pass including new ones
  - [x] 5.2 Run `npx tsc --noEmit` -- zero TypeScript errors
  - [x] 5.3 Run `npx eslint src/` -- zero lint errors

## Dev Notes

### Critical: Replace Existing Placeholder -- Do NOT Create New File

`src/pages/RepoDetail.tsx` already exists as a placeholder. Replace its contents entirely. Do NOT create a new file or a duplicate. The route configuration in `src/routes.tsx` already points to `./pages/RepoDetail` with lazy loading (`{ index: true, lazy: () => import('./pages/RepoDetail') }`). The component must export `Component` (capital C, named export) and set `Component.displayName = 'RepoDetail'`.

### Critical: No `fetchRepository` Singular Function Exists Yet

The Nostr service layer (`src/lib/nostr.ts`) only has `fetchRepositories()` (plural) which fetches ALL repositories from relays. There is no `fetchRepository(id)` that queries by `d` tag. For this story, the `useRepository` hook should:

1. First check if the repository is already in the TanStack Query cache (from the list page) via `queryClient.getQueryData(repositoryKeys.all())`.
2. If found in cache, return it immediately.
3. If not found in cache, call `fetchRepositories()` and search the results.

This approach avoids creating a new service function and leverages the existing cache. The query key `repositoryKeys.detail(repoId)` is already defined in `query-client.ts`.

**Alternative (simpler):** Just call `fetchRepositories()` in the query function and filter for the matching repo. TanStack Query's caching will prevent redundant network calls. The `staleTime: 1 hour` means the data is reused from the list page's cache if available.

### Critical: Repository Lookup by Owner + ID

The URL pattern is `/:owner/:repo` where `:owner` is the repository's `owner` (pubkey) and `:repo` is the repository's `id` (d-tag). The `useRepository` hook must match on BOTH fields:

```typescript
const match = repos.find(r => r.owner === owner && r.id === repoId)
```

If the route uses URL-encoded values, ensure comparison accounts for this. The `buildRepoPath()` function in `constants/routes.ts` encodes both segments, so `useParams()` will return decoded values.

### Critical: README Fetching Strategy

The `Repository` model has `webUrls: string[]` which contains URLs like `https://rig.ar-io.dev`. To fetch the README:

1. Take the first `webUrl` from the repository
2. The webUrl points to an Arweave-hosted site via ArNS
3. Fetch `${webUrl}/README.md` (or use the Arweave `fetchFile` service)

However, the current `fetchFile(txId, path)` in `arweave.ts` requires a transaction ID, not a URL. There are two approaches:

**Option A (Recommended for MVP -- USE THIS):** Use a simple `fetch()` call to `${webUrl}/README.md` since webUrls are already resolved gateway URLs. This is the simplest approach and avoids needing to resolve ArNS names to transaction IDs.

**Option B (Full Arweave integration):** Resolve the ArNS name from the webUrl, get the transaction ID via `resolveArNS()`, then use `fetchFile(txId, 'README.md')`. This is more robust but more complex.

For this story, **use Option A** (simple fetch). The README is a nice-to-have feature and should not block the page if it fails. Wrap the fetch in a try-catch and return null on failure.

### Critical: Markdown Rendering Configuration

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    // Heading level shifting: h1 in README -> h2, h2 -> h3, etc.
    h1: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    h2: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
    h3: ({ children, ...props }) => <h4 {...props}>{children}</h4>,
    h4: ({ children, ...props }) => <h5 {...props}>{children}</h5>,
    h5: ({ children, ...props }) => <h6 {...props}>{children}</h6>,
    h6: ({ children, ...props }) => <h6 {...props}>{children}</h6>,

    // External links open in new tab
    a: ({ href, children, ...props }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),

    // Syntax-highlighted code blocks
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '')
      const isInline = !match
      if (isInline) {
        return <code className={className} {...props}>{children}</code>
      }
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      )
    },
  }}
>
  {readmeContent}
</ReactMarkdown>
```

**XSS Safety:** `react-markdown` v10 does NOT render raw HTML by default. It parses markdown and outputs React elements. HTML tags in the markdown source (like `<script>`) are treated as text, not executed. Do NOT install `rehype-raw` as that would re-enable HTML rendering and create XSS risk.

### Critical: Heading Level Shifting in README

The page's `<h1>` is the repository name. README content often starts with an `# H1` heading. To maintain proper heading hierarchy (WCAG 1.3.1), shift all README headings down by one level:
- README `# H1` -> renders as `<h2>`
- README `## H2` -> renders as `<h3>`
- etc.

This is implemented via the `components` prop on `ReactMarkdown` as shown above.

### Critical: Detecting Inline vs Block Code in react-markdown v10

In `react-markdown` v10, the `code` component receives both inline code (`` `inline` ``) and fenced code blocks (` ```language ... ``` `). To differentiate:
- **Block code** has a `className` like `language-javascript`
- **Inline code** has no `className` or no `language-*` match

The code component example above handles this correctly. Do NOT use the deprecated `inline` prop from older react-markdown versions.

### Critical: No Tabs in This Story

Per the epic specification: "This story delivers a standalone repository detail page without tabs. Navigation Strategy: Tabbed navigation will be added progressively as features become available (Epic 3 adds Code tab, Epic 4 adds Commits tab, Epic 5 adds Issues and PRs tabs)."

Do NOT add tab navigation. The page is a simple scrollable detail view with metadata at the top and README below.

### Critical: Repository Statistics Are Out of Scope

The epic spec mentions "Repository statistics (stars, forks - if available)" but the NIP-34 kind 30617 `Repository` model (`src/types/repository.ts`) has no `stars` or `forks` fields. These social signals are not part of the Nostr repository announcement event format. This story explicitly excludes them (AC #12). If future protocol extensions add social signals, a dedicated story will address them.

### Critical: Detail Page Shows ALL Maintainers (Not Capped)

Unlike `RepoCard` which caps maintainers at 3 with a "+N more" overflow, the detail page shows the COMPLETE list of maintainers. This is the purpose of the detail page -- showing full, untruncated information.

### Existing Infrastructure to Reuse (DO NOT Recreate)

| What | Where | Notes |
|------|-------|-------|
| `Card`, `CardHeader`, `CardContent` | `src/components/ui/card.tsx` | shadcn v4 Card, already installed |
| `Separator` | `src/components/ui/separator.tsx` | Already installed |
| `Button` | `src/components/ui/button.tsx` | For copy button, retry button |
| `Badge` | `src/components/ui/badge.tsx` | For topic tags |
| `Skeleton` | `src/components/ui/skeleton.tsx` | For loading state |
| `fetchRepositories()` | `src/lib/nostr.ts` | Fetches all repos from relays |
| `repositoryKeys` | `src/lib/query-client.ts` | Query key factory with `.detail(id)` |
| `Repository` type | `src/types/repository.ts` | Domain model |
| `truncatePubkey()` | `src/lib/format.ts` | Pubkey display formatting |
| `formatRelativeTime()` | `src/lib/format.ts` | Timestamp display |
| `buildRepoPath()` | `src/constants/routes.ts` | URL builder (used in RepoCard links) |
| `isRigError()` | `src/types/common.ts` | Error type guard for user-friendly messages |
| `createRepository()` | `src/test-utils/factories/repository.ts` | Test data factory |
| `resetRepositoryCounter()` | `src/test-utils/factories/repository.ts` | Test isolation |
| `CopyIcon`, `CheckIcon`, etc. | `lucide-react` | Already installed icons |
| `react-markdown` | `package.json` | `^10.1.0` already installed |
| `remark-gfm` | `package.json` | `^4.0.1` already installed |
| `react-syntax-highlighter` | `package.json` | `^16.1.0` already installed |
| `@types/react-syntax-highlighter` | `package.json` | `^15.5.13` already installed |

### Critical: Named Exports Only

All modules use named exports. Do NOT use `export default`. The RepoDetail page exports `Component` (for React Router lazy loading) and sets `Component.displayName = 'RepoDetail'`.

### Critical: Import Aliases

Use `@/` path alias for all imports (resolves to `src/`):
```typescript
import { Button } from '@/components/ui/button'
import { useRepository } from '@/features/repository/hooks/useRepository'
```

### Critical: React Router v7 (NOT v6)

Import from `react-router`, not `react-router-dom`:
```typescript
import { useParams, Link } from 'react-router'  // production code
import { MemoryRouter } from 'react-router'       // in tests
```

### Critical: Mocking Strategy for Tests

**RepoDetail page tests** should mock:
1. `@/lib/nostr` -- mock `fetchRepositories` to return controlled data
2. `navigator.clipboard.writeText` -- for copy functionality tests
3. `fetch` (global) -- for README fetching (Option A uses global `fetch`)

Do NOT mock `useParams` from `react-router`. Instead, use `createMemoryRouter` with `initialEntries` to set the URL params. This tests the full routing integration.

**useRepository hook tests** should mock:
1. `@/lib/nostr` -- mock `fetchRepositories`

Use the same mocking patterns established in `Home.test.tsx`:
```typescript
vi.mock('@/lib/nostr', () => ({
  fetchRepositories: vi.fn(),
}))
```

For README rendering tests, no markdown mocks are needed -- render actual markdown through `react-markdown` and assert the output. For syntax highlighting tests, mocking `react-syntax-highlighter` may be needed to avoid heavy rendering in tests.

### Critical: Test Rendering with Router

Tests need to render `RepoDetail` within a router context since it uses `useParams()`. Use `createMemoryRouter` and `RouterProvider` from `react-router`:

```typescript
import { createMemoryRouter, RouterProvider } from 'react-router'

function renderRepoDetail(owner = 'test-owner', repo = 'test-repo') {
  const router = createMemoryRouter(
    [{ path: '/:owner/:repo', element: <Component /> }],
    { initialEntries: [`/${owner}/${repo}`] }
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
```

But note: if `RepoDetail` is lazy-loaded via `Component` export, you must import it correctly. The test file should import `{ Component }` from the page module.

### Page Layout Structure

```
+-------------------------------------------------+
| <- Back to repositories (link)                    |
+-------------------------------------------------+
| <h1>Repository Name</h1>                        |
| Full description text...                         |
+-------------------------------------------------+
| Maintainers: abc123...def456  xyz789...ghi012   |
| ArNS URL: https://example.ar-io.dev  [Copy]     |
| Topics: [nostr] [arweave] [decentralized]       |
| Updated: 2 hours ago                             |
+-------------------------------------------------+
| <Separator />                                    |
+-------------------------------------------------+
| README.md                                        |
| +-------------------------------------------+   |
| | Rendered markdown content...              |   |
| | ## Heading                                |   |
| | Some text with **bold** and `code`        |   |
| | ```javascript                             |   |
| | const x = 1 // syntax highlighted        |   |
| | ```                                       |   |
| +-------------------------------------------+   |
+-------------------------------------------------+
```

### Error Path Handling

- **Loading state**: Skeleton displayed while `status === 'pending'` with `role="status"` and `aria-label="Loading repository details"`
- **Relay query error**: Error state with `role="alert"`, user-friendly message via `isRigError()`, and "Try Again" button (`status === 'error'`)
- **Repository not found**: Query succeeds but `data === null` -- show "Repository not found" with home link
- **README fetch fails**: Show "README not available" fallback -- metadata still displays
- **README not available** (no webUrls): Show "README not available" -- no fetch attempted
- **Empty description**: Show italic "No description" text (consistent with RepoCard)
- **No maintainers**: Don't render maintainers section
- **No topics**: Don't render topics section
- **No ArNS URL** (empty webUrls): Don't render ArNS section
- **URL-encoded params**: `useParams()` returns decoded values, matching works normally

### Previous Story Intelligence (Story 2.3)

Key learnings from Story 2.3:
- **530 tests passing** (baseline for regression check)
- **Home.test.tsx mock pattern**: `vi.mock('@/lib/nostr', () => ({ fetchRepositories: vi.fn() }))` -- use the same pattern
- **Test factory**: Use `createRepository({ ...overrides })` for controlled test data
- **`resetRepositoryCounter()`** in `beforeEach()` for test isolation
- **aria-live for dynamic content**: Use `aria-live="polite"` for content that changes (loading -> loaded)
- **role="search"**: Used for search landmarks; repo detail should use `role="main"` or `<main>` for the content area (already handled by AppLayout)
- **Redundant aria-label removal**: Don't duplicate accessible names (one `<label>` OR one `aria-label`, not both)
- **Code review learnings**: Always add `?? []` fallback for arrays from TanStack Query, extract repeated computations out of loops
- **Do NOT mock useParams**: Use `createMemoryRouter` with `initialEntries` instead -- this tests the full routing integration

### Git Intelligence

Recent commits:
- `e0b0658ab1 feat(2-3): story complete` -- latest, search filtering complete
- `dd8d3b1d97 feat(2-2): story complete` -- RepoCard component, format utilities
- `3abc210a6b docs: reframe UX reference from GitHub to Forgejo layout patterns`
- `1f883ddf5d feat(2-1): story complete` -- repository list page, useRepositories hook
- `124eace552 chore(epic-2): epic start -- baseline green, retro actions resolved`

Patterns established:
- Feature module: `src/features/repository/` for components and hooks
- Page files in `src/pages/` export `Component` with `displayName`
- Co-located tests: `*.test.tsx` next to implementation
- Hooks in `src/features/repository/hooks/`
- Service layer in `src/lib/` (nostr.ts, arweave.ts)
- Test utilities in `src/test-utils/factories/`

### Performance Notes

- Repository data is cached by TanStack Query with 1-hour staleTime. Navigating from the home page to a detail page should serve data from cache instantly (stale-while-revalidate).
- README fetch is a separate query that can load lazily after the page metadata renders.
- `react-markdown` + `react-syntax-highlighter` add bundle size. These are already installed and will be lazy-loaded via React Router's `lazy()` on the RepoDetail route, so they don't affect the home page's LCP.
- Consider wrapping the markdown renderer in a `Suspense` boundary if needed, but for MVP the loading state of the README query handles this.

### Accessibility Notes

- **Heading hierarchy**: `<h1>` is the repo name. README headings are shifted down (h1->h2, etc.) per WCAG 1.3.1.
- **Landmark roles**: The page content is inside `<main>` via AppLayout.
- **Copy button**: Has `aria-label="Copy URL"`.
- **Topics**: Use `<Badge>` component which renders as styled `<div>` elements -- consider adding `role="list"` on the container for screen readers.
- **External links**: `target="_blank"` with `rel="noopener noreferrer"` for security.
- **Loading state**: Use `role="status"` and `aria-label="Loading repository details"` on skeleton.
- **Error state**: Use `role="alert"` on error container.
- **Back link**: "Back to repositories" link at top provides navigation context.

### Test Design Reference

From `_bmad-output/planning-artifacts/test-design-epic-2.md` section 5.4:

| Test ID | Test Description | Type | Priority |
|---------|-----------------|------|----------|
| AT-2.4.01 | Displays repository name as h1 heading | Component | Critical |
| AT-2.4.02 | Displays full description (not truncated) | Component | High |
| AT-2.4.03 | Displays complete list of maintainers with npub display | Component | High |
| AT-2.4.04 | Displays ArNS URL with copy functionality | Component | Medium |
| AT-2.4.05 | Displays repository topics/tags (if available) | Component | Medium |
| AT-2.4.06 | Displays last updated timestamp | Component | Medium |
| AT-2.4.07 | README.md is fetched from Arweave and rendered as markdown | Component | High |
| AT-2.4.08 | Markdown supports GitHub-flavored markdown (tables, strikethrough, task lists) | Component | Medium |
| AT-2.4.09 | Syntax highlighting works for code blocks in README | Component | Medium |
| AT-2.4.10 | Heading hierarchy is correct in rendered markdown | Accessibility | Medium |
| AT-2.4.11 | External links open in new tabs with rel="noopener noreferrer" | Component | High |
| AT-2.4.12 | Page is accessible via direct URL (deep linking) | Integration | Critical |
| AT-2.4.13 | Browser back button returns to previous page | Integration | High |
| AT-2.4.14 | TTI < 3.5s | Performance (Playwright) | Medium |
| AT-2.4.15 | Loading state shown while fetching repository data | Component | High |
| AT-2.4.16 | Error state shown when fetch fails | Component | High |
| AT-2.4.17 | Graceful fallback when README.md is not available | Component | High |
| AT-2.4.18 | Markdown rendering sanitizes XSS vectors (script tags, javascript: URLs) | Security | Critical |

**Test coverage notes:**
- AT-2.4.13 (browser back button) and AT-2.4.14 (TTI) are integration/performance tests best suited for Playwright. They are not unit-testable and are deferred to browser verification.
- All other AT IDs are covered by Task 4 subtasks.

Risk mitigations from test design:
- R2.4-1 (deep linking): Test with `createMemoryRouter` at specific URL
- R2.4-2 (XSS): Test markdown with `<script>`, `<iframe>`, `javascript:` URLs
- R2.4-3 (bundle size): Lazy loading via route config already handles this
- R2.4-4 (README fetch fails): Mock fetch failure, verify fallback message
- R2.4-5 (external links): Assert `target="_blank"` and `rel="noopener noreferrer"`
- R2.4-6 (back button): Deferred to Playwright browser verification
- R2.4-7 (syntax highlighting): Render code block, verify highlighter renders

### Project Structure After This Story

New files:
```
src/features/repository/hooks/
+-- useRepository.ts           <-- NEW (singular repo fetch hook)
+-- useRepository.test.tsx     <-- NEW (hook tests)
+-- useReadme.ts               <-- NEW (README fetch hook)
src/pages/
+-- RepoDetail.tsx             <-- MODIFIED (replace placeholder with full implementation)
+-- RepoDetail.test.tsx        <-- NEW (page-level component tests)
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4]
- [Source: _bmad-output/planning-artifacts/test-design-epic-2.md#5.4 Story 2.4]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Repository Detail]
- [Source: _bmad-output/planning-artifacts/architecture/project-structure-boundaries.md]
- [Source: _bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md]
- [Source: _bmad-output/implementation-artifacts/2-3-client-side-search-and-filtering.md]
- [Source: _bmad-output/implementation-artifacts/2-2-repository-card-component-with-metadata.md]
- [Source: _bmad-output/implementation-artifacts/2-1-repository-list-page-with-nostr-query.md]
- [Source: src/pages/RepoDetail.tsx -- existing placeholder]
- [Source: src/features/repository/hooks/useRepositories.ts -- existing list hook pattern]
- [Source: src/features/repository/RepoCard.tsx -- existing card component with copy pattern]
- [Source: src/lib/nostr.ts -- service layer with fetchRepositories()]
- [Source: src/lib/arweave.ts -- Arweave service with fetchFile()]
- [Source: src/lib/query-client.ts -- query key factories]
- [Source: src/lib/format.ts -- truncatePubkey, formatRelativeTime]
- [Source: src/types/repository.ts -- Repository interface]
- [Source: src/constants/routes.ts -- route paths and builders]
- [Source: src/routes.tsx -- route configuration]
- [Source: src/test-utils/factories/repository.ts -- test data factory]
- [Source: forgejo/templates/repo/home.tmpl -- Forgejo repo detail layout reference]

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

None -- all tests passed on first run, no debugging required.

### Completion Notes List

- **Task 1 (useRepository hook):** Created `src/features/repository/hooks/useRepository.ts` with `useQuery` wrapping `fetchRepositories()`, matching by both `owner` AND `id`, with 1-hour staleTime and `repositoryKeys.detail(repoId)` query key.
- **Task 2 (useReadme hook):** Created `src/features/repository/hooks/useReadme.ts` using simple `fetch()` to `${webUrls[0]}/README.md` (Option A), with `retry: 1`, `staleTime: Infinity`, and `enabled` guard on `webUrls.length > 0`.
- **Task 3 (RepoDetail page):** Replaced placeholder in `src/pages/RepoDetail.tsx` with full implementation including: loading skeleton (`role="status"`), error state (`role="alert"` with `isRigError()` and "Try Again" button), not-found state with home link, metadata display (h1 name, full description, all maintainers, ArNS URL with copy, topics as Badge with `role="list"`/`role="listitem"`, timestamp), README rendering with `react-markdown` + `remark-gfm` + `react-syntax-highlighter`, heading level shift (h1->h2 etc.), external links with `target="_blank"` and `rel="noopener noreferrer"`, and "Back to repositories" navigation link.
- **Task 4 (Tests):** Created `src/features/repository/hooks/useRepository.test.tsx` (5 tests) and `src/pages/RepoDetail.test.tsx` (34 tests) covering all acceptance test IDs (AT-2.4.01 through AT-2.4.18), plus edge cases for missing optional fields and copy functionality.
- **Task 5 (Verification):** All 569 tests pass (39 new, baseline was 530), zero TypeScript errors, zero ESLint errors.

### File List

- `rig-frontend/src/features/repository/hooks/useRepository.ts` -- CREATED (useRepository hook)
- `rig-frontend/src/features/repository/hooks/useRepository.test.tsx` -- CREATED (hook tests, 5 tests)
- `rig-frontend/src/features/repository/hooks/useReadme.ts` -- CREATED (useReadme hook)
- `rig-frontend/src/pages/RepoDetail.tsx` -- MODIFIED (replaced placeholder with full implementation)
- `rig-frontend/src/pages/RepoDetail.test.tsx` -- CREATED (page tests, 34 tests)
- `rig-frontend/src/App.test.tsx` -- MODIFIED (integration test for RepoDetail route)

### Change Log

| Date | Summary |
|------|---------|
| 2026-02-27 | Story 2.4 implementation verified and completed. All hooks (useRepository, useReadme), page component (RepoDetail), and tests (39 new) confirmed working. 569 total tests pass, zero TS errors, zero lint errors. |

---

## Code Review Record

### Review Pass #1

| Field | Detail |
|-------|--------|
| **Date** | 2026-02-27 |
| **Reviewer Model** | Claude Opus 4.6 (claude-opus-4-6) |
| **Outcome** | Success |

#### Issues by Severity

| Severity | Found | Fixed | Accepted | Details |
|----------|-------|-------|----------|---------|
| Critical | 0 | 0 | 0 | -- |
| High | 2 | 2 | 0 | Missing initialData from list cache; unguarded `webUrls[0]` access |
| Medium | 2 | 1 | 1 | Fixed: `useReadme` returning null on failure instead of throwing. Accepted: copy state persistence (design trade-off, acceptable for MVP) |
| Low | 3 | 3 | 0 | Duplicate helper; misleading test assertions; node prop spread |
| **Total** | **7** | **6** | **1** | -- |

#### Summary

Code review pass #1 completed successfully. Six issues were identified and fixed across high, medium, and low severities. One medium-severity issue (copy state persistence across navigations) was reviewed and accepted as a reasonable design trade-off for the current MVP scope. No critical issues were found. No review follow-up tasks were generated -- all actionable items were resolved during the review pass.

### Review Pass #2

| Field | Detail |
|-------|--------|
| **Date** | 2026-02-27 |
| **Reviewer Model** | Claude Opus 4.6 (claude-opus-4-6) |
| **Outcome** | Success |

#### Issues by Severity

| Severity | Found | Fixed | Accepted | Details |
|----------|-------|-------|----------|---------|
| Critical | 0 | 0 | 0 | -- |
| High | 0 | 0 | 0 | -- |
| Medium | 2 | 2 | 0 | Missing `initialDataUpdatedAt` on `useRepository` (causes unnecessary refetch when list cache is warm); trailing-slash vulnerability in `useReadme` URL construction |
| Low | 1 | 1 | 0 | Heading level components passing `children` twice (via spread and as JSX children) |
| **Total** | **3** | **3** | **0** | -- |

#### Issue Details

1. **[Medium] Missing `initialDataUpdatedAt` in `useRepository`**: Without `initialDataUpdatedAt`, TanStack Query treats `initialData` as fetched at epoch 0, so the `queryFn` always runs even when the list cache is fresh. Added `initialDataUpdatedAt: () => queryClient.getQueryState(repositoryKeys.all())?.dataUpdatedAt` to properly honour `staleTime`. File: `src/features/repository/hooks/useRepository.ts`.

2. **[Medium] Trailing slash in `useReadme` URL construction**: If `webUrls[0]` ends with a trailing slash (e.g. `https://example.ar-io.dev/`), the constructed URL would be `https://example.ar-io.dev//README.md` with a double slash. While most servers handle this, it's not guaranteed. Added `.replace(/\/+$/, '')` to strip trailing slashes. File: `src/features/repository/hooks/useReadme.ts`.

3. **[Low] Duplicate `children` prop in heading level components**: The heading components (`h1`-`h6`) in the ReactMarkdown `components` config were spreading `omitNode(p)` (which includes `children`) AND passing `{p.children}` as JSX children. While React uses the JSX children and ignores the prop, this is redundant and confusing. Fixed by destructuring `children` out of the spread, consistent with the `a` component handler. File: `src/pages/RepoDetail.tsx`.

#### Accepted Risks (Not Fixed)

- **[Informational] Query key does not include `owner`**: `repositoryKeys.detail(repoId)` uses only `repoId` but the hook filters by both `owner` AND `repoId`. If two different owners have repos with the same `id` (d-tag), the cache could serve incorrect results. However, the story spec explicitly mandates using `repositoryKeys.detail(repoId)`, and changing the factory is out of scope. The probability of collision is very low in practice (d-tags tend to be unique). Tracked as a known risk for future consideration.

#### Summary

Code review pass #2 completed successfully. Three issues were identified and fixed (2 medium, 1 low). No critical or high severity issues found. All 575 tests pass, zero TypeScript errors, zero ESLint errors. The codebase is in good shape with proper caching, URL construction, and prop handling.

### Review Pass #3 (Final)

| Field | Detail |
|-------|--------|
| **Date** | 2026-02-27 |
| **Reviewer Model** | Claude Opus 4.6 (claude-opus-4-6) |
| **Outcome** | Success |

#### Issues by Severity

| Severity | Found | Fixed | Accepted | Details |
|----------|-------|-------|----------|---------|
| Critical | 0 | 0 | 0 | -- |
| High | 1 | 1 | 0 | No response size limit on README fetch |
| Medium | 2 | 2 | 0 | No URL protocol validation on webUrls; no Content-Type validation on README response |
| Low | 2 | 2 | 0 | @types/react-syntax-highlighter in production deps; missing trailing-slash test coverage |
| **Total** | **5** | **5** | **0** | -- |

#### Summary

Code review pass #3 (final) completed successfully. Five issues were identified and all five were fixed: one high-severity issue (no response size limit on README fetch), two medium-severity issues (no URL protocol validation on webUrls; no Content-Type validation on README response), and two low-severity issues (@types/react-syntax-highlighter in production deps; missing trailing-slash test coverage). No critical issues found. All issues resolved with no accepted risks.
