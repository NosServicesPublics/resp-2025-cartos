import type { ServiceConfig } from '@/services/service-config'
import { COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const dureeConfig: ServiceConfig = {
  id: 'duree',
  title: 'Inégalités d\'accès aux services',
  thematicCategory: 'guichets',
  dataFile: `${import.meta.env.BASE_URL}data/inegalites_v2.csv`,

  // Preprocessor to expand aggregate DOM code "97" to individual DOM territories
  dataPreprocessor: (rows) => {
    const DOM_CODES = ['971', '972', '973', '974', '976']
    const expandedRows: any[] = []

    for (const row of rows) {
      if (row.dep === '97') {
        // Replicate this row for each DOM territory
        for (const code of DOM_CODES) {
          expandedRows.push({ ...row, dep: code })
        }
      }
      else {
        expandedRows.push(row)
      }
    }

    return expandedRows
  },

  formControls: [
    {
      key: 'metric',
      label: 'Indicateur',
      entries: [
        { label: 'Médiane', key: 'mediane' },
        { label: 'Rapport D9/D1', key: 'rapport_d9_d1' },
        { label: 'Coefficient de Gini', key: 'gini' },
      ],
    },
    {
      key: 'facility',
      label: 'Service ou équipement',
      entries: [
        { label: 'France Services', key: 'implantations_france_services_ifs', thematic: 'guichets' },
        { label: 'Urgences', key: 'urgences', thematic: 'sante' },
        { label: 'Maternité', key: 'maternite', thematic: 'sante' },
        { label: 'École maternelle', key: 'ecole_maternelle', thematic: 'enseignement-superieur-recherche' },
        { label: 'Institut universitaire', key: 'institut_universitaire', thematic: 'enseignement-superieur-recherche' },
      ],
    },
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: COLOR_SCHEME_OPTIONS,
    },
  ],
  rendering: {
    titleTemplates: {
      mediane: {
        default: 'Durée médiane d\'accès : {facility}',
        implantations_france_services_ifs: 'Durée médiane d\'accès à une maison France Services',
        urgences: 'Durée médiane d\'accès à un service d\'urgences',
        maternite: 'Durée médiane d\'accès à une maternité',
        ecole_maternelle: 'Durée médiane d\'accès à une école maternelle',
        institut_universitaire: 'Durée médiane d\'accès à un institut universitaire',
      },
      rapport_d9_d1: {
        default: 'Inégalités d\'accès (rapport D9/D1) : {facility}',
        implantations_france_services_ifs: 'Rapport D9/D1 des durée d\'accès à une maison France Services',
        urgences: 'Rapport D9/D1 des durée d\'accès à un service d\'urgences',
        maternite: 'Rapport D9/D1 des durée d\'accès à une maternité',
        ecole_maternelle: 'Rapport D9/D1 des durée d\'accès à une école maternelle',
        institut_universitaire: 'Rapport D9/D1 des durée d\'accès à un institut universitaire',
      },
      gini: {
        default: 'Coefficient de Gini : {facility}',
        implantations_france_services_ifs: 'Coefficient de Gini pour les durée d\'accès à une maison France Services',
        urgences: 'Coefficient de Gini pour les durée d\'accès à un service d\'urgences',
        maternite: 'Coefficient de Gini pour les durée d\'accès à une maternité',
        ecole_maternelle: 'Coefficient de Gini pour les durée d\'accès à une école maternelle',
        institut_universitaire: 'Coefficient de Gini pour les durée d\'accès à un institut universitaire',
      },
    },
    colorSchemes: {
      implantations_france_services_ifs: {
        scheme: 'purples',
      },
      urgences: {
        scheme: 'BuGn',
      },
      maternite: {
        scheme: 'BuGn',
      },
      ecole_maternelle: {
        scheme: 'ambre',
      },
      institut_universitaire: {
        scheme: 'fuschia',
      },
    },
    metricLabels: {
      mediane: 'Durée médiane (min)',
      rapport_d9_d1: 'Rapport D9/D1',
      gini: 'Coefficient de Gini',
    },
    dataKeys: {
      rowKey: 'dep',
      featureKey: 'INSEE_DEP',
    },
    tooltip: {
      template: 'single-metric',
    },
  },
}
