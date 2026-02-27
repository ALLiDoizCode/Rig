/**
 * Route configuration for React Router v7
 *
 * Defines the application's routing structure with Forgejo-compatible URL patterns.
 * Exported for use in both production (createBrowserRouter) and testing (createMemoryRouter).
 *
 * Uses route-level `lazy` for code splitting (React Router v7 feature).
 * Each lazy-loaded module must export a named `Component` (capital C).
 */

import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { ROUTE_PATHS } from './constants/routes'
import { AppLayout } from './components/layout/AppLayout'
import { Skeleton } from './components/ui/skeleton'

/**
 * Page-level skeleton fallback for Suspense boundaries.
 *
 * Renders a content-representative loading skeleton while lazy-loaded
 * route components are being fetched. Provides better perceived performance
 * than a plain "Loading..." text.
 */
// eslint-disable-next-line react-refresh/only-export-components
function PageSkeleton() {
  return (
    <div className="p-6 space-y-6" role="status" aria-label="Loading page">
      {/* Page title skeleton */}
      <Skeleton className="h-8 w-[260px]" />
      {/* Content block skeletons */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[70%]" />
      </div>
      {/* Card-like content skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Root layout component
 *
 * Provides a shell for all routes with <Outlet> for nested routing.
 * Wraps outlet in Suspense for lazy-loaded route components.
 * Uses AppLayout to provide consistent Header, Sidebar, and Footer across all pages.
 *
 * Note: This component is internal to the routes configuration and doesn't need Fast Refresh.
 * The routes array export is required for testing with createMemoryRouter.
 */
// eslint-disable-next-line react-refresh/only-export-components
function RootLayout() {
  return (
    <AppLayout>
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    </AppLayout>
  )
}

/**
 * Hydrate fallback for the root route.
 * Suppresses React Router warning during non-SSR rendering.
 */
// eslint-disable-next-line react-refresh/only-export-components
function HydrateFallback() {
  return null
}

/**
 * Application route configuration
 *
 * Implements Forgejo-compatible URL structure for Git repository browsing:
 * - / - Home page (repository discovery)
 * - /:owner/:repo - Repository detail
 * - /:owner/:repo/src/:branch/* - File browser with branch and path
 * - /:owner/:repo/commits - Commit history
 * - /:owner/:repo/commit/:hash - Commit detail
 * - /:owner/:repo/issues - Issue list
 * - /:owner/:repo/issues/:id - Issue detail
 * - /:owner/:repo/pulls - Pull request list
 * - /:owner/:repo/pulls/:id - Pull request detail
 * - * - 404 Not Found (catch-all)
 */
export const routes = [
  {
    path: ROUTE_PATHS.ROOT,
    Component: RootLayout,
    HydrateFallback,
    children: [
      // Home page - repository discovery
      { index: true, lazy: () => import('./pages/Home') },

      // Repository routes with nested structure
      {
        path: ROUTE_PATHS.OWNER_REPO,
        children: [
          // Repository detail (index route)
          { index: true, lazy: () => import('./pages/RepoDetail') },

          // File browser with branch and file path
          { path: ROUTE_PATHS.FILE_BROWSER, lazy: () => import('./pages/FileBrowser') },

          // Commit routes
          { path: ROUTE_PATHS.COMMITS, lazy: () => import('./pages/CommitHistory') },
          { path: ROUTE_PATHS.COMMIT_DETAIL, lazy: () => import('./pages/CommitDetail') },

          // Issue routes
          { path: ROUTE_PATHS.ISSUES, lazy: () => import('./pages/IssueList') },
          { path: ROUTE_PATHS.ISSUE_DETAIL, lazy: () => import('./pages/IssueDetail') },

          // Pull request routes
          { path: ROUTE_PATHS.PULLS, lazy: () => import('./pages/PRList') },
          { path: ROUTE_PATHS.PR_DETAIL, lazy: () => import('./pages/PRDetail') },

          // Nested 404 catch-all (preserves repo context in URL)
          { path: ROUTE_PATHS.NOT_FOUND, lazy: () => import('./pages/NotFound') },
        ],
      },

      // Root-level 404 Not Found catch-all
      { path: ROUTE_PATHS.NOT_FOUND, lazy: () => import('./pages/NotFound') },
    ],
  },
]
