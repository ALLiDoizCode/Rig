/**
 * Home page - Repository discovery
 *
 * Displays a list of repositories announced on Nostr relays.
 * Queries all configured relays for kind 30617 repository announcement events.
 *
 * States:
 * - Loading: Skeleton grid with 6 placeholder cards
 * - Error: User-friendly error message with "Try Again" button
 * - Empty: Informative message when no repositories found
 * - Populated: Responsive grid of repository cards
 *
 * Story 2.1: Repository List Page with Nostr Query
 * Story 2.2: Repository Card Component with Metadata (RepoCard integration)
 */
import { useRepositories } from '@/features/repository/hooks/useRepositories'
import { RepoCard } from '@/features/repository/RepoCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircleIcon, InboxIcon, RefreshCwIcon } from 'lucide-react'
import { isRigError } from '@/types/common'

/**
 * Loading skeleton grid matching the repository card layout.
 * Renders 6 skeleton cards in a responsive grid.
 * Card structure mirrors RepoCard: header, content area, footer with border-t.
 */
function RepositoryGridSkeleton() {
  return (
    <div role="status" aria-label="Loading repositories" aria-busy="true">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border bg-card py-6 shadow-sm"
          >
            {/* Header skeleton */}
            <div className="px-6 pb-3">
              <Skeleton className="h-5 w-3/5" />
            </div>
            {/* Content skeleton */}
            <div className="flex-1 space-y-3 px-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-3 w-2/5" />
              <div className="flex gap-1.5 pt-1">
                <Skeleton className="h-5 w-14 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
            </div>
            {/* Footer skeleton */}
            <div className="mt-auto border-t border-border px-6 pt-4 flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Component() {
  const { data, status, error, refetch } = useRepositories()

  return (
    <section className="p-6 space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
        {status === 'success' && data.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {data.length} {data.length === 1 ? 'repository' : 'repositories'}
          </span>
        )}
      </div>

      {status === 'pending' && <RepositoryGridSkeleton />}

      {status === 'error' && (
        <div role="alert" className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircleIcon className="size-6 text-destructive" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-medium">
              {isRigError(error)
                ? error.userMessage
                : 'Something went wrong.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Check your connection and try again.
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCwIcon className="size-4" />
            Try Again
          </Button>
        </div>
      )}

      {status === 'success' && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="rounded-full bg-muted p-3">
            <InboxIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-medium text-muted-foreground">
              No repositories found on the network
            </p>
            <p className="text-sm text-muted-foreground">
              Repositories announced via Nostr will appear here.
            </p>
          </div>
        </div>
      )}

      {status === 'success' && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </section>
  )
}

Component.displayName = 'Home'
