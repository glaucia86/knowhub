export type EnvironmentWorkspace = 'root' | 'api' | 'web';

export interface EnvironmentVariableSpec {
  name: string;
  workspace: EnvironmentWorkspace;
  required: boolean;
  sensitive: boolean;
  description: string;
  exampleValue: string;
  defaultValue?: string;
}

export const ENVIRONMENT_VARIABLE_CATALOG: EnvironmentVariableSpec[] = [
  {
    name: 'NODE_ENV',
    workspace: 'api',
    required: true,
    sensitive: false,
    description: 'Execution mode for API runtime.',
    exampleValue: 'development',
    defaultValue: 'development',
  },
  {
    name: 'PORT',
    workspace: 'api',
    required: true,
    sensitive: false,
    description: 'API HTTP port.',
    exampleValue: '3001',
    defaultValue: '3001',
  },
  {
    name: 'DATABASE_URL',
    workspace: 'api',
    required: true,
    sensitive: false,
    description: 'Local SQLite database location.',
    exampleValue: 'file:~/.knowhub/data/knowhub.db',
    defaultValue: 'file:~/.knowhub/data/knowhub.db',
  },
  {
    name: 'REDIS_URL',
    workspace: 'api',
    required: true,
    sensitive: false,
    description: 'Redis or Valkey connection URL.',
    exampleValue: 'redis://localhost:6379',
  },
  {
    name: 'OLLAMA_BASE_URL',
    workspace: 'api',
    required: true,
    sensitive: false,
    description: 'Local inference endpoint.',
    exampleValue: 'http://localhost:11434',
  },
  {
    name: 'OLLAMA_DEFAULT_MODEL',
    workspace: 'api',
    required: false,
    sensitive: false,
    description: 'Default local model for development.',
    exampleValue: 'qwen2.5:3b',
    defaultValue: 'qwen2.5:3b',
  },
  {
    name: 'ENABLE_EXTERNAL_AI',
    workspace: 'api',
    required: true,
    sensitive: false,
    description: 'Enable explicit external AI provider fallback.',
    exampleValue: 'false',
    defaultValue: 'false',
  },
  {
    name: 'EXTERNAL_AI_BASE_URL',
    workspace: 'api',
    required: false,
    sensitive: false,
    description: 'External provider base URL used when fallback is enabled.',
    exampleValue: 'https://api.example.com',
  },
  {
    name: 'EXTERNAL_AI_API_KEY',
    workspace: 'api',
    required: false,
    sensitive: true,
    description: 'External provider API key.',
    exampleValue: '__GENERATE_SECRET__',
  },
  {
    name: 'LOCAL_API_BASE_URL',
    workspace: 'root',
    required: false,
    sensitive: false,
    description: 'Base URL for local API integration.',
    exampleValue: 'http://localhost:3001',
  },
  {
    name: 'WEB_BASE_URL',
    workspace: 'root',
    required: false,
    sensitive: false,
    description: 'Base URL for local web app.',
    exampleValue: 'http://localhost:3000',
  },
  {
    name: 'SHARED_APP_SECRET',
    workspace: 'root',
    required: false,
    sensitive: true,
    description: 'Local shared app secret.',
    exampleValue: '__GENERATE_SECRET__',
  },
  {
    name: 'NEXT_PUBLIC_API_URL',
    workspace: 'web',
    required: true,
    sensitive: false,
    description: 'Web app URL for local API.',
    exampleValue: 'http://localhost:3001',
  },
];

export function listEnvironmentVariables(
  workspace?: EnvironmentWorkspace,
): EnvironmentVariableSpec[] {
  if (!workspace) {
    return ENVIRONMENT_VARIABLE_CATALOG;
  }
  return ENVIRONMENT_VARIABLE_CATALOG.filter((variable) => variable.workspace === workspace);
}
