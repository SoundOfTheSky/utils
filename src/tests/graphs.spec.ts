// eslint-disable-next-line import-x/no-unresolved
import { describe, expect, it } from 'bun:test'

import {
  aStar,
  bfs,
  dfs,
  knapsack,
  hamiltonianCycle,
  unfoldPathfindingResult,
  twoOpt,
  traverseByNearestNeighbor,
  dijkstra,
} from '../graphs'

const graph = {
  A: ['B', 'D'],
  B: ['A', 'C', 'E'],
  C: ['B'],
  D: ['A', 'E'],
  E: ['B', 'D'],
  F: ['B', 'D'],
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
  it('finds no path if none exist', () => {
    const { target, parents } = bfs({
      start: 'A',
      getNeighbors,
      isTarget: (node) => node === 'F',
    })
    expect(target).toBeUndefined()
    expect(parents).toEqual(
      new Map(
        Object.entries({
          B: 'A',
          D: 'A',
          C: 'B',
          E: 'B',
        }),
      ),
    )
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
    expect(path).toEqual(['A', 'B', 'C'])
  })

  it('finds no path if none exist', () => {
    const { target, parents } = dfs({
      start: 'A',
      getNeighbors,
      isTarget: (node) => node === 'F',
    })
    expect(target).toBeUndefined()
    expect(parents).toEqual(
      new Map(
        Object.entries({
          B: 'A',
          D: 'A',
          E: 'D',
          C: 'B',
        }),
      ),
    )
  })
})

describe('dijkstra', () => {
  const costs: Record<string, number> = {
    A: 0,
    B: 5,
    C: 1,
    D: 4,
    E: 1,
    F: 10,
  }

  it('finds cheaper weighted path', () => {
    const { target, parents } = dijkstra({
      start: 'A',
      getNeighbors,
      isTarget: (node) => node === 'E',
      getWeight: (node) => costs[node] ?? Infinity,
    })
    expect(target).toBe('E')
    const path = unfoldPathfindingResult({ target, parents })
    expect(path).toEqual(['A', 'D', 'E'])
    ;(() => {
      costs.D! += 2
      const { target, parents } = dijkstra({
        start: 'A',
        getNeighbors,
        isTarget: (node) => node === 'E',
        getWeight: (node) => costs[node] ?? Infinity,
      })
      expect(target).toBe('E')
      const path = unfoldPathfindingResult({ target, parents })
      expect(path).toEqual(['A', 'B', 'E'])
    })()
  })

  it('finds no path if target unreachable', () => {
    const { target } = dijkstra({
      start: 'C',
      getNeighbors,
      isTarget: (node) => node === 'Z', // nonexistent
      getWeight: (node) => costs[node] ?? Infinity,
    })
    expect(target).toBeUndefined()
  })
})

describe('aStar', () => {
  const costs: Record<string, number> = {
    A: 3,
    B: 2,
    C: 0,
    D: 2,
    E: 1,
    F: 1,
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
  it('finds no path if none exist', () => {
    const { target, parents } = aStar({
      start: 'A',
      getNeighbors,
      getWeight,
      heuristic,
      isTarget: (node) => node === 'F',
    })
    expect(target).toBeUndefined()
    expect(parents).toEqual(
      new Map(
        Object.entries({
          B: 'A',
          D: 'A',
          C: 'B',
          E: 'B',
        }),
      ),
    )
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

describe('knapsack', () => {
  it('simple case', () => {
    const weights = [1, 2, 3]
    const values = [6, 10, 12]
    const capacity = 5
    const result = knapsack(weights, values, capacity)

    expect(result.weight).toBe(22)
    expect(result.items).toEqual([1, 2]) // weights: [2, 3], values: [10, 12]
  })

  it('zero capacity', () => {
    const result = knapsack([1, 2, 3], [6, 10, 12], 0)
    expect(result.weight).toBe(0)
    expect(result.items).toEqual([])
  })

  it('no items', () => {
    const result = knapsack([], [], 10)
    expect(result.weight).toBe(0)
    expect(result.items).toEqual([])
  })

  it('all items too heavy', () => {
    const weights = [10, 20, 30]
    const values = [60, 100, 120]
    const capacity = 5
    const result = knapsack(weights, values, capacity)

    expect(result.weight).toBe(0)
    expect(result.items).toEqual([])
  })

  it('capacity equals one item', () => {
    const weights = [3, 5, 9]
    const values = [10, 50, 60]
    const capacity = 5
    const result = knapsack(weights, values, capacity)

    expect(result.weight).toBe(50)
    expect(result.items).toEqual([1])
  })

  it('chooses better combo over single high value', () => {
    const weights = [3, 5, 6]
    const values = [30, 50, 60]
    const capacity = 8
    const result = knapsack(weights, values, capacity)

    // Best is [1, 0] (values 50 + 30 = 80)
    expect(result.weight).toBe(80)
    expect(result.items).toEqual([0, 1])
  })

  it('handles large input', () => {
    const n = 100
    const weights = Array.from({ length: n }, (_, index) => index + 1)
    const values = Array.from({ length: n }, (_, index) => (index + 1) * 2)
    const capacity = 100
    const result = knapsack(weights, values, capacity)

    expect(result.weight).toBeGreaterThan(0)
    expect(result.items.every((index) => weights[index]! <= capacity)).toBe(
      true,
    )
  })
})

describe('held-karp', () => {
  it('handles a degenerate case with 1 city', () => {
    expect(hamiltonianCycle([[0]])).toEqual([0, 0])
  })

  it('handles a symmetric case with two cities', () => {
    expect(
      hamiltonianCycle([
        [0, 5],
        [5, 0],
      ]),
    ).toEqual([0, 1, 0])
  })

  it('handles an asymmetric case with two cities', () => {
    expect(
      hamiltonianCycle([
        [0, 7],
        [6, 0],
      ]),
    ).toEqual([0, 1, 0])
  })

  it('handles a case with two cities disconnected from one another, with no cycle possible', () => {
    expect(
      hamiltonianCycle([
        [0, Infinity],
        [Infinity, 0],
      ]),
    ).toEqual([0, 1, 0])
  })

  it('handles a symmetric case with three cities', () => {
    expect(
      hamiltonianCycle([
        [0, 1, 65],
        [1, 0, 2],
        [65, 2, 0],
      ]),
    ).toEqual([0, 2, 1, 0])
  })

  it('handles an asymmetric case with three cities', () => {
    expect(
      hamiltonianCycle([
        [0, 1, 60],
        [60, 0, 1],
        [1, 60, 0],
      ]),
    ).toEqual([0, 1, 2, 0])
    expect(
      hamiltonianCycle([
        [0, 60, 1],
        [1, 0, 60],
        [60, 1, 0],
      ]),
    ).toEqual([0, 2, 1, 0])
  })

  it('example from https://www.geeksforgeeks.org/traveling-salesman-problem-tsp-implementation/', () => {
    expect(
      hamiltonianCycle([
        [0, 10, 15, 20],
        [10, 0, 35, 25],
        [15, 35, 0, 30],
        [20, 25, 30, 0],
      ]),
    ).toEqual([0, 1, 3, 2, 0])
  })

  it('asymmetric four-city case', () => {
    expect(
      hamiltonianCycle([
        [0, 1, 60, 60],
        [60, 0, 1, 60],
        [60, 60, 0, 1],
        [1, 60, 60, 0],
      ]),
    ).toEqual([0, 1, 2, 3, 0])
  })

  it('example from https://stackoverflow.com/a/64795748 (n = 6)', () => {
    expect(
      hamiltonianCycle([
        [0, 64, 378, 519, 434, 200],
        [64, 0, 318, 455, 375, 164],
        [378, 318, 0, 170, 265, 344],
        [519, 455, 170, 0, 223, 428],
        [434, 375, 265, 223, 0, 273],
        [200, 164, 344, 428, 273, 0],
      ]),
    ).toEqual([0, 5, 4, 3, 2, 1, 0])
  })

  it('example from https://stackoverflow.com/a/27195735 (n = 11)', () => {
    const cities = [
      [0, 29, 20, 21, 16, 31, 100, 12, 4, 31, 18],
      [29, 0, 15, 29, 28, 40, 72, 21, 29, 41, 12],
      [20, 15, 0, 15, 14, 25, 81, 9, 23, 27, 13],
      [21, 29, 15, 0, 4, 12, 92, 12, 25, 13, 25],
      [16, 28, 14, 4, 0, 16, 94, 9, 20, 16, 22],
      [31, 40, 25, 12, 16, 0, 95, 24, 36, 3, 37],
      [100, 72, 81, 92, 94, 95, 0, 90, 101, 99, 84],
      [12, 21, 9, 12, 9, 24, 90, 0, 15, 25, 13],
      [4, 29, 23, 25, 20, 36, 101, 15, 0, 35, 18],
      [31, 41, 27, 13, 16, 3, 99, 25, 35, 0, 38],
      [18, 12, 13, 25, 22, 37, 84, 13, 18, 38, 0],
    ]

    expect(hamiltonianCycle(cities)).toEqual([
      0, 7, 4, 3, 9, 5, 2, 6, 1, 10, 8, 0,
    ])
  })
})

function distributionMatrix(points: [number, number][]): number[][] {
  const n = points.length
  const distribution = Array.from(
    { length: n },
    () => new Array(n).fill(0) as number[],
  )
  for (let index = 0; index < n; index++) {
    for (let index_ = 0; index_ < n; index_++) {
      const dx = points[index]![0] - points[index_]![0]
      const dy = points[index]![1] - points[index_]![1]
      distribution[index]![index_] = Math.hypot(dx, dy)
    }
  }
  return distribution
}

describe('traverseByNearestNeighbor', () => {
  it('visits all points exactly once', () => {
    const points: [number, number][] = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]
    const path = traverseByNearestNeighbor(distributionMatrix(points))
    expect(new Set(path).size).toBe(points.length)
    expect(path.length).toBe(points.length)
    expect(path[0]).toBe(0) // always starts at 0
  })

  it('chooses nearest neighbor in a straight line', () => {
    expect(
      traverseByNearestNeighbor(
        distributionMatrix([
          [0, 0],
          [1, 0],
          [2, 0],
          [3, 0],
        ]),
      ),
    ).toEqual([0, 1, 2, 3])
  })

  it('works with asymmetric distance matrix', () => {
    expect(
      traverseByNearestNeighbor([
        [0, 1, 5],
        [2, 0, 1],
        [1, 3, 0],
      ]),
    ).toEqual([0, 1, 2])
  })

  it('returns [0] for a single node', () => {
    expect(traverseByNearestNeighbor([[0]])).toEqual([0])
  })

  it('returns [0,1] for two nodes', () => {
    expect(
      traverseByNearestNeighbor([
        [0, 2],
        [2, 0],
      ]),
    ).toEqual([0, 1])
  })
})

describe('twoOpt', () => {
  function tourLength(tour: number[], distribution: number[][]): number {
    let length = 0
    for (let index = 0; index < tour.length - 1; index++)
      length += distribution[tour[index]!]![tour[index + 1]!]!
    return length
  }

  it('improves a simple square tour', () => {
    const distribution = distributionMatrix([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ])
    // suboptimal tour (crossing edges): 0 > 1 > 3 > 2 > 0
    const tour = [0, 1, 3, 2, 0]
    const initialLength = tourLength(tour, distribution)
    const improvedTour = twoOpt([...tour], distribution)
    const improvedLength = tourLength(improvedTour, distribution)
    expect(improvedLength).toBeLessThan(initialLength)
    // optimal should be ~4.0 (square perimeter)
    expect(improvedLength).toBeCloseTo(4, 5)
  })

  it('leaves already optimal tour unchanged (or equivalent)', () => {
    const distribution = distributionMatrix([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ])
    const optimalTour = [0, 1, 2, 3, 0]
    const result = twoOpt([...optimalTour], distribution)
    expect(tourLength(result, distribution)).toBeCloseTo(
      tourLength(optimalTour, distribution),
      5,
    )
  })

  it('works with a triangle (minimal tour)', () => {
    const distribution = distributionMatrix([
      [0, 0],
      [1, 0],
      [0, 1],
    ])
    const tour = [0, 1, 2, 0]
    const result = twoOpt([...tour], distribution)
    // Should be same, as triangle has no crossing edges
    expect(result).toEqual(tour)
  })

  it('preserves the same set of nodes in the tour', () => {
    const points: [number, number][] = [
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ]
    const distribution = distributionMatrix(points)
    const tour = [0, 2, 1, 3, 0] // deliberately scrambled
    const result = twoOpt([...tour], distribution)
    // Same multiset of nodes
    expect([...result].sort()).toEqual([...tour].sort())
  })
})
