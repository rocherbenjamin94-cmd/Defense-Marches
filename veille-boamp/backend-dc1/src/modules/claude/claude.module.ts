import { Module } from '@nestjs/common';
import { ClaudeService } from './claude.service';
import { PappersModule } from '../pappers/pappers.module';

@Module({
  imports: [PappersModule],
  providers: [ClaudeService],
  exports: [ClaudeService],
})
export class ClaudeModule {}
