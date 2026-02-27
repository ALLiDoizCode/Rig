import { useState } from 'react'
import { Header } from './Header'
import { Sidebar, MobileSidebarContent } from './Sidebar'
import { Footer } from './Footer'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

interface AppLayoutProps {
  children: React.ReactNode
}

/**
 * AppLayout - Main application layout wrapper
 * Combines Header, Sidebar, main content area, and Footer
 * Handles mobile sidebar via Sheet component
 */
export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="app min-h-screen flex flex-col">
      <Header onMobileMenuToggle={() => setMobileMenuOpen(true)} />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </div>

      <Footer />

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px]">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <MobileSidebarContent />
        </SheetContent>
      </Sheet>
    </div>
  )
}
