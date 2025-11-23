import type { ServiceConfig } from '@/services/service-config'
import { DIVERGING_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const variationMedecinsConfig: ServiceConfig = {
  id: 'variation-medecins',
  title: 'Variation de la densité de médecins',
  thematicCategory: 'sante',
  dataFile: `${import.meta.env.BASE_URL}data/variation_population_medecins.csv`,
  formControls: [
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: DIVERGING_COLOR_SCHEME_OPTIONS,
    },
  ],
  rendering: {
    titleTemplates: {
      default: 'Variation en pourcentage de la densité de médecins en activité entre 2010 et 2025',
    },
    colorSchemes: {
      default: {
        scheme: 'rdbu',
        label: 'Variation (%)',
        type: 'threshold',
        // Data ranges from -17.29% to +64.26%
        // Negative values (decrease) in red/fuschia
        // Positive values (increase) in blue/canard
        // Most mainland values between -15% and +30%
        // DOM-TOM outliers up to +64%
        domain: [-0.2, -0.1, 0, 0.1, 0.2, 0.4],
        clamp: true,
        percent: true,
        colorIndices: [
          7, // -10 to -5%: medium-dark fuschia
          4, // -10 to -5%: medium-dark fuschia
          1, // -5 to 0%: light fuschia
          19 + 1, // 0 to 10%: light canard
          19 + 4, // 10 to 20%: medium canard
          19 + 7, // 20 to 30%: medium-dark canard
          19 + 10, // > 30%: dark canard (outliers)
        ],
      },
    },
    dataKeys: {
      rowKey: 'codedep',
      featureKey: 'default',
      valueColumn: 'variation_densite',
    },
    tooltip: {
      template: 'single-metric',
    },
    numberNormalizer: (v: any) => {
      // Values are already in percentage format (-17.29 = -17.29%)
      // Divide by 100 to normalize to proportion format
      return v == null ? null : +String(v) / 100
    },
  },
}
