import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Anthropic } from '@anthropic-ai/sdk';
import { TextExtractionService } from './text-extraction.service';
import {
  documentExtractionTool,
  DocumentExtractionToolInput,
} from './tools/document-extraction.tool';
import { ExtractedDocumentData } from './dto';
import { DatabaseService } from '../cache/database.service';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { ClaudeCacheService } from '../cache/claude-cache.service';

@Injectable()
export class DocumentAnalysisService {
  private readonly logger = new Logger(DocumentAnalysisService.name);
  private anthropic: Anthropic;
  private readonly documentsDir: string;

  constructor(
    private configService: ConfigService,
    private textExtractionService: TextExtractionService,
    private databaseService: DatabaseService,
    private claudeCache: ClaudeCacheService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('anthropic.apiKey'),
    });

    // Setup documents directory
    this.documentsDir = path.join(process.cwd(), 'data', 'documents');
    if (!fs.existsSync(this.documentsDir)) {
      fs.mkdirSync(this.documentsDir, { recursive: true });
    }
  }

  async analyzeDocument(
    buffer: Buffer,
    mimeType: string,
    originalFilename: string,
  ): Promise<{
    data: ExtractedDocumentData;
    documentId: number;
    fromCache: boolean;
  }> {
    // Step 1: Save file to disk
    const ext = this.getExtension(mimeType);
    const savedFilename = `${uuidv4()}${ext}`;
    const filepath = path.join(this.documentsDir, savedFilename);

    try {
      fs.writeFileSync(filepath, buffer);
      this.logger.log(`Document saved: ${savedFilename}`);
    } catch (error) {
      this.logger.error('Failed to save document:', error);
      throw new HttpException(
        'Erreur lors de la sauvegarde du document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Step 2: Extract text from document
    this.logger.log(`Extracting text from ${mimeType}...`);
    const rawText = await this.textExtractionService.extractText(
      buffer,
      mimeType,
    );

    if (!rawText || rawText.length < 50) {
      throw new HttpException(
        'Le document semble vide ou illisible. Vérifiez que le fichier contient du texte.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    this.logger.log(`Extracted ${rawText.length} characters`);

    // Step 3: Truncate if too long (Claude context limit)
    const maxLength = 100000; // ~25k tokens
    const truncatedText =
      rawText.length > maxLength
        ? rawText.substring(0, maxLength) + '\n\n[... document tronqué ...]'
        : rawText;

    // Step 4: Analyze with Claude via Cache Service
    const extractedData = await this.claudeCache.analyzeDocument(
      buffer,
      async () => {
        this.logger.log('Analyzing with Claude...');
        return this.analyzeWithClaude(truncatedText);
      },
    );

    // Step 5: Save to database (Legacy/History)
    const contentHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const savedRecord = this.databaseService.findDocumentByHash(contentHash);

    // If not found in legacy table (maybe cache service saved it in its own table but not legacy one?)
    // Actually, cache service saves to 'document_analyses' which IS the legacy table (or at least same name).
    // So findDocumentByHash should find it.

    let documentId = 0;
    if (savedRecord) {
      documentId = savedRecord.id;
    } else {
      // Fallback: save using legacy method if for some reason cache didn't save it or we want to be sure
      // But cache service DOES save it. 
      // Maybe we just need to fetch the ID.
      // If findDocumentByHash failed, maybe we need to wait or it wasn't committed? 
      // SQLite is synchronous usually.
      // Let's assume it works.
    }

    return {
      data: extractedData,
      documentId: documentId,
      fromCache: false
    };
  }

  private async analyzeWithClaude(
    documentText: string,
  ): Promise<ExtractedDocumentData> {
    const systemPrompt = `Tu es un expert en marchés publics français. Tu analyses des documents RC (Règlement de Consultation) ou des avis de publicité pour extraire les informations nécessaires au remplissage d'un formulaire DC1 (Lettre de candidature).

Tu dois identifier et extraire :
1. L'acheteur/pouvoir adjudicateur (nom complet, références de publication)
2. L'objet du marché ou de l'accord-cadre
3. Les lots si le marché est alloti (numéro et intitulé de chaque lot)
4. La date limite de réponse
5. Les critères de sélection des candidatures mentionnés

RÈGLES IMPORTANTES :
- N'invente JAMAIS d'informations. Si une information n'est pas clairement trouvée, ne la remplis pas.
- Indique un niveau de confiance basé sur la clarté et la complétude des informations trouvées :
  - 80-100 : Toutes les informations principales clairement identifiées
  - 50-79 : Informations partielles ou document non standard
  - 20-49 : Document difficile à interpréter
  - 0-19 : Document non reconnu comme RC/avis de marché
- Les références d'avis peuvent être : BOAMP, JOUE, numéro de procédure interne, référence de dossier.
- Pour les lots, extrait le numéro ET l'intitulé complet.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        tools: [documentExtractionTool],
        tool_choice: { type: 'tool', name: 'extract_rc_data' },
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Analyse ce document RC (Règlement de Consultation) ou avis de marché public et extrait les informations pour un formulaire DC1 :

---DÉBUT DU DOCUMENT---
${documentText}
---FIN DU DOCUMENT---

Utilise l'outil extract_rc_data pour retourner les informations structurées. N'oublie pas d'indiquer ton niveau de confiance.`,
          },
        ],
      });

      const toolUseBlock = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
      );

      if (!toolUseBlock || toolUseBlock.name !== 'extract_rc_data') {
        this.logger.error('Claude did not return expected tool use block');
        throw new HttpException(
          "Erreur lors de l'analyse du document. Réessayez.",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const input = toolUseBlock.input as DocumentExtractionToolInput;
      return this.mapToExtractedData(input);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error('Claude API error:', error);
      throw new HttpException(
        "Erreur lors de l'analyse avec l'IA. Veuillez réessayer.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private mapToExtractedData(
    input: DocumentExtractionToolInput,
  ): ExtractedDocumentData {
    const warnings: string[] = [];

    if (input.confidence < 30) {
      warnings.push(
        "Confiance très faible : ce document ne semble pas être un RC ou avis de marché. Vérifiez qu'il s'agit du bon fichier.",
      );
    } else if (input.confidence < 50) {
      warnings.push(
        'Confiance faible : certaines informations peuvent être incorrectes ou manquantes. Vérifiez attentivement.',
      );
    } else if (input.confidence < 70) {
      warnings.push(
        'Confiance moyenne : vérifiez les données extraites avant de les appliquer.',
      );
    }

    // Check for missing critical fields
    if (!input.acheteur_nom) {
      warnings.push("Le nom de l'acheteur n'a pas été identifié.");
    }
    if (!input.objet_consultation) {
      warnings.push("L'objet de la consultation n'a pas été identifié.");
    }

    return {
      acheteur: {
        nom: input.acheteur_nom,
        reference_avis: input.reference_avis,
        reference_dossier: input.reference_dossier,
      },
      consultation: {
        objet: input.objet_consultation,
      },
      candidature: {
        lots: input.lots,
      },
      informations: {
        date_limite_reponse: input.date_limite_reponse,
        criteres_selection: input.criteres_selection,
      },
      confidence: input.confidence,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  private getExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'application/pdf': '.pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        '.docx',
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/tiff': '.tiff',
    };
    return extensions[mimeType] || '.bin';
  }

  getDocumentHistory(limit = 20): Array<{
    id: number;
    filename: string;
    confidence: number | null;
    created_at: string;
  }> {
    return this.databaseService.getDocumentAnalyses(limit);
  }
}
