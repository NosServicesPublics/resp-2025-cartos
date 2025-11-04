import { collegesPrivesConfig } from '@/config/colleges-prives'
import { couvertureConfig } from '@/config/couvertures'
import { dureeConfig } from '@/config/duree'
import { eloignementConfig } from '@/config/eloignement'
import { evolutionConfig } from '@/config/evolution'
import { evolutionPart65AnsConfig } from '@/config/evolution-part-65ans'
import { fragiliteCentresConfig } from '@/config/fragilite-centres'
import { inegalitesConfig } from '@/config/inegalites'
import { inegalitesV2Config } from '@/config/inegalites-v2'
import { partLogementsSociauxConfig } from '@/config/part-logements-sociaux'
import { partResidencesConfig } from '@/config/part-residences'
import { segregationSocialeCollegesConfig } from '@/config/segregation-sociale-colleges'
import { tempsArriveeSMURConfig } from '@/config/temps-arrivee-smur'
import { variationMedecinsConfig } from '@/config/variation-medecins'
import { variationPopulationConfig } from '@/config/variation-population'
import { MapRegistry } from '@/services/map-registry'
import { ServiceFactory } from '@/services/service-factory'
import { createVariationPopulationService } from '@/services/variation-population-setup'

/**
 * Create and configure the application's MapRegistry with all available services
 */
async function createMapRegistry(): Promise<MapRegistry> {
  const registry = new MapRegistry()

  // Register standard services using the factory
  const configs = [
    collegesPrivesConfig,
    couvertureConfig,
    dureeConfig,
    eloignementConfig,
    evolutionConfig,
    evolutionPart65AnsConfig,
    fragiliteCentresConfig,
    inegalitesConfig,
    inegalitesV2Config,
    partLogementsSociauxConfig,
    partResidencesConfig,
    segregationSocialeCollegesConfig,
    tempsArriveeSMURConfig,
    variationMedecinsConfig,
  ]

  for (const config of configs) {
    const { service, renderer } = ServiceFactory.create(config)
    registry.register(config.id, service, renderer)
  }

  // Register variation-population service with custom proportional circle renderer
  const { service: vpService, renderer: vpRenderer } = await createVariationPopulationService()
  registry.register(variationPopulationConfig.id, vpService, vpRenderer)

  return registry
}

/**
 * Pre-configured MapRegistry instance ready for use
 * Note: This is a Promise that must be awaited before use
 */
export const mapRegistry = createMapRegistry()
