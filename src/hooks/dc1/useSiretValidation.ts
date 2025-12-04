import { useState, useCallback, useMemo } from 'react';
import { validateSiretDetailed } from '@/lib/dc1/utils/validation';
import type { SiretValidationResult } from '@/lib/dc1/utils/validation';

export interface UseSiretValidationReturn {
  value: string;
  setValue: (value: string) => void;
  validation: SiretValidationResult;
  queryType: 'siret' | 'siren';
  isSearchable: boolean;
  formattedValue: string;
}

export function useSiretValidation(initialValue = ''): UseSiretValidationReturn {
  const [value, setValueInternal] = useState(initialValue);

  const setValue = useCallback((newValue: string) => {
    // Limiter aux chiffres, espaces et tirets
    const filtered = newValue.replace(/[^\d\s\-]/g, '');
    setValueInternal(filtered);
  }, []);

  // Déterminer le type basé sur le nombre de chiffres
  const queryType = useMemo((): 'siret' | 'siren' => {
    const cleaned = value.replace(/[\s\-]/g, '');
    // Si exactement 9 chiffres = SIREN, sinon = SIRET (en cours de saisie ou complet)
    if (cleaned.length === 9) return 'siren';
    return 'siret';
  }, [value]);

  const validation = useMemo((): SiretValidationResult => {
    const cleaned = value.replace(/[\s\-]/g, '');

    // Champ vide
    if (!cleaned) {
      return {
        valid: false,
        error: 'Veuillez saisir un SIRET ou SIREN',
        digitCount: 0,
        status: 'empty',
      };
    }

    // Si exactement 9 chiffres = SIREN valide
    if (cleaned.length === 9) {
      return {
        valid: true,
        cleaned,
        digitCount: 9,
        status: 'valid',
      };
    }

    // Sinon, valider comme SIRET
    return validateSiretDetailed(value);
  }, [value]);

  // Peut-on lancer une recherche ?
  const isSearchable = useMemo(() => {
    return validation.valid;
  }, [validation.valid]);

  // Formatage pour affichage
  const formattedValue = useMemo(() => {
    const cleaned = value.replace(/[\s\-]/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 14)}`;
  }, [value]);

  return {
    value,
    setValue,
    validation,
    queryType,
    isSearchable,
    formattedValue,
  };
}
