import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { OverlayMesh, ServiceDataRow } from '@/types/service.types'
import * as Plot from '@observablehq/plot'
import * as d3 from 'd3'
import { createFranceProjection } from '@/services/custom-projection'

// Color scale configuration with internal options
interface ColorScaleConfig {
  legend?: boolean
  type?: string
  scheme?: string
  label?: string
  domain?: [number, number] | number[]
  tickFormat?: (d: number) => string
  percent?: boolean
  range?: string[]
  clamp?: boolean
  colorIndices?: number[]
  _needsDivergingDomain?: boolean
}

// Configuration for proportional circle maps
interface ProportionalCircleConfig {
  plotTitle: string | null
  featureCollection: FeatureCollection<Geometry>
  tabularData: ServiceDataRow[]
  rowKey: (row: ServiceDataRow) => string
  featureKey: (feature: Feature<Geometry>) => string
  valueAccessor: (row: ServiceDataRow) => any
  sizeAccessor: (row: ServiceDataRow) => any // New: for circle size (population)
  numberNormalizer: (value: any) => number | null
  colorScale: ColorScaleConfig
  fillUnknown: string
  projection: any
  width: number
  height: number
  inset: number
  showLegend: boolean
  backgroundFill: string
  rowFilter: ((row: ServiceDataRow) => boolean) | null
  outlineStroke: string
  outlineStrokeWidth: number
  includeTooltips: boolean
  titleBuilder: (feature: Feature<Geometry>, value: number | null, row?: ServiceDataRow) => string
  sizeLabel: string // Label for the size legend
  sizeRange?: [number, number] // Min/max radius in pixels
  overlayMeshes?: OverlayMesh[] // Region boundaries and other overlays
  backgroundGeometry?: Geometry // Background geometry (e.g., sea/land)
  outlineGeometry?: Geometry // Outline geometry (e.g., France's contour)
}

interface DataIndexEntry {
  row: ServiceDataRow
  value: number | null
  size: number | null
}

interface CentroidPoint {
  lon: number
  lat: number
  value: number | null
  size: number | null
  feature: Feature<Geometry>
  row: ServiceDataRow | null
  name: string
  depCode: string // Department code for labeling
}

export function renderProportionalCircles(options: Partial<ProportionalCircleConfig> = {}) {
  /**
   * Renders a proportional circle map using Observable Plot.
   *
   * This function creates a map visualization by:
   * 1. Joining tabular data with GeoJSON features
   * 2. Computing centroids for each department
   * 3. Coloring circles based on data values (e.g., population variation)
   * 4. Sizing circles based on another value (e.g., population)
   * 5. Adding interactive tooltips on hover
   *
   * @param options - Configuration object
   * @returns Observable Plot chart
   */
  // ========== CONFIGURATION ==========
  const config = extractConfiguration(options)

  // ========== DATA PREPARATION ==========
  const dataIndex = buildDataIndex(config)

  // ========== CENTROID CALCULATION ==========
  const centroids = calculateCentroids(config, dataIndex)

  // ========== CHART CONSTRUCTION ==========
  const chart = buildChart(config, centroids)

  // ========== POST-PROCESSING ==========
  setCurrentColor(chart, config.outlineStroke)

  return chart

  /**
   * Extracts and validates configuration with sensible defaults.
   */
  function extractConfiguration(options: Partial<ProportionalCircleConfig>): ProportionalCircleConfig {
    return {
      // === Data & Joining ===
      tabularData: options.tabularData || [],
      featureCollection: options.featureCollection!,
      featureKey: options.featureKey ?? (f => f.properties?.INSEE_DEP),
      rowKey: options.rowKey ? (r: ServiceDataRow) => options.rowKey!(r) || '' : r => r.DEP || '',
      valueAccessor: options.valueAccessor ?? (r => r.value),
      sizeAccessor: options.sizeAccessor ?? (r => r.population),
      numberNormalizer: options.numberNormalizer ?? (v => v == null ? null : +String(v).replace(',', '.')),

      // === Color Scale ===
      colorScale: {
        legend: options.colorScale?.legend ?? true,
        type: options.colorScale?.type ?? 'threshold',
        scheme: options.colorScale?.scheme,
        label: options.colorScale?.label ?? '',
        domain: options.colorScale?.domain,
        tickFormat: options.colorScale?.tickFormat,
        percent: options.colorScale?.percent ?? false,
        range: options.colorScale?.range,
        clamp: options.colorScale?.clamp ?? true,
        colorIndices: options.colorScale?.colorIndices,
        _needsDivergingDomain: options.colorScale?._needsDivergingDomain,
      },

      // === Size Configuration ===
      sizeLabel: options.sizeLabel ?? 'Population',
      sizeRange: options.sizeRange ?? [3, 30], // Default radius range in pixels

      // === Visual Styling ===
      fillUnknown: options.fillUnknown ?? '#ddd',
      projection: options.projection ?? createFranceProjection(),
      width: options.width ?? 975,
      height: options.height ?? 610,
      inset: options.inset ?? 0,
      showLegend: options.showLegend ?? true,
      backgroundFill: options.backgroundFill ?? 'none',
      outlineStroke: options.outlineStroke ?? '#333',
      outlineStrokeWidth: options.outlineStrokeWidth ?? 0.5,

      // === Interactions ===
      includeTooltips: options.includeTooltips ?? true,
      titleBuilder: options.titleBuilder ?? ((f, v) => `${f.properties?.NOM || 'Unknown'}: ${v}`),

      // === Filtering & Titles ===
      rowFilter: options.rowFilter ?? null,
      plotTitle: options.plotTitle ?? null,

      // === Overlays & Geometry ===
      overlayMeshes: options.overlayMeshes ?? [],
      backgroundGeometry: options.backgroundGeometry,
      outlineGeometry: options.outlineGeometry,
    }
  }

  /**
   * Builds an index mapping feature keys to data entries with both value and size.
   */
  function buildDataIndex(config: ProportionalCircleConfig): Map<string, DataIndexEntry> {
    const index = new Map<string, DataIndexEntry>()

    for (const row of config.tabularData) {
      if (config.rowFilter && !config.rowFilter(row))
        continue

      const key = config.rowKey(row)
      if (!key)
        continue

      const rawValue = config.valueAccessor(row)
      const value = config.numberNormalizer(rawValue)

      const rawSize = config.sizeAccessor(row)
      const size = config.numberNormalizer(rawSize)

      index.set(key, { row, value, size })
    }

    return index
  }

  /**
   * Calculates geographic centroids for each feature with joined data.
   */
  function calculateCentroids(
    config: ProportionalCircleConfig,
    dataIndex: Map<string, DataIndexEntry>,
  ): CentroidPoint[] {
    const centroids: CentroidPoint[] = []

    for (const feature of config.featureCollection.features) {
      const key = config.featureKey(feature)
      const dataEntry = dataIndex.get(key)

      // Calculate centroid using d3.geoCentroid
      const centroid = d3.geoCentroid(feature)

      // Extract department code (remove leading zeros for display)
      const depCode = (feature.properties?.INSEE_DEP || key).replace(/^0+/, '')

      centroids.push({
        lon: centroid[0],
        lat: centroid[1],
        value: dataEntry?.value ?? null,
        size: dataEntry?.size ?? null,
        feature,
        row: dataEntry?.row ?? null,
        name: feature.properties?.NOM || feature.properties?.NAME || 'Unknown',
        depCode,
      })
    }

    return centroids
  }

  /**
   * Builds the Observable Plot chart with proportional circles.
   */
  function buildChart(config: ProportionalCircleConfig, centroids: CentroidPoint[]) {
    // Prepare color scale configuration
    const colorConfig: any = {
      type: config.colorScale.type,
      legend: config.showLegend && config.colorScale.legend,
      label: config.colorScale.label,
      unknown: config.fillUnknown,
    }

    if (config.colorScale.scheme) {
      colorConfig.scheme = config.colorScale.scheme
    }

    if (config.colorScale.range) {
      colorConfig.range = config.colorScale.range
    }

    if (config.colorScale.domain) {
      colorConfig.domain = config.colorScale.domain
    }

    if (config.colorScale.clamp !== undefined) {
      colorConfig.clamp = config.colorScale.clamp
    }

    if (config.colorScale.tickFormat) {
      colorConfig.tickFormat = config.colorScale.tickFormat
    }
    else if (config.colorScale.percent) {
      colorConfig.tickFormat = (d: number) => `${d}%`
    }

    // Filter out centroids without size data (can't draw circles without size)
    const validCentroids = centroids.filter(c => c.size !== null)

    const marks: any[] = []

    // Add background geometry (if provided)
    if (config.backgroundGeometry) {
      marks.push(
        Plot.geo(config.backgroundGeometry, {
          fill: config.backgroundFill,
          stroke: 'none',
        }),
      )
    }

    // Add department boundaries (outline only)
    marks.push(
      Plot.geo(config.featureCollection, {
        stroke: config.outlineStroke,
        strokeWidth: config.outlineStrokeWidth,
        fill: 'none',
      }),
    )

    // Add overlay meshes (region boundaries)
    if (config.overlayMeshes && config.overlayMeshes.length > 0) {
      config.overlayMeshes.forEach(({ geo, stroke, ...styleProps }: OverlayMesh) => {
        marks.push(
          Plot.geo(geo, {
            pointerEvents: 'none',
            stroke: stroke ?? config.outlineStroke,
            ...styleProps,
          }),
        )
      })
    }

    // Add outline geometry (France's contour) - thicker than department boundaries
    if (config.outlineGeometry) {
      marks.push(
        Plot.geo(config.outlineGeometry, {
          stroke: config.outlineStroke,
          strokeWidth: config.outlineStrokeWidth * 2, // Make it thicker to stand out
          fill: 'none',
          pointerEvents: 'none',
        }),
      )
    }

    // Add proportional circles
    if (validCentroids.length > 0) {
      const dotOptions: any = {
        x: (d: CentroidPoint) => d.lon,
        y: (d: CentroidPoint) => d.lat,
        r: (d: CentroidPoint) => d.size!,
        fill: (d: CentroidPoint) => d.value,
        stroke: config.outlineStroke,
        strokeWidth: 0.5,
        sort: { channel: '-r' }, // Draw larger circles first to avoid occlusion
      }

      if (config.includeTooltips) {
        dotOptions.title = (d: CentroidPoint) => config.titleBuilder(d.feature, d.value, d.row ?? undefined)
        dotOptions.tip = true
      }

      marks.push(Plot.dot(validCentroids, dotOptions))

      // Add text labels with department codes
      marks.push(
        Plot.text(validCentroids, {
          x: (d: CentroidPoint) => d.lon,
          y: (d: CentroidPoint) => d.lat,
          text: (d: CentroidPoint) => d.depCode,
          fill: config.outlineStroke,
          // stroke: config.outlineStroke,
          // strokeWidth: 1,
          fontSize: 9,
          fontWeight: 'bold',
          textAnchor: 'middle',
          lineAnchor: 'middle',
          pointerEvents: 'none', // Don't interfere with circle tooltips
        }),
      )
    }

    return Plot.plot({
      width: config.width,
      height: config.height,
      inset: config.inset,
      projection: config.projection,
      color: colorConfig,
      r: {
        range: config.sizeRange,
        label: config.sizeLabel,
        legend: config.showLegend,
      },
      style: {
        background: config.backgroundFill,
      },
      title: config.plotTitle,
      marks,
    })
  }

  /**
   * Sets the CSS currentColor property on the chart element.
   */
  function setCurrentColor(chart: any, color: string) {
    if (chart instanceof SVGSVGElement) {
      chart.style.color = color
    }
  }
}
