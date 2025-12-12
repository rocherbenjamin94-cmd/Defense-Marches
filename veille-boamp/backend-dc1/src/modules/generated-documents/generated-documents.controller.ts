import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { GeneratedDocumentsService } from './generated-documents.service';

@Controller('api/documents')
export class GeneratedDocumentsController {
    constructor(private readonly service: GeneratedDocumentsService) { }

    @Get('history')
    getHistory(@Headers('x-user-id') userId: string) {
        if (!userId) {
            throw new UnauthorizedException('User ID required');
        }
        return this.service.getHistory(userId);
    }

    @Get('quota')
    async getQuota(@Headers('x-user-id') userId: string) {
        if (!userId) {
            throw new UnauthorizedException('User ID required');
        }
        return this.service.checkQuota(userId);
    }
}
