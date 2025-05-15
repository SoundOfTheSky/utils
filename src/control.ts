/**
 * Utils related to code execution flow.
 */

import { AwaitedObject, JSONSerializable } from './types'

let stringIdInc = 0
let _uuid = Date.now() * 1000
/** Get unique number id */
export const generateNumberId = () => _uuid++

const SESSION_ID = ((Math.random() * 2_147_483_648) | 0).toString(16)

/**
 * Get universally unique string id.
 * You can get information then id was generated using extractUUIDDate(uuid)
 */
export function UUID() {
  if (stringIdInc === 46_655) stringIdInc = 0
  else stringIdInc++
  return `${Date.now().toString(36).padStart(11, '0')}${(++stringIdInc).toString(36).padStart(3, '0')}${SESSION_ID}`
}

/** Extract exact date of uuid generation */
export function extractUUIDDate(uuid: string) {
  return new Date(Number.parseInt(uuid.slice(0, 11), 36))
}

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
  ignore?: (error: unknown) => boolean,
): Promise<T> {
  try {
    return await function_()
  } catch (error) {
    if (retries === 0 || ignore?.(error)) throw error
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

type ResolveFunction<T> = undefined extends T
  ? (value?: T | PromiseLike<T>) => void
  : (value: T | PromiseLike<T>) => void
/** Promise that accepts no callback, but exposes `resolve` and `reject` methods */
export class ImmediatePromise<T> extends Promise<T> {
  public resolve!: ResolveFunction<T>
  public reject!: (reason?: unknown) => void

  public constructor(
    execute?: (
      resolve: ResolveFunction<T>,
      reject: (reason?: any) => void,
    ) => void,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (execute) super(execute as any)
    else {
      let _resolve: ResolveFunction<T> = noop
      let _reject: (reason?: unknown) => void = noop
      super((resolve, reject) => {
        _resolve = resolve as ResolveFunction<T>
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
      input.map((item) => deepPromiseAll(item)),
    ) as AwaitedObject<T>
  if (typeof input === 'object' && input !== null) {
    return Object.fromEntries(
      await Promise.all(
        Object.entries(input).map(
          async ([key, value]) =>
            [key, await deepPromiseAll(value)] as [string, unknown][],
        ),
      ),
    ) as AwaitedObject<T>
  }
  return input as AwaitedObject<T>
}

/** setTimeout promisify */
export function wait(time: number) {
  return new Promise((r) => setTimeout(r, time))
}

/** Empty function that does nothing */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

/** Run array of async tasks concurrently */
export async function concurrentRun<T>(
  tasks: (() => Promise<T>)[],
  concurrency = 4,
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results = new Array(tasks.length) as T[]
    let inProgress = 0
    let index = 0
    let completed = 0

    function runNext() {
      if (completed === tasks.length) {
        resolve(results)
        return
      }

      while (inProgress < concurrency && index < tasks.length) {
        const currentIndex = index++
        const task = tasks[currentIndex]!
        inProgress++
        task()
          .then((result) => {
            results[currentIndex] = result
            inProgress--
            completed++
            runNext()
          })
          .catch(reject)
      }
    }

    runNext()
  })
}
