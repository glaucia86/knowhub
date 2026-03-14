import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  KnowledgeEntryEnvelopeResponse,
  KnowledgeEntryReindexAcceptedResponse,
} from '@knowhub/shared-types';
import { createKnowledgeTestContext } from './knowledge.int-test.utils';

async function testRestoreAndReindex(): Promise<void> {
  const context = await createKnowledgeTestContext();

  try {
    const created = await context.request.post('/api/v1/knowledge').send({
      type: 'NOTE',
      content: 'Entrada arquivada com chunks.',
    });
    const entryId = (created.body as KnowledgeEntryEnvelopeResponse).data.id;
    await context.insertChunk(entryId);

    const archiveResponse = await context.request.delete(`/api/v1/knowledge/${entryId}`);
    assert.equal(archiveResponse.status, 204);

    const restoreResponse = await context.request.patch(`/api/v1/knowledge/${entryId}`).send({});
    const restorePayload = restoreResponse.body as KnowledgeEntryEnvelopeResponse;

    assert.equal(restoreResponse.status, 200);
    assert.equal(restorePayload.data.status, 'INDEXED');
    assert.equal(restorePayload.data.archivedAt, undefined);

    const reindexResponse = await context.request
      .post(`/api/v1/knowledge/${entryId}/reindex`)
      .send();
    const reindexPayload = reindexResponse.body as KnowledgeEntryReindexAcceptedResponse;

    assert.equal(reindexResponse.status, 202);
    assert.equal(reindexPayload.entryId, entryId);
    assert.equal(reindexPayload.status, 'PENDING_STUB');

    const jobs = await context.findMaintenanceJobs(entryId);
    assert.equal(jobs.length, 2);
    assert.equal(jobs[1]?.type, 'REINDEX');
    assert.equal(jobs[1]?.status, 'PENDING_STUB');

    const conflictResponse = await context.request
      .post(`/api/v1/knowledge/${entryId}/reindex`)
      .send();
    assert.equal(conflictResponse.status, 409);

    const archivedEntry = await context.request.post('/api/v1/knowledge').send({
      type: 'NOTE',
      content: 'Entrada para 422 no reindex.',
    });
    const archivedEntryId = (archivedEntry.body as KnowledgeEntryEnvelopeResponse).data.id;
    await context.request.delete(`/api/v1/knowledge/${archivedEntryId}`);
    const archivedReindexResponse = await context.request
      .post(`/api/v1/knowledge/${archivedEntryId}/reindex`)
      .send();
    assert.equal(archivedReindexResponse.status, 422);
  } finally {
    await context.cleanup();
  }
}

test('restores archived entries and handles manual reindex flow', testRestoreAndReindex);
