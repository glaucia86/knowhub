UPDATE knowledge_entries
SET status = CASE status
  WHEN 'active' THEN 'INDEXED'
  WHEN 'archived' THEN 'ARCHIVED'
  WHEN 'processing' THEN 'PENDING'
  WHEN 'failed' THEN 'FAILED'
  ELSE status
END;

CREATE TABLE IF NOT EXISTS `entry_tags` (
  `entry_id` text NOT NULL,
  `tag_id` text NOT NULL,
  FOREIGN KEY (`entry_id`) REFERENCES `knowledge_entries`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX IF NOT EXISTS `ux_entry_tags_entry_tag`
ON `entry_tags` (`entry_id`, `tag_id`);
