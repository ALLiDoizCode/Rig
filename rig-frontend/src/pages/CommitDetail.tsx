/**
 * Commit detail page
 *
 * Placeholder component for individual commit view with diff.
 * Will be replaced with actual commit detail UI in Epic 4.
 */
import { useParams } from 'react-router'

export function Component() {
  const { owner, repo, hash } = useParams()

  return (
    <div>
      <h1>
        Commit: {owner}/{repo}
      </h1>
      <p>
        <strong>Hash:</strong> {hash}
      </p>
      <p>Commit detail coming soon — implemented in Epic 4</p>
    </div>
  )
}

Component.displayName = 'CommitDetail'
