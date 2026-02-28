import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { FileTree } from './FileTree';
import type { TreeNode } from '@/lib/utils/manifestParser';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('FileTree', () => {
  const sampleNodes: TreeNode[] = [
    {
      name: 'src',
      path: 'src',
      type: 'folder',
      children: [
        {
          name: 'index.ts',
          path: 'src/index.ts',
          type: 'file',
          arweaveId: 'tx-1',
          extension: 'ts',
        },
        {
          name: 'lib',
          path: 'src/lib',
          type: 'folder',
          children: [
            {
              name: 'utils.ts',
              path: 'src/lib/utils.ts',
              type: 'file',
              arweaveId: 'tx-2',
              extension: 'ts',
            },
          ],
        },
      ],
    },
    {
      name: 'README.md',
      path: 'README.md',
      type: 'file',
      arweaveId: 'tx-3',
      extension: 'md',
    },
  ];

  it('should render empty state when nodes array is empty', () => {
    render(<FileTree nodes={[]} />, { wrapper: TestWrapper });

    expect(screen.getByText('No files in this repository')).toBeInTheDocument();
  });

  it('should render tree with root level items', () => {
    render(
      <FileTree nodes={sampleNodes} owner="owner" repo="repo" branch="main" />,
      { wrapper: TestWrapper }
    );

    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('README.md')).toBeInTheDocument();
  });

  it('should expand folder on click', async () => {
    const user = userEvent.setup();

    render(
      <FileTree nodes={sampleNodes} owner="owner" repo="repo" branch="main" />,
      { wrapper: TestWrapper }
    );

    // Initially, child items should not be visible
    expect(screen.queryByText('index.ts')).not.toBeInTheDocument();

    // Click the folder to expand
    await user.click(screen.getByText('src'));

    // Child items should now be visible
    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('lib')).toBeInTheDocument();
  });

  it('should collapse folder on second click', async () => {
    const user = userEvent.setup();

    render(
      <FileTree nodes={sampleNodes} owner="owner" repo="repo" branch="main" />,
      { wrapper: TestWrapper }
    );

    // Expand
    await user.click(screen.getByText('src'));
    expect(screen.getByText('index.ts')).toBeInTheDocument();

    // Collapse
    await user.click(screen.getByText('src'));
    expect(screen.queryByText('index.ts')).not.toBeInTheDocument();
  });

  it('should expand nested folders', async () => {
    const user = userEvent.setup();

    render(
      <FileTree nodes={sampleNodes} owner="owner" repo="repo" branch="main" />,
      { wrapper: TestWrapper }
    );

    // Expand src folder
    await user.click(screen.getByText('src'));
    expect(screen.getByText('lib')).toBeInTheDocument();

    // Initially, nested file should not be visible
    expect(screen.queryByText('utils.ts')).not.toBeInTheDocument();

    // Expand lib folder
    await user.click(screen.getByText('lib'));

    // Nested file should now be visible
    expect(screen.getByText('utils.ts')).toBeInTheDocument();
  });

  it('should maintain multiple folders expanded simultaneously', async () => {
    const user = userEvent.setup();

    const multipleRootFolders: TreeNode[] = [
      {
        name: 'folder1',
        path: 'folder1',
        type: 'folder',
        children: [
          {
            name: 'file1.ts',
            path: 'folder1/file1.ts',
            type: 'file',
            arweaveId: 'tx-1',
            extension: 'ts',
          },
        ],
      },
      {
        name: 'folder2',
        path: 'folder2',
        type: 'folder',
        children: [
          {
            name: 'file2.ts',
            path: 'folder2/file2.ts',
            type: 'file',
            arweaveId: 'tx-2',
            extension: 'ts',
          },
        ],
      },
    ];

    render(
      <FileTree nodes={multipleRootFolders} owner="owner" repo="repo" branch="main" />,
      { wrapper: TestWrapper }
    );

    // Expand both folders
    await user.click(screen.getByText('folder1'));
    await user.click(screen.getByText('folder2'));

    // Both should be expanded
    expect(screen.getByText('file1.ts')).toBeInTheDocument();
    expect(screen.getByText('file2.ts')).toBeInTheDocument();
  });

  it('should call onNavigate when file is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <FileTree
        nodes={sampleNodes}
        owner="owner"
        repo="repo"
        branch="main"
        onNavigate={onNavigate}
      />,
      { wrapper: TestWrapper }
    );

    await user.click(screen.getByText('README.md'));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('should set proper ARIA tree role', () => {
    render(
      <FileTree nodes={sampleNodes} owner="owner" repo="repo" branch="main" />,
      { wrapper: TestWrapper }
    );

    expect(screen.getByRole('tree')).toBeInTheDocument();
    expect(screen.getByRole('tree')).toHaveAttribute('aria-label', 'File tree');
  });

  it('should handle keyboard navigation - ArrowDown', async () => {
    const user = userEvent.setup();

    render(
      <FileTree nodes={sampleNodes} owner="owner" repo="repo" branch="main" />,
      { wrapper: TestWrapper }
    );

    const items = screen.getAllByRole('treeitem');
    const firstItem = items[0];

    // Focus first item
    firstItem.focus();
    expect(document.activeElement).toBe(firstItem);

    // Press ArrowDown
    await user.keyboard('{ArrowDown}');

    // Focus should move to second item (verify focused index changed)
    // Note: In the non-virtualized tree, items are wrapped in <li>
    const secondItemContent = items[1];
    expect(secondItemContent).toHaveAttribute('tabIndex', '0');
  });

  it('should handle keyboard navigation - Enter to expand folder', async () => {
    const user = userEvent.setup();

    render(
      <FileTree nodes={sampleNodes} owner="owner" repo="repo" branch="main" />,
      { wrapper: TestWrapper }
    );

    // Initially, child items should not be visible
    expect(screen.queryByText('index.ts')).not.toBeInTheDocument();

    // Focus and press Enter on src folder
    const srcFolder = screen.getByText('src');
    srcFolder.focus();
    await user.keyboard('{Enter}');

    // Child items should now be visible
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });

  it('should handle keyboard navigation - ArrowRight to expand folder', async () => {
    const user = userEvent.setup();

    render(
      <FileTree nodes={sampleNodes} owner="owner" repo="repo" branch="main" />,
      { wrapper: TestWrapper }
    );

    // Focus src folder
    const srcFolder = screen.getByText('src');
    srcFolder.focus();

    // Press ArrowRight to expand
    await user.keyboard('{ArrowRight}');

    // Child items should be visible
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });

  it('should handle keyboard navigation - ArrowLeft to collapse folder', async () => {
    const user = userEvent.setup();

    render(
      <FileTree nodes={sampleNodes} owner="owner" repo="repo" branch="main" />,
      { wrapper: TestWrapper }
    );

    const srcFolder = screen.getByText('src');
    srcFolder.focus();

    // Expand
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('index.ts')).toBeInTheDocument();

    // Collapse
    await user.keyboard('{ArrowLeft}');
    expect(screen.queryByText('index.ts')).not.toBeInTheDocument();
  });
});
