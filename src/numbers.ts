/**
 * Numbers, math, etc.
 */
import { ValidationError } from './errors'

/** Random number between min and max. May enable float */
export function random(min: number, max: number, float?: boolean): number {
  const number_ = Math.random() * (max - min) + min
  return float ? number_ : Math.round(number_)
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
