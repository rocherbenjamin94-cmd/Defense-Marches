import { api } from './api';
import type { LookupResponse, EntrepriseData } from '@/lib/dc1/types';

export async function lookupEntreprise(query: string): Promise<LookupResponse> {
  const response = await api.get<LookupResponse>('/api/entreprise/lookup', {
    params: { q: query },
  });
  return response.data;
}

export async function directLookup(siret: string): Promise<EntrepriseData> {
  const response = await api.get<{ success: boolean; data: EntrepriseData }>(
    '/api/entreprise/direct',
    { params: { siret } }
  );
  return response.data.data;
}

export async function searchByName(query: string): Promise<EntrepriseData[]> {
  const response = await api.get<{ success: boolean; data: EntrepriseData[] }>(
    '/api/entreprise/search',
    { params: { q: query } }
  );
  return response.data.data;
}
