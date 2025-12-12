export interface DC1FormData {
  acheteur: AcheteurSection;
  consultation: ConsultationSection;
  candidature: CandidatureSection;
  candidat: CandidatSection;
  groupement?: GroupementSection;
  engagements: EngagementsSection;
  mandataire?: MandataireSection;
}

export interface AcheteurSection {
  nom: string;
  reference_avis?: string;
  reference_dossier?: string;
}

export interface ConsultationSection {
  objet: string;
}

export interface CandidatureSection {
  type: 'marche_unique' | 'tous_lots' | 'lots_specifiques';
  lots?: string;
}

export interface CandidatSection {
  mode: 'seul' | 'groupement';
  siret: string;
  siren?: string;
  nom_commercial: string;
  denomination_sociale: string;
  adresse_etablissement: string;
  adresse_siege?: string;
  email: string;
  telephone: string;
  fax?: string;
}

export interface GroupementSection {
  type: 'conjoint' | 'solidaire';
  mandataire_solidaire?: 'oui' | 'non';
  membres: MembreGroupement[];
}

export interface MembreGroupement {
  id: number;
  siret: string;
  nom_commercial: string;
  denomination_sociale: string;
  adresse: string;
  email: string;
  telephone: string;
  fax?: string;
  prestations?: string;
}

export interface EngagementsSection {
  attestation_exclusion: boolean;
  url_documents?: string;
  acces_documents?: string;
  type_capacites: 'dc2' | 'documents';
}

export interface MandataireSection {
  nom_commercial: string;
  denomination_sociale: string;
  adresse_etablissement: string;
  adresse_siege?: string;
  email: string;
  telephone: string;
  fax?: string;
  siret: string;
}
