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

export async function loadAcademiesData(): Promise<GeoDataResult> {
  const rawData = await d3.json(`${import.meta.env.BASE_URL}data/academies-light.json`)
  const academiesData = simplifyTopojson(rawData, 0.5)

  const academiesFeatures = topojson.feature(academiesData, academiesData.objects['fr-en-contour-academies-2020'])

  const academiesInnerMesh = topojson.mesh(academiesData, academiesData.objects['fr-en-contour-academies-2020'], (a: any, b: any) => a !== b)

  const academiesOuterMesh = topojson.mesh(academiesData, academiesData.objects['fr-en-contour-academies-2020'], (a: any, b: any) => a === b)

  const regionCodeKey = 'code_region_2016'

  const academiesRegionMesh = topojson.mesh(
    academiesData,
    academiesData.objects['fr-en-contour-academies-2020'],
    (a: any, b: any) => {
      return a.properties[regionCodeKey] !== b.properties[regionCodeKey]
    },
  )

  return {
    featureCollection: academiesFeatures as any,
    backgroundGeometry: academiesOuterMesh,
    overlayMeshes: [
      { geo: academiesInnerMesh, strokeWidth: 0.5 },
      { geo: academiesRegionMesh, strokeWidth: 1 },
    ],
    outlineGeometry: academiesOuterMesh,
  }
}

export async function loadEpciData(): Promise<GeoDataResult> {
  const rawData = await d3.json(`${import.meta.env.BASE_URL}data/epci-light.json`)
  const epciData = simplifyTopojson(rawData, 0.075)

  const epciFeatures = topojson.feature(epciData, epciData.objects['epci-light'])

  const epciInnerMesh = topojson.mesh(epciData, epciData.objects['epci-light'], (a: any, b: any) => a !== b)

  const epciOuterMesh = topojson.mesh(epciData, epciData.objects['epci-light'], (a: any, b: any) => a === b)

  return {
    featureCollection: epciFeatures as any,
    backgroundGeometry: epciOuterMesh,
    overlayMeshes: [
      { geo: epciInnerMesh, strokeWidth: 0.5 },
    ],
    outlineGeometry: epciOuterMesh,
  }
}
