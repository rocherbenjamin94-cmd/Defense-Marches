import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LookupQueryDto {
  @IsString()
  @IsNotEmpty()
  q: string;
}

export class DirectLookupQueryDto {
  @IsString()
  @IsOptional()
  siret?: string;

  @IsString()
  @IsOptional()
  siren?: string;
}
