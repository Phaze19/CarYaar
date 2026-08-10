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
  
  // New features for Phase 5
  pastTrips: import('../types').TripHistory[];
  balances: import('../types').Balance[];
  fetchHistory: (userId: string) => Promise<void>;
  fetchBalances: (userId: string) => Promise<void>;
  settleWithUser: (myUserId: string, otherUserId: string) => Promise<void>;
}

export const useTripStore = create<TripState>((set, get) => ({
  currentTrip: null,
  riders: [],
  channel: null,
  pastTrips: [],
  balances: [],

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
      const { error } = await supabase.from('trips').update({ status: 'completed' }).eq('id', trip.id);
      if (error) {
        alert(error.message);
        throw error;
      }
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
  },

  fetchHistory: async (userId) => {
    // Fetch trips where user is driver
    const { data: driverTrips } = await supabase.from('trips').select('*').eq('driver_id', userId).eq('status', 'completed');
    
    // Fetch trips where user is rider
    const { data: riderRecords } = await supabase.from('trip_riders').select('*, trips(*)').eq('rider_id', userId);
    
    const history: import('../types').TripHistory[] = [];
    
    if (driverTrips) {
      for (const trip of driverTrips) {
        history.push({ ...trip, isDriver: true, personalShare: trip.total_cost });
      }
    }
    
    if (riderRecords) {
      for (const record of riderRecords) {
        if (record.trips && record.trips.status === 'completed') {
          history.push({ ...record.trips, isDriver: false, personalShare: record.share_amount || 0 });
        }
      }
    }
    
    // Sort by date/created_at descending
    history.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    set({ pastTrips: history });
  },

  fetchBalances: async (userId) => {
    // 1. Fetch pending riders on MY trips (They owe me)
    const { data: myTrips } = await supabase.from('trips').select('id').eq('driver_id', userId);
    const myTripIds = myTrips?.map(t => t.id) || [];
    
    let balancesMap: Record<string, import('../types').Balance> = {};
    
    if (myTripIds.length > 0) {
      const { data: theyOweMe } = await supabase
        .from('trip_riders')
        .select('rider_id, share_amount, users!trip_riders_rider_id_fkey(name)')
        .in('trip_id', myTripIds)
        .eq('payment_status', 'pending');
        
      if (theyOweMe) {
        theyOweMe.forEach(record => {
          if (!balancesMap[record.rider_id]) {
            balancesMap[record.rider_id] = { otherUserId: record.rider_id, otherUserName: record.users?.name || 'Unknown', netAmount: 0 };
          }
          balancesMap[record.rider_id].netAmount += (record.share_amount || 0);
        });
      }
    }
    
    // 2. Fetch pending trips where I am the rider (I owe them)
    const { data: iOweThem } = await supabase
      .from('trip_riders')
      .select('share_amount, trips!inner(driver_id), trips!inner(users!trips_driver_id_fkey(name))')
      .eq('rider_id', userId)
      .eq('payment_status', 'pending');
      
    if (iOweThem) {
      iOweThem.forEach((record: any) => {
        const driverId = record.trips?.driver_id;
        const driverName = record.trips?.users?.name || 'Unknown';
        if (driverId) {
          if (!balancesMap[driverId]) {
            balancesMap[driverId] = { otherUserId: driverId, otherUserName: driverName, netAmount: 0 };
          }
          balancesMap[driverId].netAmount -= (record.share_amount || 0);
        }
      });
    }
    
    // Remove users with exactly 0 net balance
    const finalBalances = Object.values(balancesMap).filter(b => Math.abs(b.netAmount) > 0.01);
    set({ balances: finalBalances });
  },

  settleWithUser: async (myUserId, otherUserId) => {
    // 1. Settle my debts to them
    const { data: myDebts } = await supabase
      .from('trip_riders')
      .select('id, trips!inner(driver_id)')
      .eq('rider_id', myUserId)
      .eq('payment_status', 'pending');
      
    const debtIds = myDebts?.filter((d: any) => d.trips?.driver_id === otherUserId).map(d => d.id) || [];
    if (debtIds.length > 0) {
      await supabase.from('trip_riders').update({ payment_status: 'paid' }).in('id', debtIds);
    }
    
    // 2. Settle their debts to me
    const { data: myTrips } = await supabase.from('trips').select('id').eq('driver_id', myUserId);
    const myTripIds = myTrips?.map(t => t.id) || [];
    
    if (myTripIds.length > 0) {
      await supabase
        .from('trip_riders')
        .update({ payment_status: 'paid' })
        .eq('rider_id', otherUserId)
        .eq('payment_status', 'pending')
        .in('trip_id', myTripIds);
    }
    
    get().fetchBalances(myUserId);
  }
}));
