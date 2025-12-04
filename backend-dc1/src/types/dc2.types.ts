// DC2 - Déclaration du candidat individuel ou du membre du groupement

export interface DC2FormData {
  identification: IdentificationSection;
  situation_juridique: SituationJuridiqueSection;
  capacites_economiques: CapacitesEconomiquesSection;
  capacites_techniques: CapacitesTechniquesSection;
  moyens_techniques: MoyensTechniquesSection;
}

export interface IdentificationSection {
  siret: string;
  siren: string;
  denomination_sociale: string;
  nom_commercial: string;
  adresse_siege: string;
  adresse_etablissement: string;
  email: string;
  telephone: string;
  fax?: string;
}

export interface SituationJuridiqueSection {
  forme_juridique: string;
  date_creation?: string;
  capital_social?: string;
  devise_capital?: string;
  numero_rcs?: string;
  ville_rcs?: string;
  numero_rm?: string;
  code_naf: string;
  libelle_naf?: string;
}

export interface CapacitesEconomiquesSection {
  chiffre_affaires_global: ChiffreAffaires[];
  chiffre_affaires_domaine: ChiffreAffaires[];
  assurance_rc_pro?: string;
  assurance_decennale?: string;
}

export interface ChiffreAffaires {
  annee: number;
  montant: string;
}

export interface CapacitesTechniquesSection {
  effectifs: Effectif[];
  effectif_encadrement?: string;
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
  montant?: string;
  annee: string;
  contact?: string;
}

export interface Certification {
  id: string;
  nom: string;
  organisme?: string;
  date_validite?: string;
}

export interface MoyensTechniquesSection {
  equipements?: string;
  outillage?: string;
  locaux?: string;
}
