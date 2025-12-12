import { Module } from '@nestjs/common';
import { GeneratedDocumentsService } from './generated-documents.service';
import { GeneratedDocumentsController } from './generated-documents.controller';

@Module({
    controllers: [GeneratedDocumentsController],
    providers: [GeneratedDocumentsService],
    exports: [GeneratedDocumentsService],
})
export class GeneratedDocumentsModule { }
