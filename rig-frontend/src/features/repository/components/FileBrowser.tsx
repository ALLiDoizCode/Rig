/**
 * FileBrowser - Responsive file browser layout with file tree navigation
 *
 * Story 3.1: File Tree Navigation Component
 *
 * Provides responsive layout for file browsing:
 * - Mobile/Tablet (<1024px): Sheet drawer with toggle button
 * - Desktop (≥1024px): Persistent sidebar
 */

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { FileTree } from './FileTree';
import { useFileTree } from '../hooks/useFileTree';
import type { RigError } from '@/types/common';

interface FileBrowserProps {
  manifestId: string | null | undefined;
  owner?: string;
  repo?: string;
  branch?: string;
  children?: React.ReactNode;
}

function isRigError(error: unknown): error is RigError {
  return typeof error === 'object' && error !== null && 'userMessage' in error;
}

/**
 * FileBrowser component with responsive layout
 *
 * @example
 * ```tsx
 * <FileBrowser
 *   manifestId="arweave-manifest-tx-id"
 *   owner="ownerPubkey"
 *   repo="my-repo"
 *   branch="main"
 * >
 *   <FileViewer /> // Main content area
 * </FileBrowser>
 * ```
 */
export function FileBrowser({
  manifestId,
  owner,
  repo,
  branch,
  children,
}: FileBrowserProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { data: tree, status, error, refetch } = useFileTree(manifestId);

  // Close sheet when navigating to a file
  const handleNavigate = () => {
    setIsSheetOpen(false);
  };

  // Render file tree content based on status
  const renderFileTree = () => {
    if (status === 'error') {
      return (
        <div className="p-4">
          <div
            role="alert"
            className="p-4 border border-destructive rounded-lg bg-destructive/10"
          >
            <p className="text-sm font-medium mb-3">
              {isRigError(error) ? error.userMessage : 'Failed to load file tree'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    if (status === 'pending') {
      return (
        <div className="space-y-2 p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-11/12 ml-4" />
          <Skeleton className="h-8 w-10/12 ml-8" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-11/12 ml-4" />
          <Skeleton className="h-8 w-10/12 ml-8" />
          <Skeleton className="h-8 w-9/12 ml-8" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    return (
      <FileTree
        nodes={tree?.children || []}
        owner={owner}
        repo={repo}
        branch={branch}
        onNavigate={handleNavigate}
      />
    );
  };

  return (
    <>
      {/* Mobile/Tablet: Sheet drawer (<1024px) */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSheetOpen(true)}
          aria-label="Toggle file tree"
          className="mb-4"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="px-4 py-3 border-b bg-muted/30">
              <SheetTitle className="font-semibold text-sm">Files</SheetTitle>
              <SheetDescription className="sr-only">
                Navigate repository files and folders
              </SheetDescription>
            </SheetHeader>
            <div className="h-full overflow-y-auto">
              {renderFileTree()}
            </div>
          </SheetContent>
        </Sheet>

        {/* Main content for mobile/tablet */}
        {children && <div className="flex-1">{children}</div>}
      </div>

      {/* Desktop: Persistent sidebar (≥1024px) */}
      <div className="hidden lg:grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="border-r overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <div className="px-4 py-3 border-b bg-muted/30">
            <h2 className="font-semibold text-sm">Files</h2>
          </div>
          {renderFileTree()}
        </aside>

        {/* Main content for desktop */}
        <main className="overflow-y-auto pl-2" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>
    </>
  );
}
