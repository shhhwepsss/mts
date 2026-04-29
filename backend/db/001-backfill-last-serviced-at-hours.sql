-- Backfill null last_serviced_at_hours to 0 before TypeORM synchronize
-- applies the NOT NULL constraint on maintenance_tasks.last_serviced_at_hours.
-- Run once, then restart the backend.
UPDATE maintenance_tasks
SET last_serviced_at_hours = 0
WHERE last_serviced_at_hours IS NULL;
