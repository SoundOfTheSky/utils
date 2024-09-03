export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type JSONSerializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: JSONSerializable }
  | JSONSerializable[];
