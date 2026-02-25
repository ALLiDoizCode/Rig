import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from './error-boundary'

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Child content')).toBeTruthy()
  })

  it('should catch errors and display fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeTruthy()
    expect(screen.getByText(/test error message/i)).toBeTruthy()
  })

  it('should display Try Again button in fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByRole('button', { name: /try again/i })).toBeTruthy()
  })

  it('should call onReset callback when Try Again is clicked', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()

    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Should show error
    expect(screen.getByText(/something went wrong/i)).toBeTruthy()

    // Click Try Again
    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    await user.click(tryAgainButton)

    // onReset should have been called before state reset
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('should log errors to console', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeTruthy()
  })

  it('should not render children when error is caught', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.queryByText('No error')).toBeFalsy()
  })
})
