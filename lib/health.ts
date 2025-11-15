import { supabase } from './supabase';
import { HealthData, HealthDataSource } from '@/types';

export const syncHealthData = async (
  date: string,
  steps: number,
  distance: number,
  source: HealthDataSource['source_type'],
  calories?: number,
  elevation?: number
): Promise<HealthData> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if data already exists for this date
  const { data: existing } = await supabase
    .from('health_data')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .eq('source', source)
    .single();

  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('health_data')
      .update({
        steps,
        distance,
        calories,
        elevation: elevation ?? 0,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('health_data')
      .insert({
        user_id: user.id,
        date,
        steps,
        distance,
        calories,
        elevation: elevation ?? 0,
        source,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const getHealthData = async (startDate: string, endDate: string): Promise<HealthData[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('health_data')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const connectHealthSource = async (
  sourceType: HealthDataSource['source_type']
): Promise<HealthDataSource> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if connection already exists
  const { data: existing } = await supabase
    .from('health_data_sources')
    .select('*')
    .eq('user_id', user.id)
    .eq('source_type', sourceType)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('health_data_sources')
      .update({ is_connected: true })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('health_data_sources')
      .insert({
        user_id: user.id,
        source_type: sourceType,
        is_connected: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const disconnectHealthSource = async (sourceType: HealthDataSource['source_type']) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('health_data_sources')
    .update({ is_connected: false })
    .eq('user_id', user.id)
    .eq('source_type', sourceType);

  if (error) throw error;
};

export const getConnectedSources = async (): Promise<HealthDataSource[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('health_data_sources')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_connected', true);

  if (error) throw error;
  return data || [];
};

// Sync multiple days of health data at once
export const syncMultipleHealthData = async (
  healthDataArray: Array<{
    date: string;
    steps: number;
    distance: number;
    elevation?: number;
    calories?: number;
    source: HealthDataSource['source_type'];
  }>
): Promise<HealthData[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const results: HealthData[] = [];

  for (const data of healthDataArray) {
    try {
      const synced = await syncHealthData(
        data.date,
        data.steps,
        data.distance,
        data.source,
        data.calories,
        data.elevation
      );
      results.push(synced);
    } catch (error) {
      console.error(`Error syncing data for ${data.date}:`, error);
    }
  }

  return results;
};

// Ensure health data records exist for the last 7 days (with 0s if missing)
export const ensureHealthDataRecords = async (): Promise<void> => {
  const today = new Date();

  // Create records for the last 7 days using syncHealthData (which handles upsert)
  for (let i = 0; i <= 6; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    try {
      // Check if record exists first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing, error: checkError } = await supabase
        .from('health_data')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', dateString)
        .eq('source', 'manual')
        .maybeSingle();

      // Only insert if it doesn't exist (and no error checking)
      if (!existing && !checkError) {
        await syncHealthData(dateString, 0, 0, 'manual', 0, 0);
      }
    } catch (error) {
      // Ignore errors - this is a best-effort operation
      console.error(`Error ensuring health data record for ${dateString}:`, error);
    }
  }
};

