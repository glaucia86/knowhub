import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  KnowledgeEntryDetailEnvelopeResponse,
  KnowledgeEntryEnvelopeResponse,
} from '@knowhub/shared-types';
import { createKnowledgeTestContext } from './knowledge.int-test.utils';

async function testDetailCounts(): Promise<void> {
  const context = await createKnowledgeTestContext();

  try {
    const createResponse = await context.request.post('/api/v1/knowledge').send({
      type: 'NOTE',
      content: 'Detalhe com chunks e conexoes.',
    });
    const entryId = (createResponse.body as KnowledgeEntryEnvelopeResponse).data.id;

    await context.insertEntry({
      id: 'entry-related',
      userId: 'user-1',
      type: 'NOTE',
      title: 'Relacionada',
      content: 'Outra nota',
      status: 'INDEXED',
    });
    await context.insertChunk(entryId);
    await context.insertChunk(entryId, 'chunk secundario');
    await context.insertConnection(entryId, 'entry-related');

    const response = await context.request.get(`/api/v1/knowledge/${entryId}`);
    const payload = response.body as KnowledgeEntryDetailEnvelopeResponse;

    assert.equal(response.status, 200);
    assert.equal(payload.data.userId, 'user-1');
    assert.equal(payload.data.contentChunkCount, 2);
    assert.equal(payload.data.relatedConnectionCount, 1);
    assert.ok(payload.data.accessedAt);
  } finally {
    await context.cleanup();
  }
}

test('returns detail with chunk and connection counts', testDetailCounts);
