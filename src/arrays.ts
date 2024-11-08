/**
 * Everything array related.
 */

/** Returns random element from non-empty array */
export function randomFromArray<T>(arr: T[]): T {
  if (arr.length === 0)
    throw new Error('Can not return random element from empty array');
  return arr[~~(Math.random() * arr.length)]!;
}

/** Create new shuffled array */
export function shuffleArray<T>(arr: T[]): T[] {
  const array = [...arr];
  for (let i = 0; i < array.length; i++) {
    const i2 = ~~(Math.random() * array.length);
    const buf = array[i2]!;
    array[i2] = array[i]!;
    array[i] = buf;
  }
  return array;
}

/** Swap two elements in array */
export function swap<T>(arr: T[], i: number, i2: number) {
  const temp = arr[i2]!;
  arr[i2] = arr[i]!;
  arr[i] = temp;
  return arr;
}

/**
 * Binary search in sorted array.
 * Compare function should compare your needed value with value on index passed to it.
 * If compare returns 0 it means we found target.
 * If compare returns > 0 it means we have to cut out bigger side of array.
 * If compare returns < 0 it means we have to cut out smaller side of array.
 */
export function binarySearch(size: number, compare: (index: number) => number) {
  let low = 0;
  let high = size - 1;
  let position = -1;
  while (low <= high) {
    const mid = ~~((low + high) / 2);
    const compared = compare(mid);
    if (compared === 0) {
      position = mid;
      break;
    } else if (compared > 0) high = mid - 1;
    else low = mid + 1;
  }
  return position;
}

/** Split array into sub arrays of spicified size */
export function chunk<T>(arr: T[], chunkSize: number): T[][] {
  const copy = [...arr];
  const result: T[][] = [];
  while (copy.length) result.push(copy.splice(0, chunkSize));
  return result;
}