import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://doquvglaefcnrsveqbjz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvcXV2Z2xhZWZjbnJzdmVxYmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjczMDEsImV4cCI6MjA3ODc0MzMwMX0.WkfLYUFl_1My9baSZvjBQxbwJZkMRzoNxJ-KHAI5O5E';

console.log('[SUPABASE] Initializing Supabase client');
console.log('[SUPABASE] URL:', supabaseUrl);
console.log('[SUPABASE] Using AsyncStorage for session persistence');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('[SUPABASE] Supabase client initialized successfully');

