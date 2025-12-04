export interface ExtractedLot {
  numero: string;
  intitule: string;
}

export interface ExtractedDocumentData {
  // Section A - Acheteur
  acheteur?: {
    nom?: string;
    reference_avis?: string;
    reference_dossier?: string;
  };
  // Section B - Consultation
  consultation?: {
    objet?: string;
  };
  // Section C - Candidature
  candidature?: {
    lots?: ExtractedLot[];
  };
  // Informational (displayed but not stored in form)
  informations?: {
    date_limite_reponse?: string;
    criteres_selection?: string[];
  };
  // Metadata
  confidence: number; // 0-100 extraction confidence
  warnings?: string[]; // Any extraction warnings
}

export interface AnalyzeDocumentResponse {
  success: boolean;
  data: ExtractedDocumentData;
  documentId?: number; // ID in database for history
  fromCache?: boolean; // True if result came from cache (no API call)
  message: string;
}

export interface DocumentRecord {
  id: number;
  filename: string;
  filepath: string;
  mime_type: string;
  file_size: number;
  extracted_data: string | null;
  confidence: number | null;
  created_at: string;
}
