import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  
  const { completeOnboarding, isLoading, logout } = useAuthStore();
  const router = useRouter();

  const handleComplete = async () => {
    if (!name || !phone) {
      alert("Name and Phone number are required.");
      return;
    }
    
    await completeOnboarding(name, phone, upiId);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
          <View className="flex-1 px-8 py-16 justify-center">
            
            <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-12">
              <Text className="text-5xl text-black tracking-tight mb-2" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Almost there!</Text>
              <Text className="text-lg text-black font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>We just need a couple more details to set up your CarYaar profile.</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] space-y-4 gap-5">
              <View>
                <Text className="text-black font-bold text-lg mb-2" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Full Name</Text>
                <Input 
                  placeholder="Rahul Kumar" 
                  placeholderTextColor="#737373"
                  style={{ color: 'black', fontFamily: 'Poppins_600SemiBold' }}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  className="border-2 border-black bg-white rounded-xl h-14 text-black"
                />
              </View>

              <View>
                <Text className="text-black font-bold text-lg mb-2" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Phone Number</Text>
                <Input 
                  placeholder="1234567890" 
                  placeholderTextColor="#737373"
                  style={{ color: 'black', fontFamily: 'Poppins_600SemiBold' }}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  className="border-2 border-black bg-white rounded-xl h-14 text-black"
                />
              </View>

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
              
              <Button 
                size="lg"
                onPress={handleComplete}
                className="w-full mt-4 bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl h-16" 
                isDisabled={isLoading}
              >
                <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>{isLoading ? "Saving..." : "Complete Setup"}</Text>
              </Button>

              <Button 
                size="md"
                onPress={logout}
                className="w-full mt-2 bg-transparent" 
              >
                <Text className="text-red-500 font-bold text-base" style={{ fontFamily: 'Poppins_700Bold' }}>Cancel & Sign Out</Text>
              </Button>
            </Animated.View>

          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
