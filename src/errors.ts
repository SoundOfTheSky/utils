/**
 * Custom errors, finding errors and error handling.
 */

import { getPropertyNames } from './objects';

/**
 *  Use as intended error. Basically 4** errors in HTTP
 */
export class ValidationError extends Error {
  public override name = 'ValidationError';
}

const defaultPriorityErrorKeys = ['message', 'messages', 'msg', 'msgs', 'text', 'txt', 'error', 'errors', 'err', 'e'];

/**
 * Find error inside anything recursively.
 * Good for finding human-readable errors.
 * Tries priority keys first.
 * Parses JSON automatically.
 * Returns undefind if nothing found.
 */
export function findErrorText(
  e: unknown,
  priorityErrorKeys = defaultPriorityErrorKeys,
  stack = new Set(),
): string | undefined {
  if (!e || stack.has(e)) return;
  stack.add(e);
  if (stack.size > 1000) throw new Error('Stack overflow');
  if (typeof e === 'string') return findErrorTextInString(e, priorityErrorKeys, stack);
  if (typeof e === 'object') {
    if (Symbol.iterator in e && !Array.isArray(e))
      return findErrorTextInObject({ obj: e, iteratorResult: [...(e as Iterable<unknown>)] }, priorityErrorKeys, stack);
    return findErrorTextInObject(e, priorityErrorKeys, stack);
  }
}

/** Find string that looks like a human-readable error using some simple heuristics */
function findErrorTextInString(
  e: string,
  priorityErrorKeys = defaultPriorityErrorKeys,
  stack = new Set(),
): string | undefined {
  try {
    return findErrorText(JSON.parse(e), priorityErrorKeys, stack);
  } catch {
    if (e.length < 4 || e === '[object Object]') return;
    return e;
  }
}

function findErrorTextInObject(
  e: object,
  priorityErrorKeys = defaultPriorityErrorKeys,
  stack = new Set(),
): string | undefined {
  const keys = ([...getPropertyNames(e)] as (keyof typeof e)[])
    .map((key) => {
      let score = priorityErrorKeys.indexOf(key);
      if (score === -1) {
        if (!Number.isNaN(key)) score = priorityErrorKeys.length;
        else if (typeof e[key] !== 'function') score = Number.MAX_SAFE_INTEGER;
        else score = Number.MAX_SAFE_INTEGER - 1;
      }
      return [key, score] as const;
    })
    .sort(([_, v], [_k, v2]) => v - v2)
    .map(([k]) => k);
  for (const key of keys) {
    const result = findErrorText(e[key], priorityErrorKeys, stack);
    if (result) return result;
  }
}
