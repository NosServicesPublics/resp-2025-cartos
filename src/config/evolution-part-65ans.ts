import type { ServiceConfig } from '@/services/service-config'
import { SEQUENTIAL_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const evolutionPart65AnsConfig: ServiceConfig = {
  id: 'evolution-part-65ans',
  title: 'Évolution de la part des 65 ans ou plus',
  dataFile: `${import.meta.env.BASE_URL}data/evolution-part-65ans.csv`,
  formControls: [
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: SEQUENTIAL_COLOR_SCHEME_OPTIONS,
    },
  ],
  rendering: {
    titleTemplates: {
      default: 'Évolution 2010-2020 de la part des 65 ans ou plus (%)',
    },
    colorSchemes: {
      default: {
        scheme: 'purples',
        label: 'Évolution (%)',
        type: 'threshold',
        // Data ranges from 12% to 56.9%
        // Most values cluster between 15-35%, with outliers (DOM-TOM) at 51-56.9%
        // 4 thresholds = 5 color bins, matching custom color schemes (5 colors)
        // Values are normalized to 0-1 range (divided by 100)
        domain: [0.20, 0.25, 0.30, 0.40],
        clamp: true,
        percent: true,
      },
    },
    dataKeys: {
      rowKey: 'code département',
      featureKey: 'default',
      valueColumn: 'évolution 2010-2020 de la part des 65 ans ou plus (%)',
    },
    tooltip: {
      template: 'single-metric',
    },
    numberNormalizer: (v: any) => {
      // Values use comma as decimal separator
      return v == null ? null : +String(v).replace(',', '.') / 100
    },
  },
}
