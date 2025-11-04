import type MapService from '@/services/map-service'
import type { ServiceConfig } from '@/services/service-config'
import type { GeoData, MapRenderer, ServiceDataRow } from '@/types/service.types'
import { getDivergingSchemeByIndices } from '@/config/color-schemes'
import { renderProportionalCircles } from '@/rendering/render-proportional-circles'
import { defaultFeatureKey } from '@/services/service-config'

/**
 * Creates a renderer for the variation-population service using proportional circles
 * @param config Service configuration
 * @param populationData Map of department codes to population values
 */
export function createProportionalCircleVariationRenderer(
  config: ServiceConfig,
  populationData: Map<string, number>,
): MapRenderer {
  return (geoData: GeoData, service: MapService) => {
    // Use pre-loaded population data
    const populationMap = populationData

    const renderConfig = config.rendering
    const metricKey = 'default'
    const metricConfig = renderConfig.colorSchemes[metricKey]

    if (!metricConfig) {
      throw new Error(`No color scheme configured for metric: ${metricKey}`)
    }

    const selectedSchemeKey = service.getSelectedEntry('colorScheme')

    // Get custom range with manual color indices
    let customRange: string[] | undefined
    if (selectedSchemeKey && selectedSchemeKey !== 'auto' && metricConfig.colorIndices) {
      customRange = getDivergingSchemeByIndices(selectedSchemeKey, metricConfig.colorIndices)
    }

    // Determine outline color (neutral dark gray for diverging)
    const outlineStrokeValue = '#333333'

    // Generate title
    const titleTemplate = renderConfig.titleTemplates.default as string
    const plotTitle = titleTemplate

    // Get processed data
    const tabularData = service.filteredData

    // Enrich data with population
    const enrichedData = tabularData.map((row) => {
      const dep = String(row[renderConfig.dataKeys.rowKey])
      const population = populationMap.get(dep) || 0

      return {
        ...row,
        population: String(population), // Keep as string for ServiceDataRow type
      }
    })

    // Create value accessor (variation)
    const valueAccessor = (row: ServiceDataRow) => {
      const columnName = renderConfig.dataKeys.valueColumn || 'value'
      return row[columnName]
    }

    // Create size accessor (population)
    const sizeAccessor = (row: ServiceDataRow) => {
      return row.population
    }

    // Create row key accessor - pad to match GeoJSON format
    const rowKeyAccessor = (row: ServiceDataRow) => {
      const keyValue = row[renderConfig.dataKeys.rowKey]
      return String(keyValue).toUpperCase().padStart(2, '0')
    }

    // Create feature key accessor
    const featureKeyAccessor = renderConfig.dataKeys.featureKey === 'default'
      ? defaultFeatureKey
      : (f: any) => {
          const keyValue = f.properties?.[renderConfig.dataKeys.featureKey]
          return String(keyValue).toUpperCase().padStart(2, '0')
        }

    // Create number normalizer
    const numberNormalizer = renderConfig.numberNormalizer || ((v: any) => {
      return v == null ? null : +String(v).replace(',', '.')
    })

    // Create color scale config
    const colorScale = {
      legend: metricConfig.legend ?? true,
      type: 'threshold' as const,
      ...(customRange ? { range: customRange } : { scheme: metricConfig.scheme }),
      percent: metricConfig.percent,
      label: metricConfig.label,
      clamp: metricConfig.clamp,
      ...(metricConfig.domain && Array.isArray(metricConfig.domain)
        ? { domain: metricConfig.domain }
        : {}),
      colorIndices: metricConfig.colorIndices,
    }

    // Create tooltip builder
    const titleBuilder = (feature: any, value: number | null, row?: ServiceDataRow) => {
      const name = feature.properties?.NOM || feature.properties?.NAME || 'Unknown'
      const dep = feature.properties?.INSEE_DEP || feature.properties?.code || '??'

      if (value === null || !row) {
        return `${name} (${dep}): Pas de données`
      }

      const populationStr = row.population || '0'
      const populationNum = Number(populationStr)
      const formattedPop = new Intl.NumberFormat('fr-FR').format(populationNum)
      const formattedValue = metricConfig.percent
        ? `${value.toFixed(1)}%`
        : value.toFixed(2)

      return `${name} (${dep})\nVariation: ${formattedValue}\nPopulation: ${formattedPop}`
    }

    return renderProportionalCircles({
      plotTitle,
      tabularData: enrichedData,
      featureCollection: geoData.featureCollection,
      rowKey: rowKeyAccessor,
      featureKey: featureKeyAccessor,
      valueAccessor,
      sizeAccessor,
      numberNormalizer,
      colorScale,
      titleBuilder,
      sizeLabel: 'Population',
      sizeRange: [1, 20], // Radius range in pixels - smaller circles
      outlineStroke: outlineStrokeValue,
      outlineStrokeWidth: 0.5,
      includeTooltips: true,
      showLegend: true,
      overlayMeshes: geoData.overlayMeshes, // Region boundaries
      backgroundGeometry: geoData.backgroundGeometry, // Background (sea/land)
      outlineGeometry: geoData.outlineGeometry, // France's contour
    })
  }
}
