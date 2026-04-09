ALTER TABLE `knowledge_entries`
ADD COLUMN `last_error` text;

CREATE TABLE IF NOT EXISTS `indexing_checkpoints` (
  `id` text PRIMARY KEY NOT NULL,
  `entry_id` text NOT NULL REFERENCES `knowledge_entries`(`id`) ON DELETE CASCADE,
  `thread_id` text NOT NULL UNIQUE,
  `checkpoint` text NOT NULL,
  `step` text NOT NULL,
  `created_at` integer NOT NULL DEFAULT (unixepoch() * 1000),
  `updated_at` integer NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE UNIQUE INDEX IF NOT EXISTS `ux_checkpoint_entry`
ON `indexing_checkpoints` (`entry_id`);
