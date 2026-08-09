import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTripStore } from '../../store/useTripStore';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { currentTrip } = useTripStore();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-zinc-50">
      <ScrollView contentContainerStyle={{ padding: 24 }} className="flex-1">
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-12 mt-4">
          <Text className="text-zinc-400 font-medium tracking-widest uppercase text-xs mb-1">Dashboard</Text>
          <Text className="text-4xl font-black text-zinc-900 tracking-tighter">Hello, {user?.name?.split(' ')[0]}</Text>
        </Animated.View>

        {currentTrip ? (
          <Animated.View entering={FadeIn.duration(800)}>
            <Text className="text-xs font-medium tracking-widest uppercase text-zinc-400 mb-4">Active Trip</Text>
            
            <View className="w-full bg-white border border-zinc-200 rounded-3xl p-6">
              <View className="flex-row justify-between items-baseline mb-6">
                <Text className="text-zinc-500 font-medium">Total Cost</Text>
                <Text className="text-3xl font-black text-zinc-900 tracking-tighter">
                  ₹{currentTrip.total_cost.toFixed(2)}
                </Text>
              </View>
              
              <View className="flex-row justify-between mb-8">
                <View>
                  <Text className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Distance</Text>
                  <Text className="font-semibold text-zinc-800 text-lg">{currentTrip.distance_km} km</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Fuel Rate</Text>
                  <Text className="font-semibold text-zinc-800 text-lg">₹{currentTrip.fuel_price}/L</Text>
                </View>
              </View>

              <Button 
                className="w-full bg-zinc-900 rounded-full"
                size="lg"
                onPress={() => router.push(`/trip/${currentTrip.id}`)}
              >
                <Text className="text-white font-semibold">View Details</Text>
              </Button>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(800)} className="items-center justify-center py-16 mt-4">
            <View className="w-20 h-20 bg-zinc-100 border border-zinc-200 rounded-full items-center justify-center mb-6">
              <Text className="text-zinc-300 text-2xl font-black">---</Text>
            </View>
            <Text className="text-2xl font-bold text-zinc-800 text-center tracking-tight mb-3">Ready to drive?</Text>
            <Text className="text-zinc-500 text-center mb-10 px-4 leading-relaxed">
              Start a new trip to let your passengers check in and automatically calculate the cost split.
            </Text>
            
            <Button 
              className="w-full bg-zinc-900 rounded-full"
              size="lg"
              onPress={() => router.push('/trip/create')}
            >
              <Text className="text-white font-semibold">Start Trip</Text>
            </Button>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
