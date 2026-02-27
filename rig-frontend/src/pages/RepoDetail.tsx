/**
 * Repository detail page
 *
 * Placeholder component for repository overview.
 * Will be replaced with actual repository detail UI in Epic 2.
 */
import { useParams } from 'react-router'

export function Component() {
  const { owner, repo } = useParams()

  return (
    <div>
      <h1>
        Repository: {owner}/{repo}
      </h1>
      <p>Repository detail coming soon — implemented in Epic 2</p>
    </div>
  )
}

Component.displayName = 'RepoDetail'
