export interface ExtractedLot {
  numero: string;
  intitule: string;
}

export interface ExtractedDocumentData {
  acheteur?: {
    nom?: string;
    reference_avis?: string;
    reference_dossier?: string;
  };
  consultation?: {
    objet?: string;
  };
  candidature?: {
    lots?: ExtractedLot[];
  };
  informations?: {
    date_limite_reponse?: string;
    criteres_selection?: string[];
  };
  confidence: number;
  warnings?: string[];
}

export interface AnalyzeDocumentResponse {
  success: boolean;
  data: ExtractedDocumentData;
  documentId?: number;
  message: string;
}

export interface DocumentHistoryItem {
  id: number;
  filename: string;
  confidence: number | null;
  created_at: string;
}
