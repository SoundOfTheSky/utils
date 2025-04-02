// eslint-disable-next-line import-x/no-unresolved
import { describe, expect, it } from 'bun:test'

import { findErrorText, ValidationError } from '../errors'

describe('ValidationError', () => {
  it('Must create', () => {
    const error = new ValidationError('asdasd', {
      cause: 'test',
    })
    expect(error.name).toBe('ValidationError')
    expect(error.cause).toBe('test')
  })
})
describe('HandleErrorService', () => {
  const errorMessage = 'Correct error'

  it('Handle basic error', () => {
    expect(findErrorText(new Error(errorMessage))).toBe(errorMessage)
  })

  it('Find error in __proto__ of error', () => {
    class ActivationError extends Error {
      public constructor(message: string) {
        super(message)
        this.name = this.constructor.name
        Object.setPrototypeOf(this, new.target.prototype)
      }
    }
    class AddCardError extends ActivationError {}
    expect(findErrorText(new AddCardError(errorMessage))).toBe(errorMessage)
  })

  it('Skip strange errors', () => {
    expect(
      findErrorText([null, 0, 'a', 'bb', 'ccc', '[object Object]', 'dddd']),
    ).toBe('dddd')
  })

  it('Check priority keys first', () => {
    expect(
      findErrorText(
        {
          test: 'Wrong error',
          err: 'Priority but less',
          message: 'k',
          priority: '[object Object]',
          error: errorMessage,
        },
        ['priority', 'message', 'error', 'err'],
      ),
    ).toBe(errorMessage)
  })

  it('Find error in JSON', () => {
    expect(
      findErrorText(
        JSON.stringify({
          error: errorMessage,
        }),
      ),
    ).toBe(errorMessage)
  })

  it('Handle recursive links', () => {
    const error: { p: string; message?: unknown } = {
      p: errorMessage,
    }
    error.message = error
    expect(findErrorText(error)).toBe(errorMessage)
  })

  it('If nothing found do nothing', () => {
    expect<string | undefined>(findErrorText([0, 1, 2, 3])).toBeUndefined()
  })

  it('Find in set', () => {
    expect(
      findErrorText(
        new Set([null, 0, 'a', 'bb', 'ccc', '[object Object]', 'dddd']),
      ),
    ).toBe('dddd')
  })

  it('Find in map', () => {
    expect(
      findErrorText(
        new Map<string, any>(
          Object.entries({
            a: null,
            b: 0,
            c: 'a',
            d: 'bb',
            e: 'ccc',
            f: '[object Object]',
            g: 'dddd',
          }),
        ),
      ),
    ).toBe('dddd')
  })

  it('Real error test', () => {
    const error = new ValidationError(
      JSON.stringify({
        status: 400,
        error: {
          error: ['Addendum with this product already exists in this contract'],
        },
      }),
    )

    expect(findErrorText(error)).toBe(
      'Addendum with this product already exists in this contract',
    )
  })
})
