/**
 * Route path constants and builder functions for React Router
 *
 * These constants define the Forgejo-compatible URL structure for the application.
 * Path builder functions provide type-safe URL construction with proper encoding.
 *
 * @module routes
 */

/**
 * Route path patterns matching Forgejo conventions
 *
 * Route parameters:
 * - :owner - Repository owner (Nostr npub or display name)
 * - :repo - Repository identifier (d-tag)
 * - :branch - Git branch name
 * - :hash - Git commit hash (SHA)
 * - :id - Issue or pull request identifier
 * - * - Wildcard for file paths
 */
export const ROUTES = Object.freeze({
  HOME: '/',
  REPO_DETAIL: '/:owner/:repo',
  FILE_BROWSER: '/:owner/:repo/src/:branch/*',
  COMMIT_HISTORY: '/:owner/:repo/commits',
  COMMIT_DETAIL: '/:owner/:repo/commit/:hash',
  ISSUE_LIST: '/:owner/:repo/issues',
  ISSUE_DETAIL: '/:owner/:repo/issues/:id',
  PR_LIST: '/:owner/:repo/pulls',
  PR_DETAIL: '/:owner/:repo/pulls/:id',
} as const)

/**
 * Encodes a URL path segment
 *
 * Uses encodeURIComponent to handle special characters while preserving
 * forward slashes for file paths when needed.
 *
 * @param segment - Path segment to encode
 * @returns Encoded path segment
 */
function encodePathSegment(segment: string): string {
  return encodeURIComponent(segment)
}

/**
 * Builds a repository detail path
 *
 * @param owner - Repository owner (npub or display name)
 * @param repo - Repository d-tag identifier
 * @returns Formatted path: /owner/repo
 *
 * @example
 * buildRepoPath('alice', 'my-repo') // '/alice/my-repo'
 * buildRepoPath('alice', 'my repo') // '/alice/my%20repo'
 */
export function buildRepoPath(owner: string, repo: string): string {
  return `/${encodePathSegment(owner)}/${encodePathSegment(repo)}`
}

/**
 * Builds a file browser path
 *
 * @param owner - Repository owner
 * @param repo - Repository identifier
 * @param branch - Branch name
 * @param filePath - Optional file path within the repository
 * @returns Formatted path: /owner/repo/src/branch[/filePath]
 *
 * @example
 * buildFileBrowserPath('alice', 'my-repo', 'main') // '/alice/my-repo/src/main'
 * buildFileBrowserPath('alice', 'my-repo', 'main', 'src/app.ts') // '/alice/my-repo/src/main/src/app.ts'
 */
export function buildFileBrowserPath(
  owner: string,
  repo: string,
  branch: string,
  filePath?: string
): string {
  const base = `/${encodePathSegment(owner)}/${encodePathSegment(repo)}/src/${encodePathSegment(branch)}`

  if (!filePath || filePath === '') {
    return base
  }

  // Encode each path segment separately to preserve forward slashes
  const encodedPath = filePath
    .split('/')
    .map((segment) => encodePathSegment(segment))
    .join('/')

  return `${base}/${encodedPath}`
}

/**
 * Builds a commit history path
 *
 * @param owner - Repository owner
 * @param repo - Repository identifier
 * @returns Formatted path: /owner/repo/commits
 *
 * @example
 * buildCommitHistoryPath('alice', 'my-repo') // '/alice/my-repo/commits'
 */
export function buildCommitHistoryPath(owner: string, repo: string): string {
  return `/${encodePathSegment(owner)}/${encodePathSegment(repo)}/commits`
}

/**
 * Builds a commit detail path
 *
 * @param owner - Repository owner
 * @param repo - Repository identifier
 * @param hash - Commit SHA hash (full or abbreviated)
 * @returns Formatted path: /owner/repo/commit/hash
 *
 * @example
 * buildCommitPath('alice', 'my-repo', 'abc123') // '/alice/my-repo/commit/abc123'
 */
export function buildCommitPath(owner: string, repo: string, hash: string): string {
  return `/${encodePathSegment(owner)}/${encodePathSegment(repo)}/commit/${encodePathSegment(hash)}`
}

/**
 * Builds an issue list path
 *
 * @param owner - Repository owner
 * @param repo - Repository identifier
 * @returns Formatted path: /owner/repo/issues
 *
 * @example
 * buildIssueListPath('alice', 'my-repo') // '/alice/my-repo/issues'
 */
export function buildIssueListPath(owner: string, repo: string): string {
  return `/${encodePathSegment(owner)}/${encodePathSegment(repo)}/issues`
}

/**
 * Builds an issue detail path
 *
 * @param owner - Repository owner
 * @param repo - Repository identifier
 * @param id - Issue identifier
 * @returns Formatted path: /owner/repo/issues/id
 *
 * @example
 * buildIssuePath('alice', 'my-repo', '42') // '/alice/my-repo/issues/42'
 */
export function buildIssuePath(owner: string, repo: string, id: string): string {
  return `/${encodePathSegment(owner)}/${encodePathSegment(repo)}/issues/${encodePathSegment(id)}`
}

/**
 * Builds a pull request list path
 *
 * @param owner - Repository owner
 * @param repo - Repository identifier
 * @returns Formatted path: /owner/repo/pulls
 *
 * @example
 * buildPRListPath('alice', 'my-repo') // '/alice/my-repo/pulls'
 */
export function buildPRListPath(owner: string, repo: string): string {
  return `/${encodePathSegment(owner)}/${encodePathSegment(repo)}/pulls`
}

/**
 * Builds a pull request detail path
 *
 * @param owner - Repository owner
 * @param repo - Repository identifier
 * @param id - Pull request identifier
 * @returns Formatted path: /owner/repo/pulls/id
 *
 * @example
 * buildPRPath('alice', 'my-repo', '15') // '/alice/my-repo/pulls/15'
 */
export function buildPRPath(owner: string, repo: string, id: string): string {
  return `/${encodePathSegment(owner)}/${encodePathSegment(repo)}/pulls/${encodePathSegment(id)}`
}

/**
 * Route path segments for React Router nested route configuration
 *
 * These are the relative path segments used in the route tree definition.
 * Unlike ROUTES (which contains full URL patterns for reference and path builders),
 * these segments are used directly in createBrowserRouter route objects.
 *
 * React Router nested routes use relative paths — e.g., a child route uses
 * 'commits' not '/:owner/:repo/commits'.
 */
export const ROUTE_PATHS = {
  ROOT: '/',
  OWNER_REPO: ':owner/:repo',
  FILE_BROWSER: 'src/:branch/*',
  COMMITS: 'commits',
  COMMIT_DETAIL: 'commit/:hash',
  ISSUES: 'issues',
  ISSUE_DETAIL: 'issues/:id',
  PULLS: 'pulls',
  PR_DETAIL: 'pulls/:id',
  NOT_FOUND: '*',
} as const
