import type { ServiceConfig } from '@/services/service-config'
import { DIVERGING_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const ipsCollegesConfig: ServiceConfig = {
  id: 'ips-colleges',
  title: 'IPS moyen des collèges par académie (2021-2022)',
  dataFile: `${import.meta.env.BASE_URL}data/ips-colleges-by-academy.csv`,
  geoDataType: 'academies',

  // Preprocessor to add academy codes
  dataPreprocessor: (rows) => {
    const academyNameToCode: Record<string, string> = {
      'Aix-Marseille': '02',
      'Amiens': '20',
      'Besançon': '03',
      'Bordeaux': '04',
      'Clermont-Ferrand': '06',
      'Corse': '27',
      'Créteil': '24',
      'Dijon': '07',
      'Grenoble': '08',
      'Lille': '09',
      'Limoges': '22',
      'Lyon': '10',
      'Montpellier': '11',
      'Nancy-Metz': '12',
      'Nantes': '17',
      'Nice': '23',
      'NORMANDIE': '70',
      'Normandie': '70',
      'Orléans-Tours': '18',
      'Paris': '01',
      'Poitiers': '13',
      'Reims': '19',
      'Rennes': '14',
      'Strasbourg': '15',
      'Toulouse': '16',
      'Versailles': '25',
      'Guadeloupe': '32',
      'Guyane': '33',
      'Martinique': '31',
      'La Réunion': '28',
      'Mayotte': '43',
    }

    return rows.map((row) => {
      const academyName = String(row.academie || '')
      const code = academyNameToCode[academyName]

      return {
        ...row,
        academy_code: code || '',
      }
    })
  },

  formControls: [
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: DIVERGING_COLOR_SCHEME_OPTIONS,
    },
  ],
  rendering: {
    titleTemplates: {
      default: 'Indice de position sociale (IPS) moyen des collèges par académie',
    },
    colorSchemes: {
      default: {
        scheme: 'rdbu',
        label: 'IPS moyen',
        type: 'diverging',
        // Data ranges from 69.8 (Mayotte) to 121.8 (Paris)
        // Diverging scale centered at 100 (national average reference)
        // Below 100 = disadvantaged, above 100 = advantaged
        domain: [70, 85, 95, 100, 105, 110, 122],
        asymmetric: true,
        clamp: true,
        tickDecimals: 0,
      },
    },
    dataKeys: {
      rowKey: 'academy_code',
      featureKey: 'academy',
      valueColumn: 'ips_moyen',
    },
    tooltip: {
      template: 'single-metric',
    },
    numberNormalizer: (v: any) => {
      // Values are already normalized as decimals
      return v == null ? null : +String(v).replace(',', '.')
    },
  },
}
