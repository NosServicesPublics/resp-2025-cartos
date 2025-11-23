import type { ServiceConfig } from '@/services/service-config'
import { COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const inegalitesV2Config: ServiceConfig = {
  id: 'inegalites-v2',
  title: 'Inégalités d\'accès (v2)',
  thematicCategory: 'guichets',
  dataFile: `${import.meta.env.BASE_URL}data/inegalites_v2.csv`,

  // Preprocessor to expand aggregate DOM code "97" to individual DOM territories
  dataPreprocessor: (rows) => {
    const DOM_CODES = ['971', '972', '973', '974', '976']
    const expandedRows: any[] = []

    for (const row of rows) {
      if (row.dep === '97') {
        // Replicate this row for each DOM territory
        for (const code of DOM_CODES) {
          expandedRows.push({ ...row, dep: code })
        }
      }
      else {
        expandedRows.push(row)
      }
    }

    return expandedRows
  },

  formControls: [
    {
      key: 'metric',
      label: 'Indicateur',
      entries: [
        { label: 'Moyenne', key: 'moyenne' },
        { label: 'Médiane', key: 'mediane' },
        { label: 'Décile 1 (D1)', key: 'decile1' },
        { label: 'Décile 9 (D9)', key: 'decile9' },
        { label: 'Écart interquartile (IQR)', key: 'iqr' },
        { label: 'IQR relatif', key: 'iqr_rel' },
        { label: 'Coefficient de variation', key: 'coeff_var' },
        { label: 'Coefficient de Gini', key: 'gini' },
        { label: 'Rapport D9/D1', key: 'rapport_d9_d1' },
      ],
    },
    {
      key: 'facility',
      label: 'Service ou équipement',
      entries: [
        { label: 'Police', key: 'A101' },
        { label: 'Gendarmerie', key: 'A104' },
        { label: 'Réseau de proximité Pôle emploi', key: 'A122' },
        { label: 'Implantations France Services (IFS)', key: 'A128' },
        { label: 'Déchèterie', key: 'A133' },
        { label: 'Bureau de poste', key: 'A206' },
        { label: 'Agence postale', key: 'A208' },
        { label: 'École maternelle', key: 'C107' },
        { label: 'École primaire', key: 'C108' },
        { label: 'École élémentaire', key: 'C109' },
        { label: 'Collège', key: 'C201' },
        { label: 'Lycée général et/ou technologique', key: 'C301' },
        { label: 'Lycée professionnel', key: 'C302' },
        { label: 'Lycée agricole', key: 'C303' },
        { label: 'Institut universitaire', key: 'C502' },
        { label: 'Établissement de santé (court séjour)', key: 'D101' },
        { label: 'Établissement de santé (moyen séjour)', key: 'D102' },
        { label: 'Établissement de santé (long séjour)', key: 'D103' },
        { label: 'Urgences', key: 'D106' },
        { label: 'Maternité', key: 'D107' },
        { label: 'Dialyse', key: 'D111' },
        { label: 'Laboratoire d\'analyses médicales', key: 'D302' },
        { label: 'Ambulance', key: 'D303' },
        { label: 'Pharmacie', key: 'D307' },
        { label: 'Aéroport', key: 'E102' },
        { label: 'Gare d\'intérêt national', key: 'E107' },
        { label: 'Gare d\'intérêt régional', key: 'E108' },
        { label: 'Gare d\'intérêt local', key: 'E109' },
        { label: 'Cinéma', key: 'F303' },
        { label: 'Bibliothèque', key: 'F307' },
        { label: 'Arts du spectacle', key: 'F315' },
        { label: 'Panier de services essentiels', key: 'Panier' },
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
        default: 'Durée d\'accès moyenne à {facility}',
        A101: 'Durée d\'accès moyenne à un commissariat de police',
        A104: 'Durée d\'accès moyenne à une brigade de gendarmerie',
        A122: 'Durée d\'accès moyenne à une agence Pôle emploi',
        A128: 'Durée d\'accès moyenne à une maison France Services',
        A133: 'Durée d\'accès moyenne à une déchèterie',
        A206: 'Durée d\'accès moyenne à un bureau de poste',
        A208: 'Durée d\'accès moyenne à une agence postale',
        C107: 'Durée d\'accès moyenne à une école maternelle',
        C108: 'Durée d\'accès moyenne à une école primaire',
        C109: 'Durée d\'accès moyenne à une école élémentaire',
        C201: 'Durée d\'accès moyenne à un collège',
        C301: 'Durée d\'accès moyenne à un lycée général et/ou technologique',
        C302: 'Durée d\'accès moyenne à un lycée professionnel',
        C303: 'Durée d\'accès moyenne à un lycée agricole',
        C502: 'Durée d\'accès moyenne à un institut universitaire',
        D101: 'Durée d\'accès moyenne à un établissement de santé (court séjour)',
        D102: 'Durée d\'accès moyenne à un établissement de santé (moyen séjour)',
        D103: 'Durée d\'accès moyenne à un établissement de santé (long séjour)',
        D106: 'Durée d\'accès moyenne à un service d\'urgences',
        D107: 'Durée d\'accès moyenne à une maternité',
        D111: 'Durée d\'accès moyenne à un centre de dialyse',
        D302: 'Durée d\'accès moyenne à un laboratoire d\'analyses médicales',
        D303: 'Durée d\'accès moyenne à un service d\'ambulance',
        D307: 'Durée d\'accès moyenne à une pharmacie',
        E102: 'Durée d\'accès moyenne à un aéroport',
        E107: 'Durée d\'accès moyenne à une gare d\'intérêt national',
        E108: 'Durée d\'accès moyenne à une gare d\'intérêt régional',
        E109: 'Durée d\'accès moyenne à une gare d\'intérêt local',
        F303: 'Durée d\'accès moyenne à un cinéma',
        F307: 'Durée d\'accès moyenne à une bibliothèque',
        F315: 'Durée d\'accès moyenne à une salle de spectacle',
        Panier: 'Durée d\'accès moyenne au panier de services essentiels',
      },
      mediane: {
        default: 'Durée d\'accès médiane à {facility}',
        A101: 'Durée d\'accès médiane à un commissariat de police',
        A104: 'Durée d\'accès médiane à une brigade de gendarmerie',
        A122: 'Durée d\'accès médiane à une agence Pôle emploi',
        A128: 'Durée d\'accès médiane à une maison France Services',
        A133: 'Durée d\'accès médiane à une déchèterie',
        A206: 'Durée d\'accès médiane à un bureau de poste',
        A208: 'Durée d\'accès médiane à une agence postale',
        C107: 'Durée d\'accès médiane à une école maternelle',
        C108: 'Durée d\'accès médiane à une école primaire',
        C109: 'Durée d\'accès médiane à une école élémentaire',
        C201: 'Durée d\'accès médiane à un collège',
        C301: 'Durée d\'accès médiane à un lycée général et/ou technologique',
        C302: 'Durée d\'accès médiane à un lycée professionnel',
        C303: 'Durée d\'accès médiane à un lycée agricole',
        C502: 'Durée d\'accès médiane à un institut universitaire',
        D101: 'Durée d\'accès médiane à un établissement de santé (court séjour)',
        D102: 'Durée d\'accès médiane à un établissement de santé (moyen séjour)',
        D103: 'Durée d\'accès médiane à un établissement de santé (long séjour)',
        D106: 'Durée d\'accès médiane à un service d\'urgences',
        D107: 'Durée d\'accès médiane à une maternité',
        D111: 'Durée d\'accès médiane à un centre de dialyse',
        D302: 'Durée d\'accès médiane à un laboratoire d\'analyses médicales',
        D303: 'Durée d\'accès médiane à un service d\'ambulance',
        D307: 'Durée d\'accès médiane à une pharmacie',
        E102: 'Durée d\'accès médiane à un aéroport',
        E107: 'Durée d\'accès médiane à une gare d\'intérêt national',
        E108: 'Durée d\'accès médiane à une gare d\'intérêt régional',
        E109: 'Durée d\'accès médiane à une gare d\'intérêt local',
        F303: 'Durée d\'accès médiane à un cinéma',
        F307: 'Durée d\'accès médiane à une bibliothèque',
        F315: 'Durée d\'accès médiane à une salle de spectacle',
        Panier: 'Durée d\'accès médiane au panier de services essentiels',
      },
      decile1: {
        default: 'Durée d\'accès au 1er décile (D1) à {facility}',
        Panier: 'Durée d\'accès au 1er décile (D1) au panier de services essentiels',
      },
      decile9: {
        default: 'Durée d\'accès au 9e décile (D9) à {facility}',
        Panier: 'Durée d\'accès au 9e décile (D9) au panier de services essentiels',
      },
      iqr: {
        default: 'Écart interquartile (IQR) pour l\'accès à {facility}',
        Panier: 'Écart interquartile (IQR) pour l\'accès au panier de services essentiels',
      },
      iqr_rel: {
        default: 'IQR relatif pour l\'accès à {facility}',
        Panier: 'IQR relatif pour l\'accès au panier de services essentiels',
      },
      coeff_var: {
        default: 'Coefficient de variation pour l\'accès à {facility}',
        Panier: 'Coefficient de variation pour l\'accès au panier de services essentiels',
      },
      gini: {
        default: 'Coefficient de Gini pour l\'accès à {facility}',
        Panier: 'Coefficient de Gini pour l\'accès au panier de services essentiels',
      },
      rapport_d9_d1: {
        default: 'Rapport D9/D1 pour l\'accès à {facility}',
        Panier: 'Rapport D9/D1 pour l\'accès au panier de services essentiels',
      },
    },
    colorSchemes: {
      moyenne: {
        type: 'quantize',
        scheme: 'OrRd',
        label: 'Durée moyenne (min)',
      },
      mediane: {
        type: 'quantize',
        scheme: 'oranges',
        label: 'Durée médiane (min)',
      },
      decile1: {
        type: 'quantize',
        scheme: 'greens',
        label: 'D1 (min)',
      },
      decile9: {
        type: 'quantize',
        scheme: 'purples',
        label: 'D9 (min)',
      },
      iqr: {
        type: 'quantize',
        scheme: 'blues',
        label: 'IQR (min)',
      },
      iqr_rel: {
        type: 'quantize',
        scheme: 'teals',
        label: 'IQR relatif',
      },
      coeff_var: {
        type: 'quantize',
        scheme: 'ylgnbu',
        label: 'Coefficient de variation',
      },
      gini: {
        type: 'quantize',
        scheme: 'reds',
        label: 'Coefficient de Gini',
      },
      rapport_d9_d1: {
        type: 'quantize',
        scheme: 'rdpu',
        label: 'Rapport D9/D1',
      },
    },
    dataKeys: {
      rowKey: 'dep',
      featureKey: 'INSEE_DEP',
    },
    tooltip: {
      template: 'single-metric',
    },
  },
}
