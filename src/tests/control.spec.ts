// eslint-disable-next-line import-x/no-unresolved
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import deepPromiseAll, {
  ImmediatePromise,
  SimpleEventSource,
  UUID,
  concurrentRun,
  createCashedAsyncFunction,
  createCashedFunction,
  createDebouncedFunction,
  createDelayedFunction,
  createThrottledFunction,
  extractUUIDDate,
  noop,
  retry,
  wait,
} from '../control'

describe('UUID', () => {
  it('generates unique IDs', () => {
    const exists = new Set<string>()
    for (let index = 0; index < 1_000_000; index++) {
      const uuid = UUID()
      if (exists.has(uuid)) {
        console.error(uuid)
        continue
      }
      exists.add(uuid)
    }
    expect(exists.size).toBe(1_000_000)
  })
  it('extracts date', async () => {
    const now1 = Date.now()
    const uuid1 = UUID()
    await wait(500)
    const uuid2 = UUID()
    expect(extractUUIDDate(uuid1).getTime()).toBeWithin(now1 - 10, now1 + 10)
    expect(extractUUIDDate(uuid2).getTime()).toBeWithin(now1 + 490, now1 + 510)
  })
})

describe('createCashedFunction', () => {
  it('caches function results', () => {
    const function_ = (x: number) => x * 2
    const [cachedFunction] = createCashedFunction(function_)
    expect(cachedFunction(2)).toBe(4)
    expect(cachedFunction(2)).toBe(4)
  })
})

describe('createCashedAsyncFunction', () => {
  it('caches async function results', async () => {
    let calls = 0
    const function_ = (x: number) => {
      calls++
      return Promise.resolve(x * 2)
    }
    const [cachedFunction] = createCashedAsyncFunction(function_)
    expect(await cachedFunction(2)).toBe(4)
    expect(await cachedFunction(10)).toBe(20)
    expect(await cachedFunction(2)).toBe(4)
    expect(calls).toBe(2)
  })
})

describe('retry', () => {
  it('retries failing function and eventually succeeds', () => {
    let attempts = 0
    const function_ = () => {
      attempts++
      if (attempts < 3) throw new Error('Fail')
      return Promise.resolve('Success')
    }
    expect(retry(function_, 5)).resolves.toBe('Success')
  })
})

describe('createDebouncedFunction', () => {
  it('prevents frequent calls within debounce time', async () => {
    const function_ = () => 'Called'
    const debouncedFunction = createDebouncedFunction(function_, 100)
    expect(debouncedFunction).not.toThrow()
    expect(debouncedFunction).toThrow('Debounced')
    await wait(100)
    expect(debouncedFunction).not.toThrow()
    expect(debouncedFunction).toThrow('Debounced')
  })
})

describe('createThrottledFunction', () => {
  it('limits function calls within time window', async () => {
    const function_ = () => 'Called'
    const throttledFunction = createThrottledFunction(function_, 2, 100)
    expect(throttledFunction).not.toThrow()
    expect(throttledFunction).not.toThrow()
    expect(throttledFunction).toThrow('Throttled')
    await wait(50)
    expect(throttledFunction).toThrow('Throttled')
    await wait(50)
    expect(throttledFunction).not.toThrow()
    expect(throttledFunction).not.toThrow()
    expect(throttledFunction).toThrow('Throttled')
  })
})

describe('createDelayedFunction', () => {
  let function_ = mock(() => 'Called')
  let throttledFunction = createDelayedFunction(function_, 100)
  beforeEach(() => {
    function_ = mock(() => 'Called')
    throttledFunction = createDelayedFunction(function_, 100)
  })
  it('delays function call', async () => {
    void throttledFunction()
    expect(function_).not.toBeCalled()
    await wait(100)
    expect(function_).toBeCalled()
  })
  it('do not call multiple times', async () => {
    void throttledFunction()
    void throttledFunction()
    await wait(100)
    expect(function_).toBeCalledTimes(1)
  })
  it('promise is correct', async () => {
    await Promise.all([
      throttledFunction(),
      throttledFunction(),
      throttledFunction(),
    ])
    expect(function_).toBeCalledTimes(1)
  })
})

describe('ImmediatePromise', () => {
  it('resolves manually', () => {
    const promise = new ImmediatePromise<number>()
    setTimeout(() => {
      promise.resolve(42)
    }, 10)
    expect(promise).resolves.toBe(42)
  })

  it('rejects manually', () => {
    const promise = new ImmediatePromise<number>()
    setTimeout(() => {
      promise.reject(new Error('Test error'))
    }, 10)
    expect(promise).rejects.toThrow('Test error')
  })

  it('behaves like a regular promise', () => {
    const promise = new ImmediatePromise<number>((resolve) => {
      resolve(100)
    })
    expect(promise).resolves.toBe(100)
  })
})

describe('deepPromiseAll', () => {
  it('resolves a simple promise', async () => {
    const input = Promise.resolve(42)
    const result = await deepPromiseAll(input)
    expect(result).toBe(42)
  })

  it('resolves an array of promises', async () => {
    const input = [Promise.resolve(1), 2, Promise.resolve(3)]
    const result = await deepPromiseAll(input)
    expect(result).toEqual([1, 2, 3])
  })

  it('resolves an object with nested promises', async () => {
    const input = {
      a: Promise.resolve(1),
      b: {
        c: Promise.resolve('abc'),
        d: 3,
      },
    }
    const result = await deepPromiseAll(input)
    expect(result).toEqual({ a: 1, b: { c: 'abc', d: 3 } })
  })

  it('handles already resolved values', async () => {
    const input = { a: 1, b: [2, 3, 4] }
    const result = await deepPromiseAll(input)
    expect(result).toEqual(input)
  })
})

describe('wait', () => {
  it('delays execution for given time', async () => {
    const start = performance.now()
    await wait(100)
    expect(performance.now() - start).toBeWithin(100, 110)
  })
})

// Best test
describe('noop', () => {
  it('does nothing', () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(noop()).toBeUndefined()
  })
})

describe('concurrentRun', () => {
  it('runs tasks concurrently with the given limit', async () => {
    const startTime = performance.now()
    const startTimes: number[] = []
    const delays = [100, 50, 150, 50, 10] // Different delays to test concurrency
    const results = await concurrentRun(
      delays.map(
        (delay, index) => () =>
          new Promise<number>((resolve) => {
            startTimes.push(Date.now())
            setTimeout(() => {
              resolve(index)
            }, delay)
          }),
      ),
      2,
    )
    expect(results).toEqual([0, 1, 2, 3, 4]) // Check if results match the order of tasks
    expect(startTimes.length).toBe(delays.length)
    // Check that concurrency never stops for max performance
    expect(performance.now() - startTime).toBeWithin(200, 220)
  })

  it('handles empty task array', async () => {
    const results = await concurrentRun([])
    expect(results).toEqual([])
  })

  it('properly propagates errors', () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.reject(new Error('Test error')),
      () => Promise.resolve(3),
    ]
    expect(concurrentRun(tasks)).rejects.toThrow('Test error')
  })

  it('runs tasks up to the specified concurrency level', async () => {
    let running = 0
    let maxRunning = 0
    const tasks = Array.from({ length: 5 }, () => async () => {
      running++
      maxRunning = Math.max(maxRunning, running)
      await new Promise((r) => setTimeout(r, 50))
      running--
      return running
    })
    await concurrentRun(tasks, 2)
    expect(maxRunning).toBeLessThanOrEqual(2) // Ensure concurrency limit is respected
  })
})

type Events = {
  message: string
  count: number
}

describe('SimpleEventSource', () => {
  let source = new SimpleEventSource<Events>()
  let h1 = mock(noop)
  let h2 = mock(noop)
  let h3 = mock(noop)
  let ch1 = source.on('count', h1)
  source.on('count', h2)
  source.on('message', h3)
  beforeEach(() => {
    source = new SimpleEventSource<Events>()
    h1 = mock(noop)
    h2 = mock(noop)
    h3 = mock(noop)
    ch1 = source.on('count', h1)
    source.on('count', h2)
    source.on('message', h3)
  })
  it('should support multiple handlers for the same event', () => {
    source.send('count', 5)

    expect(h1).toHaveBeenCalledWith(5)
    expect(h1).toHaveBeenCalledTimes(1)
    expect(h2).toHaveBeenCalledWith(5)
    expect(h2).toHaveBeenCalledTimes(1)
  })
  it('should unsubscribe on callback', () => {
    source.send('count', 5)
    ch1()
    source.send('count', 10)
    expect(h1).toHaveBeenCalledWith(5)
    expect(h1).toHaveBeenCalledTimes(1)
    expect(h2).toHaveBeenCalledWith(10)
    expect(h2).toHaveBeenCalledTimes(2)
  })
  it('should diffirentiate events', () => {
    source.send('message', 'a')
    expect(h1).not.toHaveBeenCalled()
    expect(h2).not.toHaveBeenCalled()
    expect(h3).toHaveBeenCalledWith('a')
    expect(h3).toHaveBeenCalledTimes(1)
  })
  it('should unsubscribe with off', () => {
    source.send('count', 5)
    source.off('count', h1)
    source.send('count', 10)
    expect(h1).toHaveBeenCalledWith(5)
    expect(h1).toHaveBeenCalledTimes(1)
    expect(h2).toHaveBeenCalledWith(10)
    expect(h2).toHaveBeenCalledTimes(2)
  })
})
