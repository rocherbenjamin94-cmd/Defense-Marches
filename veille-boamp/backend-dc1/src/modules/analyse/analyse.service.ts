import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { DatabaseService } from '../cache/database.service';

export interface ScoreCompatibilite {
    scoreGenerique: number;
    niveau: 'Facile' | 'Moyen' | 'Difficile';
    resumeGenerique: string;
    pointsCles: string[];
    scorePersonnaliseDisponible: boolean;
    scorePersonnalise?: number;
    pointsForts?: string[];
    pointsVigilance?: string[];
    recommandation?: string;
    chancesDeSelecion?: string;
}

export interface AnalyseMarche {
    marcheId: string;
    acheteur: {
        nom: string;
        adresse: string;
        contact: string;
        email: string;
        telephone: string;
    };
    marche: {
        titre: string;
        objet: string;
        reference: string;
        datePublication: string;
        dateLimite: string;
        montantEstime: string | null;
    };
    lots: Array<{
        numero: string;
        description: string;
    }>;
    documentsRequis: string[];
    criteresSelection: Array<{
        critere: string;
        ponderation: string;
    }>;
    exigences: {
        caMinimum: string | null;
        effectifMinimum: string | null;
        certifications: string[];
        references: string | null;
        zoneGeographique: string | null;
    };
    scoreCompatibilite: ScoreCompatibilite;
    prefillDC1: {
        nomAcheteur: string;
        adresseAcheteur: string;
        objetMarche: string;
        referenceMarche: string;
        lots: Array<{ numero: string; description: string }>;
    };
    analyzedAt: Date;
}

export interface ProfilEntreprise {
    siret: string;
    raisonSociale: string;
    adresse: string;
    domainesActivite: string[];
    chiffreAffaires: string;
    effectif: string;
    certifications: string[];
    referencesMarches: string;
    zonesGeographiques: string[];
}

export interface AnalysedMarcheSummary {
    marcheId: string;
    titre: string;
    acheteur: string;
    scoreCompatibilite: number;
    difficulte: 'facile' | 'moyen' | 'difficile';
    dateLimite: string;
    analysedAt: string;
}

export interface AnalyseSummary {
    hasAnalyse: boolean;
    scoreCompatibilite: number;
    difficulte: 'facile' | 'moyen' | 'difficile';
    nombreLots: number;
}

// Helper pour nettoyer les réponses JSON de Claude
function cleanJsonResponse(text: string): string {
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) jsonText = jsonText.slice(7);
    if (jsonText.startsWith('```')) jsonText = jsonText.slice(3);
    if (jsonText.endsWith('```')) jsonText = jsonText.slice(0, -3);
    return jsonText.trim();
}

@Injectable()
export class AnalyseService {
    private readonly logger = new Logger(AnalyseService.name);
    private localCache: Map<string, AnalyseMarche> = new Map(); // Fallback si PostgreSQL non dispo
    private anthropic: Anthropic;

    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
        private databaseService: DatabaseService,
    ) {
        this.anthropic = new Anthropic({
            apiKey: this.configService.get<string>('anthropic.apiKey'),
        });
    }

    async analyserMarche(marcheId: string, boampUrl: string): Promise<AnalyseMarche> {
        // 1. Vérifier le cache PostgreSQL d'abord
        const cached = await this.getAnalyseFromDb(marcheId);
        if (cached) {
            this.logger.log(`✓ PostgreSQL cache hit pour marché ${marcheId}`);
            return cached;
        }

        // 2. Fallback sur cache local (si PostgreSQL non dispo)
        if (this.localCache.has(marcheId)) {
            this.logger.log(`✓ Local cache hit pour marché ${marcheId}`);
            return this.localCache.get(marcheId)!;
        }

        this.logger.log(`Analyse du marché ${marcheId} depuis ${boampUrl}`);

        // 3. Télécharger le PDF
        const pdfBuffer = await this.recupererContenuMarche(boampUrl);
        this.logger.log(`PDF téléchargé pour ${marcheId} (${pdfBuffer.length} bytes)`);

        // 4. Analyser avec Claude
        const analyse = await this.analyserAvecClaude(marcheId, pdfBuffer);

        // 5. Stocker en cache PostgreSQL et local
        await this.saveAnalyseToDb(marcheId, analyse);
        this.localCache.set(marcheId, analyse);
        this.logger.log(`✓ Analyse terminée et mise en cache PostgreSQL pour ${marcheId}`);

        return analyse;
    }

    private async getAnalyseFromDb(marcheId: string): Promise<AnalyseMarche | null> {
        try {
            const row = await this.databaseService.query<{ analysis_result: any }>(
                'SELECT analysis_result FROM document_analyses WHERE document_hash = $1',
                [`analyse:${marcheId}`]
            );
            if (row?.analysis_result) {
                return typeof row.analysis_result === 'string'
                    ? JSON.parse(row.analysis_result)
                    : row.analysis_result;
            }
            return null;
        } catch (error) {
            this.logger.warn(`Erreur lecture analyse depuis DB: ${error.message}`);
            return null;
        }
    }

    private async saveAnalyseToDb(marcheId: string, analyse: AnalyseMarche): Promise<void> {
        try {
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours
            await this.databaseService.saveDocumentAnalysis(
                `analyse-${marcheId}-${Date.now()}`,
                `analyse:${marcheId}`,
                analyse,
                expiresAt
            );
        } catch (error) {
            this.logger.warn(`Erreur sauvegarde analyse vers DB: ${error.message}`);
        }
    }

    private async recupererContenuMarche(boampUrl: string): Promise<Buffer> {
        try {
            // Extraire l'ID du marché depuis l'URL
            // Format possible : ?q=idweb:%2225-133607%22 ou /25-133607 ou idweb:"25-133607"
            let marcheId: string | null = null;

            // Chercher le pattern XX-XXXXXX (année sur 2 chiffres - numéro)
            const idMatch = boampUrl.match(/(\d{2}-\d{5,6})/);
            if (idMatch) {
                marcheId = idMatch[1];
            }

            if (!marcheId) {
                throw new Error('Impossible d\'extraire l\'ID du marché depuis l\'URL');
            }

            this.logger.log(`ID marché extrait: ${marcheId}`);

            // Construire l'URL du PDF
            // L'année complète = 20 + les 2 premiers chiffres de l'ID
            const annee = '20' + marcheId.substring(0, 2); // 25 → 2025
            const moisActuel = new Date().getMonth() + 1;

            // Essayer plusieurs mois si nécessaire (le marché peut être d'un mois précédent)
            const moisAEssayer = [moisActuel, moisActuel - 1, moisActuel - 2, moisActuel + 1].filter(m => m > 0 && m <= 12);

            for (const m of moisAEssayer) {
                const moisPadded = m.toString().padStart(2, '0');
                const pdfUrl = `https://www.boamp.fr/telechargements/FILES/PDF/${annee}/${moisPadded}/${marcheId}.pdf`;

                this.logger.log(`Tentative téléchargement PDF: ${pdfUrl}`);

                try {
                    const response = await this.httpService.axiosRef.get(pdfUrl, {
                        responseType: 'arraybuffer',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        },
                        timeout: 30000,
                    });

                    this.logger.log(`PDF téléchargé avec succès: ${pdfUrl} (${response.data.length} bytes)`);
                    return Buffer.from(response.data);

                } catch (err) {
                    this.logger.warn(`PDF non trouvé pour mois ${moisPadded}, essai suivant...`);
                    continue;
                }
            }

            throw new Error('PDF introuvable pour tous les mois testés');

        } catch (error) {
            this.logger.error(`Erreur récupération PDF: ${error.message}`);
            throw error;
        }
    }

    private async analyserAvecClaude(marcheId: string, pdfBuffer: Buffer): Promise<AnalyseMarche> {
        const pdfBase64 = pdfBuffer.toString('base64');

        const prompt = `
Analyse cet avis de marché public et extrais TOUTES les informations en JSON.

IMPORTANT : Pour le score de compatibilité GÉNÉRIQUE, évalue la difficulté du marché de manière objective (sans connaître l'entreprise candidate) selon :
- Délai de réponse (< 15 jours = difficile, > 30 jours = facile)
- Exigences de CA minimum
- Certifications obligatoires
- Références exigées
- Complexité technique

Réponds UNIQUEMENT avec ce JSON valide :
{
  "acheteur": {
    "nom": "Nom de l'organisme",
    "adresse": "Adresse complète",
    "contact": "Nom du contact ou Non précisé",
    "email": "Email ou Non précisé",
    "telephone": "Téléphone ou Non précisé"
  },
  "marche": {
    "titre": "Titre du marché",
    "objet": "Description détaillée",
    "reference": "Numéro de référence",
    "datePublication": "YYYY-MM-DD",
    "dateLimite": "YYYY-MM-DD HH:mm",
    "montantEstime": "Montant ou null"
  },
  "lots": [
    {"numero": "1", "description": "Description du lot"}
  ],
  "documentsRequis": ["DC1", "DC2", "Mémoire technique"],
  "criteresSelection": [
    {"critere": "Prix", "ponderation": "40%"},
    {"critere": "Valeur technique", "ponderation": "60%"}
  ],
  "exigences": {
    "caMinimum": "500000 ou null",
    "effectifMinimum": "10 ou null",
    "certifications": ["ISO 9001"],
    "references": "3 références similaires ou null",
    "zoneGeographique": "Région ou null"
  },
  "scoreCompatibilite": {
    "scoreGenerique": 65,
    "niveau": "Moyen",
    "resumeGenerique": "Résumé de la difficulté",
    "pointsCles": [
      "✅ Point positif",
      "⚠️ Point d'attention"
    ]
  },
  "prefillDC1": {
    "nomAcheteur": "Nom pour DC1",
    "adresseAcheteur": "Adresse pour DC1",
    "objetMarche": "Objet pour DC1",
    "referenceMarche": "Référence pour DC1",
    "lots": [{"numero": "1", "description": "Description"}]
  }
}
`;

        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 3000,
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'document',
                            source: {
                                type: 'base64',
                                media_type: 'application/pdf',
                                data: pdfBase64
                            }
                        } as any,
                        { type: 'text', text: prompt }
                    ]
                }],
            });

            const textBlock = response.content.find(
                (block): block is Anthropic.TextBlock => block.type === 'text',
            );

            if (!textBlock) {
                throw new Error('Aucune réponse textuelle de Claude');
            }

            // Nettoyer la réponse
            const jsonText = cleanJsonResponse(textBlock.text);
            const parsed = JSON.parse(jsonText);

            return {
                marcheId,
                ...parsed,
                scoreCompatibilite: {
                    ...parsed.scoreCompatibilite,
                    scorePersonnaliseDisponible: false
                },
                analyzedAt: new Date(),
            };
        } catch (error) {
            this.logger.error(`Erreur lors de l'analyse Claude:`, error.message);
            throw new Error(`Erreur d'analyse IA: ${error.message}`);
        }
    }

    async calculerScorePersonnalise(marcheId: string, profilEntreprise: ProfilEntreprise): Promise<ScoreCompatibilite> {
        // Chercher dans PostgreSQL d'abord, puis local
        let analyse = await this.getAnalyseFromDb(marcheId);
        if (!analyse) {
            analyse = this.localCache.get(marcheId) || null;
        }

        if (!analyse) {
            throw new Error('Marché non analysé. Veuillez d\'abord analyser le marché.');
        }

        const prompt = `
Compare ce marché public avec le profil de l'entreprise candidate.

MARCHÉ - Exigences :
${JSON.stringify(analyse.exigences, null, 2)}

MARCHÉ - Critères de sélection :
${JSON.stringify(analyse.criteresSelection, null, 2)}

MARCHÉ - Délai limite : ${analyse.marche.dateLimite}

PROFIL ENTREPRISE :
${JSON.stringify(profilEntreprise, null, 2)}

Calcule un score de compatibilité PERSONNALISÉ (0-100).

Réponds UNIQUEMENT en JSON valide :
{
  "scorePersonnalise": 85,
  "niveau": "Élevé",
  "pointsForts": [
    "Votre CA dépasse le seuil requis",
    "Vous possédez les certifications demandées"
  ],
  "pointsVigilance": [
    "Délai serré pour répondre",
    "Zone géographique éloignée"
  ],
  "recommandation": "Conseil personnalisé pour la candidature",
  "chancesDeSelecion": "Élevées"
}
`;

        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1500,
                messages: [{ role: 'user', content: prompt }],
            });

            const textBlock = response.content.find(
                (block): block is Anthropic.TextBlock => block.type === 'text',
            );

            if (!textBlock) {
                throw new Error('Aucune réponse textuelle de Claude');
            }

            const jsonText = cleanJsonResponse(textBlock.text);
            const parsed = JSON.parse(jsonText);

            return {
                ...analyse.scoreCompatibilite,
                ...parsed,
                scorePersonnaliseDisponible: true
            };
        } catch (error) {
            this.logger.error(`Erreur calcul score personnalisé:`, error.message);
            throw new Error(`Erreur calcul score: ${error.message}`);
        }
    }

    async clearCache(): Promise<void> {
        this.localCache.clear();
        // Supprimer les analyses de la base PostgreSQL
        try {
            await this.databaseService.run(
                "DELETE FROM document_analyses WHERE document_hash LIKE 'analyse:%'"
            );
        } catch (error) {
            this.logger.warn(`Erreur suppression cache analyse: ${error.message}`);
        }
        this.logger.log('Cache local et PostgreSQL vidés');
    }

    async getCacheStats(): Promise<{ localSize: number; dbEntries: number; connected: boolean }> {
        const connected = await this.databaseService.healthCheck();
        let dbEntries = 0;
        try {
            const result = await this.databaseService.query<{ count: string }>(
                "SELECT COUNT(*) as count FROM document_analyses WHERE document_hash LIKE 'analyse:%'"
            );
            dbEntries = parseInt(result?.count || '0');
        } catch {
            // Ignore
        }
        return {
            localSize: this.localCache.size,
            dbEntries,
            connected,
        };
    }

    // Récupérer tous les marchés analysés en cache
    async getAnalysedMarches(): Promise<AnalysedMarcheSummary[]> {
        const result: AnalysedMarcheSummary[] = [];

        try {
            const rows = await this.databaseService.queryAll<{ document_hash: string; analysis_result: any; created_at: Date }>(
                "SELECT document_hash, analysis_result, created_at FROM document_analyses WHERE document_hash LIKE 'analyse:%' ORDER BY created_at DESC LIMIT 10"
            );

            for (const row of rows) {
                const cached = typeof row.analysis_result === 'string'
                    ? JSON.parse(row.analysis_result)
                    : row.analysis_result;

                if (cached) {
                    result.push({
                        marcheId: row.document_hash.replace('analyse:', ''),
                        titre: cached.marche?.titre || cached.prefillDC1?.objetMarche || 'Marché sans titre',
                        acheteur: cached.acheteur?.nom || cached.prefillDC1?.nomAcheteur || 'Acheteur inconnu',
                        scoreCompatibilite: cached.scoreCompatibilite?.scoreGenerique || 50,
                        difficulte: (cached.scoreCompatibilite?.niveau?.toLowerCase() as 'facile' | 'moyen' | 'difficile') || 'moyen',
                        dateLimite: cached.marche?.dateLimite || '',
                        analysedAt: row.created_at?.toISOString() || new Date().toISOString(),
                    });
                }
            }
        } catch (error) {
            this.logger.warn(`Erreur récupération marchés analysés: ${error.message}`);
        }

        return result;
    }

    // Vérifier quels marchés ont une analyse en cache (batch - requête unique)
    async checkCacheBatch(ids: string[]): Promise<Record<string, AnalyseSummary | null>> {
        const result: Record<string, AnalyseSummary | null> = {};

        // Initialiser tous les IDs à null
        for (const id of ids) {
            result[id] = null;
        }

        if (ids.length === 0) {
            return result;
        }

        try {
            // Construire les hashes à rechercher
            const hashes = ids.map(id => `analyse:${id}`);

            // Requête batch avec ANY au lieu de N requêtes individuelles
            const rows = await this.databaseService.queryAll<{
                document_hash: string;
                analysis_result: any;
            }>(
                'SELECT document_hash, analysis_result FROM document_analyses WHERE document_hash = ANY($1)',
                [hashes]
            );

            // Mapper les résultats
            for (const row of rows) {
                const marcheId = row.document_hash.replace('analyse:', '');
                const cached = typeof row.analysis_result === 'string'
                    ? JSON.parse(row.analysis_result)
                    : row.analysis_result;

                if (cached) {
                    result[marcheId] = {
                        hasAnalyse: true,
                        scoreCompatibilite: cached.scoreCompatibilite?.scoreGenerique || 50,
                        difficulte: cached.scoreCompatibilite?.niveau?.toLowerCase() as 'facile' | 'moyen' | 'difficile' || 'moyen',
                        nombreLots: cached.lots?.length || 0,
                    };
                }
            }
        } catch (error) {
            this.logger.warn(`Erreur checkCacheBatch: ${error.message}`);
        }

        return result;
    }
}
