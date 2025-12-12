import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../cache/database.service';
import { v4 as uuidv4 } from 'uuid';

export interface GeneratedDocument {
    id: string;
    user_id: string;
    marche_id: string;
    marche_titre: string;
    marche_acheteur: string;
    document_type: 'dc1' | 'dc2';
    file_name: string;
    file_format: 'pdf' | 'docx';
    generated_at: string;
}

export interface QuotaStatus {
    used: number;
    limit: number;
    canGenerate: boolean;
    resetDate: string;
}

@Injectable()
export class GeneratedDocumentsService {
    private readonly MONTHLY_LIMIT = 5;

    constructor(private readonly databaseService: DatabaseService) { }

    async recordGeneration(userId: string, data: {
        marcheId: string;
        marcheTitre: string;
        marcheAcheteur: string;
        documentType: 'dc1' | 'dc2';
        fileName: string;
        fileFormat: 'pdf' | 'docx';
    }): Promise<void> {
        const id = uuidv4();

        await this.databaseService.run(`
      INSERT INTO generated_documents (id, user_id, marche_id, marche_titre, marche_acheteur, document_type, file_name, file_format)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [id, userId, data.marcheId, data.marcheTitre, data.marcheAcheteur, data.documentType, data.fileName, data.fileFormat]);

        await this.incrementQuota(userId);
    }

    async getHistory(userId: string): Promise<GeneratedDocument[]> {
        return this.databaseService.queryAll<GeneratedDocument>(`
      SELECT * FROM generated_documents
      WHERE user_id = $1
      ORDER BY generated_at DESC
      LIMIT 50
    `, [userId]);
    }

    async checkQuota(userId: string): Promise<QuotaStatus> {
        const quota = await this.databaseService.query<{
            user_id: string;
            generations_used: number;
            quota_reset_date: string;
        }>('SELECT * FROM user_quotas WHERE user_id = $1', [userId]);

        const now = new Date();
        const limit = this.MONTHLY_LIMIT;

        if (!quota) {
            // Creer le quota pour ce user
            const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            await this.databaseService.run(`
        INSERT INTO user_quotas (user_id, generations_used, quota_reset_date)
        VALUES ($1, 0, $2)
      `, [userId, resetDate.toISOString()]);
            return { used: 0, limit, canGenerate: true, resetDate: resetDate.toISOString() };
        }

        // Reset si nouveau mois
        if (new Date(quota.quota_reset_date) <= now) {
            const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            await this.databaseService.run(`
        UPDATE user_quotas SET generations_used = 0, quota_reset_date = $1 WHERE user_id = $2
      `, [resetDate.toISOString(), userId]);
            return { used: 0, limit, canGenerate: true, resetDate: resetDate.toISOString() };
        }

        return {
            used: quota.generations_used,
            limit,
            canGenerate: quota.generations_used < limit,
            resetDate: quota.quota_reset_date
        };
    }

    /**
     * Check quota and increment atomically to prevent race conditions.
     * Returns true if generation is allowed, false if quota exceeded.
     */
    async checkAndIncrementQuota(userId: string): Promise<{ allowed: boolean; status: QuotaStatus }> {
        const now = new Date();
        const limit = this.MONTHLY_LIMIT;
        const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // Use UPSERT with conditional increment to make check+increment atomic
        // This prevents race conditions where two concurrent requests both pass the check
        const result = await this.databaseService.query<{
            generations_used: number;
            quota_reset_date: string;
            was_incremented: boolean;
        }>(`
            INSERT INTO user_quotas (user_id, generations_used, quota_reset_date)
            VALUES ($1, 1, $2)
            ON CONFLICT (user_id) DO UPDATE SET
                generations_used = CASE
                    -- Reset if new month
                    WHEN user_quotas.quota_reset_date <= $3 THEN 1
                    -- Increment only if under limit
                    WHEN user_quotas.generations_used < $4 THEN user_quotas.generations_used + 1
                    -- Keep same if at limit
                    ELSE user_quotas.generations_used
                END,
                quota_reset_date = CASE
                    WHEN user_quotas.quota_reset_date <= $3 THEN $2
                    ELSE user_quotas.quota_reset_date
                END
            RETURNING
                generations_used,
                quota_reset_date,
                (generations_used <= $4) as was_incremented
        `, [userId, resetDate.toISOString(), now.toISOString(), limit]);

        if (!result) {
            return {
                allowed: false,
                status: { used: limit, limit, canGenerate: false, resetDate: resetDate.toISOString() }
            };
        }

        return {
            allowed: result.was_incremented,
            status: {
                used: result.generations_used,
                limit,
                canGenerate: result.generations_used < limit,
                resetDate: result.quota_reset_date
            }
        };
    }

    private async incrementQuota(userId: string): Promise<void> {
        // Ensure quota record exists and increment
        await this.databaseService.run(`
            INSERT INTO user_quotas (user_id, generations_used, quota_reset_date)
            VALUES ($1, 1, NOW() + INTERVAL '1 month')
            ON CONFLICT (user_id) DO UPDATE SET
                generations_used = user_quotas.generations_used + 1
        `, [userId]);
    }
}
