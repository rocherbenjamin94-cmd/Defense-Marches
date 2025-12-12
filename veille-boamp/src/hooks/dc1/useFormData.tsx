import { createContext, useContext, useReducer, useEffect, useState, useMemo } from 'react';
import type { ReactNode, Dispatch } from 'react';
import type { DC1FormData, MembreGroupement, ExtractedDocumentData, EntrepriseData } from '@/lib/dc1/types';
import { initialFormData, createEmptyMembre } from '@/lib/dc1/types';

type FormAction =
  | { type: 'UPDATE_ACHETEUR'; payload: Partial<DC1FormData['acheteur']> }
  | { type: 'UPDATE_CONSULTATION'; payload: Partial<DC1FormData['consultation']> }
  | { type: 'UPDATE_CANDIDATURE'; payload: Partial<DC1FormData['candidature']> }
  | { type: 'UPDATE_CANDIDAT'; payload: Partial<DC1FormData['candidat']> }
  | { type: 'UPDATE_GROUPEMENT'; payload: Partial<NonNullable<DC1FormData['groupement']>> }
  | { type: 'UPDATE_ENGAGEMENTS'; payload: Partial<DC1FormData['engagements']> }
  | { type: 'ADD_MEMBRE' }
  | { type: 'UPDATE_MEMBRE'; payload: { id: number; data: Partial<MembreGroupement> } }
  | { type: 'REMOVE_MEMBRE'; payload: number }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_FORM'; payload: DC1FormData }
  | { type: 'APPLY_EXTRACTED_DATA'; payload: ExtractedDocumentData };

function formReducer(state: DC1FormData, action: FormAction): DC1FormData {
  switch (action.type) {
    case 'UPDATE_ACHETEUR':
      return { ...state, acheteur: { ...state.acheteur, ...action.payload } };
    case 'UPDATE_CONSULTATION':
      return { ...state, consultation: { ...state.consultation, ...action.payload } };
    case 'UPDATE_CANDIDATURE':
      return { ...state, candidature: { ...state.candidature, ...action.payload } };
    case 'UPDATE_CANDIDAT':
      return { ...state, candidat: { ...state.candidat, ...action.payload } };
    case 'UPDATE_GROUPEMENT':
      return {
        ...state,
        groupement: { ...state.groupement!, ...action.payload },
      };
    case 'UPDATE_ENGAGEMENTS':
      return { ...state, engagements: { ...state.engagements, ...action.payload } };
    case 'ADD_MEMBRE': {
      const newId = (state.groupement?.membres.length || 0) + 1;
      return {
        ...state,
        groupement: {
          ...state.groupement!,
          membres: [...(state.groupement?.membres || []), createEmptyMembre(newId)],
        },
      };
    }
    case 'UPDATE_MEMBRE': {
      return {
        ...state,
        groupement: {
          ...state.groupement!,
          membres: state.groupement!.membres.map((m) =>
            m.id === action.payload.id ? { ...m, ...action.payload.data } : m
          ),
        },
      };
    }
    case 'REMOVE_MEMBRE': {
      return {
        ...state,
        groupement: {
          ...state.groupement!,
          membres: state.groupement!.membres.filter((m) => m.id !== action.payload),
        },
      };
    }
    case 'RESET_FORM':
      return initialFormData;
    case 'LOAD_FORM':
      return action.payload;
    case 'APPLY_EXTRACTED_DATA': {
      const extracted = action.payload;

      // Build the lots string from extracted lots
      let lotsString = state.candidature.lots;
      let candidatureType = state.candidature.type;

      if (extracted.candidature?.lots && extracted.candidature.lots.length > 0) {
        lotsString = extracted.candidature.lots
          .map((l) => `Lot ${l.numero} : ${l.intitule}`)
          .join('\n');
        candidatureType = 'lots_specifiques';
      }

      return {
        ...state,
        acheteur: {
          ...state.acheteur,
          ...(extracted.acheteur?.nom && { nom: extracted.acheteur.nom }),
          ...(extracted.acheteur?.reference_avis && {
            reference_avis: extracted.acheteur.reference_avis,
          }),
          ...(extracted.acheteur?.reference_dossier && {
            reference_dossier: extracted.acheteur.reference_dossier,
          }),
        },
        consultation: {
          ...state.consultation,
          ...(extracted.consultation?.objet && {
            objet: extracted.consultation.objet,
          }),
        },
        candidature: {
          ...state.candidature,
          ...(extracted.candidature?.lots &&
            extracted.candidature.lots.length > 0 && {
            type: candidatureType,
            lots: lotsString,
          }),
        },
      };
    }
    default:
      return state;
  }
}

interface FormContextType {
  formData: DC1FormData;
  dispatch: Dispatch<FormAction>;
  updateAcheteur: (data: Partial<DC1FormData['acheteur']>) => void;
  updateConsultation: (data: Partial<DC1FormData['consultation']>) => void;
  updateCandidature: (data: Partial<DC1FormData['candidature']>) => void;
  updateCandidat: (data: Partial<DC1FormData['candidat']>) => void;
  updateGroupement: (data: Partial<NonNullable<DC1FormData['groupement']>>) => void;
  updateEngagements: (data: Partial<DC1FormData['engagements']>) => void;
  addMembre: () => void;
  updateMembre: (id: number, data: Partial<MembreGroupement>) => void;
  removeMembre: (id: number) => void;
  resetForm: () => void;
  applyExtractedData: (data: ExtractedDocumentData) => void;
  pappersData: EntrepriseData | null;
  setPappersData: (data: EntrepriseData | null) => void;
}

const FormContext = createContext<FormContextType | null>(null);

const STORAGE_KEY = 'dc1-form-data';

const PAPPERS_STORAGE_KEY = 'dc1-pappers-data';

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, dispatch] = useReducer(formReducer, initialFormData);

  const [pappersData, setPappersDataState] = useState<EntrepriseData | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedForm = localStorage.getItem(STORAGE_KEY);
      if (savedForm) {
        dispatch({ type: 'LOAD_FORM', payload: JSON.parse(savedForm) });
      }

      const savedPappers = localStorage.getItem(PAPPERS_STORAGE_KEY);
      if (savedPappers) {
        setPappersDataState(JSON.parse(savedPappers));
      }
    } catch (error) {
      console.error('Failed to load from localStorage', error);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (pappersData) {
      localStorage.setItem(PAPPERS_STORAGE_KEY, JSON.stringify(pappersData));
    } else {
      localStorage.removeItem(PAPPERS_STORAGE_KEY);
    }
  }, [pappersData]);

  const setPappersData = (data: EntrepriseData | null) => {
    setPappersDataState(data);
  };

  const actions = useMemo(() => ({
    updateAcheteur: (data: Partial<DC1FormData['acheteur']>) => dispatch({ type: 'UPDATE_ACHETEUR', payload: data }),
    updateConsultation: (data: Partial<DC1FormData['consultation']>) => dispatch({ type: 'UPDATE_CONSULTATION', payload: data }),
    updateCandidature: (data: Partial<DC1FormData['candidature']>) => dispatch({ type: 'UPDATE_CANDIDATURE', payload: data }),
    updateCandidat: (data: Partial<DC1FormData['candidat']>) => dispatch({ type: 'UPDATE_CANDIDAT', payload: data }),
    updateGroupement: (data: Partial<NonNullable<DC1FormData['groupement']>>) => dispatch({ type: 'UPDATE_GROUPEMENT', payload: data }),
    updateEngagements: (data: Partial<DC1FormData['engagements']>) => dispatch({ type: 'UPDATE_ENGAGEMENTS', payload: data }),
    addMembre: () => dispatch({ type: 'ADD_MEMBRE' }),
    updateMembre: (id: number, data: Partial<MembreGroupement>) => dispatch({ type: 'UPDATE_MEMBRE', payload: { id, data } }),
    removeMembre: (id: number) => dispatch({ type: 'REMOVE_MEMBRE', payload: id }),
    resetForm: () => dispatch({ type: 'RESET_FORM' }),
    applyExtractedData: (data: ExtractedDocumentData) => dispatch({ type: 'APPLY_EXTRACTED_DATA', payload: data }),
  }), []);

  const value = useMemo<FormContextType>(() => ({
    formData,
    dispatch,
    ...actions,
    pappersData,
    setPappersData,
  }), [formData, pappersData, actions]);

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useFormData(): FormContextType {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormData must be used within a FormProvider');
  }
  return context;
}
