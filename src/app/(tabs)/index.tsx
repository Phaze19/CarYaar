import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTripStore } from '../../store/useTripStore';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { currentTrip, fetchActiveTrip } = useTripStore();
  const router = useRouter();

  React.useEffect(() => {
    fetchActiveTrip();
  }, []);

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-slate-900">
      <ScrollView contentContainerStyle={{ padding: 24 }} className="flex-1">
        
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600).springify()} className="flex-row justify-between items-center mb-8 mt-2">
          <View>
            <Text className="text-slate-400 font-medium text-sm mb-1 font-serif">Welcome back,</Text>
            <Text className="text-3xl font-bold text-white tracking-tight font-serif">{user.name.split(' ')[0]}</Text>
          </View>
          <View className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 items-center justify-center">
            <Text className="text-lg font-bold text-cyan-400">{user.name.charAt(0)}</Text>
          </View>
        </Animated.View>

        {/* Current Trip Status */}
        <Animated.View entering={FadeInUp.duration(800).delay(100).springify()} className="mb-8">
          {currentTrip ? (
            <View className="bg-cyan-500/10 p-6 rounded-3xl border border-cyan-500/30">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-cyan-400 font-semibold uppercase tracking-wider text-xs">Active Trip</Text>
                <View className="bg-cyan-500/20 px-2 py-1 rounded">
                  <Text className="text-cyan-400 font-bold text-xs">Live</Text>
                </View>
              </View>
              <Text className="text-white text-2xl font-bold mb-1">{currentTrip.distance_km} km Route</Text>
              <Text className="text-slate-300 font-medium mb-6">Total Cost: ₹{currentTrip.total_cost.toFixed(2)}</Text>
              
              <Button 
                className="w-full bg-cyan-500 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                size="lg"
                onPress={() => router.push(`/trip/${currentTrip.id}`)}
              >
                <Text className="text-slate-950 font-bold text-base">View Dashboard</Text>
              </Button>
            </View>
          ) : (
            <View className="bg-slate-800/80 p-8 border border-slate-700/50 border-dashed rounded-3xl items-center justify-center">
              <View className="w-14 h-14 bg-slate-700/50 rounded-2xl items-center justify-center mb-4">
                <Text className="text-2xl">🚙</Text>
              </View>
              <Text className="text-white font-medium text-lg mb-1">No active trip</Text>
              <Text className="text-slate-400 text-sm text-center">Start a new trip or ask your driver to check in.</Text>
            </View>
          )}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.duration(800).delay(200).springify()}>
          <Text className="text-xl font-bold text-white tracking-tight mb-4">Quick Actions</Text>
          <View className="gap-3">
            <Button 
              className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl flex-row justify-start px-6" 
              size="lg"
              onPress={() => router.push('/trip/create')}
            >
              <Text className="text-2xl mr-3">📍</Text>
              <Text className="text-white font-semibold text-base">Start a New Trip</Text>
            </Button>
            <Button 
              className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl flex-row justify-start px-6" 
              size="lg"
              onPress={() => router.push('/(tabs)/balances')}
            >
              <Text className="text-2xl mr-3">💰</Text>
              <Text className="text-white font-semibold text-base">Settle Balances</Text>
            </Button>
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
