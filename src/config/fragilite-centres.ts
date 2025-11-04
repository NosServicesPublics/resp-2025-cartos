import type { ServiceConfig } from '@/services/service-config'
import { SEQUENTIAL_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const fragiliteCentresConfig: ServiceConfig = {
  id: 'fragilite-centres',
  title: 'Fragilité des centres',
  dataFile: `${import.meta.env.BASE_URL}data/fragilite-centres.csv`,
  formControls: [
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: SEQUENTIAL_COLOR_SCHEME_OPTIONS,
    },
  ],
  rendering: {
    titleTemplates: {
      default: 'Part des centres fragiles (%)',
    },
    colorSchemes: {
      default: {
        scheme: 'reds',
        label: 'Centres fragiles (%)',
        type: 'threshold',
        // Data ranges from 0% (Paris, IDF) to 83.7% (Haute-Marne)
        // Wide distribution across full range
        // 4 thresholds = 5 color bins for clear visual distinction
        // Values are normalized to 0-1 range (divided by 100)
        domain: [0.15, 0.30, 0.45, 0.60],
        clamp: true,
        percent: true,
      },
    },
    dataKeys: {
      rowKey: 'codedep',
      featureKey: 'default',
      valueColumn: 'pourcentage',
    },
    tooltip: {
      template: 'single-metric',
    },
    numberNormalizer: (v: any) => {
      // Values use dot as decimal separator and are in percentage format
      return v == null ? null : +String(v) / 100
    },
  },
}
