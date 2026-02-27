/**
 * Commit history page
 *
 * Placeholder component for commit list.
 * Will be replaced with actual commit history UI in Epic 4.
 */
import { useParams } from 'react-router'

export function Component() {
  const { owner, repo } = useParams()

  return (
    <div>
      <h1>
        Commits: {owner}/{repo}
      </h1>
      <p>Commit history coming soon — implemented in Epic 4</p>
    </div>
  )
}

Component.displayName = 'CommitHistory'
