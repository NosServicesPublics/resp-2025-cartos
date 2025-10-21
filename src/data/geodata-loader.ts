import type { GeoData } from '@/types/service.types'
import * as d3 from 'd3'
import * as topojson from '@/data/topojson'

export type GeoDataResult = GeoData

// Note: These functions may need proper topojson-specific packages for full typing
function simplifyTopojson(data: any, quantile: number = 0.01): any {
  const presimplifiedData = topojson.presimplify(data)
  const simplifiedData = topojson.simplify(presimplifiedData, topojson.quantile(presimplifiedData, quantile))
  return simplifiedData
}

export async function loadDepartementsData(): Promise<GeoDataResult> {
  const rawData = await d3.json(`${import.meta.env.BASE_URL}data/departements.json`)
  const departementsData = simplifyTopojson(rawData, 0.075)

  const departementsFeatures = topojson.feature(departementsData, departementsData.objects['departements-light'])

  // const departementsMesh = topojson.mesh(departementsData, departementsData.objects['departements-light'])

  const departementsInnerMesh = topojson.mesh(departementsData, departementsData.objects['departements-light'], (a: any, b: any) => a !== b)

  const departementsOuterMesh = topojson.mesh(departementsData, departementsData.objects['departements-light'], (a: any, b: any) => a === b)

  const regionCodeKey = 'INSEE_REG'

  // const departementsRegionMesh = topojson.mesh(departementsData, aggregatedRegionsFeatures.features)

  const departementsRegionMesh = topojson.mesh(
    departementsData,
    departementsData.objects['departements-light'],
    (a: any, b: any) => {
      return a.properties[regionCodeKey] !== b.properties[regionCodeKey]
    },
  )
  return {
    featureCollection: departementsFeatures as any,
    backgroundGeometry: departementsOuterMesh,
    overlayMeshes: [
      { geo: departementsInnerMesh, strokeWidth: 0.5 },
      { geo: departementsRegionMesh, strokeWidth: 1 },
    ],
    outlineGeometry: departementsOuterMesh,
  }
}
