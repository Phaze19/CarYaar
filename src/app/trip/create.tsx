import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Input } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTripStore } from '../../store/useTripStore';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

export default function CreateTripScreen() {
  const { user } = useAuthStore();
  const { setCurrentTrip } = useTripStore();
  const router = useRouter();

  const [distance, setDistance] = useState('22');
  const [fuelPrice, setFuelPrice] = useState('105.5');
  
  const handleCreateTrip = () => {
    if (!user) return;
    
    const dist = parseFloat(distance) || 0;
    const price = parseFloat(fuelPrice) || 0;
    const avg = user.default_fuel_avg || 15;
    
    const totalCost = (dist / avg) * price;
    
    const newTrip = {
      id: 'trip-' + Math.floor(Math.random() * 10000),
      driver_id: user.id,
      date: new Date().toISOString().split('T')[0],
      distance_km: dist,
      fuel_price: price,
      total_cost: totalCost,
      status: 'active' as const,
    };
    
    setCurrentTrip(newTrip);
    router.replace(`/trip/${newTrip.id}`);
  };

  const calculatedCost = ((parseFloat(distance) || 0) / (user?.default_fuel_avg || 15) * (parseFloat(fuelPrice) || 0)).toFixed(2);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-zinc-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          
          <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-10 mt-4">
            <Text className="text-zinc-400 font-medium tracking-widest uppercase text-xs mb-1">New Trip</Text>
            <Text className="text-4xl font-black text-zinc-900 tracking-tighter mb-2">Set Details.</Text>
            <Text className="text-zinc-500 text-sm">Enter the trip parameters below.</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="space-y-6 gap-6">
            <Input 
              variant="underlined"
              label="Total Distance (km)" 
              placeholder="0.0" 
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              classNames={{ input: "text-zinc-900 text-lg", label: "text-zinc-500 font-medium" }}
            />
            <Input 
              variant="underlined"
              label="Fuel Price (per Litre)" 
              placeholder="0.0" 
              value={fuelPrice}
              onChangeText={setFuelPrice}
              keyboardType="decimal-pad"
              classNames={{ input: "text-zinc-900 text-lg", label: "text-zinc-500 font-medium" }}
            />
            
            <View className="p-6 bg-white border border-zinc-200 rounded-3xl mt-4">
              <View className="flex-row justify-between items-baseline mb-4">
                <Text className="text-sm font-medium text-zinc-500">Estimated Cost</Text>
                <Text className="font-black text-3xl text-zinc-900 tracking-tighter">
                  ₹{calculatedCost}
                </Text>
              </View>
              <Text className="text-xs text-zinc-400 leading-relaxed">
                Based on your saved vehicle fuel economy of {user?.default_fuel_avg} km/l. This amount will be split among checked-in passengers.
              </Text>
            </View>

            <View className="mt-8 gap-3">
              <Button 
                className="w-full bg-zinc-900 rounded-full" 
                size="lg" 
                onPress={handleCreateTrip}
              >
                <Text className="text-white font-semibold">Start Trip</Text>
              </Button>
              <Button 
                className="w-full rounded-full border border-zinc-200 bg-transparent" 
                size="lg" 
                onPress={() => router.back()}
              >
                <Text className="text-zinc-600 font-semibold">Cancel</Text>
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
