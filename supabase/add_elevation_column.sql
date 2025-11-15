-- Add elevation column to health_data table
ALTER TABLE health_data 
ADD COLUMN IF NOT EXISTS elevation INTEGER DEFAULT 0; -- in meters

-- Update existing records to have 0 elevation if null
UPDATE health_data 
SET elevation = 0 
WHERE elevation IS NULL;

