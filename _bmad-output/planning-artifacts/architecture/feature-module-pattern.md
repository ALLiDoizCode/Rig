# Feature Module Pattern - Architectural Decision

**Date:** 2026-02-27
**Status:** Ratified (Epic 2)
**Decision ID:** AD-1

---

## Context

As the Rig frontend grows from Epic 1 (foundation) through Epic 2 (repository discovery), we needed a consistent organizational pattern for features to:

1. Maintain clear separation between data fetching and presentation logic
2. Enable code reuse across multiple pages
3. Facilitate testing by isolating concerns
4. Scale as new features are added (issues, PRs, code review, etc.)

---

## Decision

**Adopt a feature module pattern with three distinct layers:**

```
src/features/{domain}/
  hooks/          # Data fetching and state management
  components/     # Reusable UI components specific to this domain
  pages/          # (Optional) Page-level components if not in src/pages/
```

**Layer Separation:**

### 1. Hooks Layer (`hooks/`)
- **Purpose:** Data fetching, transformations, cache management
- **Exports:** Custom React hooks using TanStack Query
- **Dependencies:** Can import from `lib/`, `types/`, `constants/`
- **Cannot:** Import from `components/` or `pages/` (breaks unidirectional data flow)

**Example:**
```typescript
// src/features/repository/hooks/useRepositories.ts
export function useRepositories() {
  return useQuery({
    queryKey: repositoryKeys.all(),
    queryFn: fetchRepositoriesWithMeta,
    select: (data) => deduplicateRepositories(data.repositories),
  })
}
```

### 2. Components Layer (`components/`)
- **Purpose:** Reusable UI components specific to the feature domain
- **Exports:** React components that consume hooks
- **Dependencies:** Can import from `hooks/`, `lib/`, `types/`, `components/ui/`
- **Cannot:** Import from `pages/` (pages compose components, not vice versa)

**Example:**
```typescript
// src/features/repository/RepoCard.tsx
export function RepoCard({ repo, relayMeta }: RepoCardProps) {
  // Uses UI layer components (shadcn/ui)
  return <Card>...</Card>
}
```

### 3. Pages Layer (`src/pages/`)
- **Purpose:** Route-level components that compose hooks and components
- **Exports:** Page components registered in `routes.tsx`
- **Dependencies:** Can import from ANY layer (top of the hierarchy)

**Example:**
```typescript
// src/pages/Home.tsx
import { useRepositories } from '@/features/repository/hooks/useRepositories'
import { RepoCard } from '@/features/repository/RepoCard'

export function Home() {
  const { data: repos } = useRepositories()
  return (
    <>
      {repos?.map(repo => <RepoCard key={repo.id} repo={repo} />)}
    </>
  )
}
```

---

## Implementation Guidelines

### When to Create a New Feature Module

Create a new feature module when:
- The feature has distinct domain logic (e.g., `repository`, `issue`, `pull-request`)
- Multiple pages will reuse the same data fetching logic
- The feature will grow to include multiple related components

**Do NOT create a feature module for:**
- Single-use components (keep them in `components/ui/` or co-located with the page)
- Generic utilities (put them in `lib/`)
- Layout components (keep them in `components/layout/`)

### Naming Conventions

**Hooks:**
- `use{Entity}` for single item: `useRepository()`
- `use{Entities}` for collections: `useRepositories()`
- `use{Action}{Entity}` for mutations: `useCreateIssue()`
- `useRealtime{Entities}` for WebSocket subscriptions: `useRealtimeRepositories()`

**Components:**
- `{Entity}Card` for list items: `RepoCard`, `IssueCard`
- `{Entity}Detail` for detail views: `RepoDetail`, `IssueDetail`
- `{Entity}Form` for forms: `IssueForm`, `PRForm`
- `{Entity}List` for lists (if not a page): `CommentList`

### File Organization Example

```
src/features/repository/
  hooks/
    useRepositories.ts         # Fetch all repositories
    useRepositories.test.ts    # Co-located tests
    useRepository.ts           # Fetch single repository
    useRepository.test.ts
    useReadme.ts               # Fetch README from Arweave
    useReadme.test.ts
    useRelayStatus.ts          # Passive relay metadata reader
    useRelayStatus.test.ts
    useRealtimeRepositories.ts # WebSocket subscription
    useRealtimeRepositories.test.ts
  RepoCard.tsx                 # Repository card component
  RepoCard.test.tsx            # Co-located tests
```

**Note:** Co-locate tests with implementation files (not in separate `__tests__/` directories).

---

## Benefits

✅ **Clear Boundaries:** Each layer has a single responsibility
✅ **Testable:** Hooks can be tested independently of UI
✅ **Reusable:** Hooks used by multiple pages/components
✅ **Scalable:** Pattern works from 1 feature to 100 features
✅ **Discoverable:** Developers know exactly where to find data fetching logic

---

## Trade-offs

❌ **More Directories:** Creates nesting (but improves discoverability)
❌ **Learning Curve:** New developers must learn the pattern
✅ **Mitigated By:** Clear documentation, consistent examples, code review enforcement

---

## Alternatives Considered

### Alternative 1: Co-locate Everything in Pages
```
src/pages/Home/
  Home.tsx
  HomeHooks.ts
  RepoCard.tsx
```

**Rejected Because:**
- Hooks not reusable across pages
- `RepoCard` duplicated if used on detail page
- Harder to find "where is the repository fetch logic?"

### Alternative 2: Separate Data and Components Directories
```
src/data/repositories/
src/components/repositories/
```

**Rejected Because:**
- Features split across two top-level directories
- Harder to see "everything related to repositories"
- Doesn't scale well (data vs. components is arbitrary)

---

## Enforcement

**Code Review Checklist:**
- [ ] New hooks are in `features/{domain}/hooks/`
- [ ] Hooks do NOT import from `components/` or `pages/`
- [ ] Components do NOT import from `pages/`
- [ ] Tests are co-located with implementation
- [ ] Naming follows conventions (`use{Entity}`, `{Entity}Card`, etc.)

**ESLint Rules (Future):**
```javascript
// Prevent circular dependencies
'import/no-restricted-paths': [
  'error',
  {
    zones: [
      { target: './src/features/*/hooks', from: './src/features/*/components' },
      { target: './src/features/*/hooks', from: './src/pages' },
      { target: './src/features/*/components', from: './src/pages' },
    ],
  },
],
```

---

## Examples in Codebase

### Epic 2: Repository Feature

**Hooks (5 total):**
- `useRepositories()` - List repositories with deduplication
- `useRepository()` - Single repository with initialData from list cache
- `useReadme()` - Fetch README from Arweave with caching
- `useRelayStatus()` - Passive relay metadata reader (cache side-effect)
- `useRealtimeRepositories()` - WebSocket subscription with cache invalidation

**Components (1 total):**
- `RepoCard.tsx` - Repository card used on Home page

**Pages (2 total):**
- `Home.tsx` - Uses `useRepositories()` + `RepoCard`
- `RepoDetail.tsx` - Uses `useRepository()` + `useReadme()` + `useRelayStatus()`

**Outcome:** Clear separation, hooks reused, tests focused, scalable for Epic 3 (issues/PRs).

---

## Future Expansion

As new features are added (Epic 3+), apply this pattern:

**Issue Feature:**
```
src/features/issue/
  hooks/
    useIssues.ts
    useIssue.ts
    useCreateIssue.ts
    useRealtimeIssues.ts
  IssueCard.tsx
  IssueForm.tsx
```

**Pull Request Feature:**
```
src/features/pull-request/
  hooks/
    usePullRequests.ts
    usePullRequest.ts
    useCreatePullRequest.ts
    usePatchDiff.ts
  PRCard.tsx
  PRDiffViewer.tsx
```

---

## References

- **Epic 2 Retrospective:** `/_bmad-output/implementation-artifacts/epic-2-retro-2026-02-27.md`
- **Project Context:** `/_bmad-output/project-context.md`
- **React Hooks Docs:** https://react.dev/reference/react/hooks
- **TanStack Query Patterns:** https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr

---

## Changelog

- **2026-02-27:** Initial ratification (Epic 2 complete)
- **2026-02-27:** Formalized in architecture docs per retrospective action item
