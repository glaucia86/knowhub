import { writeFileSync } from 'node:fs';
import path from 'node:path';

export class SetupEcosystemService {
  write(baseDir: string): string {
    const ecosystemPath = path.resolve(baseDir, 'ecosystem.config.js');
    const content = `module.exports = {
  healthCheckUrl: 'http://localhost:3001/api/v1/health',
  apps: [
    {
      name: 'knowhub-api',
      script: 'npm',
      args: 'run dev -w @knowhub/api',
      min_uptime: '10s',
      max_restarts: 3,
      restart_delay: 1000,
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'knowhub-web',
      script: 'npm',
      args: 'run dev -w @knowhub/web',
      min_uptime: '10s',
      max_restarts: 3,
      restart_delay: 1000,
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};\n`;
    writeFileSync(ecosystemPath, content, 'utf-8');
    return ecosystemPath;
  }
}
