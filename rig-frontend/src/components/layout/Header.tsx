import { MenuIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from './ThemeToggle'
import { ROUTE_PATHS } from '@/constants/routes'

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

/**
 * Header - Top navigation bar with branding, search, and theme controls
 * Responsive design with mobile hamburger menu
 * Includes skip navigation link for accessibility
 */
export function Header({ onMobileMenuToggle }: HeaderProps) {
  return (
    <>
      {/* Skip navigation link - first focusable element */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-background focus:border focus:border-ring focus:rounded-md focus:shadow-lg"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4">
          {/* Logo/branding */}
          <Link
            to={ROUTE_PATHS.ROOT}
            className="flex items-center space-x-2 mr-4"
          >
            <span className="font-bold text-lg">Rig</span>
          </Link>

          {/* Search placeholder - center area */}
          <div className="flex-1 md:flex md:max-w-sm">
            <Input
              placeholder="Search repositories..."
              disabled
              className="h-9"
              aria-label="Search repositories (coming soon)"
            />
          </div>

          {/* Desktop nav items - right side */}
          <nav
            className="hidden md:flex items-center gap-4 ml-auto"
            aria-label="Main navigation"
          >
            <span className="text-xs text-muted-foreground">
              Powered by Crosstown Pattern
            </span>
            <ThemeToggle />
          </nav>

          {/* Mobile menu trigger and theme toggle */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <ThemeToggle />
            {onMobileMenuToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileMenuToggle}
                className="min-h-11 min-w-11"
                aria-label="Open menu"
                aria-expanded="false"
              >
                <MenuIcon className="size-5" />
                <span className="sr-only">Menu</span>
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
