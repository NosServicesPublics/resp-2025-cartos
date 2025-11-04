import type { ServiceConfig } from '@/services/service-config'
import { DIVERGING_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const variationPopulationConfig: ServiceConfig = {
  id: 'variation-population',
  title: 'Variation de la population',
  dataFile: `${import.meta.env.BASE_URL}data/variation-population.csv`,
  formControls: [
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: DIVERGING_COLOR_SCHEME_OPTIONS,
    },
  ],
  rendering: {
    titleTemplates: {
      default: 'Taux de variation annuel moyen de la population (%)',
    },
    colorSchemes: {
      default: {
        scheme: 'rdbu',
        label: 'Taux de variation annuel (%)',
        type: 'threshold',
        // Manual thresholds pivoting around 0
        // Asymmetric: more granularity on positive side where most data lives
        domain: [-1, -0.5, 0, 0.5, 1, 2],
        clamp: true,
        percent: true, // Values are already in percentage format (0.8 = 0.8%, not 80%)
        // Manual color indices from full scales (19 colors each, 0-based):
        // Indices 0-18: negative scale (fuschia), 19-37: positive scale (canard)
        // Index 0 = lightest, index 18 = darkest
        // Bin mapping: <-1, -1 to -0.5, -0.5 to 0, | 0 to 0.5, 0.5 to 1, 1 to 2, >2
        colorIndices: [
          9, // <-1: darkest fuschia (index 18)
          5, // -1 to -0.5: dark fuschia (index 12)
          1, // -0.5 to 0: medium fuschia (index 6)
          19 + 1, // 0 to 0.5: lightest canard (index 0 = 19+0)
          19 + 5, // 0.5 to 1: light canard (index 4 = 19+4)
          19 + 9, // 1 to 2: medium canard (index 8 = 19+8)
          19 + 13, // >2: dark canard (index 12 = 19+12)
        ],
      },
    },
    dataKeys: {
      rowKey: 'Numéro de département',
      featureKey: 'default',
      valueColumn: 'Évolution  de la population',
    },
    tooltip: {
      template: 'single-metric',
    },
    numberNormalizer: (v: any) => {
      // Values are already in percentage format (e.g., "0,8" = 0.8%)
      // Just convert comma to dot, no other transformation needed
      return v == null ? null : +String(v).replace(',', '.')
    },
  },
}
