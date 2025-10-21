import * as topojson from 'topojson-client'
import * as topojsonSimplify from 'topojson-simplify'

// Re-exporting topojson functions for use in other parts of the application
export const {
  feature,
  merge,
  mergeArcs,
  mesh,
} = topojson

export const {
  presimplify,
  simplify,
  quantile,
} = topojsonSimplify
