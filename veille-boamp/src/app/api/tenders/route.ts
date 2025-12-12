// src/app/api/tenders/route.ts
// API Route avec cache Redis pour les données BOAMP

import { NextResponse } from 'next/server'
import { getCachedTenders, setCachedTenders } from '@/lib/cache'
import { fetchDefenseTendersFromAPI } from '@/lib/boamp'

export const dynamic = 'force-dynamic' // Désactive le cache Next.js (on gère avec Redis)
export const maxDuration = 60 // Timeout 60s pour les appels BOAMP

export async function GET() {
    try {
        // 1. Essayer le cache Redis d'abord
        const cached = await getCachedTenders()

        if (cached && cached.tenders.length > 0) {
            return NextResponse.json({
                tenders: cached.tenders,
                source: 'cache',
                cachedAt: cached.metadata.cachedAt,
                count: cached.tenders.length
            }, {
                headers: {
                    'X-Cache': 'HIT',
                    'X-Cache-Age': cached.metadata.cachedAt,
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
                }
            })
        }

        // 2. Cache miss - appeler l'API BOAMP directement
        console.log('Cache MISS - Appel API BOAMP...')
        const tenders = await fetchDefenseTendersFromAPI()

        // 3. Stocker dans le cache Redis
        await setCachedTenders(tenders)

        return NextResponse.json({
            tenders,
            source: 'api',
            cachedAt: new Date().toISOString(),
            count: tenders.length
        }, {
            headers: {
                'X-Cache': 'MISS',
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
        })

    } catch (error) {
        console.error('Erreur API /api/tenders:', error)

        // En cas d'erreur, essayer de retourner le cache même périmé
        const cached = await getCachedTenders()
        if (cached) {
            return NextResponse.json({
                tenders: cached.tenders,
                source: 'cache-stale',
                cachedAt: cached.metadata.cachedAt,
                count: cached.tenders.length,
                error: 'Données possiblement périmées (erreur lors du refresh)'
            }, {
                headers: { 'X-Cache': 'STALE' }
            })
        }

        return NextResponse.json(
            { error: 'Impossible de récupérer les marchés', tenders: [] },
            { status: 500 }
        )
    }
}
