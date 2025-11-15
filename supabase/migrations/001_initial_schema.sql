-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  unit_preference TEXT DEFAULT 'metric' CHECK (unit_preference IN ('metric', 'imperial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journeys table
CREATE TABLE IF NOT EXISTS journeys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  total_distance INTEGER NOT NULL, -- in meters
  image_url TEXT,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journey_milestones table
CREATE TABLE IF NOT EXISTS journey_milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  distance_from_start INTEGER NOT NULL, -- in meters, cumulative distance from journey start
  order_index INTEGER NOT NULL, -- order in which milestones appear
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_journeys table (tracks user's progress on journeys)
CREATE TABLE IF NOT EXISTS user_journeys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  current_distance INTEGER DEFAULT 0, -- in meters
  is_active BOOLEAN DEFAULT true
);

-- Create health_data table
CREATE TABLE IF NOT EXISTS health_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  steps INTEGER DEFAULT 0,
  distance INTEGER DEFAULT 0, -- in meters
  elevation INTEGER DEFAULT 0, -- in meters
  calories INTEGER,
  source TEXT NOT NULL CHECK (source IN ('google_fit', 'samsung_health', 'garmin', 'apple_health', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, source)
);

-- Create health_data_sources table (tracks connected health apps)
CREATE TABLE IF NOT EXISTS health_data_sources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('google_fit', 'samsung_health', 'garmin', 'apple_health')),
  is_connected BOOLEAN DEFAULT false,
  last_sync TIMESTAMP WITH TIME ZONE,
  access_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, source_type)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_journey_milestones_journey_id ON journey_milestones(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_milestones_order ON journey_milestones(journey_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_journeys_user_id ON user_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journeys_journey_id ON user_journeys(journey_id);
CREATE INDEX IF NOT EXISTS idx_user_journeys_active ON user_journeys(user_id, is_active) WHERE is_active = true;

-- Create partial unique index to ensure only one active journey per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_journeys_one_active 
  ON user_journeys(user_id) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_health_data_user_id ON health_data(user_id);
CREATE INDEX IF NOT EXISTS idx_health_data_date ON health_data(user_id, date);
CREATE INDEX IF NOT EXISTS idx_health_data_sources_user_id ON health_data_sources(user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist (run this first if you get trigger errors)
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
  DROP TRIGGER IF EXISTS update_health_data_updated_at ON health_data;
  DROP TRIGGER IF EXISTS update_health_data_sources_updated_at ON health_data_sources;
END $$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_data_updated_at BEFORE UPDATE ON health_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_data_sources_updated_at BEFORE UPDATE ON health_data_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data_sources ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  
  -- Journeys policies
  DROP POLICY IF EXISTS "Anyone can view journeys" ON journeys;
  
  -- Journey milestones policies
  DROP POLICY IF EXISTS "Anyone can view journey milestones" ON journey_milestones;
  
  -- User journeys policies
  DROP POLICY IF EXISTS "Users can view own journeys" ON user_journeys;
  DROP POLICY IF EXISTS "Users can insert own journeys" ON user_journeys;
  DROP POLICY IF EXISTS "Users can update own journeys" ON user_journeys;
  DROP POLICY IF EXISTS "Users can delete own journeys" ON user_journeys;
  
  -- Health data policies
  DROP POLICY IF EXISTS "Users can view own health data" ON health_data;
  DROP POLICY IF EXISTS "Users can insert own health data" ON health_data;
  DROP POLICY IF EXISTS "Users can update own health data" ON health_data;
  DROP POLICY IF EXISTS "Users can delete own health data" ON health_data;
  
  -- Health data sources policies
  DROP POLICY IF EXISTS "Users can view own health sources" ON health_data_sources;
  DROP POLICY IF EXISTS "Users can insert own health sources" ON health_data_sources;
  DROP POLICY IF EXISTS "Users can update own health sources" ON health_data_sources;
  DROP POLICY IF EXISTS "Users can delete own health sources" ON health_data_sources;
END $$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Journeys policies (public read, admin write - adjust as needed)
CREATE POLICY "Anyone can view journeys" ON journeys
  FOR SELECT USING (true);

-- Journey milestones policies
CREATE POLICY "Anyone can view journey milestones" ON journey_milestones
  FOR SELECT USING (true);

-- User journeys policies
CREATE POLICY "Users can view own journeys" ON user_journeys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journeys" ON user_journeys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journeys" ON user_journeys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journeys" ON user_journeys
  FOR DELETE USING (auth.uid() = user_id);

-- Health data policies
CREATE POLICY "Users can view own health data" ON health_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data" ON health_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health data" ON health_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health data" ON health_data
  FOR DELETE USING (auth.uid() = user_id);

-- Health data sources policies
CREATE POLICY "Users can view own health sources" ON health_data_sources
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health sources" ON health_data_sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health sources" ON health_data_sources
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health sources" ON health_data_sources
  FOR DELETE USING (auth.uid() = user_id);

-- Insert some sample journeys
INSERT INTO journeys (name, description, total_distance, start_location, end_location, difficulty) VALUES
  ('Mount Everest Base Camp', 'Trek to the base camp of the world''s highest mountain', 130000, 'Lukla, Nepal', 'Everest Base Camp, Nepal', 'hard'),
  ('Pacific Crest Trail', 'Hike the famous trail from Mexico to Canada', 4265000, 'Campo, California', 'Manning Park, British Columbia', 'extreme'),
  ('Appalachian Trail', 'Complete the iconic East Coast trail', 3500000, 'Springer Mountain, Georgia', 'Mount Katahdin, Maine', 'extreme'),
  ('Cross Country USA', 'Walk across the United States', 4500000, 'New York, NY', 'Los Angeles, CA', 'extreme'),
  ('Camino de Santiago', 'The famous pilgrimage route in Spain', 780000, 'Saint-Jean-Pied-de-Port, France', 'Santiago de Compostela, Spain', 'medium'),
  ('Great Wall of China', 'Walk along the Great Wall', 21000000, 'Shanhai Pass', 'Jiayuguan Pass', 'extreme'),
  ('London to Paris', 'Walk from London to Paris', 350000, 'London, UK', 'Paris, France', 'medium'),
  ('Tokyo Marathon Route', 'Complete the Tokyo Marathon distance 10 times', 421950, 'Tokyo, Japan', 'Tokyo, Japan', 'easy')
ON CONFLICT DO NOTHING;

