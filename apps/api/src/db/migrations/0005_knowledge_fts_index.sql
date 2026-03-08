DROP INDEX IF EXISTS `knowledge_title_fts`;

CREATE VIRTUAL TABLE IF NOT EXISTS `knowledge_title_fts`
USING fts5(
  entry_id UNINDEXED,
  user_id UNINDEXED,
  title,
  content,
  tokenize = 'unicode61 remove_diacritics 2'
);

INSERT INTO `knowledge_title_fts` (`entry_id`, `user_id`, `title`, `content`)
SELECT `id`, `user_id`, coalesce(`title`, ''), coalesce(`content`, '')
FROM `knowledge_entries`
WHERE NOT EXISTS (
  SELECT 1
  FROM `knowledge_title_fts` fts
  WHERE fts.`entry_id` = `knowledge_entries`.`id`
);

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
