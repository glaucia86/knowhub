ALTER TABLE `content_chunks` ADD COLUMN `embedding_model` text;

CREATE TABLE `refresh_tokens` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `client_id` text NOT NULL,
  `token_hash` text NOT NULL,
  `issued_at` integer NOT NULL,
  `expires_at` integer NOT NULL,
  `revoked_at` integer,
  `replaced_by_token_id` text,
  `revoke_reason` text,
  `created_at` integer NOT NULL DEFAULT (unixepoch() * 1000),
  `updated_at` integer NOT NULL DEFAULT (unixepoch() * 1000),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `ux_refresh_tokens_hash` ON `refresh_tokens` (`token_hash`);
