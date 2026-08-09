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
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-slate-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }} className="flex-1">
          
          <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2">
            <Text className="text-slate-500 font-medium text-sm mb-1">Preferences</Text>
            <Text className="text-3xl font-bold text-slate-900 tracking-tight">Profile</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.duration(800).delay(100).springify()} className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <View className="flex-row items-center gap-4">
              <View className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 items-center justify-center">
                <Text className="text-xl font-bold text-slate-600">{user.name.charAt(0)}</Text>
              </View>
              <View>
                <Text className="text-xl font-bold text-slate-900 tracking-tight mb-0.5">{user.name}</Text>
                <Text className="text-sm text-slate-500 font-medium">{user.phone}</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="space-y-5 gap-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <Input 
              variant="bordered"
              label="UPI ID" 
              placeholder="name@okbank" 
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
              classNames={{ input: "text-slate-900", label: "text-slate-500 font-medium", inputWrapper: "border-slate-200" }}
            />
            <Input 
              variant="bordered"
              label="Default Fuel Average (km/l)" 
              placeholder="0.0" 
              value={fuelAvg}
              onChangeText={setFuelAvg}
              keyboardType="decimal-pad"
              classNames={{ input: "text-slate-900", label: "text-slate-500 font-medium", inputWrapper: "border-slate-200" }}
            />
            
            <View className="mt-2 gap-3">
              <Button 
                className="w-full bg-slate-900 rounded-xl" 
                size="lg"
                isLoading={isSaving}
                onPress={handleSave}
              >
                <Text className="text-white font-semibold text-base">Save Changes</Text>
              </Button>

              <Button 
                className="w-full rounded-xl bg-white border border-red-200" 
                size="lg"
                onPress={logout}
              >
                <Text className="text-red-600 font-semibold text-base">Sign Out</Text>
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
