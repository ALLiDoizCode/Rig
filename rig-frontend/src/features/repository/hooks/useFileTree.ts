/**
 * useFileTree - TanStack Query hook for fetching and parsing repository file tree
 *
 * Story 3.1: File Tree Navigation Component
 *
 * Fetches Arweave manifest for a repository branch and parses it into a hierarchical
 * tree structure for display in the file browser UI.
 *
 * For Epic 3, we're using a simplified approach where the manifestId is passed directly.
 * Future stories will integrate with NIP-34 branch events to discover manifest IDs.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchManifest } from '@/lib/arweave';
import { parseManifestToTree, type TreeNode } from '@/lib/utils/manifestParser';
import type { RigError } from '@/types/common';

/**
 * Hook to fetch and parse repository file tree from Arweave manifest
 *
 * @param manifestId - Arweave transaction ID of the manifest
 * @returns TanStack Query result with TreeNode or null
 *
 * @example
 * ```tsx
 * const { data: tree, status, error } = useFileTree('manifest-tx-id');
 * if (status === 'loading') return <Skeleton />;
 * if (status === 'error') return <ErrorState error={error} />;
 * return <FileTree nodes={tree?.children || []} />;
 * ```
 */
export function useFileTree(manifestId: string | null | undefined) {
  return useQuery<TreeNode | null, RigError>({
    queryKey: ['fileTree', manifestId],
    queryFn: async () => {
      if (!manifestId) {
        throw {
          code: 'MANIFEST_NOT_FOUND',
          message: 'No manifest ID provided',
          userMessage: 'File tree not available for this repository',
          context: {},
        } as RigError;
      }

      // Fetch manifest from Arweave
      const manifest = await fetchManifest(manifestId);

      // Parse flat manifest to hierarchical tree structure
      const tree = parseManifestToTree(manifest);

      return tree;
    },
    enabled: !!manifestId,
    staleTime: 60 * 60 * 1000, // 1 hour (manifests are immutable per branch)
    retry: 2,
  });
}
