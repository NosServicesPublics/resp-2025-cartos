import type { ServiceConfig } from '@/services/service-config'
import type { GeoData, MapRenderer, ServiceDataRow } from '@/types/service.types'
import * as Plot from '@observablehq/plot'
import { principauxEtablissementsSuperieursConfig } from '@/config/principaux-etablissements-superieurs'
import { createFranceProjection } from '@/services/custom-projection'
import MapService from '@/services/map-service'

/**
 * Parse geolocation string to [longitude, latitude]
 * Format in CSV: "latitude, longitude"
 * Returns: [longitude, latitude] for GeoJSON convention
 */
function parseGeolocation(geoStr: string): [number, number] | null {
  if (!geoStr || geoStr.trim() === '')
    return null

  const parts = geoStr.split(',').map(s => s.trim())
  if (parts.length !== 2)
    return null

  const lat = Number.parseFloat(parts[0] || '0')
  const lon = Number.parseFloat(parts[1] || '0')

  if (Number.isNaN(lat) || Number.isNaN(lon))
    return null

  // Return as [longitude, latitude] for GeoJSON convention
  return [lon, lat]
}

/**
 * Creates a renderer for establishments using dot marks
 * Dot size = student count, faceted by generation
 */
export function createPrincipauxEtablissementsSuperieursRenderer(
  config: ServiceConfig,
): MapRenderer {
  return (geoData: GeoData, service: any) => {
    const renderConfig = config.rendering
    const metricKey = 'default'
    const metricConfig = renderConfig.colorSchemes[metricKey]

    if (!metricConfig) {
      throw new Error(`No color scheme configured for metric: ${metricKey}`)
    }

    const plotTitle = renderConfig.titleTemplates.default as string
    const tabularData = service.filteredData

    // Parse geolocation and student count
    interface EnrichedPoint {
      coordinates: [number, number] | undefined
      studentCount: number
      year: number | null
      generation: string
      name: string
      commune: string
    }

    const enrichedData: EnrichedPoint[] = tabularData
      .map((row: ServiceDataRow) => {
        const geoStr = String(row.géolocalisation || '')
        const coordinates = parseGeolocation(geoStr)

        // Get student count from last available year (2022-23)
        const studentStr = String(row['Effectifs d\'étudiants inscrits 2022-23'] || '0')
        const studentCount = Number.parseInt(studentStr, 10) || 0

        // Get year from date
        const dateValue = row.date_creation
        const year = renderConfig.numberNormalizer?.(dateValue) ?? null

        // Determine generation based on year
        let generation = 'Autres'
        if (year !== null && typeof year === 'number') {
          if (year >= 1960 && year < 1980) {
            generation = '1ère génération de campus de 1960 à 1980'
          }
          else if (year >= 1980 && year < 1990) {
            generation = '2e génération de campus de 1980 à 1990'
          }
          else if (year >= 2000 && year < 2020) {
            generation = '3e génération de campus de 2000 à 2020'
          }
        }

        return {
          coordinates,
          studentCount,
          year,
          generation,
          name: String(row.libellé || 'Établissement inconnu'),
          commune: String(row.Commune || ''),
        }
      })
      .filter((row: EnrichedPoint) => row.coordinates !== undefined && row.studentCount > 0 && row.generation !== 'Autres')

    // Build plot marks
    const marks: any[] = []

    // Background (sea/land)
    if (geoData.backgroundGeometry) {
      marks.push(
        Plot.geo(geoData.backgroundGeometry, {
          fill: '#f0f0f0',
          stroke: 'none',
        }),
      )
    }

    // Region boundaries (overlay meshes)
    if (geoData.overlayMeshes && geoData.overlayMeshes.length > 0) {
      for (const mesh of geoData.overlayMeshes) {
        marks.push(
          Plot.geo(mesh.geo, {
            stroke: mesh.stroke || '#999999',
            strokeWidth: mesh.strokeWidth || 0.5,
            fill: 'none',
          }),
        )
      }
    }

    // France outline
    if (geoData.outlineGeometry) {
      marks.push(
        Plot.geo(geoData.outlineGeometry, {
          stroke: '#333333',
          strokeWidth: 1.5,
          fill: 'none',
        }),
      )
    }

    // Circles for establishments (individual dots)
    marks.push(
      Plot.dot(enrichedData, {
        x: (d: EnrichedPoint) => d.coordinates![0],
        y: (d: EnrichedPoint) => d.coordinates![1],
        fy: (d: EnrichedPoint) => d.generation,
        r: (d: EnrichedPoint) => Math.sqrt(d.studentCount),
        fill: '#4682b4',
        stroke: '#333333',
        strokeWidth: 0.5,
        fillOpacity: 0.7,
      }),
    )

    // Add fy axis on the right side
    marks.push(
      Plot.axisFy({ anchor: 'right', label: null, textAnchor: 'end' }),
    )

    // Create the plot
    const plot = Plot.plot({
      title: plotTitle,
      projection: createFranceProjection() as any, // Custom composite projection
      fy: {
        domain: ['1ère génération de campus de 1960 à 1980', '2e génération de campus de 1980 à 1990', '3e génération de campus de 2000 à 2020'],
        label: null,
      },
      r: {
        range: [2, 15], // Min and max radius for circles based on student count
      },
      marks,
      width: 975,
      height: 1830, // 610 * 3 for three vertical facets
      marginTop: 10,
      marginBottom: 10,
      style: {
        fontSize: '14px',
        fontFamily: 'system-ui, sans-serif',
      },
    })

    return plot
  }
}

/**
 * Create the principaux-etablissements-superieurs service with custom dot renderer
 */
export async function createPrincipauxEtablissementsSuperieursService(): Promise<{
  service: MapService
  renderer: MapRenderer
}> {
  // Create the service
  const service = new MapService({
    title: principauxEtablissementsSuperieursConfig.title,
    dataFile: principauxEtablissementsSuperieursConfig.dataFile,
    delimiter: ';', // CSV uses semicolon delimiter
    formControls: principauxEtablissementsSuperieursConfig.formControls,
    dataPreprocessor: principauxEtablissementsSuperieursConfig.dataPreprocessor,
  })
  service.serviceConfig = principauxEtablissementsSuperieursConfig

  // Create the custom renderer
  const renderer = createPrincipauxEtablissementsSuperieursRenderer(principauxEtablissementsSuperieursConfig)

  return { service, renderer }
}
