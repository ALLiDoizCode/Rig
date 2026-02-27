import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { Header } from './Header'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Wrapper with necessary providers
function renderHeader(props?: React.ComponentProps<typeof Header>) {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Header {...props} />
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('Header', () => {
  beforeEach(() => {
    // Mock matchMedia for ThemeProvider
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('renders Rig branding text', () => {
    renderHeader()
    expect(screen.getByText('Rig')).toBeInTheDocument()
  })

  it('renders Rig branding as a link to home', () => {
    renderHeader()
    const brandingLink = screen.getByRole('link', { name: /rig/i })
    expect(brandingLink).toHaveAttribute('href', '/')
  })

  it('renders search placeholder input', () => {
    renderHeader()
    const searchInput = screen.getByPlaceholderText(/search repositories/i)
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toBeDisabled()
  })

  it('renders theme toggle button', () => {
    renderHeader()
    // Theme toggle buttons (desktop and mobile) have aria-label "Theme selection"
    const themeToggles = screen.getAllByRole('button', { name: /theme selection/i })
    expect(themeToggles.length).toBeGreaterThanOrEqual(1)
  })

  it('renders "Powered by Crosstown Pattern" branding', () => {
    renderHeader()
    expect(screen.getByText(/powered by crosstown pattern/i)).toBeInTheDocument()
  })

  it('renders skip navigation link with correct href', () => {
    renderHeader()
    const skipLink = screen.getByRole('link', { name: /skip to content/i })
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  it('skip link has sr-only class and focus styles', () => {
    renderHeader()
    const skipLink = screen.getByRole('link', { name: /skip to content/i })
    expect(skipLink).toHaveClass('sr-only')
    expect(skipLink).toHaveClass('focus:not-sr-only')
  })

  it('uses semantic header element', () => {
    const { container } = renderHeader()
    const header = container.querySelector('header')
    expect(header).toBeInTheDocument()
  })

  it('has nav element with aria-label', () => {
    renderHeader()
    const nav = screen.getByRole('navigation', { name: /main navigation/i })
    expect(nav).toBeInTheDocument()
  })

  it('renders mobile menu button when onMobileMenuToggle provided', () => {
    const mockToggle = vi.fn()
    renderHeader({ onMobileMenuToggle: mockToggle })

    const menuButton = screen.getByRole('button', { name: /open menu/i })
    expect(menuButton).toBeInTheDocument()
  })

  it('calls onMobileMenuToggle when mobile menu button clicked', async () => {
    const user = userEvent.setup()
    const mockToggle = vi.fn()
    renderHeader({ onMobileMenuToggle: mockToggle })

    const menuButton = screen.getByRole('button', { name: /open menu/i })
    await user.click(menuButton)

    expect(mockToggle).toHaveBeenCalledOnce()
  })

  it('does not render mobile menu button when onMobileMenuToggle not provided', () => {
    renderHeader()
    const menuButton = screen.queryByRole('button', { name: /open menu/i })
    expect(menuButton).not.toBeInTheDocument()
  })

  it('has minimum 44x44px touch targets for theme toggle', () => {
    renderHeader()
    const themeToggles = screen.getAllByRole('button', { name: /theme selection/i })
    // Check that all theme toggles have proper touch targets
    themeToggles.forEach((toggle) => {
      expect(toggle).toHaveClass('min-h-11')
      expect(toggle).toHaveClass('min-w-11')
    })
  })

  it('has minimum 44x44px touch targets for mobile menu button', () => {
    renderHeader({ onMobileMenuToggle: vi.fn() })
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    expect(menuButton).toHaveClass('min-h-11')
    expect(menuButton).toHaveClass('min-w-11')
  })

  it('header is sticky and has backdrop blur', () => {
    const { container } = renderHeader()
    const header = container.querySelector('header')
    expect(header).toHaveClass('sticky')
    expect(header).toHaveClass('top-0')
    expect(header).toHaveClass('backdrop-blur')
  })

  it('has proper z-index for stacking context', () => {
    const { container } = renderHeader()
    const header = container.querySelector('header')
    expect(header).toHaveClass('z-50')
  })
})
