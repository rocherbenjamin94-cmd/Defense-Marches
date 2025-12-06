import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

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

@Injectable()
export class AnalyseService {
    private readonly logger = new Logger(AnalyseService.name);
    private cache: Map<string, AnalyseMarche> = new Map();
    private anthropic: Anthropic;

    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
    ) {
        this.anthropic = new Anthropic({
            apiKey: this.configService.get<string>('anthropic.apiKey'),
        });
    }

    async analyserMarche(marcheId: string, boampUrl: string): Promise<AnalyseMarche> {
        // 1. Vérifier le cache
        if (this.cache.has(marcheId)) {
            this.logger.log(`Cache hit pour marché ${marcheId}`);
            return this.cache.get(marcheId)!;
        }

        this.logger.log(`Analyse du marché ${marcheId} depuis ${boampUrl}`);

        // 2. Télécharger le PDF
        const pdfBuffer = await this.recupererContenuMarche(boampUrl);
        this.logger.log(`PDF téléchargé pour ${marcheId} (${pdfBuffer.length} bytes)`);

        // 3. Analyser avec Claude
        const analyse = await this.analyserAvecClaude(marcheId, pdfBuffer);

        // 4. Stocker en cache
        this.cache.set(marcheId, analyse);
        this.logger.log(`Analyse terminée et mise en cache pour ${marcheId}`);

        return analyse;
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
            let jsonText = textBlock.text.trim();
            if (jsonText.startsWith('```json')) jsonText = jsonText.slice(7);
            if (jsonText.startsWith('```')) jsonText = jsonText.slice(3);
            if (jsonText.endsWith('```')) jsonText = jsonText.slice(0, -3);
            jsonText = jsonText.trim();

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
        const analyse = this.cache.get(marcheId);
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

            let jsonText = textBlock.text.trim();
            if (jsonText.startsWith('```json')) jsonText = jsonText.slice(7);
            if (jsonText.startsWith('```')) jsonText = jsonText.slice(3);
            if (jsonText.endsWith('```')) jsonText = jsonText.slice(0, -3);
            jsonText = jsonText.trim();

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

    clearCache(): void {
        this.cache.clear();
        this.logger.log('Cache vidé');
    }

    getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}
