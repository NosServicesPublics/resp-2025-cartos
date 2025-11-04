import type { ServiceConfig } from '@/services/service-config'
import { SEQUENTIAL_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const partResidencesConfig: ServiceConfig = {
  id: 'part-residences',
  title: 'Part des propriétaires',
  dataFile: `${import.meta.env.BASE_URL}data/part-residences.csv`,
  formControls: [
    {
      key: 'metric',
      label: 'Année',
      entries: [
        { label: '2022', key: '2022' },
        { label: '2016', key: '2016' },
        { label: '2011', key: '2011' },
      ],
    },
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: SEQUENTIAL_COLOR_SCHEME_OPTIONS,
    },
  ],
  dataPreprocessor: (rows) => {
    // Transform from long format (multiple rows per dept) to wide format (one row per dept with year columns)
    const deptMap = new Map<string, any>()

    for (const row of rows) {
      const codgeo = String(row.codgeo || '')
      if (!codgeo)
        continue

      if (!deptMap.has(codgeo)) {
        deptMap.set(codgeo, { codgeo, libgeo: row.libgeo })
      }
      const deptData = deptMap.get(codgeo)!
      const year = String(row.an || '')
      if (year) {
        deptData[year] = row.part_proprio
      }
    }

    return Array.from(deptMap.values())
  },
  rendering: {
    titleTemplates: {
      2022: 'Part des propriétaires dans les résidences principales en 2022',
      2016: 'Part des propriétaires dans les résidences principales en 2016',
      2011: 'Part des propriétaires dans les résidences principales en 2011',
    },
    colorSchemes: {
      2022: {
        scheme: 'blues',
        label: 'Part des propriétaires (%)',
        type: 'threshold',
        // Data ranges from 33% (Paris) to 73% (Vendée) in 2022
        // Most values cluster between 50-70%
        // 4 thresholds = 5 color bins
        // Values are normalized to 0-1 range (divided by 100)
        domain: [0.45, 0.55, 0.60, 0.65],
        clamp: true,
        percent: true,
      },
      2016: {
        scheme: 'blues',
        label: 'Part des propriétaires (%)',
        type: 'threshold',
        domain: [0.45, 0.55, 0.60, 0.65],
        clamp: true,
        percent: true,
      },
      2011: {
        scheme: 'blues',
        label: 'Part des propriétaires (%)',
        type: 'threshold',
        domain: [0.45, 0.55, 0.60, 0.65],
        clamp: true,
        percent: true,
      },
    },
    dataKeys: {
      rowKey: 'codgeo',
      featureKey: 'default',
    },
    tooltip: {
      template: 'single-metric',
    },
    valueProcessor: (row: any, metricKey: string) => {
      // After preprocessing, each row has year columns (2022, 2016, 2011)
      // Return the value for the selected year
      return row[metricKey]
    },
    numberNormalizer: (v: any) => {
      // Values use comma as decimal separator and are in percentage format
      return v == null ? null : +String(v).replace(',', '.') / 100
    },
  },
}
