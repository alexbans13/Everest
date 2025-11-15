import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  initialize: async () => {
    console.log('[AUTH] Starting auth initialization');
    try {
      console.log('[AUTH] Fetching current session from Supabase');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn('[AUTH] Error fetching session:', sessionError);
      }
      
      console.log('[AUTH] Session status:', session ? 'Found' : 'Not found');
      if (session?.user) {
        console.log('[AUTH] User ID:', session.user.id);
        console.log('[AUTH] User email:', session.user.email);
      }
      
      set({ session, user: session?.user ?? null, loading: false, initialized: true });

      if (session?.user) {
        console.log('[AUTH] Fetching user profile from database');
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (profileError) {
          console.warn('[AUTH] Error fetching profile:', profileError);
        }
        
        if (profile) {
          console.log('[AUTH] Profile loaded successfully:', { email: profile.email, name: profile.full_name });
          set({ profile });
        } else {
          console.log('[AUTH] No profile found for user');
        }
      }

      console.log('[AUTH] Setting up auth state change listener');
      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('[AUTH] Auth state changed:', event, session ? 'Session found' : 'No session');
        set({ session, user: session?.user ?? null });
        
        if (session?.user) {
          console.log('[AUTH] Fetching profile for new session');
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
            .then(({ data: profile, error }) => {
              if (error) {
                console.warn('[AUTH] Error fetching profile on state change:', error);
              } else if (profile) {
                console.log('[AUTH] Profile updated on state change');
                set({ profile });
              }
            });
        } else {
          console.log('[AUTH] Clearing profile (no session)');
          set({ profile: null });
        }
      });
      
      console.log('[AUTH] Auth initialization completed successfully');
    } catch (error) {
      console.error('[AUTH] Error initializing auth:', error);
      set({ loading: false, initialized: true });
    }
  },
  signOut: async () => {
    console.log('[AUTH] Signing out user');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AUTH] Error signing out:', error);
      } else {
        console.log('[AUTH] Sign out successful');
      }
      set({ session: null, user: null, profile: null });
    } catch (error) {
      console.error('[AUTH] Exception during sign out:', error);
      // Clear state anyway
      set({ session: null, user: null, profile: null });
    }
  },
}));

