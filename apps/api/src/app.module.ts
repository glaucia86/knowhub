import { Module } from '@nestjs/common';
import { ReadinessModule } from './modules/readiness/readiness.module';
import { SharedAssetsController } from './modules/shared-assets/shared-assets.controller';
import { SharedAssetsService } from './modules/shared-assets/shared-assets.service';
import { QualityGatesController } from './modules/quality-gates/quality-gates.controller';
import { QualityGatesService } from './modules/quality-gates/quality-gates.service';
import { DevEnvironmentModule } from './modules/dev-environment/dev-environment.module';

function isDevEnvironmentModuleEnabled(): boolean {
  const flag = process.env.ENABLE_DEV_ENV_ENDPOINTS;
  if (flag === 'true') {
    return true;
  }
  if (flag === 'false') {
    return false;
  }
  return process.env.NODE_ENV === 'development';
}

@Module({
  imports: [ReadinessModule, ...(isDevEnvironmentModuleEnabled() ? [DevEnvironmentModule] : [])],
  controllers: [SharedAssetsController, QualityGatesController],
  providers: [SharedAssetsService, QualityGatesService],
})
export class AppModule {}
