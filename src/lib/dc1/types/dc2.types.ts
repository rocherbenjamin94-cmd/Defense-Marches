// DC2 - Déclaration du candidat individuel ou du membre du groupement

export interface DC2FormData {
  // Section A - Identification du candidat (pré-rempli depuis DC1)
  identification: IdentificationSection;
  // Section B - Renseignements relatifs à la situation juridique
  situation_juridique: SituationJuridiqueSection;
  // Section C - Capacités économiques et financières
  capacites_economiques: CapacitesEconomiquesSection;
  // Section D - Capacités techniques et professionnelles
  capacites_techniques: CapacitesTechniquesSection;
  // Section E - Moyens techniques
  moyens_techniques: MoyensTechniquesSection;
}

// Section A - Identification
export interface IdentificationSection {
  siret: string;
  siren: string;
  denomination_sociale: string;
  nom_commercial: string;
  adresse_siege: string;
  adresse_etablissement: string;
  email: string;
  telephone: string;
  fax: string;
}

// Section B - Situation juridique
export interface SituationJuridiqueSection {
  forme_juridique: string;
  date_creation: string;
  capital_social: string;
  devise_capital: string;
  numero_rcs: string;
  ville_rcs: string;
  numero_rm: string;
  code_naf: string;
  libelle_naf: string;
}

// Section C - Capacités économiques
export interface CapacitesEconomiquesSection {
  chiffre_affaires_global: ChiffreAffaires[];
  chiffre_affaires_domaine: ChiffreAffaires[];
  assurance_rc_pro: string;
  assurance_decennale: string;
}

export interface ChiffreAffaires {
  annee: number;
  montant: string; // string pour faciliter la saisie avec séparateurs
}

// Section D - Capacités techniques
export interface CapacitesTechniquesSection {
  effectifs: Effectif[];
  effectif_encadrement: string;
  references: Reference[];
  certifications: Certification[];
}

export interface Effectif {
  annee: number;
  nombre: string;
}

export interface Reference {
  id: string;
  client: string;
  objet: string;
  montant: string;
  annee: string;
  contact: string;
}

export interface Certification {
  id: string;
  nom: string;
  organisme: string;
  date_validite: string;
}

// Section E - Moyens techniques
export interface MoyensTechniquesSection {
  equipements: string;
  outillage: string;
  locaux: string;
}

// Année courante pour les tableaux
const currentYear = new Date().getFullYear();

// Valeurs initiales
export const initialDC2FormData: DC2FormData = {
  identification: {
    siret: '',
    siren: '',
    denomination_sociale: '',
    nom_commercial: '',
    adresse_siege: '',
    adresse_etablissement: '',
    email: '',
    telephone: '',
    fax: '',
  },
  situation_juridique: {
    forme_juridique: '',
    date_creation: '',
    capital_social: '',
    devise_capital: 'EUR',
    numero_rcs: '',
    ville_rcs: '',
    numero_rm: '',
    code_naf: '',
    libelle_naf: '',
  },
  capacites_economiques: {
    chiffre_affaires_global: [
      { annee: currentYear - 1, montant: '' },
      { annee: currentYear - 2, montant: '' },
      { annee: currentYear - 3, montant: '' },
    ],
    chiffre_affaires_domaine: [
      { annee: currentYear - 1, montant: '' },
      { annee: currentYear - 2, montant: '' },
      { annee: currentYear - 3, montant: '' },
    ],
    assurance_rc_pro: '',
    assurance_decennale: '',
  },
  capacites_techniques: {
    effectifs: [
      { annee: currentYear - 1, nombre: '' },
      { annee: currentYear - 2, nombre: '' },
      { annee: currentYear - 3, nombre: '' },
    ],
    effectif_encadrement: '',
    references: [],
    certifications: [],
  },
  moyens_techniques: {
    equipements: '',
    outillage: '',
    locaux: '',
  },
};

// Factory functions
export const createEmptyReference = (): Reference => ({
  id: crypto.randomUUID(),
  client: '',
  objet: '',
  montant: '',
  annee: '',
  contact: '',
});

export const createEmptyCertification = (): Certification => ({
  id: crypto.randomUUID(),
  nom: '',
  organisme: '',
  date_validite: '',
});
