import {
  Controller,
  Post,
  Body,
  StreamableFile,
  Header,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WordService } from './word.service';
import { GeneratedDocumentsService } from '../generated-documents/generated-documents.service';
import type { DC1FormData, DC2FormData } from '../../types';

@Controller('api/word')
export class WordController {
  constructor(
    private wordService: WordService,
    private generatedDocumentsService: GeneratedDocumentsService,
  ) { }

  @Post('generate')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  @Header('Content-Disposition', 'attachment; filename="DC1-Candidature.docx"')
  async generate(
    @Body() body: { formData: DC1FormData; marcheId?: string; marcheTitre?: string; marcheAcheteur?: string },
    @Headers('x-user-id') userId?: string,
  ): Promise<StreamableFile> {
    // Check quota if user is authenticated
    if (userId) {
      const quota = await this.generatedDocumentsService.checkQuota(userId);
      if (!quota.canGenerate) {
        throw new HttpException(
          { success: false, error: 'Quota dépassé', quotaExceeded: true, used: quota.used, limit: quota.limit },
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const docxBuffer = await this.wordService.generateDocx(body.formData);

    // Record generation if user is authenticated
    if (userId && body.marcheId) {
      await this.generatedDocumentsService.recordGeneration(userId, {
        marcheId: body.marcheId,
        marcheTitre: body.marcheTitre || 'Marché',
        marcheAcheteur: body.marcheAcheteur || 'Acheteur',
        documentType: 'dc1',
        fileName: 'DC1-Candidature.docx',
        fileFormat: 'docx',
      });
    }

    return new StreamableFile(docxBuffer);
  }

  @Post('generate-dc2')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  @Header('Content-Disposition', 'attachment; filename="DC2-Declaration.docx"')
  async generateDC2(
    @Body() body: { formData: DC2FormData; marcheId?: string; marcheTitre?: string; marcheAcheteur?: string },
    @Headers('x-user-id') userId?: string,
  ): Promise<StreamableFile> {
    // Check quota if user is authenticated
    if (userId) {
      const quota = await this.generatedDocumentsService.checkQuota(userId);
      if (!quota.canGenerate) {
        throw new HttpException(
          { success: false, error: 'Quota dépassé', quotaExceeded: true, used: quota.used, limit: quota.limit },
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const docxBuffer = await this.wordService.generateDC2Docx(body.formData);

    // Record generation if user is authenticated
    if (userId && body.marcheId) {
      await this.generatedDocumentsService.recordGeneration(userId, {
        marcheId: body.marcheId,
        marcheTitre: body.marcheTitre || 'Marché',
        marcheAcheteur: body.marcheAcheteur || 'Acheteur',
        documentType: 'dc2',
        fileName: 'DC2-Declaration.docx',
        fileFormat: 'docx',
      });
    }

    return new StreamableFile(docxBuffer);
  }
}
