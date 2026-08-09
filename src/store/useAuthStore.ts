import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (name: string, phone: string, upiId?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,

  checkSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      if (data) set({ user: data });
    }
  },

  login: async (name, phone, upiId = '') => {
    set({ isLoading: true });
    
    // Using a synthetic email/password based on phone for rapid frictionless testing without Twilio
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 5) {
      alert("Please enter a valid phone number.");
      set({ isLoading: false });
      return;
    }
    const email = `${cleanPhone}@caryaar.app`;
    const password = 'CarYaarPassword123!';

    let authId = '';

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email, password
    });

    if (signInError) {
      // If not found, sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email, password
      });
      if (signUpError || !signUpData.user) {
        set({ isLoading: false });
        alert(signUpError?.message || 'Error signing up');
        return;
      }
      authId = signUpData.user.id;
      
      const newUser = {
        id: authId,
        name,
        phone,
        upi_id: upiId,
        default_fuel_avg: 15.0
      };
      await supabase.from('users').insert(newUser);
      set({ user: newUser, isLoading: false });
      return;
    }

    authId = signInData.user.id;
    const { data: profile } = await supabase.from('users').select('*').eq('id', authId).single();
    
    if (!profile) {
      const newUser = { id: authId, name, phone, upi_id: upiId, default_fuel_avg: 15.0 };
      await supabase.from('users').insert(newUser);
      set({ user: newUser, isLoading: false });
    } else {
      set({ user: profile, isLoading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
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
}));
