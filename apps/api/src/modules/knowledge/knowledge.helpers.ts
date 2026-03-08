import { buildPaginationMeta, normalizeSearchText } from '@knowhub/shared-utils';
import { isSafeRelativeFilePath } from './safe-file-path.validator';

export function normalizeTagName(value: string): string {
  return normalizeSearchText(value);
}

export function normalizeTagList(values: string[] | undefined): string[] {
  if (!values) {
    return [];
  }

  return Array.from(
    new Set(values.map((value) => normalizeTagName(value)).filter((value) => value.length > 0)),
  );
}

export function toIsoDate(value: Date | null | undefined): string | undefined {
  return value ? value.toISOString() : undefined;
}

export function trimToUndefined(value: string | null | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function createNoteTitle(content: string): string {
  const firstLine = content.split(/\r?\n/u)[0]?.trim() ?? '';
  if (firstLine.length <= 80) {
    return firstLine;
  }

  const truncated = firstLine.slice(0, 80);
  const safeBreakpoint = truncated.lastIndexOf(' ');
  return (safeBreakpoint > 20 ? truncated.slice(0, safeBreakpoint) : truncated).trim();
}

export { buildPaginationMeta, normalizeSearchText };
export { isSafeRelativeFilePath };
