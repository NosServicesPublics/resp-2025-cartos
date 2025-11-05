import type { ServiceConfig } from '@/services/service-config'
import { SEQUENTIAL_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const principauxEtablissementsSuperieursConfig: ServiceConfig = {
  id: 'principaux-etablissements-superieurs',
  title: 'Principaux établissements d\'enseignement supérieur',
  dataFile: `${import.meta.env.BASE_URL}data/fr-esr-principaux-etablissements-enseignement-superieur.csv`,
  // dataPreprocessor: (rows) => {
  //   return rows.filter((row) => {
  //     const type = String(row['type d\'établissement'] || '')
  //     return type === 'Université'
  //   })
  // },
  formControls: [
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: SEQUENTIAL_COLOR_SCHEME_OPTIONS,
    },
  ],
  rendering: {
    titleTemplates: {
      default: 'Principaux établissements d\'enseignement supérieur par année de création',
    },
    colorSchemes: {
      default: {
        scheme: 'blues',
        label: 'Année de création',
        type: 'threshold',
        domain: [1960, 1980, 1990],
        clamp: true,
        legend: true,
      },
    },
    dataKeys: {
      rowKey: 'identifiant interne',
      featureKey: 'default',
      valueColumn: 'date_creation',
    },
    tooltip: {
      template: 'single-metric',
    },
    numberNormalizer: (v: any) => {
      if (v == null || v === '')
        return null
      // Extract year from date (format: YYYY-MM-DD or YYYY)
      const dateStr = String(v)
      const year = Number.parseInt(dateStr.substring(0, 4), 10)
      return Number.isNaN(year) ? null : year
    },
  },
}
