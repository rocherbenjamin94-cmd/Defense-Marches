// src/app/api/place/route.ts
// API Route pour récupérer les marchés depuis la PLACE

import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { scrapePlaceMinarm, MarchePlace } from '@/lib/place';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes max pour le scraping

// Cache Redis
let redis: Redis | null = null;

function getRedis(): Redis | null {
    if (redis) return redis;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        console.warn('PLACE API: Redis non configuré');
        return null;
    }

    redis = new Redis({ url, token });
    return redis;
}

const CACHE_KEY = 'place:minarm:marches';
const CACHE_TTL = 2 * 60 * 60; // 2 heures

interface CachedPlaceData {
    marches: MarchePlace[];
    cachedAt: string;
    count: number;
}

// GET /api/place - Récupère les marchés PLACE du Ministère des Armées
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    try {
        const client = getRedis();

        // Vérifier le cache si pas de force refresh
        if (client && !forceRefresh) {
            const cached = await client.get<CachedPlaceData>(CACHE_KEY);
            if (cached) {
                console.log(`PLACE API: Cache hit - ${cached.count} marchés (caché le ${cached.cachedAt})`);
                return NextResponse.json({
                    success: true,
                    source: 'cache',
                    data: cached.marches,
                    meta: {
                        count: cached.count,
                        cachedAt: cached.cachedAt,
                    }
                });
            }
        }

        // Scraper la PLACE
        console.log('PLACE API: Démarrage du scraping...');
        const marches = await scrapePlaceMinarm();

        // Mettre en cache
        if (client && marches.length > 0) {
            const cacheData: CachedPlaceData = {
                marches,
                cachedAt: new Date().toISOString(),
                count: marches.length,
            };
            await client.set(CACHE_KEY, cacheData, { ex: CACHE_TTL });
            console.log(`PLACE API: ${marches.length} marchés mis en cache`);
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
