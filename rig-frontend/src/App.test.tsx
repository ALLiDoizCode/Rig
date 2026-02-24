import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    // Verify that Vite + React content is rendered
    const viteElements = screen.getAllByText(/vite/i)
    expect(viteElements.length).toBeGreaterThan(0)
  })

  it('renders React logo', () => {
    render(<App />)
    const reactElements = screen.getAllByText(/react/i)
    expect(reactElements.length).toBeGreaterThan(0)
  })
})
