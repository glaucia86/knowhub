import type { PaginationMeta } from '@knowhub/shared-types';

export function normalizeSearchText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export function buildFtsMatchQuery(value: string | null | undefined): string | undefined {
  const normalized = normalizeSearchText(value);
  if (normalized.length === 0) {
    return undefined;
  }

  const tokens = normalized.split(' ').filter((token) => token.length > 0);
  if (tokens.length === 0) {
    return undefined;
  }

  return tokens.map((token) => `"${token.replace(/"/g, '""')}"`).join(' AND ');
}
