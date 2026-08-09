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
      <View className="flex-1 justify-center items-center bg-indigo-50">
        <Text className="text-indigo-500 mb-4 font-bold">Trip not found.</Text>
        <Button className="rounded-full bg-indigo-600" onPress={() => router.back()}>
          <Text className="text-white font-bold">Return Home</Text>
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
    try {
      await endTrip();
      router.replace('/(tabs)');
    } catch (e: any) {
      alert("Error ending trip: " + e.message);
      setIsEnding(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-indigo-50">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} className="flex-1">
        
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Button size="sm" className="self-start mb-6 rounded-2xl bg-white shadow-sm shadow-indigo-100" onPress={() => router.back()}>
            <Text className="text-indigo-900 font-bold px-2">Back</Text>
          </Button>

          <Text className="text-xs font-bold tracking-widest uppercase text-indigo-400 mb-2">Active Route</Text>
          <Text className="text-5xl font-black text-indigo-950 tracking-tighter mb-8">Overview.</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(800).delay(100)} className="w-full bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100/50 mb-8 border border-indigo-50">
          <View className="flex-row justify-between mb-4 pb-4 border-b border-indigo-50">
            <Text className="text-indigo-400 font-bold uppercase text-xs tracking-wider">Distance</Text>
            <Text className="font-black text-indigo-950 text-xl">{currentTrip.distance_km} km</Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-indigo-50">
            <Text className="text-indigo-400 font-bold uppercase text-xs tracking-wider">Total Cost</Text>
            <Text className="font-black text-indigo-950 text-xl">₹{currentTrip.total_cost.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between items-baseline mt-2">
            <Text className="text-indigo-400 font-bold uppercase text-xs tracking-wider">Split per Rider</Text>
            <Text className="font-black text-4xl text-indigo-600 tracking-tighter">₹{costPerRider.toFixed(2)}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(800).delay(200)}>
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-2xl font-black text-indigo-950 tracking-tight">Manifest</Text>
            <View className="bg-indigo-100 px-3 py-1 rounded-full">
              <Text className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{numberOfRiders} Riders</Text>
            </View>
          </View>
          
          <View className="gap-3 mb-10">
            {riders.length === 0 ? (
              <View className="p-8 border-2 border-indigo-200 border-dashed rounded-3xl items-center justify-center bg-indigo-50/50">
                <Text className="text-indigo-400 font-bold">No one has checked in yet.</Text>
              </View>
            ) : (
              riders.map(rider => (
                <View key={rider.id} className="flex-row justify-between items-center bg-white border border-indigo-50 p-4 rounded-3xl shadow-lg shadow-indigo-100/50">
                  <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center shadow-lg shadow-indigo-200">
                      <Text className="font-black text-xl text-white">R</Text>
                    </View>
                    <View>
                      <Text className="font-black text-lg text-indigo-950 tracking-tight">Passenger</Text>
                      <Text className="text-sm font-bold text-indigo-500">₹{costPerRider.toFixed(2)}</Text>
                    </View>
                  </View>
                  <View>
                    {rider.payment_status === 'paid' ? (
                      <View className="bg-green-100 px-3 py-1 rounded-full">
                        <Text className="text-green-700 font-black text-sm tracking-wide uppercase">Paid</Text>
                      </View>
                    ) : (
                      <View className="bg-orange-100 px-3 py-1 rounded-full">
                        <Text className="text-orange-600 font-black text-sm tracking-wide uppercase">Pending</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Action Buttons */}
          {!isDriver && !isCheckedIn && (
            <Button className="w-full bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-300 mb-4" size="lg" isLoading={isCheckingIn} onPress={handleCheckIn}>
              <Text className="text-white font-bold text-lg">Check In</Text>
            </Button>
          )}

          {!isDriver && isCheckedIn && myRiderRecord?.payment_status === 'pending' && (
            <Button className="w-full bg-green-500 rounded-2xl shadow-lg shadow-green-300 mb-4" size="lg" onPress={handlePay}>
              <Text className="text-white font-bold text-lg">Pay ₹{costPerRider.toFixed(2)} via UPI</Text>
            </Button>
          )}

          {isDriver && (
            <Button className="w-full rounded-2xl bg-red-50 border border-red-100" size="lg" isLoading={isEnding} onPress={handleEndTrip}>
              <Text className="text-red-600 font-black text-lg">Close Trip</Text>
            </Button>
          )}
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
