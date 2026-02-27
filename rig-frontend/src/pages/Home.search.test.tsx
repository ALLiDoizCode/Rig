/**
 * Tests for Home page component - Search and Filtering
 *
 * Story 2.3: Client-Side Search and Filtering
 *
 * Test coverage:
 * - Search and filtering functionality (AC #1-#10)
 * - Debounced search input
 * - Clear search button
 * - Search results count
 * - Empty search state
 *
 * Acceptance Criteria covered: #1-#10 (Story 2.3)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import type { ReactNode } from 'react'
import {
  createRepository,
  createRepositories,
  resetRepositoryCounter,
} from '@/test-utils/factories/repository'
import {
  createRelayResult,
  createRelayQueryMeta,
} from '@/test-utils/factories/relay-status'

// Mock the nostr service layer at the service boundary
vi.mock('@/lib/nostr', () => ({
  fetchRepositories: vi.fn(),
  fetchRepositoriesWithMeta: vi.fn(),
  subscribeToRepositories: vi.fn(() => ({ close: vi.fn() })),
}))

// Mock useRealtimeRepositories to prevent subscription side effects
vi.mock('@/features/repository/hooks/useRealtimeRepositories', () => ({
  useRealtimeRepositories: vi.fn(),
}))

const { fetchRepositoriesWithMeta } = await import('@/lib/nostr')
const { Component: Home } = await import('./Home')

/** Helper to create a mock return value for fetchRepositoriesWithMeta */
function createMetaResponse(repos: ReturnType<typeof createRepositories>) {
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

// Fresh QueryClient per test — prevents cache leaks between tests
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
}

// Component wrapper with QueryClientProvider + MemoryRouter
function renderHome() {
  const queryClient = createTestQueryClient()

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )

  return {
    ...render(<Home />, { wrapper }),
    queryClient,
  }
}

describe('Home Page - Search and Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRepositoryCounter()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // AT-2.3.09: Search input has aria-label="Search repositories"
  it('[P1] should render search input with correct aria-label when data is loaded', async () => {
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
      createMetaResponse(createRepositories(3))
    )

    renderHome()

    await waitFor(() => {
      const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
      expect(searchInput).toBeInTheDocument()
    })
  })

  // AT-2.3.01: Repository list filters in real-time as user types
  it('[P0] should filter repositories by name (case-insensitive, partial match)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
      createMetaResponse([
        createRepository({ name: 'Bitcoin Core' }),
        createRepository({ name: 'Nostr Tools' }),
        createRepository({ name: 'bitkey-wallet' }),
      ])
    )

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
    })

    const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
    await user.type(searchInput, 'bit')

    act(() => { vi.advanceTimersByTime(300) })

    await waitFor(() => {
      expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      expect(screen.getByText('bitkey-wallet')).toBeInTheDocument()
      expect(screen.queryByText('Nostr Tools')).not.toBeInTheDocument()
    })
  })

  // AT-2.3.04: Shows "Showing X of Y repositories" count
  it('[P1] should display "Showing X of Y repositories" when search is active', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
      createMetaResponse([
        createRepository({ name: 'Bitcoin Core' }),
        createRepository({ name: 'Nostr Tools' }),
        createRepository({ name: 'Lightning Node' }),
      ])
    )

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('3 repositories')).toBeInTheDocument()
    })

    const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
    await user.type(searchInput, 'bitcoin')

    act(() => { vi.advanceTimersByTime(300) })

    await waitFor(() => {
      expect(screen.getByText('Showing 1 of 3 repositories')).toBeInTheDocument()
    })
  })

  // AT-2.3.05: "Clear search" button (X icon) appears when search has text
  it('[P1] should show clear button when search has text and hide when empty', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
      createMetaResponse(createRepositories(2))
    )

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Repository 1')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()

    const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
    await user.type(searchInput, 'test')

    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument()

    await user.clear(searchInput)

    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()
  })

  // AT-2.3.06: Clicking "Clear search" resets the list
  it('[P0] should reset search and restore full list when clear button is clicked', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
      createMetaResponse([
        createRepository({ name: 'Bitcoin Core' }),
        createRepository({ name: 'Nostr Tools' }),
      ])
    )

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
    })

    const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
    await user.type(searchInput, 'bitcoin')

    act(() => { vi.advanceTimersByTime(300) })

    await waitFor(() => {
      expect(screen.queryByText('Nostr Tools')).not.toBeInTheDocument()
    })

    const clearButton = screen.getByRole('button', { name: /clear search/i })
    await user.click(clearButton)

    await waitFor(() => {
      expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
      expect(screen.getByText('Nostr Tools')).toBeInTheDocument()
    })
    expect(searchInput).toHaveValue('')
  })

  // AT-2.3.07: Empty state when no repos match
  it('[P0] should show "No repositories found matching \'[term]\'" when no results match', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
      createMetaResponse([
        createRepository({ name: 'Bitcoin Core' }),
        createRepository({ name: 'Nostr Tools' }),
      ])
    )

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
    })

    const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
    await user.type(searchInput, 'zzzznonexistent')

    act(() => { vi.advanceTimersByTime(300) })

    await waitFor(() => {
      expect(screen.getByText(/no repositories found matching 'zzzznonexistent'/i)).toBeInTheDocument()
    })
  })

  // AT-2.3.14: Debounce delay (300ms) prevents excessive filtering
  it('[P0] should debounce filtering by 300ms', async () => {
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(
      createMetaResponse([
        createRepository({ name: 'Bitcoin Core' }),
        createRepository({ name: 'Nostr Tools' }),
      ])
    )

    renderHome()

    await waitFor(() => {
      expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
    })

    vi.useFakeTimers()

    const searchInput = screen.getByRole('searchbox', { name: /search repositories/i })
    fireEvent.change(searchInput, { target: { value: 'bitcoin' } })

    // Before debounce: both repos still visible
    expect(screen.getByText('Nostr Tools')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(300) })

    // After debounce: only matching repo visible
    expect(screen.queryByText('Nostr Tools')).not.toBeInTheDocument()
    expect(screen.getByText('Bitcoin Core')).toBeInTheDocument()
  })

  // AC #9: Search input NOT rendered during loading state
  it('[P1] should NOT render search input during loading state', () => {
    vi.mocked(fetchRepositoriesWithMeta).mockReturnValue(new Promise(() => {}))

    renderHome()

    expect(screen.queryByRole('searchbox', { name: /search repositories/i })).not.toBeInTheDocument()
  })

  // AC #9: Search input NOT rendered when data is empty
  it('[P1] should NOT render search input when data is empty', async () => {
    vi.mocked(fetchRepositoriesWithMeta).mockResolvedValue(createMetaResponse([]))

    renderHome()

    await waitFor(() => {
      expect(screen.getByText(/no repositories found/i)).toBeInTheDocument()
    })
    expect(screen.queryByRole('searchbox', { name: /search repositories/i })).not.toBeInTheDocument()
  })

  // AC #9: Search input NOT rendered during error state
  it('[P1] should NOT render search input during error state', async () => {
    vi.mocked(fetchRepositoriesWithMeta).mockRejectedValue({
      code: 'RELAY_TIMEOUT',
      message: 'Failed',
      userMessage: 'Unable to connect.',
    })

    renderHome()

    await screen.findByRole('alert')
    expect(screen.queryByRole('searchbox', { name: /search repositories/i })).not.toBeInTheDocument()
  })
})
