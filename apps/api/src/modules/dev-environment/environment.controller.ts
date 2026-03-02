import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import {
  type EnvironmentValidationResult,
  validateEnvironmentValues,
} from '../../config/env.validation';
import { type EnvironmentWorkspace, listEnvironmentVariables } from '../../config/env.catalog';

interface ValidationRequest {
  workspace: string;
  values: Record<string, string | undefined>;
}

const WORKSPACES: EnvironmentWorkspace[] = ['root', 'api', 'web'];

@Controller('dev/environment/variables')
export class EnvironmentController {
  @Get()
  list(): { variables: ReturnType<typeof listEnvironmentVariables> } {
    return { variables: listEnvironmentVariables() };
  }

  @Post('validate')
  validate(@Body() payload: ValidationRequest): EnvironmentValidationResult {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Request body is required.');
    }
    if (!WORKSPACES.includes(payload.workspace as EnvironmentWorkspace)) {
      throw new BadRequestException('workspace must be one of: root, api, web');
    }
    if (!payload.values || typeof payload.values !== 'object' || Array.isArray(payload.values)) {
      throw new BadRequestException('values must be an object map.');
    }

    const workspace = payload.workspace as EnvironmentWorkspace;
    return validateEnvironmentValues(workspace, payload.values);
  }
}
