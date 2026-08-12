import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTripStore } from '../../store/useTripStore';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { currentTrip, fetchActiveTrip } = useTripStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const pulse = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActiveTrip();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchActiveTrip();
    // eslint-disable-next-line react-hooks/immutability
    pulse.value = withRepeat(withSequence(withTiming(0.5, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000000" />}
        className="bg-white"
      >
        
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600).springify()} className="flex-row justify-between items-center mb-8 mt-2">
          <View>
            <Text className="text-black font-bold text-sm mb-1 uppercase" style={{ fontFamily: 'Poppins_700Bold' }}>Welcome back,</Text>
            <Text className="text-4xl font-bold text-black tracking-tight" style={{ fontFamily: 'RacingSansOne_400Regular' }}>{user.name.split(' ')[0]}</Text>
          </View>
          <View className="w-14 h-14 rounded-2xl bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] items-center justify-center">
            <Text className="text-2xl font-bold text-black" style={{ fontFamily: 'RacingSansOne_400Regular' }}>{user.name.charAt(0)}</Text>
          </View>
        </Animated.View>

        {/* Current Trip Status */}
        <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="mb-8">
          <View className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] relative overflow-hidden">
            
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-black font-bold tracking-widest text-sm uppercase" style={{ fontFamily: 'Poppins_700Bold' }}>
                {currentTrip ? 'Active Trip' : 'No Active Trip'}
              </Text>
              {currentTrip && (
                <Animated.View style={pulseStyle} className="bg-red-500 px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Text className="text-white font-bold text-xs" style={{ fontFamily: 'Poppins_700Bold' }}>LIVE</Text>
                </Animated.View>
              )}
            </View>

            {currentTrip ? (
              <View>
                <Text className="text-4xl font-bold text-black tracking-tight mb-1" style={{ fontFamily: 'RacingSansOne_400Regular' }}>{currentTrip.distance_km} km Route</Text>
                <Text className="text-neutral-600 font-bold mb-6 text-lg" style={{ fontFamily: 'Poppins_700Bold' }}>Total Cost: ₹{currentTrip.total_cost.toFixed(2)}</Text>
                
                <Button 
                  className="w-full bg-yellow-400 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-16" 
                  size="lg" 
                  onPress={() => router.push(`/trip/${currentTrip.id}`)}
                >
                  <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>View Dashboard</Text>
                </Button>
              </View>
            ) : (
              <View>
                <Text className="text-3xl font-bold text-neutral-400 tracking-tight mb-2" style={{ fontFamily: 'RacingSansOne_400Regular' }}>No active trip</Text>
                <Text className="text-neutral-500 font-bold mb-6" style={{ fontFamily: 'Poppins_600SemiBold' }}>Start a new trip or ask your driver to check in.</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.duration(800).delay(300).springify()}>
          <Text className="text-2xl font-bold text-black tracking-tight mb-4" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Quick Actions</Text>
          
          <View className="gap-4">
            <Button 
              className="w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl h-16 justify-start px-6" 
              onPress={() => router.push('/trip/create')}
            >
              <View className="flex-row items-center justify-between w-full">
                <View className="flex-row items-center">
                  <View className="w-8 items-center justify-center mr-3">
                    <Feather name="map-pin" size={24} color="#000000" />
                  </View>
                  <Text className="text-black text-lg" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Start a New Trip</Text>
                </View>
                <Feather name="chevron-right" size={24} color="#000000" />
              </View>
            </Button>
            
            <Button 
              className="w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl h-16 justify-start px-6"
              onPress={() => router.push('/(tabs)/balances')}
            >
              <View className="flex-row items-center justify-between w-full">
                <View className="flex-row items-center">
                  <View className="w-8 items-center justify-center mr-3">
                    <Feather name="credit-card" size={24} color="#000000" />
                  </View>
                  <Text className="text-black text-lg" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Settle Balances</Text>
                </View>
                <Feather name="chevron-right" size={24} color="#000000" />
              </View>
            </Button>
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
