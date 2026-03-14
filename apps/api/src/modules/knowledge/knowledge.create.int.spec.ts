import assert from 'node:assert/strict';
import test from 'node:test';
import type { KnowledgeEntryEnvelopeResponse } from '@knowhub/shared-types';
import { createKnowledgeTestContext } from './knowledge.int-test.utils';

async function testCreateEntry(): Promise<void> {
  const context = await createKnowledgeTestContext();

  try {
    const response = await context.request.post('/api/v1/knowledge').send({
      type: 'NOTE',
      content: 'Cafe com arquitetura para busca acentuada.',
      tags: ['Backend', ' backend ', 'Docs'],
    });
    const payload = response.body as KnowledgeEntryEnvelopeResponse;

    assert.equal(response.status, 201);
    assert.equal(payload.data.userId, 'user-1');
    assert.equal(payload.data.type, 'NOTE');
    assert.equal(payload.data.title, 'Cafe com arquitetura para busca acentuada.');
    assert.deepEqual(payload.data.tags, ['backend', 'docs']);
    assert.ok(payload.data.id);

    const jobs = await context.findMaintenanceJobs(payload.data.id);
    assert.equal(jobs.length, 1);
    assert.equal(jobs[0]?.type, 'entry.created');
    assert.equal(jobs[0]?.status, 'PENDING_STUB');
  } finally {
    await context.cleanup();
  }
}

async function testRejectUnsafeFilePath(): Promise<void> {
  const context = await createKnowledgeTestContext();

  try {
    const response = await context.request.post('/api/v1/knowledge').send({
      type: 'PDF',
      filePath: '../secret.pdf',
    });

    assert.equal(response.status, 400);
  } finally {
    await context.cleanup();
  }
}

async function testCreatePdfWithFilePathOnly(): Promise<void> {
  const context = await createKnowledgeTestContext();

  try {
    const response = await context.request.post('/api/v1/knowledge').send({
      type: 'PDF',
      filePath: 'docs/architecture.pdf',
    });
    const payload = response.body as KnowledgeEntryEnvelopeResponse;

    assert.equal(response.status, 201);
    assert.equal(payload.data.type, 'PDF');
    assert.equal(payload.data.filePath, 'docs/architecture.pdf');
  } finally {
    await context.cleanup();
  }
}

async function testBusinessValidationReturns422(): Promise<void> {
  const context = await createKnowledgeTestContext();

  try {
    const response = await context.request.post('/api/v1/knowledge').send({
      type: 'NOTE',
      title: 'Only title without content',
    });

    assert.equal(response.status, 422);
  } finally {
    await context.cleanup();
  }
}

test('creates note entry with normalized tags and outbox stub', testCreateEntry);
test('rejects unsafe pdf file path', testRejectUnsafeFilePath);
test('creates pdf entry with only filePath', testCreatePdfWithFilePathOnly);
test('returns 422 for NOTE payload without content', testBusinessValidationReturns422);
