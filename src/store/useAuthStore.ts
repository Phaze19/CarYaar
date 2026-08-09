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
    
    if (!name || !phone) {
      alert("Name and Phone are required.");
      set({ isLoading: false });
      return;
    }

    // Use Anonymous Sign-in to bypass strict email provider limits
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

    if (authError || !authData.user) {
      set({ isLoading: false });
      alert(authError?.message || 'Error authenticating.');
      return;
    }

    const authId = authData.user.id;
    
    // Anonymous users always get a brand new UUID, so we insert a new row
    const newUser = { 
      id: authId, 
      name, 
      phone, 
      upi_id: upiId, 
      default_fuel_avg: 15.0 
    };
    
    const { error: insertError } = await supabase.from('users').insert(newUser);
    
    if (insertError) {
      alert(insertError.message);
      set({ isLoading: false });
      return;
    }

    set({ user: newUser, isLoading: false });
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
