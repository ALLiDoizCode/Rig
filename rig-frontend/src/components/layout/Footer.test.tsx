import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders as semantic footer element', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('renders Rig branding text', () => {
    render(<Footer />)
    expect(screen.getByText(/rig — decentralized git repository browser/i)).toBeInTheDocument()
  })

  it('renders "Powered by Crosstown Pattern" branding', () => {
    render(<Footer />)
    expect(screen.getByText(/powered by crosstown pattern/i)).toBeInTheDocument()
  })

  it('has border-t class for top border', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')
    expect(footer).toHaveClass('border-t')
  })

  it('uses flex layout for responsive design', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')
    expect(footer).toHaveClass('py-6')
    expect(footer).toHaveClass('md:py-0')
  })
})
