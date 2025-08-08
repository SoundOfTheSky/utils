import { pushToSorted } from './arrays'

type AStarNode<T> = {
  /** Pos */
  d: T
  /** Weight */
  g: number
  /** Heuristic */
  h: number
}

/**
 * Unfold pathfinding result to path array.
 */
export function unfoldPathfindingResult<T>({
  target,
  parents,
}: {
  parents: Map<T, T>
  target?: T
}): T[] {
  let node = target
  const path = []
  while (node) {
    path.push(node)
    node = parents.get(node)
  }
  return path.reverse()
}

/**
 * Pathfind using aStar.
 * Returns a target and map of parents.
 * You can use `unfoldPathfindingResult()` to get array of nodes.
 */
export function aStar<T>(options: {
  /** Start node */
  start: T
  /** Get weight of node */
  getWeight: (node: T) => number
  /** Presumed cost of going to the target from node */
  heuristic: (node: T) => number
  /** Get neighbors of node */
  getNeighbors: (node: T) => T[]
  /** Check if node is a target */
  isTarget: (node: T) => boolean
}): {
  parents: Map<T, T>
  target?: T
} {
  const parents = new Map<T, T>()
  const queue: AStarNode<T>[] = [
    {
      d: options.start,
      g: 0,
      h: options.heuristic(options.start),
    },
  ]
  while (queue.length > 0) {
    const node = queue.pop()!
    if (options.isTarget(node.d))
      return {
        parents,
        target: node.d,
      }
    const neighbors = options.getNeighbors(node.d)
    for (let index = 0; index < neighbors.length; index++) {
      const neighbor = neighbors[index]!
      if (options.start === neighbor || parents.has(neighbor)) continue
      parents.set(neighbor, node.d)
      const neighborNode: AStarNode<T> = {
        d: neighbor,
        g: node.g + options.getWeight(neighbor),
        h: options.heuristic(neighbor),
      }
      neighborNode.h += node.g
      pushToSorted(queue, neighborNode, (x) => neighborNode.h - x.h)
    }
  }
  return {
    parents,
  }
}

/**
 * Breadth-first search. Slower than dfs.
 * If isTarget is omitted becomes floodfill.
 * Returns a target and map of parents.
 * You can use `unfoldPathfindingResult()` to get array of nodes.
 */
export function bfs<T>(options: {
  /** Start node */
  start: T
  /** Get neighbors of node */
  getNeighbors: (parent: T) => T[]
  /** Check if node is a target */
  isTarget?: (child: T, parent: T) => boolean
}): {
  parents: Map<T, T>
  target?: T
} {
  const queue: T[] = [options.start]
  const parents = new Map<T, T>()
  for (let index = 0; index < queue.length; index++) {
    const parent = queue[index]!
    const neighbors = options.getNeighbors(parent)
    for (let index = 0; index < neighbors.length; index++) {
      const neighbor = neighbors[index]!
      if (neighbor === options.start || parents.has(neighbor)) continue
      parents.set(neighbor, parent)
      if (options.isTarget?.(neighbor, parent))
        return {
          target: neighbor,
          parents,
        }
      queue.push(neighbor)
    }
  }
  return {
    parents,
  }
}

/**
 * Depth-first search. Faster than bfs.
 * If isTarget is omitted becomes floodfill.
 * Returns a target and map of parents.
 * You can use `unfoldPathfindingResult()` to get array of nodes.
 */
export function dfs<T>(options: {
  /** Start node */
  start: T
  /** Get neighbors of node */
  getNeighbors: (parent: T) => T[]
  /** Check if node is a target */
  isTarget?: (child: T, parent: T) => boolean
}): {
  parents: Map<T, T>
  target?: T
} {
  const queue: T[] = [options.start]
  const parents = new Map<T, T>()
  while (queue.length > 0) {
    const node = queue.pop()!
    const neighbors = options.getNeighbors(node)
    for (let index = 0; index < neighbors.length; index++) {
      const neighbor = neighbors[index]!
      if (neighbor === options.start || parents.has(neighbor)) continue
      parents.set(neighbor, node)
      if (options.isTarget?.(neighbor, node))
        return {
          target: neighbor,
          parents,
        }
      queue.push(neighbor)
    }
  }
  return {
    parents,
  }
}

/** Knapsack find best way to get maximum value in limited capacity */
export function knapsack(
  weights: number[],
  values: number[],
  capacity: number,
) {
  const n = weights.length
  const dp = Array.from(
    { length: n + 1 },
    () => new Array(capacity + 1).fill(0) as number[],
  )
  for (let index = 1; index <= n; index++) {
    const w = weights[index - 1]!
    const v = values[index - 1]!
    const dpc = dp[index]!
    const dpl = dp[index - 1]!
    for (let c = 0; c <= capacity; c++)
      dpc[c] = w > c ? dpl[c]! : Math.max(dpl[c]!, dpl[c - w]! + v)
  }

  const items: number[] = []
  let c = capacity
  for (let index = n; index > 0 && c > 0; index--) {
    if (dp[index]![c] !== dp[index - 1]![c]) {
      items.push(index - 1)
      c -= weights[index - 1]!
    }
  }

  return { weight: dp[n]![capacity]!, items: items.reverse() }
}

/**
 * Find min path between points. You need to supply 2-dim array
 * where first index is a point and second index is a distance from this point to another.
 * Put infinity if where are no path. Returns cycle (start and end at the same point)
 * Original: https://github.com/qntm/held-karp
 */
export function tspHeldKarp(distribution: number[][]) {
  const n = distribution.length
  if (n === 1) return { distance: 0, path: [0, 0] }
  const all = (1 << (n - 1)) - 1
  const length = new Float64Array((1 << (n - 1)) * (n - 1))
  const previous = new Uint8Array((1 << (n - 1)) * (n - 1))
  let S = 0
  do {
    S++
    let v = n - 1
    do {
      v--
      const S2 = S ^ (1 << v)
      if (S2 < S) {
        let bestL = 0
        let bestU = 0
        if (S2) {
          bestL = Infinity
          let u = n - 1
          do {
            u--
            if (S2 & (1 << u)) {
              const l = length[(n - 1) * S2 + u]! + distribution[u]![v]!
              if (l <= bestL) {
                bestL = l
                bestU = u
              }
            }
          } while (u)
        } else {
          bestL = distribution[n - 1]![v]!
          bestU = n - 1
        }
        length[(n - 1) * S + v] = bestL
        previous[(n - 1) * S + v] = bestU
      }
    } while (v)
  } while (S < all)

  let bestL = Infinity
  let bestU = -1
  let u = n - 1
  do {
    u--
    const l = length[(n - 1) * all + u]! + distribution[u]![n - 1]!
    if (l <= bestL) {
      bestL = l
      bestU = u
    }
  } while (u)

  const cycle = [n - 1]
  u = bestU
  S = all
  while (u !== n - 1) {
    cycle.unshift(u)
    const S2 = S ^ (1 << u)
    u = previous[(n - 1) * S + u]!
    S = S2
  }

  const index = cycle.indexOf(0)
  return {
    distance: cycle.reduce(
      (accumulator, u, index_, cycle) =>
        accumulator +
        distribution[u]![cycle[index_ + 1 in cycle ? index_ + 1 : 0]!]!,
      0,
    ),
    path: [...cycle.slice(index), ...cycle.slice(0, index), 0],
  }
}

/**
 * Look for description of `tspHeldKarp`.
 * Returns path without cycle
 */
export function tspHeldKarpPath(d: number[][]) {
  const { distance, path } = tspHeldKarp([
    [0, ...(new Array(d.length).fill(0) as number[])],
    ...d.map((d2) => [0, ...d2]),
  ])
  return { distance, path: path.slice(1, -1).map((u) => u - 1) }
}
