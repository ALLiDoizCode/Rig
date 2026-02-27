/**
 * Relay badge variant calculation
 *
 * Determines color coding for relay status badges based on the ratio
 * of responded relays to total configured relays.
 *
 * Extracted from RelayStatusBadge to satisfy react-refresh/only-export-components
 * lint rule (component files should only export components).
 *
 * Story 2.5: Relay Status Indicators
 */

/**
 * Determine badge color and label based on relay response ratio.
 *
 * Thresholds use the ratio of responded relays to total configured relays,
 * adapting automatically when the relay count changes via VITE_NOSTR_RELAYS.
 *
 * @param responded - Number of relays that responded successfully
 * @param total - Total number of configured relays
 * @returns Object with Tailwind className for color and label text
 */
export function getRelayBadgeVariant(responded: number, total: number): {
  className: string
  label: string
} {
  if (responded <= 0 || total <= 0) return { className: '', label: '' }
  const ratio = responded / total
  const label = `Verified on ${responded} of ${total} relay${total === 1 ? '' : 's'}`
  if (ratio >= 0.8) {
    return {
      className: 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400',
      label,
    }
  }
  if (ratio >= 0.4) {
    return {
      className: 'border-yellow-600 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400',
      label,
    }
  }
  return {
    className: 'border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400',
    label,
  }
}
