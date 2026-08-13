import React, { useEffect } from 'react';
import { View, Text, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useTripStore } from '../../store/useTripStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from 'heroui-native';

export default function BalancesScreen() {
  const { user } = useAuthStore();
  const { balances, fetchBalances, settleWithUser } = useTripStore();
  const [settlingId, setSettlingId] = React.useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBalances(user.id);
    }
  }, [user]);

  const totalOwedToMe = balances.reduce((acc, curr) => curr.netAmount > 0 ? acc + curr.netAmount : acc, 0);
  const totalIOwe = balances.reduce((acc, curr) => curr.netAmount < 0 ? acc + Math.abs(curr.netAmount) : acc, 0);
  const grandTotal = totalOwedToMe - totalIOwe;
  const isPositive = grandTotal >= 0;

  const handleSettle = async (balance: import('../../types').Balance) => {
    if (!user) return;
    setSettlingId(balance.otherUserId);

    const owesYou = balance.netAmount > 0;
    
    if (!owesYou) {
      // You owe them, open UPI
      const amount = Math.abs(balance.netAmount).toFixed(2);
      // In production, fetch their actual UPI ID. For now, use a placeholder.
      const theirUpi = "driver@okbank"; 
      const upiUrl = `upi://pay?pa=${theirUpi}&pn=${encodeURIComponent(balance.otherUserName)}&am=${amount}&cu=INR&tn=CarYaar_Settlement`;
      
      try {
        const supported = await Linking.canOpenURL(upiUrl);
        if (supported) {
          await Linking.openURL(upiUrl);
        } else {
          Alert.alert("No UPI App", "No UPI payment app (GPay, PhonePe, etc.) found. Simulating payment.");
        }
      } catch (e) {
        Alert.alert("Error", "Could not open UPI app.");
      }
    }

    await settleWithUser(user.id, balance.otherUserId);
    setSettlingId(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} className="bg-white">
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2">
          <Text className="text-black font-bold text-sm mb-1" style={{ fontFamily: 'Poppins_700Bold' }}>ADVANCED SETTLEMENT</Text>
          <Text className="text-5xl font-bold text-black tracking-tight" style={{ fontFamily: 'RacingSansOne_400Regular' }}>NET BALANCES</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} className="bg-black p-6 rounded-3xl shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] mb-8">
          <Text className="text-gray-300 font-bold text-lg mb-1" style={{ fontFamily: 'Poppins_700Bold' }}>Grand Total</Text>
          <Text className={`text-4xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'RacingSansOne_400Regular' }}>
            {isPositive ? '+' : '-'}₹{Math.abs(grandTotal).toFixed(2)}
          </Text>
          <View className="flex-row justify-between mt-4 border-t border-gray-800 pt-4">
            <View>
              <Text className="text-gray-400 font-bold text-xs uppercase" style={{ fontFamily: 'Poppins_700Bold' }}>You are owed</Text>
              <Text className="text-white font-bold text-lg" style={{ fontFamily: 'RacingSansOne_400Regular' }}>₹{totalOwedToMe.toFixed(2)}</Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-400 font-bold text-xs uppercase" style={{ fontFamily: 'Poppins_700Bold' }}>You owe</Text>
              <Text className="text-white font-bold text-lg" style={{ fontFamily: 'RacingSansOne_400Regular' }}>₹{totalIOwe.toFixed(2)}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="gap-5">
          {balances.length === 0 ? (
            <View className="p-8 border-4 border-black border-dashed rounded-3xl items-center justify-center bg-white mt-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Text className="text-black font-bold text-center text-lg leading-relaxed" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                You are all settled up! No pending debts with friends.
              </Text>
            </View>
          ) : (
            balances.map((balance, index) => {
              const owesYou = balance.netAmount > 0;
              const absAmount = Math.abs(balance.netAmount).toFixed(2);
              
              return (
                <Animated.View 
                  key={balance.otherUserId} 
                  entering={FadeInDown.delay(150 + index * 100).springify()}
                  className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-3xl mb-2 gap-4"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-4">
                      <View className="w-14 h-14 rounded-xl bg-yellow-400 border-2 border-black items-center justify-center">
                        <Text className="font-bold text-black text-2xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>{balance.otherUserName.charAt(0)}</Text>
                      </View>
                      <View>
                        <Text className="text-2xl font-bold text-black tracking-tight" style={{ fontFamily: 'RacingSansOne_400Regular' }}>{balance.otherUserName}</Text>
                        <Text className={`text-sm font-bold ${owesYou ? 'text-black' : 'text-red-500'}`} style={{ fontFamily: 'Poppins_700Bold' }}>
                          {owesYou ? `Owes you ₹${absAmount}` : `You owe ₹${absAmount}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Button 
                    className={`w-full rounded-2xl border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${owesYou ? 'bg-white' : 'bg-yellow-400'} h-14`}
                    size="lg"
                    isDisabled={settlingId === balance.otherUserId}
                    onPress={() => handleSettle(balance)}
                  >
                    <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>
                      {owesYou ? 'Mark as Paid' : 'Settle Up & Pay'}
                    </Text>
                  </Button>
                </Animated.View>
              );
            })
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
