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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} className="bg-white">
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2">
          <Text className="text-black font-bold text-sm mb-1 uppercase" style={{ fontFamily: 'Poppins_700Bold' }}>Past Routes</Text>
          <Text className="text-5xl font-bold text-black tracking-tight" style={{ fontFamily: 'RacingSansOne_400Regular' }}>HISTORY</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(100).springify()} className="gap-5">
          {pastTrips.length === 0 ? (
            <View className="p-8 border-4 border-black border-dashed rounded-3xl items-center justify-center bg-white mt-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Text className="text-black font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>No past trips found.</Text>
            </View>
          ) : (
            pastTrips.map((trip, index) => (
              <Animated.View 
                key={index} 
                entering={FadeInDown.delay(150 + index * 100).springify()}
                className="flex-row justify-between items-center bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-3xl"
              >
                <View>
                  <Text className="text-xs text-neutral-600 font-bold mb-1" style={{ fontFamily: 'Poppins_700Bold' }}>{new Date(trip.date).toLocaleDateString()}</Text>
                  <Text className="text-3xl font-bold text-black tracking-tight" style={{ fontFamily: 'RacingSansOne_400Regular' }}>{trip.distance_km} km</Text>
                  <View className={`self-start px-2 py-1 border-2 border-black rounded-md mt-2 ${trip.isDriver ? 'bg-yellow-400' : 'bg-red-500'}`}>
                    <Text className={`font-bold text-[10px] uppercase ${trip.isDriver ? 'text-black' : 'text-white'}`} style={{ fontFamily: 'Poppins_700Bold' }}>
                      {trip.isDriver ? 'Driver' : 'Passenger'}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-3xl text-black tracking-tight" style={{ fontFamily: 'RacingSansOne_400Regular' }}>₹{trip.personalShare.toFixed(2)}</Text>
                </View>
              </Animated.View>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
