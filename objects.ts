/** Get all prorerty names, including in prototype */
export function getPropertyNames(e: object) {
  const keys = Object.getOwnPropertyNames(e);
  const proto = Object.getPrototypeOf(e) as object;
  if (proto) keys.push(...getPropertyNames(proto));
  return keys;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const objectMap = <T>(object: object, fn: (key: string, val: T) => [string, any]) =>
  Object.fromEntries(Object.entries(object).map(([key, val]) => fn(key, val as T)));
