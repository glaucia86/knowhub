import { Module } from '@nestjs/common';
import { KnowHubConfigService } from './knowhub-config.service';

@Module({
  providers: [KnowHubConfigService],
  exports: [KnowHubConfigService],
})
export class KnowHubConfigModule {}
