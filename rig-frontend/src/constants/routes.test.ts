import { describe, it, expect } from 'vitest'
import {
  ROUTES,
  ROUTE_PATHS,
  buildRepoPath,
  buildFileBrowserPath,
  buildCommitHistoryPath,
  buildCommitPath,
  buildIssueListPath,
  buildIssuePath,
  buildPRListPath,
  buildPRPath,
} from './routes'

describe('ROUTES constants', () => {
  it('should have correct route patterns', () => {
    expect(ROUTES.HOME).toBe('/')
    expect(ROUTES.REPO_DETAIL).toBe('/:owner/:repo')
    expect(ROUTES.FILE_BROWSER).toBe('/:owner/:repo/src/:branch/*')
    expect(ROUTES.COMMIT_HISTORY).toBe('/:owner/:repo/commits')
    expect(ROUTES.COMMIT_DETAIL).toBe('/:owner/:repo/commit/:hash')
    expect(ROUTES.ISSUE_LIST).toBe('/:owner/:repo/issues')
    expect(ROUTES.ISSUE_DETAIL).toBe('/:owner/:repo/issues/:id')
    expect(ROUTES.PR_LIST).toBe('/:owner/:repo/pulls')
    expect(ROUTES.PR_DETAIL).toBe('/:owner/:repo/pulls/:id')
  })

  it('should be immutable', () => {
    expect(Object.isFrozen(ROUTES)).toBe(true)
  })
})

describe('ROUTE_PATHS constants', () => {
  it('should have correct route path segments for React Router config', () => {
    expect(ROUTE_PATHS.ROOT).toBe('/')
    expect(ROUTE_PATHS.OWNER_REPO).toBe(':owner/:repo')
    expect(ROUTE_PATHS.FILE_BROWSER).toBe('src/:branch/*')
    expect(ROUTE_PATHS.COMMITS).toBe('commits')
    expect(ROUTE_PATHS.COMMIT_DETAIL).toBe('commit/:hash')
    expect(ROUTE_PATHS.ISSUES).toBe('issues')
    expect(ROUTE_PATHS.ISSUE_DETAIL).toBe('issues/:id')
    expect(ROUTE_PATHS.PULLS).toBe('pulls')
    expect(ROUTE_PATHS.PR_DETAIL).toBe('pulls/:id')
    expect(ROUTE_PATHS.NOT_FOUND).toBe('*')
  })

  it('should have segments consistent with ROUTES full patterns', () => {
    // ROUTE_PATHS segments should be the trailing segments of ROUTES full paths
    expect(ROUTES.COMMIT_HISTORY.endsWith(ROUTE_PATHS.COMMITS)).toBe(true)
    expect(ROUTES.COMMIT_DETAIL.endsWith(ROUTE_PATHS.COMMIT_DETAIL)).toBe(true)
    expect(ROUTES.ISSUE_LIST.endsWith(ROUTE_PATHS.ISSUES)).toBe(true)
    expect(ROUTES.ISSUE_DETAIL.endsWith(ROUTE_PATHS.ISSUE_DETAIL)).toBe(true)
    expect(ROUTES.PR_LIST.endsWith(ROUTE_PATHS.PULLS)).toBe(true)
    expect(ROUTES.PR_DETAIL.endsWith(ROUTE_PATHS.PR_DETAIL)).toBe(true)
  })
})

describe('buildRepoPath', () => {
  it('should build repo detail path', () => {
    expect(buildRepoPath('alice', 'my-repo')).toBe('/alice/my-repo')
  })

  it('should handle special characters with URL encoding', () => {
    expect(buildRepoPath('alice', 'my repo')).toBe('/alice/my%20repo')
    expect(buildRepoPath('alice@example', 'repo#123')).toBe('/alice%40example/repo%23123')
  })

  it('should handle npub identifiers', () => {
    const npub = 'npub1alice123456789'
    expect(buildRepoPath(npub, 'test-repo')).toBe(`/${npub}/test-repo`)
  })
})

describe('buildFileBrowserPath', () => {
  it('should build file browser path with branch only', () => {
    expect(buildFileBrowserPath('alice', 'my-repo', 'main')).toBe('/alice/my-repo/src/main')
  })

  it('should build file browser path with file path', () => {
    expect(buildFileBrowserPath('alice', 'my-repo', 'main', 'src/app.ts')).toBe(
      '/alice/my-repo/src/main/src/app.ts'
    )
  })

  it('should build file browser path with nested directory path', () => {
    expect(buildFileBrowserPath('alice', 'my-repo', 'main', 'docs/api/index.md')).toBe(
      '/alice/my-repo/src/main/docs/api/index.md'
    )
  })

  it('should handle special characters in paths', () => {
    expect(buildFileBrowserPath('alice', 'my-repo', 'feature/auth', 'src/my file.ts')).toBe(
      '/alice/my-repo/src/feature%2Fauth/src/my%20file.ts'
    )
  })

  it('should handle empty file path', () => {
    expect(buildFileBrowserPath('alice', 'my-repo', 'main', '')).toBe('/alice/my-repo/src/main')
  })

  it('should handle undefined file path', () => {
    expect(buildFileBrowserPath('alice', 'my-repo', 'main', undefined)).toBe('/alice/my-repo/src/main')
  })
})

describe('buildCommitHistoryPath', () => {
  it('should build commit history path', () => {
    expect(buildCommitHistoryPath('alice', 'my-repo')).toBe('/alice/my-repo/commits')
  })

  it('should handle special characters', () => {
    expect(buildCommitHistoryPath('alice', 'my repo')).toBe('/alice/my%20repo/commits')
  })
})

describe('buildCommitPath', () => {
  it('should build commit detail path', () => {
    expect(buildCommitPath('alice', 'my-repo', 'abc123def456')).toBe('/alice/my-repo/commit/abc123def456')
  })

  it('should handle full SHA hashes', () => {
    const fullSha = 'f21f893b79a1234567890abcdef1234567890abc'
    expect(buildCommitPath('alice', 'my-repo', fullSha)).toBe(`/alice/my-repo/commit/${fullSha}`)
  })

  it('should handle special characters', () => {
    expect(buildCommitPath('alice', 'my repo', 'abc123')).toBe('/alice/my%20repo/commit/abc123')
  })
})

describe('buildIssueListPath', () => {
  it('should build issue list path', () => {
    expect(buildIssueListPath('alice', 'my-repo')).toBe('/alice/my-repo/issues')
  })

  it('should handle special characters', () => {
    expect(buildIssueListPath('alice', 'my repo')).toBe('/alice/my%20repo/issues')
  })
})

describe('buildIssuePath', () => {
  it('should build issue detail path with numeric ID', () => {
    expect(buildIssuePath('alice', 'my-repo', '42')).toBe('/alice/my-repo/issues/42')
  })

  it('should build issue detail path with string ID', () => {
    expect(buildIssuePath('alice', 'my-repo', 'issue-abc')).toBe('/alice/my-repo/issues/issue-abc')
  })

  it('should handle special characters', () => {
    expect(buildIssuePath('alice', 'my repo', '42')).toBe('/alice/my%20repo/issues/42')
  })
})

describe('buildPRListPath', () => {
  it('should build pull request list path', () => {
    expect(buildPRListPath('alice', 'my-repo')).toBe('/alice/my-repo/pulls')
  })

  it('should handle special characters', () => {
    expect(buildPRListPath('alice', 'my repo')).toBe('/alice/my%20repo/pulls')
  })
})

describe('buildPRPath', () => {
  it('should build pull request detail path with numeric ID', () => {
    expect(buildPRPath('alice', 'my-repo', '15')).toBe('/alice/my-repo/pulls/15')
  })

  it('should build pull request detail path with string ID', () => {
    expect(buildPRPath('alice', 'my-repo', 'pr-xyz')).toBe('/alice/my-repo/pulls/pr-xyz')
  })

  it('should handle special characters', () => {
    expect(buildPRPath('alice', 'my repo', '15')).toBe('/alice/my%20repo/pulls/15')
  })
})
