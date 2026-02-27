/**
 * Entity status type
 *
 * Status is derived from the most recent status event (kinds 1630-1633):
 * - open: Default state or kind 1630
 * - applied: Kind 1631 (for patches/PRs) or resolved (for issues)
 * - closed: Kind 1632 (closed without merge/resolution)
 * - draft: Kind 1633 (draft state)
 */
export type EntityStatus = 'open' | 'applied' | 'closed' | 'draft'

/**
 * Common error structure for Rig application
 *
 * Provides consistent error handling with both technical and user-facing messages
 */
export interface RigError {
  /** Error code for categorization and handling */
  code:
    | 'RELAY_TIMEOUT'
    | 'VALIDATION_FAILED'
    | 'GATEWAY_ERROR'
    | 'ARNS_RESOLUTION_FAILED'
  /** Technical details for logging and debugging */
  message: string
  /** User-friendly message for UI display */
  userMessage: string
  /** Additional context data for debugging */
  context?: Record<string, unknown>
}

/**
 * Type guard to check if an unknown error conforms to the RigError interface.
 *
 * TanStack Query v5 preserves the original thrown value in `error`.
 * Since the service layer throws plain objects (not Error instances),
 * this type guard safely checks for the `userMessage` property.
 *
 * @param error - Unknown error value from TanStack Query or catch blocks
 * @returns True if the error has a string `userMessage` property
 */
export function isRigError(error: unknown): error is RigError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as RigError).code === 'string' &&
    'userMessage' in error &&
    typeof (error as RigError).userMessage === 'string'
  )
}
