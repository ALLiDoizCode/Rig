/**
 * Footer - Bottom footer with branding and links
 * Responsive design with flex layout
 */
export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-sm text-muted-foreground">
          Rig — Decentralized Git Repository Browser
        </p>
        <p className="text-xs text-muted-foreground">
          Powered by Crosstown Pattern
        </p>
      </div>
    </footer>
  )
}
