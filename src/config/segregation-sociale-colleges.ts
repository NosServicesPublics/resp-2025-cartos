import type { ServiceConfig } from '@/services/service-config'
import { SEQUENTIAL_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const segregationSocialeCollegesConfig: ServiceConfig = {
  id: 'segregation-sociale-colleges',
  title: 'Ségrégation sociale entre collèges',
  dataFile: `${import.meta.env.BASE_URL}data/fr-en-indicateur_segregation_sociale_colleges.csv`,
  delimiter: ';',
  formControls: [
    {
      key: 'metric',
      label: 'Indicateur et année',
      entries: [
        { label: 'Parmi l\'ensemble des collèges - 2024', key: 'i_entropie_tot_2024' },
        { label: 'Parmi l\'ensemble des collèges - 2023', key: 'i_entropie_tot_2023' },
        { label: 'Parmi l\'ensemble des collèges - 2022', key: 'i_entropie_tot_2022' },
        { label: 'Parmi l\'ensemble des collèges - 2021', key: 'i_entropie_tot_2021' },
        { label: 'Parmi l\'ensemble des collèges - 2020', key: 'i_entropie_tot_2020' },
        { label: 'Entre secteur public et privé - 2024', key: 'i_entropie_interPUPR_2024' },
        { label: 'Entre secteur public et privé - 2023', key: 'i_entropie_interPUPR_2023' },
        { label: 'Entre secteur public et privé - 2022', key: 'i_entropie_interPUPR_2022' },
        { label: 'Entre secteur public et privé - 2021', key: 'i_entropie_interPUPR_2021' },
        { label: 'Entre secteur public et privé - 2020', key: 'i_entropie_interPUPR_2020' },
      ],
    },
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: SEQUENTIAL_COLOR_SCHEME_OPTIONS,
    },
  ],
  dataPreprocessor: (rows) => {
    // Filter out rows without department code (academic-level aggregates)
    const filteredRows = rows.filter((row: any) => {
      const dep = String(row.dep || '').trim()
      return dep && dep !== '' && !dep.toLowerCase().includes('ensemble')
    })

    // Transform from long format (multiple rows per dept with years) to wide format
    // (one row per dept with year-suffixed columns)
    const deptMap = new Map<string, any>()

    for (const row of filteredRows) {
      // Department codes in the CSV are already 3 digits (001, 075, etc.)
      // But INSEE_DEP in GeoJSON is 2 digits (01, 75, etc.)
      // Need to convert: remove leading zero for mainland, keep 3 digits for overseas (971-976, 2A, 2B)
      let dep = String(row.dep || '').trim()
      const year = String(row.annee || '').trim()

      if (!dep || !year)
        continue

      // Convert 3-digit to 2-digit for mainland (001 -> 01, 075 -> 75)
      // Keep 3-digit for overseas (971, 972, etc.) and Corse (2A, 2B)
      // Also handle Corse codes: 02A -> 2A, 02B -> 2B
      if (dep.length === 3 && dep.match(/^0\d\d$/)) {
        dep = dep.substring(1) // Remove leading 0: "001" -> "01", "075" -> "75"
      }
      else if (dep.match(/^0(2[AB])$/)) {
        dep = dep.substring(1) // Remove leading 0 for Corse: "02A" -> "2A", "02B" -> "2B"
      }

      if (!deptMap.has(dep)) {
        deptMap.set(dep, { dep, nom_departement: row.nom_departement })
      }

      const deptData = deptMap.get(dep)!

      // Add year-specific columns for each metric
      // Handle "NA" string values by converting to null
      const entropieTot = row.i_entropie_tot === 'NA' ? null : row.i_entropie_tot
      const entropieInterPUPR = row.i_entropie_interPUPR === 'NA' ? null : row.i_entropie_interPUPR

      deptData[`i_entropie_tot_${year}`] = entropieTot
      deptData[`i_entropie_interPUPR_${year}`] = entropieInterPUPR
    }

    return Array.from(deptMap.values())
  },
  rendering: {
    titleTemplates: {
      i_entropie_tot_2024: 'Indice d\'entropie de ségrégation sociale parmi l\'ensemble des collèges en 2024',
      i_entropie_tot_2023: 'Indice d\'entropie de ségrégation sociale parmi l\'ensemble des collèges en 2023',
      i_entropie_tot_2022: 'Indice d\'entropie de ségrégation sociale parmi l\'ensemble des collèges en 2022',
      i_entropie_tot_2021: 'Indice d\'entropie de ségrégation sociale parmi l\'ensemble des collèges en 2021',
      i_entropie_tot_2020: 'Indice d\'entropie de ségrégation sociale parmi l\'ensemble des collèges en 2020',
      i_entropie_interPUPR_2024: 'Indice d\'entropie de ségrégation sociale entre secteur public et privé en 2024',
      i_entropie_interPUPR_2023: 'Indice d\'entropie de ségrégation sociale entre secteur public et privé en 2023',
      i_entropie_interPUPR_2022: 'Indice d\'entropie de ségrégation sociale entre secteur public et privé en 2022',
      i_entropie_interPUPR_2021: 'Indice d\'entropie de ségrégation sociale entre secteur public et privé en 2021',
      i_entropie_interPUPR_2020: 'Indice d\'entropie de ségrégation sociale entre secteur public et privé en 2020',
    },
    colorSchemes: {
      i_entropie_tot_2024: {
        scheme: 'reds',
        label: 'Indice d\'entropie',
        type: 'threshold',
        domain: [0.04, 0.06, 0.08, 0.10],
        clamp: true,
        tickDecimals: 2,
      },
      i_entropie_tot_2023: {
        scheme: 'reds',
        label: 'Indice d\'entropie',
        type: 'threshold',
        domain: [0.04, 0.06, 0.08, 0.10],
        clamp: true,
        tickDecimals: 2,
      },
      i_entropie_tot_2022: {
        scheme: 'reds',
        label: 'Indice d\'entropie',
        type: 'threshold',
        domain: [0.04, 0.06, 0.08, 0.10],
        clamp: true,
        tickDecimals: 2,
      },
      i_entropie_tot_2021: {
        scheme: 'reds',
        label: 'Indice d\'entropie',
        type: 'threshold',
        domain: [0.04, 0.06, 0.08, 0.10],
        clamp: true,
        tickDecimals: 2,
      },
      i_entropie_tot_2020: {
        scheme: 'reds',
        label: 'Indice d\'entropie',
        type: 'threshold',
        domain: [0.04, 0.06, 0.08, 0.10],
        clamp: true,
        tickDecimals: 2,
      },
      i_entropie_interPUPR_2024: {
        scheme: 'oranges',
        label: 'Indice d\'entropie (inter)',
        type: 'threshold',
        domain: [0.01, 0.02, 0.03, 0.04],
        clamp: true,
        tickDecimals: 3,
      },
      i_entropie_interPUPR_2023: {
        scheme: 'oranges',
        label: 'Indice d\'entropie (inter)',
        type: 'threshold',
        domain: [0.01, 0.02, 0.03, 0.04],
        clamp: true,
        tickDecimals: 3,
      },
      i_entropie_interPUPR_2022: {
        scheme: 'oranges',
        label: 'Indice d\'entropie (inter)',
        type: 'threshold',
        domain: [0.01, 0.02, 0.03, 0.04],
        clamp: true,
        tickDecimals: 3,
      },
      i_entropie_interPUPR_2021: {
        scheme: 'oranges',
        label: 'Indice d\'entropie (inter)',
        type: 'threshold',
        domain: [0.01, 0.02, 0.03, 0.04],
        clamp: true,
        tickDecimals: 3,
      },
      i_entropie_interPUPR_2020: {
        scheme: 'oranges',
        label: 'Indice d\'entropie (inter)',
        type: 'threshold',
        domain: [0.01, 0.02, 0.03, 0.04],
        clamp: true,
        tickDecimals: 3,
      },
    },
    dataKeys: {
      rowKey: 'dep',
      featureKey: 'INSEE_DEP',
    },
    tooltip: {
      template: 'single-metric',
    },
    valueProcessor: (row: any, metricKey: string) => {
      // After preprocessing, each row has year-suffixed columns like i_entropie_tot_2024
      return row[metricKey]
    },
    numberNormalizer: (v: any) => {
      // Values are already in decimal format (0.040, 0.147, etc.)
      return v == null ? null : +String(v).replace(',', '.')
    },
  },
}
