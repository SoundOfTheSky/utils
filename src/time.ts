/**
 * Timers, CRON, etc.
 */

import { HOUR_MS } from './consts'
import { ValidationError } from './errors'

/** Measure performance of a function */
export function measurePerformance(function_: () => unknown, timeCheck = 16.6) {
  const endTime = performance.now() + timeCheck
  let executions = 0
  while (performance.now() < endTime) {
    function_()
    executions++
  }
  return executions
}

/** Like setInterval but with cron. Returns clear function. */
export function cronInterval(function_: () => unknown, cronString: string) {
  let timeout: number
  let next = getNextCron(cronString).getTime()
  const r = () => {
    const d = Date.now() - next
    if (d < 1) {
      next = getNextCron(cronString).getTime()
      function_()
    }
    timeout = setTimeout(r, Math.min(d, HOUR_MS)) as unknown as number
  }
  r()
  return () => {
    clearTimeout(timeout)
  }
}

/** Find next cron tick after passed date */
export function getNextCron(cronString: string, datetime = new Date()) {
  const cron = cronString.split(' ')
  if (cron.length !== 5)
    throw new ValidationError('Only 5 cron params supported')
  const dt = new Date(datetime)
  dt.setSeconds(0, 0)
  const items = [
    [
      parseCronItem(cron[4]!, 0, 6),
      dt.getDay.bind(dt),
      (x: number) =>
        dt.setDate(
          dt.getDate() +
            (dt.getDay() < x ? x - dt.getDay() : 7 - dt.getDay() + x),
        ),
    ],
    [
      parseCronItem(cron[3]!, 1, 12),
      () => dt.getMonth() + 1,
      (x: number) => dt.setMonth(x - 1),
    ],
    [parseCronItem(cron[2]!, 1, 31), dt.getDate.bind(dt), dt.setDate.bind(dt)],
    [
      parseCronItem(cron[1]!, 0, 23),
      dt.getHours.bind(dt),
      dt.setHours.bind(dt),
    ],
    [
      parseCronItem(cron[0]!, 0, 59),
      dt.getMinutes.bind(dt),
      dt.setMinutes.bind(dt),
    ],
  ] as const
  function r() {
    for (let index = 0; index < items.length; index++) {
      const [ok, getN, setN] = items[index]!
      const n = getN()
      // If OK continue
      if (ok.includes(n)) continue
      // If not ok, change every possible lower value lowest ok
      for (
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
        if (index > 1) {
          const [, getN, setN] = items[index - 1]!
          setN(getN() + 1)
          r()
        }
        break
      }
    }
  }
  r()
  return dt
}

function parseCronItem(cronString: string, min: number, max: number): number[] {
  const cron = cronString.split(',')
  const ok = new Set<number>()
  const error = new ValidationError(`Can't parse CRON string: ${cronString}`)
  for (const item of cron) {
    // If everything add every possible value and skip others
    if (item === '*') {
      for (let index = min; index <= max; index++) ok.add(index)
      break
    }
    // If range
    let split = item.split('-')
    if (split.length === 2) {
      const a = Number.parseInt(split[0]!)
      const b = Number.parseInt(split[1]!)
      if (Number.isNaN(a) || Number.isNaN(b) || a < min || a > b || b > max)
        throw error
      for (let index = a; index <= b; index++) ok.add(index)
      continue
    }
    // If stepped
    split = item.split('/')
    if (split.length === 2) {
      const step = Number.parseInt(split[1]!)
      if (Number.isNaN(step)) throw error
      const items = parseCronItem(split[0]!, min, max)
      for (let index = 0; index < items.length; index += step)
        ok.add(items[index]!)
      continue
    }
    // If everything else failed check for simple number
    const n = Number.parseInt(item)
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
