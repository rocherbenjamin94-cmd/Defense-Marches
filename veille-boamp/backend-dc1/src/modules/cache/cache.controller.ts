import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('cache')
export class CacheController {
    constructor(private db: DatabaseService) { }

    @Get('stats')
    async getCacheStats() {
        const claudeCount = await this.db.query<{ count: number }>(
            'SELECT COUNT(*) as count FROM document_analyses',
        );
        const pappersCount = await this.db.query<{ count: number }>(
            'SELECT COUNT(*) as count FROM entreprises_cache',
        );
        const searchCount = await this.db.query<{ count: number }>(
            'SELECT COUNT(*) as count FROM pappers_searches_cache',
        );

        return {
            documentAnalyses: claudeCount?.count || 0,
            entreprises: pappersCount?.count || 0,
            searches: searchCount?.count || 0,
        };
    }
}
