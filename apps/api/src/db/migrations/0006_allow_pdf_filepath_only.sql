PRAGMA foreign_keys = OFF;

ALTER TABLE `knowledge_entries` RENAME TO `knowledge_entries__old`;

CREATE TABLE `knowledge_entries` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `type` text NOT NULL,
  `title` text NOT NULL,
  `content` text,
  `source_url` text,
  `file_path` text,
  `summary` text,
  `status` text NOT NULL,
  `created_at` integer NOT NULL DEFAULT (unixepoch() * 1000),
  `updated_at` integer NOT NULL DEFAULT (unixepoch() * 1000),
  `accessed_at` integer,
  `archived_at` integer,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  CONSTRAINT `ck_entry_source_or_content` CHECK (
    `content` IS NOT NULL OR `source_url` IS NOT NULL OR `file_path` IS NOT NULL
  )
);

INSERT INTO `knowledge_entries` (
  `id`,
  `user_id`,
  `type`,
  `title`,
  `content`,
  `source_url`,
  `file_path`,
  `summary`,
  `status`,
  `created_at`,
  `updated_at`,
  `accessed_at`,
  `archived_at`
)
SELECT
  `id`,
  `user_id`,
  `type`,
  `title`,
  `content`,
  `source_url`,
  `file_path`,
  `summary`,
  `status`,
  `created_at`,
  `updated_at`,
  `accessed_at`,
  `archived_at`
FROM `knowledge_entries__old`;

ALTER TABLE `content_chunks` RENAME TO `content_chunks__old`;
CREATE TABLE `content_chunks` (
  `id` text PRIMARY KEY NOT NULL,
  `entry_id` text NOT NULL,
  `chunk_index` integer NOT NULL,
  `content` text NOT NULL,
  `token_count` integer NOT NULL,
  `embedding` text,
  `embedding_model` text,
  FOREIGN KEY (`entry_id`) REFERENCES `knowledge_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO `content_chunks` (
  `id`,
  `entry_id`,
  `chunk_index`,
  `content`,
  `token_count`,
  `embedding`,
  `embedding_model`
)
SELECT
  `id`,
  `entry_id`,
  `chunk_index`,
  `content`,
  `token_count`,
  `embedding`,
  `embedding_model`
FROM `content_chunks__old`;
DROP TABLE `content_chunks__old`;
CREATE UNIQUE INDEX IF NOT EXISTS `ux_content_chunk_entry_idx`
ON `content_chunks` (`entry_id`, `chunk_index`);

ALTER TABLE `entry_tags` RENAME TO `entry_tags__old`;
CREATE TABLE `entry_tags` (
  `entry_id` text NOT NULL,
  `tag_id` text NOT NULL,
  FOREIGN KEY (`entry_id`) REFERENCES `knowledge_entries`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO `entry_tags` (`entry_id`, `tag_id`)
SELECT `entry_id`, `tag_id`
FROM `entry_tags__old`;
DROP TABLE `entry_tags__old`;
CREATE UNIQUE INDEX IF NOT EXISTS `ux_entry_tags_entry_tag`
ON `entry_tags` (`entry_id`, `tag_id`);
CREATE INDEX IF NOT EXISTS `ix_entry_tags_entry_id`
ON `entry_tags` (`entry_id`);

ALTER TABLE `connection_edges` RENAME TO `connection_edges__old`;
CREATE TABLE `connection_edges` (
  `id` text PRIMARY KEY NOT NULL,
  `source_id` text NOT NULL,
  `target_id` text NOT NULL,
  `similarity` real NOT NULL,
  `type` text NOT NULL,
  `created_at` integer NOT NULL DEFAULT (unixepoch() * 1000),
  FOREIGN KEY (`source_id`) REFERENCES `knowledge_entries`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`target_id`) REFERENCES `knowledge_entries`(`id`) ON UPDATE no action ON DELETE cascade,
  CONSTRAINT `ck_edge_not_self` CHECK (`source_id` <> `target_id`),
  CONSTRAINT `ck_edge_similarity` CHECK (`similarity` >= 0 AND `similarity` <= 1)
);
INSERT INTO `connection_edges` (
  `id`,
  `source_id`,
  `target_id`,
  `similarity`,
  `type`,
  `created_at`
)
SELECT
  `id`,
  `source_id`,
  `target_id`,
  `similarity`,
  `type`,
  `created_at`
FROM `connection_edges__old`;
DROP TABLE `connection_edges__old`;
CREATE UNIQUE INDEX IF NOT EXISTS `ux_edge_source_target`
ON `connection_edges` (`source_id`, `target_id`);

ALTER TABLE `maintenance_jobs` RENAME TO `maintenance_jobs__old`;
CREATE TABLE `maintenance_jobs` (
  `id` text PRIMARY KEY NOT NULL,
  `type` text NOT NULL,
  `status` text NOT NULL,
  `user_id` text REFERENCES `users`(`id`) ON DELETE cascade,
  `entry_id` text REFERENCES `knowledge_entries`(`id`) ON DELETE cascade,
  `payload` text,
  `result` text,
  `created_at` integer NOT NULL DEFAULT (unixepoch() * 1000),
  `completed_at` integer
);
INSERT INTO `maintenance_jobs` (
  `id`,
  `type`,
  `status`,
  `user_id`,
  `entry_id`,
  `payload`,
  `result`,
  `created_at`,
  `completed_at`
)
SELECT
  `id`,
  `type`,
  `status`,
  `user_id`,
  `entry_id`,
  `payload`,
  `result`,
  `created_at`,
  `completed_at`
FROM `maintenance_jobs__old`;
DROP TABLE `maintenance_jobs__old`;

DROP TABLE `knowledge_entries__old`;

CREATE INDEX IF NOT EXISTS `ix_knowledge_entries_user_created_id`
ON `knowledge_entries` (`user_id`, `created_at` DESC, `id` DESC);

CREATE INDEX IF NOT EXISTS `ix_knowledge_entries_status`
ON `knowledge_entries` (`user_id`, `status`);

CREATE INDEX IF NOT EXISTS `ix_knowledge_entries_type`
ON `knowledge_entries` (`user_id`, `type`);

DROP TRIGGER IF EXISTS `knowledge_entries_fts_ai`;
DROP TRIGGER IF EXISTS `knowledge_entries_fts_au`;
DROP TRIGGER IF EXISTS `knowledge_entries_fts_ad`;

CREATE TRIGGER IF NOT EXISTS `knowledge_entries_fts_ai`
AFTER INSERT ON `knowledge_entries`
BEGIN
  INSERT INTO `knowledge_title_fts` (`entry_id`, `user_id`, `title`, `content`)
  VALUES (new.`id`, new.`user_id`, coalesce(new.`title`, ''), coalesce(new.`content`, ''));
END;

CREATE TRIGGER IF NOT EXISTS `knowledge_entries_fts_au`
AFTER UPDATE OF `title`, `content`, `user_id` ON `knowledge_entries`
BEGIN
  DELETE FROM `knowledge_title_fts` WHERE `entry_id` = old.`id`;
  INSERT INTO `knowledge_title_fts` (`entry_id`, `user_id`, `title`, `content`)
  VALUES (new.`id`, new.`user_id`, coalesce(new.`title`, ''), coalesce(new.`content`, ''));
END;

CREATE TRIGGER IF NOT EXISTS `knowledge_entries_fts_ad`
AFTER DELETE ON `knowledge_entries`
BEGIN
  DELETE FROM `knowledge_title_fts` WHERE `entry_id` = old.`id`;
END;

PRAGMA foreign_keys = ON;
