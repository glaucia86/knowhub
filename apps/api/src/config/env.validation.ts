import { existsSync } from 'node:fs';
import path from 'node:path';
import { config as loadDotenv } from 'dotenv';
import {
  type EnvironmentVariableSpec,
  type EnvironmentWorkspace,
  listEnvironmentVariables,
} from './env.catalog';

export interface EnvironmentValidationResult {
  status: 'pass' | 'fail';
  missingRequired: string[];
  invalidValues: string[];
  actionMessage?: string;
}

function resolveApiWorkspaceRoot(): string {
  const nestedWorkspace = path.resolve(process.cwd(), 'apps', 'api');
  if (existsSync(path.join(nestedWorkspace, 'package.json'))) {
    return nestedWorkspace;
  }
  return process.cwd();
}

export function loadEnvironmentFiles(): void {
  const apiRoot = resolveApiWorkspaceRoot();
  const rootEnvPath = path.resolve(apiRoot, '..', '..', '.env');
  const apiEnvPath = path.resolve(apiRoot, '.env');

  if (existsSync(rootEnvPath)) {
    loadDotenv({ path: rootEnvPath, override: false });
  }
  if (existsSync(apiEnvPath)) {
    loadDotenv({ path: apiEnvPath, override: false });
  }
}

function isInvalidBoolean(value: string): boolean {
  return value !== 'true' && value !== 'false';
}

function isInvalidInteger(value: string, min: number, max: number): boolean {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < min || parsed > max;
}

function resolveEffectiveValue(
  spec: EnvironmentVariableSpec,
  values: Record<string, string | undefined>,
): string | undefined {
  const rawValue = values[spec.name];
  if (rawValue && rawValue.trim().length > 0) {
    return rawValue;
  }
  return spec.defaultValue;
}

export function validateEnvironmentValues(
  workspace: EnvironmentWorkspace,
  values: Record<string, string | undefined>,
): EnvironmentValidationResult {
  const specs = listEnvironmentVariables(workspace);
  const missingRequired: string[] = [];
  const invalidValues: string[] = [];

  for (const spec of specs) {
    const value = resolveEffectiveValue(spec, values);
    if (spec.required && (!value || value.trim().length === 0)) {
      missingRequired.push(spec.name);
      continue;
    }

    if (!value || value.trim().length === 0) {
      continue;
    }

    if (spec.name === 'ENABLE_EXTERNAL_AI' && isInvalidBoolean(value)) {
      invalidValues.push(`${spec.name} must be true or false`);
    }
    if (spec.name === 'INGEST_URL_TIMEOUT_MS' && isInvalidInteger(value, 1000, 60000)) {
      invalidValues.push(`${spec.name} must be an integer between 1000 and 60000`);
    }
    if (spec.name === 'MAX_PDF_CONCURRENCY' && isInvalidInteger(value, 1, 10)) {
      invalidValues.push(`${spec.name} must be an integer between 1 and 10`);
    }
  }

  const externalAiEnabledSpec = specs.find((spec) => spec.name === 'ENABLE_EXTERNAL_AI');
  const externalAiEnabled = externalAiEnabledSpec
    ? resolveEffectiveValue(externalAiEnabledSpec, values) === 'true'
    : values.ENABLE_EXTERNAL_AI === 'true';

  if (
    externalAiEnabled &&
    (!values.EXTERNAL_AI_API_KEY || values.EXTERNAL_AI_API_KEY.trim() === '')
  ) {
    missingRequired.push('EXTERNAL_AI_API_KEY');
  }

  const status: 'pass' | 'fail' =
    missingRequired.length > 0 || invalidValues.length > 0 ? 'fail' : 'pass';
  return {
    status,
    missingRequired,
    invalidValues,
    actionMessage:
      status === 'fail'
        ? `Missing or invalid environment variables. Run 'npm run env:setup' and review apps/api/.env.`
        : undefined,
  };
}

export function validateApiEnvironmentOrThrow(): void {
  loadEnvironmentFiles();
  const result = validateEnvironmentValues('api', process.env);
  if (result.status === 'fail') {
    const details = [...result.missingRequired, ...result.invalidValues].join(', ');
    throw new Error(`${result.actionMessage} Details: ${details}`);
  }
}
