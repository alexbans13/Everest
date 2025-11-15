import { create } from 'zustand';
import { HealthSource, HealthData } from '../types';
import { supabase } from '../lib/supabase';
import { fetchHealthData } from '../lib/health-api';

interface HealthState {
  activeSource: HealthSource | null;
  healthSources: HealthSource[];
  healthData: HealthData | null;
  loading: boolean;
  fetchHealthSources: (userId: string) => Promise<void>;
  setActiveSource: (source: HealthSource | null) => Promise<void>;
  connectHealthSource: (userId: string, sourceType: HealthSource['source_type']) => Promise<void>;
  fetchHealthData: () => Promise<void>;
  refreshHealthData: () => Promise<void>;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  activeSource: null,
  healthSources: [],
  healthData: null,
  loading: false,
  fetchHealthSources: async (userId: string) => {
    console.log('[HEALTH] Fetching health sources for user:', userId);
    try {
      const { data, error } = await supabase
        .from('health_sources')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[HEALTH] Error fetching health sources:', error);
        throw error;
      }
      
      const sources = data || [];
      console.log('[HEALTH] Health sources fetched:', sources.length, 'sources found');
      set({ healthSources: sources });
      
      // Set active source
      const active = sources.find(s => s.is_active);
      if (active) {
        console.log('[HEALTH] Active health source found:', active.source_type);
        set({ activeSource: active });
      } else {
        console.log('[HEALTH] No active health source found');
      }
    } catch (error) {
      console.error('[HEALTH] Error fetching health sources:', error);
    }
  },
  setActiveSource: async (source: HealthSource | null) => {
    console.log('[HEALTH] Setting active health source:', source?.source_type || 'null');
    try {
      // Deactivate all sources
      if (get().healthSources.length > 0) {
        console.log('[HEALTH] Deactivating all health sources');
        const { error: deactivateError } = await supabase
          .from('health_sources')
          .update({ is_active: false })
          .eq('user_id', source?.user_id || '');
        
        if (deactivateError) {
          console.warn('[HEALTH] Error deactivating sources:', deactivateError);
        }
      }

      // Activate selected source
      if (source) {
        console.log('[HEALTH] Activating health source:', source.id);
        const { error: activateError } = await supabase
          .from('health_sources')
          .update({ is_active: true })
          .eq('id', source.id);
        
        if (activateError) {
          console.error('[HEALTH] Error activating source:', activateError);
        } else {
          console.log('[HEALTH] Health source activated successfully');
        }
      }

      set({ activeSource: source });
      await get().fetchHealthSources(source?.user_id || '');
    } catch (error) {
      console.error('[HEALTH] Error setting active source:', error);
    }
  },
  connectHealthSource: async (userId: string, sourceType: HealthSource['source_type']) => {
    console.log('[HEALTH] Connecting health source:', { userId, sourceType });
    try {
      const { data, error } = await supabase
        .from('health_sources')
        .insert({
          user_id: userId,
          source_type: sourceType,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('[HEALTH] Error inserting health source:', error);
        throw error;
      }
      
      console.log('[HEALTH] Health source connected successfully:', data.id);
      await get().fetchHealthSources(userId);
      set({ activeSource: data });
    } catch (error) {
      console.error('[HEALTH] Error connecting health source:', error);
      throw error;
    }
  },
  fetchHealthData: async () => {
    const activeSource = get().activeSource;
    if (!activeSource) {
      console.log('[HEALTH] No active health source, skipping data fetch');
      set({ healthData: null });
      return;
    }

    console.log('[HEALTH] Fetching health data from source:', activeSource.source_type);
    set({ loading: true });
    try {
      const data = await fetchHealthData(activeSource.source_type);
      console.log('[HEALTH] Health data fetched successfully:', { 
        steps: data.steps, 
        distance: data.distance ? `${(data.distance / 1000).toFixed(2)} km` : 'N/A',
        date: data.date 
      });
      set({ healthData: data, loading: false });
    } catch (error) {
      console.error('[HEALTH] Error fetching health data:', error);
      set({ loading: false });
    }
  },
  refreshHealthData: async () => {
    console.log('[HEALTH] Refreshing health data (manual refresh)');
    await get().fetchHealthData();
  },
}));

