import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { bootstrapLocalDatabase, resetLocalDatabase } from '../../db/database.bootstrap';
import { runDevelopmentSeed } from '../../db/seed';
import { DevEnvironmentService } from './dev-environment.service';

interface BootstrapRequest {
  runMigrations: boolean;
  runSeed: boolean;
  pullModels: boolean;
}

interface ResetRequest {
  confirm: boolean;
  includeInfrastructureVolumes?: boolean;
}

@Controller('dev/environment')
export class DevEnvironmentController {
  constructor(private readonly devEnvironmentService: DevEnvironmentService) {}

  @Get('status')
  status() {
    return this.devEnvironmentService.getStatus();
  }

  @Post('bootstrap')
  bootstrap(
    @Body()
    payload: BootstrapRequest,
  ): { runId: string; status: 'accepted' | 'running'; estimatedCompletionSeconds: number } {
    if (payload.runMigrations) {
      bootstrapLocalDatabase();
    }
    if (payload.runSeed) {
      runDevelopmentSeed();
    }

    return {
      runId: randomUUID(),
      status: 'accepted',
      estimatedCompletionSeconds: payload.pullModels ? 120 : 30,
    };
  }

  @Post('reset')
  reset(@Body() payload: ResetRequest): { runId: string; status: 'accepted' | 'running' } {
    if (!payload.confirm) {
      throw new BadRequestException('Confirm field = true and required for reset.');
    }

    resetLocalDatabase({ includeSeed: true });

    return {
      runId: randomUUID(),
      status: 'accepted',
    };
  }
}
