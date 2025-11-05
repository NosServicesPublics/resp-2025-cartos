import type { ServiceConfig } from '@/services/service-config'
import { SEQUENTIAL_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const partLogementsSociauxEpciConfig: ServiceConfig = {
  id: 'part-logements-sociaux-epci',
  title: 'Logements sociaux (EPCI)',
  dataFile: `${import.meta.env.BASE_URL}data/logement-social-epcii.csv`,
  geoDataType: 'epci',
  formControls: [
    {
      key: 'metric',
      label: 'Indicateur',
      entries: [
        { label: 'Part des logements sociaux', key: 'part_social' },
      ],
    },
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: SEQUENTIAL_COLOR_SCHEME_OPTIONS,
    },
  ],
  dataPreprocessor: (rows) => {
    return rows.map((row: any) => {
      // Parse the social housing percentage
      // Input: "46,8" or similar French number format
      const partSocialRaw = row['Locataire du parc social']
      let part_social = null

      if (partSocialRaw && partSocialRaw !== 'nd' && !partSocialRaw.includes('inférieure')) {
        // Convert French decimal format to number
        part_social = +String(partSocialRaw).replace(',', '.')
      }

      return {
        ...row,
        CODE_SIREN: row['Code EPCI'], // Normalize the key for joining
        part_social,
      }
    })
  },
  rendering: {
    titleTemplates: {
      part_social: 'Part de ménages vivant dans le parc social par EPCI en 2022',
    },
    colorSchemes: {
      part_social: {
        scheme: 'blues',
        label: 'Part des logements sociaux (%)',
        type: 'threshold',
        // Thresholds for social housing percentage
        // Values are normalized to 0-1 range (divided by 100)
        domain: [0.10, 0.15, 0.20, 0.25],
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
      // Values are already calculated as percentages in the preprocessor
      return v == null ? null : v / 100
    },
  },
}
