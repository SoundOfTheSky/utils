// eslint-disable-next-line import-x/no-unresolved
import { describe, expect, it, mock } from 'bun:test'

import { noop } from '../control'
import { batch, derived, effect, signal, untrack, when } from '../signals'

describe('signal', () => {
  it('should get and set primitive values', () => {
    const $count = signal(1)
    expect($count()).toBe(1)
    $count(5)
    expect($count()).toBe(5)
  })

  it('should update with a function', () => {
    const $count = signal(1)
    $count((previous) => previous + 1)
    expect($count()).toBe(2)
  })

  it('should support undefined as initial value', () => {
    const $value = signal<number>()
    expect($value()).toBeUndefined()
    $value(42)
    expect($value()).toBe(42)
  })
})

describe('effect', () => {
  it('should run effect on signal change', () => {
    const $name = signal('Alice')
    const function_ = mock(() => $name())
    effect(function_)
    expect(function_).toHaveBeenCalledTimes(1)
    $name('Bob')
    expect(function_).toHaveBeenCalledTimes(2)
  })

  it('should pass previous value to effect', () => {
    const $x = signal(1)
    const history: number[] = []
    effect<number>((previous) => {
      const next = $x()
      if (previous !== undefined) history.push(previous)
      return next
    })
    $x(2)
    $x(3)
    expect(history).toEqual([1, 2])
  })

  it('should stop reacting after cleanup', () => {
    const $a = signal(1)
    const function_ = mock(() => $a())
    const stop = effect(function_)
    $a(2)
    expect(function_).toHaveBeenCalledTimes(2)
    stop()
    $a(3)
    expect(function_).toHaveBeenCalledTimes(2) // no extra call
  })
})

describe('untrack', () => {
  it('should not track untracked signals in effects', () => {
    const $a = signal(1)
    const $b = signal(2)
    let sum = 0
    const function_ = mock(() => {
      sum = untrack($a) + $b()
    })
    effect(function_)
    expect(function_).toHaveBeenCalledTimes(1)
    expect(sum).toBe(3)
    $a(10)
    expect(function_).toHaveBeenCalledTimes(1) // $a is untracked
    expect(sum).toBe(3)
    $b(5)
    expect(function_).toHaveBeenCalledTimes(2)
    expect(sum).toBe(15)
  })
})

describe('derived', () => {
  it('should update when dependency changes', () => {
    const $a = signal(2)
    const { signal: $double } = derived(() => $a() * 2)
    expect($double()).toBe(4)
    $a(3)
    expect($double()).toBe(6)
  })

  it('should accumulate derived value over time', () => {
    const $a = signal(1)
    const { signal: $sum } = derived((previous) => previous + $a(), 0)
    expect($sum()).toBe(1)
    $a(2)
    expect($sum()).toBe(3)
    $a(3)
    expect($sum()).toBe(6)
  })

  it('should stop updating after calling clear', () => {
    const $a = signal(1)
    const $b = signal(2)
    const { signal: $sum, clear } = derived(() => $a() + $b())

    expect($sum()).toBe(3)
    $a(10)
    expect($sum()).toBe(12)
    $b(-10)
    expect($sum()).toBe(0)
    clear()
    $b(5)
    expect($sum()).toBe(0) // Should not change after clear
  })

  it('should memoize values and reuse previous', () => {
    const $a = signal(1)
    const $flag = signal(true)
    const spy = mock((previous: number) => previous + $a())
    const { signal: $count } = derived(spy, 0)
    expect($count()).toBe(1)
    $flag(false) // unrelated signal update
    expect($count()).toBe(1) // still 1
    expect(spy).toHaveBeenCalledTimes(1)
  })
})

describe('batch', () => {
  it('should call effect only once for multiple signal changes inside batch', () => {
    const $a = signal(1)
    const $b = signal(2)
    const spy = mock(() => {
      $a()
      $b()
    })
    effect(spy)
    expect(spy).toHaveBeenCalledTimes(1)
    $a(3)
    $b(4)
    expect(spy).toHaveBeenCalledTimes(3)
    batch(() => {
      $a(5)
      $b(6)
    })
    expect(spy).toHaveBeenCalledTimes(4)
  })

  it('should still work if signals are set outside batch', () => {
    const $x = signal(10)
    const spy = mock(() => $x())
    effect(spy)
    expect(spy).toHaveBeenCalledTimes(1)
    $x(20)
    expect(spy).toHaveBeenCalledTimes(2)
    batch(() => $x(30))
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('should preserve correct final signal values', () => {
    const $a = signal(1)
    const $b = signal(2)
    batch(() => {
      $a(10)
      $b(20)
    })
    expect($a()).toBe(10)
    expect($b()).toBe(20)
  })

  it('should not rerun effects if no signal changes in batch', () => {
    const $count = signal(5)
    const spy = mock(() => $count())
    effect(spy)
    expect(spy).toHaveBeenCalledTimes(1)
    batch(noop)
    expect(spy).toHaveBeenCalledTimes(1)
  })
})

describe('when', () => {
  it('resolves when the condition becomes true', async () => {
    const $value = signal(0)
    let resolved = false
    const p = when(() => $value() > 3).then(() => {
      resolved = true
    })
    expect(resolved).toBe(false)
    $value(1)
    await Promise.resolve()
    expect(resolved).toBe(false)
    $value(4)
    await p
    expect(resolved).toBe(true)
  })

  it('resolves immediately if the condition is already true', async () => {
    const $value = signal(10)
    let resolved = false
    await when(() => $value() > 5).then(() => {
      resolved = true
    })
    expect(resolved).toBe(true)
  })

  it('does not resolve if the condition never becomes true', async () => {
    const $value = signal(1)
    let resolved = false
    const p = when(() => $value() > 10).then(() => {
      resolved = true
    })
    await new Promise((r) => setTimeout(r, 50))
    expect(resolved).toBe(false)
    $value(15)
    await p
    expect(resolved).toBe(true)
  })
})
