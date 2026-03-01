CREATE TABLE `users` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `created_at` integer NOT NULL DEFAULT (unixepoch() * 1000),
  `updated_at` integer NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

CREATE TABLE `user_settings` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `ai_provider` text NOT NULL,
  `ai_model` text NOT NULL,
  `embedding_model` text NOT NULL,
  `privacy_mode` integer NOT NULL DEFAULT true,
  `language` text NOT NULL DEFAULT 'pt-BR',
  `telegram_enabled` integer NOT NULL DEFAULT false,
  `telegram_token` text,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX `user_settings_user_id_unique` ON `user_settings` (`user_id`);
CREATE UNIQUE INDEX `ux_user_settings_user` ON `user_settings` (`user_id`);

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
  CONSTRAINT `ck_entry_source_or_content` CHECK ("knowledge_entries"."content" IS NOT NULL OR "knowledge_entries"."source_url" IS NOT NULL)
);

CREATE TABLE `content_chunks` (
  `id` text PRIMARY KEY NOT NULL,
  `entry_id` text NOT NULL,
  `chunk_index` integer NOT NULL,
  `content` text NOT NULL,
  `token_count` integer NOT NULL,
  `embedding` text,
  FOREIGN KEY (`entry_id`) REFERENCES `knowledge_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX `ux_content_chunk_entry_idx` ON `content_chunks` (`entry_id`, `chunk_index`);

CREATE TABLE `tags` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `user_id` text NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX `ux_tag_name_user` ON `tags` (`name`, `user_id`);

CREATE TABLE `connection_edges` (
  `id` text PRIMARY KEY NOT NULL,
  `source_id` text NOT NULL,
  `target_id` text NOT NULL,
  `similarity` real NOT NULL,
  `type` text NOT NULL,
  `created_at` integer NOT NULL DEFAULT (unixepoch() * 1000),
  FOREIGN KEY (`source_id`) REFERENCES `knowledge_entries`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`target_id`) REFERENCES `knowledge_entries`(`id`) ON UPDATE no action ON DELETE cascade,
  CONSTRAINT `ck_edge_not_self` CHECK ("connection_edges"."source_id" <> "connection_edges"."target_id"),
  CONSTRAINT `ck_edge_similarity` CHECK ("connection_edges"."similarity" >= 0 AND "connection_edges"."similarity" <= 1)
);
CREATE UNIQUE INDEX `ux_edge_source_target` ON `connection_edges` (`source_id`, `target_id`);

CREATE TABLE `maintenance_jobs` (
  `id` text PRIMARY KEY NOT NULL,
  `type` text NOT NULL,
  `status` text NOT NULL,
  `payload` text,
  `result` text,
  `created_at` integer NOT NULL DEFAULT (unixepoch() * 1000),
  `completed_at` integer
);
