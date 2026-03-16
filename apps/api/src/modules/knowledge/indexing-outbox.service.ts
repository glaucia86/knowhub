import { Injectable } from '@nestjs/common';
import type { KnowledgeEventName, MaintenanceJobStatus } from '@knowhub/shared-types';
import { KnowledgeRepository } from './knowledge.repository';

@Injectable()
export class IndexingOutboxService {
  constructor(private readonly knowledgeRepository: KnowledgeRepository) {}

  async enqueueEvent(input: {
    eventName: KnowledgeEventName;
    entryId: string;
    userId: string;
    type?: 'NOTE' | 'LINK' | 'PDF' | 'GITHUB';
    status?: MaintenanceJobStatus;
  }): Promise<string> {
    return this.knowledgeRepository.createMaintenanceJob({
      type: input.eventName,
      status: input.status ?? 'PENDING_STUB',
      entryId: input.entryId,
      userId: input.userId,
      payload: {
        eventName: input.eventName,
        entryId: input.entryId,
        userId: input.userId,
        type: input.type,
      },
    });
  }

  async enqueueReindex(input: { entryId: string; userId: string; jobId: string }): Promise<string> {
    return this.knowledgeRepository.createMaintenanceJob({
      type: 'REINDEX',
      status: 'PENDING_STUB',
      entryId: input.entryId,
      userId: input.userId,
      payload: {
        action: 'REINDEX',
        entryId: input.entryId,
        userId: input.userId,
        jobId: input.jobId,
      },
    });
  }
}
