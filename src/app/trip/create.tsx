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
  const { createTrip } = useTripStore();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const [distance, setDistance] = useState('22');
  const [fuelPrice, setFuelPrice] = useState('105.5');
  
  const handleCreateTrip = async () => {
    if (!user) return;
    
    setIsCreating(true);
    const dist = parseFloat(distance) || 0;
    const price = parseFloat(fuelPrice) || 0;
    const avg = user.default_fuel_avg || 15;
    
    const totalCost = (dist / avg) * price;
    
    const newTrip = {
      driver_id: user.id,
      date: new Date().toISOString().split('T')[0],
      distance_km: dist,
      fuel_price: price,
      total_cost: totalCost,
      status: 'active' as const,
    };
    
    const created = await createTrip(newTrip);
    setIsCreating(false);
    
    if (created) {
      router.replace(`/trip/${created.id}`);
    }
  };

  const calculatedCost = ((parseFloat(distance) || 0) / (user?.default_fuel_avg || 15) * (parseFloat(fuelPrice) || 0)).toFixed(2);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-indigo-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          
          <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-10 mt-4">
            <Text className="text-indigo-500 font-bold tracking-widest uppercase text-xs mb-2">New Journey</Text>
            <Text className="text-5xl font-black text-indigo-950 tracking-tighter mb-2">Set Details.</Text>
            <Text className="text-indigo-600 font-medium text-base">Enter the trip parameters below.</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="space-y-6 gap-6">
            <Input 
              variant="flat"
              color="primary"
              label="Total Distance (km)" 
              placeholder="0.0" 
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              style={{ color: '#1e1b4b', fontSize: 18, fontWeight: '600' }}
            />
            <Input 
              variant="flat"
              color="primary"
              label="Fuel Price (per Litre)" 
              placeholder="0.0" 
              value={fuelPrice}
              onChangeText={setFuelPrice}
              keyboardType="decimal-pad"
              style={{ color: '#1e1b4b', fontSize: 18, fontWeight: '600' }}
            />
            
            <View className="p-6 bg-indigo-600 rounded-3xl mt-4 shadow-xl shadow-indigo-300">
              <View className="flex-row justify-between items-baseline mb-4 border-b border-indigo-400 pb-4">
                <Text className="text-sm font-bold text-indigo-200 uppercase tracking-wider">Estimated Cost</Text>
                <Text className="font-black text-4xl text-white tracking-tighter">
                  ₹{calculatedCost}
                </Text>
              </View>
              <Text className="text-sm text-indigo-100 leading-relaxed font-medium">
                Based on your saved vehicle fuel economy of {user?.default_fuel_avg} km/l. This amount will be split among checked-in passengers.
              </Text>
            </View>

            <View className="mt-8 gap-4">
              <Button 
                className="w-full bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-300" 
                size="lg" 
                isLoading={isCreating}
                onPress={handleCreateTrip}
              >
                <Text className="text-white font-bold text-lg">Start Trip</Text>
              </Button>
              <Button 
                className="w-full rounded-2xl bg-indigo-100" 
                size="lg" 
                onPress={() => router.back()}
              >
                <Text className="text-indigo-800 font-bold text-lg">Cancel</Text>
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
