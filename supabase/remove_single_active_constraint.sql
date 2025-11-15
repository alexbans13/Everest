-- Remove the unique constraint that limits users to one active journey
-- This allows users to have multiple active journeys simultaneously

DROP INDEX IF EXISTS idx_user_journeys_one_active;

