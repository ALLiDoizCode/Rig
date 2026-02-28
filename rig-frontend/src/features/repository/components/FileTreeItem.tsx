/**
 * FileTreeItem - Individual file or folder item in the file tree
 *
 * Story 3.1: File Tree Navigation Component
 *
 * Renders a single file or folder with appropriate icon, indentation, and interactions.
 * Folders use Collapsible component for expand/collapse, files use Link for navigation.
 */

import React from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFileIcon } from '@/lib/utils/fileIcons';
import type { TreeNode } from '@/lib/utils/manifestParser';
import { cn } from '@/lib/utils';

interface FileTreeItemProps {
  node: TreeNode & { level: number };
  isExpanded?: boolean;
  isSelected?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  owner?: string;
  repo?: string;
  branch?: string;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

/**
 * FileTreeItem component for rendering individual files and folders
 *
 * Folders: Render with expand/collapse chevron and folder icon
 * Files: Render with file type icon and Link to file viewer
 *
 * @example
 * ```tsx
 * <FileTreeItem
 *   node={{ name: 'src', path: 'src', type: 'folder', level: 0, children: [] }}
 *   isExpanded={expandedState['src']}
 *   onToggle={() => toggleFolder('src')}
 * />
 * ```
 */
export function FileTreeItem({
  node,
  isExpanded = false,
  isSelected = false,
  onToggle,
  onNavigate,
  owner,
  repo,
  branch,
  tabIndex = -1,
  onKeyDown,
}: FileTreeItemProps) {
  const { name, type, level, extension, path } = node;
  const indentation = level * 16; // 16px per level

  const baseClasses = cn(
    'flex items-center gap-2 py-2 px-2 rounded-md transition-colors cursor-pointer',
    'hover:bg-accent/50 hover:text-accent-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
    'active:bg-accent/70',
    isSelected && 'bg-accent text-accent-foreground font-medium'
  );

  // Folder rendering with expand/collapse
  if (type === 'folder') {
    const FolderIcon = isExpanded ? FolderOpen : Folder;
    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

    return (
      <div
        role="treeitem"
        aria-level={level + 1}
        aria-expanded={isExpanded}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        className={baseClasses}
        style={{ paddingLeft: `${indentation + 8}px` }}
        onClick={onToggle}
      >
        <ChevronIcon className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
        <FolderIcon className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
        <span className="truncate text-sm">{name}</span>
      </div>
    );
  }

  // File rendering with Link navigation
  // Construct file viewer URL: /:owner/:repo/src/:branch/:path
  // SECURITY: Encode each segment to prevent path traversal and XSS attacks
  const fileUrl = owner && repo && branch
    ? `/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/src/${encodeURIComponent(branch)}/${path.split('/').map(encodeURIComponent).join('/')}`
    : '#';

  return (
    <Link
      to={fileUrl}
      role="treeitem"
      aria-level={level + 1}
      aria-label={`${name} file`}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      className={baseClasses}
      style={{ paddingLeft: `${indentation + 28}px` }} // Extra offset since no chevron
      onClick={onNavigate}
    >
      {React.createElement(getFileIcon(extension), {
        className: "h-4 w-4 shrink-0 text-muted-foreground/70",
        "aria-hidden": "true"
      })}
      <span className="truncate text-sm">{name}</span>
    </Link>
  );
}
