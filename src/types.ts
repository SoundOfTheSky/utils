/**
 * Damn, I **love** TypeScript.
 */

/** Values that are copied by value, not by reference */
export type Primitive =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | null
  | undefined

/** Function with any arguments or return type */
export type AnyFunction = (...arguments_: any[]) => any

/** Values that convert to false */
export type Falsy = false | '' | 0 | null | undefined

/** Make keys in object optional */
export type Optional<T, K extends keyof T> = Omit<T, K & keyof T> &
  Partial<Pick<T, K & keyof T>>

/** Make keys in object required */
export type RequiredKey<T, K extends keyof T> = Omit<T, K & keyof T> &
  Required<Pick<T, K & keyof T>>

/** Get contructor type of an instance */
export type Constructor<T> = new (..._arguments: any[]) => T

/** Recursively resolves promises in objects and arrays */
export type AwaitedObject<T> =
  T extends Promise<infer U>
    ? AwaitedObject<U>
    : T extends (infer U)[]
      ? AwaitedObject<U>[]
      : T extends object
        ? { [K in keyof T]: AwaitedObject<T[K]> }
        : T

/** Anything that can be serialized to JSON */
export type JSONSerializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: JSONSerializable }
  | JSONSerializable[]

/** Adds prefix to all keys in object */
export type ObjectAddPrefix<T, P extends string> = {
  [K in keyof T as `${P}${string & K}`]: T[K]
}

/** Convert type of thisCase to this_case */
export type CamelToSnakeCase<S extends string> =
  S extends `${infer T}${infer U}`
    ? U extends Uncapitalize<U>
      ? `${Lowercase<T>}${CamelToSnakeCase<U>}`
      : `${Lowercase<T>}_${CamelToSnakeCase<Uncapitalize<U>>}`
    : S

/** Convert object keys of thisCase to this_case */
export type ObjectCamelToSnakeCase<T> = {
  [K in keyof T as CamelToSnakeCase<string & K>]: T[K]
}

/** Convert type of this-case to thisCase */
export type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S

/** Convert object keys of this-case to thisCase */
export type ObjectSnakeToCamel<T> = {
  [K in keyof T as SnakeToCamel<string & K>]: T[K]
}

/** Concat types of array or objects */
export type Concat<T, U> = T extends any[]
  ? U extends any[]
    ? [...T, ...U]
    : never
  : T & U
