import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildPaginationMeta,
  createNoteTitle,
  normalizeSearchText,
  normalizeTagList,
  toIsoDate,
  trimToUndefined,
} from './knowledge.helpers';

describe('knowledge.helpers', () => {
  it('normalizes diacritics and case for search', () => {
    assert.equal(normalizeSearchText('Inteligência Artificial'), 'inteligencia artificial');
  });

  it('normalizes and deduplicates tags', () => {
    assert.deepEqual(normalizeTagList(['TypeScript', 'typescript', ' NestJS ']), [
      'typescript',
      'nestjs',
    ]);
  });

  it('truncates note titles without breaking the word when possible', () => {
    const title = createNoteTitle(
      'Arquitetura orientada a eventos para sistemas locais privados com observabilidade simples',
    );

    assert.ok(title.length <= 80);
    assert.equal(title.endsWith(' '), false);
  });

  it('returns zero totalPages when pagination total is zero', () => {
    assert.deepEqual(buildPaginationMeta(1, 20, 0), {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
  });

  it('converts nullable helpers consistently', () => {
    assert.equal(toIsoDate(null), undefined);
    assert.equal(trimToUndefined('   '), undefined);
    assert.equal(trimToUndefined(' value '), 'value');
  });

  it('falls back to hard truncation when there is no safe word breakpoint', () => {
    const title = createNoteTitle(
      'supercalifragilisticexpialidocioussupercalifragilisticexpialidocious',
    );
    assert.ok(title.length <= 80);
  });
});
