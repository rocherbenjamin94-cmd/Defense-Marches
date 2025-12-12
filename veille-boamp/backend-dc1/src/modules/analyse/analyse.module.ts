import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AnalyseController, ProfilController } from './analyse.controller';
import { AnalyseService } from './analyse.service';

@Module({
    imports: [HttpModule],
    controllers: [AnalyseController, ProfilController],
    providers: [AnalyseService],
    exports: [AnalyseService],
})
export class AnalyseModule { }
