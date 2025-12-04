import { Module, Global, forwardRef } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { CacheService } from './cache.service';
import { PappersCacheService } from './pappers-cache.service';
import { ClaudeCacheService } from './claude-cache.service';
import { CacheController } from './cache.controller';
import { PappersModule } from '../pappers/pappers.module';
import { ClaudeModule } from '../claude/claude.module';

@Global()
@Module({
  imports: [
    forwardRef(() => PappersModule),
    forwardRef(() => ClaudeModule),
  ],
  controllers: [CacheController],
  providers: [DatabaseService, CacheService, PappersCacheService, ClaudeCacheService],
  exports: [DatabaseService, CacheService, PappersCacheService, ClaudeCacheService],
})
export class CacheModule { }
