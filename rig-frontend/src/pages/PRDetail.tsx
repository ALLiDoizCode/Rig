/**
 * Pull request detail page
 *
 * Placeholder component for individual PR view with discussion.
 * Will be replaced with actual PR detail UI in Epic 5.
 */
import { useParams } from 'react-router'

export function Component() {
  const { owner, repo, id } = useParams()

  return (
    <div>
      <h1>
        Pull Request: {owner}/{repo} #{id}
      </h1>
      <p>Pull request detail coming soon — implemented in Epic 5</p>
    </div>
  )
}

Component.displayName = 'PRDetail'
