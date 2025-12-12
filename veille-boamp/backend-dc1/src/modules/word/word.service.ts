import { Injectable } from '@nestjs/common';
import { Packer } from 'docx';
import { DC1FormData, DC2FormData } from '../../types';
import { generateDC1Word } from './templates/dc1-word.template';
import { generateDC2Word } from './templates/dc2-word.template';

@Injectable()
export class WordService {
  async generateDocx(formData: DC1FormData): Promise<Buffer> {
    const doc = generateDC1Word(formData);
    const buffer = await Packer.toBuffer(doc);
    return Buffer.from(buffer);
  }

  async generateDC2Docx(formData: DC2FormData): Promise<Buffer> {
    const doc = generateDC2Word(formData);
    const buffer = await Packer.toBuffer(doc);
    return Buffer.from(buffer);
  }
}
