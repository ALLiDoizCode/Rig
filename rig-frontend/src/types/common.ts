/**
 * Common error structure for Rig application
 *
 * Provides consistent error handling with both technical and user-facing messages
 */
export interface RigError {
  /** Error code for categorization and handling */
  code: 'RELAY_TIMEOUT' | 'VALIDATION_FAILED' | 'GATEWAY_ERROR' | 'SIGNATURE_INVALID'
  /** Technical details for logging and debugging */
  message: string
  /** User-friendly message for UI display */
  userMessage: string
  /** Additional context data for debugging */
  context?: Record<string, unknown>
}
