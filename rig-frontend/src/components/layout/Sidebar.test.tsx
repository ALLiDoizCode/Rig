import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Sidebar, MobileSidebarContent } from './Sidebar'

describe('Sidebar', () => {
  it('renders as semantic aside element', () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    const aside = container.querySelector('aside')
    expect(aside).toBeInTheDocument()
  })

  it('has aria-label for sidebar navigation', () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    const aside = container.querySelector('aside')
    expect(aside).toHaveAttribute('aria-label', 'Sidebar navigation')
  })

  it('contains nav element with aria-label', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    const nav = screen.getByRole('navigation', { name: /repository navigation/i })
    expect(nav).toBeInTheDocument()
  })

  it('renders navigation heading', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /navigation/i })).toBeInTheDocument()
  })

  it('renders Home navigation link', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders placeholder navigation items for repository sections', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    // Check that placeholder items exist (as text, not links)
    expect(screen.getByText('Files')).toBeInTheDocument()
    expect(screen.getByText('Commits')).toBeInTheDocument()
    expect(screen.getByText('Pull Requests')).toBeInTheDocument()
    expect(screen.getByText('Issues')).toBeInTheDocument()
  })

  it('has correct width and flex layout classes', () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    const aside = container.querySelector('aside')
    expect(aside).toHaveClass('w-[280px]')
    expect(aside).toHaveClass('flex-col')
  })

  it('is hidden on mobile and visible on large screens', () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    const aside = container.querySelector('aside')
    expect(aside).toHaveClass('hidden')
    expect(aside).toHaveClass('lg:flex')
  })

  it('placeholder items are non-interactive', () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    // Placeholder items should have cursor-not-allowed class
    const placeholders = container.querySelectorAll('.cursor-not-allowed')
    expect(placeholders.length).toBeGreaterThan(0)
  })
})

describe('MobileSidebarContent', () => {
  it('contains nav element with aria-label', () => {
    render(
      <MemoryRouter>
        <MobileSidebarContent />
      </MemoryRouter>
    )

    const nav = screen.getByRole('navigation', { name: /mobile navigation/i })
    expect(nav).toBeInTheDocument()
  })

  it('renders Home navigation link', () => {
    render(
      <MemoryRouter>
        <MobileSidebarContent />
      </MemoryRouter>
    )

    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders placeholder navigation items', () => {
    render(
      <MemoryRouter>
        <MobileSidebarContent />
      </MemoryRouter>
    )

    expect(screen.getByText('Files')).toBeInTheDocument()
    expect(screen.getByText('Commits')).toBeInTheDocument()
    expect(screen.getByText('Pull Requests')).toBeInTheDocument()
    expect(screen.getByText('Issues')).toBeInTheDocument()
  })

  it('renders "Powered by Crosstown Pattern" branding', () => {
    render(
      <MemoryRouter>
        <MobileSidebarContent />
      </MemoryRouter>
    )

    expect(screen.getByText(/powered by crosstown pattern/i)).toBeInTheDocument()
  })

  it('Home link is keyboard navigable', () => {
    render(
      <MemoryRouter>
        <MobileSidebarContent />
      </MemoryRouter>
    )

    const homeLink = screen.getByRole('link', { name: /home/i })
    expect(homeLink.tagName).toBe('A')
  })

  it('placeholder items are non-interactive', () => {
    const { container } = render(
      <MemoryRouter>
        <MobileSidebarContent />
      </MemoryRouter>
    )

    const placeholders = container.querySelectorAll('.cursor-not-allowed')
    expect(placeholders.length).toBeGreaterThan(0)
  })
})
