import React from 'react';
import { View, Text, ScrollView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTripStore } from '../../store/useTripStore';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const { user } = useAuthStore();
  const { currentTrip, riders, addRider, updateRiderStatus, endTrip } = useTripStore();
  
  const [isCheckingIn, setIsCheckingIn] = React.useState(false);
  const [isEnding, setIsEnding] = React.useState(false);

  if (!currentTrip || currentTrip.id !== id) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-neutral-500 mb-4 font-medium">Trip not found.</Text>
        <Button className="rounded-xl bg-neutral-900 border border-neutral-800" onPress={() => router.back()}>
          <Text className="text-white font-semibold">Return Home</Text>
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
    
    const driverUpi = "driver@okbank"; 
    const amount = costPerRider.toFixed(2);
    
    const upiUrl = `upi://pay?pa=${driverUpi}&pn=CarYaar Driver&am=${amount}&cu=INR&tn=CarYaar_Trip_${currentTrip.id}`;
    
    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (supported) {
        await Linking.openURL(upiUrl);
        updateRiderStatus(myRiderRecord.id, 'paid');
      } else {
        alert("No UPI app found. Simulating payment.");
        updateRiderStatus(myRiderRecord.id, 'paid');
      }
    } catch (e) {
      alert("Error opening UPI app.");
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} className="bg-black">
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-6 mt-2">
          <Button size="sm" variant="bordered" className="self-start mb-6 rounded-lg border-neutral-800 bg-neutral-900" onPress={() => router.back()}>
            <Text className="text-neutral-300 font-medium px-2" style={{ fontFamily: 'Poppins_500Medium' }}>Back</Text>
          </Button>

          <Text className="text-sm font-medium text-neutral-400 mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>Route Details</Text>
          <Text className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Poppins_700Bold' }}>Trip Manifest</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(800).delay(100)} className="w-full bg-neutral-900/80 rounded-3xl p-6 border border-neutral-800 mb-8">
          <View className="flex-row justify-between mb-4 pb-4 border-b border-neutral-800">
            <Text className="text-neutral-400 font-medium text-sm" style={{ fontFamily: 'Poppins_500Medium' }}>Distance</Text>
            <Text className="font-semibold text-white text-lg" style={{ fontFamily: 'Poppins_600SemiBold' }}>{currentTrip.distance_km} km</Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-neutral-800">
            <Text className="text-neutral-400 font-medium text-sm" style={{ fontFamily: 'Poppins_500Medium' }}>Total Cost</Text>
            <Text className="font-semibold text-white text-lg" style={{ fontFamily: 'Poppins_600SemiBold' }}>₹{currentTrip.total_cost.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between items-baseline mt-2">
            <Text className="text-neutral-400 font-medium text-sm" style={{ fontFamily: 'Poppins_500Medium' }}>Split per Rider</Text>
            <Text className="font-bold text-3xl text-yellow-400 tracking-tight" style={{ fontFamily: 'Poppins_700Bold' }}>₹{costPerRider.toFixed(2)}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(800).delay(200)}>
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Poppins_700Bold' }}>Passengers</Text>
            <View className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-md">
              <Text className="text-xs text-neutral-300 font-semibold">{numberOfRiders} Checked In</Text>
            </View>
          </View>
          
          <View className="gap-3 mb-10">
            {riders.length === 0 ? (
              <View className="p-8 border border-neutral-800 border-dashed rounded-3xl items-center justify-center bg-neutral-900/80">
                <Text className="text-neutral-400 font-medium text-sm" style={{ fontFamily: 'Poppins_500Medium' }}>Waiting for passengers...</Text>
              </View>
            ) : (
              riders.map(rider => (
                <View key={rider.id} className="flex-row justify-between items-center bg-neutral-900/80 border border-neutral-800 p-4 rounded-3xl">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-neutral-800 items-center justify-center">
                      <Text className="font-bold text-neutral-300" style={{ fontFamily: 'Poppins_700Bold' }}>R</Text>
                    </View>
                    <View>
                      <Text className="font-semibold text-white" style={{ fontFamily: 'Poppins_600SemiBold' }}>Passenger</Text>
                      <Text className="text-sm font-medium text-neutral-400" style={{ fontFamily: 'Poppins_500Medium' }}>Share: ₹{costPerRider.toFixed(2)}</Text>
                    </View>
                  </View>
                  <View>
                    {rider.payment_status === 'paid' ? (
                      <View className="bg-yellow-400/20 border border-yellow-400/30 px-2 py-1 rounded-md">
                        <Text className="text-yellow-400 font-semibold text-xs">Paid</Text>
                      </View>
                    ) : (
                      <View className="bg-red-500/20 border border-red-500/30 px-2 py-1 rounded-md">
                        <Text className="text-red-400 font-semibold text-xs">Pending</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Action Buttons */}
          {!isDriver && !isCheckedIn && (
            <Button className="w-full bg-yellow-400 rounded-2xl mb-4" size="lg" isLoading={isCheckingIn} onPress={handleCheckIn}>
              <Text className="text-black font-bold text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>Check In</Text>
            </Button>
          )}

          {!isDriver && isCheckedIn && myRiderRecord?.payment_status === 'pending' && (
            <Button className="w-full bg-black border border-yellow-400 rounded-2xl mb-4" size="lg" onPress={handlePay}>
              <Text className="text-yellow-400 font-bold text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>Settle ₹{costPerRider.toFixed(2)} via UPI</Text>
            </Button>
          )}

          {isDriver && (
            <Button className="w-full rounded-2xl bg-black border border-red-500/50 mt-4" size="lg" isLoading={isEnding} onPress={handleEndTrip}>
              <Text className="text-red-500 font-semibold text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>Complete Trip</Text>
            </Button>
          )}
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
