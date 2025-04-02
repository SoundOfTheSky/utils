// eslint-disable-next-line import-x/no-unresolved
import { describe, expect, it } from 'bun:test'

import {
  addPrefixToObject,
  deepEquals,
  getPropertyNames,
  objectFilter,
  objectMap,
  pick,
} from '../objects'

describe('getPropertyNames', () => {
  it('should get all property names, including prototype', () => {
    class Parent {
      public parentProp = 'parent'
    }
    class Child extends Parent {
      public childProp = 'child'
    }
    const object = new Child()
    const properties = getPropertyNames(object)
    expect(properties.has('childProp')).toBe(true)
    expect(properties.has('parentProp')).toBe(true)
  })
})

describe('objectMap', () => {
  it('should map object properties', () => {
    const object = { a: 1, b: 2 }
    const mapped = objectMap(object, (key, value) => [
      key.toUpperCase(),
      value * 2,
    ])
    expect(mapped).toEqual({ A: 2, B: 4 })
  })
})

describe('objectFilter', () => {
  it('should filter object properties', () => {
    const object = { a: 1, b: 2, c: 3 }
    const filtered = objectFilter(object, (_, value) => value % 2 !== 0)
    expect(filtered).toEqual({ a: 1, c: 3 })
  })
})

describe('addPrefixToObject', () => {
  it('should add prefix to object keys', () => {
    const object = { name: 'Alice', age: 30 }
    const prefixed = addPrefixToObject(object, 'user_')
    expect(prefixed).toEqual({ user_name: 'Alice', user_age: 30 })
  })
})

describe('deepEquals', () => {
  it('compares primitives correctly', () => {
    expect(deepEquals(1, 1)).toBe(true)
    expect(deepEquals(1, 2)).toBe(false)
    expect(deepEquals('hello', 'hello')).toBe(true)
    expect(deepEquals('hello', 'world')).toBe(false)
    expect(deepEquals(null, null)).toBe(true)
    expect(deepEquals(undefined, undefined)).toBe(true)
    expect(deepEquals(null, undefined)).toBe(false)
  })

  it('compares arrays correctly', () => {
    expect(deepEquals([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(deepEquals([1, 2, 3], [1, 2, 4])).toBe(false)
    expect(deepEquals([1, [2, 3]], [1, [2, 3]])).toBe(true)
    expect(deepEquals([1, [2, 3]], [1, [3, 2]])).toBe(false)
  })

  it('compares objects correctly', () => {
    expect(deepEquals({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
    expect(deepEquals({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false)
    expect(deepEquals({ a: { b: 2 } }, { a: { b: 2 } })).toBe(true)
    expect(deepEquals({ a: { b: 2 } }, { a: { b: 3 } })).toBe(false)
  })

  it('compares dates correctly', () => {
    expect(deepEquals(new Date(1000), new Date(1000))).toBe(true)
    expect(deepEquals(new Date(1000), new Date(2000))).toBe(false)
  })

  it('compares sets and maps correctly', () => {
    expect(deepEquals(new Set([1, 2, 3]), new Set([1, 2, 3]))).toBe(true)
    expect(deepEquals(new Set([1, 2, 3]), new Set([1, 3, 2]))).toBe(true)
    expect(deepEquals(new Set([1, 2, 3]), new Set([1, 2, 4]))).toBe(false)
    expect(
      deepEquals(
        new Map([
          ['a', 1],
          ['b', 2],
        ]),
        new Map([
          ['a', 1],
          ['b', 2],
        ]),
      ),
    ).toBe(true)
    expect(
      deepEquals(
        new Map([
          ['a', 1],
          ['b', 2],
        ]),
        new Map([
          ['a', 1],
          ['b', 3],
        ]),
      ),
    ).toBe(false)
  })

  it('compares iterables correctly', () => {
    function* gen1() {
      yield 1
      yield 2
      yield 3
    }
    function* gen2() {
      yield 1
      yield 2
      yield 3
    }
    function* gen3() {
      yield 1
      yield 2
      yield 4
    }
    expect(deepEquals(gen1(), gen2())).toBe(true)
    expect(deepEquals(gen1(), gen3())).toBe(false)
  })

  it('handles circular references correctly', () => {
    const objectA: any = { a: 1 }
    const objectB: any = { a: 1 }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    objectA.self = objectA
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    objectB.self = objectB
    expect(deepEquals(objectA, objectB)).toBe(true)

    const objectC: any = { a: 3 }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    objectC.self = objectA
    expect(deepEquals(objectA, objectC)).toBe(false)
  })
})

describe('pick', () => {
  it('should pick only the selected keys', () => {
    const object = { a: 1, b: 2, c: 3 }
    expect(pick(object, ['a', 'c'])).toEqual({ a: 1, c: 3 })
  })
})
