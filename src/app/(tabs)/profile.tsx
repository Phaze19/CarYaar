import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Input } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuthStore();
  
  const [upiId, setUpiId] = useState(user?.upi_id || '');
  const [fuelAvg, setFuelAvg] = useState(user?.default_fuel_avg?.toString() || '15');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({
      upi_id: upiId,
      default_fuel_avg: parseFloat(fuelAvg) || 15
    });
    setIsSaving(false);
    alert('Profile updated.');
  };

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-slate-900">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          
          <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2 flex-row justify-between items-start">
            <View>
              <Text className="text-slate-400 font-medium text-sm mb-1">Account</Text>
              <Text className="text-3xl font-bold text-white tracking-tight">Profile</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(100).springify()} className="mb-8 bg-slate-800/80 p-5 rounded-3xl shadow-sm border border-slate-700/50">
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 bg-cyan-500/20 border border-cyan-500/30 rounded-2xl items-center justify-center">
                <Text className="text-2xl font-bold text-cyan-400">{user.name.charAt(0)}</Text>
              </View>
              <View>
                <Text className="text-xl font-bold text-white tracking-tight mb-0.5">{user.name}</Text>
                <Text className="text-sm text-slate-400 font-medium">{user.phone}</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="space-y-5 gap-5 bg-slate-800/80 p-6 rounded-3xl shadow-sm border border-slate-700/50 mb-8">
            <Input 
              variant="bordered"
              label="UPI ID" 
              placeholder="name@okbank" 
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
              classNames={{ input: "text-white", label: "text-slate-400 font-medium", inputWrapper: "border-slate-600 bg-slate-900/50" }}
            />
            <Input 
              variant="bordered"
              label="Default Fuel Average (km/l)" 
              placeholder="0.0" 
              value={fuelAvg}
              onChangeText={setFuelAvg}
              keyboardType="decimal-pad"
              classNames={{ input: "text-white", label: "text-slate-400 font-medium", inputWrapper: "border-slate-600 bg-slate-900/50" }}
            />
            
            <View className="mt-2 gap-3">
              <Button 
                className="w-full bg-cyan-500 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                size="lg"
                isLoading={isSaving}
                onPress={handleSave}
              >
                <Text className="text-slate-950 font-bold text-base">Save Changes</Text>
              </Button>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(300).springify()}>
            <Text className="text-xl font-bold text-white tracking-tight mb-4">Settings</Text>
            
            <View className="bg-slate-800/80 rounded-3xl border border-slate-700/50 overflow-hidden mb-6">
              <View className="p-4 flex-row justify-between items-center border-b border-slate-700/50">
                <View className="flex-row items-center">
                  <Text className="text-xl mr-3">🔔</Text>
                  <Text className="text-white font-medium">Notifications</Text>
                </View>
                <Text className="text-slate-400 text-sm">Enabled</Text>
              </View>
              <View className="p-4 flex-row justify-between items-center border-b border-slate-700/50">
                <View className="flex-row items-center">
                  <Text className="text-xl mr-3">⛽</Text>
                  <Text className="text-white font-medium">Vehicle Mileage</Text>
                </View>
                <Text className="text-slate-400 text-sm">{user.default_fuel_avg} km/l</Text>
              </View>
              <View className="p-4 flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Text className="text-xl mr-3">🎨</Text>
                  <Text className="text-white font-medium">App Theme</Text>
                </View>
                <Text className="text-slate-400 text-sm">Dark Neumorphic</Text>
              </View>
            </View>

            <Button 
              className="w-full bg-slate-900 border border-red-500/50 rounded-2xl mb-8" 
              variant="flat"
              size="lg"
              onPress={logout}
            >
              <Text className="text-red-400 font-semibold text-base">Sign Out</Text>
            </Button>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
