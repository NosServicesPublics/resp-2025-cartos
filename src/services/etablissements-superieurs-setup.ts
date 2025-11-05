import type { ServiceConfig } from '@/services/service-config'
import type { GeoData, MapRenderer, ServiceDataRow } from '@/types/service.types'
import * as Plot from '@observablehq/plot'
import * as d3 from 'd3'
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
 * Aggregate establishments by department
 */
interface DepartmentAggregate {
  departmentCode: string
  departmentName: string
  studentCount: number
  establishmentCount: number
  avgYear: number | null
  establishments: Array<{ name: string, year: number | null, students: number }>
}

function aggregateByDepartment(
  points: Array<{ coordinates: [number, number], studentCount: number, year: number | null, name: string, commune: string, departmentCode: string, departmentName: string }>,
): DepartmentAggregate[] {
  const departmentMap = new Map<string, DepartmentAggregate>()

  for (const point of points) {
    const deptCode = point.departmentCode

    if (!departmentMap.has(deptCode)) {
      departmentMap.set(deptCode, {
        departmentCode: deptCode,
        departmentName: point.departmentName,
        studentCount: 0,
        establishmentCount: 0,
        avgYear: null,
        establishments: [],
      })
    }

    const dept = departmentMap.get(deptCode)!
    dept.studentCount += point.studentCount
    dept.establishmentCount += 1
    dept.establishments.push({
      name: point.name,
      year: point.year,
      students: point.studentCount,
    })

    // Update average year
    if (point.year !== null) {
      if (dept.avgYear === null) {
        dept.avgYear = point.year
      }
      else {
        const totalYears = dept.avgYear * (dept.establishmentCount - 1) + point.year
        dept.avgYear = Math.round(totalYears / dept.establishmentCount)
      }
    }
  }

  return Array.from(departmentMap.values())
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
      departmentCode: string
      departmentName: string
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
          departmentCode: String(row['Code département'] || ''),
          departmentName: String(row.Département || ''),
        }
      })
      .filter((row: EnrichedPoint) => row.coordinates !== undefined && row.studentCount > 0 && row.departmentCode !== '')

    // Aggregate by department
    const departmentData = aggregateByDepartment(
      enrichedData.map(d => ({
        coordinates: d.coordinates!,
        studentCount: d.studentCount,
        year: d.year,
        name: d.name,
        commune: d.commune,
        departmentCode: d.departmentCode,
        departmentName: d.departmentName,
      })),
    )

    // Calculate department centroids from GeoJSON
    interface DepartmentPoint {
      lon: number
      lat: number
      departmentCode: string
      departmentName: string
      studentCount: number
      establishmentCount: number
      avgYear: number | null
      establishments: Array<{ name: string, year: number | null, students: number }>
    }

    const departmentPoints: DepartmentPoint[] = []

    console.log('Department data count:', departmentData.length)
    console.log('Sample department codes:', departmentData.slice(0, 5).map(d => d.departmentCode))
    console.log('GeoJSON feature codes:', geoData.featureCollection.features.slice(0, 5).map(f => f.properties?.INSEE_DEP || f.properties?.code))

    for (const dept of departmentData) {
      // Remove the "D" prefix from department codes in the CSV
      const cleanCode = dept.departmentCode.replace(/^D/, '')
      // Remove leading zeros to normalize (080 -> 80, 004 -> 4)
      const normalizedCode = cleanCode.replace(/^0+/, '') || '0'

      // Find the corresponding GeoJSON feature - try multiple matching strategies
      const feature = geoData.featureCollection.features.find((f) => {
        const geoCode = String(f.properties?.INSEE_DEP || f.properties?.code || '')
        const normalizedGeoCode = geoCode.replace(/^0+/, '') || '0'

        // Try normalized match (without leading zeros) and exact match
        return normalizedGeoCode === normalizedCode
          || geoCode === cleanCode
          || geoCode === normalizedCode
      })

      if (feature) {
        // Calculate centroid using d3
        const centroid = d3.geoCentroid(feature)

        departmentPoints.push({
          lon: centroid[0],
          lat: centroid[1],
          departmentCode: dept.departmentCode,
          departmentName: dept.departmentName,
          studentCount: dept.studentCount,
          establishmentCount: dept.establishmentCount,
          avgYear: dept.avgYear,
          establishments: dept.establishments,
        })
      }
      else {
        console.log('No feature found for department:', dept.departmentCode, cleanCode, normalizedCode, dept.departmentName)
      }
    }

    console.log('Department points with coordinates:', departmentPoints.length)

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

    // Log department points data
    console.log('Rendering department points:', departmentPoints.length)
    if (departmentPoints.length > 0) {
      console.log('Sample point:', departmentPoints[0])
      console.log('Student counts:', departmentPoints.map(d => d.studentCount).slice(0, 10))
    }

    // Dots for departments
    marks.push(
      Plot.dot(departmentPoints, {
        x: d => d.lon,
        y: d => d.lat,
        r: d => Math.max(3, Math.sqrt(d.studentCount / Math.PI) * 0.5), // Minimum radius of 3px
        fill: d => d.avgYear,
        stroke: '#333333',
        strokeWidth: 1,
        fillOpacity: 0.8,
        title: (d: DepartmentPoint) => {
          const header = `${d.departmentName} (${d.departmentCode})`
          const countInfo = `\n${d.establishmentCount} établissement${d.establishmentCount > 1 ? 's' : ''}`
          const yearInfo = d.avgYear ? `\nAnnée moyenne: ${d.avgYear}` : ''
          const studentInfo = `\nÉtudiants: ${d.studentCount.toLocaleString('fr-FR')}`
          const topEstablishments = d.establishments
            .sort((a: { students: number }, b: { students: number }) => b.students - a.students)
            .slice(0, 5)
          const namesList = topEstablishments.length > 0
            ? `\n\nPrincipaux établissements:\n${topEstablishments.map((e: { name: string, students: number }) => `${e.name} (${e.students.toLocaleString('fr-FR')} étudiants)`).join('\n')}${d.establishments.length > 5 ? `\n... et ${d.establishments.length - 5} autres` : ''}`
            : ''
          return `${header}${countInfo}${yearInfo}${studentInfo}${namesList}`
        },
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
