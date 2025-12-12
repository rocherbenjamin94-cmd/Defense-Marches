export type Buyer = {
  id?: string; // ID pour le lien vers /acheteurs/[id]
  name: string;
  department?: string;
  type?: string;
};

export type MarketNature = 'fournitures' | 'services' | 'travaux';
export type AmountRange = 'small' | 'medium' | 'large' | 'xlarge'; // < 40k, 40-90k, 90-221k, > 221k
export type TenderSource = 'BOAMP' | 'PLACE';

export type Tender = {
  id: string;
  title: string;
  buyer: Buyer;
  publicationDate: string;
  deadlineDate: string;
  estimatedAmount?: number;
  procedureType: string;
  description: string;
  sectors: string[];
  urgencyLevel: 'normal' | 'urgent' | 'critical';
  boampUrl: string;
  score: number; // Relevance score (0-100)
  cpv?: string;
  location?: string;
  isDefenseEquipment?: boolean; // true si CPV commence par 35 (équipements défense/sécurité)
  isJOUE?: boolean; // true si publié au Journal Officiel de l'UE
  marketNature?: MarketNature; // Fournitures, Services ou Travaux
  amountRange?: AmountRange; // Fourchette de montant
  source?: TenderSource; // Source du marché (BOAMP ou PLACE)
};

export type TenderStats = {
  totalTenders: number;
  totalAmount: number;
  bySector: Record<string, number>;
  trend: number[];
};

// Raw record from OpenDataSoft BOAMP API
export interface BoampRecord {
  idweb: string;
  objet: string;
  nomacheteur: string;
  famille: string;
  famille_libelle: string;
  nature: string;
  nature_libelle: string;
  code_departement: string | string[];
  dateparution: string;
  datelimitereponse: string;
  datefindiffusion: string;
  procedure_libelle: string;
  perimetre: string;
  etat: string;
  filename: string;
  titulaire?: string;
  // CPV might be in a specific field or part of the object, assuming 'cpv_code' or similar if available, 
  // but user didn't specify the exact field name for CPV in the record list, 
  // though they asked to filter by it. Often it's 'code_cpv' or inside a nested object.
  // We will assume it might be present or we filter by text if not.
  // Checking ODS API docs usually shows 'classement_code' or similar.
  // For now we'll add it as optional.
  code_cpv?: string;
}
