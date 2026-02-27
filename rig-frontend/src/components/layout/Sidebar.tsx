import { HomeIcon, FolderIcon, GitCommitIcon, GitPullRequestIcon, CircleDotIcon } from 'lucide-react'
import { NavLink } from 'react-router'

/**
 * Sidebar - Side navigation with placeholder links
 * Desktop: Fixed 280px left sidebar
 * Tablet/Mobile: Hidden by default, shown via Sheet component
 *
 * Note: Repository-specific links use placeholder paths since actual navigation
 * requires owner/repo context from URL params (Story 2.x will handle dynamic routing)
 */
export function Sidebar() {
  return (
    <aside
      className="hidden lg:flex w-[280px] flex-col border-r bg-sidebar"
      aria-label="Sidebar navigation"
    >
      <nav className="flex-1 p-4 space-y-1" aria-label="Repository navigation">
        <h2 className="mb-2 px-2 text-lg font-semibold">Navigation</h2>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
              isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
            }`
          }
        >
          <HomeIcon className="size-4" />
          <span>Home</span>
        </NavLink>

        <div className="mt-4 mb-2 px-2 text-sm font-semibold text-muted-foreground">
          Repository
        </div>

        {/* Placeholder links - will be dynamic with repo context in Story 2.x */}
        <div className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
          <FolderIcon className="size-4" />
          <span>Files</span>
        </div>

        <div className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
          <GitCommitIcon className="size-4" />
          <span>Commits</span>
        </div>

        <div className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
          <GitPullRequestIcon className="size-4" />
          <span>Pull Requests</span>
        </div>

        <div className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
          <CircleDotIcon className="size-4" />
          <span>Issues</span>
        </div>
      </nav>
    </aside>
  )
}

/**
 * MobileSidebarContent - Sheet-based drawer for mobile navigation
 * Slides in from left with backdrop overlay
 */
export function MobileSidebarContent() {
  return (
    <nav className="flex-1 p-4 space-y-1" aria-label="Mobile navigation">
      <h2 className="mb-2 px-2 text-lg font-semibold">Navigation</h2>

      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
            isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`
        }
      >
        <HomeIcon className="size-4" />
        <span>Home</span>
      </NavLink>

      <div className="mt-4 mb-2 px-2 text-sm font-semibold text-muted-foreground">
        Repository
      </div>

      {/* Placeholder items - will be dynamic with repo context in Story 2.x */}
      <div className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
        <FolderIcon className="size-4" />
        <span>Files</span>
      </div>

      <div className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
        <GitCommitIcon className="size-4" />
        <span>Commits</span>
      </div>

      <div className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
        <GitPullRequestIcon className="size-4" />
        <span>Pull Requests</span>
      </div>

      <div className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
        <CircleDotIcon className="size-4" />
        <span>Issues</span>
      </div>

      <div className="mt-6 px-2 text-xs text-muted-foreground">
        Powered by Crosstown Pattern
      </div>
    </nav>
  )
}
