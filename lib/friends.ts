import { supabase } from './supabase';
import { User, UserJourney, HealthData } from '@/types';

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_profile?: User;
}

export interface UserWithJourney extends User {
  active_journey?: {
    journey_name: string;
    current_distance: number;
    total_distance: number;
    progress_percentage: number;
  };
}

/**
 * Search for users by name or email
 */
export const searchUsers = async (query: string): Promise<UserWithJourney[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = `%${query.trim().toLowerCase()}%`;

  // Search in profiles by name or email
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
    .neq('id', user.id) // Exclude current user
    .limit(20);

  if (error) throw error;

  // Get active journeys for each user
  const usersWithJourneys: UserWithJourney[] = await Promise.all(
    (profiles || []).map(async (profile) => {
      // Get active journey for this user
      const { data: userJourney } = await supabase
        .from('user_journeys')
        .select(`
          current_distance,
          journey:journeys (
            name,
            total_distance
          )
        `)
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      const activeJourney = userJourney?.journey
        ? {
            journey_name: (userJourney.journey as any).name,
            current_distance: userJourney.current_distance,
            total_distance: (userJourney.journey as any).total_distance,
            progress_percentage: Math.min(
              (userJourney.current_distance / (userJourney.journey as any).total_distance) * 100,
              100
            ),
          }
        : undefined;

      return {
        ...profile,
        active_journey: activeJourney,
      };
    })
  );

  return usersWithJourneys;
};

/**
 * Get all friends (accepted friend requests)
 */
export const getFriends = async (): Promise<Friend[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get friends where user is the requester or the recipient
  const { data, error } = await supabase
    .from('friends')
    .select('*')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq('status', 'accepted');

  if (error) throw error;

  // Fetch profiles for all friends
  const friendsWithProfiles = await Promise.all(
    (data || []).map(async (f: any) => {
      // Determine which profile to fetch (the one that's not the current user)
      const friendId = f.user_id === user.id ? f.friend_id : f.user_id;
      
      // Fetch the friend's profile
      const { data: friendProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', friendId)
        .single();
      
      return {
        ...f,
        friend_profile: friendProfile,
      };
    })
  );

  return friendsWithProfiles;
};

/**
 * Send a friend request
 */
export const sendFriendRequest = async (friendId: string): Promise<Friend> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('friends')
    .insert({
      user_id: user.id,
      friend_id: friendId,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw error;
  
  // Fetch the friend's profile
  const { data: friendProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', friendId)
    .single();
  
  return {
    ...data,
    friend_profile: friendProfile,
  };
};

/**
 * Accept a friend request
 */
export const acceptFriendRequest = async (friendRequestId: string): Promise<Friend> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', friendRequestId)
    .eq('friend_id', user.id) // Only accept if user is the recipient
    .select('*')
    .single();

  if (error) throw error;
  
  // Fetch the requester's profile (the friend)
  const { data: friendProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user_id)
    .single();
  
  return {
    ...data,
    friend_profile: friendProfile,
  };
};

/**
 * Remove a friend
 */
export const removeFriend = async (friendId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('friends')
    .delete()
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

  if (error) throw error;
};

/**
 * Get a friend's profile with journeys and health data summary
 */
export interface FriendProfile {
  profile: User;
  activeJourneys: UserJourney[];
  completedJourneys: UserJourney[];
  healthDataSummary: {
    totalSteps: number;
    totalDistance: number;
    totalElevation: number;
    totalCalories: number;
    daysActive: number;
  };
}

export const getFriendProfile = async (friendId: string): Promise<FriendProfile & { isFriend: boolean }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if they are friends (optional - allow viewing even if not friends)
  const { data: friendship } = await supabase
    .from('friends')
    .select('*')
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
    .eq('status', 'accepted')
    .maybeSingle();

  const isFriend = !!friendship;

  // Get friend's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', friendId)
    .single();

  if (profileError) throw profileError;

  // Get friend's journeys
  const { data: userJourneys, error: journeysError } = await supabase
    .from('user_journeys')
    .select(`
      *,
      journey:journeys (
        *,
        milestones:journey_milestones (*)
      )
    `)
    .eq('user_id', friendId)
    .order('started_at', { ascending: false });

  if (journeysError) throw journeysError;

  // Sort milestones
  const journeys = (userJourneys || []).map((uj: any) => {
    if (uj.journey?.milestones) {
      uj.journey.milestones.sort((a: any, b: any) => a.order_index - b.order_index);
    }
    return uj;
  });

  const activeJourneys = journeys.filter((uj: UserJourney) => uj.is_active);
  const completedJourneys = journeys.filter((uj: UserJourney) => !uj.is_active && uj.completed_at);

  // Get health data summary (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];

  const { data: healthData, error: healthError } = await supabase
    .from('health_data')
    .select('*')
    .eq('user_id', friendId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (healthError) throw healthError;

  // Calculate summary
  const healthDataSummary = (healthData || []).reduce(
    (acc, entry) => {
      // Group by date and take max values (in case of multiple sources)
      const dateKey = entry.date;
      const existing = acc.byDate.get(dateKey);
      
      if (!existing) {
        acc.byDate.set(dateKey, {
          steps: entry.steps || 0,
          distance: entry.distance || 0,
          elevation: entry.elevation || 0,
          calories: entry.calories || 0,
        });
      } else {
        acc.byDate.set(dateKey, {
          steps: Math.max(existing.steps, entry.steps || 0),
          distance: Math.max(existing.distance, entry.distance || 0),
          elevation: Math.max(existing.elevation, entry.elevation || 0),
          calories: Math.max(existing.calories, entry.calories || 0),
        });
      }
      
      return acc;
    },
    { byDate: new Map<string, any>() }
  );

  const dailyData = Array.from(healthDataSummary.byDate.values());
  const totalSteps = dailyData.reduce((sum, day) => sum + day.steps, 0);
  const totalDistance = dailyData.reduce((sum, day) => sum + day.distance, 0);
  const totalElevation = dailyData.reduce((sum, day) => sum + day.elevation, 0);
  const totalCalories = dailyData.reduce((sum, day) => sum + day.calories, 0);
  const daysActive = dailyData.filter(day => day.steps > 0 || day.distance > 0).length;

  return {
    profile: profile as User,
    activeJourneys: activeJourneys as UserJourney[],
    completedJourneys: completedJourneys as UserJourney[],
    healthDataSummary: {
      totalSteps,
      totalDistance,
      totalElevation,
      totalCalories,
      daysActive,
    },
    isFriend,
  };
};

