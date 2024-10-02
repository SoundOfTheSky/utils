import { ObjectAddPrefix } from './types';

/** Get all prorerty names, including in prototype */
export function getPropertyNames(e: object) {
  const keys = Object.getOwnPropertyNames(e);
  const proto = Object.getPrototypeOf(e) as object;
  if (proto) keys.push(...getPropertyNames(proto));
  return keys;
}

/** Map function like for arrays, but for objects */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const objectMap = <T>(object: object, fn: (key: string, val: T) => [string, any]) =>
  Object.fromEntries(Object.entries(object).map(([key, val]) => fn(key, val as T)));

/** Filter function like for arrays, but for objects */
export const objectFilter = <T>(object: object, fn: (key: string, val: T) => unknown) =>
  Object.fromEntries(Object.entries(object).filter(([key, val]) => fn(key, val as T)));

/** Adds prefix to every key in object */
export function addPrefixToObject<T extends Record<string, unknown>, P extends string>(
  obj: Record<string, T>,
  prefix: P,
): ObjectAddPrefix<T, P> {
  const n: Record<string, unknown> = {};
  for (const key in obj) n[prefix + key] = obj[key];
  return n as ObjectAddPrefix<T, P>;
}
