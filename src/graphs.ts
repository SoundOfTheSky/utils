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
