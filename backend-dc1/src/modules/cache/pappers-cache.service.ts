import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { PappersService } from '../pappers/pappers.service';
import { CACHE_DURATIONS } from '../../config/cache-durations';
import { EntrepriseData } from '../../types';

export type PappersUsage = 'info' | 'candidature';

@Injectable()
export class PappersCacheService {
    constructor(
        private db: DatabaseService,
        @Inject(forwardRef(() => PappersService))
        private pappersApi: PappersService,
    ) { }

    /**
     * Récupère une entreprise avec cache intelligent selon l'usage
     * - 'info' : cache 6 mois (simple consultation)
     * - 'candidature' : cache 1 mois (données critiques pour DC1/DC2)
     */
    async getEntreprise(
        siret: string,
        usage: PappersUsage = 'info',
        forceRefresh = false,
    ): Promise<EntrepriseData> {
        if (!forceRefresh) {
            const cached = this.db.query<{ data: string; fetched_at: string }>(
                'SELECT data, fetched_at FROM entreprises_cache WHERE siret = ?',
                [siret],
            );

            if (cached) {
                const age = Date.now() - new Date(cached.fetched_at).getTime();
                const maxAge = CACHE_DURATIONS.pappers[usage];

                if (age < maxAge) {
                    console.log(
                        `[Pappers Cache HIT] SIRET: ${siret}, usage: ${usage}, age: ${Math.round(age / 86400000)}j`,
                    );
                    return JSON.parse(cached.data);
                } else {
                    console.log(
                        `[Pappers Cache EXPIRED] SIRET: ${siret}, usage: ${usage}, age: ${Math.round(age / 86400000)}j > max: ${Math.round(maxAge / 86400000)}j`,
                    );
                }
            }
        }

        // Cache miss ou expiré -> appel API
        console.log(`[Pappers API CALL] SIRET: ${siret}`);
        const data = await this.pappersApi.lookupBySiret(siret);

        // Sauvegarder en cache
        this.db.run(
            `INSERT INTO entreprises_cache (siret, siren, data, fetched_at) 
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (siret) DO UPDATE SET data = ?, fetched_at = CURRENT_TIMESTAMP`,
            [siret, siret.substring(0, 9), JSON.stringify(data), JSON.stringify(data)],
        );

        return data;
    }

    /**
     * Recherche d'entreprise par nom (cache 3 mois)
     */
    async searchEntreprise(
        query: string,
        forceRefresh = false,
    ): Promise<EntrepriseData[]> {
        const normalizedQuery = query.toLowerCase().trim();

        if (!forceRefresh) {
            const cached = this.db.query<{ results: string; fetched_at: string }>(
                'SELECT results, fetched_at FROM pappers_searches_cache WHERE search_query = ?',
                [normalizedQuery],
            );

            if (cached) {
                const age = Date.now() - new Date(cached.fetched_at).getTime();

                if (age < CACHE_DURATIONS.pappers.search) {
                    console.log(`[Pappers Search Cache HIT] Query: "${query}"`);
                    return JSON.parse(cached.results);
                }
            }
        }

        // Appel API
        console.log(`[Pappers Search API CALL] Query: "${query}"`);
        const results = await this.pappersApi.searchByName(query);

        // Sauvegarder
        this.db.run(
            `INSERT INTO pappers_searches_cache (search_query, results, fetched_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (search_query) DO UPDATE SET results = ?, fetched_at = CURRENT_TIMESTAMP`,
            [normalizedQuery, JSON.stringify(results), JSON.stringify(results)],
        );

        return results;
    }
}
