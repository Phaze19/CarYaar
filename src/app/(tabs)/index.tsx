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
    pulse.value = withRepeat(withSequence(withTiming(0.5, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1);
  }, []);

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#facc15" />}
      >
        
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600).springify()} className="flex-row justify-between items-center mb-8 mt-2">
          <View>
            <Text className="text-neutral-400 font-medium text-sm mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>Welcome back,</Text>
            <Text className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Poppins_700Bold' }}>{user.name.split(' ')[0]}</Text>
          </View>
          <View className="w-12 h-12 rounded-2xl bg-yellow-400/20 border border-yellow-400/30 items-center justify-center">
            <Text className="text-lg font-bold text-yellow-400" style={{ fontFamily: 'Poppins_700Bold' }}>{user.name.charAt(0)}</Text>
          </View>
        </Animated.View>

        {/* Current Trip Status */}
        <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="mb-8">
          <View className="bg-neutral-900/80 p-6 rounded-3xl border border-neutral-800 relative overflow-hidden">
            
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-yellow-400 font-bold tracking-widest text-xs uppercase" style={{ fontFamily: 'Poppins_700Bold' }}>
                {currentTrip ? 'Active Trip' : 'No Active Trip'}
              </Text>
              {currentTrip && (
                <Animated.View style={pulseStyle} className="bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-400/30">
                  <Text className="text-yellow-400 font-bold text-xs" style={{ fontFamily: 'Poppins_700Bold' }}>Live</Text>
                </Animated.View>
              )}
            </View>

            {currentTrip ? (
              <View>
                <Text className="text-3xl font-bold text-white tracking-tight mb-1" style={{ fontFamily: 'Poppins_700Bold' }}>{currentTrip.distance_km} km Route</Text>
                <Text className="text-neutral-400 font-medium mb-6" style={{ fontFamily: 'Poppins_500Medium' }}>Total Cost: ₹{currentTrip.total_cost.toFixed(2)}</Text>
                
                <Button 
                  className="w-full bg-yellow-400 rounded-2xl shadow-[0_0_15px_rgba(250,204,21,0.4)]" 
                  size="lg" 
                  onPress={() => router.push(`/trip/${currentTrip.id}`)}
                >
                  <Text className="text-black font-bold text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>View Dashboard</Text>
                </Button>
              </View>
            ) : (
              <View>
                <Text className="text-3xl font-bold text-neutral-600 tracking-tight mb-2" style={{ fontFamily: 'Poppins_700Bold' }}>No active trip</Text>
                <Text className="text-neutral-500 font-medium mb-6" style={{ fontFamily: 'Poppins_500Medium' }}>Start a new trip or ask your driver to check in.</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.duration(800).delay(300).springify()}>
          <Text className="text-xl font-bold text-white tracking-tight mb-4" style={{ fontFamily: 'Poppins_700Bold' }}>Quick Actions</Text>
          
          <View className="gap-3">
            <Button 
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl h-16 justify-start px-6" 
              onPress={() => router.push('/trip/create')}
            >
              <View className="flex-row items-center justify-between w-full">
                <View className="flex-row items-center">
                  <View className="w-8 items-center justify-center mr-3">
                    <Feather name="map-pin" size={20} color="#facc15" />
                  </View>
                  <Text className="text-white font-semibold text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>Start a New Trip</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#737373" />
              </View>
            </Button>
            
            <Button 
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl h-16 justify-start px-6"
              onPress={() => router.push('/(tabs)/balances')}
            >
              <View className="flex-row items-center justify-between w-full">
                <View className="flex-row items-center">
                  <View className="w-8 items-center justify-center mr-3">
                    <Feather name="credit-card" size={20} color="#facc15" />
                  </View>
                  <Text className="text-white font-semibold text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>Settle Balances</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#737373" />
              </View>
            </Button>
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
