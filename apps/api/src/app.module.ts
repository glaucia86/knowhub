import { Module } from '@nestjs/common';
import { ReadinessModule } from './modules/readiness/readiness.module';
import { SharedAssetsController } from './modules/shared-assets/shared-assets.controller';
import { SharedAssetsService } from './modules/shared-assets/shared-assets.service';
import { QualityGatesController } from './modules/quality-gates/quality-gates.controller';
import { QualityGatesService } from './modules/quality-gates/quality-gates.service';

@Module({
  imports: [ReadinessModule],
  controllers: [SharedAssetsController, QualityGatesController],
  providers: [SharedAssetsService, QualityGatesService],
})
export class AppModule {}
