// eslint-disable-next-line import-x/no-unresolved
import { describe, expect, it } from 'bun:test'

import {
  clamp,
  factorial,
  fib,
  inRange,
  mean,
  parseFloat,
  parseInt,
  random,
  round,
  sum,
} from '../numbers'

describe('random', () => {
  it('generates random numbers in range', () => {
    const number = random(1, 10)
    expect(number).toBeGreaterThanOrEqual(1)
    expect(number).toBeLessThanOrEqual(10)
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

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 1, 10)).toBe(5)
  })

  it('clamps to min when below min', () => {
    expect(clamp(0, 1, 10)).toBe(1)
  })

  it('clamps to max when above max', () => {
    expect(clamp(20, 1, 10)).toBe(10)
  })

  it('works with default min/max', () => {
    expect(clamp(42)).toBe(42)
  })
})

describe('inRange', () => {
  it('returns true when value is within range (inclusive)', () => {
    expect(inRange(5, 1, 10)).toBe(true)
  })

  it('returns false when value is below range', () => {
    expect(inRange(0, 1, 10)).toBe(false)
  })

  it('returns false when value is above range', () => {
    expect(inRange(11, 1, 10)).toBe(false)
  })

  it('returns true when value equals min or max', () => {
    expect(inRange(1, 1, 10)).toBe(true)
    expect(inRange(10, 1, 10)).toBe(true)
  })

  it('works with default range', () => {
    expect(inRange(100)).toBe(true)
  })
})

describe('mean', () => {
  it('returns the average of positive numbers', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3)
  })

  it('returns the average of mixed numbers', () => {
    expect(mean([-2, 0, 2])).toBe(0)
  })

  it('returns NaN for empty array', () => {
    expect(Number.isNaN(mean([]))).toBe(true)
  })
})

describe('round', () => {
  it('rounds to whole number by default', () => {
    expect(round(1.6)).toBe(2)
    expect(round(1.4)).toBe(1)
  })

  it('rounds to specified precision', () => {
    expect(round(1.2345, 2)).toBe(1.23)
    expect(round(1.2355, 2)).toBe(1.24)
    expect(round(1.2355, 100)).toBe(1.2355)
  })

  it('handles zero precision explicitly', () => {
    expect(round(9.99, 0)).toBe(10)
  })
})

describe('sum', () => {
  it('returns 0 for empty array', () => {
    expect(sum([])).toBe(0)
  })

  it('sums positive numbers', () => {
    expect(sum([1, 2, 3, 4, 5])).toBe(15)
  })

  it('sums negative and positive numbers', () => {
    expect(sum([-1, -2, 3])).toBe(0)
  })

  it('sums decimal numbers', () => {
    expect(sum([0.1, 0.2, 0.3])).toBeCloseTo(0.6)
  })
})
