-- Add friends functionality to the database
-- This script creates the friends table and relationships

-- Create friends table to track friend relationships
CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Create index for faster friend lookups
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(user_id, status);

-- Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Update profiles RLS to allow searching (users can view other users' profiles for friend search)
DO $$
BEGIN
  -- Allow users to view other users' profiles for friend search
  DROP POLICY IF EXISTS "Users can view other profiles for search" ON profiles;
  CREATE POLICY "Users can view other profiles for search" ON profiles
    FOR SELECT USING (true); -- Allow public read for friend search functionality
END $$;

-- RLS Policies for friends
DO $$
BEGIN
  -- Users can view their own friend relationships
  DROP POLICY IF EXISTS "Users can view own friends" ON friends;
  CREATE POLICY "Users can view own friends" ON friends
    FOR SELECT USING (auth.uid()::text = user_id::text OR auth.uid()::text = friend_id::text);

  -- Users can create friend requests
  DROP POLICY IF EXISTS "Users can create friend requests" ON friends;
  CREATE POLICY "Users can create friend requests" ON friends
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

  -- Users can update their own friend relationships
  DROP POLICY IF EXISTS "Users can update own friends" ON friends;
  CREATE POLICY "Users can update own friends" ON friends
    FOR UPDATE USING (auth.uid()::text = user_id::text OR auth.uid()::text = friend_id::text);

  -- Users can delete their own friend relationships
  DROP POLICY IF EXISTS "Users can delete own friends" ON friends;
  CREATE POLICY "Users can delete own friends" ON friends
    FOR DELETE USING (auth.uid()::text = user_id::text OR auth.uid()::text = friend_id::text);
END $$;

