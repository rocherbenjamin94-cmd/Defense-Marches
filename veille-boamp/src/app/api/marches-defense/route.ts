import { NextResponse } from 'next/server';
import { getCachedMarchesDefense, getCachedMarchesInterieur } from '@/lib/acheteurs-cache';
import { Tender, MarketNature } from '@/lib/types';
import { findAcheteurIdByName } from '@/lib/boamp';
import { ACHETEURS_DEFENSE } from '@/lib/acheteurs-defense';
import { ACHETEURS_INTERIEUR } from '@/lib/acheteurs-interieur';

export const dynamic = 'force-dynamic';

// Liste combinée de tous les acheteurs pour le matching
const ALL_ACHETEURS = [...ACHETEURS_DEFENSE, ...ACHETEURS_INTERIEUR];

// Transformer MarcheBoamp en Tender pour compatibilité avec TenderSpotterHome
function transformToTender(marche: any): Tender {
    // Déterminer la nature du marché
    let marketNature: MarketNature | undefined;
    const typeStr = (marche.type || '').toLowerCase();
    if (typeStr.includes('fourniture')) marketNature = 'fournitures';
    else if (typeStr.includes('service')) marketNature = 'services';
    else if (typeStr.includes('travaux')) marketNature = 'travaux';

    // Déterminer l'urgence
    let urgencyLevel: 'normal' | 'urgent' | 'critical' = 'normal';
    if (marche.joursRestants <= 2) urgencyLevel = 'critical';
    else if (marche.joursRestants <= 7) urgencyLevel = 'urgent';

    // Trouver l'ID de l'acheteur pour le lien
    const acheteurId = findAcheteurIdByName(marche.acheteur, ALL_ACHETEURS);

    return {
        id: marche.id,
        title: marche.titre,
        buyer: {
            id: acheteurId,
            name: marche.acheteur,
            type: marche.type,
        },
        publicationDate: marche.datePublication,
        deadlineDate: marche.dateLimite,
        procedureType: marche.procedure,
        description: `Marché publié par ${marche.acheteur}`,
        sectors: [marche.tutelleGroupe],
        urgencyLevel,
        boampUrl: marche.url || `https://www.boamp.fr/avis/detail/${marche.id}`,
        score: 85,
        marketNature,
    };
}

export async function GET() {
    try {
        // Récupérer les marchés Défense ET Intérieur en parallèle
        const [defenseData, interieurData] = await Promise.all([
            getCachedMarchesDefense(),
            getCachedMarchesInterieur()
        ]);

        // Combiner les deux sources
        const allMarches = [...defenseData.marches, ...interieurData.marches];

        // Transformer en format Tender
        const tenders = allMarches.map(transformToTender);

        // Trier par date de publication décroissante
        tenders.sort((a, b) =>
            new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
        );

        return NextResponse.json({
            tenders,
            count: tenders.length,
            countDefense: defenseData.marches.length,
            countInterieur: interieurData.marches.length,
            source: 'acheteurs-defense-interieur',
        });

    } catch (error) {
        console.error('[API marches-defense] Erreur:', error);
        return NextResponse.json({ error: 'Erreur serveur', tenders: [] }, { status: 500 });
    }
}
