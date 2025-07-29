/**
 * Utils related to code execution flow.
 */

import { removeFromArray } from './arrays'
import { DelayedError, TimeoutError } from './errors'
import { AwaitedObject, JSONSerializable } from './types'

let lastIncId = Math.floor(Math.random() * 0x1_00_00)

/** Id generated only once per session */
export const SESSION_ID = Math.floor(Math.random() * 0x10_00_00_00_00_00_00)
  .toString(16)
  .padStart(13, '0')

/**
 * Get universally unique string id.
 * You can get information then id was generated using extractUUIDDate(uuid)
 * - 13 char - timestamp
 * - 13 char - SESSION_ID
 * - 4 char - incremental id
 *
 * 30 char total.
 *
 * USING CUSTOM TIMESTAMP MAY RESULT IN COLLISSIONS
 */
export function UUID(timestamp = Date.now()) {
  let inc = (++lastIncId).toString(16).padStart(4, '0')
  if (inc.length === 5) {
    lastIncId = 0
    inc = '0000'
  }
  return `${timestamp.toString(16).padStart(13, '0')}${inc}${SESSION_ID}`
}

/** Extract exact date of uuid generation */
export function extractUUIDDate(uuid: string) {
  return new Date(Number.parseInt(uuid.slice(0, 13), 16))
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
  run: (...data: V) => T,
) {
  const hash = new Map<string, T>()
  return [
    (...data: V) => {
      const key = JSON.stringify(data)
      const value = hash.get(key)
      if (value) return value
      const newValue = run(...data)
      hash.set(key, newValue)
      return newValue
    },
    (...data: V) => hash.delete(JSON.stringify(data)),
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
  run: (...data: V) => Promise<T>,
) {
  const hash = new Map<string, T>()
  return [
    async (...data: V) => {
      const key = JSON.stringify(data)
      const value = hash.get(key)
      if (value) return value
      const newValue = await run(...data)
      hash.set(key, newValue)
      return newValue
    },
    (...data: V) => hash.delete(JSON.stringify(data)),
    hash,
  ] as const
}

/** Retry async function */
export async function retry<T>(
  run: () => Promise<T>,
  retries = 5,
  interval: number | number[] = 0,
  ignore?: (error: unknown) => boolean,
): Promise<T> {
  try {
    return await run()
  } catch (error) {
    if (retries === 0 || ignore?.(error)) throw error
    await wait(
      typeof interval === 'number'
        ? interval
        : interval[interval.length - retries]!,
    )
    return retry(run, retries - 1, interval)
  }
}

/** Create debounced function. Basically adds cooldown to function. Warning: throws! */
export function createDebouncedFunction<T, V extends unknown[]>(
  run: (...data: V) => T,
  time: number,
): (...data: V) => T {
  let nextExec = 0
  return (...data: V) => {
    const now = Date.now()
    if (nextExec > now) throw new DelayedError()
    nextExec = now + time
    return run(...data)
  }
}

/** Create throttled function. Basically limits function calls in time period. Warning: throws! */
export function createThrottledFunction<T, V extends unknown[]>(
  run: (...data: V) => T,
  calls: number,
  time: number,
): (...data: V) => T {
  let nextClear = 0
  let amount = 0
  return (...data: V) => {
    const now = Date.now()
    if (nextClear <= now) {
      nextClear = now + time
      amount = 0
    }
    if (amount === calls) throw new DelayedError()
    amount++
    return run(...data)
  }
}

/** Create debounced function. Basically create function that will be called with delay,
 * but if another call comes in, we reset the timer (previous function isn't called). */
export function createDelayedFunction<T, V extends unknown[]>(
  run: (...data: V) => T,
  time: number,
): (...data: V) => Promise<T> {
  let timeout: ReturnType<typeof setTimeout>
  let activePromise: ImmediatePromise<T> | undefined
  return (...data: V) => {
    activePromise ??= new ImmediatePromise()
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      activePromise?.resolve(run(...data))
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

/** Reject after specified time */
export function timeout(time: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => {
      reject(new TimeoutError())
    }, time),
  )
}

/** Empty function that does nothing */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

/** Run array of async tasks concurrently */
export async function concurrentRun<T>(
  tasks: (() => Promise<T>)[],
  concurrency = 4,
): Promise<T[]> {
  const semaphore = new Semaphore(concurrency)
  return Promise.all(tasks.map(semaphore.run.bind(semaphore)))
}

/** Create simple event source. Consider using `signal()` for reactive state managment. */
export class SimpleEventSource<EVENTS extends Record<string, unknown>> {
  protected handlers = new Map<
    keyof EVENTS,
    ((data: EVENTS[keyof EVENTS]) => unknown)[]
  >()

  /** Send event to all subscribers */
  public send<T extends keyof EVENTS>(name: T, data: EVENTS[T]): unknown[] {
    return this.handlers.get(name)?.map((handler) => handler(data)) ?? []
  }

  /** Subscribe. Returns function to unsubscribe. */
  public on<T extends keyof EVENTS>(
    name: T,
    handler: (data: EVENTS[T]) => unknown,
  ) {
    let handlers = this.handlers.get(name)
    if (!handlers) {
      handlers = []
      this.handlers.set(name, handlers)
    }
    handlers.push(handler as (data: EVENTS[keyof EVENTS]) => unknown)
    return () => {
      removeFromArray(handlers, handler)
      if (handlers.length === 0) this.handlers.delete(name)
    }
  }

  /** Unsubscribe. Alternatively use return function of `on()` */
  public off<T extends keyof EVENTS>(
    name: T,
    handler: (data: EVENTS[T]) => unknown,
  ) {
    const handlers = this.handlers.get(name)
    if (!handlers) return
    removeFromArray(handlers, handler)
    if (handlers.length === 0) this.handlers.delete(name)
  }

  /** Use this to hide send function */
  public get source() {
    return {
      on: this.on.bind(this),
      off: this.off.bind(this),
    }
  }
}

/**
 * Semaphore is used to limit concurrent tasks by delaying promise.
 *
 * ```ts
 * const semaphore = new Semaphore(2);
 *
 * async function task() {
 *   await semaphore.acquire();
 *   try {
 *     // This code can only be executed by two tasks at the same time
 *   } finally {
 *     semaphore.release();
 *   }
 * }
 * task();
 * task();
 * task(); // This task will wait until one of the previous tasks releases the semaphore.
 *
 * // === SHORTHAND ===
 * semaphore.run(()=>{
 *    // Your code
 * })
 * semaphore.run(()=>{
 *    // Your code
 * })
 * // ...
 * ```
 */
export class Semaphore {
  /** Tasks running. */
  public running = 0
  protected deferredTasks: (() => void)[] = []

  public constructor(
    /** The maximum number of concurrent operations allowed.*/
    public capacity: number,
  ) {}

  /** Acquires a semaphore, blocking if necessary until one is available. */
  public async acquire(): Promise<void> {
    if (this.running === this.capacity)
      return new Promise<void>((resolve) => {
        this.deferredTasks.push(resolve)
      })
    this.running++
  }

  /** Releases a semaphore, allowing one more operation to proceed. */
  public release(): void {
    this.running--
    this.deferredTasks.shift()?.()
  }

  /** Shorthand for running functions */
  public async run<T>(run: () => T): Promise<T> {
    await this.acquire()
    try {
      return await run()
    } finally {
      this.release()
    }
  }
}

/** Add timeout to a promise */
export async function withTimeout<T>(
  run: () => Promise<T>,
  ms: number,
): Promise<T> {
  return Promise.race([run(), timeout(ms)])
}
