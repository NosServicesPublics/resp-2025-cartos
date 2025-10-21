import type { InputEntry } from '@/types/service.types'

export const CUSTOM_COLOR_SCHEMES: Record<string, string[]> = {
  'brand-purple': ['#f6ecfb', '#c69ddf', '#a56dbf', '#7d3f9a', '#41115d'],
  'brand-navy': ['#e7edf8', '#94aedf', '#6384c6', '#3459a3', '#123068'],
  'brand-azure': ['#e9f3fb', '#98c4e8', '#5b9ed3', '#2f77b5', '#144d80'],
  'brand-amber': ['#fcf2e1', '#eeb373', '#de8e42', '#b46529', '#7a4118'],
  'brand-gold': ['#f8f4de', '#d6cc6c', '#baab3a', '#978720', '#615513'],
  'brand-green': ['#e7f4e5', '#8ec38b', '#5e9f61', '#3a7b3d', '#1f4f1d'],
}

export const COLOR_SCHEME_OPTIONS: InputEntry[] = [
  { label: 'Automatique', key: 'auto' },
  { label: 'Violet Resp', key: 'brand-purple' },
  { label: 'Bleu Resp', key: 'brand-navy' },
  { label: 'Azuré Resp', key: 'brand-azure' },
  { label: 'Ambre Resp', key: 'brand-amber' },
  { label: 'Or Resp', key: 'brand-gold' },
  { label: 'Vert Resp', key: 'brand-green' },
]
