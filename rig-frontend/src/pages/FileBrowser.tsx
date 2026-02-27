/**
 * File browser page
 *
 * Placeholder component for file tree navigation and viewing.
 * Will be replaced with actual file browser UI in Epic 3.
 */
import { useParams } from 'react-router'

export function Component() {
  const { owner, repo, branch, '*': filePath } = useParams()

  return (
    <div>
      <h1>
        File Browser: {owner}/{repo}
      </h1>
      <p>
        <strong>Branch:</strong> {branch}
      </p>
      {filePath && (
        <p>
          <strong>Path:</strong> {filePath}
        </p>
      )}
      <p>File browser coming soon — implemented in Epic 3</p>
    </div>
  )
}

Component.displayName = 'FileBrowser'
