-- Sample SQL script to populate journey milestones
-- Run this AFTER running the main migration (001_initial_schema.sql)
-- This will add milestones to the existing journeys

-- Mount Everest Base Camp Journey Milestones (130km total)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Lukla Airport',
  'Starting point of your journey at the famous Lukla Airport',
  0,
  1
FROM journeys WHERE name = 'Mount Everest Base Camp';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Namche Bazaar',
  'Reach the bustling Sherpa capital at 3,440m elevation',
  15000,
  2
FROM journeys WHERE name = 'Mount Everest Base Camp';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Tengboche Monastery',
  'Visit the famous monastery with stunning mountain views',
  35000,
  3
FROM journeys WHERE name = 'Mount Everest Base Camp';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Dingboche',
  'Acclimatization stop at 4,410m - halfway point!',
  65000,
  4
FROM journeys WHERE name = 'Mount Everest Base Camp';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Lobuche',
  'Final village before base camp at 4,940m',
  95000,
  5
FROM journeys WHERE name = 'Mount Everest Base Camp';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Everest Base Camp',
  'Congratulations! You''ve reached the base of the world''s highest mountain!',
  130000,
  6
FROM journeys WHERE name = 'Mount Everest Base Camp';

-- Pacific Crest Trail Milestones (4265km total)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Southern Terminus',
  'Start your epic journey at the Mexican border',
  0,
  1
FROM journeys WHERE name = 'Pacific Crest Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Mojave Desert',
  'Complete the challenging desert section',
  1000000,
  2
FROM journeys WHERE name = 'Pacific Crest Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Sierra Nevada',
  'Conquer the majestic Sierra Nevada mountains',
  2000000,
  3
FROM journeys WHERE name = 'Pacific Crest Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Oregon Border',
  'Cross into Oregon - you''re making great progress!',
  3000000,
  4
FROM journeys WHERE name = 'Pacific Crest Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Washington State',
  'Enter the final state of your journey',
  3600000,
  5
FROM journeys WHERE name = 'Pacific Crest Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Northern Terminus',
  'Incredible! You''ve completed the entire Pacific Crest Trail!',
  4265000,
  6
FROM journeys WHERE name = 'Pacific Crest Trail';

-- Appalachian Trail Milestones (3500km total)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Springer Mountain',
  'Begin your journey at the southern terminus in Georgia',
  0,
  1
FROM journeys WHERE name = 'Appalachian Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Great Smoky Mountains',
  'Navigate through the beautiful Smoky Mountains',
  800000,
  2
FROM journeys WHERE name = 'Appalachian Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Shenandoah National Park',
  'Experience the scenic beauty of Shenandoah',
  1500000,
  3
FROM journeys WHERE name = 'Appalachian Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Halfway Point',
  'Reach the midpoint of the Appalachian Trail!',
  1750000,
  4
FROM journeys WHERE name = 'Appalachian Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'White Mountains',
  'Tackle the challenging White Mountains in New Hampshire',
  2800000,
  5
FROM journeys WHERE name = 'Appalachian Trail';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Mount Katahdin',
  'Summit the northern terminus - you''ve completed the AT!',
  3500000,
  6
FROM journeys WHERE name = 'Appalachian Trail';

-- Cross Country USA Milestones (4500km total)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'New York City',
  'Start your cross-country adventure in the Big Apple',
  0,
  1
FROM journeys WHERE name = 'Cross Country USA';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Chicago',
  'Reach the Windy City - first major milestone!',
  1200000,
  2
FROM journeys WHERE name = 'Cross Country USA';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Kansas City',
  'Cross the Mississippi and enter the Great Plains',
  2000000,
  3
FROM journeys WHERE name = 'Cross Country USA';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Denver',
  'Reach the Mile High City at the foot of the Rockies',
  2800000,
  4
FROM journeys WHERE name = 'Cross Country USA';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Las Vegas',
  'Pass through the entertainment capital of the world',
  3800000,
  5
FROM journeys WHERE name = 'Cross Country USA';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Los Angeles',
  'Congratulations! You''ve walked across America!',
  4500000,
  6
FROM journeys WHERE name = 'Cross Country USA';

-- Camino de Santiago Milestones (780km total)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Saint-Jean-Pied-de-Port',
  'Begin your pilgrimage in this beautiful French town',
  0,
  1
FROM journeys WHERE name = 'Camino de Santiago';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Pamplona',
  'Reach the first major Spanish city on the Camino',
  80000,
  2
FROM journeys WHERE name = 'Camino de Santiago';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Burgos',
  'Visit the historic city with its magnificent cathedral',
  250000,
  3
FROM journeys WHERE name = 'Camino de Santiago';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'León',
  'Pass through this ancient Roman city',
  450000,
  4
FROM journeys WHERE name = 'Camino de Santiago';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Sarria',
  'Final 100km marker - almost there!',
  680000,
  5
FROM journeys WHERE name = 'Camino de Santiago';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Santiago de Compostela',
  'Complete your pilgrimage at the Cathedral of Santiago!',
  780000,
  6
FROM journeys WHERE name = 'Camino de Santiago';

-- London to Paris Milestones (350km total)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'London',
  'Start your European adventure in the UK capital',
  0,
  1
FROM journeys WHERE name = 'London to Paris';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Dover',
  'Reach the English Channel coast',
  120000,
  2
FROM journeys WHERE name = 'London to Paris';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Calais',
  'Cross the Channel and arrive in France',
  150000,
  3
FROM journeys WHERE name = 'London to Paris';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Amiens',
  'Pass through this historic French city',
  250000,
  4
FROM journeys WHERE name = 'London to Paris';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Paris',
  'Arrive in the City of Light - mission accomplished!',
  350000,
  5
FROM journeys WHERE name = 'London to Paris';

-- Tokyo Marathon Route Milestones (421.95km total - 10 marathons)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Marathon 1 Complete',
  'First marathon distance completed!',
  42195,
  1
FROM journeys WHERE name = 'Tokyo Marathon Route';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Marathon 3 Complete',
  'You''re a third of the way there!',
  126585,
  2
FROM journeys WHERE name = 'Tokyo Marathon Route';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Marathon 5 Complete',
  'Halfway point - 5 marathons down!',
  210975,
  3
FROM journeys WHERE name = 'Tokyo Marathon Route';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Marathon 7 Complete',
  'Seven marathons completed - keep going!',
  295365,
  4
FROM journeys WHERE name = 'Tokyo Marathon Route';

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  id,
  'Marathon 10 Complete',
  'Incredible! You''ve completed 10 marathon distances!',
  421950,
  5
FROM journeys WHERE name = 'Tokyo Marathon Route';

-- Great Wall of China Milestones (21,000km total)
INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  j.id,
  'Shanhai Pass',
  'Begin your epic journey at the eastern end of the Great Wall',
  0,
  1
FROM journeys j
WHERE j.name = 'Great Wall of China'
  AND NOT EXISTS (
    SELECT 1 FROM journey_milestones jm 
    WHERE jm.journey_id = j.id 
    AND jm.name = 'Shanhai Pass'
  );

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  j.id,
  'Beijing Section',
  'Reach the famous restored sections near Beijing',
  4200000,
  2
FROM journeys j
WHERE j.name = 'Great Wall of China'
  AND NOT EXISTS (
    SELECT 1 FROM journey_milestones jm 
    WHERE jm.journey_id = j.id 
    AND jm.name = 'Beijing Section'
  );

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  j.id,
  'Badaling',
  'Pass through one of the most visited sections of the Great Wall',
  6300000,
  3
FROM journeys j
WHERE j.name = 'Great Wall of China'
  AND NOT EXISTS (
    SELECT 1 FROM journey_milestones jm 
    WHERE jm.journey_id = j.id 
    AND jm.name = 'Badaling'
  );

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  j.id,
  'Mutianyu',
  'Experience the beautifully restored Mutianyu section',
  8400000,
  4
FROM journeys j
WHERE j.name = 'Great Wall of China'
  AND NOT EXISTS (
    SELECT 1 FROM journey_milestones jm 
    WHERE jm.journey_id = j.id 
    AND jm.name = 'Mutianyu'
  );

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  j.id,
  'Halfway Point',
  'Reach the midpoint of your Great Wall journey!',
  10500000,
  5
FROM journeys j
WHERE j.name = 'Great Wall of China'
  AND NOT EXISTS (
    SELECT 1 FROM journey_milestones jm 
    WHERE jm.journey_id = j.id 
    AND jm.name = 'Halfway Point'
    AND jm.order_index = 5
  );

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  j.id,
  'Jinshanling',
  'Navigate through the wild and unrestored Jinshanling section',
  12600000,
  6
FROM journeys j
WHERE j.name = 'Great Wall of China'
  AND NOT EXISTS (
    SELECT 1 FROM journey_milestones jm 
    WHERE jm.journey_id = j.id 
    AND jm.name = 'Jinshanling'
  );

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  j.id,
  'Gansu Province',
  'Enter the final province of your journey',
  16800000,
  7
FROM journeys j
WHERE j.name = 'Great Wall of China'
  AND NOT EXISTS (
    SELECT 1 FROM journey_milestones jm 
    WHERE jm.journey_id = j.id 
    AND jm.name = 'Gansu Province'
  );

INSERT INTO journey_milestones (journey_id, name, description, distance_from_start, order_index)
SELECT 
  j.id,
  'Jiayuguan Pass',
  'Congratulations! You''ve completed the entire Great Wall of China!',
  21000000,
  8
FROM journeys j
WHERE j.name = 'Great Wall of China'
  AND NOT EXISTS (
    SELECT 1 FROM journey_milestones jm 
    WHERE jm.journey_id = j.id 
    AND jm.name = 'Jiayuguan Pass'
  );

