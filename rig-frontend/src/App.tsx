/**
 * Main application component with React Router v7 configuration
 *
 * Uses createBrowserRouter with route-level lazy loading for code splitting.
 * Implements Forgejo-compatible URL patterns for Git repository browsing.
 */
import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from './routes'

/**
 * Browser router instance for production use
 */
const router = createBrowserRouter(routes)

/**
 * App component
 *
 * Renders the RouterProvider with the configured router.
 * QueryClientProvider wrapper is handled in main.tsx.
 */
export default function App() {
  return <RouterProvider router={router} />
}
