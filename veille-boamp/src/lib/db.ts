// src/lib/db.ts
// Client PostgreSQL pour Next.js API routes
// Remplace Upstash Redis

import postgres from 'postgres'

// Singleton connection
let sql: ReturnType<typeof postgres> | null = null

export function getDb() {
    if (sql) return sql

    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
        console.error('DATABASE_URL non définie')
        throw new Error('DATABASE_URL environment variable is required')
    }

    sql = postgres(connectionString, {
        max: 10, // Max connections in pool
        idle_timeout: 20, // Close idle connections after 20 seconds
        connect_timeout: 10, // Connection timeout
    })

    return sql
}

// Types pour les tables
export interface TenderCacheRow {
    id: string
    title: string
    description: string | null
    buyer_name: string | null
    buyer_department: string | null
    publication_date: Date
    deadline_date: Date | null
    procedure_type: string | null
    sectors: string[] | null
    urgency_level: string
    boamp_url: string | null
    score: number
    location: string | null
    cpv: string | null
    market_nature: string | null
    amount_range: string | null
    is_joue: boolean
    is_defense_equipment: boolean
    source: string
    raw_data: Record<string, unknown> | null
    created_at: Date
    updated_at: Date
    expires_at: Date | null
}

export interface PlaceTenderRow {
    id: string
    reference: string | null
    titre: string
    acheteur: string | null
    date_limite: Date | null
    date_publication: Date | null
    type_procedure: string | null
    procedure: string | null
    lieu: string | null
    url: string | null
    ministry: string | null
    raw_data: Record<string, unknown> | null
    created_at: Date
    updated_at: Date
}

export interface CacheMetadataRow {
    cache_key: string
    last_updated: Date
    ttl_seconds: number
    record_count: number
    metadata: Record<string, unknown> | null
}

// Helper pour vérifier si le cache est valide
export async function isCacheValid(cacheKey: string): Promise<boolean> {
    const db = getDb()

    const result = await db<CacheMetadataRow[]>`
        SELECT * FROM cache_metadata
        WHERE cache_key = ${cacheKey}
    `

    if (result.length === 0) return false

    const metadata = result[0]
    const expiresAt = new Date(metadata.last_updated.getTime() + metadata.ttl_seconds * 1000)

    return new Date() < expiresAt
}

// Helper pour mettre à jour les métadonnées de cache
export async function updateCacheMetadata(
    cacheKey: string,
    recordCount: number
): Promise<void> {
    const db = getDb()

    await db`
        INSERT INTO cache_metadata (cache_key, last_updated, ttl_seconds, record_count)
        VALUES (${cacheKey}, NOW(), ${getCacheTTL(cacheKey)}, ${recordCount})
        ON CONFLICT (cache_key) DO UPDATE SET
            last_updated = NOW(),
            record_count = ${recordCount}
    `
}

// TTL par type de cache
function getCacheTTL(cacheKey: string): number {
    const ttlConfig: Record<string, number> = {
        'boamp:tenders': parseInt(process.env.BOAMP_CACHE_TTL || '7200'),     // 2 heures
        'place:minarm': parseInt(process.env.PLACE_CACHE_TTL || '604800'),    // 7 jours
        'place:minint': parseInt(process.env.PLACE_CACHE_TTL || '604800'),    // 7 jours
        'ted:tenders': parseInt(process.env.TED_CACHE_TTL || '3600'),         // 1 heure
    }
    return ttlConfig[cacheKey] || 3600
}

// Fermer proprement la connexion (pour les tests)
export async function closeDb(): Promise<void> {
    if (sql) {
        await sql.end()
        sql = null
    }
}
