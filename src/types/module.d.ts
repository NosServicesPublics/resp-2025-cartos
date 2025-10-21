declare module 'topojson-simplify' {
  import type { Topology } from 'topojson-specification'

  export function presimplify(topology: Topology, weight?: (arc: any) => number): Topology
  export function simplify(topology: Topology, threshold?: number): Topology
  export function quantile(topology: Topology, p: number): number
}
