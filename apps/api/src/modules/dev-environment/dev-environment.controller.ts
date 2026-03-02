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
    if (payload.pullModels) {
      throw new BadRequestException(
        "pullModels=true is not supported yet. Use 'docker compose exec ollama ollama pull <model>' manually.",
      );
    }

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
    if (payload.includeInfrastructureVolumes) {
      throw new BadRequestException(
        "includeInfrastructureVolumes=true is not supported by this endpoint yet. Use 'docker compose down -v' manually.",
      );
    }

    resetLocalDatabase({ includeSeed: true });

    return {
      runId: randomUUID(),
      status: 'accepted',
    };
  }
}
