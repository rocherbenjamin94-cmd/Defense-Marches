import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Database = require('better-sqlite3');
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private db: Database.Database;

    onModuleInit() {
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const dbPath = path.join(dataDir, 'cache.db');
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL'); // Better concurrency

        this.initSchema();
    }

    onModuleDestroy() {
        if (this.db) {
            this.db.close();
        }
    }

    private initSchema() {
        // Cache des analyses de documents RC par Claude
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS document_analyses (
        id TEXT PRIMARY KEY,
        document_hash TEXT UNIQUE NOT NULL,
        analysis_result TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
      )
    `);

        // Cache des marchés BOAMP enrichis
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS marches_cache (
        id TEXT PRIMARY KEY,
        raw_data TEXT NOT NULL,
        enriched_data TEXT,
        last_fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Cache des entreprises Pappers
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS entreprises_cache (
        siret TEXT PRIMARY KEY,
        siren TEXT NOT NULL,
        data TEXT NOT NULL,
        fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Cache des recherches Pappers
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS pappers_searches_cache (
        search_query TEXT PRIMARY KEY,
        results TEXT NOT NULL,
        fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log('[Database] Cache schema initialized');
    }

    query<T = any>(sql: string, params: any[] = []): T | undefined {
        return this.db.prepare(sql).get(...params) as T;
    }

    run(sql: string, params: any[] = []): Database.RunResult {
        return this.db.prepare(sql).run(...params);
    }
}
