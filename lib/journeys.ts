import { supabase } from './supabase';
import { Journey, UserJourney, JourneyMilestone } from '@/types';
import { getHealthData } from './health';

export const getAvailableJourneys = async (): Promise<(Journey & { user_journey_id?: string; is_active?: boolean })[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get all journeys
  const { data: journeys, error: journeysError } = await supabase
    .from('journeys')
    .select('*')
    .order('created_at', { ascending: false });

  if (journeysError) throw journeysError;

  // Get user's active journeys
  const { data: userJourneys } = await supabase
    .from('user_journeys')
    .select('journey_id, id, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true);

  // Map journeys with user journey info
  const journeysWithStatus = (journeys || []).map((journey) => {
    const userJourney = userJourneys?.find((uj) => uj.journey_id === journey.id);
    return {
      ...journey,
      user_journey_id: userJourney?.id,
      is_active: !!userJourney?.is_active,
    };
  });

  return journeysWithStatus;
};

export const getJourneyById = async (id: string): Promise<Journey> => {
  const { data, error } = await supabase
    .from('journeys')
    .select(`
      *,
      milestones:journey_milestones (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  // Sort milestones by order_index
  if (data.milestones) {
    data.milestones.sort((a: JourneyMilestone, b: JourneyMilestone) => a.order_index - b.order_index);
  }
  
  return data;
};

export const getJourneyMilestones = async (journeyId: string): Promise<JourneyMilestone[]> => {
  const { data, error } = await supabase
    .from('journey_milestones')
    .select('*')
    .eq('journey_id', journeyId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const startJourney = async (journeyId: string): Promise<UserJourney> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user already has this journey (even if inactive)
  const { data: existing } = await supabase
    .from('user_journeys')
    .select('*')
    .eq('user_id', user.id)
    .eq('journey_id', journeyId)
    .single();

  let result;
  if (existing) {
    // If journey exists and is already active, return it
    if (existing.is_active) {
      const { data, error } = await supabase
        .from('user_journeys')
        .select(`
          *,
          journey:journeys (*)
        `)
        .eq('id', existing.id)
        .single();
      
      if (error) throw error;
      return data;
    }
    
    // Reactivate and reset the existing journey
    const { data, error } = await supabase
      .from('user_journeys')
      .update({
        is_active: true,
        current_distance: 0,
        started_at: new Date().toISOString(),
        completed_at: null,
      })
      .eq('id', existing.id)
      .select(`
        *,
        journey:journeys (*)
      `)
      .single();

    if (error) throw error;
    result = data;
  } else {
    // Create a new journey - explicitly set started_at to current timestamp
    const startedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from('user_journeys')
      .insert({
        user_id: user.id,
        journey_id: journeyId,
        current_distance: 0,
        is_active: true,
        started_at: startedAt,
      })
      .select(`
        *,
        journey:journeys (*)
      `)
      .single();

    if (error) throw error;
    result = data;
  }

  return result;
};

export const getUserJourneys = async (): Promise<UserJourney[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_journeys')
    .select(`
      *,
      journey:journeys (
        *,
        milestones:journey_milestones (*)
      )
    `)
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });

  if (error) throw error;
  
  // Sort milestones by order_index
  const journeys = (data || []).map((uj: any) => {
    if (uj.journey?.milestones) {
      uj.journey.milestones.sort((a: JourneyMilestone, b: JourneyMilestone) => a.order_index - b.order_index);
    }
    return uj;
  });
  
  return journeys;
};

export const getActiveJourney = async (): Promise<UserJourney | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_journeys')
    .select(`
      *,
      journey:journeys (*)
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

export const getActiveJourneys = async (): Promise<UserJourney[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_journeys')
    .select(`
      *,
      journey:journeys (
        *,
        milestones:journey_milestones (*)
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('started_at', { ascending: false });

  if (error) throw error;
  
  // Sort milestones by order_index
  const journeys = (data || []).map((uj: any) => {
    if (uj.journey?.milestones) {
      uj.journey.milestones.sort((a: JourneyMilestone, b: JourneyMilestone) => a.order_index - b.order_index);
    }
    return uj;
  });
  
  return journeys;
};

export const updateJourneyProgress = async (
  userJourneyId: string,
  distance: number
): Promise<UserJourney> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_journeys')
    .update({ current_distance: distance })
    .eq('id', userJourneyId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update journey progress based on health data since journey start
// If userJourneyId is provided, sync that specific journey
// If no userJourneyId is provided, sync ALL active journeys
export const syncJourneyProgressFromHealthData = async (userJourneyId?: string): Promise<UserJourney | UserJourney[] | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (userJourneyId) {
    // Sync a specific journey
    const { data, error } = await supabase
      .from('user_journeys')
      .select(`
        *,
        journey:journeys (*)
      `)
      .eq('id', userJourneyId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    const targetJourney = data;
    if (!targetJourney) return null;
    
    return await syncSingleJourneyProgress(targetJourney);
  } else {
    // Sync all active journeys
    const activeJourneys = await getActiveJourneys();
    if (activeJourneys.length === 0) return null;
    
    const syncedJourneys: UserJourney[] = [];
    for (const journey of activeJourneys) {
      const synced = await syncSingleJourneyProgress(journey);
      if (synced) syncedJourneys.push(synced);
    }
    
    return syncedJourneys;
  }
};

// Helper function to sync progress for a single journey
const syncSingleJourneyProgress = async (targetJourney: UserJourney): Promise<UserJourney | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get journey start timestamp
  const startTimestamp = new Date(targetJourney.started_at);
  
  // Get the date portion of the start timestamp (normalized to midnight)
  const startDate = new Date(startTimestamp);
  startDate.setHours(0, 0, 0, 0);
  const startDateString = startDate.toISOString().split('T')[0];
  
  // Get today's date (normalized to midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];
  
  // Determine the first date to count health data from
  // If journey started today, we exclude today entirely and start counting from tomorrow
  // If journey started on a previous day, we exclude the start date and count from the next day
  let firstCountedDate: Date;
  if (startDateString === todayString) {
    // Journey started today - exclude today, start counting from tomorrow
    firstCountedDate = new Date(today);
    firstCountedDate.setDate(firstCountedDate.getDate() + 1);
  } else {
    // Journey started on a previous day - exclude start date, count from next day
    firstCountedDate = new Date(startDate);
    firstCountedDate.setDate(firstCountedDate.getDate() + 1);
  }
  
  const firstCountedDateString = firstCountedDate.toISOString().split('T')[0];
  
  // If the first counted date is in the future, there's no data to count yet
  if (firstCountedDateString > todayString) {
    console.log('Journey started today or in the future - no progress to count yet');
    // Ensure progress is set to 0
    await updateJourneyProgress(targetJourney.id, 0);
    return await supabase
      .from('user_journeys')
      .select(`
        *,
        journey:journeys (*)
      `)
      .eq('id', targetJourney.id)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      });
  }

  console.log('Syncing journey progress:', {
    userJourneyId: targetJourney.id,
    journeyId: targetJourney.journey_id,
    startedAt: targetJourney.started_at,
    startDate: startDateString,
    today: todayString,
    firstCountedDate: firstCountedDateString,
  });

  // Get all health data from the day AFTER the journey started
  // This ensures we only count activity that occurred AFTER the journey was started
  const healthData = await getHealthData(firstCountedDateString, todayString);

  console.log('Health data retrieved:', {
    count: healthData.length,
    dates: healthData.map(d => d.date),
    distances: healthData.map(d => ({ date: d.date, distance: d.distance })),
  });

  // Calculate total distance from health data
  // Sum up all distance from all sources, but only count each date once (take max distance per date)
  const distanceByDate = new Map<string, number>();
  
  healthData.forEach((data) => {
    // Ensure date is in YYYY-MM-DD format
    const dateKey = typeof data.date === 'string' ? data.date.split('T')[0].split(' ')[0] : data.date;
    // Only count data from the day after the journey started (we already filtered in the query, but double-check)
    // This ensures we never count data from the start date itself
    if (dateKey > startDateString && dateKey >= firstCountedDateString) {
      const distance = data.distance != null ? Number(data.distance) : 0;
      const existing = distanceByDate.get(dateKey) || 0;
      distanceByDate.set(dateKey, Math.max(existing, distance));
    }
  });

  const totalDistance = Array.from(distanceByDate.values()).reduce((sum, dist) => sum + dist, 0);

  console.log('Calculated total distance:', {
    totalDistance,
    distanceByDate: Array.from(distanceByDate.entries()),
  });

  // Update journey progress
  const updated = await updateJourneyProgress(targetJourney.id, totalDistance);

  // Check if journey is completed
  if (updated.journey && totalDistance >= updated.journey.total_distance && !updated.completed_at) {
    const { data: completedJourney, error } = await supabase
      .from('user_journeys')
      .update({
        completed_at: new Date().toISOString(),
        is_active: false,
        current_distance: updated.journey.total_distance,
      })
      .eq('id', targetJourney.id)
      .select(`
        *,
        journey:journeys (*)
      `)
      .single();

    if (error) throw error;
    return completedJourney;
  }

  return updated;
};

