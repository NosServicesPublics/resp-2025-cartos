import type { ServiceConfig } from '@/services/service-config'
import { SEQUENTIAL_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const etablissementsSuperieursConfig: ServiceConfig = {
  id: 'etablissements-superieurs',
  title: 'Établissements d\'enseignement supérieur',
  dataFile: `${import.meta.env.BASE_URL}data/fr-esr-implantations_etablissements_d_enseignement_superieur_publics.csv`,
  formControls: [
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: SEQUENTIAL_COLOR_SCHEME_OPTIONS,
    },
  ],
  rendering: {
    titleTemplates: {
      default: 'Établissements d\'enseignement supérieur publics par année de création',
    },
    colorSchemes: {
      default: {
        scheme: 'blues',
        label: 'Année de création',
        type: 'threshold',
        domain: [1950, 1970, 1980, 1990, 2000, 2010],
        clamp: true,
        legend: true,
      },
    },
    dataKeys: {
      rowKey: 'Code de l\'implantation',
      featureKey: 'default',
      valueColumn: 'Date d\'ouverture',
    },
    tooltip: {
      template: 'single-metric',
    },
    numberNormalizer: (v: any) => {
      if (v == null || v === '')
        return null
      // Extract year from date (format: YYYY-MM-DD)
      const dateStr = String(v)
      const year = Number.parseInt(dateStr.substring(0, 4), 10)
      return Number.isNaN(year) ? null : year
    },
  },
}
