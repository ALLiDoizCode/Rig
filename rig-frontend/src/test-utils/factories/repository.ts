/**
 * Repository data factory for tests
 *
 * Generates Repository domain model objects with sensible defaults.
 * All values can be overridden for specific test scenarios.
 *
 * Uses sequential counters instead of faker to keep the project dependency-free
 * of @faker-js/faker. For this project's test scale, deterministic sequential
 * data is sufficient and more predictable.
 */
import type { Repository } from '@/types/repository'

let counter = 0

/**
 * Create a single Repository with optional overrides.
 *
 * @param overrides - Partial Repository fields to override defaults
 * @returns Complete Repository object
 */
export function createRepository(overrides: Partial<Repository> = {}): Repository {
  counter++
  return {
    id: `repo-${counter}`,
    name: `Repository ${counter}`,
    description: `Description for repository ${counter}`,
    owner: `pubkey-owner-${counter}`,
    maintainers: [`pubkey-maintainer-${counter}`],
    webUrls: [`https://example.com/repo-${counter}`],
    cloneUrls: [`https://git.example.com/repo-${counter}.git`],
    relays: ['wss://relay.damus.io', 'wss://nos.lol'],
    topics: ['open-source'],
    isPersonalFork: false,
    earliestUniqueCommit: null,
    eventId: `event-${counter}`,
    createdAt: 1700000000 + counter,
    ...overrides,
  }
}

/**
 * Create multiple Repository objects.
 *
 * @param count - Number of repositories to create
 * @param overrides - Partial Repository fields applied to all created items
 * @returns Array of Repository objects
 */
export function createRepositories(count: number, overrides: Partial<Repository> = {}): Repository[] {
  return Array.from({ length: count }, () => createRepository(overrides))
}

/**
 * Reset the counter for test isolation.
 * Call this in beforeEach() to get predictable IDs across tests.
 */
export function resetRepositoryCounter(): void {
  counter = 0
}
