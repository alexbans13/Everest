-- Seed data for journeys and milestones

-- Insert Mt. Everest journey
INSERT INTO journeys (id, name, description, total_distance) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Climbing Mount Everest', 'Embark on the ultimate challenge: climbing Mount Everest. Track your steps and distance as you progress from base camp to the summit.', 8848000)
ON CONFLICT DO NOTHING;

-- Insert Route 66 journey
INSERT INTO journeys (id, name, description, total_distance) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Walking Route 66', 'Take a virtual journey across America on the historic Route 66. Walk from Chicago to Los Angeles and experience the iconic landmarks along the way.', 3944000)
ON CONFLICT DO NOTHING;

-- Insert Mt. Everest milestones
INSERT INTO milestones (journey_id, name, description, distance_from_start, "order") VALUES
-- Base Camp milestones
('550e8400-e29b-41d4-a716-446655440001', 'Base Camp (5,364m)', 'You have reached Everest Base Camp! This is where the real adventure begins. Take in the breathtaking views of the Khumbu Icefall.', 0, 1),
('550e8400-e29b-41d4-a716-446655440001', 'Camp 1 (6,065m)', 'Camp 1 reached! You are now above 6,000 meters. The air is getting thinner, but your determination is strong.', 884800, 2),
('550e8400-e29b-41d4-a716-446655440001', 'Camp 2 (6,400m)', 'Camp 2 achieved! Known as Advanced Base Camp, this is a crucial acclimatization point. You are making excellent progress!', 1769600, 3),
('550e8400-e29b-41d4-a716-446655440001', 'Camp 3 (7,200m)', 'Camp 3 conquered! You are now in the "Death Zone" above 7,000 meters. Every step requires immense effort and determination.', 2654400, 4),
('550e8400-e29b-41d4-a716-446655440001', 'Camp 4 - South Col (7,950m)', 'The South Col! This is your final camp before the summit push. You are at the edge of human endurance.', 3539200, 5),
('550e8400-e29b-41d4-a716-446655440001', 'The Balcony (8,400m)', 'You have reached The Balcony! A small platform on the Southeast Ridge. The summit is within sight, but the hardest part is yet to come.', 4424000, 6),
('550e8400-e29b-41d4-a716-446655440001', 'The South Summit (8,750m)', 'The South Summit! Just below the true summit. You can see the Hillary Step ahead - the final challenge.', 5308800, 7),
('550e8400-e29b-41d4-a716-446655440001', 'Summit of Mount Everest (8,848m)', 'CONGRATULATIONS! You have reached the summit of Mount Everest - the highest point on Earth! You are standing on top of the world!', 8848000, 8)
ON CONFLICT DO NOTHING;

-- Insert Route 66 milestones
INSERT INTO milestones (journey_id, name, description, distance_from_start, "order") VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Chicago, Illinois', 'The starting point of Route 66! Begin your journey in the Windy City, where the Mother Road starts.', 0, 1),
('550e8400-e29b-41d4-a716-446655440002', 'Springfield, Illinois', 'Welcome to Springfield, the capital of Illinois! You are making great progress on your cross-country adventure.', 197200, 2),
('550e8400-e29b-41d4-a716-446655440002', 'St. Louis, Missouri', 'You have reached the Gateway to the West! The iconic Gateway Arch welcomes you to Missouri.', 394400, 3),
('550e8400-e29b-41d4-a716-446655440002', 'Oklahoma City, Oklahoma', 'Oklahoma City reached! You are now in the heart of America. Keep pushing forward!', 788800, 4),
('550e8400-e29b-41d4-a716-446655440002', 'Amarillo, Texas', 'Welcome to the Texas Panhandle! You are halfway through your journey. The Cadillac Ranch awaits!', 1183200, 5),
('550e8400-e29b-41d4-a716-446655440002', 'Albuquerque, New Mexico', 'Albuquerque achieved! Experience the rich culture and stunning desert landscapes of New Mexico.', 1577600, 6),
('550e8400-e29b-41d4-a716-446655440002', 'Flagstaff, Arizona', 'Flagstaff reached! You are in the high desert, surrounded by mountains and pine forests.', 1972000, 7),
('550e8400-e29b-41d4-a716-446655440002', 'Barstow, California', 'Welcome to California! You are in the Mojave Desert, getting close to your destination.', 2366400, 8),
('550e8400-e29b-41d4-a716-446655440002', 'Los Angeles, California', 'CONGRATULATIONS! You have completed Route 66! You have walked from Chicago to Los Angeles - an incredible journey across America!', 3944000, 9)
ON CONFLICT DO NOTHING;

