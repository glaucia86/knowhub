import { Module } from '@nestjs/common';
import { DevEnvironmentController } from './dev-environment.controller';
import { HealthController } from './health.controller';
import { DevEnvironmentService } from './dev-environment.service';
import { DatabaseController } from './database.controller';
import { EnvironmentController } from './environment.controller';

@Module({
  controllers: [
    HealthController,
    DevEnvironmentController,
    DatabaseController,
    EnvironmentController,
  ],
  providers: [DevEnvironmentService],
})
export class DevEnvironmentModule {}
