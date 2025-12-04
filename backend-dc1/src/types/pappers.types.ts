export interface PappersResponse {
  siren: string;
  siret: string;
  nom_entreprise: string;
  denomination: string;
  forme_juridique: string;
  siege: PappersSiege;
  dirigeants: PappersDirigeant[];
  code_naf: string;
  libelle_code_naf: string;
  effectif?: string;
  // Champs additionnels pour DC2 Section B
  date_creation?: string;
  date_creation_formate?: string;
  capital?: number;
  numero_rcs?: string;
  greffe?: string;
}

export interface PappersSiege {
  siret: string;
  adresse_ligne_1: string;
  adresse_ligne_2?: string;
  code_postal: string;
  ville: string;
  pays: string;
}

export interface PappersDirigeant {
  nom: string;
  prenom: string;
  qualite: string;
}

export interface PappersSearchResponse {
  resultats: PappersSearchResult[];
  total: number;
}

export interface PappersSearchResult {
  siren: string;
  nom_entreprise: string;
  denomination: string;
  forme_juridique: string;
  siege: PappersSiege;
}

export interface EntrepriseData {
  siren: string;
  siret: string;
  nom_commercial: string;
  denomination_sociale: string;
  adresse_etablissement: string;
  adresse_siege?: string;
  forme_juridique: string;
  code_naf?: string;
  libelle_naf?: string;
  libelle_code_naf?: string;
  effectif?: string;
  dirigeants?: PappersDirigeant[];
  // Champs additionnels pour DC2 Section B
  date_creation?: string;
  date_creation_formate?: string;
  capital?: number;
  numero_rcs?: string;
  greffe?: string;
}
