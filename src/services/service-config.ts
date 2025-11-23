import type { FormControl, ServiceDataRow, ThematicCategory } from '@/types/service.types'

/**
 * Template string interpolation for dynamic titles
 */
export interface TitleTemplate {
  pattern: string
  variables: Record<string, (service: any) => string>
}

/**
 * Color scheme configuration per metric
 */
export interface MetricColorScheme {
  scheme: string
  label: string
  type?: 'quantize' | 'quantile' | 'threshold' | 'diverging' | 'ordinal'
  domain?: number[] | string[]
  range?: string[] // Explicit colors for ordinal scales
  percent?: boolean
  legend?: boolean
  clamp?: boolean
  divergingColors?: number // Number of colors for auto-calculated diverging scales (default: 6)
  asymmetric?: boolean // Allow asymmetric diverging scales based on actual data distribution
  colorIndices?: number[] // Manual color indices from full scales (for diverging schemes, negative then positive)
  tickDecimals?: number // Number of decimal places for tick formatting (default: auto-detected)
}

/**
 * Tooltip configuration for maps
 */
export interface TooltipConfig {
  template: string
  formatters?: Record<string, (value: any) => string>
  includeSecondaryMetric?: boolean
}

/**
 * Service-specific rendering configuration
 */
export interface ServiceRenderConfig {
  /** Template for generating plot titles - can be a string or an object with facility-specific titles */
  titleTemplates: Record<string, string | Record<string, string>>

  /** Color schemes per metric */
  colorSchemes: Record<string, MetricColorScheme>

  /** Data key mappings */
  dataKeys: {
    /** Key for extracting department code from tabular data */
    rowKey: string
    /** Key for extracting department code from geographic features */
    featureKey: string
    /** Optional: Column name for simple choropleths without metric control */
    valueColumn?: string
  }

  /** Tooltip configuration */
  tooltip: TooltipConfig

  /** Custom row key processing - extracts normalized key from data row */
  rowKeyProcessor?: (row: ServiceDataRow, rowKey: string) => string

  /** Custom value processing */
  valueProcessor?: (row: ServiceDataRow, metric: string) => any

  /** Custom number normalization - can return string for ordinal scales */
  numberNormalizer?: (value: any) => number | string | null
}

/**
 * Complete service configuration combining data and rendering
 */
export interface ServiceConfig {
  /** Service metadata */
  id: string
  title: string
  dataFile: string

  /** Thematic category for navigation and grouping */
  thematicCategory?: ThematicCategory

  /** CSV delimiter (default: ',' for comma-delimited, ';' for semicolon-delimited) */
  delimiter?: string

  /** Optional geodata type for services using non-department geography (e.g., 'academies', 'epci') */
  geoDataType?: 'departments' | 'academies' | 'epci'

  /** Entry definitions for form controls */
  formControls: FormControl[]

  /** Optional data preprocessor to transform rows after loading */
  dataPreprocessor?: (rows: ServiceDataRow[]) => ServiceDataRow[]

  /** Rendering configuration */
  rendering: ServiceRenderConfig
}

/**
 * Default number normalizer for comma-decimal conversion
 */
export function defaultNumberNormalizer(v: any): number | null {
  return v == null ? null : +String(v).replace(',', '.')
}

/**
 * Default feature key extractor for French departments
 */
export function defaultFeatureKey(f: any): string {
  const p = f.properties || {}
  return String(p.INSEE_DEP ?? p.insee_dep ?? p.code ?? p.DEP).toUpperCase().padStart(2, '0')
}

/**
 * Feature key extractor for French academies
 */
export function academyFeatureKey(f: any): string {
  const p = f.properties || {}
  return String(p.code_academie ?? p.CODE_ACADEMIE ?? p.code).padStart(2, '0')
}

/**
 * Interpolate template string with service context
 */
export function interpolateTitle(
  template: string,
  facilityLabel: string,
  metricKey: string,
  metricLabel?: string,
): string {
  return template
    .replace('{facility}', facilityLabel)
    .replace('{metric}', metricLabel || metricKey)
}

/**
 * Get title template for a specific metric and facility
 * Supports both simple string templates and facility-specific templates
 */
export function getTitleTemplate(
  titleTemplates: Record<string, string | Record<string, string>>,
  metricKey: string,
  facilityKey?: string,
): string {
  const template = titleTemplates[metricKey]

  if (typeof template === 'string') {
    // Simple string template
    return template
  }

  if (typeof template === 'object') {
    // Facility-specific template - try to find specific one, fallback to default
    if (facilityKey && template[facilityKey]) {
      return template[facilityKey]
    }
    if (template.default) {
      return template.default
    }
  }

  // Fallback
  return `{facility} - ${metricKey}`
}
