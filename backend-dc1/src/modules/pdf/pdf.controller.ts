import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  StreamableFile,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
import { PdfService } from './pdf.service';
import type { DC1FormData, DC2FormData } from '../../types';

@Controller('api/pdf')
export class PdfController {
  constructor(private pdfService: PdfService) {}

  @Post('generate')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="DC1-Candidature.pdf"')
  async generate(@Body() body: { formData: DC1FormData }): Promise<StreamableFile> {
    const pdfBuffer = await this.pdfService.generatePDF(body.formData);
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
  async generateDC2(@Body() body: { formData: DC2FormData }): Promise<StreamableFile> {
    const pdfBuffer = await this.pdfService.generateDC2PDF(body.formData);
    return new StreamableFile(pdfBuffer);
  }

  @Post('preview-dc2')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async previewDC2(@Body() body: { formData: DC2FormData }): Promise<string> {
    return this.pdfService.renderDC2Template(body.formData);
  }
}
