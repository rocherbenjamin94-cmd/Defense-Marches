export interface DC1FormData {
  acheteur: AcheteurSection;
  consultation: ConsultationSection;
  candidature: CandidatureSection;
  candidat: CandidatSection;
  groupement?: GroupementSection;
  engagements: EngagementsSection;
}

export interface AcheteurSection {
  nom: string;
  reference_avis: string;
  reference_dossier: string;
}

export interface ConsultationSection {
  objet: string;
  reference?: string;
  date_limite?: string;
}

export interface CandidatureSection {
  type: 'marche_unique' | 'tous_lots' | 'lots_specifiques' | '';
  lots: string;
}

export interface CandidatSection {
  mode: 'seul' | 'groupement' | '';
  siret: string;
  siren: string;
  nom_commercial: string;
  denomination_sociale: string;
  adresse_etablissement: string;
  adresse_siege: string;
  email: string;
  telephone: string;
  fax: string;
}

export interface GroupementSection {
  type: 'conjoint' | 'solidaire' | '';
  mandataire_solidaire: 'oui' | 'non' | '';
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
  fax: string;
  prestations: string;
}

export interface EngagementsSection {
  attestation_exclusion: boolean;
  url_documents: string;
  acces_documents: string;
  type_capacites: 'dc2' | 'documents' | '';
}

export const initialFormData: DC1FormData = {
  acheteur: {
    nom: '',
    reference_avis: '',
    reference_dossier: '',
  },
  consultation: {
    objet: '',
    reference: '',
    date_limite: '',
  },
  candidature: {
    type: '',
    lots: '',
  },
  candidat: {
    mode: '',
    siret: '',
    siren: '',
    nom_commercial: '',
    denomination_sociale: '',
    adresse_etablissement: '',
    adresse_siege: '',
    email: '',
    telephone: '',
    fax: '',
  },
  groupement: {
    type: '',
    mandataire_solidaire: '',
    membres: [],
  },
  engagements: {
    attestation_exclusion: false,
    url_documents: '',
    acces_documents: '',
    type_capacites: '',
  },
};

export const createEmptyMembre = (id: number): MembreGroupement => ({
  id,
  siret: '',
  nom_commercial: '',
  denomination_sociale: '',
  adresse: '',
  email: '',
  telephone: '',
  fax: '',
  prestations: '',
});
