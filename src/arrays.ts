/**
 * Everything array related.
 */

/** Returns random element from non-empty array */
export function randomFromArray<T>(array: T[]): T {
  if (array.length === 0)
    throw new Error('Can not return random element from empty array')
  return array[Math.trunc(Math.random() * array.length)]!
}

/** Create new shuffled array */
export function shuffleArray<T>(array_: T[]): T[] {
  const array = [...array_]
  for (let index = 0; index < array.length; index++) {
    const index2 = Math.trunc(Math.random() * array.length)
    const buf = array[index2]!
    array[index2] = array[index]!
    array[index] = buf
  }
  return array
}

/** Swap two elements in array */
export function swap<T>(array: T[], index: number, index2: number) {
  const temporary = array[index2]!
  array[index2] = array[index]!
  array[index] = temporary
  return array
}

/**
 * Binary search in sorted array.
 * Compare function should compare your needed value with value on index passed to it.
 * If compare returns 0 it means we found target.
 * If compare returns > 0 it means we have to cut out bigger side of array.
 * If compare returns < 0 it means we have to cut out smaller side of array.
 */
export function binarySearch(
  size: number,
  compare: (index: number) => number,
  returnClosest?: boolean,
) {
  if (size === 0) return returnClosest ? 0 : -1
  let low = 0
  let high = size
  let mid = -1
  while (high > low) {
    mid = ((low + high) / 2) | 0
    const compared = compare(mid)
    if (compared === 0) return mid
    else if (compared > 0) high = mid
    else low = mid + 1
  }
  return returnClosest ? low : -1
}

/** Split array into sub arrays of spicified size */
export function chunk<T>(array: T[], chunkSize: number): T[][] {
  const copy = [...array]
  const result: T[][] = []
  while (copy.length > 0) result.push(copy.splice(0, chunkSize))
  return result
}

/** Return all combinations of items in array */
export function combinations<T>(array: T[]): T[][] {
  const amount = 1 << array.length
  const combinations = new Array(amount) as T[][]
  for (
    let combinationIndex = 0;
    combinationIndex < amount;
    combinationIndex++
  ) {
    const combination: T[] = []
    for (let index = 0; index < array.length; index++)
      if ((combinationIndex >> index) & 1) combination.push(array[index]!)
    combinations[combinationIndex] = combination
  }
  return combinations
}

/** Return all permutations of items in array */
export function permutations<T>(array: T[]): T[][] {
  const n = array.length
  const result = [] as T[][]
  const control = new Array(n).fill(0) as number[]
  result.push([...array])
  let index = 0
  while (index < n) {
    if (control[index]! < index) {
      const k = index % 2 === 0 ? 0 : control[index]!
      swap(array, index, k)
      result.push([...array])
      control[index]!++
      index = 0
    } else {
      control[index] = 0
      index++
    }
  }
  return result
}

/**
 * Push data to sorted array. Array will always be kept sorted.
 *
 * Compare function should compare your needed value with value on index passed to it.
 * If compare returns 0 it means we found target.
 * If compare returns > 0 it means target is smaller.
 * If compare returns < 0 it means target is bigger.
 *
 * ```ts
 * pushToSorted(numArray, 10,  x => x - 10);
 * ```
 */
export function pushToSorted<T>(
  array: T[],
  element: T,
  compare: (x: T) => number,
) {
  const index = binarySearch(array.length, (x) => compare(array[x]!), true)
  array.splice(index, 0, element)
}

/**
 * Delete value from array.
 * Only deletes first encountered.
 *
 * Returns index of deleted value.
 */
export function removeFromArray<T>(array: T[], value: T): number {
  const index = array.indexOf(value)
  if (index !== -1) array.splice(index, 1)
  return index
}

/**
 * Delete value from array.
 * Only deletes last encountered.
 *
 * Returns index of deleted value.
 */
export function removeLastFromArray<T>(array: T[], value: T): number {
  const index = array.lastIndexOf(value)
  if (index !== -1) array.splice(index, 1)
  return index
}

/** Reverse part of array */
export function reverse<T>(array: T[], start: number, end: number): T[] {
  array = [...array]
  const n = ((end - start + 1) / 2) | 0
  for (let index = 0; index < n; index++) {
    const temporary = array[start + index]!
    array[start + index] = array[end - index]!
    array[end - index] = temporary
  }
  return array
}
