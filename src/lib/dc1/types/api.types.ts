export interface EntrepriseData {
  siren?: string;
  siret?: string;
  nom_commercial?: string;
  denomination_sociale?: string;
  adresse_etablissement?: string;
  adresse_siege?: string;
  forme_juridique?: string;
  code_naf?: string;
  libelle_naf?: string;
  libelle_code_naf?: string;
  effectif?: string;
  // Champs additionnels pour DC2
  date_creation?: string;
  date_creation_formate?: string;
  capital?: number;
  numero_rcs?: string;
  greffe?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LookupResponse {
  success: boolean;
  data: EntrepriseData | EntrepriseData[];
  message: string;
}
