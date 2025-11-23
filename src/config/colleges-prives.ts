import type { ServiceConfig } from '@/services/service-config'
import { SEQUENTIAL_COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const collegesPrivesConfig: ServiceConfig = {
  id: 'colleges-prives',
  title: 'Part des collèges privés sous contrat',
  thematicCategory: 'enseignement-superieur-recherche',
  dataFile: `${import.meta.env.BASE_URL}data/colleges-prives.csv`,
  formControls: [
    {
      key: 'metric',
      label: 'Indicateur',
      entries: [
        { label: 'Part des collèges privés sous contrat', key: 'part_prives' },
      ],
    },
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: SEQUENTIAL_COLOR_SCHEME_OPTIONS,
    },
  ],
  dataPreprocessor: (rows) => {
    // Mapping from department names to codes (using exact names from CSV with straight apostrophes)
    const deptNameToCode: Record<string, string> = {
      'Ain': '01',
      'Aisne': '02',
      'Allier': '03',
      'Alpes-de-Haute-Provence': '04',
      'Alpes-Maritimes': '06',
      'Ardeche': '07',
      'Ardennes': '08',
      'Ariege': '09',
      'Aube': '10',
      'Aude': '11',
      'Aveyron': '12',
      'Bas-rhin': '67',
      'Bouches-du-Rhone': '13',
      'Calvados': '14',
      'Cantal': '15',
      'Charente': '16',
      'Charente-Maritime': '17',
      'Cher': '18',
      'Correze': '19',
      'Corse-du-sud': '2A',
      'Cote d\u2019or': '21',
      'Cotes d\u2019Armor': '22',
      'Creuse': '23',
      'Deux-Sevres': '79',
      'Dordogne': '24',
      'Doubs': '25',
      'Drome': '26',
      'Essonne': '91',
      'Eure': '27',
      'Eure-et-Loir': '28',
      'Finistere': '29',
      'Gard': '30',
      'Gers': '32',
      'Gironde': '33',
      'Haut-rhin': '68',
      'Haute Savoie': '74',
      'Haute-Corse': '2B',
      'Haute-Garonne': '31',
      'Haute-Loire': '43',
      'Haute-Marne': '52',
      'Haute-Saone': '70',
      'Haute-Vienne': '87',
      'Hautes-Alpes': '05',
      'Hautes-Pyrenees': '65',
      'Hauts-de-Seine': '92',
      'Herault': '34',
      'Ille-et-Vilaine': '35',
      'Indre': '36',
      'Indre-et-Loire': '37',
      'Isere': '38',
      'Jura': '39',
      'Landes': '40',
      'Loir-et-Cher': '41',
      'Loire': '42',
      'Loire-Atlantique': '44',
      'Loiret': '45',
      'Lot': '46',
      'Lot-et-Garonne': '47',
      'Lozere': '48',
      'Maine-et-Loire': '49',
      'Manche': '50',
      'Marne': '51',
      'Mayenne': '53',
      'Meurthe-et-Moselle': '54',
      'Meuse': '55',
      'Morbihan': '56',
      'Moselle': '57',
      'Nievre': '58',
      'Nord': '59',
      'Oise': '60',
      'Orne': '61',
      'Paris': '75',
      'Pas-de-Calais': '62',
      'Puy-de-Dome': '63',
      'Pyrénées-Atlantiques': '64',
      'Pyrénées-Orientales': '66',
      'Rhone': '69',
      'Saone-et-Loire': '71',
      'Sarthe': '72',
      'Savoie': '73',
      'Seine Maritime': '76',
      'Seine-et-Marne': '77',
      'Seine-Saint-Denis': '93',
      'Somme': '80',
      'Tarn': '81',
      'Tarn-et-Garonne': '82',
      'Territoire de Belfort': '90',
      'Val-d\u2019Oise': '95',
      'Val-de-Marne': '94',
      'Var': '83',
      'Vaucluse': '84',
      'Vendée': '85',
      'Vienne': '86',
      'Vosges': '88',
      'Yonne': '89',
      'Yvelines': '78',
      'Guadeloupe': '971',
      'Guyane': '973',
      'Martinique': '972',
      'Mayotte': '976',
      'La Réunion': '974',
    }

    // Parse the percentage and convert to decimal format
    return rows
      .filter((row: any) => {
        const deptName = row['Départements']
        return deptName && deptNameToCode[deptName] // Only keep rows with valid department mapping
      })
      .map((row: any) => {
        const deptName = row['Départements']
        const partStr = row['Part des collèges privés sous contrat']
        let part_prives = null

        if (partStr && partStr !== '0') {
          // Replace comma with dot and parse as float
          const numStr = String(partStr).replace(',', '.')
          const num = Number.parseFloat(numStr)
          part_prives = Number.isNaN(num) ? null : num
        }

        return {
          ...row,
          dep: deptNameToCode[deptName], // Use department code for matching with GeoJSON
          departement: deptName,
          part_prives,
        }
      })
  },
  rendering: {
    titleTemplates: {
      part_prives: 'Part des collèges privés sous contrat par département (%)',
    },
    colorSchemes: {
      part_prives: {
        scheme: 'purples',
        label: 'Part des collèges privés (%)',
        type: 'threshold',
        // 4 thresholds = 5 color bins
        // Values range from 0% to ~52% (Morbihan)
        // Values are normalized to 0-1 range (divided by 100)
        domain: [0.15, 0.25, 0.35, 0.45],
        clamp: true,
        percent: true,
      },
    },
    dataKeys: {
      rowKey: 'dep',
      featureKey: 'default',
    },
    tooltip: {
      template: 'single-metric',
    },
    valueProcessor: (row: any, metricKey: string) => {
      return row[metricKey]
    },
    numberNormalizer: (v: any) => {
      // Values are already percentages in the preprocessor
      return v == null ? null : v / 100
    },
  },
}
