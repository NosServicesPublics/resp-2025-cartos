import type { InputEntry } from '@/types/service.types'

// Full color scales (19 shades from 50 to 950)
export const FULL_COLOR_SCALES = {
  ambre: [
    '#F9EFE8',
    '#F2DFD1',
    '#EBD0BA',
    '#E4C0A4',
    '#DCB18E',
    '#D3A279',
    '#CA9364',
    '#C1844F',
    '#B7763A',
    '#AD6724',
    '#A25907',
    '#984B00',
    '#844200',
    '#713900',
    '#5E3000',
    '#4C2802',
    '#3A2003',
    '#2A1803',
    '#1A0F01',
  ],
  bouteille: [
    '#EDF3E8',
    '#DCE6D2',
    '#CADABC',
    '#B9CEA6',
    '#A7C291',
    '#96B67C',
    '#85AA67',
    '#739F52',
    '#61933D',
    '#4F8726',
    '#3B7C06',
    '#257000',
    '#236200',
    '#215400',
    '#1E4601',
    '#1B3904',
    '#182C05',
    '#141F05',
    '#0C1402',
  ],
  canard: [
    '#E5F4F2',
    '#CBE9E6',
    '#B1DEDA',
    '#96D3CE',
    '#79C8C2',
    '#59BDB6',
    '#2EB2AA',
    '#00A79F',
    '#009B93',
    '#009088',
    '#00847D',
    '#007872',
    '#006963',
    '#005A55',
    '#004B47',
    '#003D39',
    '#002F2C',
    '#002220',
    '#001513',
  ],
  petrole: [
    '#ECF1F4',
    '#DAE3E9',
    '#C8D6DF',
    '#B6C8D4',
    '#A3BBC9',
    '#91AEBF',
    '#7FA1B5',
    '#6D94AA',
    '#5B88A0',
    '#477B96',
    '#326F8C',
    '#2E627B',
    '#2A566B',
    '#26495B',
    '#223E4C',
    '#1D323D',
    '#18272F',
    '#131C21',
    '#0C1114',
  ],
  outremer: [
    '#F1F0FB',
    '#E3E1F7',
    '#D4D3F2',
    '#C6C4EE',
    '#B8B6EA',
    '#A9A8E5',
    '#9A9AE1',
    '#8B8DDC',
    '#7B7FD7',
    '#6B72D2',
    '#5966CE',
    '#4559C9',
    '#3E4EAD',
    '#374392',
    '#303878',
    '#292E60',
    '#212448',
    '#1A1A31',
    '#11101C',
  ],
  amethyste: [
    '#F7EEF7',
    '#F0DDEF',
    '#E8CDE8',
    '#E0BCE0',
    '#D8ACD8',
    '#CF9CD0',
    '#C78BC8',
    '#BE7BC0',
    '#B56BB9',
    '#AC5AB1',
    '#A348A9',
    '#9A35A1',
    '#85308B',
    '#712B76',
    '#5E2662',
    '#4C214E',
    '#3A1B3B',
    '#281529',
    '#190D18',
  ],
  fuschia: [
    '#FCEDF1',
    '#F8DCE3',
    '#F3CAD6',
    '#EFB9C8',
    '#E9A7BB',
    '#E496AE',
    '#DE84A1',
    '#D77294',
    '#D05F88',
    '#C94B7C',
    '#C23370',
    '#BA0F64',
    '#A11557',
    '#88184B',
    '#71193E',
    '#5A1833',
    '#441627',
    '#30121D',
    '#1D0C11',
  ],
}

// Simplified 5-color schemes for choropleth maps (sequential)
// Computed from FULL_COLOR_SCALES by selecting indices: 1 (100), 4 (250), 7 (400), 10 (550), 13 (700)
export const CUSTOM_COLOR_SCHEMES: Record<string, string[]> = Object.fromEntries(
  Object.entries(FULL_COLOR_SCALES).map(([key, colors]) => [
    key,
    [colors[1]!, colors[4]!, colors[7]!, colors[10]!, colors[13]!],
  ]),
) as Record<string, string[]>

/**
 * Generate a diverging color scheme by sampling from two full color scales
 * @param negativeScale - Full 19-color scale for negative values (dark to light)
 * @param positiveScale - Full 19-color scale for positive values (light to dark)
 * @param numColors - Total number of colors (must be even, default: 6)
 * @param minIndex - Minimum index to sample from (default: 1, for lighter colors)
 * @param maxIndex - Maximum index to sample from (default: 13, avoiding darkest colors)
 * @returns Array of colors evenly sampled from both scales
 */
function createDivergingScheme(
  negativeScale: readonly string[],
  positiveScale: readonly string[],
  numColors: number = 6,
  minIndex: number = 1,
  maxIndex: number = 13,
): string[] {
  const colorsPerSide = numColors / 2
  const colors: string[] = []

  // Sample negative side (from dark to light, indices high to low)
  for (let i = 0; i < colorsPerSide; i++) {
    const index = Math.round((maxIndex - minIndex) * (colorsPerSide - 1 - i) / (colorsPerSide - 1)) + minIndex
    colors.push(negativeScale[index]!)
  }

  // Sample positive side (from light to dark, indices low to high)
  for (let i = 0; i < colorsPerSide; i++) {
    const index = Math.round((maxIndex - minIndex) * i / (colorsPerSide - 1)) + minIndex
    colors.push(positiveScale[index]!)
  }

  return colors
}

// Diverging 6-color schemes (3 colors on each side, no neutral, pivot at 0)
// Can be dynamically sampled for different numbers of colors
export const DIVERGING_COLOR_SCHEMES: Record<string, string[]> = {
  // Fuschia (negative) → Canard (positive), pivot at 0
  'fuschia-canard': createDivergingScheme(FULL_COLOR_SCALES.fuschia, FULL_COLOR_SCALES.canard, 6),
  'canard-fuschia': createDivergingScheme(FULL_COLOR_SCALES.canard, FULL_COLOR_SCALES.fuschia, 6),
  // Ambre (negative) → Outremer (positive)
  'ambre-outremer': createDivergingScheme(FULL_COLOR_SCALES.ambre, FULL_COLOR_SCALES.outremer, 6),
  'outremer-ambre': createDivergingScheme(FULL_COLOR_SCALES.outremer, FULL_COLOR_SCALES.ambre, 6),
  // Améthyste (negative) → Bouteille (positive)
  'amethyste-bouteille': createDivergingScheme(FULL_COLOR_SCALES.amethyste, FULL_COLOR_SCALES.bouteille, 6),
  'bouteille-amethyste': createDivergingScheme(FULL_COLOR_SCALES.bouteille, FULL_COLOR_SCALES.amethyste, 6),
  // Pétrole (negative) → Ambre (positive)
  'petrole-ambre': createDivergingScheme(FULL_COLOR_SCALES.petrole, FULL_COLOR_SCALES.ambre, 6),
  'ambre-petrole': createDivergingScheme(FULL_COLOR_SCALES.ambre, FULL_COLOR_SCALES.petrole, 6),
  // Outremer (negative) → Fuschia (positive)
  'outremer-fuschia': createDivergingScheme(FULL_COLOR_SCALES.outremer, FULL_COLOR_SCALES.fuschia, 6),
  'fuschia-outremer': createDivergingScheme(FULL_COLOR_SCALES.fuschia, FULL_COLOR_SCALES.outremer, 6),
}

/**
 * Get diverging colors by explicit indices from full scales
 * @param schemeName - Base scheme name (e.g., 'fuschia-canard')
 * @param indices - Array of indices: negative side indices, then positive side indices
 * @returns Array of colors
 */
export function getDivergingSchemeByIndices(
  schemeName: string,
  indices: number[],
): string[] | undefined {
  const schemeMap: Record<string, [readonly string[], readonly string[]]> = {
    'fuschia-canard': [FULL_COLOR_SCALES.fuschia, FULL_COLOR_SCALES.canard],
    'canard-fuschia': [FULL_COLOR_SCALES.canard, FULL_COLOR_SCALES.fuschia],
    'ambre-outremer': [FULL_COLOR_SCALES.ambre, FULL_COLOR_SCALES.outremer],
    'outremer-ambre': [FULL_COLOR_SCALES.outremer, FULL_COLOR_SCALES.ambre],
    'amethyste-bouteille': [FULL_COLOR_SCALES.amethyste, FULL_COLOR_SCALES.bouteille],
    'bouteille-amethyste': [FULL_COLOR_SCALES.bouteille, FULL_COLOR_SCALES.amethyste],
    'petrole-ambre': [FULL_COLOR_SCALES.petrole, FULL_COLOR_SCALES.ambre],
    'ambre-petrole': [FULL_COLOR_SCALES.ambre, FULL_COLOR_SCALES.petrole],
    'outremer-fuschia': [FULL_COLOR_SCALES.outremer, FULL_COLOR_SCALES.fuschia],
    'fuschia-outremer': [FULL_COLOR_SCALES.fuschia, FULL_COLOR_SCALES.outremer],
  }

  const scales = schemeMap[schemeName]
  if (!scales)
    return undefined

  const colors: string[] = []

  // Process each index
  for (const index of indices) {
    // Negative indices (0-18) use the negative scale
    // Positive indices (19-37) use the positive scale
    if (index < 19) {
      colors.push(scales[0][index]!)
    }
    else {
      colors.push(scales[1][index - 19]!)
    }
  }

  return colors
}

/**
 * Get a diverging color scheme with a specific number of colors
 * @param schemeName - Base scheme name (e.g., 'fuschia-canard')
 * @param numColors - Total number of colors (must be even for symmetric, any number for asymmetric)
 * @param minIndex - Minimum index to sample from (default: 1, matches sequential schemes)
 * @param maxIndex - Maximum index to sample from (default: 13, matches sequential schemes)
 * @param numNegative - Number of colors for negative side (for asymmetric scales)
 * @param numPositive - Number of colors for positive side (for asymmetric scales)
 * @returns Array of colors sampled from the full scales
 */
export function getDivergingScheme(
  schemeName: string,
  numColors: number = 6,
  minIndex: number = 1,
  maxIndex: number = 13,
  numNegative?: number,
  numPositive?: number,
): string[] | undefined {
  const schemeMap: Record<string, [readonly string[], readonly string[]]> = {
    'fuschia-canard': [FULL_COLOR_SCALES.fuschia, FULL_COLOR_SCALES.canard],
    'canard-fuschia': [FULL_COLOR_SCALES.canard, FULL_COLOR_SCALES.fuschia],
    'ambre-outremer': [FULL_COLOR_SCALES.ambre, FULL_COLOR_SCALES.outremer],
    'outremer-ambre': [FULL_COLOR_SCALES.outremer, FULL_COLOR_SCALES.ambre],
    'amethyste-bouteille': [FULL_COLOR_SCALES.amethyste, FULL_COLOR_SCALES.bouteille],
    'bouteille-amethyste': [FULL_COLOR_SCALES.bouteille, FULL_COLOR_SCALES.amethyste],
    'petrole-ambre': [FULL_COLOR_SCALES.petrole, FULL_COLOR_SCALES.ambre],
    'ambre-petrole': [FULL_COLOR_SCALES.ambre, FULL_COLOR_SCALES.petrole],
    'outremer-fuschia': [FULL_COLOR_SCALES.outremer, FULL_COLOR_SCALES.fuschia],
    'fuschia-outremer': [FULL_COLOR_SCALES.fuschia, FULL_COLOR_SCALES.outremer],
  }

  const scales = schemeMap[schemeName]
  if (!scales)
    return undefined

  // Asymmetric: use specified counts for each side
  if (numNegative !== undefined && numPositive !== undefined) {
    const colors: string[] = []

    // Sample negative side (from dark to light)
    for (let i = 0; i < numNegative; i++) {
      const index = Math.round((maxIndex - minIndex) * (numNegative - 1 - i) / Math.max(1, numNegative - 1)) + minIndex
      colors.push(scales[0][index]!)
    }

    // Sample positive side (from light to dark)
    for (let i = 0; i < numPositive; i++) {
      const index = Math.round((maxIndex - minIndex) * i / Math.max(1, numPositive - 1)) + minIndex
      colors.push(scales[1][index]!)
    }

    return colors
  }

  // Symmetric: use standard createDivergingScheme
  return createDivergingScheme(scales[0], scales[1], numColors, minIndex, maxIndex)
}

// Sequential color scheme options (for non-diverging metrics)
export const SEQUENTIAL_COLOR_SCHEME_OPTIONS: InputEntry[] = [
  { label: 'Automatique', key: 'auto' },
  { label: 'Ambré', key: 'ambre' },
  { label: 'Bouteille', key: 'bouteille' },
  { label: 'Canard', key: 'canard' },
  { label: 'Pétrole', key: 'petrole' },
  { label: 'Outremer', key: 'outremer' },
  { label: 'Améthyste', key: 'amethyste' },
  { label: 'Fuschia', key: 'fuschia' },
]

// Diverging color scheme options (for diverging metrics)
export const DIVERGING_COLOR_SCHEME_OPTIONS: InputEntry[] = [
  { label: 'Automatique', key: 'auto' },
  { label: 'Fuschia → Canard', key: 'fuschia-canard' },
  { label: 'Canard → Fuschia', key: 'canard-fuschia' },
  { label: 'Ambre → Outremer', key: 'ambre-outremer' },
  { label: 'Outremer → Ambre', key: 'outremer-ambre' },
  { label: 'Améthyste → Bouteille', key: 'amethyste-bouteille' },
  { label: 'Bouteille → Améthyste', key: 'bouteille-amethyste' },
  { label: 'Pétrole → Ambre', key: 'petrole-ambre' },
  { label: 'Ambre → Pétrole', key: 'ambre-petrole' },
  { label: 'Outremer → Fuschia', key: 'outremer-fuschia' },
  { label: 'Fuschia → Outremer', key: 'fuschia-outremer' },
]

// Default export for backward compatibility (sequential only)
export const COLOR_SCHEME_OPTIONS = SEQUENTIAL_COLOR_SCHEME_OPTIONS
