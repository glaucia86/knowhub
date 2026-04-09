import { eq } from 'drizzle-orm';
import { getDatabaseClient } from './database.client';
import {
  connectionEdges,
  contentChunks,
  entryTags,
  knowledgeEntries,
  maintenanceJobs,
  tags,
  userSettings,
  users,
} from './schema';

export interface SeedSummary {
  users: number;
  entries: number;
  edges: number;
}

export function runDevelopmentSeed(): SeedSummary {
  const { db } = getDatabaseClient();

  const adminUserId = 'dev-user-1';
  const now = new Date();

  const existingUser = db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, adminUserId))
    .get();
  if (!existingUser) {
    db.insert(users)
      .values({
        id: adminUserId,
        name: 'KnowHub Dev',
        email: 'dev@knowhub.local',
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }

  db.insert(userSettings)
    .values({
      id: 'dev-settings-1',
      userId: adminUserId,
      aiProvider: process.env.LOCAL_AI_PROVIDER ?? 'ollama',
      aiModel: process.env.OLLAMA_DEFAULT_MODEL ?? 'qwen2.5:3b',
      embeddingModel: 'nomic-embed-text',
      privacyMode: true,
      language: 'pt-BR',
      telegramEnabled: false,
    })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: {
        aiProvider: process.env.LOCAL_AI_PROVIDER ?? 'ollama',
        aiModel: process.env.OLLAMA_DEFAULT_MODEL ?? 'qwen2.5:3b',
        embeddingModel: 'nomic-embed-text',
      },
    })
    .run();

  const entriesToSeed = [
    {
      id: 'entry-note-1',
      type: 'NOTE' as const,
      title: 'Best practices for integration',
      content: 'Local flow with env setup, compose up, and database bootstrap.',
      status: 'INDEXED' as const,
    },
    {
      id: 'entry-link-1',
      type: 'LINK' as const,
      title: 'NestJS docs',
      sourceUrl: 'https://docs.nestjs.com',
      content: 'Reference for controllers and modules.',
      status: 'INDEXED' as const,
    },
    {
      id: 'entry-pdf-1',
      type: 'PDF' as const,
      title: 'PRD EPIC-0.3',
      filePath: 'docs-specs/PRD-EPIC-0.3.md',
      content: 'Scope of the local onboarding.',
      status: 'INDEXED' as const,
    },
  ];

  for (const entry of entriesToSeed) {
    db.insert(knowledgeEntries)
      .values({
        id: entry.id,
        userId: adminUserId,
        type: entry.type,
        title: entry.title,
        content: entry.content,
        sourceUrl: entry.sourceUrl,
        filePath: entry.filePath,
        summary: null,
        status: entry.status,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .run();
  }

  db.insert(contentChunks)
    .values({
      id: 'chunk-note-1-0',
      entryId: 'entry-note-1',
      chunkIndex: 0,
      content: 'Local flow with env setup, compose up, and database bootstrap.',
      tokenCount: 16,
      embedding: null,
    })
    .onConflictDoNothing()
    .run();

  db.insert(tags)
    .values({
      id: 'tag-onboarding',
      name: 'onboarding',
      userId: adminUserId,
    })
    .onConflictDoNothing()
    .run();

  db.insert(entryTags)
    .values({
      entryId: 'entry-note-1',
      tagId: 'tag-onboarding',
    })
    .onConflictDoNothing()
    .run();

  db.insert(connectionEdges)
    .values({
      id: 'edge-1',
      sourceId: 'entry-note-1',
      targetId: 'entry-link-1',
      similarity: 0.79,
      type: 'reference',
      createdAt: now,
    })
    .onConflictDoNothing()
    .run();

  db.insert(maintenanceJobs)
    .values({
      id: 'job-initial-index',
      type: 'REINDEX',
      status: 'completed',
      payload: JSON.stringify({ reason: 'initial-seed' }),
      result: JSON.stringify({ chunksIndexed: 1 }),
      createdAt: now,
      completedAt: now,
    })
    .onConflictDoNothing()
    .run();

  return { users: 1, entries: entriesToSeed.length, edges: 1 };
}

if (require.main === module) {
  const result = runDevelopmentSeed();
  console.log(`[db:seed] users=${result.users} entries=${result.entries} edges=${result.edges}`);
}
