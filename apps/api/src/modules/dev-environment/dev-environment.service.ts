import { Injectable } from '@nestjs/common';

type EnvironmentStatus = 'ready' | 'degraded' | 'blocked';
type ServiceName = 'redis' | 'ollama' | 'database' | 'api' | 'web';
type ServiceHealth = 'healthy' | 'unhealthy' | 'starting' | 'stopped';

export interface ServiceStatus {
  name: ServiceName;
  health: ServiceHealth;
  endpoint?: string;
  lastCheckedAt: string;
  detail?: string;
}

@Injectable()
export class DevEnvironmentService {
  getStatus(): {
    status: EnvironmentStatus;
    localFirstMode: boolean;
    externalProviderEnabled: boolean;
    warning?: string;
    services: ServiceStatus[];
  } {
    const externalProviderEnabled = process.env.ENABLE_EXTERNAL_AI === 'true';
    const externalAiBaseUrl = process.env.EXTERNAL_AI_BASE_URL;
    const now = new Date().toISOString();

    return {
      status: externalProviderEnabled ? 'degraded' : 'ready',
      localFirstMode: !externalProviderEnabled,
      externalProviderEnabled,
      warning: externalProviderEnabled
        ? `External AI fallback enabled${externalAiBaseUrl ? ` (${externalAiBaseUrl})` : ''}. Data may leave the local environment.`
        : undefined,
      services: [
        {
          name: 'redis',
          health: 'starting',
          endpoint: 'redis://localhost:6379',
          lastCheckedAt: now,
        },
        {
          name: 'ollama',
          health: 'starting',
          endpoint: 'http://localhost:11434',
          lastCheckedAt: now,
        },
        {
          name: 'database',
          health: 'healthy',
          endpoint: process.env.DATABASE_URL || 'file:~/.knowhub/data/knowhub.db',
          lastCheckedAt: now,
        },
        { name: 'api', health: 'healthy', endpoint: 'http://localhost:3001', lastCheckedAt: now },
        { name: 'web', health: 'starting', endpoint: 'http://localhost:3000', lastCheckedAt: now },
      ],
    };
  }
}
