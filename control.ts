/** Get unique id. Use like this: uuid++ */
// eslint-disable-next-line prefer-const
export let uuid = 1;
/**
 * Creates cached function. All arguments/results are cached.
 * Returns [
 *  fn [cached function],
 *  delete [delete cached result for arguments]
 *  hash
 * ]
 */
export function createCashedFunction<T, V extends unknown[]>(fn: (...args: V) => T) {
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
export function createCashedAsyncFunction<T, V extends unknown[]>(fn: (...args: V) => Promise<T>) {
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
export async function retry<T>(fn: () => Promise<T>, retries: number, interval: number | number[] = 0): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await wait(typeof interval === 'number' ? interval : interval[interval.length - retries]);
    return retry(fn, retries - 1, interval);
  }
}

/** setTimeout promisify */
export const wait = (time: number) => new Promise((r) => setTimeout(r, time));

/** Empty function that does nothing */
export const noop = () => {};
