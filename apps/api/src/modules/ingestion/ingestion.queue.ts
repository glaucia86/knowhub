export const INGESTION_URL_QUEUE = 'ingestion.url.fetch';

export interface UrlFetchJobPayload {
  entryId: string;
  userId: string;
  url: string;
  title?: string;
}
