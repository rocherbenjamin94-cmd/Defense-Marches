import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class SiretValidationPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return value;
    }

    const cleaned = value.replace(/\s/g, '');

    if (/^\d{14}$/.test(cleaned)) {
      if (!this.isValidSiret(cleaned)) {
        throw new BadRequestException('SIRET invalide (clé de contrôle incorrecte)');
      }
      return cleaned;
    }

    if (/^\d{9}$/.test(cleaned)) {
      return cleaned;
    }

    return value;
  }

  private isValidSiret(siret: string): boolean {
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      let digit = parseInt(siret[i], 10);
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  }
}
