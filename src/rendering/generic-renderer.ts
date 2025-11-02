import type MapService from '@/services/map-service'
import type { ServiceConfig, ServiceRenderConfig } from '@/services/service-config'
import type { GeoData, MapRenderer, ServiceDataRow } from '@/types/service.types'
import {
  interpolateCividis,
  interpolateMagma,
  interpolatePlasma,
  interpolateViridis,
  schemeBlues,
  schemeBrBG,
  schemeBuGn,
  schemeBuPu,
  schemeGnBu,
  schemeGreens,
  schemeGreys,
  schemeOranges,
  schemeOrRd,
  schemePiYG,
  schemePRGn,
  schemePuBu,
  schemePuBuGn,
  schemePuRd,
  schemePurples,
  schemeRdBu,
  schemeRdGy,
  schemeRdPu,
  schemeRdYlBu,
  schemeRdYlGn,
  schemeReds,
  schemeSpectral,
  schemeYlGn,
  schemeYlGnBu,
  schemeYlOrBr,
  schemeYlOrRd,
} from 'd3'
import { CUSTOM_COLOR_SCHEMES, DIVERGING_COLOR_SCHEMES, FULL_COLOR_SCALES } from '@/config/color-schemes'
import { renderChoropleth } from '@/rendering/render-choropleth'
import { defaultFeatureKey, defaultNumberNormalizer, getTitleTemplate, interpolateTitle } from '@/services/service-config'

/**
 * Creates a generic renderer function from service configuration
 */
export function createServiceRenderer(config: ServiceConfig): MapRenderer {
  return (geoData: GeoData, service: MapService) => {
    const renderConfig = config.rendering

    // Get current selections
    const facilityLabel = service.getSelectedEntryLabel('facility') || '-'
    const metricKey = service.getSelectedEntry('metric') || ''
    const metricConfig = renderConfig.colorSchemes[metricKey]

    if (!metricConfig) {
      throw new Error(`No color scheme configured for metric: ${metricKey}`)
    }

    const selectedSchemeKey = service.getSelectedEntry('colorScheme')

    // Check if diverging scheme is selected
    const isDivergingScheme = selectedSchemeKey && DIVERGING_COLOR_SCHEMES[selectedSchemeKey]
    const customRange = selectedSchemeKey && selectedSchemeKey !== 'auto'
      ? (DIVERGING_COLOR_SCHEMES[selectedSchemeKey] ?? CUSTOM_COLOR_SCHEMES[selectedSchemeKey] ?? undefined)
      : undefined

    const resolvedScheme = !selectedSchemeKey || selectedSchemeKey === 'auto' || customRange
      ? metricConfig.scheme
      : selectedSchemeKey

    const palette = customRange ?? getPaletteForScheme(resolvedScheme)

    // Determine outline/text color:
    // - For diverging scales: use neutral dark gray
    // - For sequential custom scales: use darker color from full scale (index 16)
    // - For sequential D3 schemes: use darkest from palette
    let outlineStrokeValue = '#222'
    if (isDivergingScheme || metricConfig.type === 'diverging') {
      outlineStrokeValue = '#333333' // neutral dark gray for diverging
    }
    else if (selectedSchemeKey && selectedSchemeKey !== 'auto' && CUSTOM_COLOR_SCHEMES[selectedSchemeKey]) {
      // For custom sequential schemes, use index 16 from the full scale
      const fullScale = (FULL_COLOR_SCALES as any)[selectedSchemeKey]
      outlineStrokeValue = fullScale?.[18] ?? palette?.[palette.length - 1] ?? '#222'
    }
    else {
      outlineStrokeValue = palette?.[palette.length - 1] ?? '#222'
    } // Generate title
    const facilityKey = service.getSelectedEntry('facility') || ''
    const titleTemplate = getTitleTemplate(renderConfig.titleTemplates, metricKey, facilityKey)
    if (!titleTemplate) {
      throw new Error(`No title template configured for metric: ${metricKey}`)
    }

    const plotTitle = interpolateTitle(titleTemplate, facilityLabel, metricKey, metricConfig.label)

    // Get processed data
    const tabularData = service.filteredData

    // Create value accessor
    const valueAccessor = renderConfig.valueProcessor
      ? (row: ServiceDataRow) => renderConfig.valueProcessor!(row, metricKey)
      : (row: ServiceDataRow) => row[metricKey]

    // Create row key accessor
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
    const numberNormalizer = renderConfig.numberNormalizer || defaultNumberNormalizer

    // Create color scale config
    const colorScale = {
      legend: metricConfig.legend ?? true,
      // Map metric type to Plot scale type: 'diverging' → 'threshold' for custom schemes or quantized diverging
      type: isDivergingScheme ? 'threshold' : (metricConfig.type === 'diverging' ? 'threshold' : (metricConfig.type || 'quantize')),
      ...(customRange ? { range: customRange } : { scheme: resolvedScheme }),
      percent: metricConfig.percent,
      label: metricConfig.label,
      ...(metricConfig.domain && Array.isArray(metricConfig.domain) && metricConfig.domain.length === 2
        ? { domain: metricConfig.domain as [number, number] }
        : {}),
      // Flag for diverging scales to calculate symmetric domain
      ...((isDivergingScheme || metricConfig.type === 'diverging') && !metricConfig.domain ? { _needsDivergingDomain: true } : {}),
    }

    // Create tooltip builder
    const titleBuilder = createTooltipBuilder(
      renderConfig.tooltip,
      facilityLabel,
      metricKey,
      metricConfig,
      numberNormalizer,
      renderConfig.colorSchemes,
    )

    return renderChoropleth({
      plotTitle,
      tabularData,
      featureCollection: geoData.featureCollection,
      featureKey: featureKeyAccessor,
      rowKey: rowKeyAccessor,
      valueAccessor,
      numberNormalizer,
      colorScale,
      backgroundGeometry: geoData.backgroundGeometry,
      overlayMeshes: geoData.overlayMeshes,
      outlineGeometry: geoData.outlineGeometry,
      outlineStroke: outlineStrokeValue,
      outlineStrokeWidth: 1.25,
      titleBuilder,
    })
  }
}

/**
 * Creates a tooltip builder function from configuration
 */
function createTooltipBuilder(
  tooltipConfig: ServiceRenderConfig['tooltip'],
  facilityLabel: string,
  currentMetric: string,
  currentMetricConfig: any,
  numberNormalizer: (value: any) => number | null,
  allMetricConfigs: Record<string, any>,
) {
  return (feature: any, value: number | null, row?: ServiceDataRow) => {
    const name = feature.properties?.NOM ?? feature.properties?.nom ?? row?.DEP ?? '—'

    if (tooltipConfig.template === 'dual-metric') {
      // Special handling for dual-metric tooltips (like couverture)
      const vMain = value == null ? '—' : formatValue(value, currentMetricConfig)

      if (tooltipConfig.includeSecondaryMetric && row) {
        const otherMetricKeys = Object.keys(allMetricConfigs).filter(k => k !== currentMetric)
        const otherMetric = otherMetricKeys[0]

        if (otherMetric && allMetricConfigs[otherMetric]) {
          const otherConfig = allMetricConfigs[otherMetric]
          const vOther = row[otherMetric] != null
            ? formatValue(numberNormalizer(row[otherMetric]) ?? 0, otherConfig)
            : '—'

          return `${name}\n${facilityLabel}\n${currentMetricConfig.label}: ${vMain}\n${otherConfig.label}: ${vOther}`
        }
      }

      return `${name}\n${facilityLabel}\n${currentMetricConfig.label}: ${vMain}`
    }

    // Default single-metric tooltip
    const formattedValue = value == null ? '—' : formatValue(value, currentMetricConfig)
    return `${name}\n${currentMetricConfig.label}: ${formattedValue}`
  }
}

/**
 * Formats a value according to metric configuration
 */
function formatValue(value: number, metricConfig: any): string {
  if (metricConfig.percent) {
    return `${(value * 100).toFixed(1)} %`
  }

  // Check if it looks like duration in minutes
  if (metricConfig.label.toLowerCase().includes('min') || metricConfig.label.toLowerCase().includes('durée')) {
    return `${value.toFixed(1)} min`
  }

  return value.toFixed(1)
}

function getPaletteForScheme(scheme?: string): string[] | undefined {
  console.log('scheme :', scheme)
  if (!scheme) {
    return undefined
  }

  const normalized = scheme.toLowerCase()

  // Single-hue schemes (9 colors)
  const singleHueLookup: Record<string, readonly string[]> = {
    blues: schemeBlues[9]!,
    greens: schemeGreens[9]!,
    reds: schemeReds[9]!,
    oranges: schemeOranges[9]!,
    purples: schemePurples[9]!,
    greys: schemeGreys[9]!,
    buGn: schemeBuGn[9]!,
    bupu: schemeBuPu[9]!,
    gnbu: schemeGnBu[9]!,
    orrd: schemeOrRd[9]!,
    pubu: schemePuBu[9]!,
    pubugn: schemePuBuGn[9]!,
    purd: schemePuRd[9]!,
    rdpu: schemeRdPu[9]!,
    ylgn: schemeYlGn[9]!,
    ylgnbu: schemeYlGnBu[9]!,
    ylorbr: schemeYlOrBr[9]!,
    ylorrd: schemeYlOrRd[9]!,
  }

  // Diverging schemes (11 colors)
  const divergingLookup: Record<string, readonly string[]> = {
    brbg: schemeBrBG[11]!,
    piyg: schemePiYG[11]!,
    prgn: schemePRGn[11]!,
    rdbu: schemeRdBu[11]!,
    rdgy: schemeRdGy[11]!,
    rdylbu: schemeRdYlBu[11]!,
    rdylgn: schemeRdYlGn[11]!,
    spectral: schemeSpectral[11]!,
  }

  if (singleHueLookup[normalized]) {
    return [...singleHueLookup[normalized]]
  }

  if (divergingLookup[normalized]) {
    return [...divergingLookup[normalized]]
  }

  const interpolatorLookup: Record<string, (t: number) => string> = {
    viridis: interpolateViridis,
    magma: interpolateMagma,
    plasma: interpolatePlasma,
    cividis: interpolateCividis,
  }

  if (interpolatorLookup[normalized]) {
    const interpolator = interpolatorLookup[normalized]
    const steps = 8
    return Array.from({ length: steps }, (_, idx) => interpolator((idx + 1) / steps))
  }

  return undefined
}
