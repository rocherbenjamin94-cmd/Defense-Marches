// src/app/api/tenders/all/route.ts
// API Route combinée : BOAMP + PLACE
// Fusionne les marchés des deux sources avec déduplication

import { NextResponse } from 'next/server';
import { getCachedTenders, setCachedTenders } from '@/lib/cache';
import { fetchDefenseTendersFromAPI } from '@/lib/boamp';
import { scrapePlaceMinarm, MarchePlace } from '@/lib/place';
import { Tender } from '@/lib/types';
import { getDb, PlaceTenderRow } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes pour scraping PLACE + BOAMP

/**
 * Parse une date française (ex: "10 Déc. 2025" ou "10/12/2025")
 */
function parseFrenchDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();

    // Format DD/MM/YYYY
    const slashParts = dateStr.split('/');
    if (slashParts.length === 3) {
        const [day, month, year] = slashParts;
        return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`).toISOString();
    }

    // Format français "10 Déc. 2025" ou "10 décembre 2025"
    const monthMap: Record<string, string> = {
        'janv': '01', 'jan': '01', 'janvier': '01',
        'févr': '02', 'fév': '02', 'fev': '02', 'février': '02', 'fevrier': '02',
        'mars': '03', 'mar': '03',
        'avr': '04', 'avril': '04',
        'mai': '05',
        'juin': '06', 'jun': '06',
        'juil': '07', 'jul': '07', 'juillet': '07',
        'août': '08', 'aout': '08', 'aoû': '08',
        'sept': '09', 'sep': '09', 'septembre': '09',
        'oct': '10', 'octobre': '10',
        'nov': '11', 'novembre': '11',
        'déc': '12', 'dec': '12', 'décembre': '12', 'decembre': '12'
    };

    // Regex pour "10 Déc. 2025" ou "10 décembre 2025"
    const frenchMatch = dateStr.match(/(\d{1,2})\s+([a-zéûô]+)\.?\s+(\d{4})/i);
    if (frenchMatch) {
        const [, day, monthStr, year] = frenchMatch;
        const monthKey = monthStr.toLowerCase().replace('.', '');
        const month = monthMap[monthKey];
        if (month) {
            return new Date(`${year}-${month}-${day.padStart(2, '0')}`).toISOString();
        }
    }

    // Fallback: essayer de parser directement
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
    }

    // Dernier recours: date du jour
    console.warn(`PLACE: Impossible de parser la date: "${dateStr}"`);
    return new Date().toISOString();
}

/**
 * Vérifie si un marché PLACE est valide (pas un élément de navigation)
 */
function isValidPlaceMarche(m: MarchePlace): boolean {
    const invalidTitles = [
        'accueil', 'catégorie', 'categorie', 'menu', 'connexion', 'contact',
        'aide', 'faq', 'recherche', 'inscription', 'déconnexion', 'panier',
        'mon compte', 'profil', 'paramètres', 'accéder', 'retour', 'suivant',
        'précédent', 'fermer', 'ouvrir', 'consultation', 'consultations'
    ];

    const titre = (m.titre || '').toLowerCase().trim();

    // Exclure les titres trop courts
    if (titre.length < 15) return false;

    // Exclure les éléments de navigation
    if (invalidTitles.includes(titre)) return false;

    // Exclure les titres génériques
    if (/^consultation\s+\d+$/i.test(titre)) return false;

    return true;
}

/**
 * Convertit un marché PLACE en format Tender unifié
 */
function placeToTender(m: MarchePlace): Tender {
    // Déterminer le nom de l'acheteur par défaut selon le ministère
    const defaultBuyer = m.ministry === 'MININT'
        ? 'Ministère de l\'Intérieur'
        : 'Ministère des Armées';

    // Définir le secteur pour le filtrage (utilisé par filterByEntity)
    const sector = m.ministry === 'MININT' ? 'autre_mi' : 'minarm';

    return {
        id: `place-${m.id}`,
        title: m.titre,
        description: m.titre, // PLACE ne fournit pas toujours de description
        buyer: {
            name: m.acheteur || defaultBuyer,
            department: m.lieu || 'France',
        },
        publicationDate: parseFrenchDate(m.datePublication),
        deadlineDate: parseFrenchDate(m.dateLimite),
        procedureType: m.procedure || 'Non spécifié',
        sectors: [sector], // Secteur pour le filtrage par entité
        urgencyLevel: 'normal',
        boampUrl: m.url,
        score: 80, // Score par défaut pour PLACE
        location: m.lieu,
        cpv: undefined,
        marketNature: undefined,
        amountRange: undefined,
        isJOUE: false,
        isDefenseEquipment: m.ministry !== 'MININT', // false pour MININT
        source: 'PLACE', // Source PLACE
    };
}

/**
 * Convertit une row PostgreSQL en MarchePlace
 */
function rowToMarchePlace(row: PlaceTenderRow): MarchePlace {
    return {
        id: row.id,
        reference: row.reference || '',
        titre: row.titre,
        acheteur: row.acheteur || '',
        dateLimite: row.date_limite?.toISOString().split('T')[0] || '',
        datePublication: row.date_publication?.toISOString().split('T')[0] || '',
        type: row.type_procedure || '',
        procedure: row.procedure || '',
        lieu: row.lieu || '',
        url: row.url || '',
        source: 'PLACE',
        ministry: (row.ministry as 'MINARM' | 'MININT') || 'MINARM',
    };
}

/**
 * Déduplique les marchés entre BOAMP et PLACE
 */
function deduplicateTenders(boamp: Tender[], place: Tender[]): Tender[] {
    const seen = new Map<string, Tender>();

    // Normaliser le titre pour comparaison
    const normalizeTitle = (title: string): string => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 50);
    };

    // Ajouter BOAMP en premier (source prioritaire)
    for (const tender of boamp) {
        const key = normalizeTitle(tender.title);
        if (!seen.has(key)) {
            seen.set(key, tender);
        }
    }

    // Ajouter PLACE (seulement si pas déjà présent)
    for (const tender of place) {
        const key = normalizeTitle(tender.title);
        if (!seen.has(key)) {
            seen.set(key, tender);
        }
    }

    return Array.from(seen.values());
}

// GET /api/tenders/all - Tous les marchés (BOAMP + PLACE)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const includePlace = searchParams.get('place') !== 'false'; // Par défaut: inclure PLACE

    try {
        // 1. Récupérer les marchés BOAMP
        console.log('API /tenders/all: Récupération BOAMP...');
        let boampTenders: Tender[] = [];

        const cached = await getCachedTenders();
        if (cached && cached.tenders.length > 0) {
            boampTenders = cached.tenders;
            console.log(`API /tenders/all: ${boampTenders.length} marchés BOAMP (cache)`);
        } else {
            boampTenders = await fetchDefenseTendersFromAPI();
            await setCachedTenders(boampTenders);
            console.log(`API /tenders/all: ${boampTenders.length} marchés BOAMP (API)`);
        }

        // 2. Récupérer les marchés PLACE (si activé) - MINARM + MININT
        let placeTenders: Tender[] = [];
        let placeMarches: MarchePlace[] = [];

        if (includePlace) {
            console.log('API /tenders/all: Récupération PLACE depuis PostgreSQL...');

            try {
                const db = getDb();

                // Charger tous les marchés PLACE depuis PostgreSQL
                const rows = await db<PlaceTenderRow[]>`
                    SELECT * FROM place_tenders
                    ORDER BY date_publication DESC
                `;

                if (rows.length > 0) {
                    placeMarches = rows.map(rowToMarchePlace);

                    // Compter par ministère
                    const minarmCount = placeMarches.filter(m => m.ministry === 'MINARM').length;
                    const minintCount = placeMarches.filter(m => m.ministry === 'MININT').length;
                    console.log(`API /tenders/all: ${minarmCount} marchés PLACE MINARM, ${minintCount} MININT`);
                }
            } catch (dbError) {
                console.warn('API /tenders/all: Erreur PostgreSQL PLACE:', dbError);
            }

            // Fallback: scraping si pas de données en cache (hors environnement Docker/production)
            if (process.env.NODE_ENV !== 'production' && placeMarches.length === 0) {
                console.log('API /tenders/all: Tentative de scraping PLACE (cache vide)...');
                try {
                    const todayMarches = await scrapePlaceMinarm(new Date());
                    if (todayMarches.length > 0) {
                        placeMarches = todayMarches;
                        console.log(`API /tenders/all: ${todayMarches.length} marchés PLACE scrapés`);
                    }
                } catch (error) {
                    console.warn('API /tenders/all: Erreur scraping PLACE:', error);
                }
            }

            // Convertir en Tenders
            // Filtrer les marchés invalides (éléments de navigation) puis convertir
            const validMarches = placeMarches.filter(isValidPlaceMarche);
            placeTenders = validMarches.map(placeToTender);
            if (validMarches.length < placeMarches.length) {
                console.log(`API /tenders/all: ${placeMarches.length - validMarches.length} marchés PLACE invalides filtrés`);
            }
            console.log(`API /tenders/all: ${placeTenders.length} marchés PLACE valides`);
        }

        // 3. Fusionner et dédupliquer
        const allTenders = deduplicateTenders(boampTenders, placeTenders);

        // 4. Trier par date de publication (plus récents d'abord)
        allTenders.sort((a, b) =>
            new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
        );

        return NextResponse.json({
            tenders: allTenders,
            sources: {
                boamp: boampTenders.length,
                place: placeTenders.length,
                total: allTenders.length,
                deduplicated: boampTenders.length + placeTenders.length - allTenders.length,
            },
            cachedAt: new Date().toISOString(),
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
        });

    } catch (error) {
        console.error('API /tenders/all: Erreur:', error);

        // Fallback: retourner au moins BOAMP
        try {
            const cached = await getCachedTenders();
            if (cached) {
                return NextResponse.json({
                    tenders: cached.tenders,
                    sources: { boamp: cached.tenders.length, place: 0, total: cached.tenders.length },
                    error: 'Erreur partielle - données BOAMP uniquement',
                });
            }
        } catch { }

        return NextResponse.json(
            { error: 'Impossible de récupérer les marchés', tenders: [] },
            { status: 500 }
        );
    }
}
