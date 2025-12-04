import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import initSqlJs, { Database } from 'sql.js';
import * as path from 'path';
import * as fs from 'fs';
import { EntrepriseRecord, EntrepriseInput, CacheStats } from './database.types';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: Database;
  private dbPath: string;

  async onModuleInit() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.dbPath = path.join(dataDir, 'cache.db');

    const SQL = await initSqlJs();

    if (fs.existsSync(this.dbPath)) {
      const filebuffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(filebuffer);
    } else {
      this.db = new SQL.Database();
      this.save();
    }

    this.initSchema();
  }

  onModuleDestroy() {
    if (this.db) {
      this.save();
      this.db.close();
    }
  }

  private save() {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  private initSchema() {
    // Cache des analyses de documents RC par Claude
    this.db.run(`
      CREATE TABLE IF NOT EXISTS document_analyses (
        id TEXT PRIMARY KEY,
        document_hash TEXT UNIQUE NOT NULL,
        analysis_result TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
      )
    `);

    // Cache des marchés BOAMP enrichis
    this.db.run(`
      CREATE TABLE IF NOT EXISTS marches_cache (
        id TEXT PRIMARY KEY,
        raw_data TEXT NOT NULL,
        enriched_data TEXT,
        last_fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cache des entreprises Pappers
    this.db.run(`
      CREATE TABLE IF NOT EXISTS entreprises_cache (
        siret TEXT PRIMARY KEY,
        siren TEXT NOT NULL,
        data TEXT NOT NULL,
        fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cache des recherches Pappers
    this.db.run(`
      CREATE TABLE IF NOT EXISTS pappers_searches_cache (
        search_query TEXT PRIMARY KEY,
        results TEXT NOT NULL,
        fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Logs des recherches
    this.db.run(`
      CREATE TABLE IF NOT EXISTS search_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        query_type TEXT NOT NULL,
        source TEXT NOT NULL,
        resultat_count INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('[Database] Cache schema initialized');
    this.save();
  }

  query<T = any>(sql: string, params: any[] = []): T | undefined {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    let result: T | undefined;
    if (stmt.step()) {
      result = stmt.getAsObject() as T;
    }
    stmt.free();
    return result;
  }

  queryAll<T = any>(sql: string, params: any[] = []): T[] {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as T);
    }
    stmt.free();
    return results;
  }

  run(sql: string, params: any[] = []): void {
    this.db.run(sql, params);
    this.save();
  }

  // --- Document Analysis Methods ---

  findDocumentByHash(hash: string): any {
    return this.query('SELECT * FROM document_analyses WHERE document_hash = ?', [hash]);
  }

  getDocumentAnalyses(limit: number): any[] {
    return this.queryAll('SELECT * FROM document_analyses ORDER BY created_at DESC LIMIT ?', [limit]);
  }

  // --- Entreprise Methods ---

  findBySiret(siret: string): EntrepriseRecord | undefined {
    const row = this.query<{ siret: string; siren: string; data: string; fetched_at: string }>(
      'SELECT * FROM entreprises_cache WHERE siret = ?',
      [siret],
    );
    return row ? this.mapRowToEntrepriseRecord(row) : undefined;
  }

  findBySiren(siren: string): EntrepriseRecord | undefined {
    const row = this.query<{ siret: string; siren: string; data: string; fetched_at: string }>(
      'SELECT * FROM entreprises_cache WHERE siren = ? LIMIT 1',
      [siren],
    );
    return row ? this.mapRowToEntrepriseRecord(row) : undefined;
  }

  searchByName(query: string): EntrepriseRecord[] {
    // Simple LIKE search on the JSON data string
    const rows = this.queryAll<{ siret: string; siren: string; data: string; fetched_at: string }>(
      'SELECT * FROM entreprises_cache WHERE data LIKE ? LIMIT 20',
      [`%${query}%`],
    );
    return rows.map((row) => this.mapRowToEntrepriseRecord(row));
  }

  getAllEntreprises(limit: number, offset: number): EntrepriseRecord[] {
    const rows = this.queryAll<{ siret: string; siren: string; data: string; fetched_at: string }>(
      'SELECT * FROM entreprises_cache ORDER BY fetched_at DESC LIMIT ? OFFSET ?',
      [limit, offset],
    );
    return rows.map((row) => this.mapRowToEntrepriseRecord(row));
  }

  upsert(data: EntrepriseInput): void {
    const json = JSON.stringify(data);
    this.run(
      `INSERT INTO entreprises_cache (siret, siren, data, fetched_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(siret) DO UPDATE SET
         siren = excluded.siren,
         data = excluded.data,
         fetched_at = CURRENT_TIMESTAMP`,
      [data.siret, data.siren, json],
    );
  }

  // --- Stats & Logs ---

  logSearch(query: string, type: string, source: string, count: number): void {
    this.run(
      'INSERT INTO search_logs (query, query_type, source, resultat_count) VALUES (?, ?, ?, ?)',
      [query, type, source, count],
    );
  }

  getStats(): CacheStats {
    const totalEntreprises = this.query<{ count: number }>('SELECT COUNT(*) as count FROM entreprises_cache')?.count || 0;
    const totalSearches = this.query<{ count: number }>('SELECT COUNT(*) as count FROM search_logs')?.count || 0;
    const cacheHits = this.query<{ count: number }>('SELECT COUNT(*) as count FROM search_logs WHERE source = ?', ['cache'])?.count || 0;

    return {
      total_entreprises: totalEntreprises,
      from_pappers: totalEntreprises, // Assuming all come from Pappers eventually
      total_searches: totalSearches,
      cache_hits: cacheHits,
      cache_hit_rate: totalSearches > 0 ? ((cacheHits / totalSearches) * 100).toFixed(1) + '%' : '0%',
    };
  }

  private mapRowToEntrepriseRecord(row: { siret: string; siren: string; data: string; fetched_at: string }): EntrepriseRecord {
    const data = JSON.parse(row.data) as EntrepriseInput;
    return {
      id: 0, // Not used in this schema
      siren: row.siren,
      siret: row.siret,
      nom_entreprise: data.nom_entreprise,
      denomination_sociale: data.denomination_sociale || null,
      forme_juridique: data.forme_juridique || null,
      adresse_ligne_1: data.adresse_ligne_1 || null,
      code_postal: data.code_postal || null,
      ville: data.ville || null,
      code_naf: data.code_naf || null,
      libelle_naf: data.libelle_naf || null,
      effectif: data.effectif || null,
      source: 'cache',
      created_at: row.fetched_at,
      updated_at: row.fetched_at,
      date_creation: data.date_creation || null,
      capital: data.capital || null,
      numero_rcs: data.numero_rcs || null,
      greffe: data.greffe || null,
    };
  }
}
