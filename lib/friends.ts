import { supabase } from './supabase';
import { User } from '@/types';

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

