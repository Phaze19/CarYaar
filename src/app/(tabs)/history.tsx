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
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2">
          <Text className="text-slate-500 font-medium text-sm mb-1">Past Routes</Text>
          <Text className="text-3xl font-bold text-slate-900 tracking-tight">History</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(100).springify()} className="gap-4">
          {mockHistory.map((trip, index) => (
            <Animated.View 
              key={trip.id} 
              entering={FadeInUp.duration(600).delay(200 + index * 100).springify()}
              className="flex-row justify-between items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-sm"
            >
              <View>
                <Text className="text-xs text-slate-500 font-medium mb-1">{trip.date}</Text>
                <Text className="text-lg font-bold text-slate-900 tracking-tight">{trip.distance} km</Text>
              </View>
              <View className="items-end">
                <Text className="font-bold text-xl text-slate-900 tracking-tight">₹{trip.cost}</Text>
                <View className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded mt-1">
                  <Text className="text-slate-600 font-semibold text-[10px] uppercase">Settled</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
