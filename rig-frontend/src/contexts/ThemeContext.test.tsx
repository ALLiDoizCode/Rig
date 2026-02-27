import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ThemeProvider, useTheme } from './ThemeContext'

// Test component that uses the theme context
function TestComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  )
}

describe('ThemeContext', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>
  let matchMediaListeners: ((event: MediaQueryListEvent) => void)[] = []

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()

    // Clear dark class from html element
    document.documentElement.classList.remove('dark')

    // Reset listeners
    matchMediaListeners = []

    // Mock matchMedia with default light theme
    mockMatchMedia = vi.fn((query: string) => ({
      matches: false, // light mode by default
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          matchMediaListeners.push(handler)
        }
      }),
      removeEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          const index = matchMediaListeners.indexOf(handler)
          if (index > -1) {
            matchMediaListeners.splice(index, 1)
          }
        }
      }),
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: mockMatchMedia,
    })
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to system preference (light)', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('defaults to system preference (dark)', () => {
    // Mock system dark mode
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('switches to dark theme and adds .dark class to html', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const darkButton = screen.getByRole('button', { name: 'Set Dark' })
    await user.click(darkButton)

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  it('switches to light theme and removes .dark class from html', async () => {
    const user = userEvent.setup()

    // Start with dark mode
    document.documentElement.classList.add('dark')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const lightButton = screen.getByRole('button', { name: 'Set Light' })
    await user.click(lightButton)

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  it('persists theme preference to localStorage', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const darkButton = screen.getByRole('button', { name: 'Set Dark' })
    await user.click(darkButton)

    await waitFor(() => {
      expect(localStorage.getItem('rig-theme')).toBe('dark')
    })

    const lightButton = screen.getByRole('button', { name: 'Set Light' })
    await user.click(lightButton)

    await waitFor(() => {
      expect(localStorage.getItem('rig-theme')).toBe('light')
    })
  })

  it('reads theme preference from localStorage on mount', () => {
    localStorage.setItem('rig-theme', 'dark')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('responds to system preference changes when in system mode', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Verify we're in system mode
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')

    // Simulate system theme change to dark
    const changeEvent = new Event('change') as MediaQueryListEvent
    Object.defineProperty(changeEvent, 'matches', { value: true })

    // Trigger all registered listeners (wrapped in act to avoid warnings)
    await act(async () => {
      matchMediaListeners.forEach((listener) => listener(changeEvent))
    })

    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    // Simulate system theme change back to light
    const lightChangeEvent = new Event('change') as MediaQueryListEvent
    Object.defineProperty(lightChangeEvent, 'matches', { value: false })

    await act(async () => {
      matchMediaListeners.forEach((listener) => listener(lightChangeEvent))
    })

    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  it('does not respond to system preference changes when not in system mode', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Switch to explicit dark mode
    const darkButton = screen.getByRole('button', { name: 'Set Dark' })
    await user.click(darkButton)

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    // Simulate system theme change to light (should be ignored)
    const changeEvent = new Event('change') as MediaQueryListEvent
    Object.defineProperty(changeEvent, 'matches', { value: false })

    matchMediaListeners.forEach((listener) => listener(changeEvent))

    // Should still be dark because we're not in system mode
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useTheme must be used within a ThemeProvider')

    consoleError.mockRestore()
  })

  it('handles invalid localStorage values gracefully', () => {
    // Test that invalid values in localStorage don't break the provider
    localStorage.setItem('rig-theme', 'invalid-value')

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    // Should fall back to system preference when stored value is invalid
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
    const resolvedTheme = screen.getByTestId('resolved-theme').textContent
    expect(resolvedTheme).toMatch(/^(light|dark)$/)
  })
})
