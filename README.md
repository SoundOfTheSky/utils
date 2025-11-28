<div align="center">

# Sky utils
**JavaScript/TypeScript utilities**

[![Latest Stable Version](https://img.shields.io/npm/v/@softsky/utils.svg)](https://www.npmjs.com/package/@softsky/utils)
[![NPM Downloads](https://img.shields.io/npm/dm/@softsky/utils.svg)](https://www.npmjs.com/package/@softsky/utils)
[![NPM Downloads](https://img.shields.io/npm/dt/@softsky/utils.svg)](https://www.npmjs.com/package/@softsky/utils)
[![Bundlephobia Size](https://img.shields.io/bundlephobia/minzip/@softsky/utils.svg)](https://www.npmjs.com/package/@softsky/utils)

`npm i @softsky/utils`

__ZERO DEPENDENCIES__ utils library. Test coverage __100%__.

Usual utils plus more obscure stuff that I've never seen in any library. 
Also fancy TypeScript generics and types that I often use.
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

__function__ `randomFromArray` - Returns random element from non-empty array

---
__function__ `shuffleArray` - Create new shuffled array

---
__function__ `swap` - Swap two elements in array

---
__function__ `binarySearch` - Binary search in sorted array.
Compare function should compare your needed value with value on index passed to it.
If compare returns 0 it means we found target.
If compare returns > 0 it means we have to cut out bigger side of array.
If compare returns < 0 it means we have to cut out smaller side of array.

---
__function__ `chunk` - Split array into sub arrays of spicified size

---
__function__ `combinations` - Return all combinations of items in array

---
__function__ `permutations` - Return all permutations of items in array

---
__function__ `pushToSorted` - Push data to sorted array. Array will always be kept sorted.

Compare function should compare your needed value with value on index passed to it.
If compare returns 0 it means we found target.
If compare returns > 0 it means target is smaller.
If compare returns < 0 it means target is bigger.

```ts
pushToSorted(numArray, 10,  x => x - 10);
```

---
__function__ `removeFromArray` - Delete value from array.
Only deletes first encountered.

Returns index of deleted value.

---
__function__ `removeLastFromArray` - Delete value from array.
Only deletes last encountered.

Returns index of deleted value.

---
__function__ `reverse` - Reverse part of array

---


## Consts
Some useful consts. That's it.

__const__ `DAY_MS` - Milliseconds in a full day

---
__const__ `HOUR_MS` - Milliseconds in a hour

---
__const__ `MIN_MS` - Milliseconds in a minute

---
__const__ `SEC_MS` - Milliseconds in a second

---


## Control
Utils related to code execution flow.

__const__ `SESSION_ID` - Id generated only once per session

---
__function__ `UUID` - Get universally unique string id.
You can get information then id was generated using extractUUIDDate(uuid)
- 13 char - timestamp
- 13 char - SESSION_ID
- 4 char - incremental id

30 char total.

USING CUSTOM TIMESTAMP MAY RESULT IN COLLISSIONS

---
__function__ `extractUUIDDate` - Extract exact date of uuid generation

---
__function__ `createCashedFunction` - Creates cached function. All arguments/results are cached.
Returns [
fn [cached function],
delete [delete cached result for arguments]
hash
]

---
__function__ `createCashedAsyncFunction` - Creates cached function. All arguments/results are cached. Will store in cache resolved data.
Returns [
fn [cached function],
delete [delete cached result for arguments]
hash
]

---
__async function__ `retry` - Retry async function

---
__function__ `createDebouncedFunction` - Create debounced function. Basically adds cooldown to function. Warning: throws!

---
__function__ `createThrottledFunction` - Create throttled function. Basically limits function calls in time period. Warning: throws!

---
__function__ `createDelayedFunction` - Create debounced function. Basically create function that will be called with delay,
but if another call comes in, we reset the timer (previous function isn't called).

---
__class__ `ImmediatePromise` - Promise that accepts no callback, but exposes `resolve` and `reject` methods

---
__function__ `wait` - setTimeout promisify

---
__function__ `timeout` - Reject after specified time

---
__function__ `noop` - Empty function that does nothing

---
__async function__ `concurrentRun` - Run array of async tasks concurrently

---
__class__ `SimpleEventSource` - Create simple event source. Consider using `signal()` for reactive state managment.

---
__class__ `Semaphore` - Semaphore is used to limit concurrent tasks by delaying promise.

```ts
const semaphore = new Semaphore(2);

async function task() {
await semaphore.acquire();
try {
// This code can only be executed by two tasks at the same time
} finally {
semaphore.release();
}
}
task();
task();
task(); // This task will wait until one of the previous tasks releases the semaphore.

// === SHORTHAND ===
semaphore.run(()=>{
// Your code
})
semaphore.run(()=>{
// Your code
})
// ...
```

---
__async function__ `withTimeout` - Add timeout to a promise

---
__function__ `promisify` - Promisify a function with callback

---
__function__ `promisifyEventSource` - Create a promise out of EventSource

---


## Errors
Custom errors, finding errors and error handling.

__class__ `ValidationError` - Use as intended error. Basically 4** errors in HTTP

---
__class__ `TimeoutError` - Use as intended error. Basically 4** errors in HTTP

---
__function__ `findErrorText` - Find error inside anything recursively.
Good for finding human-readable errors.
Tries priority keys first.
Parses JSON automatically.
Returns undefind if nothing found.

---


## Formatting
Anything related to formatting and logging.

__type__ `FormatTimeRange` - Type for formatTime ranges

---
__const__ `FORMAT_NUMBER_RANGES` - Default time range

---
__const__ `FORMAT_NUMBER_RANGES_READABLE` - Time range more suitable for readability

---
__const__ `FORMAT_NUMBER_RANGES_BYTES` - Bytes range

---
__function__ `formatNumber` - Milliseconds to human readable time. Minimum accuracy, if set to 1000 will stop at seconds

---
__function__ `camelToSnakeCase` - thisCase to this_case

---
__function__ `snakeToCamelCase` - this_case to thisCase

---
__function__ `formatBytes` - Bytes to KB,MB,GB,TB

---
__function__ `log` - Format logging

---
__function__ `capitalizeFirstLetter` - Capitalize first letter

---
__function__ `pipe` - pipe() can be called on one or more functions, each of which can take the return of previous value.

```ts
// Takes string, converts to int, calc sqrt, convert and return date
pipe(
(x: string) => Number.parseInt(x),
(x) => Math.sqrt(x),
(x) => new Date(x)
)('69')
```

---


## Graphs
Pos

__function__ `unfoldPathfindingResult` - Unfold pathfinding result to path array.

---
__function__ `aStar` - Pathfind using aStar.
Returns a target and map of parents.
You can use `unfoldPathfindingResult()` to get array of nodes.

---
__function__ `bfs` - Breadth-first search. Slower than dfs.
If isTarget is omitted becomes floodfill.
Returns a target and map of parents.
You can use `unfoldPathfindingResult()` to get array of nodes.

---
__function__ `dfs` - Depth-first search. Faster than bfs.
If isTarget is omitted becomes floodfill.
Returns a target and map of parents.
You can use `unfoldPathfindingResult()` to get array of nodes.

---
__function__ `dijkstra` - Dijkstra search. Like bfs but supports weight.
If isTarget is omitted becomes floodfill (WITH WEIGHT).
Returns a target and map of parents.
You can use `unfoldPathfindingResult()` to get array of nodes.

---
__function__ `knapsack` - Knapsack find best way to get maximum value in limited capacity

---
__function__ `hamiltonianCycle` - Find min path between points. You need to supply 2-dim array
where first index is a point and second index is a distance from this point to another.
Put infinity if where are no path. Returns cycle (start and end at the same point)
Original: https://github.com/qntm/held-karp

---
__function__ `traverseByNearestNeighbor` - Traverse all points by nearest neighbor. Should be able to go from any point to any other point.

---
__function__ `twoOpt` - 2-opt improvement

---


## Numbers
Numbers, math, etc.

__function__ `random` - Random number between min and max. May enable float

---
__function__ `parseInt` - Same as Number.parseInt but throws if NaN or not safe

---
__function__ `parseFloat` - Same as Number.parseFloat but throws if NaN or Infinity

---
__function__ `factorial` - Factorial

---
__function__ `fib` - Fibonacci

---
__function__ `clamp` - Clamp numbers to max and min

---
__function__ `inRange` - Is number in range. Inclusive.

---
__function__ `mean` - Calucalate avarage from array of numbers

---
__function__ `round` - Round with precision.

```ts
round(1.2345); // 1
round(1.2345, 2); // 1.23
round(1.2345, 10); // 1.2345
```

---
__function__ `sum` - Sum of array of numbers

---


## Objects
[object Object]

__function__ `getPropertyNames` - Get all prorerty names, including in prototype

---
__function__ `objectMap` - Map function like for arrays, but for objects

---
__function__ `objectFilter` - Filter function like for arrays, but for objects

---
__function__ `addPrefixToObject` - Adds prefix to every key in object

---
__function__ `deepEquals` - Check if objects are deep equal

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
__function__ `pick` - Pick keys from object

---
__class__ `Base` - Base class that helps to manage ids and subclasses.

Include next lines when extending this class:
```js
static {
this.registerSubclass()
}
```

---


## Signals
Reactive signals

__function__ `signal` - __SIGNALS SYSTEM__

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
__function__ `effect` - __SIGNALS SYSTEM__

Effects are simplest way to react to signal changes.
Returned data from handler function will be passed to it on next signal change.
Returns a function that will clear the effect.


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
__function__ `untrack` - __SIGNALS SYSTEM__

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
__function__ `derived` - __SIGNALS SYSTEM__

Creates a derived reactive memoized signal.

```ts
// Sum of all changes of $a()
const { signal: $sumOfTwo, clear: clearSum } = derived((value) => value + $a(), 0)
```

---
__function__ `batch` - __SIGNALS SYSTEM__

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
__function__ `when` - __SIGNALS SYSTEM__

Returns ImmediatePromise that is resolved when check function returns truthy value.
If you want to, you can resolve or reject promise beforehand.

```ts
await when(() => $a()>5)
// With timeout
const promise = when(() => $a() > 5)
const timeout = setTimeout(() => promise.reject('Timeout')}, 5000)
primise.then(() => clearTimeout(timeout))
```

---


## Time
Timers, CRON, etc.

__function__ `measurePerformance` - Measure performance of a function

---
__function__ `setSafeTimeout` - Original setTimeout and setIntval known for accumulating delay
and causing problem with timeouts bigger than 32bit integer.

This timeout wrapper fixes them. Returns clear function.

---
__function__ `setSafeInterval` - Original setTimeout and setIntval known for accumulating delay
and causing problem with timeouts bigger than 32bit integer.

This interval wrapper fixes them. Returns clear function.

---
__function__ `cronInterval` - Like setInterval but with cron.
Returns clear function.
For cron string syntax check __getNextCron()__ description

---
__function__ `getNextCron` - Find next cron date after passed date. This function __DOES NOT__ implement regular CRON 1 to 1.

1. [0-999] Milliseconds
2. [0-59] Seconds
3. [0-59] Minutes
4. [0-23] Hours
5. [1-31] Dates
6. [1-12] Months
7. [0-6] Weekdays

Main differences:
- Weekdays value only 0 to 6 (0 is Sunday)
- New supported syntax: __30-60/10__ - means __30,40,50,60__
- Second and millisecond support: __0,500 300__ - every 30 seconds, two times

---
__class__ `SpeedCalculator` - Object that calculates speed, ETA and percent of any measurable task.

`push()` chunks into speed calculator and then read `stats` for results.
`size` - a target then task is finished. Without it only speed is calculated.
`historyTime` - is a time period based on which speed will be calculated.

---


## Types
Damn, I **love** TypeScript.

__type__ `Primitive` - Values that are copied by value, not by reference

---
__type__ `AnyFunction` - Function with any arguments or return type

---
__type__ `Falsy` - Values that convert to false

---
__type__ `Optional` - Make keys in object optional

---
__type__ `RequiredKey` - Make keys in object required

---
__type__ `Constructor` - Get contructor type of an instance

---
__type__ `AwaitedObject` - Recursively resolves promises in objects and arrays

---
__type__ `JSONSerializable` - Anything that can be serialized to JSON

---
__type__ `ObjectAddPrefix` - Adds prefix to all keys in object

---
__type__ `CamelToSnakeCase` - Convert type of thisCase to this_case

---
__type__ `ObjectCamelToSnakeCase` - Convert object keys of thisCase to this_case

---
__type__ `SnakeToCamel` - Convert type of this-case to thisCase

---
__type__ `ObjectSnakeToCamel` - Convert object keys of this-case to thisCase

---
__type__ `Concat` - Concat types of array or objects

---
__type__ `Prettify` - Visual only overhaul. Shows final type result on hover.

```ts
type a = {a: '1'}
type b = Prettify<a & { b: 'b' }>
// On hovering b it will show
type b = {
a: "1";
b: "b";
}
// instead of
type b = a & {
b: "b";
}
```

---
__type__ `Tuple` - Create a tuple of size.

```ts
type a = Tuple<number, 3>
type b = [number, number, number]
```

---
