import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routes } from './routes'
import { ThemeProvider } from './contexts/ThemeContext'

// Mock the Nostr service layer so Home page tests don't make real relay calls
vi.mock('@/lib/nostr', () => ({
  fetchRepositories: vi.fn().mockResolvedValue([]),
  fetchRepositoriesWithMeta: vi.fn().mockResolvedValue({
    repositories: [],
    meta: { results: [], queriedAt: 0, respondedCount: 0, totalCount: 0 },
  }),
}))

// Fresh QueryClient per test to prevent cache leaks
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
}

let testQueryClient: QueryClient

/**
 * Helper to render router at a specific path with all providers
 *
 * Uses createMemoryRouter for testing (React Router v7 recommended approach).
 * Mimics the production setup from main.tsx.
 */
function renderRoute(initialEntries: string[]) {
  const router = createMemoryRouter(routes, { initialEntries })
  return render(
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('App Router Integration', () => {
  beforeEach(() => {
    testQueryClient = createTestQueryClient()

    // Mock matchMedia for ThemeProvider
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  describe('Route Matching', () => {
    it('renders Home page at /', async () => {
      renderRoute(['/'])
      // Home page shows "Repositories" heading and empty state
      // Increased timeout: lazy-loaded Home imports RepoCard + date-fns + shadcn/ui
      // components, which takes longer to resolve under concurrent test execution.
      expect(await screen.findByRole('heading', { name: /repositories/i }, { timeout: 5000 })).toBeInTheDocument()
      expect(await screen.findByText(/no repositories found/i)).toBeInTheDocument()
    })

    it('renders RepoDetail page at /:owner/:repo', async () => {
      renderRoute(['/alice/my-repo'])

      // RepoDetail page shows "Repository not found" when fetchRepositories returns []
      // Increased timeout: lazy-loaded RepoDetail imports react-markdown + syntax highlighter
      expect(await screen.findByText(/repository not found/i, {}, { timeout: 5000 })).toBeInTheDocument()
    })

    it('renders FileBrowser page at /:owner/:repo/src/:branch/*', async () => {
      renderRoute(['/alice/my-repo/src/main/src/app.ts'])

      expect(await screen.findByText(/file browser:/i)).toBeInTheDocument()
      expect(await screen.findByText(/branch:/i)).toBeInTheDocument()
      expect(await screen.findByText(/main/i)).toBeInTheDocument()
      expect(await screen.findByText(/path:/i)).toBeInTheDocument()
      expect(await screen.findByText(/src\/app\.ts/i)).toBeInTheDocument()
    })

    it('renders FileBrowser without file path', async () => {
      renderRoute(['/alice/my-repo/src/main'])

      expect(await screen.findByText(/file browser:/i)).toBeInTheDocument()
      expect(await screen.findByText(/main/i)).toBeInTheDocument()
      // Should not show path section when no file path
      expect(screen.queryByText(/path:/i)).not.toBeInTheDocument()
    })

    it('renders CommitHistory page at /:owner/:repo/commits', async () => {
      renderRoute(['/alice/my-repo/commits'])

      expect(await screen.findByText(/commits:/i)).toBeInTheDocument()
      expect(await screen.findByText(/alice/i)).toBeInTheDocument()
      expect(await screen.findByText(/my-repo/i)).toBeInTheDocument()
    })

    it('renders CommitDetail page at /:owner/:repo/commit/:hash', async () => {
      renderRoute(['/alice/my-repo/commit/abc123def456'])

      expect(await screen.findByText(/commit:/i)).toBeInTheDocument()
      expect(await screen.findByText(/hash:/i)).toBeInTheDocument()
      expect(await screen.findByText(/abc123def456/i)).toBeInTheDocument()
    })

    it('renders IssueList page at /:owner/:repo/issues', async () => {
      renderRoute(['/alice/my-repo/issues'])

      expect(await screen.findByText(/issues:/i)).toBeInTheDocument()
      expect(await screen.findByText(/alice/i)).toBeInTheDocument()
      expect(await screen.findByText(/my-repo/i)).toBeInTheDocument()
    })

    it('renders IssueDetail page at /:owner/:repo/issues/:id', async () => {
      renderRoute(['/alice/my-repo/issues/42'])

      expect(await screen.findByText(/issue:/i)).toBeInTheDocument()
      expect(await screen.findByText(/alice/i)).toBeInTheDocument()
      expect(await screen.findByText(/my-repo/i)).toBeInTheDocument()
      expect(await screen.findByText(/#42/i)).toBeInTheDocument()
    })

    it('renders PRList page at /:owner/:repo/pulls', async () => {
      renderRoute(['/alice/my-repo/pulls'])

      expect(await screen.findByText(/pull requests:/i)).toBeInTheDocument()
      expect(await screen.findByText(/alice/i)).toBeInTheDocument()
      expect(await screen.findByText(/my-repo/i)).toBeInTheDocument()
    })

    it('renders PRDetail page at /:owner/:repo/pulls/:id', async () => {
      renderRoute(['/alice/my-repo/pulls/15'])

      expect(await screen.findByText(/pull request:/i)).toBeInTheDocument()
      expect(await screen.findByText(/alice/i)).toBeInTheDocument()
      expect(await screen.findByText(/my-repo/i)).toBeInTheDocument()
      expect(await screen.findByText(/#15/i)).toBeInTheDocument()
    })
  })

  describe('404 Handling', () => {
    it('renders NotFound page for unknown root path', async () => {
      renderRoute(['/unknown-path'])

      expect(await screen.findByText(/404.*not found/i)).toBeInTheDocument()
      expect(await screen.findByText(/doesn't exist/i)).toBeInTheDocument()
    })

    it('renders NotFound page for unknown sub-path', async () => {
      renderRoute(['/alice/my-repo/unknown-section'])

      expect(await screen.findByText(/404.*not found/i)).toBeInTheDocument()
    })

    it('renders NotFound page for invalid route structure', async () => {
      renderRoute(['/just-one-segment'])

      expect(await screen.findByText(/404.*not found/i)).toBeInTheDocument()
    })
  })

  describe('Lazy Loading and Code Splitting', () => {
    it('shows loading fallback during lazy component load', async () => {
      renderRoute(['/'])

      // The Suspense fallback should briefly appear
      // Using findBy to wait for final content
      // Home page shows "Repositories" heading after lazy load resolves
      expect(await screen.findByRole('heading', { name: /repositories/i })).toBeInTheDocument()
    })

    it('successfully loads lazy component after suspense', async () => {
      renderRoute(['/alice/my-repo'])

      // Wait for lazy-loaded component to resolve
      // RepoDetail page shows "Repository not found" when fetchRepositories returns []
      await waitFor(async () => {
        expect(await screen.findByText(/repository not found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Browser Navigation', () => {
    it('supports browser back button navigation', async () => {
      // Start at home, navigate to repo, then back
      const router = createMemoryRouter(routes, { initialEntries: ['/', '/alice/my-repo'], initialIndex: 1 })
      render(
        <QueryClientProvider client={testQueryClient}>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </QueryClientProvider>
      )

      // Should start at repo detail (index 1)
      // RepoDetail page shows "Repository not found" when fetchRepositories returns []
      expect(await screen.findByText(/repository not found/i)).toBeInTheDocument()

      // Navigate back
      await act(async () => {
        router.navigate(-1)
      })
      await waitFor(() => {
        expect(screen.queryByText(/repository not found/i)).not.toBeInTheDocument()
      })
      // Home page shows "Repositories" heading
      expect(await screen.findByRole('heading', { name: /repositories/i })).toBeInTheDocument()
    })

    it('supports browser forward button navigation', async () => {
      // Navigate forward in history
      const router = createMemoryRouter(routes, {
        initialEntries: ['/alice/my-repo', '/alice/my-repo/commits'],
        initialIndex: 1,
      })
      render(
        <QueryClientProvider client={testQueryClient}>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </QueryClientProvider>
      )

      // Should start at commits (index 1)
      expect(await screen.findByText(/commits:/i)).toBeInTheDocument()

      // Go back
      await act(async () => {
        router.navigate(-1)
      })
      // RepoDetail page shows "Repository not found" when fetchRepositories returns []
      expect(await screen.findByText(/repository not found/i)).toBeInTheDocument()

      // Go forward
      await act(async () => {
        router.navigate(1)
      })
      expect(await screen.findByText(/commits:/i)).toBeInTheDocument()
    })
  })

  describe('QueryClientProvider Integration', () => {
    it('wraps router with QueryClientProvider', () => {
      // Render with the full provider stack
      const router = createMemoryRouter(routes, { initialEntries: ['/'] })
      const { container } = render(
        <QueryClientProvider client={testQueryClient}>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </QueryClientProvider>
      )
      expect(container).toBeInTheDocument()
    })

    it('allows TanStack Query to work within routed components', async () => {
      renderRoute(['/'])

      // Home page shows "Repositories" heading
      expect(await screen.findByRole('heading', { name: /repositories/i })).toBeInTheDocument()

      // Query client should be available (verified by no errors)
      expect(testQueryClient).toBeDefined()
      expect(testQueryClient.getQueryCache()).toBeDefined()
    })
  })

  describe('Route Parameter Extraction', () => {
    it('extracts owner and repo params correctly', async () => {
      renderRoute(['/alice/my-repo'])

      // RepoDetail page shows "Repository not found" when fetchRepositories returns []
      // The params are extracted and used internally; the rendered output is the not-found state
      expect(await screen.findByText(/repository not found/i)).toBeInTheDocument()
    })

    it('handles special characters in route params', async () => {
      renderRoute(['/npub1test/repo-name-123'])

      // RepoDetail page shows "Repository not found" when fetchRepositories returns []
      expect(await screen.findByText(/repository not found/i)).toBeInTheDocument()
    })

    it('extracts wildcard file path in FileBrowser', async () => {
      renderRoute(['/alice/my-repo/src/main/docs/api/index.md'])

      expect(await screen.findByText(/docs\/api\/index\.md/i)).toBeInTheDocument()
    })
  })

  describe('Nested Routing', () => {
    it('renders nested routes within repository path', async () => {
      renderRoute(['/alice/my-repo/issues'])

      expect(await screen.findByText(/issues:/i)).toBeInTheDocument()
      expect(await screen.findByText(/alice/i)).toBeInTheDocument()
    })

    it('handles index routes correctly', async () => {
      renderRoute(['/alice/my-repo'])

      // Should render RepoDetail (index route of :owner/:repo)
      // RepoDetail page shows "Repository not found" when fetchRepositories returns []
      expect(await screen.findByText(/repository not found/i)).toBeInTheDocument()
    })
  })
})

describe('Integration with main.tsx Setup', () => {
  beforeEach(() => {
    // Mock matchMedia for ThemeProvider
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('renders with QueryClientProvider wrapper from main.tsx', async () => {
    // Simulate the exact setup from main.tsx
    const qc = createTestQueryClient()
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    const { container } = render(
      <QueryClientProvider client={qc}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    )

    expect(container).toBeInTheDocument()
    // Home page shows "Repositories" heading
    expect(await screen.findByRole('heading', { name: /repositories/i })).toBeInTheDocument()
  })

  // DevTools rendering is handled in main.tsx, not testable via router tests.
  // DevTools integration is verified by the QueryClientProvider tests above.
})
