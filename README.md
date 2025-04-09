<div align="center">

# Sky utils
**JavaScript/TypeScript utilities**

[![Latest Stable Version](https://img.shields.io/npm/v/@softsky/utils.svg)](https://www.npmjs.com/package/@softsky/utils)
[![NPM Downloads](https://img.shields.io/npm/dm/@softsky/utils.svg)](https://www.npmjs.com/package/@softsky/utils)
[![NPM Downloads](https://img.shields.io/npm/dt/@softsky/utils.svg)](https://www.npmjs.com/package/@softsky/utils)
[![Bundlephobia Size](https://img.shields.io/bundlephobia/minzip/@softsky/utils.svg)](https://www.npmjs.com/package/@softsky/utils)

`npm i @softsky/utils`

Usual utils plus more obscure stuff that I've never seen in any library. 
Also fancy TypeScript generics and types that I often use.

Test coverage __100%__.
</div>

# Contribute
I don't know why would you want to, but here's how to:
1. Install Bun
2. Install dependencies `bun i` or `npm i`
3. Lint files `bun run lint`
4. Run tests `bun run test`
5. Update README `bun run gen-readme`
6. Create merge request

Don't forget to follow comment style for new exported features:
```ts
/** Description of how it works (REQUIRED) */
export function newStuff() {}
```

# Full feature list:

## Arrays
Everything array related.

${\textsf{\color{CornflowerBlue}function}}$ randomFromArray - Returns random element from non-empty array

---
${\textsf{\color{CornflowerBlue}function}}$ shuffleArray - Create new shuffled array

---
${\textsf{\color{CornflowerBlue}function}}$ swap - Swap two elements in array

---
${\textsf{\color{CornflowerBlue}function}}$ binarySearch - Binary search in sorted array.
Compare function should compare your needed value with value on index passed to it.
If compare returns 0 it means we found target.
If compare returns > 0 it means we have to cut out bigger side of array.
If compare returns < 0 it means we have to cut out smaller side of array.

---
${\textsf{\color{CornflowerBlue}function}}$ chunk - Split array into sub arrays of spicified size

---
${\textsf{\color{CornflowerBlue}function}}$ combinations - Return all combinations of items in array

---
${\textsf{\color{CornflowerBlue}function}}$ permutations - Return all permutations of items in array

---
${\textsf{\color{CornflowerBlue}function}}$ pushToSorted - Push data in array so array is always kept sorted

Compare must return true when found position to push in.
For example if we return `[false, false, true, false]`,
Array will become `[false, false, Element, true, false]`.

---


## Consts
Some useful consts. That's it.

${\textsf{\color{ForestGreen}const}}$ DAY_MS - Milliseconds in a full day

---
${\textsf{\color{ForestGreen}const}}$ HOUR_MS - Milliseconds in a hour

---
${\textsf{\color{ForestGreen}const}}$ MIN_MS - Milliseconds in a minute

---
${\textsf{\color{ForestGreen}const}}$ SEC_MS - Milliseconds in a second

---


## Control
Utils related to code execution flow.

${\textsf{\color{ForestGreen}const}}$ UUID - Get unique id

---
${\textsf{\color{CornflowerBlue}function}}$ createCashedFunction - Creates cached function. All arguments/results are cached.
Returns [
fn [cached function],
delete [delete cached result for arguments]
hash
]

---
${\textsf{\color{CornflowerBlue}function}}$ createCashedAsyncFunction - Creates cached function. All arguments/results are cached. Will store in cache resolved data.
Returns [
fn [cached function],
delete [delete cached result for arguments]
hash
]

---
${\textsf{\color{CornflowerBlue}async function}}$ retry - Retry async function

---
${\textsf{\color{CornflowerBlue}function}}$ createDebouncedFunction - Create debounced function. Basically adds cooldown to function. Warning: throws!

---
${\textsf{\color{CornflowerBlue}function}}$ createThrottledFunction - Create throttled function. Basically limits function calls in time period. Warning: throws!

---
${\textsf{\color{CornflowerBlue}function}}$ createDelayedFunction - Create debounced function. Basically create function that will be called with delay,
but if another call comes in, we reset the timer.

---
${\textsf{\color{Orange}class}}$ ImmediatePromise - Promise that accepts no callback, but exposes `resolve` and `reject` methods

---
${\textsf{\color{CornflowerBlue}function}}$ wait - setTimeout promisify

---
${\textsf{\color{CornflowerBlue}function}}$ noop - Empty function that does nothing

---
${\textsf{\color{CornflowerBlue}async function}}$ concurrentRun - Run array of async tasks concurrently

---


## Errors
Custom errors, finding errors and error handling.

${\textsf{\color{Orange}class}}$ ValidationError - Use as intended error. Basically 4** errors in HTTP

---
${\textsf{\color{CornflowerBlue}function}}$ findErrorText - Find error inside anything recursively.
Good for finding human-readable errors.
Tries priority keys first.
Parses JSON automatically.
Returns undefind if nothing found.

---


## Formatting
Anything related to formatting and logging.

${\textsf{\color{Magenta}type}}$ FormatTimeRange - Type for formatTime ranges

---
${\textsf{\color{ForestGreen}const}}$ FORMAT_NUMBER_RANGES - Default time range

---
${\textsf{\color{ForestGreen}const}}$ FORMAT_NUMBER_RANGES_READABLE - Time range more suitable for readability

---
${\textsf{\color{ForestGreen}const}}$ FORMAT_NUMBER_RANGES_BYTES - Bytes range

---
${\textsf{\color{CornflowerBlue}function}}$ formatNumber - Milliseconds to human readable time. Minimum accuracy, if set to 1000 will stop at seconds

---
${\textsf{\color{CornflowerBlue}function}}$ camelToSnakeCase - thisCase to this_case

---
${\textsf{\color{CornflowerBlue}function}}$ snakeToCamelCase - this_case to thisCase

---
${\textsf{\color{CornflowerBlue}function}}$ formatBytes - Bytes to KB,MB,GB,TB

---
${\textsf{\color{CornflowerBlue}function}}$ log - Format logging

---
${\textsf{\color{CornflowerBlue}function}}$ capitalizeFirstLetter - Capitalize first letter

---


## Numbers
Numbers, math, etc.

${\textsf{\color{CornflowerBlue}function}}$ random - Random number between min and max. May enable float

---
${\textsf{\color{CornflowerBlue}function}}$ parseInt - Same as Number.parseInt but throws if NaN or not safe

---
${\textsf{\color{CornflowerBlue}function}}$ parseFloat - Same as Number.parseFloat but throws if NaN or Infinity

---
${\textsf{\color{CornflowerBlue}function}}$ factorial - Factorial

---
${\textsf{\color{CornflowerBlue}function}}$ fib - Fibonacci

---


## Objects
[object Object]

${\textsf{\color{CornflowerBlue}function}}$ getPropertyNames - Get all prorerty names, including in prototype

---
${\textsf{\color{CornflowerBlue}function}}$ objectMap - Map function like for arrays, but for objects

---
${\textsf{\color{CornflowerBlue}function}}$ objectFilter - Filter function like for arrays, but for objects

---
${\textsf{\color{CornflowerBlue}function}}$ addPrefixToObject - Adds prefix to every key in object

---
${\textsf{\color{CornflowerBlue}function}}$ deepEquals - Check if objects are deep equal

**Supports:**
- All primitives (String, Number, BigNumber, Null, undefined, Symbol)
- Objects
- Iterables (Arrays, Map, Sets, Queries, Generators etc.)
- Dates

**Not supported:**
- Functions
- Async iterables
- Promises
- etc

Behavior with types above are not defined, but
it will still check them by reference.

---
${\textsf{\color{CornflowerBlue}function}}$ pick - Pick keys from object

---
${\textsf{\color{Orange}class}}$ Base - Base class that helps to manage ids and subclasses.

Include next lines when extending this class:
```js
static {
this.registerSubclass()
}
```

---


## Signals
Reactive signals

${\textsf{\color{CornflowerBlue}function}}$ signal - __SIGNALS SYSTEM__

Signal can hold any data (except functions),
when this data has changed any effects containing
this signal will be rerun.

```ts
const $mySignal = signal<number|undefined>(1) // Create signal with initial value 1
$mySignal(5) // Set to 5
$mySignal(undefined) // Set to undefined
$mySignal(prev=>prev+1) // Increment
// Will print signal on change
effect(()=>{
console.log($mySignal())
})
```

---
${\textsf{\color{CornflowerBlue}function}}$ effect - __SIGNALS SYSTEM__

Effects are simplest way to react to signal changes.
Returned data from handler function will be passed to it on next signal change.
Returns a function that will clear the effect.

```ts
// Will print signal on change
effect(()=>{
console.log($mySignal())
})
// Use previous state as a reference
effect((last)=>{
const mySignal = $mySignal()
if(last>mySignal) console.log('Increment!')
return mySignal;
})

---
${\textsf{\color{CornflowerBlue}function}}$ untrack - __SIGNALS SYSTEM__

Untrack helps to not react to changes in effects.
```ts
const $a = signal(1)
const $b = signal(2)
// Will only run on changes to $b
effect(()=>{
console.log(untrack($a)+$b())
})
```

---
${\textsf{\color{CornflowerBlue}function}}$ derived - __SIGNALS SYSTEM__

Creates a derived reactive memoized signal.

```ts
// Sum of all changes of $a()
const { signal: $sumOfTwo, clear: clearSum } = derived((value) => value + $a(), 0)
```

---
${\textsf{\color{CornflowerBlue}function}}$ batch - __SIGNALS SYSTEM__

Batches multiple edits, so they don't call same effects multiple times

```ts
const $a = signal(1)
const $b = signal(2)
effect(()=>{
console.log($a()+$b())
})
$a(2); // Prints 4
$b(3); // Prints 5
// Prints only 10
batch(()=>{
$a(5);
$b(5);
})
```

---
${\textsf{\color{CornflowerBlue}function}}$ when - __SIGNALS SYSTEM__

Returns promise that is resolved when check function returns truthy value
```ts
await when(()=>$a()>5)
```

---


## Time
Timers, CRON, etc.

${\textsf{\color{CornflowerBlue}function}}$ measurePerformance - Measure performance of a function

---
${\textsf{\color{CornflowerBlue}function}}$ cronInterval - Like setInterval but with cron.
Returns clear function.
For cron string syntax check __getNextCron()__ description

---
${\textsf{\color{CornflowerBlue}function}}$ getNextCron - Find next cron date after passed date.

This function __DOES NOT__ implement regular CRON 1 to 1.

Main differences:
- Weekdays value only 0 to 6 (0 is Sunday)
- New supported syntax: __30-60/10__ - means __30,40,50,60__
- Second and millisecond support: __* * * * * 30 999__ - executes every 30 seconds at the end of a second

---
${\textsf{\color{Orange}class}}$ SpeedCalculator - Object that calculates speed, ETA and percent of any measurable task.

`push()` chunks into speed calculator and then read `stats` for results.
`size` - a target then task is finished. Without it only speed is calculated.
`historyTime` - is a time period based on which speed will be calculated.

---


## Types
Damn, I **love** TypeScript.

${\textsf{\color{Magenta}type}}$ Primitive - Values that are copied by value, not by reference

---
${\textsf{\color{Magenta}type}}$ AnyFunction - Function with any arguments or return type

---
${\textsf{\color{Magenta}type}}$ Falsy - Values that convert to false

---
${\textsf{\color{Magenta}type}}$ Optional - Make keys in object optional

---
${\textsf{\color{Magenta}type}}$ RequiredKey - Make keys in object required

---
${\textsf{\color{Magenta}type}}$ Constructor - Get contructor type of an instance

---
${\textsf{\color{Magenta}type}}$ AwaitedObject - Recursively resolves promises in objects and arrays

---
${\textsf{\color{Magenta}type}}$ JSONSerializable - Anything that can be serialized to JSON

---
${\textsf{\color{Magenta}type}}$ ObjectAddPrefix - Adds prefix to all keys in object

---
${\textsf{\color{Magenta}type}}$ CamelToSnakeCase - Convert type of thisCase to this_case

---
${\textsf{\color{Magenta}type}}$ ObjectCamelToSnakeCase - Convert object keys of thisCase to this_case

---
${\textsf{\color{Magenta}type}}$ SnakeToCamel - Convert type of this-case to thisCase

---
${\textsf{\color{Magenta}type}}$ ObjectSnakeToCamel - Convert object keys of this-case to thisCase

---
${\textsf{\color{Magenta}type}}$ Concat - Concat types of array or objects

---
