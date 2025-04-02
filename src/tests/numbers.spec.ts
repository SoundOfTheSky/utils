// eslint-disable-next-line import-x/no-unresolved
import { describe, expect, it } from 'bun:test'

import { factorial, fib, parseFloat, parseInt, random } from '../numbers'

describe('random', () => {
  it('generates random numbers in range', () => {
    const number_ = random(1, 10)
    expect(number_).toBeGreaterThanOrEqual(1)
    expect(number_).toBeLessThanOrEqual(10)
  })
})

describe('parseInt', () => {
  it('parses integers correctly', () => {
    expect(parseInt('42')).toBe(42)
    expect(() => parseInt('abc')).toThrow()
  })
})

describe('parseFloat', () => {
  it('parses floats correctly', () => {
    expect(parseFloat('3.14')).toBeCloseTo(3.14)
    expect(() => parseFloat('xyz')).toThrow()
  })
})

describe('factorial', () => {
  it('computes factorial correctly', () => {
    expect(factorial(0)).toBe(1)
    expect(factorial(5)).toBe(120)
  })
})

describe('fib', () => {
  it('computes Fibonacci correctly', () => {
    expect(fib(0)).toBe(0n)
    expect(fib(5)).toBe(5n)
    expect(fib(10)).toBe(55n)
  })
})
