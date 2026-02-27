/**
 * Issue detail page
 *
 * Placeholder component for individual issue view with threaded comments.
 * Will be replaced with actual issue detail UI in Epic 5.
 */
import { useParams } from 'react-router'

export function Component() {
  const { owner, repo, id } = useParams()

  return (
    <div>
      <h1>
        Issue: {owner}/{repo} #{id}
      </h1>
      <p>Issue detail coming soon — implemented in Epic 5</p>
    </div>
  )
}

Component.displayName = 'IssueDetail'
