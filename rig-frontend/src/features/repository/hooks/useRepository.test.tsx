/**
 * Tests for useRepository hook
 *
 * Story 2.4: Repository Detail Page (Task 4.21, 4.22)
 *
 * Verifies the hook fetches repositories and returns the matching one
 * by owner AND id, or null when no match is found.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  createRepository,
  resetRepositoryCounter,
} from '@/test-utils/factories/repository'

vi.mock('@/lib/nostr', () => ({
  fetchRepositories: vi.fn(),
}))

const { fetchRepositories } = await import('@/lib/nostr')
const { useRepository } = await import('./useRepository')

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
}

function createWrapper() {
  const queryClient = createTestQueryClient()
  return {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    queryClient,
  }
}

describe('useRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRepositoryCounter()
  })

  it('should return matching repository when owner and id both match', async () => {
    const targetRepo = createRepository({
      id: 'my-repo',
      owner: 'owner-pubkey-abc',
      name: 'My Repository',
    })
    const otherRepo = createRepository({
      id: 'other-repo',
      owner: 'other-owner',
      name: 'Other Repo',
    })
    vi.mocked(fetchRepositories).mockResolvedValue([targetRepo, otherRepo])

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useRepository('owner-pubkey-abc', 'my-repo'),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(result.current.data).toEqual(targetRepo)
  })

  it('should return null when no matching repository is found', async () => {
    const repo = createRepository({
      id: 'existing-repo',
      owner: 'some-owner',
    })
    vi.mocked(fetchRepositories).mockResolvedValue([repo])

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useRepository('nonexistent-owner', 'nonexistent-repo'),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(result.current.data).toBeNull()
  })

  it('should return null when owner matches but id does not', async () => {
    const repo = createRepository({
      id: 'my-repo',
      owner: 'owner-abc',
    })
    vi.mocked(fetchRepositories).mockResolvedValue([repo])

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useRepository('owner-abc', 'wrong-repo'),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(result.current.data).toBeNull()
  })

  it('should return null when id matches but owner does not', async () => {
    const repo = createRepository({
      id: 'my-repo',
      owner: 'owner-abc',
    })
    vi.mocked(fetchRepositories).mockResolvedValue([repo])

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useRepository('wrong-owner', 'my-repo'),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(result.current.data).toBeNull()
  })

  it('should propagate error when fetchRepositories fails', async () => {
    const rigError = {
      code: 'RELAY_TIMEOUT' as const,
      message: 'Relay query failed',
      userMessage: 'Unable to connect to Nostr relays. Please try again.',
    }
    vi.mocked(fetchRepositories).mockRejectedValue(rigError)

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useRepository('any-owner', 'any-repo'),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    expect(result.current.error).toEqual(rigError)
  })
})
