/**
 * Anything related to formatting and logging.
 */

/** Milliseconds to human readable time. Minimum accuracy, if set to 1000 will stop at seconds  */
export function formatTime(
  time: number,
  min = 0,
  ranges: [number, string][] = [
    [31_536_000_000, 'y'],
    [86_400_000, 'd'],
    [3_600_000, 'h'],
    [60_000, 'm'],
    [1000, 's'],
    [1, 'ms'],
  ],
) {
  let output = ''
  for (const [ms, title] of ranges) {
    if (min && time < min) break
    if (time < ms) continue
    const value = Math.trunc(time / ms)
    if (value !== 0) output += ` ${value}${title}`
    time %= ms
  }
  return output
}

/** thisCase to this_case */
export const camelToSnakeCase = (string_: string) =>
  string_.replaceAll(/[A-Z]+/g, letter => `_${letter.toLowerCase()}`)

/** this_case to thisCase */
export const snakeToCamelCase = (string_: string) =>
  string_.replaceAll(/_[a-z]/g, letter => letter[1]!.toUpperCase())

/** Bytes to KB,MB,GB,TB */
export function formatBytes(bytes: number) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return `0B`
  const pow = Math.trunc(Math.log(bytes) / Math.log(1024))
  const maxPow = Math.min(pow, sizes.length - 1)
  return `${Number.parseFloat((bytes / Math.pow(1024, maxPow)).toFixed(2))}${sizes[maxPow]}`
}

/** Format logging */
export function log(...agrs: unknown[]) {
  console.log(new Date().toLocaleString('ru'), ...agrs)
}

/** Can pass streams through to log a progress */
export class ProgressLoggerTransform<
  T extends { length: number },
> extends TransformStream<T> {
  public constructor(string_: string, logInterval: number, maxSize?: number) {
    let bytes = 0
    const start = Date.now()
    let lastBytes = 0
    super({
      transform(chunk, controller) {
        controller.enqueue(chunk)
        bytes += chunk.length
      },
      flush() {
        clearInterval(interval)
        log('Done!')
      },
    })
    const interval = setInterval(() => {
      let message = string_
      const speed = (bytes - lastBytes) / logInterval
      message = message
        .replace('%b', formatBytes(bytes))
        .replace('%t', formatTime(Date.now() - start, 1000))
        .replace('%s', formatBytes(speed))
      if (maxSize)
        message = message
          .replace(
            '%lt',
            formatTime(Math.trunc((maxSize - bytes) / speed) * 1000),
          )
          .replace('%p', Math.trunc((bytes / maxSize) * 100).toString())
          .replace('%s', formatBytes(maxSize))
      log(message)
      lastBytes = bytes
    }, logInterval * 1000)
  }
}
