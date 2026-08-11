import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';

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

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#000000' }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} className="bg-black">
          
          <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2 flex-row justify-between items-start">
            <View>
              <Text className="text-neutral-400 font-medium text-sm mb-1" style={{ fontFamily: 'Poppins_500Medium' }}>Account</Text>
              <Text className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Poppins_700Bold' }}>Profile</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(100).springify()} className="mb-8 bg-neutral-900/80 p-5 rounded-3xl border border-neutral-800">
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 bg-yellow-400/20 border border-yellow-400/30 rounded-2xl items-center justify-center">
                <Text className="text-2xl font-bold text-yellow-400" style={{ fontFamily: 'Poppins_700Bold' }}>{user.name.charAt(0)}</Text>
              </View>
              <View>
                <Text className="text-xl font-bold text-white tracking-tight mb-0.5" style={{ fontFamily: 'Poppins_700Bold' }}>{user.name}</Text>
                <Text className="text-sm text-neutral-400 font-medium" style={{ fontFamily: 'Poppins_500Medium' }}>{user.phone}</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="bg-neutral-900/80 p-6 rounded-3xl border border-neutral-800 space-y-4 gap-4 mb-8">
            <Input 
              label="Full Name" 
              placeholder="name@okbank" 
              placeholderTextColor="#737373"
              style={{ color: 'white' }}
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
              classNames={{ input: "text-white", label: "text-neutral-400 font-medium", inputWrapper: "border-neutral-700 bg-black/50" }}
            />
            <Input 
              variant="bordered"
              label="Default Fuel Average (km/l)" 
              placeholder="0.0" 
              placeholderTextColor="#737373"
              style={{ color: 'white' }}
              value={fuelAvg}
              onChangeText={setFuelAvg}
              keyboardType="decimal-pad"
              classNames={{ input: "text-white", label: "text-neutral-400 font-medium", inputWrapper: "border-neutral-700 bg-black/50" }}
            />
            
            <View className="mt-2 gap-3">
              <Button 
                size="lg" 
                className="w-full mt-4 bg-yellow-400 rounded-2xl" 
                disabled={isSaving}
                onPress={handleSave}
              >
                <Text className="text-black font-bold text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>{isSaving ? "Saving..." : "Save Preferences"}</Text>
              </Button>
              <Button 
                size="lg" 
                className="w-full mt-2 bg-neutral-900 border border-neutral-700 rounded-2xl" 
                onPress={handleLogout}
              >
                <Text className="text-red-500 font-bold text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>Log Out</Text>
              </Button>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(300).springify()}>
            <Text className="text-xl font-bold text-white tracking-tight mb-4" style={{ fontFamily: 'Poppins_700Bold' }}>Settings</Text>
            
            <View className="bg-neutral-900/80 rounded-3xl border border-neutral-800 overflow-hidden mb-6">
              <View className="p-4 flex-row justify-between items-center border-b border-neutral-800">
                <View className="flex-row items-center">
                  <Feather name="bell" size={20} color="#facc15" style={{ marginRight: 12 }} />
                  <Text className="text-white font-medium" style={{ fontFamily: 'Poppins_500Medium' }}>Push Notifications</Text>
                </View>
                <Text className="text-yellow-400 text-sm font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>Enabled</Text>
              </View>
              <View className="p-4 flex-row justify-between items-center border-b border-neutral-800">
                <View className="flex-row items-center">
                  <Feather name="navigation" size={20} color="#facc15" style={{ marginRight: 12 }} />
                  <Text className="text-white font-medium" style={{ fontFamily: 'Poppins_500Medium' }}>Location Services</Text>
                </View>
                <Text className="text-yellow-400 text-sm font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>Enabled</Text>
              </View>
              <View className="p-4 flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Feather name="moon" size={20} color="#facc15" style={{ marginRight: 12 }} />
                  <Text className="text-white font-medium" style={{ fontFamily: 'Poppins_500Medium' }}>App Theme</Text>
                </View>
                <Text className="text-neutral-400 text-sm" style={{ fontFamily: 'Poppins_400Regular' }}>Midnight Highway</Text>
              </View>
            </View>

            <Button 
              className="w-full bg-black border border-red-500/50 rounded-2xl mb-8" 
              variant="flat"
              size="lg"
              onPress={logout}
            >
              <Text className="text-red-500 font-semibold text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>Sign Out</Text>
            </Button>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
