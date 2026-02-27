/**
 * Repository Detail Page
 *
 * Displays comprehensive repository information including metadata,
 * maintainers, ArNS URL, topics, and README content rendered as markdown.
 *
 * Story 2.4: Repository Detail Page
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRepository } from '@/features/repository/hooks/useRepository'
import { useReadme } from '@/features/repository/hooks/useReadme'
import { truncatePubkey, formatRelativeTime } from '@/lib/format'
import { isRigError } from '@/types/common'
import {
  ArrowLeftIcon,
  CopyIcon,
  CheckIcon,
  UsersIcon,
  ClockIcon,
  ExternalLinkIcon,
  TagIcon,
  AlertCircleIcon,
  SearchXIcon,
  FileTextIcon,
  RefreshCwIcon,
} from 'lucide-react'

export function Component() {
  const { owner = '', repo = '' } = useParams()
  const { data, status, error, refetch } = useRepository(owner, repo)

  const readmeEnabled = status === 'success' && data !== null
  const readmeResult = useReadme(data?.webUrls ?? [], readmeEnabled)

  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      // Clipboard API unavailable -- fail silently
    }
  }, [])

  // Loading state
  if (status === 'pending') {
    return (
      <section className="p-6 space-y-6">
        <div
          role="status"
          aria-label="Loading repository details"
          className="space-y-6"
        >
          {/* Back link skeleton */}
          <Skeleton className="h-5 w-40" />
          {/* Heading skeleton */}
          <Skeleton className="h-9 w-80" />
          {/* Description skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[85%]" />
          </div>
          {/* Metadata card skeleton */}
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-4 w-60" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <Skeleton className="h-4 w-36" />
          </div>
          {/* Separator */}
          <Skeleton className="h-px w-full" />
          {/* README content area skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[75%]" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (status === 'error') {
    const errorMessage = isRigError(error)
      ? error.userMessage
      : 'Something went wrong.'

    return (
      <section className="p-6 space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Back to repositories
        </Link>
        <div role="alert" className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircleIcon className="size-6 text-destructive" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-medium">{errorMessage}</p>
            <p className="text-sm text-muted-foreground">
              Check your connection and try again.
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCwIcon className="size-4" />
            Try Again
          </Button>
        </div>
      </section>
    )
  }

  // Not found state
  if (data === null) {
    return (
      <section className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="rounded-full bg-muted p-3">
            <SearchXIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold">Repository not found</h1>
            <p className="text-sm text-muted-foreground">
              The repository you are looking for does not exist or may have been
              removed.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeftIcon className="size-4" />
              Back to repositories
            </Link>
          </Button>
        </div>
      </section>
    )
  }

  // Success state
  // Validate URL protocol to prevent javascript: or other dangerous schemes
  // in the href attribute. webUrls originate from untrusted Nostr relay data.
  const rawArnsUrl = data.webUrls.length > 0 ? data.webUrls[0] : null
  const arnsUrl = rawArnsUrl !== null && isSafeUrl(rawArnsUrl) ? rawArnsUrl : null

  return (
    <section className="p-6 space-y-6">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="size-4" />
        Back to repositories
      </Link>

      {/* Repository header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
        {data.description ? (
          <p className="text-lg text-muted-foreground leading-relaxed">
            {data.description}
          </p>
        ) : (
          <p className="text-muted-foreground/60 italic">No description</p>
        )}
      </div>

      {/* Metadata */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          {/* Maintainers */}
          {data.maintainers.length > 0 && (
            <div className="flex items-start gap-3 text-sm">
              <UsersIcon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="space-y-1">
                <span className="font-medium text-foreground">
                  Maintainers
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.maintainers.map((pubkey) => (
                    <span
                      key={pubkey}
                      className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
                    >
                      {truncatePubkey(pubkey)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ArNS URL */}
          {arnsUrl && (
            <div className="flex items-center gap-3 text-sm">
              <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="font-medium text-foreground">ArNS URL</span>
              <a
                href={arnsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-muted-foreground hover:text-foreground truncate transition-colors"
              >
                {arnsUrl}
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
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
                <span className="text-xs text-green-600 dark:text-green-400">
                  Copied!
                </span>
              )}
            </div>
          )}

          {/* Topics */}
          {data.topics.length > 0 && (
            <div className="flex items-start gap-3 text-sm">
              <TagIcon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="space-y-1">
                <span className="font-medium text-foreground">Topics</span>
                <div className="flex flex-wrap gap-1.5" role="list">
                  {data.topics.map((topic) => (
                    <Badge key={topic} variant="secondary" role="listitem">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-3 text-sm">
            <ClockIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="font-medium text-foreground">Updated</span>
            <span className="text-muted-foreground">{formatRelativeTime(data.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* README section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileTextIcon className="size-5" />
          README
        </h2>
        <ReadmeContent
          readmeData={readmeResult.data}
          readmeStatus={readmeResult.status}
          hasWebUrls={data.webUrls.length > 0}
        />
      </div>
    </section>
  )
}

Component.displayName = 'RepoDetail'

/**
 * Validate that a URL uses a safe protocol (http or https only).
 * Prevents javascript:, data:, file:, and other dangerous schemes
 * from being rendered as clickable links.
 *
 * @param url - URL string to validate
 * @returns true if the URL uses http:// or https://
 */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

/**
 * Omit the `node` prop from react-markdown component props before spreading
 * onto DOM elements. react-markdown passes an AST `node` prop to all custom
 * components; spreading it onto HTML elements triggers React DOM warnings.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function omitNode({ node, ...rest }: Record<string, any>) {
  void node
  return rest
}

/**
 * README content renderer with loading/error/fallback states.
 */
function ReadmeContent({
  readmeData,
  readmeStatus,
  hasWebUrls,
}: {
  readmeData: string | null | undefined
  readmeStatus: 'pending' | 'error' | 'success'
  hasWebUrls: boolean
}) {
  if (!hasWebUrls) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground italic">README not available</p>
      </div>
    )
  }

  if (readmeStatus === 'pending') {
    return (
      <Card>
        <CardContent className="pt-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[75%]" />
          <Skeleton className="h-24 w-full rounded-md" />
        </CardContent>
      </Card>
    )
  }

  if (readmeStatus === 'error' || readmeData === null || readmeData === undefined) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground italic">README not available</p>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="prose prose-neutral dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Heading level shifting: h1 in README -> h2, h2 -> h3, etc.
              // omitNode() strips the AST `node` prop to prevent React DOM warnings.
              // Destructure `children` so it isn't passed twice (via spread AND as JSX children).
              h1: (p) => { const { children, ...rest } = omitNode(p); return <h2 {...rest}>{children}</h2> },
              h2: (p) => { const { children, ...rest } = omitNode(p); return <h3 {...rest}>{children}</h3> },
              h3: (p) => { const { children, ...rest } = omitNode(p); return <h4 {...rest}>{children}</h4> },
              h4: (p) => { const { children, ...rest } = omitNode(p); return <h5 {...rest}>{children}</h5> },
              h5: (p) => { const { children, ...rest } = omitNode(p); return <h6 {...rest}>{children}</h6> },
              h6: (p) => { const { children, ...rest } = omitNode(p); return <h6 {...rest}>{children}</h6> },

              // External links open in new tab
              a: (p) => {
                const { children, href, ...rest } = omitNode(p)
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...rest}
                  >
                    {children}
                  </a>
                )
              },

              // Syntax-highlighted code blocks
              code: (p) => {
                const { className, children, ...rest } = omitNode(p)
                const match = /language-(\w+)/.exec(className || '')
                const isInline = !match
                if (isInline) {
                  return (
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  )
                }
                return (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{ borderRadius: '0.5rem', margin: 0 }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                )
              },
            }}
          >
            {readmeData}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}
