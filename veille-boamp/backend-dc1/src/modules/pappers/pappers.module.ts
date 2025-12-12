import { Module, forwardRef } from '@nestjs/common';
import { PappersService } from './pappers.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [forwardRef(() => CacheModule)],
  providers: [PappersService],
  exports: [PappersService],
})
export class PappersModule { }
