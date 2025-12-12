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
import { PdfService } from './pdf.service';
import { GeneratedDocumentsService } from '../generated-documents/generated-documents.service';
import type { DC1FormData, DC2FormData } from '../../types';

@Controller('api/pdf')
export class PdfController {
  constructor(
    private pdfService: PdfService,
    private generatedDocumentsService: GeneratedDocumentsService,
  ) { }

  @Post('generate')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="DC1-Candidature.pdf"')
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

    const pdfBuffer = await this.pdfService.generatePDF(body.formData);

    // Record generation if user is authenticated
    if (userId && body.marcheId) {
      await this.generatedDocumentsService.recordGeneration(userId, {
        marcheId: body.marcheId,
        marcheTitre: body.marcheTitre || 'Marché',
        marcheAcheteur: body.marcheAcheteur || 'Acheteur',
        documentType: 'dc1',
        fileName: 'DC1-Candidature.pdf',
        fileFormat: 'pdf',
      });
    }

    return new StreamableFile(pdfBuffer);
  }

  @Post('preview')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async preview(@Body() body: { formData: DC1FormData }): Promise<string> {
    return this.pdfService.renderTemplate(body.formData);
  }

  @Post('generate-dc2')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="DC2-Declaration.pdf"')
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

    const pdfBuffer = await this.pdfService.generateDC2PDF(body.formData);

    // Record generation if user is authenticated
    if (userId && body.marcheId) {
      await this.generatedDocumentsService.recordGeneration(userId, {
        marcheId: body.marcheId,
        marcheTitre: body.marcheTitre || 'Marché',
        marcheAcheteur: body.marcheAcheteur || 'Acheteur',
        documentType: 'dc2',
        fileName: 'DC2-Declaration.pdf',
        fileFormat: 'pdf',
      });
    }

    return new StreamableFile(pdfBuffer);
  }

  @Post('preview-dc2')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async previewDC2(@Body() body: { formData: DC2FormData }): Promise<string> {
    return this.pdfService.renderDC2Template(body.formData);
  }
}
