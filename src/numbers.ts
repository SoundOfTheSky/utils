/**
 * Numbers, math, etc.
 */
import { ValidationError } from './errors';

/** Random number between min and max. May enable float */
export function random(min: number, max: number, float?: boolean): number {
  const number_ = Math.random() * (max - min) + min;
  return float ? number_ : Math.round(number_);
}

/** Same as parseInt but throws */
export function parseInt(param: unknown, radix?: number) {
  const n = Number.parseInt(param as string, radix);

  if (Number.isNaN(n) || !Number.isSafeInteger(n))
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new ValidationError(`Can not parse "${param}" to integer`);
  return n;
}

/** Same as parseFloat but throws */
export function parseFloat(param: unknown) {
  const n = Number.parseFloat(param as string);

  if (Number.isNaN(n) || !Number.isFinite(n))
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new ValidationError(`Can not parse "${param}" to float`);
  return n;
}
