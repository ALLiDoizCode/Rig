import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'

// Fix for happy-dom MutationObserver issues
// happy-dom's MutationObserver implementation can be incomplete
// This ensures a proper MutationObserver is available for testing-library
if (typeof global.MutationObserver === 'undefined' || !global.MutationObserver.prototype.observe) {
  class MutationObserverMock {
    observe() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  global.MutationObserver = MutationObserverMock as typeof MutationObserver
}
