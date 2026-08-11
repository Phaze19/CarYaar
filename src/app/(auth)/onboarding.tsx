import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function OnboardingScreen() {
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  
  const { completeOnboarding, isLoading, logout } = useAuthStore();
  const router = useRouter();

  const handleComplete = async () => {
    if (!phone) {
      alert("Phone number is required.");
      return;
    }
    
    await completeOnboarding(phone, upiId);
    // The router will automatically pick up the user state change in _layout.tsx and redirect to (tabs)
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-black">
          <View className="flex-1 px-8 py-16 justify-center">
            
            <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-12">
              <Text className="text-4xl font-bold text-white tracking-tight mb-2" style={{ fontFamily: 'Poppins_700Bold' }}>Almost there!</Text>
              <Text className="text-base text-neutral-400" style={{ fontFamily: 'Poppins_400Regular' }}>We just need a couple more details to set up your CarYaar profile.</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="bg-neutral-900/80 p-6 rounded-3xl border border-neutral-800 space-y-4 gap-5">
              <Input 
                label="Phone Number" 
                placeholder="1234567890" 
                placeholderTextColor="#737373"
                style={{ color: 'white' }}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                classNames={{ input: "text-white", label: "text-neutral-300 font-medium", inputWrapper: "border-neutral-700 bg-black/50" }}
              />
              <Input 
                label="UPI ID (Optional)" 
                placeholder="name@okbank" 
                placeholderTextColor="#737373"
                style={{ color: 'white' }}
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
                classNames={{ input: "text-white", label: "text-neutral-300 font-medium", inputWrapper: "border-neutral-700 bg-black/50" }}
              />
              
              <Button 
                size="lg"
                onPress={handleComplete}
                className="w-full mt-2 bg-yellow-400 rounded-2xl" 
                disabled={isLoading}
              >
                <Text className="text-black font-bold text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>{isLoading ? "Saving..." : "Complete Setup"}</Text>
              </Button>

              <Button 
                size="md"
                onPress={logout}
                className="w-full mt-2 bg-transparent" 
              >
                <Text className="text-neutral-500 font-bold text-sm" style={{ fontFamily: 'Poppins_500Medium' }}>Cancel & Sign Out</Text>
              </Button>
            </Animated.View>

          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
