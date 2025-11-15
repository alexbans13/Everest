-- Enhance Sarah Johnson's health data and journey progress
-- This script adds more comprehensive health data and updates journey progress
-- Sarah should have reached several milestones on Mount Everest Base Camp journey

DO $$
DECLARE
  sarah_id UUID;
  everest_journey_id UUID;
  user_journey_id UUID;
BEGIN
  -- Get Sarah's user ID
  SELECT id INTO sarah_id FROM auth.users WHERE email = 'sarah.johnson@test.com' LIMIT 1;
  
  IF sarah_id IS NOT NULL THEN
    -- Get Mount Everest Base Camp journey ID
    SELECT id INTO everest_journey_id FROM journeys WHERE name = 'Mount Everest Base Camp' LIMIT 1;
    
    IF everest_journey_id IS NOT NULL THEN
      -- Update user journey with better progress (70km = 70,000m)
      -- This means she's passed Dingboche (65km) but not yet at Lobuche (95km)
      UPDATE user_journeys
      SET 
        current_distance = 70000, -- 70km progress
        started_at = NOW() - INTERVAL '10 days' -- Started 10 days ago
      WHERE user_id = sarah_id AND journey_id = everest_journey_id
      RETURNING id INTO user_journey_id;
      
      -- If no user journey exists, create one
      IF user_journey_id IS NULL THEN
        INSERT INTO user_journeys (user_id, journey_id, current_distance, is_active, started_at)
        VALUES (sarah_id, everest_journey_id, 70000, true, NOW() - INTERVAL '10 days')
        RETURNING id INTO user_journey_id;
      END IF;
      
      -- Add comprehensive health data for the last 10 days
      -- This will show consistent progress over time
      INSERT INTO health_data (user_id, date, steps, distance, elevation, calories, source)
      VALUES
        -- 10 days ago (journey start)
        (sarah_id, CURRENT_DATE - 9, 8200, 6200, 110, 310, 'manual'),
        (sarah_id, CURRENT_DATE - 8, 8900, 6800, 125, 340, 'manual'),
        (sarah_id, CURRENT_DATE - 7, 9500, 7200, 140, 360, 'manual'),
        (sarah_id, CURRENT_DATE - 6, 10200, 7800, 155, 390, 'manual'),
        (sarah_id, CURRENT_DATE - 5, 10800, 8200, 170, 410, 'manual'),
        (sarah_id, CURRENT_DATE - 4, 11200, 8500, 180, 430, 'manual'),
        (sarah_id, CURRENT_DATE - 3, 11500, 8700, 190, 440, 'manual'),
        (sarah_id, CURRENT_DATE - 2, 11800, 8900, 195, 450, 'manual'),
        (sarah_id, CURRENT_DATE - 1, 12000, 9100, 200, 460, 'manual'),
        (sarah_id, CURRENT_DATE, 12200, 9200, 205, 470, 'manual')
      ON CONFLICT (user_id, date, source) DO UPDATE SET
        steps = EXCLUDED.steps,
        distance = EXCLUDED.distance,
        elevation = EXCLUDED.elevation,
        calories = EXCLUDED.calories;
        
      -- Also add some historical data from before the journey started (optional)
      -- This shows she was active before starting the journey
      INSERT INTO health_data (user_id, date, steps, distance, elevation, calories, source)
      VALUES
        (sarah_id, CURRENT_DATE - 15, 7500, 5600, 90, 280, 'manual'),
        (sarah_id, CURRENT_DATE - 14, 7800, 5900, 95, 290, 'manual'),
        (sarah_id, CURRENT_DATE - 13, 8000, 6000, 100, 300, 'manual'),
        (sarah_id, CURRENT_DATE - 12, 8100, 6100, 105, 305, 'manual'),
        (sarah_id, CURRENT_DATE - 11, 8200, 6200, 110, 310, 'manual')
      ON CONFLICT (user_id, date, source) DO UPDATE SET
        steps = EXCLUDED.steps,
        distance = EXCLUDED.distance,
        elevation = EXCLUDED.elevation,
        calories = EXCLUDED.calories;
    END IF;
  END IF;
END $$;

