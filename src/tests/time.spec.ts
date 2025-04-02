// eslint-disable-next-line import-x/no-unresolved
import { describe, expect, it, mock } from 'bun:test'

import { noop, wait } from '../control'
import {
  cronInterval,
  getNextCron,
  measurePerformance,
  SpeedCalculator,
} from '../time'

describe('measurePerformance', () => {
  it('measures function execution speed', () => {
    const executions = measurePerformance(() => Math.sqrt(144), 10)
    expect(executions).toBeGreaterThan(0)
  })
})

describe('getNextCron', () => {
  it('handles exact match', () => {
    expect(
      getNextCron('1 12 1 4 *', new Date('2025-04-01T12:00:00Z')).toISOString(),
    ).toBe('2025-04-01T12:01:00.000Z')
  })

  it('handles step values', () => {
    expect(
      getNextCron(
        '*/15 * * * *',
        new Date('2025-04-01T12:00:00Z'),
      ).toISOString(),
    ).toBe('2025-04-01T12:15:00.000Z')
  })

  it('handles range values', () => {
    expect(
      getNextCron(
        '0 9-17 * * *',
        new Date('2025-04-01T12:00:00Z'),
      ).toISOString(),
    ).toBe('2025-04-01T13:00:00.000Z')
  })

  it('handles list values', () => {
    expect(
      getNextCron(
        '0 10,14-16,18 * * *',
        new Date('2025-04-01T12:00:00Z'),
      ).toISOString(),
    ).toBe('2025-04-01T14:00:00.000Z')
  })

  it('handles mixed step and range', () => {
    expect(
      getNextCron(
        '30-50/10 * * * *',
        new Date('2025-04-01T12:00:00Z'),
      ).toISOString(),
    ).toBe('2025-04-01T12:30:00.000Z')
  })

  it('handles weekly wrap-around', () => {
    const now = new Date('2025-04-01T12:00:00Z') // Tuesday
    expect(getNextCron('0 12 * * 1', now).toISOString()).toBe(
      '2025-04-07T12:00:00.000Z',
    ) // Next Monday
  })

  it('handles max wrap-around', () => {
    const now = new Date('2025-05-01T12:00:00.001Z')
    expect(getNextCron('0 0 0 12 1 5 *', now).toISOString()).toBe(
      '2026-05-01T12:00:00.000Z',
    )
  })
})

describe('SpeedCalculator', () => {
  it('calculates speed and ETA correctly', async () => {
    const calculator = new SpeedCalculator(1000)
    calculator.push(100)
    await wait(1000)
    calculator.push(100)
    expect(calculator.stats.eta).toBeWithin(3500, 4500)
    expect(calculator.stats.speed).toBeWithin(150, 201)
    expect(calculator.stats.percent).toBe(0.2)
  })
})

describe('cronInterval', () => {
  it('schedules a function based on a cron string', async () => {
    const function_ = mock(noop)
    await wait(Date.now() % 1000)
    const clear = cronInterval(function_, '*/200 * * * * * *')
    await wait(1000)
    clear()
    expect(function_).toBeCalledTimes(5)
  })
})
