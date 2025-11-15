import { create } from 'zustand';
import { Journey, UserJourney, Milestone, UserMilestone } from '../types';
import { supabase } from '../lib/supabase';

interface JourneyState {
  journeys: Journey[];
  activeJourney: UserJourney | null;
  milestones: Milestone[];
  achievedMilestones: UserMilestone[];
  loading: boolean;
  fetchJourneys: () => Promise<void>;
  fetchActiveJourney: (userId: string) => Promise<void>;
  fetchMilestones: (journeyId: string) => Promise<void>;
  fetchAchievedMilestones: (userId: string, userJourneyId: string) => Promise<void>;
  startJourney: (userId: string, journeyId: string) => Promise<void>;
  updateProgress: (userJourneyId: string, distanceTraveled: number) => Promise<void>;
}

export const useJourneyStore = create<JourneyState>((set, get) => ({
  journeys: [],
  activeJourney: null,
  milestones: [],
  achievedMilestones: [],
  loading: false,
  fetchJourneys: async () => {
    console.log('[JOURNEY] Fetching available journeys');
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('journeys')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[JOURNEY] Error fetching journeys from database:', error);
        throw error;
      }
      
      console.log('[JOURNEY] Journeys fetched successfully:', data?.length || 0, 'journeys found');
      if (data && data.length > 0) {
        data.forEach((journey, index) => {
          console.log(`[JOURNEY] Journey ${index + 1}:`, { id: journey.id, name: journey.name, distance: journey.total_distance });
        });
      }
      
      set({ journeys: data || [], loading: false });
    } catch (error) {
      console.error('[JOURNEY] Error fetching journeys:', error);
      set({ loading: false });
    }
  },
  fetchActiveJourney: async (userId: string) => {
    console.log('[JOURNEY] Fetching active journey for user:', userId);
    try {
      const { data, error } = await supabase
        .from('user_journeys')
        .select(`
          *,
          journey:journeys(*)
        `)
        .eq('user_id', userId)
        .is('completed_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[JOURNEY] Error fetching active journey:', error);
        throw error;
      }
      
      if (error && error.code === 'PGRST116') {
        console.log('[JOURNEY] No active journey found for user');
      }
      
      if (data) {
        console.log('[JOURNEY] Active journey found:', { 
          id: data.id, 
          journeyName: (data as any).journey?.name,
          distanceTraveled: data.distance_traveled 
        });
        set({ activeJourney: data as UserJourney });
        console.log('[JOURNEY] Fetching milestones for journey:', data.journey_id);
        await get().fetchMilestones(data.journey_id);
        console.log('[JOURNEY] Fetching achieved milestones');
        await get().fetchAchievedMilestones(userId, data.id);
      } else {
        console.log('[JOURNEY] No active journey, setting to null');
        set({ activeJourney: null });
      }
    } catch (error) {
      console.error('[JOURNEY] Error fetching active journey:', error);
    }
  },
  fetchMilestones: async (journeyId: string) => {
    console.log('[JOURNEY] Fetching milestones for journey:', journeyId);
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('journey_id', journeyId)
        .order('"order"', { ascending: true });

      if (error) {
        console.error('[JOURNEY] Error fetching milestones:', error);
        throw error;
      }
      
      console.log('[JOURNEY] Milestones fetched:', data?.length || 0, 'milestones found');
      set({ milestones: data || [] });
    } catch (error) {
      console.error('[JOURNEY] Error fetching milestones:', error);
    }
  },
  fetchAchievedMilestones: async (userId: string, userJourneyId: string) => {
    console.log('[JOURNEY] Fetching achieved milestones for user journey:', userJourneyId);
    try {
      const { data, error } = await supabase
        .from('user_milestones')
        .select(`
          *,
          milestone:milestones(*)
        `)
        .eq('user_id', userId)
        .eq('user_journey_id', userJourneyId)
        .order('achieved_at', { ascending: true });

      if (error) {
        console.error('[JOURNEY] Error fetching achieved milestones:', error);
        throw error;
      }
      
      console.log('[JOURNEY] Achieved milestones fetched:', data?.length || 0, 'milestones achieved');
      set({ achievedMilestones: data || [] });
    } catch (error) {
      console.error('[JOURNEY] Error fetching achieved milestones:', error);
    }
  },
  startJourney: async (userId: string, journeyId: string) => {
    console.log('[JOURNEY] Starting journey for user:', { userId, journeyId });
    try {
      const { data, error } = await supabase
        .from('user_journeys')
        .insert({
          user_id: userId,
          journey_id: journeyId,
          distance_traveled: 0,
        })
        .select(`
          *,
          journey:journeys(*)
        `)
        .single();

      if (error) {
        console.error('[JOURNEY] Error starting journey:', error);
        throw error;
      }
      
      console.log('[JOURNEY] Journey started successfully:', { 
        userJourneyId: data.id, 
        journeyName: (data as any).journey?.name 
      });
      set({ activeJourney: data as UserJourney });
      await get().fetchMilestones(journeyId);
    } catch (error) {
      console.error('[JOURNEY] Error starting journey:', error);
      throw error;
    }
  },
  updateProgress: async (userJourneyId: string, distanceTraveled: number) => {
    console.log('[JOURNEY] Updating progress:', { userJourneyId, distanceTraveled: `${(distanceTraveled / 1000).toFixed(2)} km` });
    try {
      const { error } = await supabase
        .from('user_journeys')
        .update({ distance_traveled: distanceTraveled })
        .eq('id', userJourneyId);

      if (error) {
        console.error('[JOURNEY] Error updating progress in database:', error);
        throw error;
      }

      console.log('[JOURNEY] Progress updated successfully in database');
      // Update local state
      const activeJourney = get().activeJourney;
      if (activeJourney) {
        set({ activeJourney: { ...activeJourney, distance_traveled: distanceTraveled } });
        console.log('[JOURNEY] Local state updated with new progress');
      }
    } catch (error) {
      console.error('[JOURNEY] Error updating progress:', error);
    }
  },
}));

