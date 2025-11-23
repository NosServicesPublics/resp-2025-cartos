import type { ServiceConfig } from '@/services/service-config'
import { DIVERGING_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const migrationEnseignantsConfig: ServiceConfig = {
  id: 'migration-enseignants',
  title: 'Migration nette des enseignants',
  thematicCategory: 'enseignement-superieur-recherche',
  dataFile: `${import.meta.env.BASE_URL}data/migration-enseignants.csv`,
  geoDataType: 'academies',
  formControls: [
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: DIVERGING_COLOR_SCHEME_OPTIONS,
    },
  ],
  rendering: {
    titleTemplates: {
      default: 'Taux de migration nette des enseignants (%)',
    },
    colorSchemes: {
      default: {
        scheme: 'rdbu',
        label: 'Migration nette (%)',
        type: 'diverging',
        // Data ranges from -8.7% (Mayotte) to +1.7% (Bordeaux)
        // Diverging scale centered at 0 (neutral migration)
        // Negative values = net departure, positive = net arrival
        domain: [-0.02, -0.01, 0, 0.01, 0.02],
        asymmetric: true,
        clamp: true,
        percent: true,
        tickDecimals: 1,
      },
    },
    dataKeys: {
      rowKey: 'Code académie',
      featureKey: 'academy',
      valueColumn: 'Taux de migration nette',
    },
    tooltip: {
      template: 'single-metric',
    },
    rowKeyProcessor: (row: any, rowKey: string) => {
      // Extract academy code from "AXX" format to "XX" format
      const code = row[rowKey]
      return code ? code.substring(1).padStart(2, '0') : ''
    },
    numberNormalizer: (v: any) => {
      // Values use comma as decimal separator and represent percentage points
      // Convert to decimal (e.g., "1,5" -> 0.015 for 1.5%)
      return v == null ? null : +String(v).replace(',', '.') / 100
    },
  },
}
