import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    // Ensure we have an anonymous token for RLS
    await supabase.auth.signInAnonymously(); 
    
    const savedPhone = await AsyncStorage.getItem('caryaar_user_phone');
    if (savedPhone) {
      const { data } = await supabase.from('users').select('*').eq('phone', savedPhone).single();
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

    // Ensure we have an anonymous session for database access
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

    if (authError || !authData.user) {
      set({ isLoading: false });
      alert(authError?.message || 'Error authenticating.');
      return;
    }

    // Check if the phone already exists in our database
    const { data: existingUsers } = await supabase.from('users').select('*').eq('phone', phone);
    
    if (existingUsers && existingUsers.length > 0) {
      // User exists! Just load their data
      await AsyncStorage.setItem('caryaar_user_phone', phone);
      set({ user: existingUsers[0], isLoading: false });
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

    await AsyncStorage.setItem('caryaar_user_phone', phone);
    set({ user: newUser, isLoading: false });
  },

  logout: async () => {
    await AsyncStorage.removeItem('caryaar_user_phone');
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
