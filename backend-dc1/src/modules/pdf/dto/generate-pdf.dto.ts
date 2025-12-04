import { IsObject, IsNotEmpty } from 'class-validator';
import type { DC1FormData } from '../../../types';

export class GeneratePdfDto {
  @IsObject()
  @IsNotEmpty()
  formData: DC1FormData;
}
