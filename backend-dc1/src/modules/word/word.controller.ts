import {
  Controller,
  Post,
  Body,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { WordService } from './word.service';
import type { DC1FormData, DC2FormData } from '../../types';

@Controller('api/word')
export class WordController {
  constructor(private wordService: WordService) {}

  @Post('generate')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  @Header('Content-Disposition', 'attachment; filename="DC1-Candidature.docx"')
  async generate(
    @Body() body: { formData: DC1FormData },
  ): Promise<StreamableFile> {
    const docxBuffer = await this.wordService.generateDocx(body.formData);
    return new StreamableFile(docxBuffer);
  }

  @Post('generate-dc2')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  @Header('Content-Disposition', 'attachment; filename="DC2-Declaration.docx"')
  async generateDC2(
    @Body() body: { formData: DC2FormData },
  ): Promise<StreamableFile> {
    const docxBuffer = await this.wordService.generateDC2Docx(body.formData);
    return new StreamableFile(docxBuffer);
  }
}
