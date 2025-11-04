import type { ServiceConfig } from '@/services/service-config'
import { COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const tempsArriveeSMURConfig: ServiceConfig = {
  id: 'temps-arrivee-smur',
  title: 'Temps d\'arrivée des SMUR',
  dataFile: `${import.meta.env.BASE_URL}data/temps-arrivee-smur.csv`,

  // Preprocessor to handle the "Numéro de département" column and rename it to "dep"
  dataPreprocessor: (rows) => {
    return rows.map((row: any) => ({
      dep: row['Numéro de département'],
      departement: row['Département'],
      temps: row['temps arrivée SMUR (minutes)'],
    }))
  },

  formControls: [
    {
      key: 'metric',
      label: 'Indicateur',
      entries: [
        { label: 'Temps d\'arrivée SMUR (minutes)', key: 'temps' },
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
      temps: {
        default: 'Temps d\'arrivée des SMUR par département (en minutes)',
      },
    },
    colorSchemes: {
      temps: {
        scheme: 'reds',
        label: 'Temps d\'arrivée (min)',
        type: 'threshold',
        domain: [10, 20, 30, 40],
      },
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
