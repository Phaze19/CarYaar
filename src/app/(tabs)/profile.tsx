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
    <SafeAreaView style={{ flex: 1 }} edges={['top']} className="bg-indigo-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }} className="flex-1">
          
          <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-10 mt-4">
            <Text className="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-1">Preferences</Text>
            <Text className="text-5xl font-black text-indigo-950 tracking-tighter mb-2">Profile.</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.duration(800).delay(100).springify()} className="mb-10 bg-white p-4 rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50">
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 rounded-2xl bg-indigo-600 items-center justify-center shadow-lg shadow-indigo-200">
                <Text className="text-3xl font-black text-white">{user.name.charAt(0)}</Text>
              </View>
              <View>
                <Text className="text-2xl font-black text-indigo-950 tracking-tight mb-1">{user.name}</Text>
                <Text className="text-base text-indigo-500 font-bold">{user.phone}</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="space-y-6 gap-6 bg-white p-6 rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50">
            <Input 
              variant="flat"
              color="primary"
              label="UPI ID" 
              placeholder="name@okbank" 
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
              style={{ color: '#1e1b4b', fontSize: 18, fontWeight: '600' }}
            />
            <Input 
              variant="flat"
              color="primary"
              label="Default Fuel Average (km/l)" 
              placeholder="0.0" 
              value={fuelAvg}
              onChangeText={setFuelAvg}
              keyboardType="decimal-pad"
              style={{ color: '#1e1b4b', fontSize: 18, fontWeight: '600' }}
            />
            
            <View className="mt-4 gap-4">
              <Button 
                className="w-full bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200" 
                size="lg"
                isLoading={isSaving}
                onPress={handleSave}
              >
                <Text className="text-white font-bold text-lg">Save Changes</Text>
              </Button>

              <Button 
                className="w-full rounded-2xl bg-red-50" 
                size="lg"
                onPress={logout}
              >
                <Text className="text-red-600 font-bold text-lg">Sign Out</Text>
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
