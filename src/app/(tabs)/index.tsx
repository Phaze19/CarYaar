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
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 24 }} className="flex-1">
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2">
          <Text className="text-slate-500 font-medium text-sm mb-1">Overview</Text>
          <Text className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</Text>
        </Animated.View>

        {currentTrip ? (
          <Animated.View entering={FadeIn.duration(800)}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-semibold text-slate-700">Active Trip</Text>
              <View className="bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
                <Text className="text-teal-700 text-xs font-semibold">In Progress</Text>
              </View>
            </View>
            
            <View className="w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
              <View className="flex-row justify-between items-baseline mb-6 border-b border-slate-100 pb-4">
                <Text className="text-slate-500 font-medium text-sm">Estimated Total</Text>
                <Text className="text-3xl font-bold text-slate-900 tracking-tight">
                  ₹{currentTrip.total_cost.toFixed(2)}
                </Text>
              </View>
              
              <View className="flex-row justify-between mb-8">
                <View>
                  <Text className="text-xs text-slate-500 font-medium mb-1">Distance</Text>
                  <Text className="font-semibold text-slate-900 text-lg">{currentTrip.distance_km} km</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-slate-500 font-medium mb-1">Fuel Rate</Text>
                  <Text className="font-semibold text-slate-900 text-lg">₹{currentTrip.fuel_price}/L</Text>
                </View>
              </View>

              <Button 
                className="w-full bg-slate-900 rounded-xl"
                size="lg"
                onPress={() => router.push(`/trip/${currentTrip.id}`)}
              >
                <Text className="text-white font-semibold text-base">View Details</Text>
              </Button>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(800)} className="items-center justify-center py-10 mt-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <View className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200 items-center justify-center mb-6">
              <Text className="text-slate-400 text-2xl font-bold">+</Text>
            </View>
            <Text className="text-xl font-bold text-slate-900 text-center tracking-tight mb-2">No Active Trips</Text>
            <Text className="text-slate-500 text-center mb-8 px-2 text-sm leading-relaxed">
              Start a new trip to let passengers check in and track shared costs automatically.
            </Text>
            
            <Button 
              className="w-full bg-slate-900 rounded-xl"
              size="lg"
              onPress={() => router.push('/trip/create')}
            >
              <Text className="text-white font-semibold text-base">Create Trip</Text>
            </Button>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
