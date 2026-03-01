import { Controller, Get, Post } from '@nestjs/common';
import { bootstrapLocalDatabase, getSchemaVersionInfo } from '../../db/database.bootstrap';
import { runDevelopmentSeed } from '../../db/seed';

@Controller('dev/database')
export class DatabaseController {
  @Get('schema-version')
  schemaVersion(): { currentVersion: string; pendingMigrations: number } {
    return getSchemaVersionInfo();
  }

  @Post('seed')
  seed(): {
    status: 'accepted' | 'running';
    expectedDataset: { users: number; entries: number; edges: number };
  } {
    bootstrapLocalDatabase();
    const expectedDataset = runDevelopmentSeed();
    return {
      status: 'accepted',
      expectedDataset,
    };
  }
}
