# Sky utils
**JavaScript/TypeScript utilities**

Utils library. 

`npm i @softsky/utils`

Usual utils plus more obscure stuff that I've never seen in any library. 
Also fancy TypeScript generics and types that I often use.

Test coverage __100%__.

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
### function _randomFromArray_
Returns random element from non-empty array
### function _shuffleArray_
Create new shuffled array
### function _swap_
Swap two elements in array
### function _binarySearch_
Binary search in sorted array.
Compare function should compare your needed value with value on index passed to it.
If compare returns 0 it means we found target.
If compare returns > 0 it means we have to cut out bigger side of array.
If compare returns < 0 it means we have to cut out smaller side of array.
### function _chunk_
Split array into sub arrays of spicified size
### function _combinations_
Return all combinations of items in array
### function _permutations_
Return all permutations of items in array
### function _pushToSorted_
Push data in array so array is always kept sorted

@param array Target array
@param element Element to push
@param compare Function to find place to push.
Return true when found position to push in.
For example if we return `[false, false, true, false]`,
Array will become `[false, false, Element, true, false]`.

## Consts
Some useful consts. That's it.

## Control
Utils related to code execution flow.
### const _UUID_
Get unique id
### async function _retry_
Retry async function
### function _createDebouncedFunction_
Create debounced function. Basically adds cooldown to function. Warning: throws!
### function _createThrottledFunction_
Create throttled function. Basically limits function calls in time period. Warning: throws!
### function _createDelayedFunction_
Create debounced function. Basically create function that will be called with delay,
but if another call comes in, we reset the timer.
### class _ImmediatePromise_
Promise that accepts no callback, but exposes `resolve` and `reject` methods
### const _wait_
setTimeout promisify
### const _noop_
Empty function that does nothing
### async function _concurrentRun_
Run array of async tasks concurrently

## Errors
Custom errors, finding errors and error handling.
### class _ValidationError_
Use as intended error. Basically 4** errors in HTTP
### function _findErrorText_
Find error inside anything recursively.
Good for finding human-readable errors.
Tries priority keys first.
Parses JSON automatically.
Returns undefind if nothing found.

## Formatting
Anything related to formatting and logging.
### type _FormatTimeRange_
Type for formatTime ranges
### const _FORMAT_NUMBER_RANGES_
Default time range
### const _FORMAT_NUMBER_RANGES_READABLE_
Time range more suitable for readability
### const _FORMAT_NUMBER_RANGES_BYTES_
Bytes range
### function _formatNumber_
Milliseconds to human readable time. Minimum accuracy, if set to 1000 will stop at seconds
### const _camelToSnakeCase_
thisCase to this_case
### const _snakeToCamelCase_
this_case to thisCase
### function _formatBytes_
Bytes to KB,MB,GB,TB
### function _log_
Format logging
### function _capitalizeFirstLetter_
Capitalize first letter

## Numbers
Numbers, math, etc.
### function _random_
Random number between min and max. May enable float
### function _parseInt_
Same as parseInt but throws
### function _parseFloat_
Same as parseFloat but throws
### function _factorial_
Factorial
### function _fib_
Fibonacci

## Objects
[object Object]
### function _getPropertyNames_
Get all prorerty names, including in prototype
### function _objectMap_
Map function like for arrays, but for objects
### function _objectFilter_
Filter function like for arrays, but for objects
### function _addPrefixToObject_
Adds prefix to every key in object
### function _deepEquals_
Check if objects are deep equal

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

Behavior with object above are not defined, but
it will still check them by reference.
### function _pick_
Pick keys from object

## Time
Timers, CRON, etc.
### function _measurePerformance_
Measure performance of a function
### function _cronInterval_
Like setInterval but with cron.
Returns clear function.
For cron string syntax check __getNextCron()__ description
### class _SpeedCalculator_
Object that calculates speed, ETA and percent of any measurable task.

`push()` chunks into speed calculator and then read `stats` for results.
`size` - a target then task is finished. Without it only speed is calculated.
`historyTime` - is a time period based on which speed will be calculated.

## Types
Damn, I **love** TypeScript.
### type _Optional_
Make keys in object optional
### type _RequiredKey_
Make keys in object required
### type _Constructor_
Get contructor type of an instance
### type _AwaitedObject_
Recursively resolves promises in objects and arrays
### type _JSONSerializable_
Anything that can be serialized to JSON
### type _ObjectAddPrefix_
Adds prefix to all keys in object
### type _CamelToSnakeCase_
Convert type of thisCase to this_case
### type _ObjectCamelToSnakeCase_
Convert object keys of thisCase to this_case
### type _SnakeToCamel_
Convert type of this-case to thisCase
### type _ObjectSnakeToCamel_
Convert object keys of this-case to thisCase
### type _Concat_
Concat types of array or objects