-- Backfill users.language to 'en' for rows that existed before the
-- language column was added. Run once before/after restart so any
-- legacy rows have a valid value matching UserLanguageEnum.
UPDATE users
SET language = 'en'
WHERE language IS NULL;
