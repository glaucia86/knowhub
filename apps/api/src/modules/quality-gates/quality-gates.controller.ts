import { Body, Controller, Post } from '@nestjs/common';
import type { QualityGate } from '@knowhub/shared-types';
import { QualityGatesService } from './quality-gates.service';

interface ValidationRequest {
  environmentId: string;
  gates: QualityGate[];
}

@Controller('quality-gates')
export class QualityGatesController {
  constructor(private readonly qualityGatesService: QualityGatesService) {}

  @Post('validate')
  validate(@Body() payload: ValidationRequest): {
    environmentId: string;
    overallResult: 'pass' | 'fail';
    blockingFailures: QualityGate[];
  } {
    return this.qualityGatesService.validate(payload.environmentId, payload.gates);
  }
}
