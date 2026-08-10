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
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-slate-900">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2">
          <Text className="text-slate-400 font-medium text-sm mb-1">Advanced Settlement</Text>
          <Text className="text-3xl font-bold text-white tracking-tight">Net Balances</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(100).springify()} className="gap-4">
          {balances.length === 0 ? (
            <View className="p-8 border border-slate-700/50 border-dashed rounded-3xl items-center justify-center bg-slate-800/80 mt-4">
              <Text className="text-slate-400 font-medium text-center leading-relaxed">
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
                  entering={FadeInUp.duration(600).delay(200 + index * 50).springify()}
                  className="bg-slate-800/80 border border-slate-700/50 p-5 rounded-3xl space-y-4"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-xl bg-slate-700/50 border border-slate-600 items-center justify-center">
                        <Text className="font-bold text-slate-300">{balance.otherUserName.charAt(0)}</Text>
                      </View>
                      <View>
                        <Text className="text-lg font-bold text-white tracking-tight">{balance.otherUserName}</Text>
                        <Text className={`text-sm font-semibold ${owesYou ? 'text-cyan-400' : 'text-orange-400'}`}>
                          {owesYou ? `Owes you ₹${absAmount}` : `You owe ₹${absAmount}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Button 
                    className={`w-full rounded-2xl ${owesYou ? 'bg-slate-900 border border-slate-700' : 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]'}`}
                    size="md"
                    isLoading={settlingId === balance.otherUserId}
                    onPress={() => handleSettle(balance.otherUserId)}
                  >
                    <Text className={owesYou ? 'text-slate-300 font-semibold' : 'text-slate-950 font-bold'}>
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
