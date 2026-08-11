import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native';
import { Button, Input } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTripStore } from '../../store/useTripStore';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import * as Location from 'expo-location';

const GEOFENCE_TASK = 'GEOFENCE_TRIP_END_TASK';

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
    
    // 1. Check Location Permissions for Geofencing
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    
    if (bgStatus !== 'granted') {
       alert("Background location is required to automatically end trips when you reach your destination.");
       setIsCreating(false);
       return;
    }

    // 2. Geocode the destination
    let destCoords = null;
    if (destination) {
      try {
        const results = await Location.geocodeAsync(destination);
        if (results && results.length > 0) {
          destCoords = { latitude: results[0].latitude, longitude: results[0].longitude };
        } else {
           alert("Could not find that destination on the map. Please try a more specific address.");
           setIsCreating(false);
           return;
        }
      } catch (e) {
        alert("Error finding destination location.");
        setIsCreating(false);
        return;
      }
    }

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
      if (destination && destCoords) {
        // 3. Start Background Geofencing
        try {
           await Location.startGeofencingAsync(GEOFENCE_TASK, [{
             identifier: created.id, // We use the Trip ID so the background task knows what to end
             latitude: destCoords.latitude,
             longitude: destCoords.longitude,
             radius: 150, // 150 meters
           }]);
        } catch (e) {
           console.log("Failed to start geofence:", e);
        }

        // 4. Open Google Maps
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
            <Button size="md" className="bg-transparent" onPress={() => router.back()}>
              <Text className="text-neutral-300 font-medium px-2" style={{ fontFamily: 'Poppins_500Medium' }}>Cancel</Text>
            </Button>
            <Text className="text-neutral-400 font-medium text-sm mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>Driver Mode</Text>
            <Text className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Poppins_700Bold' }}>Create Trip</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="bg-neutral-900/80 p-6 rounded-3xl border border-neutral-800 space-y-4 gap-5">
            <Input 
              label="Destination (Optional)" 
              placeholder="e.g. Airport, Office" 
              placeholderTextColor="#737373"
              style={{ color: 'white' }}
              value={destination}
              onChangeText={setDestination}
              classNames={{ input: "text-white", label: "text-neutral-400 font-medium", inputWrapper: "border-neutral-700 bg-black/50" }}
            />
            <Input 
              label="Total Trip Distance (km)" 
              placeholder="0.0" 
              placeholderTextColor="#737373"
              style={{ color: 'white' }}
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              classNames={{ input: "text-white", label: "text-neutral-400 font-medium", inputWrapper: "border-neutral-700 bg-black/50" }}
            />
            <Input 
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
                disabled={isCreating}
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
