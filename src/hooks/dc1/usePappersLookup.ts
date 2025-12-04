import { useState, useCallback } from 'react';
import { lookupEntreprise } from '@/services/dc1/entreprise.service';
import type { EntrepriseData } from '@/lib/dc1/types';

interface UsePappersLookupResult {
  lookup: (query: string) => Promise<void>;
  data: EntrepriseData | EntrepriseData[] | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function usePappersLookup(): UsePappersLookupResult {
  const [data, setData] = useState<EntrepriseData | EntrepriseData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setError('La recherche doit contenir au moins 2 caractères');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await lookupEntreprise(query);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { lookup, data, isLoading, error, reset };
}
