import type { ServiceConfig } from '@/services/service-config'
import { DIVERGING_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const evolutionLogementsSociauxConfig: ServiceConfig = {
  id: 'evolution-logements-sociaux',
  title: 'Évolution des logements sociaux',
  thematicCategory: 'logement',
  dataFile: `${import.meta.env.BASE_URL}data/rpls_evol .csv`,
  geoDataType: 'epci',
  formControls: [
    {
      key: 'metric',
      label: 'Indicateur',
      entries: [
        { label: 'Taux d\'évolution annuel 2019-2023', key: 'tx_evol_rpls' },
      ],
    },
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: DIVERGING_COLOR_SCHEME_OPTIONS,
    },
  ],
  dataPreprocessor: (rows) => {
    return rows.map((row: any) => ({
      ...row,
      CODE_SIREN: row.codgeo, // Normalize the key for joining with EPCI features
    }))
  },
  rendering: {
    titleTemplates: {
      tx_evol_rpls: 'Taux d\'évolution annuel du nombre de logements sociaux (RPLS) 2019-2023',
    },
    colorSchemes: {
      tx_evol_rpls: {
        scheme: 'rdbu',
        label: 'Taux d\'évolution annuel (%)',
        type: 'threshold',
        // Data ranges from negative values (decrease) to positive values (increase)
        // Range: from -6.4% to +20.8%, most values between -2% and +5%
        // 6 thresholds = 7 color bins for diverging scale
        // Values are normalized to 0-1 range (divided by 100)
        domain: [-0.03, -0.01, -0.005, 0, 0.01, 0.02, 0.04],
        clamp: true,
        percent: true,
      },
    },
    dataKeys: {
      rowKey: 'CODE_SIREN',
      featureKey: 'CODE_SIREN',
    },
    tooltip: {
      template: 'single-metric',
    },
    valueProcessor: (row: any, metricKey: string) => {
      return row[metricKey]
    },
    numberNormalizer: (v: any) => {
      // Values use comma as decimal separator and are in percentage format
      return v == null ? null : +String(v).replace(',', '.') / 100
    },
  },
}
