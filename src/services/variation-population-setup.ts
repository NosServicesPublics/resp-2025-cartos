import type { MapRenderer } from '@/types/service.types'
import * as d3 from 'd3'
import { variationPopulationConfig } from '@/config/variation-population'
import { createProportionalCircleVariationRenderer } from '@/rendering/render-proportional-circles-variation'
import MapService from '@/services/map-service'

/**
 * Load population data from CSV (semicolon-delimited)
 */
async function loadPopulationData(): Promise<Map<string, number>> {
  const populationFile = `${import.meta.env.BASE_URL}data/population_departements_2021.csv`

  // Load CSV with semicolon delimiter
  const text = await fetch(populationFile).then(r => r.text())
  const rows = d3.dsvFormat(';').parse(text)

  const populationData = new Map<string, number>()

  for (const row of rows) {
    const dep = String(row.DEP)
    const pop = +(row.PTOT || '0')
    if (pop > 0) {
      // Store with both formats: '01' and '1'
      populationData.set(dep, pop)
      populationData.set(dep.replace(/^0+/, ''), pop) // Remove leading zeros
    }
  }

  return populationData
}

/**
 * Create the variation-population service with custom proportional circle renderer
 */
export async function createVariationPopulationService(): Promise<{
  service: MapService
  renderer: MapRenderer
}> {
  // Load population data first
  const populationData = await loadPopulationData()

  // Create the service
  const service = new MapService({
    title: variationPopulationConfig.title,
    dataFile: variationPopulationConfig.dataFile,
    formControls: variationPopulationConfig.formControls,
    dataPreprocessor: variationPopulationConfig.dataPreprocessor,
  })
  service.serviceConfig = variationPopulationConfig

  // Create the custom renderer with population data
  const renderer = createProportionalCircleVariationRenderer(
    variationPopulationConfig,
    populationData,
  )

  return { service, renderer }
}
