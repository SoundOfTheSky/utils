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
  let output = '';
  for (const [ms, title] of ranges) {
    if (min && time < min) break;
    if (time < ms) continue;
    const val = ~~(time / ms);
    if (val !== 0) output += ` ${val}${title}`;
    time %= ms;
  }
  return output;
}

/** thisCase to this_case */
export const camelToSnakeCase = (str: string) => str.replaceAll(/[A-Z]+/g, (letter) => `_${letter.toLowerCase()}`);

/** this_case to thisCase */
export const snakeToCamelCase = (str: string) => str.replaceAll(/_[a-z]/g, (letter) => letter[1].toUpperCase());

/** Bytes to KB,MB,GB,TB */
export function formatBytes(bytes: number) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return `0B`;
  const pow = ~~(Math.log(bytes) / Math.log(1024));
  const maxPow = Math.min(pow, sizes.length - 1);
  return `${Number.parseFloat((bytes / Math.pow(1024, maxPow)).toFixed(2))}${sizes[maxPow]}`;
}

/** Format logging */
export function log(...agrs: unknown[]) {
  console.log(new Date().toLocaleString('ru'), ...agrs);
}

/** Can pass streams through to log a progress */
export class ProgressLoggerTransform<T extends { length: number }> extends TransformStream<T> {
  public constructor(str: string, logInterval: number, maxSize?: number) {
    let bytes = 0;
    const start = Date.now();
    let lastBytes = 0;
    super({
      transform(chunk, controller) {
        controller.enqueue(chunk);
        bytes += chunk.length;
      },
      flush() {
        clearInterval(interval);
        log('Done!');
      },
    });
    const interval = setInterval(() => {
      let msg = str;
      const speed = (bytes - lastBytes) / logInterval;
      msg = msg
        .replace('%b', formatBytes(bytes))
        .replace('%t', formatTime(Date.now() - start, 1000))
        .replace('%s', formatBytes(speed));
      if (maxSize)
        msg = msg
          .replace('%lt', formatTime(~~((maxSize - bytes) / speed) * 1000))
          .replace('%p', (~~((bytes / maxSize) * 100)).toString())
          .replace('%s', formatBytes(maxSize));
      log(msg);
      lastBytes = bytes;
    }, logInterval * 1000);
  }
}
