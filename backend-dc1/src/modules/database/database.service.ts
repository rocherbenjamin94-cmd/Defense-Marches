import { Injectable, OnModuleInit } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import type {
  EntrepriseRecord,
  EntrepriseInput,
  CacheStats,
} from './database.types';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private db!: Database.Database;
  private readonly dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'entreprises.db');
  }

  onModuleInit() {
    this.ensureDataDirectory();
    this.db = new Database(this.dbPath);
    this.init();
  }

  private ensureDataDirectory() {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS entreprises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        siren VARCHAR(9) NOT NULL,
        siret VARCHAR(14) UNIQUE NOT NULL,
        nom_entreprise VARCHAR(255) NOT NULL,
        denomination_sociale VARCHAR(255),
        forme_juridique VARCHAR(100),
        adresse_ligne_1 VARCHAR(255),
        code_postal VARCHAR(10),
        ville VARCHAR(100),
        code_naf VARCHAR(10),
        libelle_naf VARCHAR(255),
        effectif VARCHAR(50),
        source VARCHAR(20) DEFAULT 'pappers',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_siren ON entreprises(siren);
      CREATE INDEX IF NOT EXISTS idx_siret ON entreprises(siret);
      CREATE INDEX IF NOT EXISTS idx_nom ON entreprises(nom_entreprise COLLATE NOCASE);

      CREATE TABLE IF NOT EXISTS recherches_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query VARCHAR(255) NOT NULL,
        query_type VARCHAR(20) NOT NULL,
        source VARCHAR(20) NOT NULL,
        resultat_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS documents_analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename VARCHAR(255) NOT NULL,
        filepath VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size INTEGER NOT NULL,
        extracted_data TEXT,
        confidence INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migration: ajouter content_hash si la colonne n'existe pas (pour les DB existantes)
    const columns = this.db.prepare('PRAGMA table_info(documents_analyses)').all();
    const hasContentHash = columns.some((col: { name: string }) => col.name === 'content_hash');
    if (!hasContentHash) {
      this.db.exec('ALTER TABLE documents_analyses ADD COLUMN content_hash VARCHAR(64)');
    }
    // Créer l'index après avoir vérifié/ajouté la colonne
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_content_hash ON documents_analyses(content_hash)');

    // Migration: ajouter colonnes DC2 Section B (date_creation, capital, numero_rcs, greffe)
    const entrepriseColumns = this.db.prepare('PRAGMA table_info(entreprises)').all();
    const hasDateCreation = entrepriseColumns.some((col: { name: string }) => col.name === 'date_creation');
    if (!hasDateCreation) {
      this.db.exec('ALTER TABLE entreprises ADD COLUMN date_creation VARCHAR(20)');
      this.db.exec('ALTER TABLE entreprises ADD COLUMN capital INTEGER');
      this.db.exec('ALTER TABLE entreprises ADD COLUMN numero_rcs VARCHAR(50)');
      this.db.exec('ALTER TABLE entreprises ADD COLUMN greffe VARCHAR(100)');
    }
  }

  findBySiret(siret: string): EntrepriseRecord | null {
    const cleanedSiret = siret.replace(/\s/g, '');
    const stmt = this.db.prepare('SELECT * FROM entreprises WHERE siret = ?');
    return (stmt.get(cleanedSiret) as EntrepriseRecord) || null;
  }

  findBySiren(siren: string): EntrepriseRecord | null {
    const cleanedSiren = siren.replace(/\s/g, '');
    const stmt = this.db.prepare(
      'SELECT * FROM entreprises WHERE siren = ? LIMIT 1',
    );
    return (stmt.get(cleanedSiren) as EntrepriseRecord) || null;
  }

  searchByName(nom: string): EntrepriseRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM entreprises
      WHERE nom_entreprise LIKE ? COLLATE NOCASE
         OR denomination_sociale LIKE ? COLLATE NOCASE
      LIMIT 20
    `);
    const searchTerm = `%${nom}%`;
    return stmt.all(searchTerm, searchTerm) as EntrepriseRecord[];
  }

  upsert(entreprise: EntrepriseInput): EntrepriseRecord {
    const existing = this.findBySiret(entreprise.siret);

    if (existing) {
      const stmt = this.db.prepare(`
        UPDATE entreprises SET
          nom_entreprise = ?,
          denomination_sociale = ?,
          forme_juridique = ?,
          adresse_ligne_1 = ?,
          code_postal = ?,
          ville = ?,
          code_naf = ?,
          libelle_naf = ?,
          effectif = ?,
          date_creation = ?,
          capital = ?,
          numero_rcs = ?,
          greffe = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE siret = ?
      `);
      stmt.run(
        entreprise.nom_entreprise,
        entreprise.denomination_sociale ?? null,
        entreprise.forme_juridique ?? null,
        entreprise.adresse_ligne_1 ?? null,
        entreprise.code_postal ?? null,
        entreprise.ville ?? null,
        entreprise.code_naf ?? null,
        entreprise.libelle_naf ?? null,
        entreprise.effectif ?? null,
        entreprise.date_creation ?? null,
        entreprise.capital ?? null,
        entreprise.numero_rcs ?? null,
        entreprise.greffe ?? null,
        entreprise.siret,
      );
      return this.findBySiret(entreprise.siret)!;
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO entreprises (
          siren, siret, nom_entreprise, denomination_sociale,
          forme_juridique, adresse_ligne_1, code_postal, ville,
          code_naf, libelle_naf, effectif,
          date_creation, capital, numero_rcs, greffe,
          source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pappers')
      `);
      stmt.run(
        entreprise.siren,
        entreprise.siret,
        entreprise.nom_entreprise,
        entreprise.denomination_sociale ?? null,
        entreprise.forme_juridique ?? null,
        entreprise.adresse_ligne_1 ?? null,
        entreprise.code_postal ?? null,
        entreprise.ville ?? null,
        entreprise.code_naf ?? null,
        entreprise.libelle_naf ?? null,
        entreprise.effectif ?? null,
        entreprise.date_creation ?? null,
        entreprise.capital ?? null,
        entreprise.numero_rcs ?? null,
        entreprise.greffe ?? null,
      );
      return this.findBySiret(entreprise.siret)!;
    }
  }

  logSearch(
    query: string,
    queryType: string,
    source: string,
    resultatCount: number,
  ): void {
    const stmt = this.db.prepare(`
      INSERT INTO recherches_log (query, query_type, source, resultat_count)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(query, queryType, source, resultatCount);
  }

  getStats(): CacheStats {
    const total = this.db
      .prepare('SELECT COUNT(*) as count FROM entreprises')
      .get() as { count: number };
    const fromPappers = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM entreprises WHERE source = 'pappers'",
      )
      .get() as { count: number };
    const searches = this.db
      .prepare('SELECT COUNT(*) as count FROM recherches_log')
      .get() as { count: number };
    const cacheHits = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM recherches_log WHERE source = 'cache'",
      )
      .get() as { count: number };

    const hitRate =
      searches.count > 0
        ? ((cacheHits.count / searches.count) * 100).toFixed(1) + '%'
        : '0%';

    return {
      total_entreprises: total.count,
      from_pappers: fromPappers.count,
      total_searches: searches.count,
      cache_hits: cacheHits.count,
      cache_hit_rate: hitRate,
    };
  }

  getAllEntreprises(limit = 50, offset = 0): EntrepriseRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM entreprises
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset) as EntrepriseRecord[];
  }

  // Document analysis methods
  findDocumentByHash(hash: string): {
    id: number;
    extracted_data: string | null;
    confidence: number | null;
    created_at: string;
  } | null {
    const stmt = this.db.prepare(`
      SELECT id, extracted_data, confidence, created_at
      FROM documents_analyses WHERE content_hash = ? LIMIT 1
    `);
    return (
      (stmt.get(hash) as {
        id: number;
        extracted_data: string | null;
        confidence: number | null;
        created_at: string;
      }) || null
    );
  }

  saveDocumentAnalysis(doc: {
    filename: string;
    filepath: string;
    mime_type: string;
    file_size: number;
    extracted_data: string | null;
    confidence: number | null;
    content_hash?: string;
  }): number {
    const stmt = this.db.prepare(`
      INSERT INTO documents_analyses (filename, filepath, mime_type, file_size, extracted_data, confidence, content_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      doc.filename,
      doc.filepath,
      doc.mime_type,
      doc.file_size,
      doc.extracted_data,
      doc.confidence,
      doc.content_hash ?? null,
    );
    return result.lastInsertRowid as number;
  }

  getDocumentAnalyses(
    limit = 20,
  ): Array<{
    id: number;
    filename: string;
    confidence: number | null;
    created_at: string;
  }> {
    const stmt = this.db.prepare(`
      SELECT id, filename, confidence, created_at
      FROM documents_analyses
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(limit) as Array<{
      id: number;
      filename: string;
      confidence: number | null;
      created_at: string;
    }>;
  }

  getDocumentAnalysisById(id: number): {
    id: number;
    filename: string;
    filepath: string;
    mime_type: string;
    file_size: number;
    extracted_data: string | null;
    confidence: number | null;
    created_at: string;
  } | null {
    const stmt = this.db.prepare(
      'SELECT * FROM documents_analyses WHERE id = ?',
    );
    return (
      (stmt.get(id) as {
        id: number;
        filename: string;
        filepath: string;
        mime_type: string;
        file_size: number;
        extracted_data: string | null;
        confidence: number | null;
        created_at: string;
      }) || null
    );
  }
}
