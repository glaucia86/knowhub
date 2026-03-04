import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { HealthCheckResponse } from '@knowhub/shared-types';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from '../auth/public.decorator';
import { DrizzleHealthIndicator } from './drizzle-health.indicator';
import { OllamaHealthIndicator } from './ollama-health.indicator';

const apiPackage = require('../../../package.json') as { version: string };

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly drizzleHealthIndicator: DrizzleHealthIndicator,
    private readonly ollamaHealthIndicator: OllamaHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check overall health status' })
  @ApiResponse({ status: 200, description: 'Health ok/degraded' })
  @ApiResponse({ status: 503, description: 'Critical database failure' })
  async getHealth(
    @Res({ passthrough: true }) response: { status: (code: number) => void },
  ): Promise<HealthCheckResponse> {
    const [database, ollama] = await Promise.all([
      this.drizzleHealthIndicator.check(),
      this.ollamaHealthIndicator.check(),
    ]);

    await this.healthCheckService.check([
      async () => ({ database: { status: database.status === 'connected' ? 'up' : 'down' } }),
      async () => ({ ollama: { status: ollama.status === 'available' ? 'up' : 'down' } }),
    ]);

    const status =
      database.status === 'error' ? 'error' : ollama.status === 'available' ? 'ok' : 'degraded';

    if (status === 'error') {
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      status,
      version: apiPackage.version,
      uptime: Math.floor(process.uptime()),
      database,
      ollama,
    };
  }
}
