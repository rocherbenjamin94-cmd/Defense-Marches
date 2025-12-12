import { NextRequest, NextResponse } from 'next/server';
import { ACHETEURS_DEFENSE, getTutelles } from '@/lib/acheteurs-defense';
import { ACHETEURS_INTERIEUR, getTutellesInterieur } from '@/lib/acheteurs-interieur';
import { findMarchesForAcheteur, normalizeString } from '@/lib/boamp';
import { getCachedMarchesDefense, getCachedMarchesInterieur } from '@/lib/acheteurs-cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ministere = searchParams.get('ministere') || 'defense'; // 'defense' ou 'interieur'
    const tutelle = searchParams.get('tutelle');
    const search = searchParams.get('search');

    try {
        // Sélectionner les données selon le ministère
        const isDefense = ministere === 'defense';
        const ACHETEURS = isDefense ? ACHETEURS_DEFENSE : ACHETEURS_INTERIEUR;
        const tutellesDisponibles = isDefense ? getTutelles() : getTutellesInterieur();

        // Récupérer les marchés depuis le cache approprié
        const { marches, marchesByAcheteur } = isDefense
            ? await getCachedMarchesDefense()
            : await getCachedMarchesInterieur();

        // Enrichir notre liste d'acheteurs
        let acheteurs = ACHETEURS.map(a => {
            const marchesAcheteur = findMarchesForAcheteur(a, marchesByAcheteur);

            return {
                ...a,
                marchesActifs: marchesAcheteur.length,
                marchesUrgents: marchesAcheteur.filter(m => m.joursRestants <= 7).length,
                dernierMarche: marchesAcheteur[0] || null,
            };
        });

        // Filtrer par tutelle
        if (tutelle && tutelle !== 'all') {
            acheteurs = acheteurs.filter(a => a.tutelle === tutelle);
        }

        // Filtrer par recherche
        if (search) {
            const searchNorm = normalizeString(search);
            acheteurs = acheteurs.filter(a =>
                normalizeString(a.nom).includes(searchNorm) ||
                normalizeString(a.code).includes(searchNorm)
            );
        }

        // Trier : d'abord ceux avec marchés actifs, puis par nombre décroissant
        acheteurs.sort((a, b) => {
            if (a.marchesActifs > 0 && b.marchesActifs === 0) return -1;
            if (a.marchesActifs === 0 && b.marchesActifs > 0) return 1;
            return b.marchesActifs - a.marchesActifs;
        });

        // Stats globales
        const stats = {
            totalAcheteurs: ACHETEURS.length,
            acheteursAffiches: acheteurs.length,
            acheteursAvecMarches: acheteurs.filter(a => a.marchesActifs > 0).length,
            totalMarchesActifs: marches.length,
            marchesUrgents: marches.filter(m => m.joursRestants <= 7).length,
        };

        return NextResponse.json({
            acheteurs,
            stats,
            tutelles: tutellesDisponibles,
            ministere,
        });

    } catch (error) {
        console.error('[API] Erreur:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
