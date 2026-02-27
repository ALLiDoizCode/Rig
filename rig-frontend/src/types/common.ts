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
