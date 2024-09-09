import { HOUR_MS } from './consts';
import { ValidationError } from './errors';

/** Like setInterval but with cron. Returns clear function. */
export function cronInterval(fn: () => unknown, cronString: string) {
  let timeout: number;
  let next = getNextCron(cronString).getTime();
  const r = () => {
    const d = Date.now() - next;
    if (d < 1) {
      next = getNextCron(cronString).getTime();
      fn();
    }
    timeout = setTimeout(r, d < HOUR_MS ? d : HOUR_MS) as unknown as number;
  };
  r();
  return () => clearTimeout(timeout);
}

/** Find next cron tick after passed date */
export function getNextCron(cronString: string, datetime = new Date()) {
  const cron = cronString.split(' ');
  if (cron.length !== 5) throw new ValidationError('Only 5 cron params supported');
  const dt = new Date(datetime);
  dt.setSeconds(0, 0);
  const items = [
    [
      parseCronItem(cron[4], 0, 6),
      dt.getDay.bind(dt),
      (x: number) => dt.setDate(dt.getDate() + (dt.getDay() < x ? x - dt.getDay() : 7 - dt.getDay() + x)),
    ],
    [parseCronItem(cron[3], 1, 12), () => dt.getMonth() + 1, (x: number) => dt.setMonth(x - 1)],
    [parseCronItem(cron[2], 1, 31), dt.getDate.bind(dt), dt.setDate.bind(dt)],
    [parseCronItem(cron[1], 0, 23), dt.getHours.bind(dt), dt.setHours.bind(dt)],
    [parseCronItem(cron[0], 0, 59), dt.getMinutes.bind(dt), dt.setMinutes.bind(dt)],
  ] as const;
  function r() {
    for (let i = 0; i < items.length; i++) {
      const [ok, getN, setN] = items[i];
      const n = getN();
      // If OK continue
      if (ok.includes(n)) continue;
      // If not ok, change every possible lower value lowest ok
      for (let i2 = i === 0 ? 3 : i + 1; i2 < items.length; i2++) {
        const [ok, , setN] = items[i2];
        setN(ok[0]);
      }
      const found = ok.find((x) => x > n);
      if (found) setN(found);
      else {
        // Set lowest value, increase item before and recheck everything
        setN(ok[0]);
        if (i > 1) {
          const [, getN, setN] = items[i - 1];
          setN(getN() + 1);
          r();
        }
        break;
      }
    }
  }
  r();
  return dt;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function parseCronItem(cronString: string, min: number, max: number): number[] {
  const cron = cronString.split(',');
  const ok = new Set<number>();
  const err = new ValidationError(`Can\'t parse CRON string: ${cronString}`);
  for (const item of cron) {
    // If everything add every possible value and skip others
    if (item === '*') {
      for (let i = min; i <= max; i++) ok.add(i);
      break;
    }
    // If range
    let split = item.split('-');
    if (split.length === 2) {
      const a = Number.parseInt(split[0]);
      const b = Number.parseInt(split[1]);
      if (Number.isNaN(a) || Number.isNaN(b) || a < min || a > b || b > max) throw err;
      for (let i = a; i <= b; i++) ok.add(i);
      continue;
    }
    // If stepped
    split = item.split('/');
    if (split.length === 2) {
      const step = Number.parseInt(split[1]);
      if (Number.isNaN(step)) throw err;
      const items = parseCronItem(split[0], min, max);
      for (let i = 0; i < items.length; i += step) ok.add(items[i]);
      continue;
    }
    // If everything else failed check for simple number
    const n = Number.parseInt(item);
    if (Number.isNaN(n) || n < min || n > max) throw err;
    ok.add(n);
  }
  return [...ok].sort((a, b) => a - b);
}
