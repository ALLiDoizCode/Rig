/**
 * Error Boundary Component
 *
 * React error boundary to catch unhandled rendering errors.
 * Must be a class component (React limitation).
 */

import React from 'react'

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  /** Called when the user clicks "Try Again", before resetting error state.
   *  Use to clear caches, reset query clients, or update component keys. */
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component
 *
 * Catches React errors in child components and displays fallback UI.
 * Provides a "Try Again" button to reset the error state.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so next render shows fallback UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = (): void => {
    // Allow parent to clear caches/state before re-render
    this.props.onReset?.()
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null
    })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <h2 className="mb-2 text-xl font-semibold text-destructive">
              Something went wrong
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReset}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
