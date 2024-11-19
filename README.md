# Sky utils
**JavaScript/TypeScript utilities**

Basically library, but it's too simple to be on npm.

## arrays
Everything array related.
### function randomFromArray
Returns random element from non-empty array
### function shuffleArray
Create new shuffled array
### function swap
Swap two elements in array
### function binarySearch
Binary search in sorted array.
Compare function should compare your needed value with value on index passed to it.
If compare returns 0 it means we found target.
If compare returns > 0 it means we have to cut out bigger side of array.
If compare returns < 0 it means we have to cut out smaller side of array.
### function chunk
Split array into sub arrays of spicified size

## consts
Some useful consts. That's it.

## control
Utils related to code execution flow.
### const UUID
Get unique id
### async function retry
Retry async function
### function createDebouncedFunction
Create debounced function. Basically adds cooldown to function. Warning: throws!
### function createThrottledFunction
Create throttled function. Basically limits function calls in time period. Warning: throws!
### function createDelayedFunction
Create debounced function. Basically create function that will be called with delay,
but if another call comes in, we reset the timer.
### class ImmediatePromise
Promise that accepts no callback, but exposes `resolve` and `reject` methods
### const wait
setTimeout promisify
### const noop
Empty function that does nothing

## errors
Custom errors, finding errors and error handling.
### class ValidationError
Use as intended error. Basically 4** errors in HTTP
### function findErrorText
Find error inside anything recursively.
Good for finding human-readable errors.
Tries priority keys first.
Parses JSON automatically.
Returns undefind if nothing found.

## formatting
Anything related to formatting and logging.
### function formatTime
Milliseconds to human readable time. Minimum accuracy, if set to 1000 will stop at seconds
### const camelToSnakeCase
thisCase to this_case
### const snakeToCamelCase
this_case to thisCase
### function formatBytes
Bytes to KB,MB,GB,TB
### function log
Format logging
### class ProgressLoggerTransform
Can pass streams through to log a progress

## numbers
Numbers, math, etc.
### function random
Random number between min and max. May enable float
### function parseInt
Same as parseInt but throws
### function parseFloat
Same as parseFloat but throws

## objects
[object Object]
### function getPropertyNames
Get all prorerty names, including in prototype
### const objectMap
Map function like for arrays, but for objects
### const objectFilter
Filter function like for arrays, but for objects
### function addPrefixToObject
Adds prefix to every key in object
### function deepEquals
Check if objects are deep equal

**Supports:**
- All primitives (String, Number, BigNumber, Null, undefined, Symbol)
- Objects
- Iterables (Arrays, Map, Sets, Queries, etc.)
- Dates

**Not supported:**
- Functions
- Async iterables
- Promises
- etc

Behavior with object above are not defined, but
it will still check them by reference.

## time
Timers, CRON, etc.
### function measurePerformance
Measure performance of a function
### function cronInterval
Like setInterval but with cron. Returns clear function.
### function getNextCron
Find next cron tick after passed date

## types
Damn, I **love** TypeScript.
### type Optional
Make keys in object optional
### type Constructor
Get contructor type of an instance
### type AwaitedObject
Recursively resolves promises in objects and arrays
### type JSONSerializable
Anything that can be serialized to JSON
### type ObjectAddPrefix
Adds prefix to all keys in object
### type CamelToSnakeCase
Convert type of thisCase to this_case
### type ObjectCamelToSnakeCase
Convert object keys of thisCase to this_case
### type SnakeToCamel
Convert type of this-case to thisCase
### type ObjectSnakeToCamel
Convert object keys of this-case to thisCase
### type Concat
Concat types of array or objects