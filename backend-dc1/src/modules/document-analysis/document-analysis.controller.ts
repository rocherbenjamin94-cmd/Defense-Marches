import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentAnalysisService } from './document-analysis.service';
import { AnalyzeDocumentResponse } from './dto';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword', // Will be rejected with helpful message
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/tiff',
];

@Controller('api/document')
export class DocumentAnalysisController {
  constructor(private documentAnalysisService: DocumentAnalysisService) {}

  @Post('analyze')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(
            new HttpException(
              'Type de fichier non supporté. Formats acceptés: PDF, DOCX, PNG, JPG, TIFF',
              HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  async analyzeDocument(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AnalyzeDocumentResponse> {
    if (!file) {
      throw new HttpException(
        'Aucun fichier fourni. Veuillez sélectionner un document RC.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.documentAnalysisService.analyzeDocument(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    const confidenceText =
      result.data.confidence >= 70
        ? 'bonne'
        : result.data.confidence >= 50
          ? 'moyenne'
          : 'faible';

    const message = result.fromCache
      ? `Document déjà analysé (cache) - confiance ${confidenceText} (${result.data.confidence}%)`
      : `Document analysé avec une confiance ${confidenceText} (${result.data.confidence}%)`;

    return {
      success: true,
      data: result.data,
      documentId: result.documentId,
      fromCache: result.fromCache,
      message,
    };
  }

  @Get('history')
  async getHistory(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const history = this.documentAnalysisService.getDocumentHistory(parsedLimit);

    return {
      success: true,
      data: history,
      message: `${history.length} document(s) dans l'historique`,
    };
  }
}
