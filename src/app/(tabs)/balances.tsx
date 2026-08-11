import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
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

  const handleSettle = async (otherUserId: string) => {
    if (!user) return;
    setSettlingId(otherUserId);
    await settleWithUser(user.id, otherUserId);
    setSettlingId(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} className="bg-black">
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2">
          <Text className="text-neutral-400 font-medium text-sm mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>Advanced Settlement</Text>
          <Text className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Poppins_700Bold' }}>Net Balances</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(100).springify()} className="gap-4">
          {balances.length === 0 ? (
            <View className="p-8 border border-neutral-800 border-dashed rounded-3xl items-center justify-center bg-neutral-900/80 mt-4">
              <Text className="text-neutral-400 font-medium text-center leading-relaxed" style={{ fontFamily: 'Poppins_500Medium' }}>
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
                  className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-3xl mb-4 gap-4"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-xl bg-neutral-800 items-center justify-center">
                        <Text className="font-bold text-neutral-300" style={{ fontFamily: 'Poppins_700Bold' }}>{balance.otherUserName.charAt(0)}</Text>
                      </View>
                      <View>
                        <Text className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'Poppins_600SemiBold' }}>{balance.otherUserName}</Text>
                        <Text className={`text-sm font-semibold ${owesYou ? 'text-yellow-400' : 'text-red-500'}`} style={{ fontFamily: 'Poppins_600SemiBold' }}>
                          {owesYou ? `Owes you ₹${absAmount}` : `You owe ₹${absAmount}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Button 
                    className={`w-full rounded-2xl ${owesYou ? 'bg-black border border-neutral-800' : 'bg-yellow-400'}`}
                    size="md"
                    isLoading={settlingId === balance.otherUserId}
                    onPress={() => handleSettle(balance.otherUserId)}
                  >
                    <Text className={owesYou ? 'text-neutral-400 font-semibold' : 'text-black font-bold'} style={{ fontFamily: 'Poppins_600SemiBold' }}>
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
