import { couvertureConfig } from '@/config/couvertures'
import { dureeConfig } from '@/config/duree'
import { eloignementConfig } from '@/config/eloignement'
import { evolutionConfig } from '@/config/evolution'
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
