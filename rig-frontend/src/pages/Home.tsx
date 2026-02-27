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
 */
import { useRepositories } from '@/features/repository/hooks/useRepositories'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircleIcon, InboxIcon, RefreshCwIcon } from 'lucide-react'
import { isRigError } from '@/types/common'
import type { Repository } from '@/types/repository'

/**
 * Truncate a hex public key for display.
 * Shows first 8 and last 8 characters with ellipsis.
 */
function truncatePubkey(pubkey: string): string {
  if (pubkey.length <= 20) return pubkey
  return `${pubkey.slice(0, 8)}...${pubkey.slice(-8)}`
}

/**
 * Loading skeleton grid matching the repository layout.
 * Renders 6 skeleton cards in a responsive grid.
 * Card styling matches the populated RepositoryItem for visual consistency.
 */
function RepositoryGridSkeleton() {
  return (
    <div role="status" aria-label="Loading repositories" aria-busy="true">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-xl border bg-card p-5 shadow-sm"
          >
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="mt-auto pt-2 border-t border-border">
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Temporary inline repository card for Story 2.1.
 * Will be replaced by the full RepoCard component in Story 2.2.
 *
 * Styled to match shadcn Card visual language (bg-card, rounded-xl, shadow-sm)
 * for design system consistency.
 */
function RepositoryItem({ repo }: { repo: Repository }) {
  return (
    <article className="flex flex-col gap-2 rounded-xl border bg-card text-card-foreground p-5 shadow-sm transition-shadow hover:shadow-md">
      <h2 className="text-base font-semibold leading-tight truncate">
        {repo.name}
      </h2>
      {repo.description ? (
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {repo.description}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground/60 italic min-h-[2.5rem]">
          No description
        </p>
      )}
      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              {topic}
            </span>
          ))}
          {repo.topics.length > 4 && (
            <span className="inline-flex items-center text-xs text-muted-foreground">
              +{repo.topics.length - 4}
            </span>
          )}
        </div>
      )}
      <div className="mt-auto pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground font-mono truncate">
          {truncatePubkey(repo.owner)}
        </p>
      </div>
    </article>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((repo) => (
            <RepositoryItem key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </section>
  )
}

Component.displayName = 'Home'
