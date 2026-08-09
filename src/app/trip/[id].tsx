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

  if (!currentTrip || currentTrip.id !== id) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-50">
        <Text className="text-zinc-500 mb-4">Trip not found.</Text>
        <Button className="rounded-full bg-zinc-900" onPress={() => router.back()}>
          <Text className="text-white">Return Home</Text>
        </Button>
      </View>
    );
  }

  const isDriver = user?.id === currentTrip.driver_id;
  const isCheckedIn = riders.some(r => r.rider_id === user?.id);
  const myRiderRecord = riders.find(r => r.rider_id === user?.id);

  const numberOfRiders = riders.length;
  const costPerRider = numberOfRiders > 0 ? currentTrip.total_cost / numberOfRiders : 0;

  const [isCheckingIn, setIsCheckingIn] = React.useState(false);

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

  const [isEnding, setIsEnding] = React.useState(false);

  const handleEndTrip = async () => {
    setIsEnding(true);
    await endTrip();
    setIsEnding(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-zinc-50">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} className="flex-1">
        
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Button size="sm" className="self-start mb-6 rounded-full bg-zinc-200" onPress={() => router.back()}>
            <Text className="text-zinc-700 font-medium px-2">Back</Text>
          </Button>

          <Text className="text-xs font-medium tracking-widest uppercase text-zinc-400 mb-1">Active Route</Text>
          <Text className="text-4xl font-black text-zinc-900 tracking-tighter mb-8">Overview.</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(800).delay(100)} className="w-full bg-white border border-zinc-200 rounded-3xl p-6 mb-8">
          <View className="flex-row justify-between mb-4 pb-4 border-b border-zinc-100">
            <Text className="text-zinc-500 font-medium">Distance</Text>
            <Text className="font-semibold text-zinc-800">{currentTrip.distance_km} km</Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-zinc-100">
            <Text className="text-zinc-500 font-medium">Total Cost</Text>
            <Text className="font-bold text-zinc-900">₹{currentTrip.total_cost.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between items-baseline mt-2">
            <Text className="text-zinc-500 font-medium">Split per Rider</Text>
            <Text className="font-black text-2xl text-zinc-900 tracking-tighter">₹{costPerRider.toFixed(2)}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(800).delay(200)}>
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-lg font-bold text-zinc-900">Manifest</Text>
            <Text className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{numberOfRiders} Riders</Text>
          </View>
          
          <View className="gap-3 mb-10">
            {riders.length === 0 ? (
              <View className="p-6 border border-zinc-200 border-dashed rounded-2xl items-center justify-center">
                <Text className="text-zinc-400 font-medium">No one has checked in yet.</Text>
              </View>
            ) : (
              riders.map(rider => (
                <View key={rider.id} className="flex-row justify-between items-center bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm shadow-zinc-100/50">
                  <View className="flex-row items-center gap-4">
                    <View className="w-10 h-10 rounded-full bg-zinc-100 items-center justify-center">
                      <Text className="font-bold text-zinc-500">R</Text>
                    </View>
                    <View>
                      <Text className="font-semibold text-zinc-900">Passenger</Text>
                      <Text className="text-xs text-zinc-500">₹{costPerRider.toFixed(2)}</Text>
                    </View>
                  </View>
                  <View>
                    {rider.payment_status === 'paid' ? (
                      <Text className="text-green-600 font-bold text-sm tracking-wide uppercase">Paid</Text>
                    ) : (
                      <Text className="text-zinc-400 font-semibold text-sm tracking-wide uppercase">Pending</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Action Buttons */}
          {!isDriver && !isCheckedIn && (
            <Button className="w-full bg-zinc-900 rounded-full mb-4" size="lg" isLoading={isCheckingIn} onPress={handleCheckIn}>
              <Text className="text-white font-semibold">Check In</Text>
            </Button>
          )}

          {!isDriver && isCheckedIn && myRiderRecord?.payment_status === 'pending' && (
            <Button className="w-full bg-zinc-900 rounded-full mb-4" size="lg" onPress={handlePay}>
              <Text className="text-white font-semibold">Pay ₹{costPerRider.toFixed(2)} via UPI</Text>
            </Button>
          )}

          {isDriver && (
            <Button className="w-full rounded-full border border-red-200 bg-red-50" size="lg" isLoading={isEnding} onPress={handleEndTrip}>
              <Text className="text-red-600 font-bold">Close Trip</Text>
            </Button>
          )}
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
