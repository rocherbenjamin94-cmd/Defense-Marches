import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ClaudeService } from '../claude/claude.service';
import { PappersService } from '../pappers/pappers.service';
import { PappersCacheService } from '../cache/pappers-cache.service';
import { EntrepriseData } from '../../types';

@Injectable()
export class EntrepriseService {
  constructor(
    private claudeService: ClaudeService,
    private pappersService: PappersService,
    private pappersCache: PappersCacheService,
  ) { }

  async smartLookup(query: string): Promise<{
    entrepriseData: EntrepriseData | EntrepriseData[];
    claudeResponse: string;
  }> {
    return this.claudeService.lookupEntreprise(query);
  }

  async directLookupBySiret(siret: string): Promise<EntrepriseData> {
    // Use cache for direct lookup (info usage)
    return this.pappersCache.getEntreprise(siret, 'info');
  }

  async directLookupBySiren(siren: string): Promise<EntrepriseData> {
    return this.pappersService.lookupBySiren(siren);
  }

  async searchByName(name: string): Promise<EntrepriseData[]> {
    // Use cache for search
    return this.pappersCache.searchEntreprise(name);
  }
}
