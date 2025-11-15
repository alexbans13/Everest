-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Journeys table
CREATE TABLE IF NOT EXISTS journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  total_distance INTEGER NOT NULL, -- in meters
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  distance_from_start INTEGER NOT NULL, -- in meters
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- User journeys table
CREATE TABLE IF NOT EXISTS user_journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  distance_traveled INTEGER DEFAULT 0 NOT NULL, -- in meters
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- User milestones table
CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  user_journey_id UUID NOT NULL REFERENCES user_journeys(id) ON DELETE CASCADE,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, milestone_id, user_journey_id)
);

-- Health sources table
CREATE TABLE IF NOT EXISTS health_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('google_fit', 'samsung_health', 'apple_health')),
  is_active BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_journey_id ON milestones(journey_id);
CREATE INDEX IF NOT EXISTS idx_user_journeys_user_id ON user_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journeys_journey_id ON user_journeys(journey_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id ON user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_journey_id ON user_milestones(user_journey_id);
CREATE INDEX IF NOT EXISTS idx_health_sources_user_id ON health_sources(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for journeys (public read)
CREATE POLICY "Anyone can view journeys"
  ON journeys FOR SELECT
  USING (true);

-- RLS Policies for milestones (public read)
CREATE POLICY "Anyone can view milestones"
  ON milestones FOR SELECT
  USING (true);

-- RLS Policies for user_journeys
CREATE POLICY "Users can view their own journeys"
  ON user_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journeys"
  ON user_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journeys"
  ON user_journeys FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_milestones
CREATE POLICY "Users can view their own milestones"
  ON user_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones"
  ON user_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for health_sources
CREATE POLICY "Users can view their own health sources"
  ON health_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health sources"
  ON health_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health sources"
  ON health_sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health sources"
  ON health_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

