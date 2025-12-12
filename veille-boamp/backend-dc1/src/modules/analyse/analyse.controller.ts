import { Controller, Post, Body, Get, HttpException, HttpStatus, Param, Query } from '@nestjs/common';
import { AnalyseService, AnalyseMarche, ProfilEntreprise, ScoreCompatibilite, AnalysedMarcheSummary, AnalyseSummary } from './analyse.service';

interface AnalyseRequest {
    marcheId: string;
    boampUrl: string;
}

interface ScorePersonnaliseRequest {
    marcheId: string;
    profil: ProfilEntreprise;
}

interface AnalyseResponse {
    success: boolean;
    data?: AnalyseMarche;
    error?: string;
}

interface ScoreResponse {
    success: boolean;
    data?: ScoreCompatibilite;
    error?: string;
}

// Store profils in memory (should be database in production)
const profilsStore: Map<string, ProfilEntreprise> = new Map();

@Controller('api/analyse')
export class AnalyseController {
    constructor(private readonly analyseService: AnalyseService) { }

    @Post('marche')
    async analyserMarche(@Body() body: AnalyseRequest): Promise<AnalyseResponse> {
        if (!body.marcheId || !body.boampUrl) {
            throw new HttpException(
                { success: false, error: 'marcheId et boampUrl sont requis' },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            const analyse = await this.analyseService.analyserMarche(
                body.marcheId,
                body.boampUrl,
            );
            return { success: true, data: analyse };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    error: `Erreur lors de l'analyse du marché: ${error.message}`
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('score-personnalise')
    async calculerScorePersonnalise(@Body() body: ScorePersonnaliseRequest): Promise<ScoreResponse> {
        if (!body.marcheId || !body.profil) {
            throw new HttpException(
                { success: false, error: 'marcheId et profil sont requis' },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            const score = await this.analyseService.calculerScorePersonnalise(
                body.marcheId,
                body.profil,
            );
            return { success: true, data: score };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    error: `Erreur calcul score: ${error.message}`
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('cache/stats')
    async getCacheStats() {
        return await this.analyseService.getCacheStats();
    }

    @Get('cache/analysed')
    async getAnalysedMarches(): Promise<AnalysedMarcheSummary[]> {
        return await this.analyseService.getAnalysedMarches();
    }

    @Get('cache/batch')
    async checkCacheBatch(@Query('ids') ids: string): Promise<Record<string, AnalyseSummary | null>> {
        if (!ids) {
            return {};
        }
        const idsArray = ids.split(',').filter(id => id.trim());
        return await this.analyseService.checkCacheBatch(idsArray);
    }
}

@Controller('api/profil')
export class ProfilController {

    @Get(':userId')
    async getProfil(@Param('userId') userId: string) {
        const profil = profilsStore.get(userId);
        if (!profil) {
            return { success: true, data: null, exists: false };
        }
        return { success: true, data: profil, exists: true };
    }

    @Post()
    async saveProfil(@Body() body: { userId: string; profil: ProfilEntreprise }) {
        if (!body.userId || !body.profil) {
            throw new HttpException(
                { success: false, error: 'userId et profil sont requis' },
                HttpStatus.BAD_REQUEST,
            );
        }

        profilsStore.set(body.userId, body.profil);
        return { success: true, message: 'Profil sauvegardé' };
    }
}
