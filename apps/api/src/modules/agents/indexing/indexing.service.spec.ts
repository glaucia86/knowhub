import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { IndexingService } from './indexing.service';

describe('IndexingService drainPendingStubs', () => {
  it('drains pending REINDEX maintenance jobs using requested jobId', async () => {
    const calls: {
      enqueue?: {
        entryId: string;
        userId: string;
        triggeredBy: string;
        priority?: number;
        forcedJobId?: string;
      };
      completed?: { id: string; resultPayload: Record<string, unknown> };
      failed?: { id: string; reason: string };
    } = {};

    const repository = {
      async getPendingEntriesForDrain() {
        return [];
      },
      async getPendingReindexMaintenanceJobs() {
        return [
          {
            id: 'maint-1',
            entryId: 'entry-1',
            userId: 'user-1',
            requestedJobId: 'indexing-entry-1-1710000000002',
          },
        ];
      },
      async markMaintenanceJobRunning() {
        return true;
      },
      async completeMaintenanceJob(id: string, resultPayload: Record<string, unknown>) {
        calls.completed = { id, resultPayload };
      },
      async failMaintenanceJob(id: string, reason: string) {
        calls.failed = { id, reason };
      },
    };

    const service = new IndexingService(
      repository as never,
      {
        on: () => undefined,
        off: () => undefined,
        emit: () => false,
      } as unknown as EventEmitter2,
    );

    (
      service as unknown as {
        enqueueIndexing: (
          entryId: string,
          userId: string,
          triggeredBy: string,
          priority?: number,
          forcedJobId?: string,
        ) => Promise<string | null>;
      }
    ).enqueueIndexing = async (
      entryId: string,
      userId: string,
      triggeredBy: string,
      priority?: number,
      forcedJobId?: string,
    ) => {
      calls.enqueue = { entryId, userId, triggeredBy, priority, forcedJobId };
      return forcedJobId ?? null;
    };

    await (
      service as unknown as {
        drainPendingStubs: () => Promise<void>;
      }
    ).drainPendingStubs();

    assert.deepEqual(calls.enqueue, {
      entryId: 'entry-1',
      userId: 'user-1',
      triggeredBy: 'manual-reindex',
      priority: 1,
      forcedJobId: 'indexing-entry-1-1710000000002',
    });
    assert.deepEqual(calls.completed, {
      id: 'maint-1',
      resultPayload: {
        queuedJobId: 'indexing-entry-1-1710000000002',
        requestedJobId: 'indexing-entry-1-1710000000002',
      },
    });
    assert.equal(calls.failed, undefined);
  });

  it('skips REINDEX maintenance jobs that were already claimed by another worker', async () => {
    let enqueueCalled = false;
    let completedCalled = false;
    let failedCalled = false;

    const repository = {
      async getPendingEntriesForDrain() {
        return [];
      },
      async getPendingReindexMaintenanceJobs() {
        return [
          {
            id: 'maint-2',
            entryId: 'entry-2',
            userId: 'user-2',
            requestedJobId: 'indexing-entry-2-1710000000003',
          },
        ];
      },
      async markMaintenanceJobRunning() {
        return false;
      },
      async completeMaintenanceJob() {
        completedCalled = true;
      },
      async failMaintenanceJob() {
        failedCalled = true;
      },
    };

    const service = new IndexingService(
      repository as never,
      {
        on: () => undefined,
        off: () => undefined,
        emit: () => false,
      } as unknown as EventEmitter2,
    );

    (
      service as unknown as {
        enqueueIndexing: (
          entryId: string,
          userId: string,
          triggeredBy: string,
          priority?: number,
          forcedJobId?: string,
        ) => Promise<string | null>;
      }
    ).enqueueIndexing = async () => {
      enqueueCalled = true;
      return null;
    };

    await (
      service as unknown as {
        drainPendingStubs: () => Promise<void>;
      }
    ).drainPendingStubs();

    assert.equal(enqueueCalled, false);
    assert.equal(completedCalled, false);
    assert.equal(failedCalled, false);
  });
});
