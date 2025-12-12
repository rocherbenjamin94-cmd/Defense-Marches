// src/lib/cache.ts
// Service de cache Redis pour les données BOAMP (compatible Vercel Edge)

import { Redis } from '@upstash/redis'
import { Tender } from './types'

// Singleton Redis client
let redis: Redis | null = null

function getRedis(): Redis | null {
    if (redis) return redis

    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
        console.warn('Cache Redis désactivé: UPSTASH_REDIS_REST_URL ou UPSTASH_REDIS_REST_TOKEN manquant')
        return null
    }

    redis = new Redis({ url, token })
    return redis
}

// Configuration du cache
const CACHE_KEY = 'boamp:tenders'
const CACHE_TTL = 2 * 60 * 60 // 2 heures en secondes

export interface CacheMetadata {
    cachedAt: string
    ttl: number
    count: number
}

export interface CachedTendersData {
    tenders: Tender[]
    metadata: CacheMetadata
}

/**
 * Récupère les marchés depuis le cache Redis
 */
export async function getCachedTenders(): Promise<CachedTendersData | null> {
    const client = getRedis()
    if (!client) return null

    try {
        const data = await client.get<CachedTendersData>(CACHE_KEY)
        if (data) {
            console.log(`Cache HIT: ${data.tenders.length} marchés (caché le ${data.metadata.cachedAt})`)
        }
        return data
    } catch (error) {
        console.error('Erreur Redis get:', error)
        return null
    }
}

/**
 * Stocke les marchés dans le cache Redis
 */
export async function setCachedTenders(tenders: Tender[]): Promise<void> {
    const client = getRedis()
    if (!client) return

    try {
        const data: CachedTendersData = {
            tenders,
            metadata: {
                cachedAt: new Date().toISOString(),
                ttl: CACHE_TTL,
                count: tenders.length
            }
        }
        await client.set(CACHE_KEY, data, { ex: CACHE_TTL })
        console.log(`Cache SET: ${tenders.length} marchés (TTL: ${CACHE_TTL}s)`)
    } catch (error) {
        console.error('Erreur Redis set:', error)
    }
}

/**
 * Invalide le cache (force un refresh au prochain appel)
 */
export async function invalidateCache(): Promise<boolean> {
    const client = getRedis()
    if (!client) return false

    try {
        await client.del(CACHE_KEY)
        console.log('Cache invalidé')
        return true
    } catch (error) {
        console.error('Erreur Redis del:', error)
        return false
    }
}

/**
 * Récupère les stats du cache
 */
export async function getCacheStats(): Promise<{
    connected: boolean
    hasData: boolean
    metadata?: CacheMetadata
}> {
    const client = getRedis()
    if (!client) {
        return { connected: false, hasData: false }
    }

    try {
        const data = await client.get<CachedTendersData>(CACHE_KEY)
        return {
            connected: true,
            hasData: !!data,
            metadata: data?.metadata
        }
    } catch {
        return { connected: false, hasData: false }
    }
}
