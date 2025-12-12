import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { GeneratedDocumentsModule } from '../generated-documents/generated-documents.module';

@Module({
  imports: [GeneratedDocumentsModule],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule { }

