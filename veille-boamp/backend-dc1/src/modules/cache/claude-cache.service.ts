import { Injectable, Inject, forwardRef } from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from './database.service';
import { ClaudeService } from '../claude/claude.service';
import { CACHE_DURATIONS } from '../../config/cache-durations';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ClaudeCacheService {
    constructor(
        private db: DatabaseService,
        @Inject(forwardRef(() => ClaudeService))
        private claudeApi: ClaudeService,
    ) { }

    /**
     * Analyse un document avec cache basé sur le hash du fichier
     * Même document = même résultat, pas besoin de ré-analyser
     */
    async analyzeDocument(
        file: Buffer,
        generator: () => Promise<any>,
        forceRefresh = false,
    ): Promise<any> {
        // 1. Calculer le hash unique du document
        const hash = crypto.createHash('sha256').update(file).digest('hex');

        if (!forceRefresh) {
            // 2. Vérifier le cache
            const cached = this.db.query<{
                analysis_result: string;
                created_at: string;
            }>(
                'SELECT analysis_result, created_at FROM document_analyses WHERE document_hash = ?',
                [hash],
            );

            if (cached) {
                const age = Date.now() - new Date(cached.created_at).getTime();

                if (age < CACHE_DURATIONS.documentAnalysis) {
                    console.log(
                        `[Claude Cache HIT] Document hash: ${hash.substring(0, 16)}...`,
                    );
                    return JSON.parse(cached.analysis_result);
                }
            }
        }

        // 3. Cache miss -> appel via le générateur (Claude API)
        console.log(
            `[Claude API CALL] Analyzing document, hash: ${hash.substring(0, 16)}...`,
        );
        const result = await generator();

        // 4. Sauvegarder en cache
        const id = uuidv4();
        this.db.run(
            `INSERT INTO document_analyses (id, document_hash, analysis_result, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (document_hash) DO UPDATE SET analysis_result = ?, created_at = CURRENT_TIMESTAMP`,
            [id, hash, JSON.stringify(result), JSON.stringify(result)],
        );

        return result;
    }
}
