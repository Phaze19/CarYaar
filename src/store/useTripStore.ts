import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Trip, TripRider } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';
import { sendPushNotification } from '../lib/notifications';

interface TripState {
  currentTrip: Trip | null;
  riders: TripRider[];
  channel: RealtimeChannel | null;
  
  currentTrips: Trip[]; // Multiple active trips can be visible now
  
  fetchActiveTrips: (userId: string) => Promise<void>;
  createTrip: (trip: Omit<Trip, 'id' | 'created_at'>) => Promise<Trip | null>;
  addRider: (rider: Omit<TripRider, 'id' | 'created_at'>) => Promise<void>;
  updateRiderStatus: (riderId: string, status: 'pending' | 'paid') => Promise<void>;
  endTrip: (forceTripId?: string) => Promise<void>;
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
  currentTrips: [],
  riders: [],
  channel: null,
  pastTrips: [],
  balances: [],

  fetchActiveTrips: async (userId) => {
    // 1. Get my groups
    const { data: memberData } = await supabase.from('group_members').select('group_id').eq('user_id', userId);
    const groupIds = memberData?.map(m => m.group_id) || [];
    
    // 2. Get my friends
    const { data: friendData } = await supabase.from('friends').select('user1_id, user2_id').eq('status', 'accepted').or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
    const friendIds = friendData?.map(f => f.user1_id === userId ? f.user2_id : f.user1_id) || [];
    // Add myself to friendIds so I can see my own standalone trips
    friendIds.push(userId);
    
    // Fetch trips: either in my groups OR (standalone AND driver is a friend)
    let query = supabase.from('trips').select('*').eq('status', 'active');
    
    if (groupIds.length > 0) {
      query = query.or(`group_id.in.(${groupIds.join(',')}),and(group_id.is.null,driver_id.in.(${friendIds.join(',')}))`);
    } else {
      query = query.is('group_id', null).in('driver_id', friendIds);
    }
    
    const { data: trips } = await query.order('created_at', { ascending: false });

    if (trips) {
      set({ currentTrips: trips });
      // If we have an actively selected trip, make sure it's synced
      const current = get().currentTrip;
      if (!current && trips.length > 0) {
         // Auto select the most relevant one, or let UI handle it
      }
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
      
      // Phase 7: Push Notifications on Trip Creation
      try {
        const { data: driverData } = await supabase.from('users').select('name').eq('id', trip.driver_id).single();
        const driverName = driverData?.name || 'A driver';
        const destStr = (trip as any).destination_name ? ` to ${(trip as any).destination_name}` : '';
        const msg = `A new trip${destStr} has been created by ${driverName}.`;
        
        let targetUserIds: string[] = [];
        
        if (trip.group_id) {
           const { data: members } = await supabase.from('group_members').select('user_id').eq('group_id', trip.group_id);
           if (members) targetUserIds = members.map(m => m.user_id).filter(id => id !== trip.driver_id);
        } else {
           const { data: friends } = await supabase.from('friends').select('user1_id, user2_id').eq('status', 'accepted').or(`user1_id.eq.${trip.driver_id},user2_id.eq.${trip.driver_id}`);
           if (friends) {
             targetUserIds = friends.map(f => f.user1_id === trip.driver_id ? f.user2_id : f.user1_id);
           }
        }
        
        if (targetUserIds.length > 0) {
           const { data: usersData } = await supabase.from('users').select('push_token').in('id', targetUserIds);
           if (usersData) {
             usersData.forEach(u => {
               if (u.push_token) sendPushNotification(u.push_token, 'New Trip Available!', msg);
             });
           }
        }
      } catch (e) {
         console.log("Error sending creation push notification:", e);
      }
      
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

  endTrip: async (forceTripId?: string) => {
    const trip = get().currentTrip;
    const targetTripId = forceTripId || trip?.id;
    
    if (targetTripId) {
      const { error } = await supabase.from('trips').update({ status: 'completed' }).eq('id', targetTripId);
      if (error) {
        console.error(error.message);
        throw error;
      }
      // Fetch riders if we are in a background task context and don't have them in state
      let activeRiders = get().riders;
      let activeTripCost = trip?.total_cost || 0;
      
      if (activeRiders.length === 0 && forceTripId) {
         const { data } = await supabase.from('trip_riders').select('*').eq('trip_id', targetTripId);
         if (data) activeRiders = data;
         
         const { data: tripData } = await supabase.from('trips').select('total_cost').eq('id', targetTripId).single();
         if (tripData) activeTripCost = tripData.total_cost;
      }
      
      // Phase 6: Send push notifications to all passengers
      const riderIds = activeRiders.map(r => r.rider_id);
      if (riderIds.length > 0) {
        const { data: usersData } = await supabase.from('users').select('push_token').in('id', riderIds);
        if (usersData) {
          const costPerRider = activeTripCost / activeRiders.length;
          const msg = `Trip completed! You owe ₹${costPerRider.toFixed(2)}. Open CarYaar to settle.`;
          
          usersData.forEach(u => {
            if (u.push_token) {
              sendPushNotification(u.push_token, 'CarYaar: Ride Complete', msg);
            }
          });
        }
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
        theyOweMe.forEach((record: any) => {
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
