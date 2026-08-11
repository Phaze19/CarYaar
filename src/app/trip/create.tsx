import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native';
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

  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState('');
  const [fuelPrice, setFuelPrice] = useState('100');
  
  const handleCreateTrip = async () => {
    if (!user || !distance || !fuelPrice) {
      alert("Please enter both distance and fuel price.");
      return;
    }
    
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
      if (destination) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
        try {
          await Linking.openURL(url);
        } catch (e) {
          console.log("Could not open Google Maps", e);
        }
      }
      router.replace(`/trip/${created.id}`);
    }
  };

  const calculatedCost = ((parseFloat(distance) || 0) / (user?.default_fuel_avg || 15) * (parseFloat(fuelPrice) || 0)).toFixed(2);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#000000' }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} className="bg-black">
          
          <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2">
            <Button size="sm" variant="bordered" className="self-start mb-6 rounded-lg border-neutral-800 bg-neutral-900" onPress={() => router.back()}>
              <Text className="text-neutral-300 font-medium px-2" style={{ fontFamily: 'Poppins_500Medium' }}>Cancel</Text>
            </Button>
            <Text className="text-neutral-400 font-medium text-sm mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>Driver Mode</Text>
            <Text className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Poppins_700Bold' }}>Create Trip</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="bg-neutral-900/80 p-6 rounded-3xl border border-neutral-800 space-y-4 gap-5">
            <Input 
              variant="bordered"
              label="Destination (Optional)" 
              placeholder="e.g. Airport, Office" 
              placeholderTextColor="#737373"
              style={{ color: 'white' }}
              value={destination}
              onChangeText={setDestination}
              classNames={{ input: "text-white", label: "text-neutral-400 font-medium", inputWrapper: "border-neutral-700 bg-black/50" }}
            />
            <Input 
              variant="bordered"
              label="Estimated Distance (km)" 
              placeholder="0.0" 
              placeholderTextColor="#737373"
              style={{ color: 'white' }}
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              classNames={{ input: "text-white", label: "text-neutral-400 font-medium", inputWrapper: "border-neutral-700 bg-black/50" }}
            />
            <Input 
              variant="bordered"
              label="Current Fuel Price (₹/L)" 
              placeholder="100" 
              placeholderTextColor="#737373"
              style={{ color: 'white' }}
              value={fuelPrice}
              onChangeText={setFuelPrice}
              keyboardType="decimal-pad"
              classNames={{ input: "text-white", label: "text-neutral-400 font-medium", inputWrapper: "border-neutral-700 bg-black/50" }}
            />
            <View className="mt-4 pt-4 border-t border-neutral-800">
              <Button 
                className="w-full bg-yellow-400 rounded-2xl" 
                size="lg" 
                isLoading={isCreating}
                onPress={handleCreateTrip}
              >
                <Text className="text-black font-bold text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>Start Trip</Text>
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
