/**
 * Utils related to code execution flow.
 */

import { AwaitedObject, JSONSerializable } from './types'

let _uuid = Date.now() * 1000
/** Get unique id */
export const UUID = () => _uuid++

/**
 * Creates cached function. All arguments/results are cached.
 * Returns [
 *  fn [cached function],
 *  delete [delete cached result for arguments]
 *  hash
 * ]
 */
export function createCashedFunction<T, V extends JSONSerializable[]>(
  function_: (...arguments_: V) => T,
) {
  const hash = new Map<string, T>()
  return [
    (...arguments_: V) => {
      const key = JSON.stringify(arguments_)
      const value = hash.get(key)
      if (value) return value
      const newValue = function_(...arguments_)
      hash.set(key, newValue)
      return newValue
    },
    (...arguments_: V) => hash.delete(JSON.stringify(arguments_)),
    hash,
  ] as const
}

/**
 * Creates cached function. All arguments/results are cached. Will store in cache resolved data.
 * Returns [
 *  fn [cached function],
 *  delete [delete cached result for arguments]
 *  hash
 * ]
 */
export function createCashedAsyncFunction<T, V extends JSONSerializable[]>(
  function_: (...arguments_: V) => Promise<T>,
) {
  const hash = new Map<string, T>()
  return [
    async (...arguments_: V) => {
      const key = JSON.stringify(arguments_)
      const value = hash.get(key)
      if (value) return value
      const newValue = await function_(...arguments_)
      hash.set(key, newValue)
      return newValue
    },
    (...arguments_: V) => hash.delete(JSON.stringify(arguments_)),
    hash,
  ] as const
}

/** Retry async function */
export async function retry<T>(
  function_: () => Promise<T>,
  retries = 5,
  interval: number | number[] = 0,
): Promise<T> {
  try {
    return await function_()
  }
  catch (error) {
    if (retries === 0) throw error
    await wait(
      typeof interval === 'number'
        ? interval
        : interval[interval.length - retries]!,
    )
    return retry(function_, retries - 1, interval)
  }
}

/** Create debounced function. Basically adds cooldown to function. Warning: throws! */
export function createDebouncedFunction<T, V extends unknown[]>(
  function_: (...arguments_: V) => T,
  time: number,
): (...arguments_: V) => T {
  let nextExec = 0
  return (...arguments_: V) => {
    const now = Date.now()
    if (nextExec > now) throw new Error('Debounced')
    nextExec = now + time
    return function_(...arguments_)
  }
}

/** Create throttled function. Basically limits function calls in time period. Warning: throws! */
export function createThrottledFunction<T, V extends unknown[]>(
  function_: (...arguments_: V) => T,
  calls: number,
  time: number,
): (...arguments_: V) => T {
  let nextClear = 0
  let amount = 0
  return (...arguments_: V) => {
    const now = Date.now()
    if (nextClear <= now) {
      nextClear = now + time
      amount = 0
    }
    if (amount === calls) throw new Error('Throttled')
    amount++
    return function_(...arguments_)
  }
}

/** Create debounced function. Basically create function that will be called with delay,
 * but if another call comes in, we reset the timer. */
export function createDelayedFunction<T, V extends unknown[]>(
  function_: (...arguments_: V) => T,
  time: number,
): (...arguments_: V) => Promise<T> {
  let timeout: ReturnType<typeof setTimeout>
  let activePromise: ImmediatePromise<T> | undefined
  return (...arguments_: V) => {
    activePromise ??= new ImmediatePromise()
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      activePromise?.resolve(function_(...arguments_))
      activePromise = undefined
    }, time)
    return activePromise
  }
}

/** Promise that accepts no callback, but exposes `resolve` and `reject` methods */
export class ImmediatePromise<T> extends Promise<T> {
  public resolve!: (value: T | PromiseLike<T>) => void
  public reject!: (reason?: unknown) => void

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(execute?: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
    if (execute)
      super(execute)
    else {
      let _resolve: (value: T | PromiseLike<T>) => void = noop
      let _reject: (reason?: unknown) => void = noop
      super((resolve, reject) => {
        _resolve = resolve
        _reject = reject
      })
      this.resolve = _resolve
      this.reject = _reject
    }
  }
}

/** Recursively resolves promises in objects and arrays */
export default async function deepPromiseAll<T>(
  input: T,
): Promise<AwaitedObject<T>> {
  if (input instanceof Promise) return deepPromiseAll(await input)
  if (Array.isArray(input))
    return Promise.all(
      input.map(item => deepPromiseAll(item)),
    ) as AwaitedObject<T>
  if (typeof input === 'object' && input !== null) {
    return Object.fromEntries(
      await Promise.all(
        Object.entries(input).map(async ([key, value]) => [
          key,
          await deepPromiseAll(value),
        ]),
      ),
    ) as AwaitedObject<T>
  }
  return input as AwaitedObject<T>
}

/** setTimeout promisify */
export const wait = (time: number) => new Promise(r => setTimeout(r, time))

/** Empty function that does nothing */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {}
