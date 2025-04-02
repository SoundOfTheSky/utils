// eslint-disable-next-line import-x/no-unresolved
import { describe, expect, it } from 'bun:test'

import {
  camelToSnakeCase,
  capitalizeFirstLetter,
  formatBytes,
  formatNumber,
  log,
  snakeToCamelCase,
} from '../formatting'

describe('formatNumber', () => {
  it('formats numbers into readable time', () => {
    expect(formatNumber(3_661_000)).toBe('1h 1m 1s')
    expect(formatNumber(60_000)).toBe('1m')
  })
})

describe('camelToSnakeCase', () => {
  it('converts camelCase to snake_case', () => {
    expect(camelToSnakeCase('thisCase')).toBe('this_case')
    expect(camelToSnakeCase('anotherExampleTest')).toBe('another_example_test')
  })
})

describe('snakeToCamelCase', () => {
  it('converts snake_case to camelCase', () => {
    expect(snakeToCamelCase('this_case')).toBe('thisCase')
    expect(snakeToCamelCase('another_example_test')).toBe('anotherExampleTest')
  })
})

describe('formatBytes', () => {
  it('formats bytes into human-readable format', () => {
    expect(formatBytes(1024)).toBe('1KB')
    expect(formatBytes(1_048_576)).toBe('1MB')
  })
})

describe('log', () => {
  it('logs output without throwing errors', () => {
    expect(() => {
      log('Test log')
    }).not.toThrow()
  })
})

describe('capitalizeFirstLetter', () => {
  it('capitalizes the first letter of a string', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello')
    expect(capitalizeFirstLetter('world')).toBe('World')
  })
})
