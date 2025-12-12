// src/lib/cache.ts
// Service de cache PostgreSQL pour les données BOAMP
// Remplace l'ancienne implémentation Upstash Redis

import { getDb, isCacheValid, updateCacheMetadata, TenderCacheRow } from './db'
import { Tender } from './types'

// Configuration du cache
const CACHE_KEY = 'boamp:tenders'
const CACHE_TTL = parseInt(process.env.BOAMP_CACHE_TTL || '7200') // 2 heures en secondes

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
 * Convertit une row PostgreSQL en objet Tender
 */
function rowToTender(row: TenderCacheRow): Tender {
    return {
        id: row.id,
        title: row.title,
        description: row.description || '',
        buyer: {
            name: row.buyer_name || '',
            department: row.buyer_department || undefined,
        },
        publicationDate: row.publication_date.toISOString(),
        deadlineDate: row.deadline_date?.toISOString() || '',
        procedureType: row.procedure_type || '',
        sectors: row.sectors || [],
        urgencyLevel: (row.urgency_level as 'normal' | 'urgent' | 'critical') || 'normal',
        boampUrl: row.boamp_url || '',
        score: row.score,
        cpv: row.cpv || undefined,
        location: row.location || undefined,
        isDefenseEquipment: row.is_defense_equipment,
        isJOUE: row.is_joue,
        marketNature: row.market_nature as 'fournitures' | 'services' | 'travaux' | undefined,
        amountRange: row.amount_range as 'small' | 'medium' | 'large' | 'xlarge' | undefined,
        source: (row.source as 'BOAMP' | 'PLACE') || 'BOAMP',
    }
}

/**
 * Récupère les marchés depuis le cache PostgreSQL
 */
export async function getCachedTenders(): Promise<CachedTendersData | null> {
    try {
        const db = getDb()

        // Vérifier si le cache est valide
        const valid = await isCacheValid(CACHE_KEY)
        if (!valid) {
            console.log('Cache PostgreSQL: Cache expiré ou inexistant')
            return null
        }

        // Récupérer les tenders du cache
        const rows = await db<TenderCacheRow[]>`
            SELECT * FROM tender_cache
            WHERE source = 'BOAMP'
            AND (expires_at IS NULL OR expires_at > NOW())
            ORDER BY publication_date DESC
        `

        if (rows.length === 0) {
            return null
        }

        const tenders = rows.map(rowToTender)

        // Récupérer les métadonnées
        const metaRows = await db`
            SELECT * FROM cache_metadata WHERE cache_key = ${CACHE_KEY}
        `
        const meta = metaRows[0]

        const data: CachedTendersData = {
            tenders,
            metadata: {
                cachedAt: meta?.last_updated?.toISOString() || new Date().toISOString(),
                ttl: meta?.ttl_seconds || CACHE_TTL,
                count: tenders.length
            }
        }

        console.log(`Cache PostgreSQL HIT: ${tenders.length} marchés (caché le ${data.metadata.cachedAt})`)
        return data
    } catch (error) {
        console.error('Erreur PostgreSQL get:', error)
        return null
    }
}

/**
 * Stocke les marchés dans le cache PostgreSQL
 */
export async function setCachedTenders(tenders: Tender[]): Promise<void> {
    try {
        const db = getDb()
        const expiresAt = new Date(Date.now() + CACHE_TTL * 1000)

        // Utiliser une transaction pour l'atomicité
        await db.begin(async (sql) => {
            // Supprimer les anciens tenders BOAMP
            await sql`DELETE FROM tender_cache WHERE source = 'BOAMP'`

            // Insérer les nouveaux tenders
            for (const tender of tenders) {
                await sql`
                    INSERT INTO tender_cache (
                        id, title, description, buyer_name, buyer_department,
                        publication_date, deadline_date, procedure_type, sectors,
                        urgency_level, boamp_url, score, location, cpv,
                        market_nature, amount_range, is_joue, is_defense_equipment,
                        source, raw_data, expires_at
                    ) VALUES (
                        ${tender.id},
                        ${tender.title},
                        ${tender.description},
                        ${tender.buyer.name},
                        ${tender.buyer.department || null},
                        ${tender.publicationDate},
                        ${tender.deadlineDate || null},
                        ${tender.procedureType},
                        ${tender.sectors},
                        ${tender.urgencyLevel},
                        ${tender.boampUrl},
                        ${tender.score},
                        ${tender.location || null},
                        ${tender.cpv || null},
                        ${tender.marketNature || null},
                        ${tender.amountRange || null},
                        ${tender.isJOUE || false},
                        ${tender.isDefenseEquipment || false},
                        'BOAMP',
                        ${JSON.stringify(tender)},
                        ${expiresAt}
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        description = EXCLUDED.description,
                        deadline_date = EXCLUDED.deadline_date,
                        updated_at = NOW(),
                        expires_at = EXCLUDED.expires_at
                `
            }
        })

        // Mettre à jour les métadonnées
        await updateCacheMetadata(CACHE_KEY, tenders.length)

        console.log(`Cache PostgreSQL SET: ${tenders.length} marchés (TTL: ${CACHE_TTL}s)`)
    } catch (error) {
        console.error('Erreur PostgreSQL set:', error)
    }
}

/**
 * Invalide le cache (force un refresh au prochain appel)
 */
export async function invalidateCache(): Promise<boolean> {
    try {
        const db = getDb()

        await db`DELETE FROM tender_cache WHERE source = 'BOAMP'`
        await db`
            UPDATE cache_metadata
            SET last_updated = '1970-01-01'::timestamptz, record_count = 0
            WHERE cache_key = ${CACHE_KEY}
        `

        console.log('Cache PostgreSQL invalidé')
        return true
    } catch (error) {
        console.error('Erreur PostgreSQL del:', error)
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
    try {
        const db = getDb()

        // Test de connexion
        await db`SELECT 1`

        const metaRows = await db`
            SELECT * FROM cache_metadata WHERE cache_key = ${CACHE_KEY}
        `

        if (metaRows.length === 0) {
            return { connected: true, hasData: false }
        }

        const meta = metaRows[0]
        const valid = await isCacheValid(CACHE_KEY)

        return {
            connected: true,
            hasData: valid && meta.record_count > 0,
            metadata: {
                cachedAt: meta.last_updated?.toISOString() || '',
                ttl: meta.ttl_seconds || CACHE_TTL,
                count: meta.record_count || 0
            }
        }
    } catch {
        return { connected: false, hasData: false }
    }
}
