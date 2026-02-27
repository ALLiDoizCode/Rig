import * as React from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
)

const STORAGE_KEY = 'rig-theme'

/**
 * Get system color scheme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Load theme preference from localStorage
 */
function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch (err) {
    console.warn('Failed to read theme from localStorage:', err)
  }
  return 'system'
}

/**
 * ThemeProvider manages theme state and applies .dark class to <html>
 * Supports three modes: light, dark, system (follows OS preference)
 * Persists preference to localStorage
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(getStoredTheme)

  // Resolve actual theme (system -> light/dark)
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>(
    () => {
      const initial = getStoredTheme()
      return initial === 'system' ? getSystemTheme() : initial
    }
  )

  // Apply theme to document
  React.useEffect(() => {
    const root = document.documentElement
    const effectiveTheme = theme === 'system' ? getSystemTheme() : theme

    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    setResolvedTheme(effectiveTheme)
  }, [theme])

  // Listen for system preference changes when in system mode
  React.useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light'
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      setResolvedTheme(newTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch (err) {
      console.warn('Failed to save theme to localStorage:', err)
    }
  }, [])

  const value = React.useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Hook to access theme context
 * @throws Error if used outside ThemeProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
