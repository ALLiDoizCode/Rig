/**
 * Repository Card Component
 *
 * Displays repository metadata in a scannable card format using shadcn/ui Card.
 * Includes name (linked), description (expandable), maintainers, timestamp,
 * verification badge, ArNS URL with copy, and topic tags.
 *
 * Story 2.2: Repository Card Component with Metadata
 * Story 2.5: Relay Status Indicators (RelayStatusBadge integration)
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RelayStatusBadge } from '@/components/RelayStatusBadge'
import { buildRepoPath } from '@/constants/routes'
import { truncatePubkey, formatRelativeTime } from '@/lib/format'
import type { Repository } from '@/types/repository'
import type { RelayQueryMeta } from '@/types/relay-status'
import { CopyIcon, CheckIcon, UsersIcon, ClockIcon, ExternalLinkIcon } from 'lucide-react'

interface RepoCardProps {
  repo: Repository
  /** Relay query metadata (global, not per-repo). When undefined, badge is not rendered. */
  relayMeta?: RelayQueryMeta
}

export function RepoCard({ repo, relayMeta }: RepoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)
  const [copied, setCopied] = useState(false)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const el = descriptionRef.current
    if (!el) return

    function checkTruncation() {
      if (el) {
        setIsTruncated(el.scrollHeight > el.clientHeight)
      }
    }

    checkTruncation()

    // Re-check truncation on resize so "Read more" button appears/disappears
    // when the container width changes (e.g., responsive breakpoint change).
    const observer = new ResizeObserver(checkTruncation)
    observer.observe(el)

    return () => observer.disconnect()
  }, [repo.description])

  // Clean up copy feedback timeout on unmount to prevent state updates on unmounted component
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const handleCopy = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable -- fail silently (AC #7)
    }
  }, [])

  const repoPath = buildRepoPath(repo.owner, repo.id)
  const arnsUrl = repo.webUrls.length > 0 ? repo.webUrls[0] : null

  return (
    <article>
      <Card className="gap-4 transition-[shadow,border-color] duration-200 hover:shadow-md hover:border-border/80 dark:hover:border-border/60 h-full flex flex-col">
        <CardHeader className="pb-0">
          <h2 className="text-base font-semibold leading-tight truncate">
            <Link
              to={repoPath}
              className="hover:underline min-h-[44px] min-w-[44px] inline-flex items-center"
              aria-label={`View repository ${repo.name}`}
            >
              {repo.name}
            </Link>
          </h2>
        </CardHeader>

        <CardContent className="space-y-3 flex-1">
          {/* Description with expand/collapse */}
          {repo.description ? (
            <div>
              <p
                ref={descriptionRef}
                className={`text-sm leading-relaxed text-muted-foreground ${!isExpanded ? 'line-clamp-3' : ''}`}
              >
                {repo.description}
              </p>
              {(isTruncated || isExpanded) && (
                <Button
                  variant="link"
                  size="sm"
                  className="px-0 h-auto min-h-[44px] min-w-[44px] text-xs"
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-expanded={isExpanded}
                  aria-label="Toggle description"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">
              No description
            </p>
          )}

          {/* Maintainers */}
          {repo.maintainers.length > 0 && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <UsersIcon className="size-3.5 mt-0.5 shrink-0" />
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                {repo.maintainers.slice(0, 3).map((pubkey) => (
                  <span key={pubkey} className="font-mono text-xs">
                    {truncatePubkey(pubkey)}
                  </span>
                ))}
                {repo.maintainers.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{repo.maintainers.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ClockIcon className="size-3 shrink-0" />
            <span>{formatRelativeTime(repo.createdAt)}</span>
          </div>

          {/* Topic tags */}
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

          {/* ArNS URL with copy */}
          {arnsUrl && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ExternalLinkIcon className="size-3 shrink-0" />
              <span className="truncate font-mono text-[11px]">{arnsUrl}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 min-h-[44px] min-w-[44px] shrink-0 -m-2"
                onClick={() => handleCopy(arnsUrl)}
                aria-label="Copy URL"
              >
                {copied ? (
                  <CheckIcon className="size-3.5 text-green-600 dark:text-green-400" />
                ) : (
                  <CopyIcon className="size-3.5" />
                )}
              </Button>
              {copied && (
                <span className="text-xs text-green-600 dark:text-green-400">Copied!</span>
              )}
            </div>
          )}
        </CardContent>

        {/* Footer: Owner + Verification badge */}
        <CardFooter className="flex items-center justify-between border-t border-border pt-4 mt-auto">
          <p className="text-xs text-muted-foreground font-mono truncate">
            {truncatePubkey(repo.owner)}
          </p>
          {relayMeta && (
            <RelayStatusBadge meta={relayMeta} variant="compact" />
          )}
        </CardFooter>
      </Card>
    </article>
  )
}
