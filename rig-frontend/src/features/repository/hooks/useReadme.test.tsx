/**
 * Tests for useReadme hook
 *
 * Story 2.4: Repository Detail Page (AC #3, #10)
 *
 * Verifies the hook fetches README.md from the repository's first webUrl,
 * handles fetch failures gracefully, and respects the enabled/disabled state.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const { useReadme } = await import('./useReadme')

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, retryDelay: 0 },
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

describe('useReadme', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('should fetch README.md from the first webUrl and return content', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('# Hello World\n\nThis is a README.', { status: 200 })
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useReadme(['https://example.ar-io.dev'], true),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(result.current.data).toBe('# Hello World\n\nThis is a README.')
    expect(fetch).toHaveBeenCalledWith('https://example.ar-io.dev/README.md')
  })

  it('should error when fetch response is not ok (e.g. 404)', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, { status: 404 })
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useReadme(['https://example.ar-io.dev'], true),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect((result.current.error as Error).message).toContain('404')
  })

  it('should error when fetch throws a network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useReadme(['https://example.ar-io.dev'], true),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect((result.current.error as Error).message).toBe('Network error')
  })

  it('should not execute query when webUrls is empty', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useReadme([], true),
      { wrapper }
    )

    // Query should remain pending (never executes) since enabled is false
    expect(result.current.fetchStatus).toBe('idle')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should not execute query when enabled is false', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useReadme(['https://example.ar-io.dev'], false),
      { wrapper }
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should construct the URL by appending /README.md to the first webUrl', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('readme content', { status: 200 })
    )

    const { wrapper } = createWrapper()
    renderHook(
      () => useReadme(['https://my-repo.ar-io.dev', 'https://second-url.com'], true),
      { wrapper }
    )

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('https://my-repo.ar-io.dev/README.md')
    })

    // Should only use the first webUrl
    expect(fetch).not.toHaveBeenCalledWith('https://second-url.com/README.md')
  })

  it('should strip trailing slash from webUrl to avoid double slashes', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('readme content', { status: 200 })
    )

    const { wrapper } = createWrapper()
    renderHook(
      () => useReadme(['https://example.ar-io.dev/'], true),
      { wrapper }
    )

    await waitFor(() => {
      // Should be /README.md, NOT //README.md
      expect(fetch).toHaveBeenCalledWith('https://example.ar-io.dev/README.md')
    })
  })

  it('should reject non-http/https URL schemes', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useReadme(['javascript:alert(1)'], true),
      { wrapper }
    )

    // Query should not execute since the URL is rejected
    expect(result.current.fetchStatus).toBe('idle')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should reject file:// URL schemes', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useReadme(['file:///etc/passwd'], true),
      { wrapper }
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should error when Content-Length header indicates README exceeds size limit', async () => {
    // Mock a response with Content-Length larger than MAX_README_SIZE (1 MB)
    const headers = new Headers({ 'Content-Length': String(2 * 1024 * 1024) })
    vi.mocked(fetch).mockResolvedValue(
      new Response('small body', { status: 200, headers })
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useReadme(['https://example.ar-io.dev'], true),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect((result.current.error as Error).message).toContain('too large')
  })
})
