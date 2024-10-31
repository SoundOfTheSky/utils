/**
 * Damn, I **love** TypeScript.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Make keys in object optional */
export type Optional<T, K extends keyof any> = Omit<T, K & keyof T> &
  Partial<Pick<T, K & keyof T>>;

/** Anything that can be serialized to JSON */
export type JSONSerializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: JSONSerializable }
  | JSONSerializable[];

/** Adds prefix to all keys in object */
export type ObjectAddPrefix<T, P extends string> = {
  [K in keyof T as `${P}${string & K}`]: T[K];
};

/** Convert type of thisCase to this_case */
export type CamelToSnakeCase<S extends string> =
  S extends `${infer T}${infer U}`
    ? U extends Uncapitalize<U>
      ? `${Lowercase<T>}${CamelToSnakeCase<U>}`
      : `${Lowercase<T>}_${CamelToSnakeCase<Uncapitalize<U>>}`
    : S;

/** Convert object keys of thisCase to this_case */
export type ObjectCamelToSnakeCase<T> = {
  [K in keyof T as CamelToSnakeCase<string & K>]: T[K];
};

/** Convert type of this-case to thisCase */
export type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S;

/** Convert object keys of this-case to thisCase */
export type ObjectSnakeToCamel<T> = {
  [K in keyof T as SnakeToCamel<string & K>]: T[K];
};

/** Concat types of array or objects */
export type Concat<T, U> = T extends any[]
  ? U extends any[]
    ? [...T, ...U]
    : never
  : T & U;
