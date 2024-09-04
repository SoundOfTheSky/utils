# Sky utils
**JavaScript/TypeScript utilities**

Basically library, but it's too simple to be on npm

## Arrays
Everything array related
- shuffleArray - Create new shuffled array
- swap - Swap two elements in array
- binarySearch - Binary search in sorted array.

## Consts
Some useful consts. That's it.

## Control
Utils related to code execution flow.
- uuid - Unique id
- createCashedFunction - Memoize function
- createCashedAsyncFunction - Memoize async function (Non async still works but may use more memory)
- retry - Retry some async function if failes
- wait - setTimeout promisify
- noop - Empty function that does nothing

## Errors
Includes custom errors and other utils for pasing them.
- ValidationError - Use as intended error. Basically 4** errors in HTTP.
- findErrorText - Find error inside an object recursively.

## Formatting
Anything related to formatting and logging.
- formatTime - Milliseconds to human readable time.
- camelToSnakeCase - thisCase to this-case
- snakeToCamelCase - this-case to thisCase
- formatBytes - Bytes to KB,MB,GB,TB
- log - Format logging
- ProgressLoggerTransform - Can pass streams through to log a progress

## Numbers
Number, math, etc.
- random - Random number between min and max. May enable float
- parseInt - Same as parseInt but throws
- parseFloat - Same as parseFloat but throws

## Objects
[object Object]
- getPropertyNames - Get all prorerty names, including in prototype.
- objectMap - Map function like for arrays, but for objects
- objectFilter - Filter function like for arrays, but for objects

## Time
Timers, CRON, etc.
- cronInterval - Like setInterval but with cron. Returns clear function.
- getNextCron - Find next cron tick after passed date.

## Types
Damn, I **love** TypeScript.
- Optional - Make keys in object optional.
- JSONSerializable - Anything that can be serialized to JSON.
