export interface ApiEnvironmentConfig {
  port: number;
  nodeEnv: string;
}

export function readApiEnvironmentConfig(): ApiEnvironmentConfig {
  return {
    port: Number.parseInt(process.env.PORT ?? '', 10) || 3001,
    nodeEnv: process.env.NODE_ENV ?? 'development',
  };
}
