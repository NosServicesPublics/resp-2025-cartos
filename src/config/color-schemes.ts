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

// Diverging 6-color schemes (3 colors on each side, no neutral, pivot at 0)
// Structure: [negative-dark, negative-mid, negative-light, positive-light, positive-mid, positive-dark]
export const DIVERGING_COLOR_SCHEMES: Record<string, string[]> = {
  // Fuschia (negative) → Canard (positive), pivot at 0
  'fuschia-canard': [
    FULL_COLOR_SCALES.fuschia[12]!, // #A11557 - dark negative
    FULL_COLOR_SCALES.fuschia[7]!, // #DE84A1 - mid negative
    FULL_COLOR_SCALES.fuschia[2]!, // #F3CAD6 - light negative
    FULL_COLOR_SCALES.canard[2]!, // #B1DEDA - light positive
    FULL_COLOR_SCALES.canard[7]!, // #00A79F - mid positive
    FULL_COLOR_SCALES.canard[12]!, // #006963 - dark positive
  ],
  // Ambre (negative) → Outremer (positive)
  'ambre-outremer': [
    FULL_COLOR_SCALES.ambre[12]!, // #844200
    FULL_COLOR_SCALES.ambre[7]!, // #C1844F
    FULL_COLOR_SCALES.ambre[2]!, // #EBD0BA
    FULL_COLOR_SCALES.outremer[2]!, // #D4D3F2
    FULL_COLOR_SCALES.outremer[7]!, // #8B8DDC
    FULL_COLOR_SCALES.outremer[12]!, // #3E4EAD
  ],
  // Améthyste (negative) → Bouteille (positive)
  'amethyste-bouteille': [
    FULL_COLOR_SCALES.amethyste[12]!, // #85308B
    FULL_COLOR_SCALES.amethyste[7]!, // #BE7BC0
    FULL_COLOR_SCALES.amethyste[2]!, // #E8CDE8
    FULL_COLOR_SCALES.bouteille[2]!, // #CADABC
    FULL_COLOR_SCALES.bouteille[7]!, // #739F52
    FULL_COLOR_SCALES.bouteille[12]!, // #236200
  ],
  // Pétrole (negative) → Ambre (positive)
  'petrole-ambre': [
    FULL_COLOR_SCALES.petrole[12]!, // #2A566B
    FULL_COLOR_SCALES.petrole[7]!, // #6D94AA
    FULL_COLOR_SCALES.petrole[2]!, // #C8D6DF
    FULL_COLOR_SCALES.ambre[2]!, // #EBD0BA
    FULL_COLOR_SCALES.ambre[7]!, // #C1844F
    FULL_COLOR_SCALES.ambre[12]!, // #844200
  ],
  // Outremer (negative) → Fuschia (positive)
  'outremer-fuschia': [
    FULL_COLOR_SCALES.outremer[12]!, // #3E4EAD
    FULL_COLOR_SCALES.outremer[7]!, // #8B8DDC
    FULL_COLOR_SCALES.outremer[2]!, // #D4D3F2
    FULL_COLOR_SCALES.fuschia[2]!, // #F3CAD6
    FULL_COLOR_SCALES.fuschia[7]!, // #D77294
    FULL_COLOR_SCALES.fuschia[12]!, // #A11557
  ],
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
  { label: 'Ambre → Outremer', key: 'ambre-outremer' },
  { label: 'Améthyste → Bouteille', key: 'amethyste-bouteille' },
  { label: 'Pétrole → Ambre', key: 'petrole-ambre' },
  { label: 'Outremer → Fuschia', key: 'outremer-fuschia' },
]

// Default export for backward compatibility (sequential only)
export const COLOR_SCHEME_OPTIONS = SEQUENTIAL_COLOR_SCHEME_OPTIONS
