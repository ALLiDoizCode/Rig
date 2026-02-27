/**
 * Tests for RepoDetail page component
 *
 * Story 2.4: Repository Detail Page
 *
 * Test coverage:
 * - Repository metadata display (name, description, maintainers, ArNS, topics, timestamp)
 * - Markdown rendering (basic, GFM, syntax highlighting, heading hierarchy)
 * - XSS sanitization (script tags, javascript: URLs)
 * - External links (target="_blank", rel="noopener noreferrer")
 * - Loading skeleton state with role="status"
 * - Error state with role="alert" and retry
 * - Not found state with home link
 * - README not available fallback
 * - ArNS URL copy functionality
 * - Deep linking via route params
 * - Graceful rendering with missing optional fields
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import {
  createRepository,
  resetRepositoryCounter,
} from '@/test-utils/factories/repository'

// Mock the nostr service layer
vi.mock('@/lib/nostr', () => ({
  fetchRepositories: vi.fn(),
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

const { fetchRepositories } = await import('@/lib/nostr')
const { Component } = await import('./RepoDetail')

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, retryDelay: 0 },
    },
  })
}

/**
 * Render the RepoDetail page with router context and query client.
 * Uses createMemoryRouter with initialEntries to set URL params.
 */
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
  vi.mocked(fetchRepositories).mockResolvedValue([repo])
  vi.mocked(fetch).mockResolvedValue(
    new Response(readmeContent, { status: 200 })
  )
  return repo
}

describe('RepoDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRepositoryCounter()
    // Mock global fetch for README
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('Loading State (AC #7)', () => {
    // AT-2.4.15: Loading state skeleton
    it('should display loading skeleton with role="status" and aria-label while fetching', () => {
      vi.mocked(fetchRepositories).mockReturnValue(new Promise(() => {}))

      renderRepoDetail()

      const loadingElement = screen.getByRole('status')
      expect(loadingElement).toBeInTheDocument()
      expect(loadingElement).toHaveAttribute(
        'aria-label',
        'Loading repository details'
      )
    })
  })

  describe('Error State (AC #9)', () => {
    // AT-2.4.16: Error state with role="alert" and retry
    it('should display error with role="alert" when fetch fails with RigError', async () => {
      const rigError = {
        code: 'RELAY_TIMEOUT' as const,
        message: 'Relay query failed',
        userMessage: 'Unable to connect to Nostr relays. Please try again.',
      }
      vi.mocked(fetchRepositories).mockRejectedValue(rigError)

      renderRepoDetail()

      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toBeInTheDocument()
      expect(alertElement).toHaveTextContent(
        'Unable to connect to Nostr relays. Please try again.'
      )
    })

    it('should display fallback error message for non-RigError', async () => {
      vi.mocked(fetchRepositories).mockRejectedValue(
        new Error('Network failure')
      )

      renderRepoDetail()

      const alertElement = await screen.findByRole('alert')
      expect(alertElement).toHaveTextContent('Something went wrong.')
    })

    it('should display "Try Again" button that calls refetch', async () => {
      const user = userEvent.setup()
      const mockRepos = [
        createRepository({ id: 'test-repo', owner: 'test-owner' }),
      ]
      vi.mocked(fetchRepositories)
        .mockRejectedValueOnce({
          code: 'RELAY_TIMEOUT',
          message: 'Failed',
          userMessage: 'Unable to connect.',
        })
        .mockResolvedValueOnce(mockRepos)

      // Mock fetch for README
      vi.mocked(fetch).mockResolvedValue(
        new Response('# README', { status: 200 })
      )

      renderRepoDetail()

      const retryButton = await screen.findByRole('button', {
        name: /try again/i,
      })
      expect(retryButton).toBeInTheDocument()

      await user.click(retryButton)

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })
      expect(fetchRepositories).toHaveBeenCalledTimes(2)
    })
  })

  describe('Not Found State (AC #8)', () => {
    it('should display "Repository not found" when repo is null', async () => {
      vi.mocked(fetchRepositories).mockResolvedValue([])

      renderRepoDetail('nonexistent-owner', 'nonexistent-repo')

      await waitFor(() => {
        expect(screen.getByText('Repository not found')).toBeInTheDocument()
      })
    })

    it('should display link back to home page when not found', async () => {
      vi.mocked(fetchRepositories).mockResolvedValue([])

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('Repository not found')).toBeInTheDocument()
      })

      const homeLink = screen.getByText('Back to repositories')
      expect(homeLink.closest('a')).toHaveAttribute('href', '/')
    })
  })

  describe('Repository Metadata Display (AC #2)', () => {
    function setupSuccessfulRepo(overrides = {}) {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        name: 'My Awesome Repository',
        description: 'A detailed description of the repository that is not truncated at all.',
        maintainers: [
          'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        ],
        webUrls: ['https://example.ar-io.dev'],
        topics: ['nostr', 'arweave', 'decentralized'],
        createdAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        ...overrides,
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repo])
      vi.mocked(fetch).mockResolvedValue(
        new Response('# README content', { status: 200 })
      )
      return repo
    }

    // AT-2.4.01: Repository name as h1
    it('should display repository name as h1 heading', async () => {
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toHaveTextContent('My Awesome Repository')
      })
    })

    // AT-2.4.02: Full description (not truncated)
    it('should display full description without truncation', async () => {
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByText(
            'A detailed description of the repository that is not truncated at all.'
          )
        ).toBeInTheDocument()
      })
    })

    // AT-2.4.03: Maintainers with truncated npub
    it('should display all maintainers with truncated pubkeys', async () => {
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        // First maintainer: abcdef12...34567890
        expect(screen.getByText('abcdef12...34567890')).toBeInTheDocument()
        // Second maintainer: fedcba09...87654321
        expect(screen.getByText('fedcba09...87654321')).toBeInTheDocument()
      })
    })

    // AT-2.4.04: ArNS URL with copy
    it('should display ArNS URL with copy button', async () => {
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByText('https://example.ar-io.dev')
        ).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: 'Copy URL' })
      expect(copyButton).toBeInTheDocument()
    })

    // AT-2.4.05: Topics as badges
    it('should display topics as Badge components', async () => {
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('nostr')).toBeInTheDocument()
        expect(screen.getByText('arweave')).toBeInTheDocument()
        expect(screen.getByText('decentralized')).toBeInTheDocument()
      })
    })

    // AT-2.4.06: Last updated timestamp
    it('should display last updated timestamp', async () => {
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        // Should contain relative time like "about 1 hour ago" or similar
        expect(screen.getByText(/ago/i)).toBeInTheDocument()
      })
    })

    // Copy functionality
    it('should copy ArNS URL to clipboard when copy button is clicked', async () => {
      const user = userEvent.setup()
      const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByText('https://example.ar-io.dev')
        ).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: 'Copy URL' })
      await user.click(copyButton)

      // Verify the "Copied!" feedback shows (implies clipboard.writeText was called successfully)
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
      expect(writeTextSpy).toHaveBeenCalledWith(
        'https://example.ar-io.dev'
      )
    })

    it('should handle clipboard failure gracefully without showing "Copied!"', async () => {
      const user = userEvent.setup()
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
        new Error('Clipboard unavailable')
      )
      setupSuccessfulRepo()

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByText('https://example.ar-io.dev')
        ).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: 'Copy URL' })
      await user.click(copyButton)

      // When clipboard API fails, "Copied!" should NOT appear
      // (the catch block silently handles the error)
      // Wait a tick for the async handler to complete
      await waitFor(() => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
      })
    })
  })

  describe('URL Protocol Validation (Security)', () => {
    it('should not render ArNS link with javascript: URL scheme', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: ['javascript:alert("xss")'],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repo])

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })

      // ArNS section should not render since the URL has an unsafe protocol
      expect(screen.queryByText('ArNS URL')).not.toBeInTheDocument()
    })

    it('should not render ArNS link with data: URL scheme', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: ['data:text/html,<script>alert(1)</script>'],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repo])

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })

      expect(screen.queryByText('ArNS URL')).not.toBeInTheDocument()
    })

    it('should render ArNS link with valid https: URL scheme', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: ['https://example.ar-io.dev'],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repo])
      vi.mocked(fetch).mockResolvedValue(
        new Response('# README', { status: 200 })
      )

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('ArNS URL')).toBeInTheDocument()
      })
    })
  })

  describe('Graceful Optional Fields (AC #2 edge cases)', () => {
    it('should display "No description" in italic when description is empty', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        description: '',
        webUrls: [],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repo])

      renderRepoDetail()

      await waitFor(() => {
        const noDesc = screen.getByText('No description')
        expect(noDesc).toBeInTheDocument()
        // AC #2: "No description" must be displayed in italic text
        expect(noDesc).toHaveClass('italic')
      })
    })

    it('should not render maintainers section when maintainers array is empty', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        maintainers: [],
        webUrls: [],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repo])

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })

      expect(screen.queryByText('Maintainers')).not.toBeInTheDocument()
    })

    it('should not render ArNS section when webUrls is empty', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: [],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repo])

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })

      expect(screen.queryByText('ArNS URL')).not.toBeInTheDocument()
    })

    it('should not render topics section when topics array is empty', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        topics: [],
        webUrls: [],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repo])

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })

      // There should be no topic badges or role="list" for topics
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })
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

  describe('README Not Available (AC #10)', () => {
    // AT-2.4.17: README not available fallback
    it('should show "README not available" when fetch fails', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: ['https://example.ar-io.dev'],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repo])
      vi.mocked(fetch).mockResolvedValue(
        new Response(null, { status: 404 })
      )

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('README not available')).toBeInTheDocument()
      })
    })

    it('should show "README not available" when no webUrls exist', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: [],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repo])

      renderRepoDetail()

      await waitFor(() => {
        expect(screen.getByText('README not available')).toBeInTheDocument()
      })
    })

    it('should still display repository metadata when README is not available', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        name: 'My Repo',
        webUrls: [],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repo])

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toHaveTextContent('My Repo')
      })
      expect(screen.getByText('README not available')).toBeInTheDocument()
    })
  })

  describe('Deep Linking (AC #5)', () => {
    // AT-2.4.12: Page accessible via direct URL
    it('should render correctly when navigating directly to /:owner/:repo', async () => {
      const repo = createRepository({
        id: 'deep-link-repo',
        owner: 'deep-link-owner',
        name: 'Deep Link Repo',
        webUrls: [],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repo])

      renderRepoDetail('deep-link-owner', 'deep-link-repo')

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toHaveTextContent('Deep Link Repo')
      })
    })
  })

  describe('Back Navigation', () => {
    it('should display "Back to repositories" link pointing to /', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        webUrls: [],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repo])

      renderRepoDetail()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 1 })
        ).toBeInTheDocument()
      })

      const backLink = screen.getByText('Back to repositories')
      expect(backLink.closest('a')).toHaveAttribute('href', '/')
    })
  })

  describe('Topics as Badges with role="list"', () => {
    it('should render topics container with role="list" and items with role="listitem"', async () => {
      const repo = createRepository({
        id: 'test-repo',
        owner: 'test-owner',
        topics: ['nostr', 'arweave'],
        webUrls: [],
      })
      vi.mocked(fetchRepositories).mockResolvedValue([repo])

      renderRepoDetail()

      await waitFor(() => {
        const list = screen.getByRole('list')
        expect(list).toBeInTheDocument()

        const items = within(list).getAllByRole('listitem')
        expect(items).toHaveLength(2)
        expect(items[0]).toHaveTextContent('nostr')
        expect(items[1]).toHaveTextContent('arweave')
      })
    })
  })
})
