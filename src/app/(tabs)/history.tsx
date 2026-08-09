import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

const mockHistory = [
  { id: '1', date: '2026-08-01', driver: 'Rahul', cost: 120, status: 'Settled' },
  { id: '2', date: '2026-08-03', driver: 'Anurag', cost: 150, status: 'Settled' },
];

export default function HistoryScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-zinc-50">
      
      <Animated.View entering={FadeInDown.duration(600).springify()} className="px-6 py-4 mt-4 mb-4">
        <Text className="text-zinc-400 font-medium tracking-widest uppercase text-xs mb-1">Archive</Text>
        <Text className="text-4xl font-black text-zinc-900 tracking-tighter">History.</Text>
      </Animated.View>

      <FlatList 
        data={mockHistory}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 16 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.duration(600).delay(index * 100).springify()}>
            <View className="w-full bg-white border border-zinc-200 rounded-3xl p-5 flex-row justify-between items-center">
              <View>
                <Text className="text-zinc-900 font-bold tracking-tight text-lg mb-1">{item.date}</Text>
                <Text className="text-zinc-500 font-medium text-sm">Driver: {item.driver}</Text>
              </View>
              <View className="items-end">
                <Text className="text-xl font-black text-zinc-900 tracking-tighter mb-1">₹{item.cost}</Text>
                <Text className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">{item.status}</Text>
              </View>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={<Text className="text-center text-zinc-400 mt-10 font-medium">No past trips found.</Text>}
      />
    </SafeAreaView>
  );
}
