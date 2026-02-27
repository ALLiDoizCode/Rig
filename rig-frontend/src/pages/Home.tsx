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
 * Story 2.3: Client-Side Search and Filtering
 * Story 2.5: Relay Status Indicators (relay metadata passed to RepoCard)
 */
import { useState, useEffect, useRef } from 'react'
import { useRepositories } from '@/features/repository/hooks/useRepositories'
import { useRelayStatus } from '@/features/repository/hooks/useRelayStatus'
import { RepoCard } from '@/features/repository/RepoCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircleIcon, InboxIcon, RefreshCwIcon, SearchIcon, XIcon } from 'lucide-react'
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
  const { meta: relayMeta } = useRelayStatus()

  // Search state: raw input value (instant) and debounced filter term (delayed)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Debounce: sync searchTerm -> debouncedTerm after 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Keyboard shortcut: "/" focuses search input
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== '/') return

      const activeEl = document.activeElement
      const tag = activeEl?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (activeEl as HTMLElement)?.isContentEditable) {
        return // Don't hijack text input or form controls
      }

      event.preventDefault()
      searchInputRef.current?.focus()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Client-side filtering on name field only
  const filteredData = (() => {
    if (!debouncedTerm || !data) return data ?? []
    const term = debouncedTerm.toLowerCase()
    return data.filter(repo => repo.name.toLowerCase().includes(term))
  })()

  function handleClear() {
    setSearchTerm('')
    setDebouncedTerm('') // Immediately clear both to avoid 300ms delay on clear
    searchInputRef.current?.focus() // Return focus to input after clearing
  }

  return (
    <section className="p-6 space-y-6">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
        {status === 'success' && data.length > 0 && (
          <span className="text-sm text-muted-foreground whitespace-nowrap tabular-nums" aria-live="polite" aria-atomic="true">
            {debouncedTerm
              ? `Showing ${filteredData.length} of ${data.length} repositories`
              : `${data.length} ${data.length === 1 ? 'repository' : 'repositories'}`}
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
        <>
          {/* Search input -- only rendered when data is available */}
          <div role="search" className="max-w-md">
            <label htmlFor="repo-search" className="sr-only">Search repositories</label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="repo-search"
                ref={searchInputRef}
                type="search"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-keyshortcuts="/"
                className={`pl-9 [&::-webkit-search-cancel-button]:hidden ${searchTerm.length > 0 ? 'pr-9' : ''}`}
              />
              {searchTerm.length > 0 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 size-7 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground"
                  onClick={handleClear}
                  aria-label="Clear search"
                >
                  <XIcon className="size-4" />
                </Button>
              ) : (
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex" aria-hidden="true">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Grid or search-empty state */}
          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredData.map((repo) => (
                <RepoCard key={repo.id} repo={repo} relayMeta={relayMeta} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="rounded-full bg-muted p-3">
                <SearchIcon className="size-6 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-medium text-muted-foreground">
                  No repositories found matching &apos;{debouncedTerm}&apos;
                </p>
                <p className="text-sm text-muted-foreground">
                  Try a different search term or clear the filter.
                </p>
              </div>
              <Button variant="outline" onClick={handleClear}>
                Clear search
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

Component.displayName = 'Home'
