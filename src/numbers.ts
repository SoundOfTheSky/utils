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
export function parseInt(param: string, radix?: number) {
  const n = Number.parseInt(param, radix);
  if (Number.isNaN(n) || !Number.isSafeInteger(n)) throw new ValidationError(`Can not parse "${param}" to integer`);
  return n;
}

/** Same as parseFloat but throws */
export function parseFloat(param: string) {
  const n = Number.parseFloat(param);
  if (Number.isNaN(n) || !Number.isFinite(n)) throw new ValidationError(`Can not parse "${param}" to float`);
  return n;
}
