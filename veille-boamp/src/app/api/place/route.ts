// src/app/api/place/route.ts
// API Route pour récupérer les marchés depuis la PLACE

import { NextResponse } from 'next/server';
import { scrapePlaceMinarm, MarchePlace } from '@/lib/place';
import { getDb, isCacheValid, updateCacheMetadata, PlaceTenderRow } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes max pour le scraping

const CACHE_KEY = 'place:minarm';

interface CachedPlaceData {
    marches: MarchePlace[];
    cachedAt: string;
    count: number;
}

// Helper pour convertir une row PostgreSQL en MarchePlace
function rowToMarchePlace(row: PlaceTenderRow): MarchePlace {
    return {
        id: row.id,
        reference: row.reference || undefined,
        titre: row.titre,
        acheteur: row.acheteur || undefined,
        dateLimite: row.date_limite?.toISOString().split('T')[0] || '',
        datePublication: row.date_publication?.toISOString().split('T')[0] || '',
        typeProcedure: row.type_procedure || undefined,
        procedure: row.procedure || undefined,
        lieu: row.lieu || undefined,
        url: row.url || '',
        ministry: (row.ministry as 'MINARM' | 'MININT') || 'MINARM',
    };
}

// GET /api/place - Récupère les marchés PLACE du Ministère des Armées
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    try {
        const db = getDb();

        // Vérifier le cache si pas de force refresh
        if (!forceRefresh) {
            const valid = await isCacheValid(CACHE_KEY);
            if (valid) {
                const rows = await db<PlaceTenderRow[]>`
                    SELECT * FROM place_tenders
                    WHERE ministry = 'MINARM'
                    ORDER BY date_publication DESC
                `;

                if (rows.length > 0) {
                    const marches = rows.map(rowToMarchePlace);
                    const metaRows = await db`
                        SELECT last_updated FROM cache_metadata WHERE cache_key = ${CACHE_KEY}
                    `;
                    const cachedAt = metaRows[0]?.last_updated?.toISOString() || new Date().toISOString();

                    console.log(`PLACE API: Cache PostgreSQL HIT - ${marches.length} marchés (caché le ${cachedAt})`);
                    return NextResponse.json({
                        success: true,
                        source: 'cache',
                        data: marches,
                        meta: {
                            count: marches.length,
                            cachedAt,
                        }
                    });
                }
            }
        }

        // Scraper la PLACE
        console.log('PLACE API: Démarrage du scraping...');
        const marches = await scrapePlaceMinarm();

        // Mettre en cache PostgreSQL
        if (marches.length > 0) {
            await db.begin(async (sql) => {
                // Supprimer les anciens marchés MINARM
                await sql`DELETE FROM place_tenders WHERE ministry = 'MINARM'`;

                // Insérer les nouveaux
                for (const m of marches) {
                    await sql`
                        INSERT INTO place_tenders (id, reference, titre, acheteur, date_limite, date_publication, type_procedure, procedure, lieu, url, ministry, raw_data)
                        VALUES (
                            ${m.id}, ${m.reference || null}, ${m.titre}, ${m.acheteur || null},
                            ${m.dateLimite || null}, ${m.datePublication || null},
                            ${m.typeProcedure || null}, ${m.procedure || null}, ${m.lieu || null},
                            ${m.url}, ${'MINARM'}, ${JSON.stringify(m)}
                        )
                        ON CONFLICT (id) DO UPDATE SET
                            titre = EXCLUDED.titre,
                            date_limite = EXCLUDED.date_limite,
                            updated_at = NOW()
                    `;
                }
            });
            await updateCacheMetadata(CACHE_KEY, marches.length);
            console.log(`PLACE API: ${marches.length} marchés mis en cache PostgreSQL`);
        }

        return NextResponse.json({
            success: true,
            source: 'scrape',
            data: marches,
            meta: {
                count: marches.length,
                scrapedAt: new Date().toISOString(),
            }
        });

    } catch (error) {
        console.error('PLACE API: Erreur:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erreur lors de la récupération des marchés PLACE',
                details: String(error)
            },
            { status: 500 }
        );
    }
}
