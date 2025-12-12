import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import type { ReactNode, Dispatch } from 'react';
import type {
  DC2FormData,
  Reference,
  Certification,
  ChiffreAffaires,
  Effectif,
} from '@/lib/dc1/types';
import {
  initialDC2FormData,
  createEmptyReference,
  createEmptyCertification,
} from '@/lib/dc1/types';

type DC2FormAction =
  | { type: 'UPDATE_IDENTIFICATION'; payload: Partial<DC2FormData['identification']> }
  | { type: 'UPDATE_SITUATION_JURIDIQUE'; payload: Partial<DC2FormData['situation_juridique']> }
  | { type: 'UPDATE_CAPACITES_ECONOMIQUES'; payload: Partial<DC2FormData['capacites_economiques']> }
  | { type: 'UPDATE_CAPACITES_TECHNIQUES'; payload: Partial<DC2FormData['capacites_techniques']> }
  | { type: 'UPDATE_MOYENS_TECHNIQUES'; payload: Partial<DC2FormData['moyens_techniques']> }
  | { type: 'UPDATE_CA_GLOBAL'; payload: { index: number; data: Partial<ChiffreAffaires> } }
  | { type: 'UPDATE_CA_DOMAINE'; payload: { index: number; data: Partial<ChiffreAffaires> } }
  | { type: 'UPDATE_EFFECTIF'; payload: { index: number; data: Partial<Effectif> } }
  | { type: 'ADD_REFERENCE' }
  | { type: 'UPDATE_REFERENCE'; payload: { id: string; data: Partial<Reference> } }
  | { type: 'REMOVE_REFERENCE'; payload: string }
  | { type: 'ADD_CERTIFICATION' }
  | { type: 'UPDATE_CERTIFICATION'; payload: { id: string; data: Partial<Certification> } }
  | { type: 'REMOVE_CERTIFICATION'; payload: string }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_FORM'; payload: DC2FormData }
  | { type: 'PREFILL_FROM_DC1'; payload: PrefillData };

// Données pour le pré-remplissage depuis DC1 et Pappers
export interface PrefillData {
  // Depuis DC1
  siret?: string;
  siren?: string;
  denomination_sociale?: string;
  nom_commercial?: string;
  adresse_siege?: string;
  adresse_etablissement?: string;
  email?: string;
  telephone?: string;
  fax?: string;
  // Depuis Pappers
  forme_juridique?: string;
  date_creation?: string;
  capital_social?: string;
  devise_capital?: string;
  numero_rcs?: string;
  ville_rcs?: string;
  code_naf?: string;
  libelle_naf?: string;
}

function dc2FormReducer(state: DC2FormData, action: DC2FormAction): DC2FormData {
  switch (action.type) {
    case 'UPDATE_IDENTIFICATION':
      return { ...state, identification: { ...state.identification, ...action.payload } };

    case 'UPDATE_SITUATION_JURIDIQUE':
      return { ...state, situation_juridique: { ...state.situation_juridique, ...action.payload } };

    case 'UPDATE_CAPACITES_ECONOMIQUES':
      return { ...state, capacites_economiques: { ...state.capacites_economiques, ...action.payload } };

    case 'UPDATE_CAPACITES_TECHNIQUES':
      return { ...state, capacites_techniques: { ...state.capacites_techniques, ...action.payload } };

    case 'UPDATE_MOYENS_TECHNIQUES':
      return { ...state, moyens_techniques: { ...state.moyens_techniques, ...action.payload } };

    case 'UPDATE_CA_GLOBAL':
      return {
        ...state,
        capacites_economiques: {
          ...state.capacites_economiques,
          chiffre_affaires_global: state.capacites_economiques.chiffre_affaires_global.map((ca: any, i: number) =>
            i === action.payload.index ? { ...ca, ...action.payload.data } : ca
          ),
        },
      };

    case 'UPDATE_CA_DOMAINE':
      return {
        ...state,
        capacites_economiques: {
          ...state.capacites_economiques,
          chiffre_affaires_domaine: state.capacites_economiques.chiffre_affaires_domaine.map((ca: any, i: number) =>
            i === action.payload.index ? { ...ca, ...action.payload.data } : ca
          ),
        },
      };

    case 'UPDATE_EFFECTIF':
      return {
        ...state,
        capacites_techniques: {
          ...state.capacites_techniques,
          effectifs: state.capacites_techniques.effectifs.map((eff: any, i: number) =>
            i === action.payload.index ? { ...eff, ...action.payload.data } : eff
          ),
        },
      };

    case 'ADD_REFERENCE':
      return {
        ...state,
        capacites_techniques: {
          ...state.capacites_techniques,
          references: [...state.capacites_techniques.references, createEmptyReference()],
        },
      };

    case 'UPDATE_REFERENCE':
      return {
        ...state,
        capacites_techniques: {
          ...state.capacites_techniques,
          references: state.capacites_techniques.references.map((ref: any) =>
            ref.id === action.payload.id ? { ...ref, ...action.payload.data } : ref
          ),
        },
      };

    case 'REMOVE_REFERENCE':
      return {
        ...state,
        capacites_techniques: {
          ...state.capacites_techniques,
          references: state.capacites_techniques.references.filter((ref) => ref.id !== action.payload),
        },
      };

    case 'ADD_CERTIFICATION':
      return {
        ...state,
        capacites_techniques: {
          ...state.capacites_techniques,
          certifications: [...state.capacites_techniques.certifications, createEmptyCertification()],
        },
      };

    case 'UPDATE_CERTIFICATION':
      return {
        ...state,
        capacites_techniques: {
          ...state.capacites_techniques,
          certifications: state.capacites_techniques.certifications.map((cert: any) =>
            cert.id === action.payload.id ? { ...cert, ...action.payload.data } : cert
          ),
        },
      };

    case 'REMOVE_CERTIFICATION':
      return {
        ...state,
        capacites_techniques: {
          ...state.capacites_techniques,
          certifications: state.capacites_techniques.certifications.filter((cert) => cert.id !== action.payload),
        },
      };

    case 'RESET_FORM':
      return initialDC2FormData;

    case 'LOAD_FORM':
      return action.payload;

    case 'PREFILL_FROM_DC1': {
      const data = action.payload;
      return {
        ...state,
        identification: {
          ...state.identification,
          ...(data.siret && { siret: data.siret }),
          ...(data.siren && { siren: data.siren }),
          ...(data.denomination_sociale && { denomination_sociale: data.denomination_sociale }),
          ...(data.nom_commercial && { nom_commercial: data.nom_commercial }),
          ...(data.adresse_siege && { adresse_siege: data.adresse_siege }),
          ...(data.adresse_etablissement && { adresse_etablissement: data.adresse_etablissement }),
          ...(data.email && { email: data.email }),
          ...(data.telephone && { telephone: data.telephone }),
          ...(data.fax && { fax: data.fax }),
        },
        situation_juridique: {
          ...state.situation_juridique,
          ...(data.forme_juridique && { forme_juridique: data.forme_juridique }),
          ...(data.date_creation && { date_creation: data.date_creation }),
          ...(data.capital_social && { capital_social: data.capital_social }),
          ...(data.devise_capital && { devise_capital: data.devise_capital }),
          ...(data.numero_rcs && { numero_rcs: data.numero_rcs }),
          ...(data.ville_rcs && { ville_rcs: data.ville_rcs }),
          ...(data.code_naf && { code_naf: data.code_naf }),
          ...(data.libelle_naf && { libelle_naf: data.libelle_naf }),
        },
      };
    }

    default:
      return state;
  }
}

interface DC2FormContextType {
  formData: DC2FormData;
  dispatch: Dispatch<DC2FormAction>;
  updateIdentification: (data: Partial<DC2FormData['identification']>) => void;
  updateSituationJuridique: (data: Partial<DC2FormData['situation_juridique']>) => void;
  updateCapacitesEconomiques: (data: Partial<DC2FormData['capacites_economiques']>) => void;
  updateCapacitesTechniques: (data: Partial<DC2FormData['capacites_techniques']>) => void;
  updateMoyensTechniques: (data: Partial<DC2FormData['moyens_techniques']>) => void;
  updateCAGlobal: (index: number, data: Partial<ChiffreAffaires>) => void;
  updateCADomaine: (index: number, data: Partial<ChiffreAffaires>) => void;
  updateEffectif: (index: number, data: Partial<Effectif>) => void;
  addReference: () => void;
  updateReference: (id: string, data: Partial<Reference>) => void;
  removeReference: (id: string) => void;
  addCertification: () => void;
  updateCertification: (id: string, data: Partial<Certification>) => void;
  removeCertification: (id: string) => void;
  resetForm: () => void;
  prefillFromDC1: (data: PrefillData) => void;
}

const DC2FormContext = createContext<DC2FormContextType | null>(null);

const STORAGE_KEY = 'dc2-form-data';

export function DC2FormProvider({ children }: { children: ReactNode }) {
  const [formData, dispatch] = useReducer(dc2FormReducer, initialDC2FormData);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dispatch({ type: 'LOAD_FORM', payload: JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Failed to load DC2 form from localStorage', error);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const actions = useMemo(() => ({
    updateIdentification: (data: Partial<DC2FormData['identification']>) => dispatch({ type: 'UPDATE_IDENTIFICATION', payload: data }),
    updateSituationJuridique: (data: Partial<DC2FormData['situation_juridique']>) => dispatch({ type: 'UPDATE_SITUATION_JURIDIQUE', payload: data }),
    updateCapacitesEconomiques: (data: Partial<DC2FormData['capacites_economiques']>) => dispatch({ type: 'UPDATE_CAPACITES_ECONOMIQUES', payload: data }),
    updateCapacitesTechniques: (data: Partial<DC2FormData['capacites_techniques']>) => dispatch({ type: 'UPDATE_CAPACITES_TECHNIQUES', payload: data }),
    updateMoyensTechniques: (data: Partial<DC2FormData['moyens_techniques']>) => dispatch({ type: 'UPDATE_MOYENS_TECHNIQUES', payload: data }),
    updateCAGlobal: (index: number, data: Partial<ChiffreAffaires>) => dispatch({ type: 'UPDATE_CA_GLOBAL', payload: { index, data } }),
    updateCADomaine: (index: number, data: Partial<ChiffreAffaires>) => dispatch({ type: 'UPDATE_CA_DOMAINE', payload: { index, data } }),
    updateEffectif: (index: number, data: Partial<Effectif>) => dispatch({ type: 'UPDATE_EFFECTIF', payload: { index, data } }),
    addReference: () => dispatch({ type: 'ADD_REFERENCE' }),
    updateReference: (id: string, data: Partial<Reference>) => dispatch({ type: 'UPDATE_REFERENCE', payload: { id, data } }),
    removeReference: (id: string) => dispatch({ type: 'REMOVE_REFERENCE', payload: id }),
    addCertification: () => dispatch({ type: 'ADD_CERTIFICATION' }),
    updateCertification: (id: string, data: Partial<Certification>) => dispatch({ type: 'UPDATE_CERTIFICATION', payload: { id, data } }),
    removeCertification: (id: string) => dispatch({ type: 'REMOVE_CERTIFICATION', payload: id }),
    resetForm: () => dispatch({ type: 'RESET_FORM' }),
    prefillFromDC1: (data: PrefillData) => dispatch({ type: 'PREFILL_FROM_DC1', payload: data }),
  }), []);

  const value = useMemo<DC2FormContextType>(() => ({
    formData,
    dispatch,
    ...actions,
  }), [formData, actions]);

  return <DC2FormContext.Provider value={value}>{children}</DC2FormContext.Provider>;
}

export function useFormDataDC2(): DC2FormContextType {
  const context = useContext(DC2FormContext);
  if (!context) {
    throw new Error('useFormDataDC2 must be used within a DC2FormProvider');
  }
  return context;
}
