import {
  CanActivate,
  Controller,
  ExecutionContext,
  ForbiddenException,
  Get,
  Injectable,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { INDEXING_QUEUE, resolveRedisConnection } from '../agents/indexing/indexing.queue';

@Injectable()
export class LocalOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<{ ip?: string; socket?: { remoteAddress?: string } }>();
    const ip = req.ip ?? req.socket?.remoteAddress ?? '';
    const isLocal = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
    if (!isLocal) {
      throw new ForbiddenException('Admin endpoints are local-only');
    }
    return true;
  }
}

@Controller('admin/queues')
@UseGuards(LocalOnlyGuard)
export class AdminQueuesController {
  private readonly queue = new Queue(INDEXING_QUEUE, { connection: resolveRedisConnection() });

  @Get()
  async getQueues() {
    const counts = await this.queue.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed',
      'paused',
    );
    return {
      data: [
        {
          name: INDEXING_QUEUE,
          counts,
        },
      ],
    };
  }

  @Get(':queueName/jobs/failed')
  async getFailedJobs(@Param('queueName') queueName: string) {
    if (queueName !== INDEXING_QUEUE) {
      return { data: [] };
    }
    const jobs = await this.queue.getJobs(['failed'], 0, 50, true);
    return {
      data: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
        data: job.data,
      })),
    };
  }
}
