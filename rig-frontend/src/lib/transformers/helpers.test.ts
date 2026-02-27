import { describe, it, expect } from 'vitest'
import { getTagValue, getTagValues, getATag } from './helpers'

describe('getTagValue', () => {
  it('should return value from first matching tag', () => {
    const tags = [
      ['name', 'my-repo'],
      ['description', 'A cool repository']
    ]
    expect(getTagValue(tags, 'name')).toBe('my-repo')
  })

  it('should return null when tag not found', () => {
    const tags = [['name', 'my-repo']]
    expect(getTagValue(tags, 'missing')).toBe(null)
  })

  it('should return null when tag has no value', () => {
    const tags = [['name']]
    expect(getTagValue(tags, 'name')).toBe(null)
  })

  it('should return first match when multiple tags exist', () => {
    const tags = [
      ['web', 'https://example.com'],
      ['web', 'https://example.org']
    ]
    expect(getTagValue(tags, 'web')).toBe('https://example.com')
  })

  it('should handle empty tags array', () => {
    expect(getTagValue([], 'name')).toBe(null)
  })

  it('should handle malformed tag structure', () => {
    const tags = [['name', '', 'extra']]
    expect(getTagValue(tags, 'name')).toBe('')
  })
})

describe('getTagValues', () => {
  it('should return all values from matching tags', () => {
    const tags = [
      ['web', 'https://example.com'],
      ['name', 'my-repo'],
      ['web', 'https://example.org']
    ]
    expect(getTagValues(tags, 'web')).toEqual([
      'https://example.com',
      'https://example.org'
    ])
  })

  it('should return empty array when tag not found', () => {
    const tags = [['name', 'my-repo']]
    expect(getTagValues(tags, 'missing')).toEqual([])
  })

  it('should handle tags with no values', () => {
    const tags = [
      ['web', 'https://example.com'],
      ['web']
    ]
    expect(getTagValues(tags, 'web')).toEqual(['https://example.com'])
  })

  it('should handle empty tags array', () => {
    expect(getTagValues([], 'web')).toEqual([])
  })

  it('should preserve order of matching tags', () => {
    const tags = [
      ['t', 'bug'],
      ['t', 'enhancement'],
      ['t', 'documentation']
    ]
    expect(getTagValues(tags, 't')).toEqual(['bug', 'enhancement', 'documentation'])
  })
})

describe('getATag', () => {
  it('should return a tag value in standard format', () => {
    const tags = [
      ['a', '30617:abc123:my-repo'],
      ['p', 'def456']
    ]
    expect(getATag(tags)).toBe('30617:abc123:my-repo')
  })

  it('should return null when a tag not found', () => {
    const tags = [['p', 'def456']]
    expect(getATag(tags)).toBe(null)
  })

  it('should return null when a tag has no value', () => {
    const tags = [['a']]
    expect(getATag(tags)).toBe(null)
  })

  it('should return first a tag when multiple exist', () => {
    const tags = [
      ['a', '30617:abc:repo1'],
      ['a', '30617:def:repo2']
    ]
    expect(getATag(tags)).toBe('30617:abc:repo1')
  })

  it('should handle empty tags array', () => {
    expect(getATag([])).toBe(null)
  })
})
