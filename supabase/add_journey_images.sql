-- Add stock imagery URLs for each journey
-- Using Unsplash Source for reliable, free stock images
-- These images are optimized for mobile display (800x600)

-- Mount Everest Base Camp - Mountain/trekking image
UPDATE journeys 
SET image_url = 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop&q=80'
WHERE name = 'Mount Everest Base Camp';

-- Pacific Crest Trail - Mountain trail/hiking
UPDATE journeys 
SET image_url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80'
WHERE name = 'Pacific Crest Trail';

-- Appalachian Trail - Forest trail
UPDATE journeys 
SET image_url = 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop&q=80'
WHERE name = 'Appalachian Trail';

-- Cross Country USA - American landscape/road
UPDATE journeys 
SET image_url = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&q=80'
WHERE name = 'Cross Country USA';

-- Camino de Santiago - European countryside/pilgrimage path
UPDATE journeys 
SET image_url = 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800&h=600&fit=crop&q=80'
WHERE name = 'Camino de Santiago';

-- Great Wall of China - Great Wall image
UPDATE journeys 
SET image_url = 'https://images.unsplash.com/photo-1512529904538-658fdee0e0a6?w=800&h=600&fit=crop&q=80'
WHERE name = 'Great Wall of China';

-- London to Paris - European cityscape
UPDATE journeys 
SET image_url = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop&q=80'
WHERE name = 'London to Paris';

-- Tokyo Marathon Route - Tokyo city/running
UPDATE journeys 
SET image_url = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&q=80'
WHERE name = 'Tokyo Marathon Route';

