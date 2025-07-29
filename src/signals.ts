/**
 * Reactive signals
 */

import { ImmediatePromise } from './control'
import { AnyFunction } from './types'

let currentEffect: AnyFunction | undefined
const effectsMap = new WeakMap<AnyFunction, Set<Set<AnyFunction>>>()
let batchedEffects: Set<AnyFunction> | undefined

export type Signal<T> = (setTo?: T | ((previous: T) => T)) => T

/**
 * __SIGNALS SYSTEM__
 *
 * Signal can hold any data (except functions),
 * when this data has changed any effects containing
 * this signal will be rerun.
 *
 * ```ts
 * const $mySignal = signal<number|undefined>(1) // Create signal with initial value 1
 * $mySignal(5) // Set to 5
 * $mySignal(undefined) // Set to undefined
 * $mySignal(prev=>prev+1) // Increment
 * // Will print signal on change
 * effect(()=>{
 *   console.log($mySignal())
 * })
 * ```
 */
export function signal<T>(): Signal<T | undefined>
export function signal<T>(value: T): Signal<T>
export function signal<T>(value?: T): Signal<T | undefined> {
  const subscribers = new Set<AnyFunction>()
  return (...data) => {
    if (data.length === 1) {
      const argument = data[0]
      value =
        typeof argument === 'function'
          ? (argument as (previous: T | undefined) => T)(value)
          : argument
      if (batchedEffects)
        for (const subscriber of subscribers) batchedEffects.add(subscriber)
      else for (const subscriber of subscribers) subscriber()
    } else if (currentEffect) {
      subscribers.add(currentEffect)

      // This is for clear() of effects
      let effectSubscribers = effectsMap.get(currentEffect)
      if (!effectSubscribers) {
        effectSubscribers = new Set()
        effectsMap.set(currentEffect, effectSubscribers)
      }
      effectSubscribers.add(subscribers)
    }
    return value
  }
}

function clearEffect(handler: AnyFunction) {
  const signalSubscribers = effectsMap.get(handler)
  if (signalSubscribers)
    for (const subscribers of signalSubscribers) subscribers.delete(handler)
}

/**
 * __SIGNALS SYSTEM__
 *
 * Effects are simplest way to react to signal changes.
 * Returned data from handler function will be passed to it on next signal change.
 * Returns a function that will clear the effect.
 *
 *
 * // Will print signal on change
 * effect(()=>{
 *   console.log($mySignal())
 * })
 * // Use previous state as a reference
 * effect((last)=>{
 *   const mySignal = $mySignal()
 *   if(last>mySignal) console.log('Increment!')
 *   return mySignal;
 * })
 */
export function effect<T>(
  handler: (argument: T | undefined) => T,
  initialValue?: T,
): () => void {
  let lastValue: T | undefined = initialValue
  const wrappedHandler = () => {
    lastValue = handler(lastValue)
  }
  currentEffect = wrappedHandler
  wrappedHandler()
  currentEffect = undefined
  return () => {
    clearEffect(wrappedHandler)
  }
}

/**
 * __SIGNALS SYSTEM__
 *
 * Untrack helps to not react to changes in effects.
 * ```ts
 * const $a = signal(1)
 * const $b = signal(2)
 * // Will only run on changes to $b
 * effect(()=>{
 *   console.log(untrack($a)+$b())
 * })
 * ```
 */
export function untrack<T>(handler: () => T): T {
  const lastEffect = currentEffect
  currentEffect = undefined
  const data = handler()
  currentEffect = lastEffect
  return data
}

/**
 * __SIGNALS SYSTEM__
 *
 * Creates a derived reactive memoized signal.
 *
 * ```ts
 * // Sum of all changes of $a()
 * const { signal: $sumOfTwo, clear: clearSum } = derived((value) => value + $a(), 0)
 * ```
 */
export function derived<T>(handler: (argument: T | undefined) => T): {
  signal: Signal<T>
  clear: () => void
}
export function derived<T>(
  handler: (argument: T) => T,
  initialValue: T,
): {
  signal: Signal<T>
  clear: () => void
}
export function derived<T>(
  handler: (argument: T | undefined) => T,
  initialValue?: T,
): {
  signal: Signal<T>
  clear: () => void
} {
  const signal$ = signal(initialValue) as Signal<T>
  const wrappedHandler = () => signal$((value) => handler(value))
  currentEffect = wrappedHandler
  wrappedHandler()
  currentEffect = undefined
  return {
    signal: signal$,
    clear: () => {
      clearEffect(wrappedHandler)
    },
  }
}

/**
 * __SIGNALS SYSTEM__
 *
 * Batches multiple edits, so they don't call same effects multiple times
 *
 * ```ts
 * const $a = signal(1)
 * const $b = signal(2)
 * effect(()=>{
 *  console.log($a()+$b())
 * })
 * $a(2); // Prints 4
 * $b(3); // Prints 5
 * // Prints only 10
 * batch(()=>{
 *  $a(5);
 *  $b(5);
 * })
 * ```
 */
export function batch(handler: AnyFunction) {
  batchedEffects = new Set()
  handler()
  for (const effect of batchedEffects) effect()
  batchedEffects = undefined
}

/**
 * __SIGNALS SYSTEM__
 *
 * Returns ImmediatePromise that is resolved when check function returns truthy value.
 * If you want to, you can resolve or reject promise beforehand.
 *
 * ```ts
 * await when(() => $a()>5)
 * // With timeout
 * const promise = when(() => $a() > 5)
 * const timeout = setTimeout(() => promise.reject('Timeout')}, 5000)
 * primise.then(() => clearTimeout(timeout))
 * ```
 */
export function when(check: () => unknown) {
  const promise = new ImmediatePromise<undefined>()
  const clear = effect(() => {
    if (check()) promise.resolve()
  })
  void promise.finally(() => {
    clear()
  })
  return promise
}
