-- Initialize health_data records with 0s for the last 7 days for all users
-- This ensures every user has a record for each day, even if they haven't synced any data yet

-- Get all users
DO $$
DECLARE
  user_record RECORD;
  date_record DATE;
BEGIN
  -- Loop through all users
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Loop through the last 7 days
    FOR i IN 0..6 LOOP
      date_record := CURRENT_DATE - i;
      
      -- Insert a record with 0s if it doesn't exist
      INSERT INTO health_data (user_id, date, steps, distance, calories, source)
      VALUES (user_record.id, date_record, 0, 0, 0, 'manual')
      ON CONFLICT (user_id, date, source) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Verify the initialization (optional - you can run this to check)
-- SELECT 
--   user_id,
--   date,
--   steps,
--   distance,
--   calories,
--   source
-- FROM health_data
-- WHERE date >= CURRENT_DATE - 6
-- ORDER BY user_id, date DESC;

