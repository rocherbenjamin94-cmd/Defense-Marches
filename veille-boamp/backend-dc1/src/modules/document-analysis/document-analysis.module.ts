import { Module } from '@nestjs/common';
import { DocumentAnalysisController } from './document-analysis.controller';
import { DocumentAnalysisService } from './document-analysis.service';
import { TextExtractionService } from './text-extraction.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [DocumentAnalysisController],
  providers: [DocumentAnalysisService, TextExtractionService],
  exports: [DocumentAnalysisService],
})
export class DocumentAnalysisModule { }
