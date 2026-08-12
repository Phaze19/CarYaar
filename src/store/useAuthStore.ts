import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  completeOnboarding: (phone: string, upiId: string) => Promise<void>;
  bypassLogin: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  needsOnboarding: false,

  checkSession: async () => {
    // 1. Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      set({ user: null, isLoading: false, needsOnboarding: false });
    } else {
      // 2. Fetch user profile from public.users table
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (userProfile) {
        set({ user: userProfile, isLoading: false, needsOnboarding: false });
      } else {
        // They are authenticated via OAuth but haven't finished onboarding (no phone/upi)
        set({ user: null, isLoading: false, needsOnboarding: true });
      }
    }

    // 3. Listen for changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userProfile) {
           set({ user: userProfile, needsOnboarding: false });
        } else {
           set({ needsOnboarding: true });
        }
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, needsOnboarding: false });
      }
    });
  },

  completeOnboarding: async (phone: string, upiId: string) => {
    set({ isLoading: true });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
       alert("No active session found.");
       set({ isLoading: false });
       return;
    }
    
    // Create their profile record
    const newUser = {
      id: session.user.id,
      name: session.user.user_metadata?.full_name || 'New User',
      phone: phone,
      upi_id: upiId,
      default_fuel_avg: 15.0
    };
    
    const { error } = await supabase.from('users').insert(newUser);
    if (error) {
       if (error.code === '23505') {
           alert("This phone number or UPI ID is already registered to another account. Please use different details.");
       } else {
           alert(error.message);
       }
    } else {
       set({ user: newUser, needsOnboarding: false });
    }
    set({ isLoading: false });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, needsOnboarding: false });
  },

  updateProfile: async (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;
    
    const { error } = await supabase.from('users').update(updates).eq('id', currentUser.id);
    if (!error) {
      set({ user: { ...currentUser, ...updates } });
    } else {
      alert(error.message);
    }
  },

  bypassLogin: () => {
    set({
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Dev Tester',
        phone: '+919999999999',
        upi_id: 'dev@upi',
        default_fuel_avg: 15.0
      },
      needsOnboarding: false
    });
  }
}));
