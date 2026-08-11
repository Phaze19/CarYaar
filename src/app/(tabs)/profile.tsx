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
      style={{ flex: 1, backgroundColor: '#ffffff' }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} className="bg-white">
          
          <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-8 mt-2 flex-row justify-between items-start">
            <View>
              <Text className="text-black font-bold text-sm mb-1" style={{ fontFamily: 'Poppins_700Bold' }}>ACCOUNT</Text>
              <Text className="text-5xl font-bold text-black tracking-tight" style={{ fontFamily: 'RacingSansOne_400Regular' }}>PROFILE</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(100).springify()} className="mb-8 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 rounded-3xl border-4 border-black">
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 bg-yellow-400 border-2 border-black rounded-2xl items-center justify-center">
                <Text className="text-3xl font-bold text-black" style={{ fontFamily: 'RacingSansOne_400Regular' }}>{user.name.charAt(0)}</Text>
              </View>
              <View>
                <Text className="text-2xl font-bold text-black tracking-tight mb-0.5" style={{ fontFamily: 'RacingSansOne_400Regular' }}>{user.name}</Text>
                <Text className="text-sm text-neutral-600 font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>{user.phone}</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] space-y-4 gap-4 mb-8">
            <View>
              <Text className="text-black font-bold text-lg mb-2" style={{ fontFamily: 'RacingSansOne_400Regular' }}>UPI ID (Optional)</Text>
              <Input 
                placeholder="name@okbank" 
                placeholderTextColor="#737373"
                style={{ color: 'black', fontFamily: 'Poppins_600SemiBold' }}
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
                className="border-2 border-black bg-white rounded-xl h-14 text-black"
              />
            </View>
            <View>
              <Text className="text-black font-bold text-lg mb-2" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Default Fuel Average (km/l)</Text>
              <Input 
                placeholder="0.0" 
                placeholderTextColor="#737373"
                style={{ color: 'black', fontFamily: 'Poppins_600SemiBold' }}
                value={fuelAvg}
                onChangeText={setFuelAvg}
                keyboardType="decimal-pad"
                className="border-2 border-black bg-white rounded-xl h-14 text-black"
              />
            </View>
            
            <View className="mt-2 gap-3">
              <Button 
                size="lg" 
                className="w-full mt-4 bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl h-16" 
                isDisabled={isSaving}
                onPress={handleSave}
              >
                <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>{isSaving ? "Saving..." : "Save Preferences"}</Text>
              </Button>
              <Button 
                size="lg" 
                className="w-full mt-2 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl h-16" 
                onPress={handleLogout}
              >
                <Text className="text-red-500 text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Log Out</Text>
              </Button>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(300).springify()}>
            <Text className="text-2xl font-bold text-black tracking-tight mb-4" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Settings</Text>
            
            <View className="bg-white rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-6">
              <View className="p-4 flex-row justify-between items-center border-b-2 border-black">
                <View className="flex-row items-center">
                  <Feather name="bell" size={20} color="#000000" style={{ marginRight: 12 }} />
                  <Text className="text-black font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>Push Notifications</Text>
                </View>
                <Text className="text-red-500 text-sm font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>Enabled</Text>
              </View>
              <View className="p-4 flex-row justify-between items-center border-b-2 border-black">
                <View className="flex-row items-center">
                  <Feather name="navigation" size={20} color="#000000" style={{ marginRight: 12 }} />
                  <Text className="text-black font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>Location Services</Text>
                </View>
                <Text className="text-red-500 text-sm font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>Enabled</Text>
              </View>
              <View className="p-4 flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Feather name="moon" size={20} color="#000000" style={{ marginRight: 12 }} />
                  <Text className="text-black font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>App Theme</Text>
                </View>
                <Text className="text-neutral-500 text-sm font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>CY Comic</Text>
              </View>
            </View>

            <Button 
              className="w-full bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl mb-8 h-16" 
              size="lg"
              onPress={logout}
            >
              <Text className="text-white text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Sign Out Completely</Text>
            </Button>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
