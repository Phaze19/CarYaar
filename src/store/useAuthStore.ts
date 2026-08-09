import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (name: string, phone: string, upiId?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

// Temporary mocked auth store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  login: async (name, phone, upiId = '') => {
    set({ isLoading: true });
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    set({
      user: {
        id: 'mock-user-id-' + Math.floor(Math.random() * 1000),
        name,
        phone,
        upi_id: upiId,
        default_fuel_avg: 15.0, // Default 15 km/l
      },
      isLoading: false,
    });
  },
  logout: () => set({ user: null }),
  updateProfile: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));
