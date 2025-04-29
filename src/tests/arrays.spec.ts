// eslint-disable-next-line import-x/no-unresolved
import { describe, expect, it } from 'bun:test'

import {
  binarySearch,
  chunk,
  combinations,
  permutations,
  pushToSorted,
  randomFromArray,
  removeFromArray,
  removeLastFromArray,
  shuffleArray,
  swap,
} from '../arrays'

describe('randomFromArray', () => {
  it('returns a random element from a non-empty array', () => {
    const array = [1, 2, 3, 4, 5]
    const result = randomFromArray(array)
    expect(array.includes(result)).toBe(true)
  })

  it('throws an error if array is empty', () => {
    expect(() => randomFromArray([])).toThrow(
      'Can not return random element from empty array',
    )
  })
})

describe('shuffleArray', () => {
  it('returns an array of the same elements but shuffled', () => {
    const array = [1, 2, 3, 4, 5]
    const shuffled = shuffleArray(array)
    expect(shuffled.sort()).toEqual(array.sort())
  })
})

describe('swap', () => {
  it('swaps two elements in an array', () => {
    const array = [1, 2, 3, 4]
    swap(array, 1, 3)
    expect(array).toEqual([1, 4, 3, 2])
  })
})

describe('binarySearch', () => {
  it('finds an element in a sorted array of number in one step', () => {
    const array = [10, 20, 30, 40, 50]
    let steps = 0
    const index = binarySearch(array.length, (index_) => {
      steps++
      return array[index_]! - 30
    })
    expect(index).toBe(2)
    expect(steps).toBe(1)
  })
  it('finds every element in array not more than in 3 steps', () => {
    const array = ['abc', 'acc', 'bbc', 'cbc', 'dcb']
    const collator = Intl.Collator()
    for (let index = 0; index < array.length; index++) {
      const element = array[index]!
      let steps = 0
      const found = binarySearch(array.length, (index) => {
        steps++
        return collator.compare(array[index]!, element)
      })
      expect(found).toBe(index)
      expect(steps).toBeLessThanOrEqual(3)
    }
  })
})

describe('chunk', () => {
  it('splits an array into smaller arrays of given size', () => {
    const array = [1, 2, 3, 4, 5, 6]
    expect(chunk(array, 2)).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ])
  })
})

describe('combinations', () => {
  it('returns all combinations of elements in the array', () => {
    const array = [1, 2]
    expect(combinations(array)).toEqual([[], [1], [2], [1, 2]])
  })
})

describe('permutations', () => {
  it('returns all permutations of elements in the array', () => {
    const array = [1, 2]
    expect(permutations(array)).toEqual([
      [1, 2],
      [2, 1],
    ])
  })
})

describe('pushToSorted', () => {
  it('inserts an element while maintaining sort order', () => {
    const array = [1, 3, 5]
    pushToSorted(array, 4, (element) => element - 4)
    expect(array).toEqual([1, 3, 4, 5])
    pushToSorted(array, 4, (element) => element - 4)
    expect(array).toEqual([1, 3, 4, 4, 5])
  })

  it('inserts an element if place not found', () => {
    const array = [1, 3, 5]
    pushToSorted(array, -100, (element) => element + 100)
    expect(array).toEqual([-100, 1, 3, 5])
  })

  it('empty array', () => {
    const array: { data: number }[] = []
    pushToSorted(array, { data: 10 }, (element) => element.data - 10)
    expect(array).toEqual([{ data: 10 }])
  })
})

describe('removeFromArray', () => {
  it('removeFromArray', () => {
    const array = [1, 2, 3, 3, 2, 1]
    expect(removeFromArray(array, 2)).toBe(1)
    expect(array).toEqual([1, 3, 3, 2, 1])
    expect(removeFromArray(array, 0)).toBe(-1)
    expect(array).toEqual([1, 3, 3, 2, 1])
  })

  it('removeLastFromArray', () => {
    const array = [1, 2, 3, 3, 2, 1]
    expect(removeLastFromArray(array, 2)).toBe(4)
    expect(array).toEqual([1, 2, 3, 3, 1])
    expect(removeLastFromArray(array, Infinity)).toBe(-1)
    expect(array).toEqual([1, 2, 3, 3, 1])
  })
})
