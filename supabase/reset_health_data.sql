-- Reset all health data for all users to 0
-- This will clear all existing health data entries
-- Run this script to reset activity data for testing purposes

-- Delete all health data entries
DELETE FROM health_data;

-- Optional: Reset all user journey progress to 0
-- Uncomment the lines below if you also want to reset journey progress
-- UPDATE user_journeys SET current_distance = 0 WHERE is_active = true;

-- Verify the reset (optional - you can run this to check)
-- SELECT COUNT(*) as remaining_health_data_entries FROM health_data;
-- Should return 0 if reset was successful

