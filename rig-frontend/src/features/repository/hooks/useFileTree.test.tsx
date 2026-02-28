import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { ArweaveManifest } from '@/types/arweave';
import type { RigError } from '@/types/common';

// Mock the arweave module
vi.mock('@/lib/arweave', () => ({
  fetchManifest: vi.fn(),
}));

const { useFileTree } = await import('./useFileTree');
const { fetchManifest } = await import('@/lib/arweave');

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, retryDelay: 0 },
    },
  });
}

function createWrapper() {
  const queryClient = createTestQueryClient();
  return {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    queryClient,
  };
}

describe('useFileTree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockManifest: ArweaveManifest = {
    manifest: 'arweave/paths',
    version: '0.1.0',
    paths: {
      'README.md': { id: 'tx-readme' },
      'src/index.ts': { id: 'tx-index' },
      'src/lib/utils.ts': { id: 'tx-utils' },
    },
  };

  it('should fetch and parse manifest successfully', async () => {
    vi.mocked(fetchManifest).mockResolvedValue(mockManifest);

    const { result } = renderHook(() => useFileTree('test-manifest-id'), {
      wrapper: createWrapper().wrapper,
    });

    expect(result.current.status).toBe('pending');

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.type).toBe('folder');
    expect(result.current.data?.children).toHaveLength(2);

    // Verify tree structure
    const children = result.current.data!.children!;
    const srcFolder = children.find(c => c.name === 'src');
    const readmeFile = children.find(c => c.name === 'README.md');

    expect(srcFolder?.type).toBe('folder');
    expect(readmeFile?.type).toBe('file');
    expect(readmeFile?.arweaveId).toBe('tx-readme');
  });

  it('should return null when manifestId is null', async () => {
    const { result } = renderHook(() => useFileTree(null), {
      wrapper: createWrapper().wrapper,
    });

    // Query should not run when manifestId is null
    expect(result.current.status).toBe('pending');
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('should return null when manifestId is undefined', async () => {
    const { result } = renderHook(() => useFileTree(undefined), {
      wrapper: createWrapper().wrapper,
    });

    // Query should not run when manifestId is undefined
    expect(result.current.status).toBe('pending');
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('should handle Arweave fetch error', async () => {
    const mockError: RigError = {
      code: 'GATEWAY_ERROR',
      message: 'Failed to fetch manifest: Network error',
      userMessage: 'Unable to fetch repository manifest. Please try again.',
      context: { txId: 'test-manifest-id' },
    };

    vi.mocked(fetchManifest).mockRejectedValue(mockError);

    const { result } = renderHook(() => useFileTree('test-manifest-id'), {
      wrapper: createWrapper().wrapper,
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('should cache manifest with 1 hour staleTime', async () => {
    vi.mocked(fetchManifest).mockResolvedValue(mockManifest);

    const { wrapper } = createWrapper();
    const { result, rerender } = renderHook(
      () => useFileTree('test-manifest-id'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(fetchManifest).toHaveBeenCalledTimes(1);

    // Rerender should use cached data
    rerender();

    expect(fetchManifest).toHaveBeenCalledTimes(1);
  });

  it('should handle empty manifest', async () => {
    const emptyManifest: ArweaveManifest = {
      manifest: 'arweave/paths',
      version: '0.1.0',
      paths: {},
    };

    vi.mocked(fetchManifest).mockResolvedValue(emptyManifest);

    const { result } = renderHook(() => useFileTree('test-manifest-id'), {
      wrapper: createWrapper().wrapper,
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data?.children).toEqual([]);
  });

  it('should use correct query key structure', async () => {
    vi.mocked(fetchManifest).mockResolvedValue(mockManifest);

    const { wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => useFileTree('test-manifest-id'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    // Verify query key format
    const queries = queryClient.getQueryCache().findAll({
      queryKey: ['fileTree', 'test-manifest-id'],
    });

    expect(queries).toHaveLength(1);
  });

  it('should retry failed requests 2 times', async () => {
    const mockError: RigError = {
      code: 'GATEWAY_ERROR',
      message: 'Failed to fetch manifest',
      userMessage: 'Unable to fetch repository manifest. Please try again.',
      context: {},
    };

    vi.mocked(fetchManifest).mockRejectedValue(mockError);

    const { result } = renderHook(() => useFileTree('test-manifest-id'), {
      wrapper: createWrapper().wrapper,
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    // Should have attempted: initial call + 2 retries = 3 total
    expect(fetchManifest).toHaveBeenCalledTimes(3);
  });

  it('should parse deeply nested file structure', async () => {
    const nestedManifest: ArweaveManifest = {
      manifest: 'arweave/paths',
      version: '0.1.0',
      paths: {
        'src/features/repository/hooks/useFileTree.ts': { id: 'tx-1' },
        'src/features/repository/components/FileTree.tsx': { id: 'tx-2' },
      },
    };

    vi.mocked(fetchManifest).mockResolvedValue(nestedManifest);

    const { result } = renderHook(() => useFileTree('test-manifest-id'), {
      wrapper: createWrapper().wrapper,
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    // Navigate through tree structure
    const srcFolder = result.current.data?.children?.find(c => c.name === 'src');
    expect(srcFolder?.type).toBe('folder');

    const featuresFolder = srcFolder?.children?.find(c => c.name === 'features');
    expect(featuresFolder?.type).toBe('folder');

    const repositoryFolder = featuresFolder?.children?.find(
      c => c.name === 'repository'
    );
    expect(repositoryFolder?.type).toBe('folder');

    const hooksFolder = repositoryFolder?.children?.find(c => c.name === 'hooks');
    const componentsFolder = repositoryFolder?.children?.find(
      c => c.name === 'components'
    );

    expect(hooksFolder?.type).toBe('folder');
    expect(componentsFolder?.type).toBe('folder');
  });

  it('should deduplicate nodes correctly', async () => {
    vi.mocked(fetchManifest).mockResolvedValue(mockManifest);

    const { result } = renderHook(() => useFileTree('test-manifest-id'), {
      wrapper: createWrapper().wrapper,
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    // Verify no duplicate nodes exist
    const srcFolder = result.current.data?.children?.find(c => c.name === 'src');
    const srcFolders = result.current.data?.children?.filter(c => c.name === 'src');

    expect(srcFolders).toHaveLength(1);
    expect(srcFolder?.children).toHaveLength(2); // index.ts and lib folder
  });

  it('should refetch when manifestId changes', async () => {
    vi.mocked(fetchManifest).mockResolvedValue(mockManifest);

    const { result, rerender } = renderHook(
      ({ id }) => useFileTree(id),
      {
        wrapper: createWrapper().wrapper,
        initialProps: { id: 'manifest-1' },
      }
    );

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(fetchManifest).toHaveBeenCalledWith('manifest-1');
    expect(fetchManifest).toHaveBeenCalledTimes(1);

    // Change manifest ID
    rerender({ id: 'manifest-2' });

    await waitFor(() => {
      expect(fetchManifest).toHaveBeenCalledWith('manifest-2');
    });

    expect(fetchManifest).toHaveBeenCalledTimes(2);
  });

  it('should preserve manifest data during re-renders', async () => {
    vi.mocked(fetchManifest).mockResolvedValue(mockManifest);

    const { result, rerender } = renderHook(
      () => useFileTree('test-manifest-id'),
      {
        wrapper: createWrapper().wrapper,
      }
    );

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    const firstData = result.current.data;

    // Trigger re-render
    rerender();

    // Data should be the same (cached)
    expect(result.current.data).toBe(firstData);
    expect(fetchManifest).toHaveBeenCalledTimes(1);
  });

  it('should handle manifest with single file at root', async () => {
    const singleFileManifest: ArweaveManifest = {
      manifest: 'arweave/paths',
      version: '0.1.0',
      paths: {
        'README.md': { id: 'tx-readme' },
      },
    };

    vi.mocked(fetchManifest).mockResolvedValue(singleFileManifest);

    const { result } = renderHook(() => useFileTree('test-manifest-id'), {
      wrapper: createWrapper().wrapper,
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data?.children).toHaveLength(1);
    expect(result.current.data?.children![0]).toEqual({
      name: 'README.md',
      path: 'README.md',
      type: 'file',
      arweaveId: 'tx-readme',
      extension: 'md',
      children: undefined,
    });
  });
});
