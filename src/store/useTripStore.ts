import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Trip, TripRider } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

interface TripState {
  currentTrip: Trip | null;
  riders: TripRider[];
  channel: RealtimeChannel | null;
  
  fetchActiveTrip: () => Promise<void>;
  createTrip: (trip: Omit<Trip, 'id' | 'created_at'>) => Promise<Trip | null>;
  addRider: (rider: Omit<TripRider, 'id' | 'created_at'>) => Promise<void>;
  updateRiderStatus: (riderId: string, status: 'pending' | 'paid') => Promise<void>;
  endTrip: () => Promise<void>;
  subscribeToRiders: (tripId: string) => void;
  unsubscribeFromRiders: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  currentTrip: null,
  riders: [],
  channel: null,

  fetchActiveTrip: async () => {
    // For V1 MVP: Just grab the latest active trip in the database
    // In production, you'd filter by trips in the user's group or via a join code.
    const { data: trips } = await supabase
      .from('trips')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (trips && trips.length > 0) {
      set({ currentTrip: trips[0] });
      get().subscribeToRiders(trips[0].id);
    }
  },

  createTrip: async (trip) => {
    const { data, error } = await supabase.from('trips').insert(trip).select().single();
    if (error) {
      alert(error.message);
      return null;
    }
    if (data) {
      set({ currentTrip: data });
      get().subscribeToRiders(data.id);
      return data;
    }
    return null;
  },

  addRider: async (rider) => {
    const { error } = await supabase.from('trip_riders').insert(rider);
    if (error) alert(error.message);
  },

  updateRiderStatus: async (riderId, status) => {
    const { error } = await supabase
      .from('trip_riders')
      .update({ payment_status: status })
      .eq('id', riderId);
    if (error) alert(error.message);
  },

  endTrip: async () => {
    const trip = get().currentTrip;
    if (trip) {
      await supabase.from('trips').update({ status: 'completed' }).eq('id', trip.id);
    }
    get().unsubscribeFromRiders();
    set({ currentTrip: null, riders: [] });
  },

  subscribeToRiders: async (tripId) => {
    get().unsubscribeFromRiders();

    // Fetch initial state
    const { data } = await supabase.from('trip_riders').select('*').eq('trip_id', tripId);
    if (data) set({ riders: data });

    const channel = supabase
      .channel('trip-riders-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trip_riders', filter: `trip_id=eq.${tripId}` },
        async () => {
          // Re-fetch riders on any change for simplicity
          const { data: updatedRiders } = await supabase.from('trip_riders').select('*').eq('trip_id', tripId);
          if (updatedRiders) set({ riders: updatedRiders });
        }
      )
      .subscribe();

    set({ channel });
  },

  unsubscribeFromRiders: () => {
    const { channel } = get();
    if (channel) supabase.removeChannel(channel);
    set({ channel: null });
  }
}));
