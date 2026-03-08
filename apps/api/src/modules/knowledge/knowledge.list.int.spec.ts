import assert from 'node:assert/strict';
import type { KnowledgeEntryListResponse } from '@knowhub/shared-types';
import { createKnowledgeTestContext } from './knowledge.int-test.utils';

async function testNormalizedSearch(): Promise<void> {
  const context = await createKnowledgeTestContext();

  try {
    const created = await context.request.post('/api/v1/knowledge').send({
      type: 'NOTE',
      content: 'Cafe com arquitetura modular e busca textual.',
      tags: ['backend'],
    });
    assert.equal(created.status, 201);

    await context.request.post('/api/v1/knowledge').send({
      type: 'LINK',
      sourceUrl: 'https://docs.nestjs.com',
      tags: ['docs'],
    });

    await context.insertUser('user-2');
    await context.insertEntry({
      id: 'foreign-entry',
      userId: 'user-2',
      type: 'NOTE',
      title: 'Cafe externo',
      content: 'Nao deve aparecer na listagem de outro usuario.',
      status: 'INDEXED',
    });

    const response = await context.request.get('/api/v1/knowledge?q=café&tag=backend');
    const payload = response.body as KnowledgeEntryListResponse;

    assert.equal(response.status, 200);
    assert.equal(payload.meta.total, 1);
    assert.equal(payload.data[0]?.userId, 'user-1');
    assert.match(payload.data[0]?.title ?? '', /Cafe com arquitetura/i);
    assert.equal('content' in (payload.data[0] ?? {}), false);
  } finally {
    await context.cleanup();
  }
}

void testNormalizedSearch().catch((error: unknown) => {
  process.stderr.write(`${String(error)}\n`);
  process.exitCode = 1;
});
