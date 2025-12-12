import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';
import { EntrepriseRecord, EntrepriseInput, CacheStats } from './database.types';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    this.pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Test connection
    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
      console.log('[Database] PostgreSQL connected successfully');
    } finally {
      client.release();
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      console.log('[Database] PostgreSQL pool closed');
    }
  }

  // --- Low-level query methods ---

  async query<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const result = await this.pool.query(sql, params);
    return result.rows[0] as T | undefined;
  }

  async queryAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const result = await this.pool.query(sql, params);
    return result.rows as T[];
  }

  async run(sql: string, params: any[] = []): Promise<void> {
    await this.pool.query(sql, params);
  }

  // --- Document Analysis Methods ---

  async findDocumentByHash(hash: string): Promise<any> {
    return this.query(
      'SELECT * FROM document_analyses WHERE document_hash = $1',
      [hash]
    );
  }

  async saveDocumentAnalysis(id: string, hash: string, result: any, expiresAt?: Date): Promise<void> {
    await this.run(
      `INSERT INTO document_analyses (id, document_hash, analysis_result, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (document_hash) DO UPDATE SET
         analysis_result = EXCLUDED.analysis_result,
         expires_at = EXCLUDED.expires_at`,
      [id, hash, JSON.stringify(result), expiresAt]
    );
  }

  async getDocumentAnalyses(limit: number): Promise<any[]> {
    return this.queryAll(
      'SELECT * FROM document_analyses ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
  }

  // --- Entreprise Methods ---

  async findBySiret(siret: string): Promise<EntrepriseRecord | undefined> {
    const row = await this.query<EntrepriseRecord>(
      'SELECT * FROM entreprises WHERE siret = $1',
      [siret]
    );
    return row;
  }

  async findBySiren(siren: string): Promise<EntrepriseRecord | undefined> {
    const row = await this.query<EntrepriseRecord>(
      'SELECT * FROM entreprises WHERE siren = $1 LIMIT 1',
      [siren]
    );
    return row;
  }

  async searchByName(query: string): Promise<EntrepriseRecord[]> {
    // Use pg_trgm for fuzzy search
    return this.queryAll<EntrepriseRecord>(
      `SELECT * FROM entreprises
       WHERE nom_entreprise ILIKE $1
       ORDER BY similarity(nom_entreprise, $2) DESC
       LIMIT 20`,
      [`%${query}%`, query]
    );
  }

  async getAllEntreprises(limit: number, offset: number): Promise<EntrepriseRecord[]> {
    return this.queryAll<EntrepriseRecord>(
      'SELECT * FROM entreprises ORDER BY updated_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
  }

  async upsert(data: EntrepriseInput): Promise<void> {
    await this.run(
      `INSERT INTO entreprises (
        siret, siren, nom_entreprise, denomination_sociale, forme_juridique,
        adresse_ligne_1, code_postal, ville, code_naf, libelle_naf,
        effectif, date_creation, capital, numero_rcs, greffe, raw_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (siret) DO UPDATE SET
        siren = EXCLUDED.siren,
        nom_entreprise = EXCLUDED.nom_entreprise,
        denomination_sociale = EXCLUDED.denomination_sociale,
        forme_juridique = EXCLUDED.forme_juridique,
        adresse_ligne_1 = EXCLUDED.adresse_ligne_1,
        code_postal = EXCLUDED.code_postal,
        ville = EXCLUDED.ville,
        code_naf = EXCLUDED.code_naf,
        libelle_naf = EXCLUDED.libelle_naf,
        effectif = EXCLUDED.effectif,
        date_creation = EXCLUDED.date_creation,
        capital = EXCLUDED.capital,
        numero_rcs = EXCLUDED.numero_rcs,
        greffe = EXCLUDED.greffe,
        raw_data = EXCLUDED.raw_data,
        updated_at = NOW()`,
      [
        data.siret,
        data.siren,
        data.nom_entreprise,
        data.denomination_sociale || null,
        data.forme_juridique || null,
        data.adresse_ligne_1 || null,
        data.code_postal || null,
        data.ville || null,
        data.code_naf || null,
        data.libelle_naf || null,
        data.effectif || null,
        data.date_creation || null,
        data.capital || null,
        data.numero_rcs || null,
        data.greffe || null,
        JSON.stringify(data),
      ]
    );
  }

  // --- Pappers Search Cache ---

  async findPappersSearch(query: string): Promise<any | undefined> {
    const row = await this.query<{ results: any }>(
      'SELECT results FROM pappers_searches_cache WHERE search_query = $1',
      [query]
    );
    return row?.results;
  }

  async savePappersSearch(query: string, results: any): Promise<void> {
    await this.run(
      `INSERT INTO pappers_searches_cache (search_query, results)
       VALUES ($1, $2)
       ON CONFLICT (search_query) DO UPDATE SET
         results = EXCLUDED.results,
         fetched_at = NOW()`,
      [query, JSON.stringify(results)]
    );
  }

  // --- Generated Documents ---

  async saveGeneratedDocument(
    id: string,
    userId: string,
    marcheId: string,
    marcheTitre: string | null,
    marcheAcheteur: string | null,
    documentType: string,
    fileName: string | null,
    fileFormat: string | null
  ): Promise<void> {
    await this.run(
      `INSERT INTO generated_documents (
        id, user_id, marche_id, marche_titre, marche_acheteur,
        document_type, file_name, file_format
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, userId, marcheId, marcheTitre, marcheAcheteur, documentType, fileName, fileFormat]
    );
  }

  async getGeneratedDocuments(userId: string, limit: number = 50): Promise<any[]> {
    return this.queryAll(
      `SELECT * FROM generated_documents
       WHERE user_id = $1
       ORDER BY generated_at DESC
       LIMIT $2`,
      [userId, limit]
    );
  }

  // --- User Quotas ---

  async getUserQuota(userId: string): Promise<{ generations_used: number; quota_reset_date: Date | null } | undefined> {
    return this.query(
      'SELECT generations_used, quota_reset_date FROM user_quotas WHERE user_id = $1',
      [userId]
    );
  }

  async incrementUserQuota(userId: string): Promise<void> {
    await this.run(
      `INSERT INTO user_quotas (user_id, generations_used, quota_reset_date)
       VALUES ($1, 1, NOW() + INTERVAL '1 month')
       ON CONFLICT (user_id) DO UPDATE SET
         generations_used = user_quotas.generations_used + 1,
         updated_at = NOW()`,
      [userId]
    );
  }

  async resetUserQuota(userId: string): Promise<void> {
    await this.run(
      `UPDATE user_quotas SET
        generations_used = 0,
        quota_reset_date = NOW() + INTERVAL '1 month',
        updated_at = NOW()
       WHERE user_id = $1`,
      [userId]
    );
  }

  // --- Stats & Logs ---

  async logSearch(query: string, type: string, source: string, count: number): Promise<void> {
    await this.run(
      'INSERT INTO search_logs (query, query_type, source, resultat_count) VALUES ($1, $2, $3, $4)',
      [query, type, source, count]
    );
  }

  async getStats(): Promise<CacheStats> {
    const totalEntreprises = (await this.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM entreprises'
    ))?.count || '0';

    const totalSearches = (await this.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM search_logs'
    ))?.count || '0';

    const cacheHits = (await this.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM search_logs WHERE source = 'cache'"
    ))?.count || '0';

    const total = parseInt(totalSearches);
    const hits = parseInt(cacheHits);

    return {
      total_entreprises: parseInt(totalEntreprises),
      from_pappers: parseInt(totalEntreprises),
      total_searches: total,
      cache_hits: hits,
      cache_hit_rate: total > 0 ? ((hits / total) * 100).toFixed(1) + '%' : '0%',
    };
  }

  // --- Health Check ---

  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
