import type { ServiceConfig } from '@/services/service-config'
import { COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const inegalitesConfig: ServiceConfig = {
  id: 'inegalites',
  title: 'Inégalités',
  dataFile: `${import.meta.env.BASE_URL}data/inegalites-merged.csv`,
  formControls: [
    {
      key: 'metric',
      label: 'Indicateur',
      entries: [
        { label: 'Moyenne', key: 'moyenne' },
        { label: 'Décile 1 (D1)', key: 'd1' },
        { label: 'Décile 9 (D9)', key: 'd9' },
        { label: 'Minimum', key: 'min' },
        { label: 'Maximum', key: 'max' },
        { label: 'Amplitude (D9-D1)', key: 'amplitude' },
        { label: 'Coefficient de Gini', key: 'gini' },
      ],
    },
    {
      key: 'facility',
      label: 'Service',
      entries: [
        { label: 'Urgences', key: 'urgences' },
        { label: 'Maternité', key: 'maternite' },
        { label: 'Centre de santé', key: 'centre_sante' },
        { label: 'École maternelle', key: 'ecole' },
        { label: 'France Services', key: 'inegalites-france-services' },
      ],
    },
    {
      key: 'colorScheme',
      label: 'Palette de couleurs',
      entries: COLOR_SCHEME_OPTIONS,
    },
  ],
  rendering: {
    titleTemplates: {
      moyenne: {
        'default': 'Durée d\'accès moyenne à {facility}',
        'urgences': 'Durée d\'accès moyenne aux urgences',
        'maternite': 'Durée d\'accès moyenne à une maternité',
        'centre_sante': 'Durée d\'accès moyenne à un centre de santé',
        'ecole': 'Durée d\'accès moyenne à une école maternelle',
        'inegalites-france-services': 'Durée d\'accès moyenne à une maison France Services',
      },
      d1: {
        'default': 'Durée d\'accès au 1er décile (D1) à {facility}',
        'urgences': 'Durée d\'accès au 1er décile (D1) aux urgences',
        'maternite': 'Durée d\'accès au 1er décile (D1) à une maternité',
        'centre_sante': 'Durée d\'accès au 1er décile (D1) à un centre de santé',
        'ecole': 'Durée d\'accès au 1er décile (D1) à une école maternelle',
        'inegalites-france-services': 'Durée d\'accès au 1er décile (D1) à une maison France Services',
      },
      d9: {
        'default': 'Durée d\'accès au 9e décile (D9) à {facility}',
        'urgences': 'Durée d\'accès au 9e décile (D9) aux urgences',
        'maternite': 'Durée d\'accès au 9e décile (D9) à une maternité',
        'centre_sante': 'Durée d\'accès au 9e décile (D9) à un centre de santé',
        'ecole': 'Durée d\'accès au 9e décile (D9) à une école maternelle',
        'inegalites-france-services': 'Durée d\'accès au 9e décile (D9) à une maison France Services',
      },
      min: {
        'default': 'Durée d\'accès minimum à {facility}',
        'urgences': 'Durée d\'accès minimum aux urgences',
        'maternite': 'Durée d\'accès minimum à une maternité',
        'centre_sante': 'Durée d\'accès minimum à un centre de santé',
        'ecole': 'Durée d\'accès minimum à une école maternelle',
        'inegalites-france-services': 'Durée d\'accès minimum à une maison France Services',
      },
      max: {
        'default': 'Durée d\'accès maximum à {facility}',
        'urgences': 'Durée d\'accès maximum aux urgences',
        'maternite': 'Durée d\'accès maximum à une maternité',
        'centre_sante': 'Durée d\'accès maximum à un centre de santé',
        'ecole': 'Durée d\'accès maximum à une école maternelle',
        'inegalites-france-services': 'Durée d\'accès maximum à une maison France Services',
      },
      gini: {
        'default': 'Coefficient de Gini pour l\'accès à {facility}',
        'urgences': 'Coefficient de Gini pour l\'accès aux urgences',
        'maternite': 'Coefficient de Gini pour l\'accès à une maternité',
        'centre_sante': 'Coefficient de Gini pour l\'accès à un centre de santé',
        'ecole': 'Coefficient de Gini pour l\'accès à une école maternelle',
        'inegalites-france-services': 'Coefficient de Gini pour l\'accès à une maison France Services',
      },
      amplitude: {
        'default': 'Amplitude des durées d\'accès (D9-D1) à {facility}',
        'urgences': 'Amplitude des durées d\'accès (D9-D1) aux urgences',
        'maternite': 'Amplitude des durées d\'accès (D9-D1) à une maternité',
        'centre_sante': 'Amplitude des durées d\'accès (D9-D1) à un centre de santé',
        'ecole': 'Amplitude des durées d\'accès (D9-D1) à une école maternelle',
        'inegalites-france-services': 'Amplitude des durées d\'accès (D9-D1) à une maison France Services',
      },
    },
    colorSchemes: {
      moyenne: {
        type: 'quantize',
        scheme: 'OrRd',
        label: 'durée moyenne (min)',
      },
      d1: {
        type: 'quantize',
        scheme: 'OrRd',
        label: 'D1 (min)',
      },
      d9: {
        type: 'quantize',
        scheme: 'OrRd',
        label: 'D9 (min)',
      },
      min: {
        type: 'quantize',
        scheme: 'OrRd',
        label: 'durée minimum (min)',
      },
      max: {
        type: 'quantize',
        scheme: 'OrRd',
        label: 'durée maximum (min)',
      },
      amplitude: {
        scheme: 'OrRd',
        label: 'amplitude D9-D1 (min)',
      },
      gini: {
        type: 'quantize',
        scheme: 'OrRd',
        label: 'coefficient de Gini',
      },
    },
    dataKeys: {
      rowKey: 'dep',
      featureKey: 'INSEE_DEP',
    },
    valueProcessor: (row, metric) => {
      // Calculate amplitude as decile9 - decile1
      if (metric === 'amplitude') {
        const d9 = row.d9
        const d1 = row.d1
        if (d9 != null && d1 != null) {
          // Convert to numbers if they're strings
          const d9Num = typeof d9 === 'number' ? d9 : +String(d9).replace(',', '.')
          const d1Num = typeof d1 === 'number' ? d1 : +String(d1).replace(',', '.')
          return d9Num - d1Num
        }
        return null
      }
      // For other metrics, return the value directly
      return row[metric]
    },
    tooltip: {
      template: 'single-metric',
    },
  },
}
