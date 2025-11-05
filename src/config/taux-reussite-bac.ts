import type { ServiceConfig } from '@/services/service-config'
import { SEQUENTIAL_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const tauxReussiteBacConfig: ServiceConfig = {
  id: 'taux-reussite-bac',
  title: 'Taux de réussite au Bac 2019',
  dataFile: `${import.meta.env.BASE_URL}data/taux-reussite-bac-2019.csv`,
  geoDataType: 'academies',

  // Preprocessor to normalize academy names and filter out aggregate rows
  dataPreprocessor: (rows) => {
    const normalizedRows: any[] = []
    const academyNameToCode: Record<string, string> = {
      'Aix-Marseille': '02',
      'Amiens': '20',
      'Besançon': '03',
      'Bordeaux': '04',
      'Caen': '70', // Now part of Normandie
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
      'Orléans-Tours': '18',
      'Paris': '01',
      'Poitiers': '13',
      'Reims': '19',
      'Rennes': '14',
      'Rouen': '70', // Now part of Normandie
      'Strasbourg': '15',
      'Toulouse': '16',
      'Versailles': '25',
      'Guadeloupe': '32',
      'Guyane': '33',
      'Martinique': '31',
      'La Réunion': '28',
      'Mayotte': '43',
    }

    // For Normandie, we'll need to calculate average of Caen and Rouen
    let caenData: any = null
    let rouenData: any = null

    for (const row of rows) {
      const academyName = row.academie

      // Skip aggregate rows
      if (!academyName || academyName.includes('Total') || academyName.includes('métro')) {
        continue
      }

      const code = academyNameToCode[academyName]
      if (!code) {
        continue
      }

      // Store Caen and Rouen for later averaging
      if (academyName === 'Caen') {
        caenData = row
      }
      else if (academyName === 'Rouen') {
        rouenData = row
      }
      else {
        normalizedRows.push({
          ...row,
          academy_code: code,
        })
      }
    }

    // Calculate Normandie as average of Caen and Rouen
    if (caenData && rouenData) {
      const caenRate = Number.parseFloat(String(caenData.taux_reussite).replace(',', '.'))
      const rouenRate = Number.parseFloat(String(rouenData.taux_reussite).replace(',', '.'))
      const normandieRate = ((caenRate + rouenRate) / 2).toFixed(1).replace('.', ',')

      normalizedRows.push({
        academie: 'Normandie',
        taux_reussite: normandieRate,
        academy_code: '70',
      })
    }

    return normalizedRows
  },

  formControls: [
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: SEQUENTIAL_COLOR_SCHEME_OPTIONS,
    },
  ],

  rendering: {
    titleTemplates: {
      default: 'Taux de réussite au Baccalauréat 2019 (%)',
    },
    colorSchemes: {
      default: {
        scheme: 'greens',
        label: 'Taux de réussite (%)',
        type: 'threshold',
        // Data ranges from 63.8% (Mayotte) to 94% (Rennes)
        // Most academies are between 88% and 94%
        // Thresholds to highlight differences
        domain: [0.70, 0.85, 0.89, 0.91, 0.93],
        clamp: true,
        percent: true,
        tickDecimals: 1,
      },
    },
    dataKeys: {
      rowKey: 'academy_code',
      featureKey: 'academy',
      valueColumn: 'taux_reussite',
    },
    tooltip: {
      template: 'single-metric',
    },
    numberNormalizer: (v: any) => {
      // Values use comma as decimal separator and are in percentage format
      // Convert to decimal (e.g., "90,6" -> 0.906 for 90.6%)
      return v == null ? null : +String(v).replace(',', '.') / 100
    },
  },
}
