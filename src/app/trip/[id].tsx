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
      <View className="flex-1 justify-center items-center bg-slate-50">
        <Text className="text-slate-500 mb-4 font-medium">Trip not found.</Text>
        <Button className="rounded-xl bg-slate-900" onPress={() => router.back()}>
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
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-slate-900">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} className="flex-1">
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-6">
          <Button size="sm" variant="bordered" className="self-start mb-6 rounded-lg border-slate-700 bg-slate-800" onPress={() => router.back()}>
            <Text className="text-slate-300 font-medium px-2">Back</Text>
          </Button>

          <Text className="text-sm font-medium text-slate-400 mb-1">Route Details</Text>
          <Text className="text-3xl font-bold text-white tracking-tight">Trip Manifest</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(800).delay(100)} className="w-full bg-slate-800/80 rounded-3xl p-6 shadow-sm border border-slate-700/50 mb-8">
          <View className="flex-row justify-between mb-4 pb-4 border-b border-slate-700/50">
            <Text className="text-slate-400 font-medium text-sm">Distance</Text>
            <Text className="font-semibold text-white text-lg">{currentTrip.distance_km} km</Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-slate-700/50">
            <Text className="text-slate-400 font-medium text-sm">Total Cost</Text>
            <Text className="font-semibold text-white text-lg">₹{currentTrip.total_cost.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between items-baseline mt-2">
            <Text className="text-slate-400 font-medium text-sm">Split per Rider</Text>
            <Text className="font-bold text-3xl text-cyan-400 tracking-tight">₹{costPerRider.toFixed(2)}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(800).delay(200)}>
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-xl font-bold text-white tracking-tight">Passengers</Text>
            <View className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md">
              <Text className="text-xs text-slate-300 font-semibold">{numberOfRiders} Checked In</Text>
            </View>
          </View>
          
          <View className="gap-3 mb-10">
            {riders.length === 0 ? (
              <View className="p-8 border border-slate-700/50 border-dashed rounded-3xl items-center justify-center bg-slate-800/50">
                <Text className="text-slate-400 font-medium text-sm">Waiting for passengers...</Text>
              </View>
            ) : (
              riders.map(rider => (
                <View key={rider.id} className="flex-row justify-between items-center bg-slate-800/80 border border-slate-700/50 p-4 rounded-3xl">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-slate-700/50 border border-slate-600 items-center justify-center">
                      <Text className="font-bold text-slate-300">R</Text>
                    </View>
                    <View>
                      <Text className="font-semibold text-white">Passenger</Text>
                      <Text className="text-sm font-medium text-slate-400">Share: ₹{costPerRider.toFixed(2)}</Text>
                    </View>
                  </View>
                  <View>
                    {rider.payment_status === 'paid' ? (
                      <View className="bg-cyan-500/20 border border-cyan-500/30 px-2 py-1 rounded-md">
                        <Text className="text-cyan-400 font-semibold text-xs">Paid</Text>
                      </View>
                    ) : (
                      <View className="bg-orange-500/20 border border-orange-500/30 px-2 py-1 rounded-md">
                        <Text className="text-orange-400 font-semibold text-xs">Pending</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Action Buttons */}
          {!isDriver && !isCheckedIn && (
            <Button className="w-full bg-cyan-500 rounded-2xl mb-4 shadow-[0_0_15px_rgba(6,182,212,0.4)]" size="lg" isLoading={isCheckingIn} onPress={handleCheckIn}>
              <Text className="text-slate-950 font-bold text-base">Check In</Text>
            </Button>
          )}

          {!isDriver && isCheckedIn && myRiderRecord?.payment_status === 'pending' && (
            <Button className="w-full bg-slate-800 border border-cyan-500/50 rounded-2xl shadow-sm mb-4" size="lg" onPress={handlePay}>
              <Text className="text-cyan-400 font-bold text-base">Settle ₹{costPerRider.toFixed(2)} via UPI</Text>
            </Button>
          )}

          {isDriver && (
            <Button className="w-full rounded-2xl bg-slate-900 border border-red-500/50 mt-4" size="lg" isLoading={isEnding} onPress={handleEndTrip}>
              <Text className="text-red-400 font-semibold text-base">Complete Trip</Text>
            </Button>
          )}
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
