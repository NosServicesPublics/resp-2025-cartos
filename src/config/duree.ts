import type { ServiceConfig } from '@/services/service-config'
import { COLOR_SCHEME_OPTIONS } from '@/config/color-schemes'

export const dureeConfig: ServiceConfig = {
  id: 'duree',
  title: 'Durées d\'accès',
  dataFile: `${import.meta.env.BASE_URL}data/duree.csv`,

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
        { label: 'valeur médiane', key: 'mediane' },
        { label: 'valeur moyenne', key: 'moyenne' },
      ],
    },
    {
      key: 'facility',
      label: 'Service ou équipement',
      entries: [
        { label: 'Police', key: 'police' },
        { label: 'Gendarmerie', key: 'gendarmerie' },
        { label: 'Réseau de proximité Pôle emploi', key: 'reseau_de_proximite_pole_emploi' },
        { label: 'Aéroport', key: 'aeroport' },
        { label: 'Gare de voyageurs d\'intérêt national', key: 'gare_de_voyageurs_d_interet_nat' },
        { label: 'Gare de voyageurs d\'intérêt régional', key: 'gare_de_voyageurs_d_interet_reg' },
        { label: 'Gare de voyageurs d\'intérêt local', key: 'gare_de_voyageurs_d_interet_loc' },
        { label: 'Implantations France Services (IFS)', key: 'implantations_france_services_i' },
        { label: 'Bureau de poste', key: 'bureau_de_poste' },
        { label: 'Agence postale', key: 'agence_postale' },
        { label: 'École maternelle', key: 'ecole_maternelle' },
        { label: 'École primaire', key: 'ecole_primaire' },
        { label: 'École élémentaire', key: 'ecole_elementaire' },
        { label: 'Collège', key: 'college' },
        { label: 'Lycée d\'enseignement général et/ou technologique', key: 'lycee_d_enseignement_general_et' },
        { label: 'Lycée d\'enseignement professionnel', key: 'lycee_d_enseignement_profession' },
        { label: 'Lycée d\'enseignement technique et/ou professionnel agricole', key: 'lycee_d_enseignement_technique_' },
        { label: 'Établissement de santé (court séjour)', key: 'etablissement_sante_court_sejou' },
        { label: 'Établissement de santé (moyen séjour)', key: 'etablissement_sante_moyen_sejou' },
        { label: 'Établissement de santé (long séjour)', key: 'etablissement_sante_long_sejour' },
        { label: 'Urgences', key: 'urgences' },
        { label: 'Maternité', key: 'maternite' },
        { label: 'Dialyse', key: 'dialyse' },
        { label: 'Laboratoire d\'analyses et de biologie médicale', key: 'laboratoire_d_analyses_et_de_bi' },
        { label: 'Ambulance', key: 'ambulance' },
        { label: 'Pharmacie', key: 'pharmacie' },
        { label: 'Cinéma', key: 'cinema' },
        { label: 'Bibliothèque', key: 'bibliotheque' },
        { label: 'Arts du spectacle', key: 'arts_du_spectacle' },
        { label: 'Déchèterie', key: 'decheterie' },
        { label: 'Panier', key: 'panier_dep' },
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
      mediane: {
        default: 'Durée médiane d\'accès à l\'équipement ou service "{facility}"',
        police: 'Durée médiane d\'accès à un commissariat de police',
        gendarmerie: 'Durée médiane d\'accès à une brigade de gendarmerie',
        reseau_de_proximite_pole_emploi: 'Durée médiane d\'accès à une agence Pôle emploi',
        aeroport: 'Durée médiane d\'accès à un aéroport',
        gare_de_voyageurs_d_interet_nat: 'Durée médiane d\'accès à une gare d\'intérêt national',
        gare_de_voyageurs_d_interet_reg: 'Durée médiane d\'accès à une gare d\'intérêt régional',
        gare_de_voyageurs_d_interet_loc: 'Durée médiane d\'accès à une gare d\'intérêt local',
        implantations_france_services_i: 'Durée médiane d\'accès à une maison France Services',
        bureau_de_poste: 'Durée médiane d\'accès à un bureau de poste',
        agence_postale: 'Durée médiane d\'accès à une agence postale',
        ecole_maternelle: 'Durée médiane d\'accès à une école maternelle',
        ecole_primaire: 'Durée médiane d\'accès à une école primaire',
        ecole_elementaire: 'Durée médiane d\'accès à une école élémentaire',
        college: 'Durée médiane d\'accès à un collège',
        lycee_d_enseignement_general_et: 'Durée médiane d\'accès à un lycée général et/ou technologique',
        lycee_d_enseignement_profession: 'Durée médiane d\'accès à un lycée professionnel',
        lycee_d_enseignement_technique_: 'Durée médiane d\'accès à un lycée agricole',
        etablissement_sante_court_sejou: 'Durée médiane d\'accès à un établissement de santé (court séjour)',
        etablissement_sante_moyen_sejou: 'Durée médiane d\'accès à un établissement de santé (moyen séjour)',
        etablissement_sante_long_sejour: 'Durée médiane d\'accès à un établissement de santé (long séjour)',
        urgences: 'Durée médiane d\'accès à un service d\'urgences',
        maternite: 'Durée médiane d\'accès à une maternité',
        dialyse: 'Durée médiane d\'accès à un centre de dialyse',
        laboratoire_d_analyses_et_de_bi: 'Durée médiane d\'accès à un laboratoire d\'analyses médicales',
        ambulance: 'Durée médiane d\'accès à un service d\'ambulance',
        pharmacie: 'Durée médiane d\'accès à une pharmacie',
        cinema: 'Durée médiane d\'accès à un cinéma',
        bibliotheque: 'Durée médiane d\'accès à une bibliothèque',
        arts_du_spectacle: 'Durée médiane d\'accès à une salle de spectacle',
        decheterie: 'Durée médiane d\'accès à une déchèterie',
        panier_dep: 'Durée médiane d\'accès au panier de services essentiels',
      },
      moyenne: {
        default: 'Durée moyenne d\'accès à l\'équipement ou service "{facility}"',
        police: 'Durée moyenne d\'accès à un commissariat de police',
        gendarmerie: 'Durée moyenne d\'accès à une brigade de gendarmerie',
        reseau_de_proximite_pole_emploi: 'Durée moyenne d\'accès à une agence Pôle emploi',
        aeroport: 'Durée moyenne d\'accès à un aéroport',
        gare_de_voyageurs_d_interet_nat: 'Durée moyenne d\'accès à une gare d\'intérêt national',
        gare_de_voyageurs_d_interet_reg: 'Durée moyenne d\'accès à une gare d\'intérêt régional',
        gare_de_voyageurs_d_interet_loc: 'Durée moyenne d\'accès à une gare d\'intérêt local',
        implantations_france_services_i: 'Durée moyenne d\'accès à une maison France Services',
        bureau_de_poste: 'Durée moyenne d\'accès à un bureau de poste',
        agence_postale: 'Durée moyenne d\'accès à une agence postale',
        ecole_maternelle: 'Durée moyenne d\'accès à une école maternelle',
        ecole_primaire: 'Durée moyenne d\'accès à une école primaire',
        ecole_elementaire: 'Durée moyenne d\'accès à une école élémentaire',
        college: 'Durée moyenne d\'accès à un collège',
        lycee_d_enseignement_general_et: 'Durée moyenne d\'accès à un lycée général et/ou technologique',
        lycee_d_enseignement_profession: 'Durée moyenne d\'accès à un lycée professionnel',
        lycee_d_enseignement_technique_: 'Durée moyenne d\'accès à un lycée agricole',
        etablissement_sante_court_sejou: 'Durée moyenne d\'accès à un établissement de santé (court séjour)',
        etablissement_sante_moyen_sejou: 'Durée moyenne d\'accès à un établissement de santé (moyen séjour)',
        etablissement_sante_long_sejour: 'Durée moyenne d\'accès à un établissement de santé (long séjour)',
        urgences: 'Durée moyenne d\'accès à un service d\'urgences',
        maternite: 'Durée moyenne d\'accès à une maternité',
        dialyse: 'Durée moyenne d\'accès à un centre de dialyse',
        laboratoire_d_analyses_et_de_bi: 'Durée moyenne d\'accès à un laboratoire d\'analyses médicales',
        ambulance: 'Durée moyenne d\'accès à un service d\'ambulance',
        pharmacie: 'Durée moyenne d\'accès à une pharmacie',
        cinema: 'Durée moyenne d\'accès à un cinéma',
        bibliotheque: 'Durée moyenne d\'accès à une bibliothèque',
        arts_du_spectacle: 'Durée moyenne d\'accès à une salle de spectacle',
        decheterie: 'Durée moyenne d\'accès à une déchèterie',
        panier_dep: 'Durée moyenne d\'accès au panier de services essentiels',
      },
    },
    colorSchemes: {
      mediane: {
        scheme: 'oranges',
        label: 'Durée médiane (min)',
      },
      moyenne: {
        scheme: 'reds',
        label: 'Durée moyenne (min)',
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
