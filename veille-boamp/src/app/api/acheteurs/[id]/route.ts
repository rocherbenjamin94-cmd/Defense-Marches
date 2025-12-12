import { NextRequest, NextResponse } from 'next/server';
import { ACHETEURS_DEFENSE } from '@/lib/acheteurs-defense';
import { ACHETEURS_INTERIEUR } from '@/lib/acheteurs-interieur';
import { findMarchesForAcheteur } from '@/lib/boamp';
import { getCachedMarchesDefense, getCachedMarchesInterieur } from '@/lib/acheteurs-cache';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Chercher l'acheteur dans les deux listes
    let acheteur = ACHETEURS_DEFENSE.find(a => a.id === id);
    let ministere = 'defense';

    if (!acheteur) {
        acheteur = ACHETEURS_INTERIEUR.find(a => a.id === id);
        ministere = 'interieur';
    }

    if (!acheteur) {
        return NextResponse.json({ error: 'Acheteur non trouvé' }, { status: 404 });
    }

    try {
        // Récupérer les marchés depuis le cache approprié
        const { marchesByAcheteur } = ministere === 'defense'
            ? await getCachedMarchesDefense()
            : await getCachedMarchesInterieur();

        // Trouver les marchés de cet acheteur
        const marchesAcheteur = findMarchesForAcheteur(acheteur, marchesByAcheteur);

        // Stats
        const stats = {
            actifs: marchesAcheteur.length,
            urgent: marchesAcheteur.filter(m => m.joursRestants <= 7).length,
            moyen: marchesAcheteur.filter(m => m.joursRestants > 7 && m.joursRestants <= 30).length,
        };

        return NextResponse.json({
            ...acheteur,
            ministere,
            stats,
            marches: marchesAcheteur,
        });

    } catch (error) {
        console.error('[API] Erreur:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
