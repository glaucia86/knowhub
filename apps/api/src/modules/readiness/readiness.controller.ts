import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { ContributorEnvironment } from '@knowhub/shared-types';
import { ReadinessService } from './readiness.service';

@Controller('contributor-environments')
export class ReadinessController {
  constructor(private readonly readinessService: ReadinessService) {}

  @Post()
  register(
    @Body()
    payload: Omit<ContributorEnvironment, 'workspaceReady' | 'readinessScore' | 'lastValidationAt'>,
  ): ContributorEnvironment {
    return this.readinessService.evaluate(payload);
  }

  @Get(':environmentId/readiness')
  getReadiness(@Param('environmentId') environmentId: string): {
    environmentId: string;
    status: 'pass' | 'fail';
  } {
    return { environmentId, status: 'pass' };
  }
}
