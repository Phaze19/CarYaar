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
  const { currentTrip, fetchActiveTrip } = useTripStore();
  const router = useRouter();

  React.useEffect(() => {
    fetchActiveTrip();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-indigo-50">
      <ScrollView contentContainerStyle={{ padding: 24 }} className="flex-1">
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-4 bg-indigo-600 rounded-3xl p-6 shadow-xl shadow-indigo-300">
          <Text className="text-indigo-200 font-bold tracking-widest uppercase text-xs mb-2">Welcome Back</Text>
          <Text className="text-4xl font-black text-white tracking-tighter">{user?.name?.split(' ')[0]}</Text>
        </Animated.View>

        {currentTrip ? (
          <Animated.View entering={FadeIn.duration(800)}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-bold tracking-widest uppercase text-indigo-800">Active Trip</Text>
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700 text-xs font-bold uppercase">Live</Text>
              </View>
            </View>
            
            <View className="w-full bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100/50 mb-8 border border-indigo-50">
              <View className="flex-row justify-between items-baseline mb-6 border-b border-indigo-50 pb-4">
                <Text className="text-indigo-400 font-bold uppercase text-xs tracking-wider">Total Cost</Text>
                <Text className="text-4xl font-black text-indigo-950 tracking-tighter">
                  ₹{currentTrip.total_cost.toFixed(2)}
                </Text>
              </View>
              
              <View className="flex-row justify-between mb-8">
                <View>
                  <Text className="text-xs text-indigo-400 uppercase font-bold tracking-wider mb-1">Distance</Text>
                  <Text className="font-black text-indigo-950 text-xl">{currentTrip.distance_km} km</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-indigo-400 uppercase font-bold tracking-wider mb-1">Fuel Rate</Text>
                  <Text className="font-black text-indigo-950 text-xl">₹{currentTrip.fuel_price}/L</Text>
                </View>
              </View>

              <Button 
                className="w-full bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200"
                size="lg"
                onPress={() => router.push(`/trip/${currentTrip.id}`)}
              >
                <Text className="text-white font-bold text-lg">View Details</Text>
              </Button>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(800)} className="items-center justify-center py-12 mt-4 bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-6 border border-indigo-50">
            <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center mb-6">
              <Text className="text-indigo-600 text-4xl font-black">GO</Text>
            </View>
            <Text className="text-3xl font-black text-indigo-950 text-center tracking-tight mb-3">Ready to drive?</Text>
            <Text className="text-indigo-500 font-medium text-center mb-10 px-2 leading-relaxed text-base">
              Start a new trip to let your passengers check in and automatically calculate the cost split.
            </Text>
            
            <Button 
              className="w-full bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-300"
              size="lg"
              onPress={() => router.push('/trip/create')}
            >
              <Text className="text-white font-bold text-lg">Start New Trip</Text>
            </Button>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
