export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  unit_preference?: 'metric' | 'imperial';
  created_at: string;
}

export interface JourneyMilestone {
  id: string;
  journey_id: string;
  name: string;
  description: string;
  distance_from_start: number; // in meters, cumulative distance from journey start
  order_index: number; // order in which milestones appear
  created_at: string;
}

export interface Journey {
  id: string;
  name: string;
  description: string;
  total_distance: number; // in meters
  image_url?: string;
  start_location: string;
  end_location: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  is_premium?: boolean;
  created_at: string;
  milestones?: JourneyMilestone[];
}

export interface UserJourney {
  id: string;
  user_id: string;
  journey_id: string;
  started_at: string;
  completed_at?: string;
  current_distance: number; // in meters
  is_active: boolean;
  journey?: Journey;
}

export interface HealthData {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  distance: number; // in meters
  elevation: number; // in meters
  calories?: number;
  source: 'google_fit' | 'samsung_health' | 'garmin' | 'apple_health' | 'manual';
  created_at: string;
}

export interface HealthDataSource {
  id: string;
  user_id: string;
  source_type: 'google_fit' | 'samsung_health' | 'garmin' | 'apple_health';
  is_connected: boolean;
  last_sync?: string;
  access_token?: string;
}

