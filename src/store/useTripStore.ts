import { create } from 'zustand';
import { Trip, TripRider } from '../types';

interface TripState {
  currentTrip: Trip | null;
  riders: TripRider[];
  setCurrentTrip: (trip: Trip | null) => void;
  setRiders: (riders: TripRider[]) => void;
  addRider: (rider: TripRider) => void;
  updateRiderStatus: (riderId: string, status: 'pending' | 'paid') => void;
}

export const useTripStore = create<TripState>((set) => ({
  currentTrip: null,
  riders: [],
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  setRiders: (riders) => set({ riders }),
  addRider: (rider) => set((state) => ({ riders: [...state.riders, rider] })),
  updateRiderStatus: (riderId, status) =>
    set((state) => ({
      riders: state.riders.map((r) => (r.id === riderId ? { ...r, payment_status: status } : r)),
    })),
}));
