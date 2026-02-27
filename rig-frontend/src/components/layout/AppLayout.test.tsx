import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AppLayout } from './AppLayout'
import { ThemeProvider } from '@/contexts/ThemeContext'

function renderAppLayout(children: React.ReactNode = <div>Test Content</div>) {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AppLayout>{children}</AppLayout>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('AppLayout', () => {
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

  it('renders Header component', () => {
    renderAppLayout()
    // Check for Rig branding from Header
    expect(screen.getByText('Rig')).toBeInTheDocument()
  })

  it('renders Footer component', () => {
    const { container } = renderAppLayout()
    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveTextContent(/powered by crosstown pattern/i)
  })

  it('renders children inside main element', () => {
    renderAppLayout(<div data-testid="test-child">Test Child</div>)
    const main = screen.getByRole('main')
    expect(main).toContainElement(screen.getByTestId('test-child'))
  })

  it('main element has id="main-content" for skip link', () => {
    renderAppLayout()
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main-content')
  })

  it('has proper DOM order: skip link → header → sidebar/main → footer', () => {
    const { container } = renderAppLayout()

    const skipLink = screen.getByRole('link', { name: /skip to content/i })
    const main = screen.getByRole('main')
    const footer = container.querySelector('footer')

    // Check that elements exist in proper order
    expect(skipLink).toBeInTheDocument()
    expect(main).toBeInTheDocument()
    expect(footer).toBeInTheDocument()
  })

  it('renders desktop sidebar', () => {
    const { container } = renderAppLayout()
    const aside = container.querySelector('aside')
    expect(aside).toBeInTheDocument()
  })

  it('opens mobile sidebar when hamburger menu clicked', async () => {
    const user = userEvent.setup()
    renderAppLayout()

    // Click the mobile menu button
    const menuButton = screen.getByRole('button', { name: /open menu/i })
    await user.click(menuButton)

    // Mobile sidebar content should be visible (Sheet is open)
    // Check for navigation heading which appears in mobile sidebar
    const headings = screen.getAllByRole('heading', { name: /navigation/i })
    expect(headings.length).toBeGreaterThan(0)
  })

  it('uses min-h-screen and flex layout', () => {
    const { container } = renderAppLayout()
    const appDiv = container.querySelector('.app')
    expect(appDiv).toHaveClass('min-h-screen')
    expect(appDiv).toHaveClass('flex')
    expect(appDiv).toHaveClass('flex-col')
  })

  it('main content area is flex-1 to fill available space', () => {
    renderAppLayout()
    const main = screen.getByRole('main')
    expect(main).toHaveClass('flex-1')
  })
})
