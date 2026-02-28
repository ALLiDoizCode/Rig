/**
 * E2E Tests: File Tree Navigation Component
 *
 * Story 3.1: File Tree Navigation Component
 *
 * Tests the file browser with hierarchical file tree navigation,
 * responsive layouts, keyboard navigation, and accessibility.
 *
 * Test Coverage:
 * - File tree loads and displays correctly
 * - Expand/collapse folder functionality
 * - File navigation via clicks
 * - Mobile Sheet drawer functionality
 * - Desktop persistent sidebar
 * - Keyboard navigation (Arrow keys, Enter)
 * - Large tree virtual scrolling performance
 * - Screen reader accessibility
 */

import { test, expect } from '@playwright/test';

/**
 * Setup manifest mock routes for all Arweave gateway patterns
 *
 * Uses addInitScript to mock fetch at the browser level to avoid
 * "Illegal invocation" errors that occur with route.fulfill()
 */
async function setupManifestMock(page: any, manifest: any) {
  await page.addInitScript((manifestData) => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = function(...args: any[]) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;

      if (url && url.includes('demo-manifest-id')) {
        return Promise.resolve(new Response(JSON.stringify(manifestData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }));
      }

      return originalFetch(...args);
    };
  }, manifest);
}

/**
 * Mock manifest data for testing
 * Creates a hierarchical structure with nested folders and files
 */
const mockManifest = {
  manifest: 'arweave/paths',
  version: '0.1.0',
  paths: {
    'README.md': { id: 'readme-tx-id' },
    'package.json': { id: 'package-tx-id' },
    'src/index.ts': { id: 'index-tx-id' },
    'src/lib/utils.ts': { id: 'utils-tx-id' },
    'src/lib/helpers.ts': { id: 'helpers-tx-id' },
    'src/components/Button.tsx': { id: 'button-tx-id' },
    'src/components/Card.tsx': { id: 'card-tx-id' },
    'tests/unit/example.test.ts': { id: 'test-tx-id' },
  },
};

/**
 * Large manifest for virtual scrolling performance tests
 * Generates 500+ files across multiple folders
 */
function generateLargeManifest(fileCount: number = 500) {
  const paths: Record<string, { id: string }> = {};

  for (let i = 0; i < fileCount; i++) {
    const folderIndex = Math.floor(i / 50); // 50 files per folder
    const fileName = `file-${i}.ts`;
    const path = `folder-${folderIndex}/${fileName}`;
    paths[path] = { id: `tx-${i}` };
  }

  return {
    manifest: 'arweave/paths',
    version: '0.1.0',
    paths,
  };
}

test.describe('File Tree Navigation - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupManifestMock(page, mockManifest);
  });

  test('[AC #1] should load and display file tree when navigating to file browser', async ({ page }) => {
    await page.goto('/alice/my-repo/src/main');

    // Wait for file tree to load
    await expect(page.getByRole('tree', { name: 'File tree' })).toBeVisible();

    // Verify root files are visible
    await expect(page.getByRole('treeitem', { name: /README\.md/ })).toBeVisible();
    await expect(page.getByRole('treeitem', { name: /package\.json/ })).toBeVisible();

    // Verify folders are visible
    await expect(page.getByRole('treeitem', { name: /src/ })).toBeVisible();
    await expect(page.getByRole('treeitem', { name: /tests/ })).toBeVisible();
  });

  test('[AC #2, #3] should expand folder and show children when clicked', async ({ page }) => {
    await page.goto('/alice/my-repo/src/main');

    // Initially, src children should not be visible
    await expect(page.getByRole('treeitem', { name: /index\.ts/ })).not.toBeVisible();

    // Click to expand src folder
    const srcFolder = page.getByRole('treeitem', { name: /^src/ });
    await srcFolder.click();

    // Verify folder is expanded (aria-expanded should be true)
    await expect(srcFolder).toHaveAttribute('aria-expanded', 'true');

    // Verify children are now visible
    await expect(page.getByRole('treeitem', { name: /index\.ts/ })).toBeVisible();

    // Expand nested folder
    const libFolder = page.getByRole('treeitem', { name: /^lib/ });
    await libFolder.click();

    await expect(page.getByRole('treeitem', { name: /utils\.ts/ })).toBeVisible();
    await expect(page.getByRole('treeitem', { name: /helpers\.ts/ })).toBeVisible();
  });

  test('[AC #3] should collapse folder when clicked again', async ({ page }) => {
    await page.goto('/alice/my-repo/src/main');

    // Expand src folder
    const srcFolder = page.getByRole('treeitem', { name: /^src/ });
    await srcFolder.click();
    await expect(page.getByRole('treeitem', { name: /index\.ts/ })).toBeVisible();

    // Collapse src folder
    await srcFolder.click();
    await expect(srcFolder).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('treeitem', { name: /index\.ts/ })).not.toBeVisible();
  });

  test('[AC #4] should navigate to file viewer when file is clicked', async ({ page }) => {
    await page.goto('/alice/my-repo/src/main');

    // Expand src folder to reveal files
    await page.getByRole('treeitem', { name: /^src/ }).click();

    // Click on index.ts file
    await page.getByRole('treeitem', { name: /index\.ts/ }).click();

    // Verify URL changed to file path
    await expect(page).toHaveURL('/alice/my-repo/src/main/src/index.ts');
  });

  test('[AC #5] should highlight currently selected file based on URL', async ({ page }) => {
    await page.goto('/alice/my-repo/src/main/src/index.ts');

    // Expand src folder
    await page.getByRole('treeitem', { name: /^src/ }).click();

    // Verify index.ts is highlighted (has bg-accent class)
    const indexFile = page.getByRole('treeitem', { name: /index\.ts/ });
    await expect(indexFile).toHaveClass(/bg-accent/);
  });
});

test.describe('File Tree Navigation - Responsive Layouts', () => {
  test.beforeEach(async ({ page }) => {
    await setupManifestMock(page, mockManifest);
  });

  test('[AC #6, #8] should show Sheet drawer on mobile (<1024px)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/alice/my-repo/src/main');

    // Verify toggle button is visible
    const toggleButton = page.getByRole('button', { name: 'Toggle file tree' });
    await expect(toggleButton).toBeVisible();

    // Sheet should be closed initially
    await expect(page.getByRole('tree')).not.toBeVisible();

    // Click toggle to open Sheet
    await toggleButton.click();

    // Sheet should now be visible
    await expect(page.getByRole('tree')).toBeVisible();
  });

  test('[AC #6] should close Sheet on file selection', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/alice/my-repo/src/main');

    // Open Sheet
    await page.getByRole('button', { name: 'Toggle file tree' }).click();
    await expect(page.getByRole('tree')).toBeVisible();

    // Click on a file
    await page.getByRole('treeitem', { name: /README\.md/ }).click();

    // Sheet should close after navigation
    await expect(page.getByRole('tree')).not.toBeVisible();
  });

  test('[AC #7] should show persistent sidebar on desktop (≥1024px)', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/alice/my-repo/src/main');

    // File tree should be visible immediately (no toggle button)
    await expect(page.getByRole('tree')).toBeVisible();

    // Toggle button should NOT be visible
    await expect(page.getByRole('button', { name: 'Toggle file tree' })).not.toBeVisible();

    // Sidebar should be persistent (always visible)
    await page.getByRole('treeitem', { name: /README\.md/ }).click();
    await expect(page.getByRole('tree')).toBeVisible();
  });

  test('[AC #8] should show Sheet drawer on tablet (768-1023px)', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/alice/my-repo/src/main');

    // Verify toggle button is visible (same as mobile)
    await expect(page.getByRole('button', { name: 'Toggle file tree' })).toBeVisible();
  });
});

test.describe('File Tree Navigation - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupManifestMock(page, mockManifest);
  });

  test('[AC #9] should navigate tree with ArrowDown and ArrowUp keys', async ({ page }) => {
    await page.goto('/alice/my-repo/src/main');

    // Wait for tree to load
    await expect(page.getByRole('tree')).toBeVisible();

    // Focus on tree - wait for first item to be focusable
    const firstItem = page.getByRole('treeitem').first();
    await firstItem.focus();
    await expect(firstItem).toHaveAttribute('tabindex', '0');

    // Press ArrowDown to move to next item
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100); // Wait for focus update

    // Second item should now have focus
    const secondItem = page.getByRole('treeitem').nth(1);
    await expect(secondItem).toHaveAttribute('tabindex', '0');

    // Press ArrowUp to move back
    await page.keyboard.press('ArrowUp');
    await expect(firstItem).toHaveAttribute('tabindex', '0');
  });

  test('[AC #9] should expand folder with ArrowRight key', async ({ page }) => {
    await page.goto('/alice/my-repo/src/main');

    // Focus on src folder
    const srcFolder = page.getByRole('treeitem', { name: /^src/ });
    await srcFolder.focus();

    // Press ArrowRight to expand
    await page.keyboard.press('ArrowRight');

    // Folder should be expanded
    await expect(srcFolder).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('treeitem', { name: /index\.ts/ })).toBeVisible();
  });

  test('[AC #9] should collapse folder with ArrowLeft key', async ({ page }) => {
    await page.goto('/alice/my-repo/src/main');

    // Expand and focus on src folder
    const srcFolder = page.getByRole('treeitem', { name: /^src/ });
    await srcFolder.click();
    await srcFolder.focus();

    // Press ArrowLeft to collapse
    await page.keyboard.press('ArrowLeft');

    // Folder should be collapsed
    await expect(srcFolder).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('treeitem', { name: /index\.ts/ })).not.toBeVisible();
  });

  test('[AC #9] should toggle folder with Enter/Space keys', async ({ page }) => {
    await page.goto('/alice/my-repo/src/main');

    const srcFolder = page.getByRole('treeitem', { name: /^src/ });
    await srcFolder.focus();

    // Press Enter to expand
    await page.keyboard.press('Enter');
    await expect(srcFolder).toHaveAttribute('aria-expanded', 'true');

    // Press Space to collapse
    await page.keyboard.press(' ');
    await expect(srcFolder).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('File Tree Navigation - Virtual Scrolling Performance', () => {
  test('[AC #11] should render large tree (500+ items) without lag', async ({ page }) => {
    // Mock large manifest
    const largeManifest = generateLargeManifest(500);
    await setupManifestMock(page, largeManifest);

    await page.goto('/alice/my-repo/src/main');

    // Expand all folders to maximize visible items
    const folders = await page.getByRole('treeitem', { name: /^folder-/ }).all();
    for (const folder of folders.slice(0, 10)) {
      // Expand first 10 folders to get >100 items
      await folder.click();
    }

    // Measure scroll performance
    const startTime = Date.now();

    // Scroll to bottom of tree
    await page.evaluate(() => {
      const treeContainer = document.querySelector('[role="tree"]')?.parentElement;
      if (treeContainer) {
        treeContainer.scrollTo(0, treeContainer.scrollHeight);
      }
    });

    const scrollTime = Date.now() - startTime;

    // Scroll should complete quickly (<100ms for smooth 60fps)
    expect(scrollTime).toBeLessThan(100);

    // Verify items are still visible and interactive
    await expect(page.getByRole('treeitem').last()).toBeVisible();
  });
});

test.describe('File Tree Navigation - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupManifestMock(page, mockManifest);
  });

  test('[AC #10] should have proper ARIA tree structure', async ({ page }) => {
    await page.goto('/alice/my-repo/src/main');

    // Verify tree role
    const tree = page.getByRole('tree', { name: 'File tree' });
    await expect(tree).toBeVisible();

    // Verify treeitem roles
    const items = page.getByRole('treeitem').all();
    expect((await items).length).toBeGreaterThan(0);

    // Verify aria-level attributes
    const rootItem = page.getByRole('treeitem').first();
    await expect(rootItem).toHaveAttribute('aria-level', '1');
  });

  test('[AC #10] should have aria-expanded on folders', async ({ page }) => {
    await page.goto('/alice/my-repo/src/main');

    const srcFolder = page.getByRole('treeitem', { name: /^src/ });

    // Initially collapsed
    await expect(srcFolder).toHaveAttribute('aria-expanded', 'false');

    // After expanding
    await srcFolder.click();
    await expect(srcFolder).toHaveAttribute('aria-expanded', 'true');
  });

  test('[AC #10] should have aria-label on file items', async ({ page }) => {
    await page.goto('/alice/my-repo/src/main');

    // Verify files have descriptive labels
    await expect(page.getByRole('treeitem', { name: /README\.md file/ })).toBeVisible();
  });

  test('[AC #9] should have focus indicators', async ({ page }) => {
    await page.goto('/alice/my-repo/src/main');

    // Focus on first item
    await page.keyboard.press('Tab');
    const firstItem = page.getByRole('treeitem').first();

    // Verify focus-visible ring is applied
    await expect(firstItem).toHaveClass(/focus-visible:ring-2/);
  });
});

test.describe('File Tree Navigation - Error Handling', () => {
  test('should show error state when manifest fetch fails', async ({ page }) => {
    // Mock failed manifest fetch using addInitScript
    await page.addInitScript(() => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = function(...args: any[]) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;

        if (url && url.includes('demo-manifest-id')) {
          return Promise.reject(new Error('Network error'));
        }

        return originalFetch(...args);
      };
    });

    await page.goto('/alice/my-repo/src/main');

    // Wait for error state to appear (TanStack Query retries 2 times by default)
    // This may take a few seconds due to retry logic
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Unable to fetch repository manifest/i)).toBeVisible();

    // Verify retry button is present
    await expect(page.getByRole('button', { name: /Try Again/i })).toBeVisible();
  });

  test('should show empty state when manifest has no files', async ({ page }) => {
    // Mock empty manifest using addInitScript
    await page.addInitScript(() => {
      const originalFetch = window.fetch.bind(window);
      const emptyManifest = {
        manifest: 'arweave/paths',
        version: '0.1.0',
        paths: {},
      };

      window.fetch = function(...args: any[]) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;

        if (url && url.includes('demo-manifest-id')) {
          return Promise.resolve(new Response(JSON.stringify(emptyManifest), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }));
        }

        return originalFetch(...args);
      };
    });

    await page.goto('/alice/my-repo/src/main');

    // Verify empty state message
    await expect(page.getByText(/No files in this repository/i)).toBeVisible();
  });
});

test.describe('File Tree Navigation - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await setupManifestMock(page, mockManifest);
  });

  test('[Task 8.10] should match visual snapshot - mobile layout with Sheet closed', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/alice/my-repo/src/main');

    // Wait for page to load
    await expect(page.getByRole('button', { name: 'Toggle file tree' })).toBeVisible();

    // Take screenshot with Sheet closed (default state)
    await expect(page).toHaveScreenshot('file-tree-mobile-closed.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('[Task 8.10] should match visual snapshot - mobile layout with Sheet open', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/alice/my-repo/src/main');

    // Open Sheet
    await page.getByRole('button', { name: 'Toggle file tree' }).click();
    await expect(page.getByRole('tree')).toBeVisible();

    // Take screenshot with Sheet open
    await expect(page).toHaveScreenshot('file-tree-mobile-open.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('[Task 8.10] should match visual snapshot - mobile layout with expanded folder', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/alice/my-repo/src/main');

    // Open Sheet and expand src folder
    await page.getByRole('button', { name: 'Toggle file tree' }).click();
    await page.getByRole('treeitem', { name: /^src/ }).click();
    await expect(page.getByRole('treeitem', { name: /index\.ts/ })).toBeVisible();

    // Take screenshot
    await expect(page).toHaveScreenshot('file-tree-mobile-expanded.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('[Task 8.10] should match visual snapshot - tablet layout with Sheet closed', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/alice/my-repo/src/main');

    // Wait for page to load
    await expect(page.getByRole('button', { name: 'Toggle file tree' })).toBeVisible();

    // Take screenshot with Sheet closed
    await expect(page).toHaveScreenshot('file-tree-tablet-closed.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('[Task 8.10] should match visual snapshot - tablet layout with Sheet open', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/alice/my-repo/src/main');

    // Open Sheet
    await page.getByRole('button', { name: 'Toggle file tree' }).click();
    await expect(page.getByRole('tree')).toBeVisible();

    // Take screenshot with Sheet open
    await expect(page).toHaveScreenshot('file-tree-tablet-open.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('[Task 8.10] should match visual snapshot - desktop layout with sidebar', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/alice/my-repo/src/main');

    // Wait for sidebar to be visible
    await expect(page.getByRole('tree')).toBeVisible();

    // Take screenshot with persistent sidebar
    await expect(page).toHaveScreenshot('file-tree-desktop-sidebar.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('[Task 8.10] should match visual snapshot - desktop with expanded folders', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/alice/my-repo/src/main');

    // Expand src and lib folders
    await page.getByRole('treeitem', { name: /^src/ }).click();
    await page.getByRole('treeitem', { name: /^lib/ }).click();
    await expect(page.getByRole('treeitem', { name: /utils\.ts/ })).toBeVisible();

    // Take screenshot
    await expect(page).toHaveScreenshot('file-tree-desktop-expanded.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('[Task 8.10] should match visual snapshot - desktop with file selected', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/alice/my-repo/src/main/README.md');

    // Wait for tree to load
    await expect(page.getByRole('tree')).toBeVisible();

    // README.md should be highlighted
    await expect(page.getByRole('treeitem', { name: /README\.md/ })).toHaveClass(/bg-accent/);

    // Take screenshot
    await expect(page).toHaveScreenshot('file-tree-desktop-selected.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('[Task 8.10] should match visual snapshot - file tree component isolated', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/alice/my-repo/src/main');

    // Wait for tree to be visible
    const tree = page.getByRole('tree');
    await expect(tree).toBeVisible();

    // Take component-level screenshot (isolated tree)
    await expect(tree).toHaveScreenshot('file-tree-component-isolated.png', {
      animations: 'disabled',
    });
  });

  test('[Task 8.10] should match visual snapshot - file tree with focus indicator', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/alice/my-repo/src/main');

    // Focus on first tree item
    const firstItem = page.getByRole('treeitem').first();
    await firstItem.focus();

    // Take screenshot to verify focus ring is visible
    await expect(firstItem).toHaveScreenshot('file-tree-focus-indicator.png', {
      animations: 'disabled',
    });
  });

  test('[Task 8.10] should match visual snapshot - empty state', async ({ page }) => {
    // Mock empty manifest
    await page.addInitScript(() => {
      const originalFetch = window.fetch.bind(window);
      const emptyManifest = {
        manifest: 'arweave/paths',
        version: '0.1.0',
        paths: {},
      };

      window.fetch = function(...args: any[]) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;

        if (url && url.includes('demo-manifest-id')) {
          return Promise.resolve(new Response(JSON.stringify(emptyManifest), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }));
        }

        return originalFetch(...args);
      };
    });

    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/alice/my-repo/src/main');

    // Wait for empty state message
    await expect(page.getByText(/No files in this repository/i)).toBeVisible();

    // Take screenshot
    await expect(page).toHaveScreenshot('file-tree-empty-state.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('[Task 8.10] should match visual snapshot - error state', async ({ page }) => {
    // Mock failed manifest fetch
    await page.addInitScript(() => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = function(...args: any[]) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;

        if (url && url.includes('demo-manifest-id')) {
          return Promise.reject(new Error('Network error'));
        }

        return originalFetch(...args);
      };
    });

    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/alice/my-repo/src/main');

    // Wait for error state to appear
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });

    // Take screenshot
    await expect(page).toHaveScreenshot('file-tree-error-state.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('[Task 8.10] should match visual snapshot - large tree with virtual scrolling', async ({ page }) => {
    // Mock large manifest
    const largeManifest = generateLargeManifest(500);
    await setupManifestMock(page, largeManifest);

    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/alice/my-repo/src/main');

    // Expand first few folders to show virtual scrolling in action
    const folders = await page.getByRole('treeitem', { name: /^folder-/ }).all();
    for (const folder of folders.slice(0, 5)) {
      await folder.click();
    }

    // Wait for tree to render with many items visible
    await page.waitForTimeout(500);

    // Take screenshot showing virtual scrolling with many items
    await expect(page).toHaveScreenshot('file-tree-virtual-scrolling.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
