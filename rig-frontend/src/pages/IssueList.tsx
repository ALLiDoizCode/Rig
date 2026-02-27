/**
 * Issue list page
 *
 * Placeholder component for issue list with filtering.
 * Will be replaced with actual issue list UI in Epic 5.
 */
import { useParams } from 'react-router'

export function Component() {
  const { owner, repo } = useParams()

  return (
    <div>
      <h1>
        Issues: {owner}/{repo}
      </h1>
      <p>Issue list coming soon — implemented in Epic 5</p>
    </div>
  )
}

Component.displayName = 'IssueList'
