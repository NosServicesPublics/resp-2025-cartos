import type { ServiceConfig } from '@/services/service-config'
import { SEQUENTIAL_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const partLogementsSociauxConfig: ServiceConfig = {
  id: 'part-logements-sociaux',
  title: 'Logements sociaux',
  dataFile: `${import.meta.env.BASE_URL}data/part-logements-sociaux-departements.csv`,
  formControls: [
    {
      key: 'metric',
      label: 'Indicateur',
      entries: [
        { label: 'Part des logements sociaux loués', key: 'part_loues' },
      ],
    },
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: SEQUENTIAL_COLOR_SCHEME_OPTIONS,
    },
  ],
  dataPreprocessor: (rows) => {
    // Calculate the percentage of rented social housing among main residences
    return rows.map((row: any) => {
      const densite = row.densite // Part des logements sociaux pour 100 résidences principales
      const nb_ls = row.nb_ls // Total social housing
      const nb_loues = row.nb_loues // Rented social housing

      // Calculate total main residences from: densite = (nb_ls / total_residences) * 100
      // Therefore: total_residences = nb_ls / (densite / 100)
      const densiteNum = +String(densite || '0').replace(',', '.')
      const nbLsNum = +String(nb_ls || '0').replace(/\s/g, '').replace(',', '.')
      const nbLouesNum = +String(nb_loues || '0').replace(/\s/g, '').replace(',', '.')

      let part_loues = null
      if (densiteNum > 0 && nbLsNum > 0 && nbLouesNum > 0) {
        const totalResidences = nbLsNum / (densiteNum / 100)
        part_loues = (nbLouesNum / totalResidences) * 100
      }

      return {
        ...row,
        part_loues,
      }
    })
  },
  rendering: {
    titleTemplates: {
      part_loues: 'Part des logements sociaux loués parmi les résidences principales',
    },
    colorSchemes: {
      part_loues: {
        scheme: 'blues',
        label: 'Part des logements sociaux loués (%)',
        type: 'threshold',
        // Calculated from nb_loues / total_residences
        // Expected to be slightly lower than densite since not all are rented
        // 4 thresholds = 5 color bins
        // Values are normalized to 0-1 range (divided by 100)
        domain: [0.10, 0.15, 0.20, 0.25],
        clamp: true,
        percent: true,
      },
    },
    dataKeys: {
      rowKey: 'DEP',
      featureKey: 'default',
    },
    tooltip: {
      template: 'single-metric',
    },
    valueProcessor: (row: any, metricKey: string) => {
      return row[metricKey]
    },
    numberNormalizer: (v: any) => {
      // Values are already calculated as percentages in the preprocessor
      return v == null ? null : v / 100
    },
  },
}
