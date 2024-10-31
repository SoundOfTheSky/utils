/**
 * Utils related to code execution flow.
 */

import { JSONSerializable } from './types';

let _uuid = Date.now() * 1000;
/** Get unique id */
export const UUID = () => _uuid++;

/**
 * Creates cached function. All arguments/results are cached.
 * Returns [
 *  fn [cached function],
 *  delete [delete cached result for arguments]
 *  hash
 * ]
 */
export function createCashedFunction<T, V extends JSONSerializable[]>(
  fn: (...args: V) => T,
) {
  const hash = new Map<string, T>();
  return [
    (...args: V) => {
      const key = JSON.stringify(args);
      const value = hash.get(key);
      if (value) return value;
      const newValue = fn(...args);
      hash.set(key, newValue);
      return newValue;
    },
    (...args: V) => hash.delete(JSON.stringify(args)),
    hash,
  ] as const;
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
  fn: (...args: V) => Promise<T>,
) {
  const hash = new Map<string, T>();
  return [
    async (...args: V) => {
      const key = JSON.stringify(args);
      const value = hash.get(key);
      if (value) return value;
      const newValue = await fn(...args);
      hash.set(key, newValue);
      return newValue;
    },
    (...args: V) => hash.delete(JSON.stringify(args)),
    hash,
  ] as const;
}

/** Retry async function */
export async function retry<T>(
  fn: () => Promise<T>,
  retries = 5,
  interval: number | number[] = 0,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await wait(
      typeof interval === 'number'
        ? interval
        : interval[interval.length - retries]!,
    );
    return retry(fn, retries - 1, interval);
  }
}

/** Create debounced function. Basically adds cooldown to function. Warning: throws! */
export function createDebouncedFunction<T, V extends unknown[]>(
  fn: (...args: V) => T,
  time: number,
): (...args: V) => T {
  let nextExec = 0;
  return (...args: V) => {
    const now = Date.now();
    if (nextExec > now) throw new Error('Debounced');
    nextExec = now + time;
    return fn(...args);
  };
}

/** Create throttled function. Basically limits function calls in time period. Warning: throws! */
export function createThrottledFunction<T, V extends unknown[]>(
  fn: (...args: V) => T,
  calls: number,
  time: number,
): (...args: V) => T {
  let nextClear = 0;
  let amount = 0;
  return (...args: V) => {
    const now = Date.now();
    if (nextClear <= now) {
      nextClear = now + time;
      amount = 0;
    }
    if (amount === calls) throw new Error('Throttled');
    amount++;
    return fn(...args);
  };
}

/** Create debounced function. Basically create function that will be called with delay,
 * but if another call comes in, we reset the timer. */
export function createDelayedFunction<T, V extends unknown[]>(
  fn: (...args: V) => T,
  time: number,
): (...args: V) => Promise<T> {
  let timeout: ReturnType<typeof setTimeout>;
  let activePromise: ImmediatePromise<T> | undefined;
  return (...args: V) => {
    activePromise ??= new ImmediatePromise();
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      activePromise?.resolve(fn(...args));
      activePromise = undefined;
    }, time);
    return activePromise;
  };
}

/** Promise that accepts no callback, but exposes `resolve` and `reject` methods */
export class ImmediatePromise<T> extends Promise<T> {
  public resolve!: (value: T | PromiseLike<T>) => void;
  public reject!: (reason?: unknown) => void;

  public constructor() {
    let resolve: (value: T | PromiseLike<T>) => void = noop;
    let reject: (reason?: unknown) => void = noop;
    super((r, j) => {
      resolve = r;
      reject = j;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
}

/** setTimeout promisify */
export const wait = (time: number) => new Promise((r) => setTimeout(r, time));

/** Empty function that does nothing */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};
