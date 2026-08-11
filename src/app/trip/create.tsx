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
             identifier: created.id,
             latitude: destCoords.latitude,
             longitude: destCoords.longitude,
             radius: 150,
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
      style={{ flex: 1, backgroundColor: '#ffffff' }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} className="bg-white">
          
          <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2">
            <Button size="md" className="bg-transparent self-start mb-6" onPress={() => router.back()}>
              <Text className="text-black font-bold px-2" style={{ fontFamily: 'Poppins_700Bold' }}>{'< Back'}</Text>
            </Button>
            <Text className="text-black font-bold text-sm mb-1 uppercase" style={{ fontFamily: 'Poppins_700Bold' }}>Driver Mode</Text>
            <Text className="text-5xl font-bold text-black tracking-tight" style={{ fontFamily: 'RacingSansOne_400Regular' }}>CREATE TRIP</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] space-y-4 gap-5">
            <View>
              <Text className="text-black font-bold text-lg mb-2" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Destination (Optional)</Text>
              <Input 
                placeholder="e.g. Airport, Office" 
                placeholderTextColor="#737373"
                style={{ color: 'black', fontFamily: 'Poppins_600SemiBold' }}
                value={destination}
                onChangeText={setDestination}
                className="border-2 border-black bg-white rounded-xl h-14 text-black"
              />
            </View>
            <View>
              <Text className="text-black font-bold text-lg mb-2" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Total Trip Distance (km)</Text>
              <Input 
                placeholder="0.0" 
                placeholderTextColor="#737373"
                style={{ color: 'black', fontFamily: 'Poppins_600SemiBold' }}
                value={distance}
                onChangeText={setDistance}
                keyboardType="decimal-pad"
                className="border-2 border-black bg-white rounded-xl h-14 text-black"
              />
            </View>
            <View>
              <Text className="text-black font-bold text-lg mb-2" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Current Fuel Price (₹/L)</Text>
              <Input 
                placeholder="100" 
                placeholderTextColor="#737373"
                style={{ color: 'black', fontFamily: 'Poppins_600SemiBold' }}
                value={fuelPrice}
                onChangeText={setFuelPrice}
                keyboardType="decimal-pad"
                className="border-2 border-black bg-white rounded-xl h-14 text-black"
              />
            </View>
            <View className="mt-4 pt-4 border-t-2 border-black">
              <Button 
                className="w-full bg-yellow-400 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-16" 
                size="lg" 
                isDisabled={isCreating}
                onPress={handleCreateTrip}
              >
                <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Start Trip</Text>
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
