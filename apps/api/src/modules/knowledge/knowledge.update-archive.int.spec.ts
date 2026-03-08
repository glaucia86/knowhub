import assert from 'node:assert/strict';
import type {
  KnowledgeEntryEnvelopeResponse,
  KnowledgeEntryListResponse,
} from '@knowhub/shared-types';
import { createKnowledgeTestContext } from './knowledge.int-test.utils';

async function testUpdateAndArchive(): Promise<void> {
  const context = await createKnowledgeTestContext();

  try {
    const created = await context.request.post('/api/v1/knowledge').send({
      type: 'NOTE',
      content: 'Nota original para update.',
    });
    const entryId = (created.body as KnowledgeEntryEnvelopeResponse).data.id;

    const updateResponse = await context.request.patch(`/api/v1/knowledge/${entryId}`).send({
      title: 'Updated title',
      tags: ['updated'],
    });
    const updatePayload = updateResponse.body as KnowledgeEntryEnvelopeResponse;

    assert.equal(updateResponse.status, 200);
    assert.equal(updatePayload.data.title, 'Updated title');
    assert.equal(updatePayload.data.status, 'PENDING');
    assert.deepEqual(updatePayload.data.tags, ['updated']);

    const archiveResponse = await context.request.delete(`/api/v1/knowledge/${entryId}`);
    assert.equal(archiveResponse.status, 204);

    const archivedResponse = await context.request.get('/api/v1/knowledge?status=ARCHIVED');
    const archivedPayload = archivedResponse.body as KnowledgeEntryListResponse;

    assert.equal(archivedResponse.status, 200);
    assert.equal(archivedPayload.data[0]?.id, entryId);
    assert.equal(archivedPayload.data[0]?.status, 'ARCHIVED');
  } finally {
    await context.cleanup();
  }
}

void testUpdateAndArchive().catch((error: unknown) => {
  process.stderr.write(`${String(error)}\n`);
  process.exitCode = 1;
});
