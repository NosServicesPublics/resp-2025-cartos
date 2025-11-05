import type { ServiceConfig } from '@/services/service-config'
import type { GeoData, MapRenderer, ServiceDataRow } from '@/types/service.types'
import * as Plot from '@observablehq/plot'
import { etablissementsSuperieursConfig } from '@/config/etablissements-superieurs'
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
 * Dot size = student count, dot color = year of creation
 */
export function createEtablissementsSuperieursRenderer(
  config: ServiceConfig,
): MapRenderer {
  return (geoData: GeoData, service: any) => {
    const renderConfig = config.rendering
    const metricKey = 'default'
    const metricConfig = renderConfig.colorSchemes[metricKey]

    if (!metricConfig) {
      throw new Error(`No color scheme configured for metric: ${metricKey}`)
    }

    const selectedSchemeKey = service.getSelectedEntry('colorScheme') || 'blues'
    const scheme = selectedSchemeKey === 'auto' ? 'blues' : selectedSchemeKey

    const plotTitle = renderConfig.titleTemplates.default as string
    const tabularData = service.filteredData

    // Parse geolocation and student count
    interface EnrichedPoint {
      coordinates: [number, number] | undefined
      studentCount: number
      year: number | null
      name: string
      commune: string
    }

    const enrichedData: EnrichedPoint[] = tabularData
      .map((row: ServiceDataRow) => {
        const geoStr = String(row.Géolocalisation || '')
        const coordinates = parseGeolocation(geoStr)

        // Get student count
        const studentStr = String(row['Effectif d\'étudiants inscrits'] || '0')
        const studentCount = Number.parseInt(studentStr, 10) || 0

        // Get year from date
        const dateValue = row['Date d\'ouverture']
        const year = renderConfig.numberNormalizer?.(dateValue) ?? null

        return {
          coordinates,
          studentCount,
          year,
          name: String(row.Implantation || 'Établissement inconnu'),
          commune: String(row.Commune || ''),
        }
      })
      .filter((row: EnrichedPoint) => row.coordinates !== undefined && row.studentCount > 0)

    // Create color scale config
    const colorScale: any = {
      type: 'threshold',
      domain: metricConfig.domain || [1950, 1970, 1980, 1990, 2000, 2010],
      scheme,
      clamp: metricConfig.clamp ?? true,
      label: metricConfig.label,
      legend: metricConfig.legend ?? true,
    }

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

    // Dots for establishments - use sqrt scale for area
    marks.push(
      Plot.dot(enrichedData, {
        x: d => d.coordinates![0],
        y: d => d.coordinates![1],
        r: d => Math.sqrt(d.studentCount / Math.PI) * 0.3, // Scale down for visibility
        fill: d => d.year,
        stroke: '#333333',
        strokeWidth: 0.5,
        fillOpacity: 0.7,
        title: d => `${d.name}\n${d.commune}\nAnnée: ${d.year || 'Inconnue'}\nÉtudiants: ${d.studentCount.toLocaleString('fr-FR')}`,
      }),
    )

    // Create the plot
    const plot = Plot.plot({
      title: plotTitle,
      projection: createFranceProjection() as any, // Custom composite projection
      marks,
      color: colorScale,
      width: 975,
      height: 610,
      style: {
        fontSize: '14px',
        fontFamily: 'system-ui, sans-serif',
      },
    })

    return plot
  }
}

/**
 * Create the etablissements-superieurs service with custom dot renderer
 */
export async function createEtablissementsSuperieursService(): Promise<{
  service: MapService
  renderer: MapRenderer
}> {
  // Create the service
  const service = new MapService({
    title: etablissementsSuperieursConfig.title,
    dataFile: etablissementsSuperieursConfig.dataFile,
    delimiter: ';', // CSV uses semicolon delimiter
    formControls: etablissementsSuperieursConfig.formControls,
    dataPreprocessor: etablissementsSuperieursConfig.dataPreprocessor,
  })
  service.serviceConfig = etablissementsSuperieursConfig

  // Create the custom renderer
  const renderer = createEtablissementsSuperieursRenderer(etablissementsSuperieursConfig)

  return { service, renderer }
}
