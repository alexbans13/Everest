-- Add category and target_altitude columns to journeys table
-- This allows journeys to be categorized as Distance or Altitude challenges

-- Add category column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journeys' AND column_name = 'category') THEN
        ALTER TABLE journeys ADD COLUMN category TEXT DEFAULT 'distance' CHECK (category IN ('distance', 'altitude'));
    END IF;
END $$;

-- Add target_altitude column for altitude challenges (in meters)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journeys' AND column_name = 'target_altitude') THEN
        ALTER TABLE journeys ADD COLUMN target_altitude INTEGER;
    END IF;
END $$;

-- Update existing journeys with appropriate categories
-- Mount Everest Base Camp - Altitude challenge (5,364m base camp, but we'll use the full summit height for the challenge)
UPDATE journeys 
SET category = 'altitude', 
    target_altitude = 8848  -- Mount Everest summit height in meters
WHERE name = 'Mount Everest Base Camp';

-- Pacific Crest Trail - Distance challenge
UPDATE journeys 
SET category = 'distance',
    target_altitude = NULL
WHERE name = 'Pacific Crest Trail';

-- Appalachian Trail - Distance challenge
UPDATE journeys 
SET category = 'distance',
    target_altitude = NULL
WHERE name = 'Appalachian Trail';

-- Cross Country USA - Distance challenge
UPDATE journeys 
SET category = 'distance',
    target_altitude = NULL
WHERE name = 'Cross Country USA';

-- Camino de Santiago - Distance challenge
UPDATE journeys 
SET category = 'distance',
    target_altitude = NULL
WHERE name = 'Camino de Santiago';

-- Great Wall of China - Distance challenge
UPDATE journeys 
SET category = 'distance',
    target_altitude = NULL
WHERE name = 'Great Wall of China';

-- London to Paris - Distance challenge
UPDATE journeys 
SET category = 'distance',
    target_altitude = NULL
WHERE name = 'London to Paris';

-- Tokyo Marathon Route - Distance challenge
UPDATE journeys 
SET category = 'distance',
    target_altitude = NULL
WHERE name = 'Tokyo Marathon Route';

