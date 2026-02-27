/**
 * 404 Not Found page
 *
 * Displayed when user navigates to a route that doesn't match any defined routes.
 * Provides a "Go Home" link so users can recover and navigate back to the main page.
 */
import { Link } from 'react-router'

export function Component() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
      <p className="text-muted-foreground mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        to="/"
        className="text-primary underline-offset-4 hover:underline font-medium"
      >
        Go Home
      </Link>
    </div>
  )
}

Component.displayName = 'NotFound'
