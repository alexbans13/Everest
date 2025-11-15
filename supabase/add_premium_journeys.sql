-- Add is_premium column to journeys table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journeys' AND column_name = 'is_premium') THEN
        ALTER TABLE journeys ADD COLUMN is_premium BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Mark specific journeys as premium
UPDATE journeys 
SET is_premium = true
WHERE name IN ('Great Wall of China', 'Pacific Crest Trail');

