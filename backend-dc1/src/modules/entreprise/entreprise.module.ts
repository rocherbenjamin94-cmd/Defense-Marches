import { Module } from '@nestjs/common';
import { EntrepriseController } from './entreprise.controller';
import { EntrepriseService } from './entreprise.service';
import { ClaudeModule } from '../claude/claude.module';
import { PappersModule } from '../pappers/pappers.module';

@Module({
  imports: [ClaudeModule, PappersModule],
  controllers: [EntrepriseController],
  providers: [EntrepriseService],
})
export class EntrepriseModule {}
