import type { ServiceConfig } from '@/services/service-config'
import { DIVERGING_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const evolutionConfig: ServiceConfig = {
  id: 'evolution',
  title: 'Évolution du maillage',
  thematicCategory: 'guichets',
  dataFile: `${import.meta.env.BASE_URL}data/evolution.csv`,
  formControls: [
    {
      key: 'metric',
      label: 'Indicateur',
      entries: [
        { label: 'Évolution (%)', key: 'Evolution_pct' },
        { label: 'Évolution (nombre)', key: 'Evolution_nbr' },
      ],
    },
    {
      key: 'facility',
      label: 'Service ou équipement',
      entries: [
        { label: 'Lycée d\'enseignement technique', key: 'lycee_denseignement_technique_' },
        { label: 'Agence postale', key: 'agence_postale' },
        { label: 'Bureau de poste', key: 'bureau_de_poste' },
        { label: 'Police / Gendarmerie', key: 'police_gendarmerie' },
        { label: 'Urgences', key: 'urgences' },
        { label: 'Maternité', key: 'maternite' },
        { label: 'Centre de santé', key: 'centre_de_sante' },
        { label: 'Panier', key: 'panier' },
        { label: 'Aéroport', key: 'aeroport' },
        { label: 'Gares (voyageurs)', key: 'gares' },
      ],
    },
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: DIVERGING_COLOR_SCHEME_OPTIONS,
    },
  ],
  rendering: {
    titleTemplates: {
      Evolution_pct: {
        default: 'Évolution en pourcentage de l\'équipement ou service "{facility}" entre 2019 et 2024',
        lycee_denseignement_technique_: 'Évolution du nombre de lycées d\'enseignement technique entre 2019 et 2024',
        agence_postale: 'Évolution du nombre d\'agences postales entre 2019 et 2024',
        bureau_de_poste: 'Évolution du nombre de bureaux de poste entre 2019 et 2024',
        police_gendarmerie: 'Évolution du nombre de services de police et gendarmerie entre 2019 et 2024',
        urgences: 'Évolution du nombre de services d\'urgences entre 2019 et 2024',
        maternite: 'Évolution du nombre de maternités entre 2019 et 2024',
        centre_de_sante: 'Évolution du nombre de centres de santé entre 2019 et 2024',
        panier: 'Évolution du panier de services essentiels entre 2019 et 2024',
        aeroport: 'Évolution du nombre d\'aéroports entre 2019 et 2024',
        gares: 'Évolution du nombre de gares voyageurs entre 2019 et 2024',
      },
      Evolution_nbr: {
        default: 'Évolution en nombre de l\'équipement ou service "{facility}" entre 2019 et 2024',
        lycee_denseignement_technique_: 'Évolution du nombre de lycées d\'enseignement technique entre 2019 et 2024',
        agence_postale: 'Évolution du nombre d\'agences postales entre 2019 et 2024',
        bureau_de_poste: 'Évolution du nombre de bureaux de poste entre 2019 et 2024',
        police_gendarmerie: 'Évolution du nombre de services de police et gendarmerie entre 2019 et 2024',
        urgences: 'Évolution du nombre de services d\'urgences entre 2019 et 2024',
        maternite: 'Évolution du nombre de maternités entre 2019 et 2024',
        centre_de_sante: 'Évolution du nombre de centres de santé entre 2019 et 2024',
        panier: 'Évolution du panier de services essentiels entre 2019 et 2024',
        aeroport: 'Évolution du nombre d\'aéroports entre 2019 et 2024',
        gares: 'Évolution du nombre de gares voyageurs entre 2019 et 2024',
      },
    },
    colorSchemes: {
      Evolution_pct: {
        scheme: 'rdbu',
        label: 'Évolution (%)',
        type: 'diverging',
      },
      Evolution_nbr: {
        scheme: 'rdbu',
        label: 'Évolution (nombre)',
        type: 'diverging',
      },
    },
    dataKeys: {
      rowKey: 'GEO',
      featureKey: 'default',
    },
    tooltip: {
      template: 'single-metric',
    },
  },
}
