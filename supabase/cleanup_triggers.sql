-- Run this script FIRST if you get trigger or policy errors
-- This will safely remove all triggers and policies before recreating them

-- Drop triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_health_data_updated_at ON health_data;
DROP TRIGGER IF EXISTS update_health_data_sources_updated_at ON health_data_sources;

-- Drop policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view journeys" ON journeys;
DROP POLICY IF EXISTS "Anyone can view journey milestones" ON journey_milestones;
DROP POLICY IF EXISTS "Users can view own journeys" ON user_journeys;
DROP POLICY IF EXISTS "Users can insert own journeys" ON user_journeys;
DROP POLICY IF EXISTS "Users can update own journeys" ON user_journeys;
DROP POLICY IF EXISTS "Users can view own health data" ON health_data;
DROP POLICY IF EXISTS "Users can insert own health data" ON health_data;
DROP POLICY IF EXISTS "Users can update own health data" ON health_data;
DROP POLICY IF EXISTS "Users can view own health sources" ON health_data_sources;
DROP POLICY IF EXISTS "Users can insert own health sources" ON health_data_sources;
DROP POLICY IF EXISTS "Users can update own health sources" ON health_data_sources;

