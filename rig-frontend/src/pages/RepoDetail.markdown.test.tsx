/**
 * Tests for RepoDetail page component - Markdown Rendering
 *
 * Story 2.4: Repository Detail Page
 *
 * Test coverage:
 * - Markdown rendering (basic, GFM, syntax highlighting, heading hierarchy)
 * - XSS sanitization (script tags, iframe tags, javascript: URLs)
 * - External links (target="_blank", rel="noopener noreferrer")
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import {
  createRepository,
  resetRepositoryCounter,
} from '@/test-utils/factories/repository'
import {
  createRelayResult,
  createRelayQueryMeta,
} from '@/test-utils/factories/relay-status'

// Mock the nostr service layer
vi.mock('@/lib/nostr', () => ({
  fetchRepositories: vi.fn(),
  fetchRepositoriesWithMeta: vi.fn(),
}))

// Mock react-syntax-highlighter to avoid heavy rendering in tests
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children, language }: { children: string; language: string }) => (
    <pre data-testid="syntax-highlighter" data-language={language}>
      <code>{children}</code>
    </pre>
  ),
}))

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
}))

const { fetchRepositoriesWithMeta } = await import('@/lib/nostr')
const { Component } = await import('./RepoDetail')

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, retryDelay: 0 },
    },
  })
}

/** Helper to wrap repositories in the fetchRepositoriesWithMeta response format */
function createMetaResponse(repos: ReturnType<typeof createRepository>[]) {
  const meta = createRelayQueryMeta({
    results: [
      createRelayResult({ url: 'wss://relay.damus.io' }),
      createRelayResult({ url: 'wss://nos.lol' }),
    ],
    respondedCount: 2,
    totalCount: 2,
  })
  return { repositories: repos, meta }
}

function renderRepoDetail(owner = 'test-owner', repo = 'test-repo') {
  const queryClient = createTestQueryClient()
  const router = createMemoryRouter(
    [
      { path: '/:owner/:repo', element: <Component /> },
      { path: '/', element: <div>Home Page</div> },
    ],
    { initialEntries: [`/${owner}/${repo}`] }
  )

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    ),
    queryClient,
    router,
  }
}

/**
 * Shared helper: set up a repo with webUrls and mock a README response.
 * Used by README Rendering and XSS Sanitization test groups.
 */
function setupWithReadme(readmeContent: string) {
  const repo = createRepository({
    id: 'test-repo',
    owner: 'test-owner',
    webUrls: ['https://example.ar-io.dev'],
  })
  vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([repo]))
  vi.mocked(fetch).mockResolvedValue(
    new Response(readmeContent, { status: 200 })
  )
  return repo
}

describe('RepoDetail Page - Markdown Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRepositoryCounter()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('README Rendering (AC #3)', () => {
    // AT-2.4.07: README rendered as markdown
    it('should render README content as markdown', async () => {
      setupWithReadme('This is **bold** text and *italic* text.')

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText(/bold/)).toBeInTheDocument()
      })

      // Check bold text is rendered as <strong>
      const bold = screen.getByText('bold')
      expect(bold.tagName).toBe('STRONG')
    })

    // AT-2.4.08: GFM tables render
    it('should render GFM tables', async () => {
      setupWithReadme(
        '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |'
      )

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('Header 1')).toBeInTheDocument()
        expect(screen.getByText('Cell 1')).toBeInTheDocument()
        expect(screen.getByText('Cell 2')).toBeInTheDocument()
      })
    })

    it('should render GFM strikethrough', async () => {
      setupWithReadme('This is ~~deleted~~ text.')

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('deleted')).toBeInTheDocument()
      })
      const del = screen.getByText('deleted')
      expect(del.tagName).toBe('DEL')
    })

    // AT-2.4.09: Syntax highlighting for code blocks
    it('should render syntax-highlighted code blocks', async () => {
      setupWithReadme('```javascript\nconst x = 1;\n```')

      renderRepoDetail()

      await waitFor(() => {
        const highlighter = screen.getByTestId('syntax-highlighter')
        expect(highlighter).toBeInTheDocument()
        expect(highlighter).toHaveAttribute('data-language', 'javascript')
        expect(highlighter).toHaveTextContent('const x = 1;')
      })
    })

    it('should render inline code without syntax highlighter', async () => {
      setupWithReadme('Use `npm install` to get started.')

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('npm install')).toBeInTheDocument()
      })

      const inlineCode = screen.getByText('npm install')
      expect(inlineCode.tagName).toBe('CODE')
    })

    // AT-2.4.10: Heading hierarchy shift
    it('should shift README headings down by one level (h1 -> h2, h2 -> h3)', async () => {
      setupWithReadme(
        '# README Title\n\n## Section\n\n### Subsection'
      )

      renderRepoDetail()

      // Page h1 is the repo name
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })

      // README # -> h2
      await waitFor(() => {
        const h2s = screen.getAllByRole('heading', { level: 2 })
        const readmeTitle = h2s.find((h) =>
          h.textContent?.includes('README Title')
        )
        expect(readmeTitle).toBeTruthy()
      })

      // README ## -> h3
      const h3s = screen.getAllByRole('heading', { level: 3 })
      const section = h3s.find((h) => h.textContent?.includes('Section'))
      expect(section).toBeTruthy()

      // README ### -> h4
      const h4s = screen.getAllByRole('heading', { level: 4 })
      const subsection = h4s.find((h) =>
        h.textContent?.includes('Subsection')
      )
      expect(subsection).toBeTruthy()
    })

    // AT-2.4.11: External links have target="_blank" and rel="noopener noreferrer"
    it('should render external links with target="_blank" and rel="noopener noreferrer"', async () => {
      setupWithReadme('[Click here](https://example.com)')

      renderRepoDetail()

      await waitFor(() => {
        const link = screen.getByText('Click here')
        expect(link.closest('a')).toHaveAttribute('target', '_blank')
        expect(link.closest('a')).toHaveAttribute(
          'rel',
          'noopener noreferrer'
        )
        expect(link.closest('a')).toHaveAttribute(
          'href',
          'https://example.com'
        )
      })
    })
  })

  describe('XSS Sanitization (AC #4)', () => {
    // AT-2.4.18: Script tags stripped
    it('should strip script tags from markdown', async () => {
      setupWithReadme(
        'Safe content\n\n<script>alert("xss")</script>\n\nMore safe content'
      )

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('Safe content')).toBeInTheDocument()
      })

      // Script tag content should not be executable
      // react-markdown v10 does not render raw HTML
      const container = screen.getByText('Safe content').closest('section')!
      expect(container.querySelector('script')).toBeNull()
    })

    it('should strip iframe tags from markdown', async () => {
      setupWithReadme(
        'Safe text\n\n<iframe src="https://evil.com"></iframe>\n\nMore text'
      )

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('Safe text')).toBeInTheDocument()
      })

      const container = screen.getByText('Safe text').closest('section')!
      expect(container.querySelector('iframe')).toBeNull()
    })

    it('should not render javascript: URLs as executable links', async () => {
      setupWithReadme('[click me](javascript:alert("xss"))')

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('click me')).toBeInTheDocument()
      })

      // react-markdown v10 sanitizes javascript: URLs by stripping the href
      // or removing the <a> tag entirely. Either way, no clickable link with
      // a javascript: protocol should exist in the DOM.
      const link = screen.getByText('click me').closest('a')
      if (link) {
        // If rendered as <a>, the href must not contain javascript:
        expect(link.getAttribute('href')).not.toContain('javascript:')
      } else {
        // If not wrapped in <a>, the text is rendered as plain text (safe)
        expect(screen.getByText('click me').tagName).not.toBe('A')
      }
    })
  })
})
