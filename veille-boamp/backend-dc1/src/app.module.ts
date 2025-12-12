import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { CacheModule } from './modules/cache/cache.module';
import { PappersModule } from './modules/pappers/pappers.module';
import { ClaudeModule } from './modules/claude/claude.module';
import { EntrepriseModule } from './modules/entreprise/entreprise.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { WordModule } from './modules/word/word.module';
import { DocumentAnalysisModule } from './modules/document-analysis/document-analysis.module';
import { AnalyseModule } from './modules/analyse/analyse.module';
import { GeneratedDocumentsModule } from './modules/generated-documents/generated-documents.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    CacheModule,
    PappersModule,
    ClaudeModule,
    EntrepriseModule,
    PdfModule,
    WordModule,
    DocumentAnalysisModule,
    AnalyseModule,
    GeneratedDocumentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
