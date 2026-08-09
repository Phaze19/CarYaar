import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

const mockHistory = [
  { id: '1', date: 'Oct 24, 2023', distance: '12', cost: '124.50', status: 'completed' },
  { id: '2', date: 'Oct 20, 2023', distance: '45', cost: '480.00', status: 'completed' },
  { id: '3', date: 'Oct 15, 2023', distance: '8', cost: '75.20', status: 'completed' },
];

export default function HistoryScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-indigo-50">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-10 mt-4">
          <Text className="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-1">Past Routes</Text>
          <Text className="text-5xl font-black text-indigo-950 tracking-tighter mb-2">History.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(100).springify()} className="gap-4">
          {mockHistory.map((trip, index) => (
            <Animated.View 
              key={trip.id} 
              entering={FadeInUp.duration(600).delay(200 + index * 100).springify()}
              className="flex-row justify-between items-center bg-white border border-indigo-50 p-5 rounded-3xl shadow-xl shadow-indigo-100/50"
            >
              <View>
                <Text className="text-xs text-indigo-400 uppercase font-bold tracking-wider mb-1">{trip.date}</Text>
                <Text className="text-xl font-black text-indigo-950 tracking-tight">{trip.distance} km</Text>
              </View>
              <View className="items-end">
                <Text className="font-black text-2xl text-indigo-600 tracking-tighter">₹{trip.cost}</Text>
                <View className="bg-indigo-50 px-2 py-1 rounded mt-1">
                  <Text className="text-indigo-500 font-bold text-[10px] uppercase">Settled</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
