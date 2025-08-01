/**
 * [object Object]
 */

import { AnyFunction, Constructor, ObjectAddPrefix } from './types'

/** Get all prorerty names, including in prototype */
export function getPropertyNames(object: object, keys = new Set()) {
  const own = Object.getOwnPropertyNames(object)
  for (let index = 0; index < own.length; index++) keys.add(own[index])
  const proto = Object.getPrototypeOf(object) as object | undefined
  if (proto) getPropertyNames(proto, keys)
  return keys
}

/** Map function like for arrays, but for objects */
export function objectMap<T extends object>(
  object: T,
  run: (key: keyof T, value: T[keyof T]) => [string, unknown],
) {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) =>
      run(key as keyof T, value as T[keyof T]),
    ),
  )
}

/** Filter function like for arrays, but for objects */
export function objectFilter<T extends object>(
  object: T,
  run: (key: keyof T, value: T[keyof T]) => unknown,
) {
  return Object.fromEntries(
    Object.entries(object).filter(([key, value]) =>
      run(key as keyof T, value as T[keyof T]),
    ),
  )
}

/** Adds prefix to every key in object */
export function addPrefixToObject<
  T extends Record<string, unknown>,
  P extends string,
>(object: T, prefix: P): ObjectAddPrefix<T, P> {
  const n: Record<string, unknown> = {}
  for (const key in object) n[prefix + key] = object[key]
  return n as ObjectAddPrefix<T, P>
}

/** Check if objects are deep equal
 *
 * **Supports:**
 * - All primitives (String, Number, BigNumber, Null, undefined, Symbol)
 * - Objects
 * - Iterables (Arrays, Map, Sets, Queries, Generators etc.)
 * - Dates
 *
 * **Not supported:**
 * - Functions
 * - Async iterables
 * - Promises
 * - etc
 *
 * Behavior with types above are not defined, but
 * it will still check them by reference.
 */
export function deepEquals(
  a: unknown,
  b: unknown,
  stack = new WeakSet(),
): boolean {
  // Primitives
  if (a === b) return true
  if (
    typeof a !== typeof b ||
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  )
    return false
  // Assume that already checked objects are equal
  if (stack.has(a) || stack.has(b)) return true
  stack.add(a)
  stack.add(b)
  // Arrays
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false
    for (let index = 0; index < a.length; index++)
      if (!deepEquals(a[index], b[index], stack)) return false
    return true
  }
  if (Array.isArray(b)) return false
  // Dates
  if (a instanceof Date) return b instanceof Date && a.getTime() === b.getTime()
  if (b instanceof Date) return false
  // Sets and maps (must be sorted)
  if (a instanceof Set || a instanceof Map) {
    return (
      (b instanceof Set || b instanceof Map) &&
      deepEquals(
        [...(a as Iterable<unknown>)].sort(),
        [...(b as Iterable<unknown>)].sort(),
        stack,
      )
    )
  }
  if (b instanceof Set || b instanceof Map) return false
  // All iterabels
  if (Symbol.iterator in a)
    return (
      Symbol.iterator in b &&
      deepEquals(
        [...(a as Iterable<unknown>)],
        [...(b as Iterable<unknown>)],
        stack,
      )
    )
  if (Symbol.iterator in b) return false
  // Other objects
  const aKeys = getPropertyNames(a)
  const bKeys = getPropertyNames(b)
  if (aKeys.size !== bKeys.size) return false
  for (const property of getPropertyNames(a))
    if (
      !bKeys.has(property) ||
      !deepEquals(
        a[property as keyof typeof a],
        b[property as keyof typeof b],
        stack,
      )
    )
      return false
  return true
}

/** Pick keys from object */
export function pick<T extends object, K extends keyof T>(
  object: T,
  keys: K[],
): Pick<T, K> {
  const newObject: Partial<T> = {}
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]!
    newObject[key] = object[key]
  }
  return newObject as Pick<T, K>
}

/**
 * Base class that helps to manage ids and subclasses.
 *
 * Include next lines when extending this class:
 * ```js
 * static {
 *   this.registerSubclass()
 * }
 * ```
 */
export class Base {
  /** Id of last AUTOMATICALLY created object id */
  public static lastId = 0
  /** Map of class instances by they ids */
  public static idMap = new Map<number, Base>()
  /** Map of subclasses of base class by their name */
  public static subclasses = new Map<string, Constructor<Base>>()

  /** Functions in this array will be run on instance destroy */
  public runOnDestroy: AnyFunction[] = []

  private _id: number
  public get id() {
    return this._id
  }
  public set id(value) {
    Base.idMap.delete(this._id)
    Base.idMap.set(value, this)
    this._id = value
  }

  public constructor(id = ++Base.lastId) {
    this._id = id
    Base.idMap.set(id, this)
  }

  /**
   * Include next lines when extending this class:
   * ```js
   * static {
   *   this.registerSubclass()
   * }
   * ```
   */
  public static registerSubclass() {
    Base.subclasses.set(this.name, this)
  }

  /**
   * Destroy instance. Will run all `runOnDestroy` functions
   * and remove istance from idMap.
   * If class is garbage collected automatically runs this.
   * */
  public destroy() {
    Base.idMap.delete(this._id)
    for (let index = 0; index < this.runOnDestroy.length; index++)
      this.runOnDestroy[index]!()
  }

  /**
   * Register autocleared event handler.
   * If using classes methods don't forget to `bind(this)`
   */
  protected registerEvent(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options: AddEventListenerOptions = {},
  ): void {
    options.passive ??= true
    target.addEventListener(type, listener, options)
    this.runOnDestroy.push(() => {
      target.removeEventListener(type, listener)
    })
  }
}
