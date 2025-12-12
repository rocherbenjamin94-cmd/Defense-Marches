import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EntrepriseService } from './entreprise.service';
import { LookupQueryDto, DirectLookupQueryDto } from './dto';
import { SiretValidationPipe } from '../../common/pipes/siret-validation.pipe';
import { DatabaseService } from '../cache/database.service';
import { PappersService } from '../pappers/pappers.service';

@Controller('api/entreprise')
export class EntrepriseController {
  constructor(
    private entrepriseService: EntrepriseService,
    private databaseService: DatabaseService,
    private pappersService: PappersService,
  ) { }

  @Get('lookup')
  async lookup(@Query() query: LookupQueryDto) {
    const result = await this.entrepriseService.smartLookup(query.q);
    return {
      success: true,
      data: result.entrepriseData,
      message: result.claudeResponse,
    };
  }

  @Get('direct')
  async directLookup(@Query() query: DirectLookupQueryDto) {
    if (query.siret) {
      const validatedSiret = new SiretValidationPipe().transform(query.siret);
      const data = await this.entrepriseService.directLookupBySiret(validatedSiret);
      return { success: true, data };
    }

    if (query.siren) {
      const data = await this.entrepriseService.directLookupBySiren(query.siren);
      return { success: true, data };
    }

    throw new HttpException(
      'Veuillez fournir un SIRET ou un SIREN',
      HttpStatus.BAD_REQUEST,
    );
  }

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.length < 2) {
      throw new HttpException(
        'La recherche doit contenir au moins 2 caractères',
        HttpStatus.BAD_REQUEST,
      );
    }

    const data = await this.entrepriseService.searchByName(query);
    return { success: true, data, count: data.length };
  }

  @Get('stats')
  async getStats() {
    const stats = await this.databaseService.getStats();
    return { success: true, data: stats };
  }

  @Post('refresh/:siret')
  async refresh(@Param('siret') siret: string) {
    const validatedSiret = new SiretValidationPipe().transform(siret);
    const result = await this.pappersService.refreshFromPappers(validatedSiret);
    return {
      success: true,
      data: result.data,
      source: result.source,
      message: 'Données actualisées depuis Pappers',
    };
  }

  @Get('cached')
  async getCachedEntreprises(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const data = await this.databaseService.getAllEntreprises(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
    return { success: true, data, count: data.length };
  }

  @Get('autocomplete')
  async autocomplete(@Query('q') query: string) {
    if (!query || query.length < 2) {
      return { success: true, data: [], source: 'cache' };
    }

    // Recherche dans le cache PostgreSQL uniquement (0 crédit)
    const results = await this.databaseService.searchByName(query);

    // Mapper vers un format simplifié pour l'autocomplete
    const suggestions = results.map((r) => ({
      siret: r.siret,
      siren: r.siren,
      nom_entreprise: r.nom_entreprise,
      denomination_sociale: r.denomination_sociale,
      ville: r.ville,
      code_postal: r.code_postal,
      source: 'cache' as const,
    }));

    return {
      success: true,
      data: suggestions,
      count: suggestions.length,
      source: 'cache',
    };
  }
}
