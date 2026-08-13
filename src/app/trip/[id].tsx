import React from 'react';
import { View, Text, ScrollView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTripStore } from '../../store/useTripStore';
import { supabase } from '../../lib/supabase';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const { user } = useAuthStore();
  const { currentTrip, riders, addRider, updateRiderStatus, endTrip } = useTripStore();
  
  const [isCheckingIn, setIsCheckingIn] = React.useState(false);
  const [isEnding, setIsEnding] = React.useState(false);

  React.useEffect(() => {
    if (!currentTrip || currentTrip.id !== id) {
      const activeTrips = useTripStore.getState().currentTrips;
      const found = activeTrips.find(t => t.id === id);
      if (found) {
        useTripStore.setState({ currentTrip: found });
        useTripStore.getState().subscribeToRiders(id as string);
      }
    }
  }, [id, currentTrip]);

  if (!currentTrip || currentTrip.id !== id) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-black mb-4 font-bold text-lg">Trip not found.</Text>
        <Button className="rounded-xl bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" onPress={() => router.back()}>
          <Text className="text-black font-bold">Return Home</Text>
        </Button>
      </View>
    );
  }

  const isDriver = user?.id === currentTrip.driver_id;
  const isCheckedIn = riders.some(r => r.rider_id === user?.id);
  const myRiderRecord = riders.find(r => r.rider_id === user?.id);

  const numberOfRiders = riders.length;
  const costPerRider = numberOfRiders > 0 ? currentTrip.total_cost / numberOfRiders : 0;


  const handleCheckIn = async () => {
    if (!user || isCheckedIn) return;
    setIsCheckingIn(true);
    await addRider({
      trip_id: currentTrip.id,
      rider_id: user.id,
      share_amount: 0,
      payment_status: 'pending'
    });
    setIsCheckingIn(false);
  };

  const handlePay = async () => {
    if (!myRiderRecord || !user) return;
    
    // Fetch actual driver UPI ID
    const { data: driverData } = await supabase
      .from('users')
      .select('upi_id, name')
      .eq('id', currentTrip.driver_id)
      .single();
      
    const driverUpi = driverData?.upi_id || "driver@okbank"; 
    const driverName = driverData?.name ? encodeURIComponent(driverData.name) : "CarYaar Driver";
    const amount = costPerRider.toFixed(2);
    
    const upiUrl = `upi://pay?pa=${driverUpi}&pn=${driverName}&am=${amount}&cu=INR&tn=CarYaar_Trip_${currentTrip.id}`;
    
    try {
      // Android package visibility means canOpenURL might return false even if a UPI app is installed.
      // So we just try to open it directly.
      await Linking.openURL(upiUrl);
      updateRiderStatus(myRiderRecord.id, 'paid');
    } catch (e) {
      alert("No UPI app found. Simulating payment.");
      updateRiderStatus(myRiderRecord.id, 'paid');
    }
  };

  const handleEndTrip = async () => {
    setIsEnding(true);
    try {
      await endTrip();
      router.replace('/(tabs)');
    } catch (e: any) {
      alert("Error ending trip: " + e.message);
      setIsEnding(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} className="bg-white">
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-6 mt-2">
          <Button size="sm" className="self-start mb-6 rounded-lg bg-transparent" onPress={() => router.back()}>
            <Text className="text-black font-bold px-2" style={{ fontFamily: 'Poppins_700Bold' }}>{'< Back'}</Text>
          </Button>

          <Text className="text-sm font-bold text-black mb-1 uppercase" style={{ fontFamily: 'Poppins_700Bold' }}>Route Details</Text>
          <Text className="text-5xl font-bold text-black tracking-tight" style={{ fontFamily: 'RacingSansOne_400Regular' }}>TRIP MANIFEST</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(800).delay(100)} className="w-full bg-white rounded-3xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] mb-8">
          <View className="flex-row justify-between mb-4 pb-4 border-b-2 border-black">
            <Text className="text-black font-bold text-sm" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Distance</Text>
            <Text className="font-bold text-black text-lg" style={{ fontFamily: 'Poppins_700Bold' }}>{currentTrip.distance_km} km</Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b-2 border-black">
            <Text className="text-black font-bold text-sm" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Total Cost</Text>
            <Text className="font-bold text-black text-lg" style={{ fontFamily: 'Poppins_700Bold' }}>₹{currentTrip.total_cost.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between items-baseline mt-2">
            <Text className="text-black font-bold text-sm" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Split per Rider</Text>
            <Text className="font-bold text-5xl text-black tracking-tight" style={{ fontFamily: 'RacingSansOne_400Regular' }}>₹{costPerRider.toFixed(2)}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(800).delay(200)}>
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-3xl font-bold text-black tracking-tight" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Passengers</Text>
            <View className="bg-yellow-400 border-2 border-black px-3 py-1 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Text className="text-xs text-black font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>{numberOfRiders} Checked In</Text>
            </View>
          </View>
          
          <View className="gap-4 mb-10">
            {riders.length === 0 ? (
              <View className="p-8 border-4 border-black border-dashed rounded-3xl items-center justify-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Text className="text-black font-bold text-lg" style={{ fontFamily: 'Poppins_600SemiBold' }}>Waiting for passengers...</Text>
              </View>
            ) : (
              riders.map(rider => (
                <View key={rider.id} className="flex-row justify-between items-center bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 rounded-3xl">
                  <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-xl bg-yellow-400 border-2 border-black items-center justify-center">
                      <Text className="font-bold text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>R</Text>
                    </View>
                    <View>
                      <Text className="font-bold text-black text-lg" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Passenger</Text>
                      <Text className="text-sm font-bold text-neutral-600" style={{ fontFamily: 'Poppins_700Bold' }}>Share: ₹{costPerRider.toFixed(2)}</Text>
                    </View>
                  </View>
                  <View>
                    {rider.payment_status === 'paid' ? (
                      <View className="bg-yellow-400 border-2 border-black px-2 py-1 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Text className="text-black font-bold text-xs">Paid</Text>
                      </View>
                    ) : (
                      <View className="bg-red-500 border-2 border-black px-2 py-1 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Text className="text-white font-bold text-xs">Pending</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Action Buttons */}
          {!isDriver && !isCheckedIn && (
            <Button className="w-full bg-yellow-400 rounded-2xl mb-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-16" size="lg" isDisabled={isCheckingIn} onPress={handleCheckIn}>
              <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Check In</Text>
            </Button>
          )}

          {!isDriver && isCheckedIn && myRiderRecord?.payment_status === 'pending' && (
            <Button className="w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl mb-4 h-16" size="lg" onPress={handlePay}>
              <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Settle ₹{costPerRider.toFixed(2)} via UPI</Text>
            </Button>
          )}

          {isDriver && (
            <Button className="w-full rounded-2xl bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-4 h-16" size="lg" isDisabled={isEnding} onPress={handleEndTrip}>
              <Text className="text-white text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>{isEnding ? 'Completing...' : 'Complete Trip'}</Text>
            </Button>
          )}
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
