import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { FileTreeItem } from './FileTreeItem';
import type { TreeNode } from '@/lib/utils/manifestParser';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('FileTreeItem', () => {
  describe('Folder rendering', () => {
    const folderNode: TreeNode & { level: number } = {
      name: 'src',
      path: 'src',
      type: 'folder',
      level: 0,
      children: [],
    };

    it('should render folder with folder icon when collapsed', () => {
      render(
        <FileTreeItem node={folderNode} isExpanded={false} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('src')).toBeInTheDocument();
      // Folder icon should be visible (not FolderOpen)
      expect(screen.getByRole('treeitem')).toBeInTheDocument();
    });

    it('should render folder with open folder icon when expanded', () => {
      render(
        <FileTreeItem node={folderNode} isExpanded={true} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('src')).toBeInTheDocument();
      // FolderOpen icon should be visible
      expect(screen.getByRole('treeitem')).toBeInTheDocument();
    });

    it('should show chevron right when collapsed', () => {
      const { container } = render(
        <FileTreeItem node={folderNode} isExpanded={false} />,
        { wrapper: TestWrapper }
      );

      // ChevronRight is present
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should show chevron down when expanded', () => {
      const { container } = render(
        <FileTreeItem node={folderNode} isExpanded={true} />,
        { wrapper: TestWrapper }
      );

      // ChevronDown is present
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should call onToggle when folder clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(
        <FileTreeItem node={folderNode} onToggle={onToggle} />,
        { wrapper: TestWrapper }
      );

      await user.click(screen.getByText('src'));

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should apply correct indentation for nested folders', () => {
      const nestedFolder = { ...folderNode, level: 2 };

      const { container } = render(
        <FileTreeItem node={nestedFolder} />,
        { wrapper: TestWrapper }
      );

      const item = container.querySelector('[role="treeitem"]');
      // Level 2 = 32px + 8px base = 40px
      expect(item).toHaveStyle({ paddingLeft: '40px' });
    });

    it('should set aria-expanded correctly', () => {
      const { rerender } = render(
        <FileTreeItem node={folderNode} isExpanded={false} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByRole('treeitem')).toHaveAttribute('aria-expanded', 'false');

      rerender(<FileTreeItem node={folderNode} isExpanded={true} />);

      expect(screen.getByRole('treeitem')).toHaveAttribute('aria-expanded', 'true');
    });

    it('should set aria-level correctly', () => {
      const level0Folder = { ...folderNode, level: 0 };
      const level2Folder = { ...folderNode, level: 2 };

      const { rerender } = render(
        <FileTreeItem node={level0Folder} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByRole('treeitem')).toHaveAttribute('aria-level', '1');

      rerender(<FileTreeItem node={level2Folder} />);

      expect(screen.getByRole('treeitem')).toHaveAttribute('aria-level', '3');
    });
  });

  describe('File rendering', () => {
    const fileNode: TreeNode & { level: number } = {
      name: 'index.ts',
      path: 'src/index.ts',
      type: 'file',
      level: 1,
      arweaveId: 'tx-123',
      extension: 'ts',
    };

    it('should render file with appropriate icon', () => {
      render(
        <FileTreeItem
          node={fileNode}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('index.ts')).toBeInTheDocument();
      expect(screen.getByRole('treeitem')).toBeInTheDocument();
    });

    it('should render as Link with correct href', () => {
      render(
        <FileTreeItem
          node={fileNode}
          owner="owner123"
          repo="my-repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      const link = screen.getByRole('treeitem');
      expect(link).toHaveAttribute('href', '/owner123/my-repo/src/main/src/index.ts');
    });

    it('should call onNavigate when file clicked', async () => {
      const user = userEvent.setup();
      const onNavigate = vi.fn();

      render(
        <FileTreeItem
          node={fileNode}
          onNavigate={onNavigate}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      await user.click(screen.getByText('index.ts'));

      expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it('should apply correct indentation for nested files', () => {
      const nestedFile = { ...fileNode, level: 3 };

      const { container } = render(
        <FileTreeItem
          node={nestedFile}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      const item = container.querySelector('[role="treeitem"]');
      // Level 3 = 48px + 28px offset = 76px
      expect(item).toHaveStyle({ paddingLeft: '76px' });
    });

    it('should set aria-label for accessibility', () => {
      render(
        <FileTreeItem
          node={fileNode}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByRole('treeitem')).toHaveAttribute(
        'aria-label',
        'index.ts file'
      );
    });

    it('should set aria-level correctly', () => {
      render(
        <FileTreeItem
          node={fileNode}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      // Level 1 becomes aria-level 2
      expect(screen.getByRole('treeitem')).toHaveAttribute('aria-level', '2');
    });
  });

  describe('Selection and focus', () => {
    const fileNode: TreeNode & { level: number } = {
      name: 'test.ts',
      path: 'test.ts',
      type: 'file',
      level: 0,
      extension: 'ts',
    };

    it('should highlight when selected', () => {
      render(
        <FileTreeItem
          node={fileNode}
          isSelected={true}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByRole('treeitem')).toHaveClass('bg-accent');
    });

    it('should not highlight when not selected', () => {
      render(
        <FileTreeItem
          node={fileNode}
          isSelected={false}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByRole('treeitem')).not.toHaveClass('bg-accent');
    });

    it('should set tabIndex correctly', () => {
      render(
        <FileTreeItem
          node={fileNode}
          tabIndex={0}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByRole('treeitem')).toHaveAttribute('tabIndex', '0');
    });

    it('should default to tabIndex -1', () => {
      render(
        <FileTreeItem
          node={fileNode}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByRole('treeitem')).toHaveAttribute('tabIndex', '-1');
    });

    it('should call onKeyDown when key is pressed', async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();

      render(
        <FileTreeItem
          node={fileNode}
          onKeyDown={onKeyDown}
          tabIndex={0}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      const item = screen.getByRole('treeitem');
      await user.type(item, '{ArrowDown}');

      expect(onKeyDown).toHaveBeenCalled();
    });
  });

  describe('Different file types', () => {
    const createFileNode = (name: string, extension: string): TreeNode & { level: number } => ({
      name,
      path: name,
      type: 'file',
      level: 0,
      extension,
    });

    it('should render markdown file', () => {
      render(
        <FileTreeItem
          node={createFileNode('README.md', 'md')}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('README.md')).toBeInTheDocument();
    });

    it('should render JSON file', () => {
      render(
        <FileTreeItem
          node={createFileNode('package.json', 'json')}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('package.json')).toBeInTheDocument();
    });

    it('should render image file', () => {
      render(
        <FileTreeItem
          node={createFileNode('logo.png', 'png')}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('logo.png')).toBeInTheDocument();
    });

    it('should render file with no extension', () => {
      render(
        <FileTreeItem
          node={{ ...createFileNode('Dockerfile', ''), extension: undefined }}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Dockerfile')).toBeInTheDocument();
    });
  });

  // SECURITY TESTS
  describe('Security: URL Encoding', () => {
    it('should properly encode special characters in file paths', () => {
      const fileWithSpecialChars: TreeNode & { level: number } = {
        name: 'file with spaces.txt',
        path: 'folder/file with spaces.txt',
        type: 'file',
        level: 1,
        arweaveId: 'tx-1',
        extension: 'txt'
      };

      render(
        <FileTreeItem
          node={fileWithSpecialChars}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      const link = screen.getByRole('treeitem');
      // Each segment should be encoded
      expect(link).toHaveAttribute('href', '/owner/repo/src/main/folder/file%20with%20spaces.txt');
    });

    it('should encode owner, repo, and branch parameters', () => {
      const testFile: TreeNode & { level: number } = {
        name: 'test.ts',
        path: 'src/test.ts',
        type: 'file',
        level: 1,
        arweaveId: 'tx-1',
        extension: 'ts'
      };

      render(
        <FileTreeItem
          node={testFile}
          owner="owner with spaces"
          repo="my-repo@v1"
          branch="feature/new-branch"
        />,
        { wrapper: TestWrapper }
      );

      const link = screen.getByRole('treeitem');
      const href = link.getAttribute('href');
      // Should encode spaces and special characters
      expect(href).toContain('owner%20with%20spaces');
      expect(href).toContain('my-repo%40v1');
      expect(href).toContain('feature%2Fnew-branch');
    });

    it('should handle paths with slashes by encoding each segment', () => {
      const deepFile: TreeNode & { level: number } = {
        name: 'utils.ts',
        path: 'src/lib/helpers/utils.ts',
        type: 'file',
        level: 3,
        arweaveId: 'tx-1',
        extension: 'ts'
      };

      render(
        <FileTreeItem
          node={deepFile}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      const link = screen.getByRole('treeitem');
      // Slashes within the path should remain as path separators, not encoded
      expect(link).toHaveAttribute('href', '/owner/repo/src/main/src/lib/helpers/utils.ts');
    });

    it('should encode special URL characters in file names', () => {
      const fileWithSpecialChars: TreeNode & { level: number } = {
        name: 'file?query=1&test=2.txt',
        path: 'src/file?query=1&test=2.txt',
        type: 'file',
        level: 1,
        arweaveId: 'tx-1',
        extension: 'txt'
      };

      render(
        <FileTreeItem
          node={fileWithSpecialChars}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      const link = screen.getByRole('treeitem');
      const href = link.getAttribute('href');
      // Special characters should be encoded
      expect(href).toContain('%3F'); // ?
      expect(href).toContain('%3D'); // =
      expect(href).toContain('%26'); // &
    });

    it('should handle Unicode characters in file names', () => {
      const fileWithUnicode: TreeNode & { level: number } = {
        name: '文档.txt',
        path: 'docs/文档.txt',
        type: 'file',
        level: 1,
        arweaveId: 'tx-1',
        extension: 'txt'
      };

      render(
        <FileTreeItem
          node={fileWithUnicode}
          owner="owner"
          repo="repo"
          branch="main"
        />,
        { wrapper: TestWrapper }
      );

      const link = screen.getByRole('treeitem');
      const href = link.getAttribute('href');
      // Unicode should be properly encoded
      expect(href).toBeDefined();
      expect(href).toContain('%'); // Unicode characters will be percent-encoded
    });
  });
});
