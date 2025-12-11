/**
 * Numbers, math, etc.
 */
import { ValidationError } from './errors'

/** Random number between min and max. May enable float */
export function random(min: number, max: number, float?: boolean): number {
  const number = Math.random() * (max - min) + min
  return float ? number : Math.round(number)
}

/** Same as Number.parseInt but throws if NaN or not safe */
export function parseInt(parameter: unknown, radix?: number) {
  const n = Number.parseInt(parameter as string, radix)

  if (Number.isNaN(n) || !Number.isSafeInteger(n))
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new ValidationError(`Can not parse "${parameter}" to integer`)
  return n
}

/** Same as Number.parseFloat but throws if NaN or Infinity */
export function parseFloat(parameter: unknown) {
  const n = Number.parseFloat(parameter as string)

  if (Number.isNaN(n) || !Number.isFinite(n))
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new ValidationError(`Can not parse "${parameter}" to float`)
  return n
}

/** Factorial */
export function factorial(n: number) {
  if (n === 0 || n === 1) return 1
  let result = 1
  for (let index = 2; index <= n; index++) result *= index
  return result
}

/** Fibonacci */
export function fib(n: number) {
  let a = 0n
  let b = 1n
  let temporary = 0n
  while (n-- > 0) {
    temporary = a + b
    a = b
    b = temporary
  }
  return a
}

/** Clamp numbers to max and min */
export function clamp(value: number, min = -Infinity, max = Infinity) {
  if (value > max) return max
  if (value < min) return min
  return value
}

/** Is number in range. Inclusive. */
export function inRange(value: number, min = -Infinity, max = Infinity) {
  return value <= max && value >= min
}

/** Calucalate avarage from array of numbers */
export function mean(array: number[]) {
  let sum = 0
  for (let index = 0; index < array.length; index++) sum += array[index]!
  return sum / array.length
}

/**
 * Round with precision.
 *
 * @example
 * round(1.2345); // 1
 * round(1.2345, 2); // 1.23
 * round(1.2345, 10); // 1.2345
 */
export function round(value: number, precision = 0) {
  const mult = 10 ** precision
  return Math.round(value * mult) / mult
}

/** Sum of array of numbers */
export function sum(array: number[]) {
  let result = 0
  for (let index = 0; index < array.length; index++) result += array[index]!
  return result
}
