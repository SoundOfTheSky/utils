// eslint-disable-next-line import-x/no-unresolved
import { describe, expect, it } from 'bun:test'

import { aStar, bfs, dfs, unfoldPathfindingResult } from '../graphs'

const graph = {
  A: ['B', 'D'],
  B: ['A', 'C', 'E'],
  C: ['B'],
  D: ['A', 'E'],
  E: ['B', 'D'],
} as Record<string, string[]>

const getNeighbors = (node: string) => graph[node] ?? []

describe('bfs', () => {
  it('finds shortest path from A to C', () => {
    const { target, parents } = bfs({
      start: 'A',
      getNeighbors,
      isTarget: (node) => node === 'C',
    })
    expect(target).toBe('C')
    const path = unfoldPathfindingResult({ target, parents })
    expect(path).toEqual(['A', 'B', 'C'])
  })
})

describe('dfs', () => {
  it('finds a path from A to C (not necessarily shortest)', () => {
    const { target, parents } = dfs({
      start: 'A',
      getNeighbors,
      isTarget: (node) => node === 'C',
    })
    expect(target).toBe('C')
    const path = unfoldPathfindingResult({ target, parents })
    // Multiple valid paths; just ensure start and end are correct
    expect(path[0]).toBe('A')
    expect(path.at(-1)).toBe('C')
    expect(path).toContain('B')
  })
})

describe('aStar', () => {
  const costs: Record<string, number> = {
    A: 3,
    B: 2,
    C: 0,
    D: 2,
    E: 1,
  }
  const heuristic = (node: string) => costs[node] ?? 10
  const getWeight = () => 1

  it('finds shortest path from A to C with heuristic', () => {
    const { target, parents } = aStar({
      start: 'A',
      getNeighbors,
      getWeight,
      heuristic,
      isTarget: (node) => node === 'C',
    })
    expect(target).toBe('C')
    const path = unfoldPathfindingResult({ target, parents })
    expect(path).toEqual(['A', 'B', 'C'])
  })
})

describe('unfoldPathfindingResult', () => {
  it('returns an empty path if target is undefined', () => {
    const path = unfoldPathfindingResult({
      target: undefined,
      parents: new Map(),
    })
    expect(path).toEqual([])
  })
})
