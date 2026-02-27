/**
 * Relay Status Badge Component
 *
 * Displays relay verification status as a color-coded badge.
 * Supports two variants:
 * - compact: Badge only (for RepoCard)
 * - detailed: Badge + collapsible panel with relay details (for RepoDetail)
 *
 * Color coding based on ratio of responded relays to total:
 * - Green: >= 80% responded (high confidence)
 * - Yellow: >= 40% but < 80% responded (moderate confidence)
 * - Orange: > 0% but < 40% responded (low confidence)
 * - No badge: 0 relays responded
 *
 * Story 2.5: Relay Status Indicators
 */
import { useState, useId } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { RelayQueryMeta } from '@/types/relay-status'
import { getRelayBadgeVariant } from '@/lib/relay-badge-variant'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  RefreshCwIcon,
  ChevronDownIcon,
} from 'lucide-react'

interface RelayStatusBadgeProps {
  /** Relay query metadata */
  meta: RelayQueryMeta
  /** Badge variant: compact (no panel) or detailed (with collapsible panel) */
  variant?: 'compact' | 'detailed'
  /** Data age text (e.g., "about 30 seconds ago") */
  dataAge?: string
  /** Callback to retry all relay queries */
  onRetry?: () => void
}

export function RelayStatusBadge({
  meta,
  variant = 'compact',
  dataAge,
  onRetry,
}: RelayStatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const reactId = useId()
  const badgeId = `relay-badge-${reactId}`
  const panelId = `relay-panel-${reactId}`

  const { respondedCount, totalCount, results } = meta
  const badgeInfo = getRelayBadgeVariant(respondedCount, totalCount)

  // Don't render if no relays responded (0 of N)
  if (respondedCount <= 0 || totalCount <= 0) return null

  const respondedRelays = results.filter(r => r.status === 'success')
  const failedRelays = results.filter(r => r.status === 'failed')
  const failedCount = failedRelays.length

  // Compact variant: badge only (for RepoCard)
  if (variant === 'compact') {
    return (
      <Badge
        variant="outline"
        className={badgeInfo.className}
        role="status"
        aria-label={badgeInfo.label}
      >
        {badgeInfo.label}
      </Badge>
    )
  }

  // Detailed variant: badge + collapsible panel (for RepoDetail)
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          id={badgeId}
          className="inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={badgeInfo.label}
        >
          <Badge
            variant="outline"
            className={`${badgeInfo.className} cursor-pointer hover:opacity-80 transition-opacity`}
            role="status"
          >
            {badgeInfo.label}
            <ChevronDownIcon
              className={`size-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </Badge>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div
          id={panelId}
          role="region"
          aria-labelledby={badgeId}
          className="mt-3 rounded-lg border border-border bg-muted/50 dark:bg-muted/20 p-4 space-y-3"
        >
          {/* Responding relays */}
          {respondedRelays.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-foreground mb-2">
                Responding Relays
              </h4>
              <ul role="list" className="space-y-1.5">
                {respondedRelays.map(relay => (
                  <li
                    key={relay.url}
                    role="listitem"
                    className="flex items-center justify-between gap-4 text-xs"
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <CheckCircleIcon className="size-3 text-green-600 dark:text-green-400 shrink-0" />
                      <span className="font-mono text-muted-foreground truncate">
                        {relay.url}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground shrink-0 tabular-nums">
                      <ClockIcon className="size-3 shrink-0" />
                      {relay.latencyMs}ms
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Failed relays */}
          {failedRelays.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-foreground mb-2">
                Failed Relays
              </h4>
              <ul role="list" className="space-y-1.5">
                {failedRelays.map(relay => (
                  <li
                    key={relay.url}
                    role="listitem"
                    className="flex items-center justify-between gap-4 text-xs"
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <XCircleIcon className="size-3 text-red-600 dark:text-red-400 shrink-0" />
                      <span className="font-mono text-muted-foreground truncate">
                        {relay.url}
                      </span>
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      {relay.error || 'Timed out'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Last updated / data age */}
          {meta.queriedAt > 0 && (
            <p
              className="text-xs text-muted-foreground pt-1 border-t border-border/50"
              aria-live="polite"
            >
              Last updated {dataAge || 'just now'} from {respondedCount}/{totalCount} relays
            </p>
          )}

          {/* Retry button */}
          {failedCount > 0 && onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              aria-label="Retry all relay queries"
              className="mt-1"
            >
              <RefreshCwIcon className="size-3.5" />
              Retry All Relays
            </Button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
