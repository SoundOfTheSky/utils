/**
 * Timers, CRON, etc.
 */

import { HOUR_MS } from './consts'
import { ValidationError } from './errors'
import { AnyFunction } from './types'

/** Measure performance of a function */
export function measurePerformance(run: () => unknown, timeCheck = 16.6) {
  const endTime = performance.now() + timeCheck
  let executions = 0
  while (performance.now() < endTime) {
    run()
    executions++
  }
  return executions
}

/**
 * Original setTimeout and setIntval known for accumulating delay
 * and causing problem with timeouts bigger than 32bit integer.
 *
 * This timeout wrapper fixes them. Returns clear function.
 */
export function setSafeTimeout(handler: AnyFunction, delay: number) {
  const end = Date.now() + delay
  let timeout: ReturnType<typeof setTimeout>
  function r() {
    const timeLeft = end - Date.now()
    if (timeLeft < 1) handler()
    else timeout = setTimeout(r, Math.min(timeLeft, HOUR_MS))
  }
  r()
  return () => {
    clearTimeout(timeout)
  }
}

/**
 * Original setTimeout and setIntval known for accumulating delay
 * and causing problem with timeouts bigger than 32bit integer.
 *
 * This interval wrapper fixes them. Returns clear function.
 */
export function setSafeInterval(handler: AnyFunction, delay: number) {
  let end = Date.now() + delay
  let timeout: ReturnType<typeof setInterval>
  function r() {
    const timeLeft = end - Date.now()
    if (timeLeft < 1) {
      end += delay
      handler()
      r()
    } else timeout = setTimeout(r, Math.min(timeLeft, HOUR_MS))
  }
  r()
  return () => {
    clearInterval(timeout)
  }
}

/** Like setInterval but with cron.
 *  Returns clear function.
 *  For cron string syntax check __getNextCron()__ description */
export function cronInterval(run: () => unknown, cronString: string) {
  let timeout: number
  let next = getNextCron(cronString).getTime()
  const r = () => {
    const now = Date.now()
    let d = next - now
    if (d < 1) {
      next = getNextCron(cronString).getTime()
      d = next - now
      run()
    }
    timeout = setTimeout(r, Math.min(d, HOUR_MS)) as unknown as number
  }
  r()
  return () => {
    clearTimeout(timeout)
  }
}

/** Find next cron date after passed date. This function __DOES NOT__ implement regular CRON 1 to 1.
 *
 *  1. [0-999] Milliseconds
 *  2. [0-59] Seconds
 *  3. [0-59] Minutes
 *  4. [0-23] Hours
 *  5. [1-31] Dates
 *  6. [1-12] Months
 *  7. [0-6] Weekdays
 *
 *  Main differences:
 *  - Weekdays value only 0 to 6 (0 is Sunday)
 *  - New supported syntax: __30-60/10__ - means __30,40,50,60__
 *  - Second and millisecond support: __0,500 300__ - every 30 seconds, two times
 * */
export function getNextCron(cronString: string, datetime = new Date()) {
  const cron = cronString.split(' ')
  for (let index = cron.length; index < 7; index++)
    cron.unshift(index === 3 || index === 4 ? '1' : '0')
  const dt = new Date(datetime.getTime() + 1)
  const items = [
    // Weekdays
    [
      parseCronItem(cron[6]!, 0, 6),
      dt.getDay.bind(dt),
      (x: number) =>
        dt.setDate(
          dt.getDate() +
            (dt.getDay() < x ? x - dt.getDay() : 7 - dt.getDay() + x),
        ),
    ],
    // Months
    [
      parseCronItem(cron[5]!, 1, 12),
      () => dt.getMonth() + 1,
      (x: number) => dt.setMonth(x - 1),
    ],
    // Dates
    [parseCronItem(cron[4]!, 1, 31), dt.getDate.bind(dt), dt.setDate.bind(dt)],
    // Hours
    [
      parseCronItem(cron[3]!, 0, 23),
      dt.getHours.bind(dt),
      dt.setHours.bind(dt),
    ],
    // Minutes
    [
      parseCronItem(cron[2]!, 0, 59),
      dt.getMinutes.bind(dt),
      dt.setMinutes.bind(dt),
    ],
    // Seconds
    [
      parseCronItem(cron[1]!, 0, 59),
      dt.getSeconds.bind(dt),
      dt.setSeconds.bind(dt),
    ],
    // Milliseconds
    [
      parseCronItem(cron[0]!, 0, 999),
      dt.getMilliseconds.bind(dt),
      dt.setMilliseconds.bind(dt),
    ],
  ] as const
  for (let index = 0; index < items.length; index++) {
    const [ok, getN, setN] = items[index]!
    const n = getN()
    // If OK continue
    if (ok.includes(n)) continue
    // If not ok, change every possible lower value lowest ok
    for (
      // If weekday(0) start from days
      let index2 = index === 0 ? 3 : index + 1;
      index2 < items.length;
      index2++
    ) {
      const [ok, , setN] = items[index2]!
      setN(ok[0]!)
    }
    const found = ok.find((x) => x > n)
    if (found) setN(found)
    else {
      // Set lowest value, increase item before and recheck everything
      setN(ok[0]!)
      if (index === 1) dt.setFullYear(dt.getFullYear() + 1)
      else if (index > 1) {
        const [, getN, setN] = items[index - 1]!
        setN(getN() + 1)
      }
      index = 0
    }
  }
  return dt
}

function parseCronItem(cronString: string, min: number, max: number): number[] {
  const cron = cronString.split(',')
  const ok = new Set<number>()
  const error = new ValidationError(`Can't parse CRON string: ${cronString}`)
  for (let index = 0; index < cron.length; index++) {
    const item = cron[index]!.trim()
    // If everything add every possible value and skip others
    if (item === '*') {
      for (let index = min; index <= max; index++) ok.add(index)
      break
    }
    // If stepped
    let split = item.split('/')
    if (split.length === 2) {
      const step = +split[1]!
      if (Number.isNaN(step)) throw error
      const items = parseCronItem(split[0]!, min, max)
      for (let index = 0; index < items.length; index += step)
        ok.add(items[index]!)
      continue
    }
    // If range
    split = item.split('-')
    if (split.length === 2) {
      const a = +split[0]!
      const b = +split[1]!
      if (Number.isNaN(a) || Number.isNaN(b) || a < min || a > b || b > max)
        throw error
      for (let index = a; index <= b; index++) ok.add(index)
      continue
    }
    // If everything else failed check for simple number
    const n = +item
    if (Number.isNaN(n) || n < min || n > max) throw error
    ok.add(n)
  }
  return [...ok].sort((a, b) => a - b)
}

/**
 * Object that calculates speed, ETA and percent of any measurable task.
 *
 * `push()` chunks into speed calculator and then read `stats` for results.
 * `size` - a target then task is finished. Without it only speed is calculated.
 * `historyTime` - is a time period based on which speed will be calculated.
 */
export class SpeedCalculator<SIZE extends number | undefined> {
  public sum = 0

  private history: { time: number; chunk: number }[] = []
  private statsCached?: { speed: number; percent?: number; eta?: number }
  private startTime = Date.now()

  public constructor(
    private size?: SIZE,
    public historyTime = 15_000,
  ) {}

  public push(chunk: number) {
    if (chunk < 0) throw new Error('Negative chunk size')
    const { time, historyTime } = this.getTime()
    this.history.push({ time, chunk })
    if (this.history[0] && this.history[0].time + historyTime < time)
      this.history.shift()
    this.sum += chunk
    delete this.statsCached
  }

  public get stats(): SIZE extends number
    ? { speed: number; percent: number; eta: number }
    : { speed: number } {
    if (!this.statsCached) {
      const speed =
        (this.history.reduce((sum, entry) => sum + entry.chunk, 0) /
          this.getTime().historyTime) *
        1000
      this.statsCached =
        this.size === undefined
          ? { speed }
          : {
              speed,
              percent: this.sum / this.size,

              eta: ~~((this.size - this.sum) / speed) * 1000,
            }
    }
    return this.statsCached as SIZE extends number
      ? { speed: number; percent: number; eta: number }
      : { speed: number }
  }

  private getTime() {
    const time = Date.now()
    const timeSinceStart = time - this.startTime
    const historyTime = Math.min(timeSinceStart, this.historyTime)
    return { time, historyTime }
  }
}
