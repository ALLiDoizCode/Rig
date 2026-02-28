/**
 * FileTree - Hierarchical file tree component with virtual scrolling
 *
 * Story 3.1: File Tree Navigation Component
 *
 * Renders a hierarchical file tree with expand/collapse functionality,
 * keyboard navigation, and virtual scrolling for large trees (>100 items).
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useLocation } from 'react-router-dom';
import { FileTreeItem } from './FileTreeItem';
import { flattenTree, type TreeNode } from '@/lib/utils/manifestParser';

interface FileTreeProps {
  nodes: TreeNode[];
  owner?: string;
  repo?: string;
  branch?: string;
  onNavigate?: () => void;
}

/**
 * FileTree component with virtual scrolling and keyboard navigation
 *
 * Features:
 * - Expand/collapse folders
 * - Virtual scrolling for large trees (>100 items)
 * - Keyboard navigation (Arrow keys, Enter)
 * - Roving tabindex for focus management
 * - Highlights current file based on URL
 *
 * @example
 * ```tsx
 * const { data: tree } = useFileTree(manifestId);
 * <FileTree
 *   nodes={tree?.children || []}
 *   owner="owner"
 *   repo="repo"
 *   branch="main"
 * />
 * ```
 */
export function FileTree({ nodes, owner, repo, branch, onNavigate }: FileTreeProps) {
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>({});
  const [focusedIndex, setFocusedIndex] = useState(0);
  const location = useLocation();
  const parentRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

  // Extract current path from URL for highlighting
  const currentPath = useMemo(() => {
    // URL format: /:owner/:repo/src/:branch/:path
    const pathMatch = location.pathname.match(/\/src\/[^/]+\/(.+)$/);
    if (!pathMatch) return null;

    // SECURITY: Decode URI components safely to match against tree paths
    try {
      return decodeURIComponent(pathMatch[1]);
    } catch {
      // Malformed URI - return null to prevent highlighting
      console.warn('Failed to decode URI path:', pathMatch[1]);
      return null;
    }
  }, [location.pathname]);

  // Flatten tree based on expanded state
  const flatNodes = useMemo(() => {
    return flattenTree(nodes, expandedState);
  }, [nodes, expandedState]);

  // Apply virtual scrolling only for large trees (>100 items)
  const shouldVirtualize = flatNodes.length > 100;

  // Memoize the estimateSize function to prevent virtualizer re-initialization
  const estimateSize = useCallback(() => 32, []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: flatNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize, // Estimated height per item in pixels
    overscan: 10, // Render 10 extra items above/below viewport
    enabled: shouldVirtualize,
  });

  // Toggle folder expand/collapse
  const toggleFolder = useCallback((path: string) => {
    setExpandedState(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const node = flatNodes[index];

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = Math.min(index + 1, flatNodes.length - 1);
        setFocusedIndex(nextIndex);
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex = Math.max(index - 1, 0);
        setFocusedIndex(prevIndex);
        break;
      }

      case 'ArrowRight':
        e.preventDefault();
        if (node.type === 'folder') {
          if (!expandedState[node.path]) {
            // Expand folder
            toggleFolder(node.path);
          } else if (node.children && node.children.length > 0) {
            // Move to first child if already expanded
            setFocusedIndex(index + 1);
          }
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        if (node.type === 'folder' && expandedState[node.path]) {
          // Collapse folder
          toggleFolder(node.path);
        } else if (node.level > 0) {
          // Move to parent
          const parentIndex = flatNodes.findIndex(
            (n, i) => i < index && n.level === node.level - 1 && n.type === 'folder'
          );
          if (parentIndex !== -1) {
            setFocusedIndex(parentIndex);
          }
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (node.type === 'folder') {
          toggleFolder(node.path);
        }
        // For files, Link component handles navigation
        break;
    }
  }, [flatNodes, expandedState, toggleFolder]);

  // Focus management: move focus to focused element when index changes
  useEffect(() => {
    const element = itemRefs.current.get(focusedIndex);
    if (element) {
      element.focus();
    }
  }, [focusedIndex]);

  // Render tree items
  const renderItems = () => {
    if (shouldVirtualize) {
      // Virtual scrolling for large trees
      return virtualizer.getVirtualItems().map((virtualItem) => {
        const node = flatNodes[virtualItem.index];
        const isSelected = currentPath === node.path;
        const isExpanded = expandedState[node.path];
        const isFocused = virtualItem.index === focusedIndex;

        return (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={(el) => {
              if (el) itemRefs.current.set(virtualItem.index, el);
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <FileTreeItem
              node={node}
              isExpanded={isExpanded}
              isSelected={isSelected}
              onToggle={node.type === 'folder' ? () => toggleFolder(node.path) : undefined}
              onNavigate={onNavigate}
              owner={owner}
              repo={repo}
              branch={branch}
              tabIndex={isFocused ? 0 : -1}
              onKeyDown={(e) => handleKeyDown(e, virtualItem.index)}
            />
          </div>
        );
      });
    } else {
      // Standard rendering for small trees
      return flatNodes.map((node, index) => {
        const isSelected = currentPath === node.path;
        const isExpanded = expandedState[node.path];
        const isFocused = index === focusedIndex;

        return (
          <li
            key={node.path}
            ref={(el) => {
              if (el) itemRefs.current.set(index, el);
            }}
          >
            <FileTreeItem
              node={node}
              isExpanded={isExpanded}
              isSelected={isSelected}
              onToggle={node.type === 'folder' ? () => toggleFolder(node.path) : undefined}
              onNavigate={onNavigate}
              owner={owner}
              repo={repo}
              branch={branch}
              tabIndex={isFocused ? 0 : -1}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          </li>
        );
      });
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">No files in this repository</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="overflow-y-auto"
      style={{ height: '100%', maxHeight: 'calc(100vh - 64px)' }}
    >
      {shouldVirtualize ? (
        <ul
          role="tree"
          aria-label="File tree"
          className="p-2"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {renderItems()}
        </ul>
      ) : (
        <ul role="tree" aria-label="File tree" className="p-2">
          {renderItems()}
        </ul>
      )}
    </div>
  );
}
