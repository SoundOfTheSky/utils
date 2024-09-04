/** Make keys in object optional */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
/** Anything that can be serialized to JSON */
export type JSONSerializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: JSONSerializable }
  | JSONSerializable[];
