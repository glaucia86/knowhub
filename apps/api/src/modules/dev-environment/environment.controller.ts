import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  type EnvironmentValidationResult,
  validateEnvironmentValues,
} from '../../config/env.validation';
import { type EnvironmentWorkspace, listEnvironmentVariables } from '../../config/env.catalog';

interface ValidationRequest {
  workspace: EnvironmentWorkspace;
  values: Record<string, string | undefined>;
}

@Controller('dev/environment/variables')
export class EnvironmentController {
  @Get()
  list(): { variables: ReturnType<typeof listEnvironmentVariables> } {
    return { variables: listEnvironmentVariables() };
  }

  @Post('validate')
  validate(@Body() payload: ValidationRequest): EnvironmentValidationResult {
    return validateEnvironmentValues(payload.workspace, payload.values);
  }
}
