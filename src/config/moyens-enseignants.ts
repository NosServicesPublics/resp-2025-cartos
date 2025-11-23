import type { ServiceConfig } from '@/services/service-config'
import { SEQUENTIAL_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const moyensEnseignantsConfig: ServiceConfig = {
  id: 'moyens-enseignants',
  title: 'Moyens d\'encadrement dans les collèges (2024)',
  thematicCategory: 'enseignement-superieur-recherche',
  dataFile: `${import.meta.env.BASE_URL}data/moyens-enseignants-by-academy.csv`,
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
      entries: SEQUENTIAL_COLOR_SCHEME_OPTIONS,
    },
  ],
  rendering: {
    titleTemplates: {
      default: 'Nombre d\'heures d\'enseignement hebdomadaires par élève (H/E)',
    },
    colorSchemes: {
      default: {
        scheme: 'greens',
        label: 'Heures par élève',
        type: 'threshold',
        // Data ranges from 1.25 (Mayotte) to 1.70 (Martinique)
        // Most mainland academies between 1.30 and 1.45
        // Using fewer thresholds for better color distribution
        domain: [1.28, 1.34, 1.40, 1.50, 1.65],
        clamp: true,
        tickDecimals: 2,
      },
    },
    dataKeys: {
      rowKey: 'academy_code',
      featureKey: 'academy',
      valueColumn: 'heures_par_eleve',
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
