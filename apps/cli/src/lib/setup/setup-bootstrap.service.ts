import { randomUUID } from 'node:crypto';
import Database from 'better-sqlite3';

export class SetupBootstrapService {
  bootstrap(databasePath: string, userName: string): void {
    const sqlite = new Database(databasePath);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    const existing = sqlite
      .prepare('SELECT id FROM users WHERE email = ? LIMIT 1')
      .get('local@knowhub.local') as { id: string } | undefined;

    const userId = existing?.id ?? randomUUID();

    if (!existing) {
      sqlite
        .prepare(
          'INSERT INTO users (id, name, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        )
        .run(userId, userName, 'local@knowhub.local', Date.now(), Date.now());
    } else {
      sqlite
        .prepare('UPDATE users SET name = ?, updated_at = ? WHERE id = ?')
        .run(userName, Date.now(), userId);
    }

    const existingSettings = sqlite
      .prepare('SELECT id FROM user_settings WHERE user_id = ? LIMIT 1')
      .get(userId) as { id: string } | undefined;

    if (!existingSettings) {
      sqlite
        .prepare(
          `INSERT INTO user_settings
            (id, user_id, ai_provider, ai_model, embedding_model, privacy_mode, language, telegram_enabled)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(randomUUID(), userId, 'ollama', 'gemma3:4b', 'nomic-embed-text', 1, 'pt-BR', 0);
    }

    sqlite.close();
  }
}
