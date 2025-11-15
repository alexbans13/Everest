-- Add DELETE policies for user data tables
-- Run this script to add the missing DELETE policies that allow users to delete their own data

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can delete own journeys" ON user_journeys;
DROP POLICY IF EXISTS "Users can delete own health data" ON health_data;
DROP POLICY IF EXISTS "Users can delete own health sources" ON health_data_sources;

-- User journeys DELETE policy
CREATE POLICY "Users can delete own journeys" ON user_journeys
  FOR DELETE USING (auth.uid() = user_id);

-- Health data DELETE policy
CREATE POLICY "Users can delete own health data" ON health_data
  FOR DELETE USING (auth.uid() = user_id);

-- Health data sources DELETE policy
CREATE POLICY "Users can delete own health sources" ON health_data_sources
  FOR DELETE USING (auth.uid() = user_id);

