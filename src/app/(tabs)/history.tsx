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
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-slate-900">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2">
          <Text className="text-slate-300 font-medium text-sm mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>Past Routes</Text>
          <Text className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Poppins_700Bold' }}>History</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(100).springify()} className="gap-4">
          {pastTrips.length === 0 ? (
            <View className="p-8 border border-slate-700/50 border-dashed rounded-3xl items-center justify-center bg-slate-800/80 mt-4">
              <Text className="text-slate-300 font-medium" style={{ fontFamily: 'Poppins_500Medium' }}>No past trips found.</Text>
            </View>
          ) : (
            pastTrips.map((trip, index) => (
              <Animated.View 
                key={trip.id} 
                entering={FadeInUp.duration(600).delay(200 + index * 50).springify()}
                className="flex-row justify-between items-center bg-slate-800/80 border border-slate-700/50 p-5 rounded-3xl"
              >
                <View>
                  <Text className="text-xs text-slate-300 font-medium mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>{new Date(trip.date).toLocaleDateString()}</Text>
                  <Text className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'Poppins_600SemiBold' }}>{trip.distance_km} km</Text>
                  <View className={`self-start px-2 py-0.5 rounded-md mt-1 ${trip.isDriver ? 'bg-cyan-500/20' : 'bg-slate-700/50'}`}>
                    <Text className={`font-semibold text-[10px] uppercase ${trip.isDriver ? 'text-cyan-400' : 'text-slate-200'}`} style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      {trip.isDriver ? 'Driver' : 'Passenger'}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-xl text-white tracking-tight" style={{ fontFamily: 'Poppins_700Bold' }}>₹{trip.personalShare.toFixed(2)}</Text>
                </View>
              </Animated.View>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
