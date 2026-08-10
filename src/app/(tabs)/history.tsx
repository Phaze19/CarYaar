import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useTripStore } from '../../store/useTripStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function HistoryScreen() {
  const { user } = useAuthStore();
  const { pastTrips, fetchHistory } = useTripStore();

  useEffect(() => {
    if (user) {
      fetchHistory(user.id);
    }
  }, [user]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2">
          <Text className="text-slate-500 font-medium text-sm mb-1">Past Routes</Text>
          <Text className="text-3xl font-bold text-slate-900 tracking-tight">History</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(100).springify()} className="gap-4">
          {pastTrips.length === 0 ? (
            <View className="p-8 border border-slate-200 border-dashed rounded-2xl items-center justify-center bg-white shadow-sm mt-4">
              <Text className="text-slate-500 font-medium">No past trips found.</Text>
            </View>
          ) : (
            pastTrips.map((trip, index) => (
              <Animated.View 
                key={trip.id} 
                entering={FadeInUp.duration(600).delay(200 + index * 50).springify()}
                className="flex-row justify-between items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-sm"
              >
                <View>
                  <Text className="text-xs text-slate-500 font-medium mb-1">{new Date(trip.date).toLocaleDateString()}</Text>
                  <Text className="text-lg font-bold text-slate-900 tracking-tight">{trip.distance_km} km</Text>
                  <View className={`self-start px-2 py-0.5 rounded mt-1 ${trip.isDriver ? 'bg-slate-100' : 'bg-slate-100'}`}>
                    <Text className="text-slate-600 font-semibold text-[10px] uppercase">
                      {trip.isDriver ? 'Driver' : 'Passenger'}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-xl text-slate-900 tracking-tight">₹{trip.personalShare.toFixed(2)}</Text>
                </View>
              </Animated.View>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
