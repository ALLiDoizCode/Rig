/**
 * Manifest parser utility for converting flat Arweave manifest paths to hierarchical tree structure
 */

import type { ArweaveManifest } from '@/types/arweave';

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  arweaveId?: string;
  extension?: string;
}

/**
 * Parse a flat Arweave manifest into a hierarchical tree structure
 *
 * @param manifest - The Arweave manifest with flat file paths
 * @returns Root tree node with hierarchical children
 *
 * @example
 * ```ts
 * const manifest = {
 *   manifest: "arweave/paths",
 *   version: "0.1.0",
 *   paths: {
 *     "README.md": { id: "tx-abc" },
 *     "src/index.ts": { id: "tx-def" }
 *   }
 * };
 * const tree = parseManifestToTree(manifest);
 * // Returns hierarchical tree with src folder containing index.ts
 * ```
 */
export function parseManifestToTree(manifest: ArweaveManifest): TreeNode {
  const root: TreeNode = {
    name: 'root',
    path: '',
    type: 'folder',
    children: []
  };

  // Handle empty manifest
  if (!manifest.paths || Object.keys(manifest.paths).length === 0) {
    return root;
  }

  // Track seen paths to handle duplicates (shouldn't happen, but be defensive)
  const seenPaths = new Set<string>();

  for (const [path, { id }] of Object.entries(manifest.paths)) {
    // Skip duplicates
    if (seenPaths.has(path)) {
      continue;
    }
    seenPaths.add(path);

    // SECURITY: Prevent path traversal attacks by rejecting paths with ".." segments
    if (path.includes('..')) {
      console.warn(`Skipping malicious path with traversal: ${path}`);
      continue;
    }

    // SECURITY: Reject absolute paths (starting with /)
    if (path.startsWith('/')) {
      console.warn(`Skipping absolute path: ${path}`);
      continue;
    }

    const segments = path.split('/').filter(s => s.length > 0);

    // SECURITY: Skip empty paths or paths with only slashes
    if (segments.length === 0) {
      console.warn(`Skipping invalid empty path: ${path}`);
      continue;
    }
    let current = root;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isFile = i === segments.length - 1;
      const currentPath = segments.slice(0, i + 1).join('/');

      // Find existing child or create new one
      let child = current.children?.find(c => c.name === segment);

      if (!child) {
        child = {
          name: segment,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
          arweaveId: isFile ? id : undefined,
          extension: isFile ? getFileExtension(segment) : undefined,
        };
        current.children?.push(child);
      }

      // Move to the child node if it's a folder
      if (!isFile) {
        current = child;
      }
    }
  }

  // Sort children: folders first, then files, both alphabetically
  sortTreeRecursively(root);

  return root;
}

/**
 * Extract file extension from filename
 */
function getFileExtension(filename: string): string | undefined {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }
  return undefined;
}

/**
 * Recursively sort tree nodes: folders first, then files, both alphabetically
 */
function sortTreeRecursively(node: TreeNode): void {
  if (!node.children || node.children.length === 0) {
    return;
  }

  // Sort children
  node.children.sort((a, b) => {
    // Folders before files
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    // Alphabetically within same type
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  // Recursively sort children's children
  for (const child of node.children) {
    sortTreeRecursively(child);
  }
}

/**
 * Flatten a tree structure into a list based on expanded state
 * Useful for virtual scrolling and keyboard navigation
 *
 * @param nodes - Array of tree nodes to flatten
 * @param expandedState - Map of node paths to their expanded state
 * @param level - Current nesting level (used for indentation)
 * @returns Flattened array of nodes with level information
 */
export function flattenTree(
  nodes: TreeNode[],
  expandedState: Record<string, boolean>,
  level: number = 0
): Array<TreeNode & { level: number }> {
  const result: Array<TreeNode & { level: number }> = [];

  function traverse(node: TreeNode, currentLevel: number) {
    result.push({ ...node, level: currentLevel });

    if (node.type === 'folder' && expandedState[node.path] && node.children) {
      for (const child of node.children) {
        traverse(child, currentLevel + 1);
      }
    }
  }

  for (const node of nodes) {
    traverse(node, level);
  }

  return result;
}
