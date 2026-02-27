/**
 * Pull request list page
 *
 * Placeholder component for PR list.
 * Will be replaced with actual PR list UI in Epic 5.
 */
import { useParams } from 'react-router'

export function Component() {
  const { owner, repo } = useParams()

  return (
    <div>
      <h1>
        Pull Requests: {owner}/{repo}
      </h1>
      <p>Pull request list coming soon — implemented in Epic 5</p>
    </div>
  )
}

Component.displayName = 'PRList'
