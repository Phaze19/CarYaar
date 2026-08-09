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
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-slate-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          
          <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2">
            <Text className="text-slate-500 font-medium text-sm mb-1">Trip Configuration</Text>
            <Text className="text-3xl font-bold text-slate-900 tracking-tight">Create Trip</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5 gap-5">
            <Input 
              variant="bordered"
              label="Total Distance (km)" 
              placeholder="0.0" 
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              classNames={{ input: "text-slate-900", label: "text-slate-500 font-medium", inputWrapper: "border-slate-200" }}
            />
            <Input 
              variant="bordered"
              label="Fuel Price (per Litre)" 
              placeholder="0.0" 
              value={fuelPrice}
              onChangeText={setFuelPrice}
              keyboardType="decimal-pad"
              classNames={{ input: "text-slate-900", label: "text-slate-500 font-medium", inputWrapper: "border-slate-200" }}
            />
            
            <View className="bg-slate-50 border border-slate-200 p-4 rounded-xl mt-2">
              <View className="flex-row justify-between items-baseline mb-2">
                <Text className="text-sm font-semibold text-slate-700">Estimated Total</Text>
                <Text className="font-bold text-2xl text-slate-900">
                  ₹{calculatedCost}
                </Text>
              </View>
              <Text className="text-xs text-slate-500 leading-relaxed">
                Calculated using your saved economy ({user?.default_fuel_avg} km/l). This will be split among checked-in passengers.
              </Text>
            </View>

            <View className="mt-4 gap-3">
              <Button 
                className="w-full bg-slate-900 rounded-xl" 
                size="lg" 
                isLoading={isCreating}
                onPress={handleCreateTrip}
              >
                <Text className="text-white font-semibold text-base">Initialize Trip</Text>
              </Button>
              <Button 
                className="w-full bg-white border border-slate-200 rounded-xl" 
                size="lg" 
                onPress={() => router.back()}
              >
                <Text className="text-slate-700 font-medium text-base">Cancel</Text>
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
