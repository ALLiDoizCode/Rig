/**
 * File Browser Page
 *
 * Story 3.1: File Tree Navigation Component
 *
 * Integrates the FileBrowser component with routing to provide file navigation.
 * For Epic 3, we're using a hardcoded manifestId placeholder.
 * Future stories will integrate with NIP-34 branch events to discover manifest IDs.
 */
import { useParams } from 'react-router'
import { FileBrowser } from '@/features/repository/components/FileBrowser'

export function Component() {
  const { owner, repo, branch, '*': filePath } = useParams()

  // TODO: In a future story, fetch the actual manifestId from repository metadata
  // For now, using a placeholder to demonstrate the file tree UI
  const manifestId = 'demo-manifest-id'

  return (
    <FileBrowser
      manifestId={manifestId}
      owner={owner}
      repo={repo}
      branch={branch}
    >
      {filePath ? (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">
            {filePath}
          </h1>
          <p className="text-muted-foreground">
            File viewer coming in a future story.
          </p>
        </div>
      ) : (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">
            {owner}/{repo}
          </h1>
          <p className="text-muted-foreground">
            Select a file from the tree to view its contents.
          </p>
        </div>
      )}
    </FileBrowser>
  )
}

Component.displayName = 'FileBrowser'
