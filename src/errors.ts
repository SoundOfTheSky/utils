/**
 * Custom errors, finding errors and error handling.
 */

import { getPropertyNames } from './objects'

/**
 *  Use as intended error. Basically 4** errors in HTTP
 */
export class ValidationError extends Error {
  public override name = 'ValidationError'
}

/**
 *  Use as intended error. Basically 4** errors in HTTP
 */
export class TimeoutError extends Error {
  public override name = 'TimeoutError'
  public constructor() {
    super('The operation has timed out')
  }
}

export class DelayedError extends Error {
  public override name = 'DelayedError'
  public constructor() {
    super('The operation is delayed and can not be executed now')
  }
}

const defaultPriorityErrorKeys = [
  'message',
  'messages',
  'msg',
  'msgs',
  'text',
  'txt',
  'error',
  'errors',
  'err',
  'body',
  'payload',
  'e',
]

/**
 * Find error inside anything recursively.
 * Good for finding human-readable errors.
 * Tries priority keys first.
 * Parses JSON automatically.
 * Returns undefind if nothing found.
 */
export function findErrorText(
  error: unknown,
  priorityErrorKeys = defaultPriorityErrorKeys,
  stack = new Set(),
): string | undefined {
  if (!error || stack.has(error)) return
  stack.add(error)
  if (stack.size > 1000) throw new Error('Stack overflow')
  if (typeof error === 'string')
    return findErrorTextInString(error, priorityErrorKeys, stack)
  if (typeof error === 'object') {
    if (Symbol.iterator in error && !Array.isArray(error))
      return findErrorTextInObject(
        { obj: error, iteratorResult: [...(error as Iterable<unknown>)] },
        priorityErrorKeys,
        stack,
      )
    return findErrorTextInObject(error, priorityErrorKeys, stack)
  }
}

/** Find string that looks like a human-readable error using some simple heuristics */
function findErrorTextInString(
  error: string,
  priorityErrorKeys = defaultPriorityErrorKeys,
  stack = new Set(),
): string | undefined {
  try {
    return findErrorText(JSON.parse(error) as object, priorityErrorKeys, stack)
  } catch {
    if (error.length < 4 || error === '[object Object]') return
    return error
  }
}

function findErrorTextInObject(
  error: object,
  priorityErrorKeys = defaultPriorityErrorKeys,
  stack = new Set(),
): string | undefined {
  const keys = [...getPropertyNames(error)]
    .map((key) => {
      const value = error[key as keyof typeof error] as unknown
      let score = priorityErrorKeys.indexOf(key as string)
      if (score === -1)
        score =
          typeof value === 'string'
            ? priorityErrorKeys.length + value.length
            : Number.MAX_SAFE_INTEGER
      return [key, score] as const
    })
    .sort(([_, score], [_2, score2]) => score - score2)
    .map(([k]) => k)
  for (const key of keys) {
    const result = findErrorText(
      error[key as keyof typeof error],
      priorityErrorKeys,
      stack,
    )
    if (result) return result
  }
}
