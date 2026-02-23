import { Module } from '@nestjs/common';
import { ReadinessModule } from './modules/readiness/readiness.module';
import { ReadinessController } from './modules/readiness/readiness.controller';
import { ReadinessService } from './modules/readiness/readiness.service';
import { SharedAssetsController } from './modules/shared-assets/shared-assets.controller';
import { SharedAssetsService } from './modules/shared-assets/shared-assets.service';
import { QualityGatesController } from './modules/quality-gates/quality-gates.controller';
import { QualityGatesService } from './modules/quality-gates/quality-gates.service';

@Module({
  imports: [ReadinessModule],
  controllers: [ReadinessController, SharedAssetsController, QualityGatesController],
  providers: [ReadinessService, SharedAssetsService, QualityGatesService],
})
export class AppModule {}
