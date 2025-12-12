/**
 * Cache partagé pour les marchés BOAMP des acheteurs défense et intérieur
 * Évite de refaire les appels API à chaque requête
 */

import {
    getAllMarchesDefense,
    getAllMarchesInterieur,
    groupMarchesByAcheteur,
    MarcheBoamp
} from '@/lib/boamp';

// Cache en mémoire pour Défense (singleton au niveau du module)
let cachedMarchesDefense: MarcheBoamp[] | null = null;
let cachedMarchesByAcheteurDefense: Record<string, MarcheBoamp[]> | null = null;
let cacheTimestampDefense: number = 0;

// Cache en mémoire pour Intérieur
let cachedMarchesInterieur: MarcheBoamp[] | null = null;
let cachedMarchesByAcheteurInterieur: Record<string, MarcheBoamp[]> | null = null;
let cacheTimestampInterieur: number = 0;

const CACHE_DURATION = 60 * 60 * 1000; // 1 heure

export interface CachedData {
    marches: MarcheBoamp[];
    marchesByAcheteur: Record<string, MarcheBoamp[]>;
}

export async function getCachedMarchesDefense(): Promise<CachedData> {
    const now = Date.now();

    // Vérifier si le cache est valide
    if (cachedMarchesDefense && cachedMarchesByAcheteurDefense && (now - cacheTimestampDefense) < CACHE_DURATION) {
        console.log('[CACHE-DEF] Utilisation du cache mémoire');
        return {
            marches: cachedMarchesDefense,
            marchesByAcheteur: cachedMarchesByAcheteurDefense
        };
    }

    // Sinon, récupérer les données
    console.log('[CACHE-DEF] Récupération des marchés BOAMP Défense...');
    cachedMarchesDefense = await getAllMarchesDefense();
    cachedMarchesByAcheteurDefense = groupMarchesByAcheteur(cachedMarchesDefense);
    cacheTimestampDefense = now;

    console.log(`[CACHE-DEF] ${cachedMarchesDefense.length} marchés mis en cache`);

    return {
        marches: cachedMarchesDefense,
        marchesByAcheteur: cachedMarchesByAcheteurDefense
    };
}

export async function getCachedMarchesInterieur(): Promise<CachedData> {
    const now = Date.now();

    // Vérifier si le cache est valide
    if (cachedMarchesInterieur && cachedMarchesByAcheteurInterieur && (now - cacheTimestampInterieur) < CACHE_DURATION) {
        console.log('[CACHE-INT] Utilisation du cache mémoire');
        return {
            marches: cachedMarchesInterieur,
            marchesByAcheteur: cachedMarchesByAcheteurInterieur
        };
    }

    // Sinon, récupérer les données
    console.log('[CACHE-INT] Récupération des marchés BOAMP Intérieur...');
    cachedMarchesInterieur = await getAllMarchesInterieur();
    cachedMarchesByAcheteurInterieur = groupMarchesByAcheteur(cachedMarchesInterieur);
    cacheTimestampInterieur = now;

    console.log(`[CACHE-INT] ${cachedMarchesInterieur.length} marchés mis en cache`);

    return {
        marches: cachedMarchesInterieur,
        marchesByAcheteur: cachedMarchesByAcheteurInterieur
    };
}

// Pour forcer le rafraîchissement du cache si nécessaire
export function invalidateCacheDefense(): void {
    cachedMarchesDefense = null;
    cachedMarchesByAcheteurDefense = null;
    cacheTimestampDefense = 0;
    console.log('[CACHE-DEF] Cache invalidé');
}

export function invalidateCacheInterieur(): void {
    cachedMarchesInterieur = null;
    cachedMarchesByAcheteurInterieur = null;
    cacheTimestampInterieur = 0;
    console.log('[CACHE-INT] Cache invalidé');
}

export function invalidateAllCaches(): void {
    invalidateCacheDefense();
    invalidateCacheInterieur();
}

// Alias pour compatibilité avec le code existant
export const invalidateCache = invalidateCacheDefense;
