-- Add unit_preference column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS unit_preference TEXT DEFAULT 'metric' CHECK (unit_preference IN ('metric', 'imperial'));

-- Update existing records to have 'metric' as default if null
UPDATE profiles 
SET unit_preference = 'metric' 
WHERE unit_preference IS NULL;

