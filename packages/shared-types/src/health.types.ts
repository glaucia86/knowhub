export interface HealthDatabaseStatus {
  status: 'connected' | 'error';
  latencyMs?: number;
  error?: string;
}

export interface HealthOllamaStatus {
  status: 'available' | 'unavailable';
  models?: string[];
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  uptime: number;
  database: HealthDatabaseStatus;
  ollama: HealthOllamaStatus;
}
