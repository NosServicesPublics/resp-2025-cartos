import type { ServiceConfig } from '@/services/service-config'
import { SEQUENTIAL_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const boursiersAcademieConfig: ServiceConfig = {
  id: 'boursiers-academie',
  title: 'Proportion de boursiers sur critères sociaux par académie en 2023-2024',
  thematicCategory: 'enseignement-superieur-recherche',
  dataFile: `${import.meta.env.BASE_URL}data/boursiers-academie.csv`,
  geoDataType: 'academies',

  // Preprocessor to normalize academy names and filter out aggregate rows
  dataPreprocessor: (rows) => {
    console.log('Raw rows received:', rows.length, rows.slice(0, 3))
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
        console.log('Skipping aggregate row:', academyName)
        continue
      }

      const code = academyNameToCode[academyName]
      if (!code) {
        console.log('No code found for academy:', academyName, 'Row:', row)
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
      const caenRate = Number.parseFloat(String(caenData.taux_boursiers))
      const rouenRate = Number.parseFloat(String(rouenData.taux_boursiers))
      const normandieRate = ((caenRate + rouenRate) / 2).toFixed(0)

      normalizedRows.push({
        academie: 'Normandie',
        taux_boursiers: normandieRate,
        academy_code: '70',
      })
    }

    console.log('Processed boursiers data sample:', normalizedRows.slice(0, 3))
    console.log('Total rows:', normalizedRows.length)
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
      default: 'Proportion de boursiers sur critères sociaux par académie en 2023-2024 (%)',
    },
    colorSchemes: {
      default: {
        scheme: 'oranges',
        label: 'Proportion de boursiers (%)',
        type: 'threshold',
        // Data ranges from 30% (Lyon, Versailles) to 55% (Mayotte, Guadeloupe, Martinique, La Réunion)
        // Most academies are between 40% and 47%
        // Thresholds to highlight differences
        domain: [0.35, 0.40, 0.45, 0.50],
        clamp: true,
        percent: true,
        tickDecimals: 0,
      },
    },
    dataKeys: {
      rowKey: 'academy_code',
      featureKey: 'academy',
      valueColumn: 'taux_boursiers',
    },
    tooltip: {
      template: 'single-metric',
    },
    numberNormalizer: (v: any) => {
      // Values are integers representing percentages
      // Convert to decimal (e.g., "40" -> 0.40 for 40%)
      return v == null ? null : +v / 100
    },
  },
}
