import { boursiersAcademieConfig } from '@/config/boursiers-academie'
import { collegesPrivesConfig } from '@/config/colleges-prives'
import { couvertureConfig } from '@/config/couvertures'
import { dureeConfig } from '@/config/duree'
import { eloignementConfig } from '@/config/eloignement'
import { etablissementsSuperieursConfig } from '@/config/etablissements-superieurs'
import { evolutionConfig } from '@/config/evolution'
import { evolutionLogementsSociauxConfig } from '@/config/evolution-logements-sociaux'
import { evolutionPart65AnsConfig } from '@/config/evolution-part-65ans'
import { fragiliteCentresConfig } from '@/config/fragilite-centres'
import { inegalitesConfig } from '@/config/inegalites'
import { inegalitesV2Config } from '@/config/inegalites-v2'
import { ipsCollegesConfig } from '@/config/ips-colleges'
import { migrationEnseignantsConfig } from '@/config/migration-enseignants'
import { moyensEnseignantsConfig } from '@/config/moyens-enseignants'
import { partLogementsSociauxConfig } from '@/config/part-logements-sociaux'
import { partLogementsSociauxEpciConfig } from '@/config/part-logements-sociaux-epci'
import { partResidencesConfig } from '@/config/part-residences'
import { populationMaximaleConfig } from '@/config/population-maximale'
import { segregationSocialeCollegesConfig } from '@/config/segregation-sociale-colleges'
import { tauxReussiteBacConfig } from '@/config/taux-reussite-bac'
import { tempsArriveeSMURConfig } from '@/config/temps-arrivee-smur'
import { variationMedecinsConfig } from '@/config/variation-medecins'
import { variationPopulationConfig } from '@/config/variation-population'
import { createEtablissementsSuperieursService } from '@/services/etablissements-superieurs-setup'
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
    boursiersAcademieConfig,
    collegesPrivesConfig,
    couvertureConfig,
    dureeConfig,
    eloignementConfig,
    evolutionConfig,
    evolutionLogementsSociauxConfig,
    evolutionPart65AnsConfig,
    fragiliteCentresConfig,
    inegalitesConfig,
    inegalitesV2Config,
    ipsCollegesConfig,
    migrationEnseignantsConfig,
    moyensEnseignantsConfig,
    partLogementsSociauxConfig,
    partLogementsSociauxEpciConfig,
    partResidencesConfig,
    populationMaximaleConfig,
    segregationSocialeCollegesConfig,
    tauxReussiteBacConfig,
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

  // Register etablissements-superieurs service with custom dot renderer
  const { service: esService, renderer: esRenderer } = await createEtablissementsSuperieursService()
  registry.register(etablissementsSuperieursConfig.id, esService, esRenderer)

  return registry
}

/**
 * Pre-configured MapRegistry instance ready for use
 * Note: This is a Promise that must be awaited before use
 */
export const mapRegistry = createMapRegistry()
