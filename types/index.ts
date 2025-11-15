export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Journey {
  id: string;
  name: string;
  description: string;
  total_distance: number; // in meters
  image_url?: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  journey_id: string;
  name: string;
  description: string;
  distance_from_start: number; // in meters
  order: number;
  created_at: string;
}

export interface UserJourney {
  id: string;
  user_id: string;
  journey_id: string;
  distance_traveled: number; // in meters
  started_at: string;
  completed_at?: string;
  journey?: Journey;
}

export interface UserMilestone {
  id: string;
  user_id: string;
  milestone_id: string;
  user_journey_id: string;
  achieved_at: string;
  milestone?: Milestone;
}

export interface HealthSource {
  id: string;
  user_id: string;
  source_type: 'google_fit' | 'samsung_health' | 'apple_health';
  is_active: boolean;
  created_at: string;
}

export type HealthData = {
  steps?: number;
  distance?: number; // in meters
  date: string;
};

