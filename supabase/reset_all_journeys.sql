-- Idempotent script to completely reset and re-add all journeys and milestones
-- This script can be run multiple times safely
-- It will delete all existing journeys (cascading to milestones) and re-create them

-- Step 1: Delete all existing milestones (in case cascade doesn't work)
DELETE FROM journey_milestones;

-- Step 2: Delete all existing journeys
DELETE FROM journeys;

-- Step 3: Re-insert all journeys with complete data
INSERT INTO journeys (name, description, total_distance, start_location, end_location, difficulty, is_premium, image_url, category, target_altitude) VALUES
  ('Mount Everest Base Camp', 'Trek to the base camp of the world''s highest mountain', 130000, 'Lukla, Nepal', 'Everest Base Camp, Nepal', 'hard', false, 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop&q=80', 'altitude', 8848),
  ('Pacific Crest Trail', 'Hike the famous trail from Mexico to Canada', 4265000, 'Campo, California', 'Manning Park, British Columbia', 'extreme', true, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80', 'distance', NULL),
  ('Appalachian Trail', 'Complete the iconic East Coast trail', 3500000, 'Springer Mountain, Georgia', 'Mount Katahdin, Maine', 'extreme', false, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop&q=80', 'distance', NULL),
  ('Cross Country USA', 'Walk across the United States', 4500000, 'New York, NY', 'Los Angeles, CA', 'extreme', false, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&q=80', 'distance', NULL),
  ('Camino de Santiago', 'The famous pilgrimage route in Spain', 780000, 'Saint-Jean-Pied-de-Port, France', 'Santiago de Compostela, Spain', 'medium', false, 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800&h=600&fit=crop&q=80', 'distance', NULL),
  ('Great Wall of China', 'Walk along the Great Wall', 21000000, 'Shanhai Pass', 'Jiayuguan Pass', 'extreme', true, 'https://images.unsplash.com/photo-1512529904538-658fdee0e0a6?w=800&h=600&fit=crop&q=80', 'distance', NULL),
  ('London to Paris', 'Walk from London to Paris', 350000, 'London, UK', 'Paris, France', 'medium', false, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop&q=80', 'distance', NULL),
  ('Tokyo Marathon Route', 'Complete the Tokyo Marathon distance 10 times', 421950, 'Tokyo, Japan', 'Tokyo, Japan', 'easy', false, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&q=80', 'distance', NULL);

-- Step 4: Insert milestones for Mount Everest Base Camp (130km total)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Lukla Airport', 'Starting point of your journey at the famous Lukla Airport', 0, 1
FROM journeys WHERE name = 'Mount Everest Base Camp';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Namche Bazaar', 'Reach the bustling Sherpa capital at 3,440m elevation', 15000, 2
FROM journeys WHERE name = 'Mount Everest Base Camp';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Tengboche Monastery', 'Visit the famous monastery with stunning mountain views', 35000, 3
FROM journeys WHERE name = 'Mount Everest Base Camp';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Dingboche', 'Acclimatization stop at 4,410m - halfway point!', 65000, 4
FROM journeys WHERE name = 'Mount Everest Base Camp';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Lobuche', 'Final village before base camp at 4,940m', 95000, 5
FROM journeys WHERE name = 'Mount Everest Base Camp';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Everest Base Camp', 'Congratulations! You''ve reached the base of the world''s highest mountain!', 130000, 6
FROM journeys WHERE name = 'Mount Everest Base Camp';

-- Step 5: Insert milestones for Pacific Crest Trail (4265km total)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Southern Terminus', 'Start your epic journey at the Mexican border', 0, 1
FROM journeys WHERE name = 'Pacific Crest Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Mojave Desert', 'Complete the challenging desert section', 1000000, 2
FROM journeys WHERE name = 'Pacific Crest Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Sierra Nevada', 'Conquer the majestic Sierra Nevada mountains', 2000000, 3
FROM journeys WHERE name = 'Pacific Crest Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Oregon Border', 'Cross into Oregon - you''re making great progress!', 3000000, 4
FROM journeys WHERE name = 'Pacific Crest Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Washington State', 'Enter the final state of your journey', 3600000, 5
FROM journeys WHERE name = 'Pacific Crest Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Northern Terminus', 'Incredible! You''ve completed the entire Pacific Crest Trail!', 4265000, 6
FROM journeys WHERE name = 'Pacific Crest Trail';

-- Step 6: Insert milestones for Appalachian Trail (3500km total)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Springer Mountain', 'Begin your journey at the southern terminus in Georgia', 0, 1
FROM journeys WHERE name = 'Appalachian Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Great Smoky Mountains', 'Navigate through the beautiful Smoky Mountains', 800000, 2
FROM journeys WHERE name = 'Appalachian Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Shenandoah National Park', 'Experience the scenic beauty of Shenandoah', 1500000, 3
FROM journeys WHERE name = 'Appalachian Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Halfway Point', 'Reach the midpoint of the Appalachian Trail!', 1750000, 4
FROM journeys WHERE name = 'Appalachian Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'White Mountains', 'Tackle the challenging White Mountains in New Hampshire', 2800000, 5
FROM journeys WHERE name = 'Appalachian Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Mount Katahdin', 'Summit the northern terminus - you''ve completed the AT!', 3500000, 6
FROM journeys WHERE name = 'Appalachian Trail';

-- Step 7: Insert milestones for Cross Country USA (4500km total)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'New York City', 'Start your cross-country adventure in the Big Apple', 0, 1
FROM journeys WHERE name = 'Cross Country USA';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Chicago', 'Reach the Windy City - first major milestone!', 1200000, 2
FROM journeys WHERE name = 'Cross Country USA';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Kansas City', 'Cross the Mississippi and enter the Great Plains', 2000000, 3
FROM journeys WHERE name = 'Cross Country USA';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Denver', 'Reach the Mile High City at the foot of the Rockies', 2800000, 4
FROM journeys WHERE name = 'Cross Country USA';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Las Vegas', 'Pass through the entertainment capital of the world', 3800000, 5
FROM journeys WHERE name = 'Cross Country USA';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Los Angeles', 'Congratulations! You''ve walked across America!', 4500000, 6
FROM journeys WHERE name = 'Cross Country USA';

-- Step 8: Insert milestones for Camino de Santiago (780km total)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Saint-Jean-Pied-de-Port', 'Begin your pilgrimage in this beautiful French town', 0, 1
FROM journeys WHERE name = 'Camino de Santiago';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Pamplona', 'Reach the first major Spanish city on the Camino', 80000, 2
FROM journeys WHERE name = 'Camino de Santiago';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Burgos', 'Visit the historic city with its magnificent cathedral', 250000, 3
FROM journeys WHERE name = 'Camino de Santiago';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'León', 'Pass through this ancient Roman city', 450000, 4
FROM journeys WHERE name = 'Camino de Santiago';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Sarria', 'Final 100km marker - almost there!', 680000, 5
FROM journeys WHERE name = 'Camino de Santiago';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Santiago de Compostela', 'Complete your pilgrimage at the Cathedral of Santiago!', 780000, 6
FROM journeys WHERE name = 'Camino de Santiago';

-- Step 9: Insert milestones for Great Wall of China (21,000km total)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Shanhai Pass', 'Begin your epic journey at the eastern end of the Great Wall', 0, 1
FROM journeys WHERE name = 'Great Wall of China';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Beijing Section', 'Reach the famous restored sections near Beijing', 4200000, 2
FROM journeys WHERE name = 'Great Wall of China';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Badaling', 'Pass through one of the most visited sections of the Great Wall', 6300000, 3
FROM journeys WHERE name = 'Great Wall of China';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Mutianyu', 'Experience the beautifully restored Mutianyu section', 8400000, 4
FROM journeys WHERE name = 'Great Wall of China';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Halfway Point', 'Reach the midpoint of your Great Wall journey!', 10500000, 5
FROM journeys WHERE name = 'Great Wall of China';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Jinshanling', 'Navigate through the wild and unrestored Jinshanling section', 12600000, 6
FROM journeys WHERE name = 'Great Wall of China';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Gansu Province', 'Enter the final province of your journey', 16800000, 7
FROM journeys WHERE name = 'Great Wall of China';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Jiayuguan Pass', 'Congratulations! You''ve completed the entire Great Wall of China!', 21000000, 8
FROM journeys WHERE name = 'Great Wall of China';

-- Step 10: Insert milestones for London to Paris (350km total)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'London', 'Start your European adventure in the UK capital', 0, 1
FROM journeys WHERE name = 'London to Paris';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Dover', 'Reach the English Channel coast', 120000, 2
FROM journeys WHERE name = 'London to Paris';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Calais', 'Cross the Channel and arrive in France', 150000, 3
FROM journeys WHERE name = 'London to Paris';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Amiens', 'Pass through this historic French city', 250000, 4
FROM journeys WHERE name = 'London to Paris';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Paris', 'Arrive in the City of Light - mission accomplished!', 350000, 5
FROM journeys WHERE name = 'London to Paris';

-- Step 11: Insert milestones for Tokyo Marathon Route (421.95km total - 10 marathons)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Marathon 1 Complete', 'First marathon distance completed!', 42195, 1
FROM journeys WHERE name = 'Tokyo Marathon Route';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Marathon 3 Complete', 'You''re a third of the way there!', 126585, 2
FROM journeys WHERE name = 'Tokyo Marathon Route';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Marathon 5 Complete', 'Halfway point - 5 marathons down!', 210975, 3
FROM journeys WHERE name = 'Tokyo Marathon Route';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Marathon 7 Complete', 'Seven marathons completed - keep going!', 295365, 4
FROM journeys WHERE name = 'Tokyo Marathon Route';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT id, 'Marathon 10 Complete', 'Incredible! You''ve completed 10 marathon distances!', 421950, 5
FROM journeys WHERE name = 'Tokyo Marathon Route';

