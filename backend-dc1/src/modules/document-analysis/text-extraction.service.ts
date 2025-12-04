import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

// Wrapper qui évite le bug du fichier de test de pdf-parse
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('./pdf-parse-wrapper.cjs');

@Injectable()
export class TextExtractionService {
  private readonly logger = new Logger(TextExtractionService.name);

  async extractFromPdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      const text = this.cleanText(data.text);

      if (!text || text.length < 50) {
        this.logger.warn('PDF text extraction returned minimal content');
      }

      return text;
    } catch (error) {
      this.logger.error('PDF extraction error:', error);
      throw new HttpException(
        "Erreur lors de l'extraction du texte PDF. Le fichier est peut-être corrompu ou protégé.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async extractFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });

      if (result.messages && result.messages.length > 0) {
        this.logger.warn('Mammoth warnings:', result.messages);
      }

      return this.cleanText(result.value);
    } catch (error) {
      this.logger.error('DOCX extraction error:', error);
      throw new HttpException(
        "Erreur lors de l'extraction du texte Word. Le fichier est peut-être corrompu.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async extractFromImage(buffer: Buffer): Promise<string> {
    try {
      this.logger.log('Starting OCR extraction with Tesseract.js...');

      const result = await Tesseract.recognize(buffer, 'fra', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            this.logger.debug(`OCR progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const text = this.cleanText(result.data.text);

      if (!text || text.length < 20) {
        this.logger.warn('OCR extraction returned minimal content');
        throw new HttpException(
          "L'image ne contient pas de texte lisible ou est de mauvaise qualité.",
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      this.logger.log(
        `OCR extraction complete. Confidence: ${result.data.confidence}%`,
      );
      return text;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error('OCR extraction error:', error);
      throw new HttpException(
        "Erreur lors de la reconnaissance de texte (OCR). Essayez avec une image de meilleure qualité.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    switch (mimeType) {
      case 'application/pdf':
        return this.extractFromPdf(buffer);

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.extractFromDocx(buffer);

      case 'application/msword':
        throw new HttpException(
          "Le format .doc (Word 97-2003) n'est pas supporté. Veuillez convertir votre document en .docx ou PDF.",
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        );

      case 'image/png':
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/tiff':
        return this.extractFromImage(buffer);

      default:
        throw new HttpException(
          `Type de fichier non supporté: ${mimeType}. Formats acceptés: PDF, DOCX, PNG, JPG, TIFF`,
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        );
    }
  }

  private cleanText(text: string): string {
    return (
      text
        // Normalize line endings
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Remove excessive whitespace
        .replace(/[ \t]+/g, ' ')
        // Remove excessive newlines
        .replace(/\n{3,}/g, '\n\n')
        // Trim
        .trim()
    );
  }
}
