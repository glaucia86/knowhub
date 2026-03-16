import { Module } from '@nestjs/common';
import { AdminQueuesController, LocalOnlyGuard } from './admin.controller';

@Module({
  controllers: [AdminQueuesController],
  providers: [LocalOnlyGuard],
})
export class AdminModule {}
