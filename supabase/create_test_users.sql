-- Create test users with journeys and health data
-- This script creates 5 test users, each with an active journey and health data
-- Run this AFTER the main schema and friends schema are set up

-- Note: This script uses Supabase's auth.users table and creates profiles
-- You may need to create these users through Supabase Auth UI first, then run this script
-- Or use Supabase's admin API to create users programmatically

-- Test User 1: Sarah Johnson (Mount Everest Base Camp)
DO $$
DECLARE
  user1_id UUID;
  journey1_id UUID;
  user_journey1_id UUID;
BEGIN
  -- Get or create user (assuming user exists in auth.users with email 'sarah.johnson@test.com')
  -- If user doesn't exist, you'll need to create them through Supabase Auth first
  SELECT id INTO user1_id FROM auth.users WHERE email = 'sarah.johnson@test.com' LIMIT 1;
  
  IF user1_id IS NOT NULL THEN
    -- Create/update profile
    INSERT INTO profiles (id, email, full_name, created_at)
    VALUES (user1_id, 'sarah.johnson@test.com', 'Sarah Johnson', NOW())
    ON CONFLICT (id) DO UPDATE SET full_name = 'Sarah Johnson';

    -- Get journey ID
    SELECT id INTO journey1_id FROM journeys WHERE name = 'Mount Everest Base Camp' LIMIT 1;

    IF journey1_id IS NOT NULL THEN
      -- Create user journey
      INSERT INTO user_journeys (user_id, journey_id, current_distance, is_active, started_at)
      VALUES (user1_id, journey1_id, 45000, true, NOW() - INTERVAL '5 days')
      ON CONFLICT DO NOTHING
      RETURNING id INTO user_journey1_id;

      -- Add health data for last 5 days
      INSERT INTO health_data (user_id, date, steps, distance, elevation, calories, source)
      VALUES
        (user1_id, CURRENT_DATE - 4, 8500, 6500, 120, 320, 'manual'),
        (user1_id, CURRENT_DATE - 3, 9200, 7200, 150, 380, 'manual'),
        (user1_id, CURRENT_DATE - 2, 7800, 5800, 100, 290, 'manual'),
        (user1_id, CURRENT_DATE - 1, 10500, 8500, 180, 420, 'manual'),
        (user1_id, CURRENT_DATE, 8800, 6800, 130, 350, 'manual')
      ON CONFLICT (user_id, date, source) DO UPDATE SET
        steps = EXCLUDED.steps,
        distance = EXCLUDED.distance,
        elevation = EXCLUDED.elevation,
        calories = EXCLUDED.calories;
    END IF;
  END IF;
END $$;

-- Test User 2: Mike Chen (Pacific Crest Trail - Premium)
DO $$
DECLARE
  user2_id UUID;
  journey2_id UUID;
BEGIN
  SELECT id INTO user2_id FROM auth.users WHERE email = 'mike.chen@test.com' LIMIT 1;
  
  IF user2_id IS NOT NULL THEN
    INSERT INTO profiles (id, email, full_name, created_at)
    VALUES (user2_id, 'mike.chen@test.com', 'Mike Chen', NOW())
    ON CONFLICT (id) DO UPDATE SET full_name = 'Mike Chen';

    SELECT id INTO journey2_id FROM journeys WHERE name = 'Pacific Crest Trail' LIMIT 1;

    IF journey2_id IS NOT NULL THEN
      INSERT INTO user_journeys (user_id, journey_id, current_distance, is_active, started_at)
      VALUES (user2_id, journey2_id, 1250000, true, NOW() - INTERVAL '12 days')
      ON CONFLICT DO NOTHING;

      INSERT INTO health_data (user_id, date, steps, distance, elevation, calories, source)
      VALUES
        (user2_id, CURRENT_DATE - 4, 12000, 9500, 200, 450, 'manual'),
        (user2_id, CURRENT_DATE - 3, 13500, 10800, 250, 520, 'manual'),
        (user2_id, CURRENT_DATE - 2, 11000, 8800, 180, 410, 'manual'),
        (user2_id, CURRENT_DATE - 1, 14200, 11500, 280, 580, 'manual'),
        (user2_id, CURRENT_DATE, 12800, 10200, 220, 490, 'manual')
      ON CONFLICT (user_id, date, source) DO UPDATE SET
        steps = EXCLUDED.steps,
        distance = EXCLUDED.distance,
        elevation = EXCLUDED.elevation,
        calories = EXCLUDED.calories;
    END IF;
  END IF;
END $$;

-- Test User 3: Emma Wilson (Appalachian Trail)
DO $$
DECLARE
  user3_id UUID;
  journey3_id UUID;
BEGIN
  SELECT id INTO user3_id FROM auth.users WHERE email = 'emma.wilson@test.com' LIMIT 1;
  
  IF user3_id IS NOT NULL THEN
    INSERT INTO profiles (id, email, full_name, created_at)
    VALUES (user3_id, 'emma.wilson@test.com', 'Emma Wilson', NOW())
    ON CONFLICT (id) DO UPDATE SET full_name = 'Emma Wilson';

    SELECT id INTO journey3_id FROM journeys WHERE name = 'Appalachian Trail' LIMIT 1;

    IF journey3_id IS NOT NULL THEN
      INSERT INTO user_journeys (user_id, journey_id, current_distance, is_active, started_at)
      VALUES (user3_id, journey3_id, 980000, true, NOW() - INTERVAL '8 days')
      ON CONFLICT DO NOTHING;

      INSERT INTO health_data (user_id, date, steps, distance, elevation, calories, source)
      VALUES
        (user3_id, CURRENT_DATE - 4, 9500, 7500, 150, 360, 'manual'),
        (user3_id, CURRENT_DATE - 3, 10200, 8200, 170, 390, 'manual'),
        (user3_id, CURRENT_DATE - 2, 8800, 6900, 130, 330, 'manual'),
        (user3_id, CURRENT_DATE - 1, 11200, 9000, 190, 440, 'manual'),
        (user3_id, CURRENT_DATE, 9800, 7800, 160, 370, 'manual')
      ON CONFLICT (user_id, date, source) DO UPDATE SET
        steps = EXCLUDED.steps,
        distance = EXCLUDED.distance,
        elevation = EXCLUDED.elevation,
        calories = EXCLUDED.calories;
    END IF;
  END IF;
END $$;

-- Test User 4: David Martinez (Camino de Santiago)
DO $$
DECLARE
  user4_id UUID;
  journey4_id UUID;
BEGIN
  SELECT id INTO user4_id FROM auth.users WHERE email = 'david.martinez@test.com' LIMIT 1;
  
  IF user4_id IS NOT NULL THEN
    INSERT INTO profiles (id, email, full_name, created_at)
    VALUES (user4_id, 'david.martinez@test.com', 'David Martinez', NOW())
    ON CONFLICT (id) DO UPDATE SET full_name = 'David Martinez';

    SELECT id INTO journey4_id FROM journeys WHERE name = 'Camino de Santiago' LIMIT 1;

    IF journey4_id IS NOT NULL THEN
      INSERT INTO user_journeys (user_id, journey_id, current_distance, is_active, started_at)
      VALUES (user4_id, journey4_id, 320000, true, NOW() - INTERVAL '6 days')
      ON CONFLICT DO NOTHING;

      INSERT INTO health_data (user_id, date, steps, distance, elevation, calories, source)
      VALUES
        (user4_id, CURRENT_DATE - 4, 11000, 8800, 100, 420, 'manual'),
        (user4_id, CURRENT_DATE - 3, 12500, 10000, 120, 480, 'manual'),
        (user4_id, CURRENT_DATE - 2, 9800, 7800, 90, 380, 'manual'),
        (user4_id, CURRENT_DATE - 1, 13200, 10600, 140, 510, 'manual'),
        (user4_id, CURRENT_DATE, 11500, 9200, 110, 440, 'manual')
      ON CONFLICT (user_id, date, source) DO UPDATE SET
        steps = EXCLUDED.steps,
        distance = EXCLUDED.distance,
        elevation = EXCLUDED.elevation,
        calories = EXCLUDED.calories;
    END IF;
  END IF;
END $$;

-- Test User 5: Lisa Anderson (Great Wall of China - Premium)
DO $$
DECLARE
  user5_id UUID;
  journey5_id UUID;
BEGIN
  SELECT id INTO user5_id FROM auth.users WHERE email = 'lisa.anderson@test.com' LIMIT 1;
  
  IF user5_id IS NOT NULL THEN
    INSERT INTO profiles (id, email, full_name, created_at)
    VALUES (user5_id, 'lisa.anderson@test.com', 'Lisa Anderson', NOW())
    ON CONFLICT (id) DO UPDATE SET full_name = 'Lisa Anderson';

    SELECT id INTO journey5_id FROM journeys WHERE name = 'Great Wall of China' LIMIT 1;

    IF journey5_id IS NOT NULL THEN
      INSERT INTO user_journeys (user_id, journey_id, current_distance, is_active, started_at)
      VALUES (user5_id, journey5_id, 3500000, true, NOW() - INTERVAL '15 days')
      ON CONFLICT DO NOTHING;

      INSERT INTO health_data (user_id, date, steps, distance, elevation, calories, source)
      VALUES
        (user5_id, CURRENT_DATE - 4, 15000, 12000, 250, 580, 'manual'),
        (user5_id, CURRENT_DATE - 3, 16800, 13500, 280, 650, 'manual'),
        (user5_id, CURRENT_DATE - 2, 14200, 11400, 230, 550, 'manual'),
        (user5_id, CURRENT_DATE - 1, 17500, 14200, 300, 680, 'manual'),
        (user5_id, CURRENT_DATE, 16000, 12800, 260, 600, 'manual')
      ON CONFLICT (user_id, date, source) DO UPDATE SET
        steps = EXCLUDED.steps,
        distance = EXCLUDED.distance,
        elevation = EXCLUDED.elevation,
        calories = EXCLUDED.calories;
    END IF;
  END IF;
END $$;

