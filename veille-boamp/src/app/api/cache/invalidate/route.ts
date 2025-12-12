// src/app/api/cache/invalidate/route.ts
// Route pour invalider le cache Redis (usage admin)

import { NextResponse } from 'next/server'
import { invalidateCache, getCacheStats } from '@/lib/cache'

export const dynamic = 'force-dynamic'

// GET /api/cache/invalidate - Invalide le cache et retourne les stats
export async function GET(request: Request) {
    // Vérification simple par query param (à remplacer par auth si besoin)
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    // Clé secrète simple (à mettre en env var en prod)
    const SECRET_KEY = process.env.CACHE_INVALIDATE_KEY || 'tenderspotter-reset-2024'

    if (key !== SECRET_KEY) {
        return NextResponse.json(
            { error: 'Unauthorized', hint: 'Add ?key=YOUR_SECRET_KEY' },
            { status: 401 }
        )
    }

    try {
        // Stats avant invalidation
        const statsBefore = await getCacheStats()

        // Invalider le cache
        const success = await invalidateCache()

        // Stats après invalidation
        const statsAfter = await getCacheStats()

        return NextResponse.json({
            success,
            message: success ? 'Cache invalidé avec succès' : 'Échec de l\'invalidation',
            before: statsBefore,
            after: statsAfter,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Erreur invalidation cache:', error)
        return NextResponse.json(
            { error: 'Erreur serveur', details: String(error) },
            { status: 500 }
        )
    }
}
