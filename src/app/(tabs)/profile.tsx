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
    await new Promise(r => setTimeout(r, 600));
    updateProfile({
      upi_id: upiId,
      default_fuel_avg: parseFloat(fuelAvg) || 15
    });
    setIsSaving(false);
    alert('Profile updated.');
  };

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-zinc-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }} className="flex-1">
          
          <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-10 mt-4">
            <Text className="text-zinc-400 font-medium tracking-widest uppercase text-xs mb-1">Settings</Text>
            <Text className="text-4xl font-black text-zinc-900 tracking-tighter mb-2">Account.</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.duration(800).delay(100).springify()} className="mb-10">
            <View className="flex-row items-center gap-4 mb-4">
              <View className="w-16 h-16 rounded-full bg-zinc-200 items-center justify-center">
                <Text className="text-2xl font-black text-zinc-500">{user.name.charAt(0)}</Text>
              </View>
              <View>
                <Text className="text-xl font-bold text-zinc-900 tracking-tight">{user.name}</Text>
                <Text className="text-sm text-zinc-500 font-medium">{user.phone}</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="space-y-6 gap-6">
            <Input 
              variant="underlined"
              label="UPI ID" 
              placeholder="name@okbank" 
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
              classNames={{ input: "text-zinc-900 text-lg", label: "text-zinc-500 font-medium" }}
            />
            <Input 
              variant="underlined"
              label="Default Fuel Average (km/l)" 
              placeholder="0.0" 
              value={fuelAvg}
              onChangeText={setFuelAvg}
              keyboardType="decimal-pad"
              classNames={{ input: "text-zinc-900 text-lg", label: "text-zinc-500 font-medium" }}
            />
            
            <View className="mt-8 gap-3">
              <Button 
                className="w-full bg-zinc-900 rounded-full" 
                size="lg"
                isLoading={isSaving}
                onPress={handleSave}
              >
                <Text className="text-white font-semibold">Save Changes</Text>
              </Button>

              <Button 
                className="w-full rounded-full bg-transparent" 
                size="lg"
                onPress={logout}
              >
                <Text className="text-zinc-500 font-medium">Sign Out</Text>
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
