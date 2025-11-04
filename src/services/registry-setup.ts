import { couvertureConfig } from '@/config/couvertures'
import { dureeConfig } from '@/config/duree'
import { eloignementConfig } from '@/config/eloignement'
import { evolutionConfig } from '@/config/evolution'
import { evolutionPart65AnsConfig } from '@/config/evolution-part-65ans'
import { fragiliteCentresConfig } from '@/config/fragilite-centres'
import { inegalitesConfig } from '@/config/inegalites'
import { inegalitesV2Config } from '@/config/inegalites-v2'
import { partResidencesConfig } from '@/config/part-residences'
import { tempsArriveeSMURConfig } from '@/config/temps-arrivee-smur'
import { variationMedecinsConfig } from '@/config/variation-medecins'
import { variationPopulationConfig } from '@/config/variation-population'
import { MapRegistry } from '@/services/map-registry'
import { ServiceFactory } from '@/services/service-factory'

/**
 * Create and configure the application's MapRegistry with all available services
 */
function createMapRegistry(): MapRegistry {
  const registry = new MapRegistry()

  // Register all services using the factory
  const configs = [
    couvertureConfig,
    dureeConfig,
    eloignementConfig,
    evolutionConfig,
    evolutionPart65AnsConfig,
    fragiliteCentresConfig,
    inegalitesConfig,
    inegalitesV2Config,
    partResidencesConfig,
    tempsArriveeSMURConfig,
    variationMedecinsConfig,
    variationPopulationConfig,
  ]

  for (const config of configs) {
    const { service, renderer } = ServiceFactory.create(config)
    registry.register(config.id, service, renderer)
  }

  return registry
}

/**
 * Pre-configured MapRegistry instance ready for use
 */
export const mapRegistry = createMapRegistry()
