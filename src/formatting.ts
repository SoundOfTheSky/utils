/**
 * Anything related to formatting and logging.
 */

/** Type for formatTime ranges */
export type FormatTimeRange = {
  start: number
  pad?: number
  title?: string
  delimiter?: string
}

/** Default time range */
export const FORMAT_NUMBER_RANGES = [
  {
    start: 31_536_000_000,
    title: 'y',
  },
  {
    start: 86_400_000,
    title: 'd',
  },
  {
    start: 3_600_000,
    title: 'h',
  },
  {
    start: 60_000,
    title: 'm',
  },
  {
    start: 1000,
    title: 's',
  },
  {
    start: 1,
    title: 'ms',
  },
] satisfies FormatTimeRange[]

/** Time range more suitable for readability */
export const FORMAT_NUMBER_RANGES_READABLE = [
  {
    start: 3_600_000,
  },
  {
    delimiter: ':',
    start: 60_000,
    pad: 2,
  },
  {
    delimiter: ':',
    start: 1000,
    pad: 2,
  },
  {
    delimiter: '.',
    start: 1,
    pad: 3,
  },
] satisfies FormatTimeRange[]

/** Bytes range  */
export const FORMAT_NUMBER_RANGES_BYTES = [
  {
    start: 1_099_511_627_776,
    title: 'TB',
  },
  {
    start: 1_073_741_824,
    title: 'GB',
  },
  {
    start: 1_048_576,
    title: 'MB',
  },
  {
    start: 1024,
    title: 'KB',
  },
  {
    start: 1,
    title: 'B',
  },
] satisfies FormatTimeRange[]

/** Milliseconds to human readable time. Minimum accuracy, if set to 1000 will stop at seconds  */
export function formatNumber(
  time: number,
  min = 0,
  ranges: FormatTimeRange[] = FORMAT_NUMBER_RANGES,
) {
  let output = ''
  for (const { start, delimiter, pad, title } of ranges) {
    if (start < min) break
    if (time < start && !pad) continue
    let value = Math.floor(time / start).toString()
    time %= start
    if (pad) value = value.padStart(pad, '0')
    if (output) output += delimiter ?? ' '
    output += value
    if (title) output += title
  }
  return output
}

/** thisCase to this_case */
export function camelToSnakeCase(string_: string) {
  return string_.replaceAll(/[A-Z]+/g, (letter) => `_${letter.toLowerCase()}`)
}
/** this_case to thisCase */
export function snakeToCamelCase(string_: string) {
  return string_.replaceAll(/_[a-z]/g, (letter) => letter[1]!.toUpperCase())
}
/** Bytes to KB,MB,GB,TB */
export function formatBytes(bytes: number) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return `0B`
  const pow = Math.trunc(Math.log(bytes) / Math.log(1024))
  const maxPow = Math.min(pow, sizes.length - 1)
  return `${Number.parseFloat((bytes / Math.pow(1024, maxPow)).toFixed(2))}${sizes[maxPow]}`
}

/** Format logging */
export function log(...agrs: unknown[]) {
  console.log(new Date().toLocaleString('ru'), ...agrs)
}

/** Capitalize first letter */
export function capitalizeFirstLetter(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * pipe() can be called on one or more functions, each of which can take the return of previous value.
 *
 * ```ts
 * // Takes string, converts to int, calc sqrt, convert and return date
 * pipe(
 *  (x: string) => Number.parseInt(x),
 *  (x) => Math.sqrt(x),
 *  (x) => new Date(x)
 * )('69')
 * ```
 */
export function pipe(): <T>(x: T) => T
export function pipe<T, A>(function1: (x: T) => A): (x: T) => A
export function pipe<T, A, B>(
  function1: (x: T) => A,
  function2: (x: A) => B,
): (x: T) => B
export function pipe<T, A, B, C>(
  function1: (x: T) => A,
  function2: (x: A) => B,
  function3: (x: B) => C,
): (x: T) => C
export function pipe<T, A, B, C, D>(
  function1: (x: T) => A,
  function2: (x: A) => B,
  function3: (x: B) => C,
  function4: (x: C) => D,
): (x: T) => D
export function pipe<T, A, B, C, D, E>(
  function1: (x: T) => A,
  function2: (x: A) => B,
  function3: (x: B) => C,
  function4: (x: C) => D,
  function5: (x: D) => E,
): (x: T) => E
export function pipe<T, A, B, C, D, E, F>(
  function1: (x: T) => A,
  function2: (x: A) => B,
  function3: (x: B) => C,
  function4: (x: C) => D,
  function5: (x: D) => E,
  function6: (x: E) => F,
): (x: T) => F
export function pipe<T, A, B, C, D, E, F, G>(
  function1: (x: T) => A,
  function2: (x: A) => B,
  function3: (x: B) => C,
  function4: (x: C) => D,
  function5: (x: D) => E,
  function6: (x: E) => F,
  function7: (x: F) => G,
): (x: T) => G
export function pipe<T, A, B, C, D, E, F, G, H>(
  function1: (x: T) => A,
  function2: (x: A) => B,
  function3: (x: B) => C,
  function4: (x: C) => D,
  function5: (x: D) => E,
  function6: (x: E) => F,
  function7: (x: F) => G,
  function8: (x: G) => H,
): (x: T) => H
export function pipe<T, A, B, C, D, E, F, G, H, I>(
  function1: (x: T) => A,
  function2: (x: A) => B,
  function3: (x: B) => C,
  function4: (x: C) => D,
  function5: (x: D) => E,
  function6: (x: E) => F,
  function7: (x: F) => G,
  function8: (x: G) => H,
  function9: (x: H) => I,
): (x: T) => I
export function pipe<T, A, B, C, D, E, F, G, H>(
  function1: (x: T) => A,
  function2: (x: A) => B,
  function3: (x: B) => C,
  function4: (x: C) => D,
  function5: (x: D) => E,
  function6: (x: E) => F,
  function7: (x: F) => G,
  function8: (x: G) => H,
  function9: (x: H) => unknown,
  ...fns: ((x: unknown) => unknown)[]
): (x: T) => unknown
export function pipe(...fns: ((argument: unknown) => unknown)[]) {
  return (input: unknown) => {
    for (let index = 0; index < fns.length; index++) input = fns[index]!(input)
    return input
  }
}
