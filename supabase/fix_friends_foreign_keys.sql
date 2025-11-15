-- Fix friends table foreign keys to reference profiles instead of auth.users
-- This script updates the existing friends table if it was created with the wrong foreign keys

-- Drop existing foreign key constraints if they exist
DO $$
BEGIN
  -- Drop foreign key constraint on user_id if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'friends_user_id_fkey' 
    AND table_name = 'friends'
  ) THEN
    ALTER TABLE friends DROP CONSTRAINT friends_user_id_fkey;
  END IF;

  -- Drop foreign key constraint on friend_id if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'friends_friend_id_fkey' 
    AND table_name = 'friends'
  ) THEN
    ALTER TABLE friends DROP CONSTRAINT friends_friend_id_fkey;
  END IF;
END $$;

-- Add new foreign key constraints referencing profiles
ALTER TABLE friends 
  ADD CONSTRAINT friends_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE friends 
  ADD CONSTRAINT friends_friend_id_fkey 
  FOREIGN KEY (friend_id) REFERENCES profiles(id) ON DELETE CASCADE;

