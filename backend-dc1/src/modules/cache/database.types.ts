export interface EntrepriseRecord {
  id: number;
  siren: string;
  siret: string;
  nom_entreprise: string;
  denomination_sociale: string | null;
  forme_juridique: string | null;
  adresse_ligne_1: string | null;
  code_postal: string | null;
  ville: string | null;
  code_naf: string | null;
  libelle_naf: string | null;
  effectif: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  // Champs additionnels pour DC2 Section B
  date_creation: string | null;
  capital: number | null;
  numero_rcs: string | null;
  greffe: string | null;
}

export interface EntrepriseInput {
  siren: string;
  siret: string;
  nom_entreprise: string;
  denomination_sociale?: string;
  forme_juridique?: string;
  adresse_ligne_1?: string;
  code_postal?: string;
  ville?: string;
  code_naf?: string;
  libelle_naf?: string;
  effectif?: string;
  // Champs additionnels pour DC2 Section B
  date_creation?: string;
  capital?: number;
  numero_rcs?: string;
  greffe?: string;
}

export interface SearchLogRecord {
  id: number;
  query: string;
  query_type: string;
  source: string;
  resultat_count: number;
  created_at: string;
}

export interface CacheStats {
  total_entreprises: number;
  from_pappers: number;
  total_searches: number;
  cache_hits: number;
  cache_hit_rate: string;
}

export interface LookupResult<T> {
  data: T;
  source: 'cache' | 'pappers';
  cached_at?: string;
}
