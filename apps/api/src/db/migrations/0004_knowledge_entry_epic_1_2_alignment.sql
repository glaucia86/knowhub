DROP INDEX IF EXISTS `ix_knowledge_entries_user_created_id`;
CREATE INDEX IF NOT EXISTS `ix_knowledge_entries_user_created_id`
ON `knowledge_entries` (`user_id`, `created_at` DESC, `id` DESC);

CREATE INDEX IF NOT EXISTS `ix_entry_tags_entry_id`
ON `entry_tags` (`entry_id`);

CREATE INDEX IF NOT EXISTS `ix_tags_user_name`
ON `tags` (`user_id`, `name`);

CREATE INDEX IF NOT EXISTS `ix_knowledge_entries_status`
ON `knowledge_entries` (`user_id`, `status`);

CREATE INDEX IF NOT EXISTS `ix_knowledge_entries_type`
ON `knowledge_entries` (`user_id`, `type`);

CREATE INDEX IF NOT EXISTS `knowledge_title_fts`
ON `knowledge_entries` (`title`);

ALTER TABLE `maintenance_jobs` ADD COLUMN `user_id` text REFERENCES `users`(`id`) ON DELETE cascade;
ALTER TABLE `maintenance_jobs` ADD COLUMN `entry_id` text REFERENCES `knowledge_entries`(`id`) ON DELETE cascade;
