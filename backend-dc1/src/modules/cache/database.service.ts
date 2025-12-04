import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import initSqlJs, { Database } from 'sql.js';
import * as path from 'path';
import * as fs from 'fs';

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

  run(sql: string, params: any[] = []): void {
    this.db.run(sql, params);
    this.save();
  }
}
