import { Module } from '@nestjs/common';
import { WordController } from './word.controller';
import { WordService } from './word.service';
import { GeneratedDocumentsModule } from '../generated-documents/generated-documents.module';

@Module({
  imports: [GeneratedDocumentsModule],
  controllers: [WordController],
  providers: [WordService],
  exports: [WordService],
})
export class WordModule { }

