import { Injectable, HttpException, HttpStatus, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';
import { DatabaseService } from '../cache/database.service';
import type { EntrepriseInput, EntrepriseRecord } from '../cache/database.types';
import {
  PappersResponse,
  PappersSearchResponse,
  EntrepriseData,
  PappersSiege,
} from '../../types';

export interface LookupResult {
  data: EntrepriseData | null;
  source: 'cache' | 'pappers';
  cached_at?: string;
}

export interface LookupResultMultiple {
  data: EntrepriseData[];
  source: 'cache' | 'pappers';
}

@Injectable()
export class PappersService {
  private readonly logger = new Logger(PappersService.name);
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => CacheService))
    private cacheService: CacheService,
    private databaseService: DatabaseService,
  ) {
    this.baseUrl = this.configService.get<string>('pappers.baseUrl') ?? 'https://api.pappers.fr/v2';
    this.apiToken = this.configService.get<string>('pappers.apiToken') ?? '';
  }

  async lookupBySiret(siret: string): Promise<EntrepriseData> {
    const result = await this.lookupBySiretWithSource(siret);
    if (!result.data) {
      throw new HttpException('Entreprise non trouvée', HttpStatus.NOT_FOUND);
    }
    return result.data;
  }

  async lookupBySiretWithSource(siret: string): Promise<LookupResult> {
    const cleanedSiret = siret.replace(/\s/g, '');

    // 1. Check SQLite database first
    const dbRecord = this.databaseService.findBySiret(cleanedSiret);
    if (dbRecord) {
      this.logger.log(`Cache hit (SQLite) for SIRET: ${cleanedSiret}`);
      this.databaseService.logSearch(cleanedSiret, 'siret', 'cache', 1);
      return {
        data: this.recordToEntrepriseData(dbRecord),
        source: 'cache',
        cached_at: dbRecord.updated_at,
      };
    }

    // 2. Check memory cache (for very recent lookups)
    const cacheKey = `pappers:siret:${cleanedSiret}`;
    const memoryCached = await this.cacheService.get<EntrepriseData>(cacheKey);
    if (memoryCached) {
      this.logger.log(`Cache hit (memory) for SIRET: ${cleanedSiret}`);
      return { data: memoryCached, source: 'cache' };
    }

    // 3. Fetch from Pappers API
    this.logger.log(`Cache miss, calling Pappers API for SIRET: ${cleanedSiret}`);
    try {
      const url = `${this.baseUrl}/entreprise?siret=${cleanedSiret}&api_token=${this.apiToken}`;
      const data = await this.fetchPappers<PappersResponse>(url);
      const result = this.mapToEntrepriseData(data);

      // 4. Save to SQLite
      this.saveToDatabase(result, data.siege);
      this.databaseService.logSearch(cleanedSiret, 'siret', 'pappers', 1);

      // Also cache in memory
      await this.cacheService.set(cacheKey, result);

      return { data: result, source: 'pappers' };
    } catch (error) {
      this.databaseService.logSearch(cleanedSiret, 'siret', 'pappers', 0);
      throw error;
    }
  }

  async lookupBySiren(siren: string): Promise<EntrepriseData> {
    const result = await this.lookupBySirenWithSource(siren);
    if (!result.data) {
      throw new HttpException('Entreprise non trouvée', HttpStatus.NOT_FOUND);
    }
    return result.data;
  }

  async lookupBySirenWithSource(siren: string): Promise<LookupResult> {
    const cleanedSiren = siren.replace(/\s/g, '');

    // 1. Check SQLite database first
    const dbRecord = this.databaseService.findBySiren(cleanedSiren);
    if (dbRecord) {
      this.logger.log(`Cache hit (SQLite) for SIREN: ${cleanedSiren}`);
      this.databaseService.logSearch(cleanedSiren, 'siren', 'cache', 1);
      return {
        data: this.recordToEntrepriseData(dbRecord),
        source: 'cache',
        cached_at: dbRecord.updated_at,
      };
    }

    // 2. Check memory cache
    const cacheKey = `pappers:siren:${cleanedSiren}`;
    const memoryCached = await this.cacheService.get<EntrepriseData>(cacheKey);
    if (memoryCached) {
      this.logger.log(`Cache hit (memory) for SIREN: ${cleanedSiren}`);
      return { data: memoryCached, source: 'cache' };
    }

    // 3. Fetch from Pappers API
    this.logger.log(`Cache miss, calling Pappers API for SIREN: ${cleanedSiren}`);
    try {
      const url = `${this.baseUrl}/entreprise?siren=${cleanedSiren}&api_token=${this.apiToken}`;
      const data = await this.fetchPappers<PappersResponse>(url);
      const result = this.mapToEntrepriseData(data);

      // 4. Save to SQLite
      this.saveToDatabase(result, data.siege);
      this.databaseService.logSearch(cleanedSiren, 'siren', 'pappers', 1);

      await this.cacheService.set(cacheKey, result);
      return { data: result, source: 'pappers' };
    } catch (error) {
      this.databaseService.logSearch(cleanedSiren, 'siren', 'pappers', 0);
      throw error;
    }
  }

  async searchByName(query: string): Promise<EntrepriseData[]> {
    const result = await this.searchByNameWithSource(query);
    return result.data;
  }

  async searchByNameWithSource(query: string): Promise<LookupResultMultiple> {
    const normalizedQuery = query.toLowerCase().trim();

    // 1. Check SQLite database first
    const dbRecords = this.databaseService.searchByName(normalizedQuery);
    if (dbRecords.length > 0) {
      this.logger.log(`Cache hit (SQLite) for name search: "${query}" - ${dbRecords.length} results`);
      this.databaseService.logSearch(query, 'nom', 'cache', dbRecords.length);
      return {
        data: dbRecords.map((r) => this.recordToEntrepriseData(r)),
        source: 'cache',
      };
    }

    // 2. Check memory cache
    const cacheKey = `pappers:nom:${normalizedQuery}`;
    const memoryCached = await this.cacheService.get<EntrepriseData[]>(cacheKey);
    if (memoryCached) {
      this.logger.log(`Cache hit (memory) for name search: "${query}"`);
      return { data: memoryCached, source: 'cache' };
    }

    // 3. Fetch from Pappers API
    this.logger.log(`Cache miss, calling Pappers API for name: "${query}"`);
    try {
      const url = `${this.baseUrl}/recherche?q=${encodeURIComponent(query)}&api_token=${this.apiToken}`;
      const data = await this.fetchPappers<PappersSearchResponse>(url);

      const results: EntrepriseData[] = data.resultats?.map((r) => ({
        siren: r.siren,
        siret: r.siege?.siret || '',
        nom_commercial: r.nom_entreprise,
        denomination_sociale: r.denomination,
        adresse_etablissement: this.formatAdresse(r.siege),
        forme_juridique: r.forme_juridique,
      })) || [];

      // 4. Save each result to SQLite
      results.forEach((result) => {
        if (result.siret) {
          this.saveToDatabase(result);
        }
      });
      this.databaseService.logSearch(query, 'nom', 'pappers', results.length);

      await this.cacheService.set(cacheKey, results);
      return { data: results, source: 'pappers' };
    } catch (error) {
      this.databaseService.logSearch(query, 'nom', 'pappers', 0);
      throw error;
    }
  }

  async refreshFromPappers(siret: string): Promise<LookupResult> {
    const cleanedSiret = siret.replace(/\s/g, '');
    this.logger.log(`Force refresh from Pappers for SIRET: ${cleanedSiret}`);

    const url = `${this.baseUrl}/entreprise?siret=${cleanedSiret}&api_token=${this.apiToken}`;
    const data = await this.fetchPappers<PappersResponse>(url);
    const result = this.mapToEntrepriseData(data);

    // Update in SQLite
    this.saveToDatabase(result, data.siege);
    this.databaseService.logSearch(cleanedSiret, 'siret', 'pappers', 1);

    // Update memory cache
    const cacheKey = `pappers:siret:${cleanedSiret}`;
    await this.cacheService.set(cacheKey, result);

    return { data: result, source: 'pappers' };
  }

  private async fetchPappers<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new HttpException(
            'Entreprise non trouvée',
            HttpStatus.NOT_FOUND,
          );
        }
        throw new HttpException(
          'Erreur API Pappers',
          HttpStatus.BAD_GATEWAY,
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Erreur de connexion à l\'API Pappers',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private mapToEntrepriseData(data: PappersResponse): EntrepriseData {
    // Debug log pour vérifier les champs DC2 Section B
    this.logger.debug(`Pappers response DC2 fields: date_creation=${data.date_creation_formate}, capital=${data.capital}, numero_rcs=${data.numero_rcs}, greffe=${data.greffe}`);

    return {
      siren: data.siren,
      siret: data.siret || data.siege?.siret || '',
      nom_commercial: data.nom_entreprise,
      denomination_sociale: data.denomination,
      adresse_etablissement: this.formatAdresse(data.siege),
      adresse_siege: this.formatAdresse(data.siege),
      forme_juridique: data.forme_juridique,
      code_naf: data.code_naf,
      libelle_naf: data.libelle_code_naf,
      libelle_code_naf: data.libelle_code_naf,
      effectif: data.effectif,
      dirigeants: data.dirigeants,
      // Champs additionnels pour DC2 Section B
      date_creation: data.date_creation,
      date_creation_formate: data.date_creation_formate,
      capital: data.capital,
      numero_rcs: data.numero_rcs,
      greffe: data.greffe,
    };
  }

  private recordToEntrepriseData(record: EntrepriseRecord): EntrepriseData {
    const adresse = [
      record.adresse_ligne_1,
      record.code_postal && record.ville
        ? `${record.code_postal} ${record.ville}`
        : null,
    ]
      .filter(Boolean)
      .join(', ');

    return {
      siren: record.siren,
      siret: record.siret,
      nom_commercial: record.nom_entreprise,
      denomination_sociale: record.denomination_sociale || '',
      adresse_etablissement: adresse,
      forme_juridique: record.forme_juridique || '',
      code_naf: record.code_naf || undefined,
      libelle_naf: record.libelle_naf || undefined,
      libelle_code_naf: record.libelle_naf || undefined,
      effectif: record.effectif || undefined,
      // Champs additionnels pour DC2 Section B
      date_creation: record.date_creation || undefined,
      date_creation_formate: record.date_creation || undefined,
      capital: record.capital || undefined,
      numero_rcs: record.numero_rcs || undefined,
      greffe: record.greffe || undefined,
    };
  }

  private saveToDatabase(data: EntrepriseData, siege?: PappersSiege): void {
    if (!data.siret) return;

    const input: EntrepriseInput = {
      siren: data.siren,
      siret: data.siret,
      nom_entreprise: data.nom_commercial,
      denomination_sociale: data.denomination_sociale,
      forme_juridique: data.forme_juridique,
      adresse_ligne_1: siege?.adresse_ligne_1 || data.adresse_etablissement,
      code_postal: siege?.code_postal,
      ville: siege?.ville,
      code_naf: data.code_naf,
      libelle_naf: data.libelle_naf,
      effectif: data.effectif,
      // Champs additionnels pour DC2 Section B
      date_creation: data.date_creation || data.date_creation_formate,
      capital: data.capital,
      numero_rcs: data.numero_rcs,
      greffe: data.greffe,
    };

    this.databaseService.upsert(input);
  }

  private formatAdresse(siege: PappersSiege | undefined): string {
    if (!siege) return '';
    const parts = [
      siege.adresse_ligne_1,
      siege.adresse_ligne_2,
      `${siege.code_postal} ${siege.ville}`,
      siege.pays !== 'France' ? siege.pays : null,
    ].filter(Boolean);
    return parts.join(', ');
  }
}
