import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import Animated, { FadeInDown, FadeInUp, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  
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
            
            {step === 0 && (
              <Animated.View key="step0" entering={FadeInRight.duration(500)} exiting={FadeOutLeft.duration(300)} className="flex-1 justify-center">
                <View className="bg-yellow-400 w-24 h-24 rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] items-center justify-center mb-8">
                  <Feather name="map-pin" size={40} color="black" />
                </View>
                <Text className="text-5xl text-black tracking-tight mb-4" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Welcome to CarYaar</Text>
                <Text className="text-xl text-black font-bold mb-10 leading-relaxed" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  The easiest way to carpool with your friends. Create trips, invite friends, and share the journey seamlessly.
                </Text>
                <Button 
                  size="lg"
                  onPress={() => setStep(1)}
                  className="w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl h-16" 
                >
                  <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Next</Text>
                </Button>
              </Animated.View>
            )}

            {step === 1 && (
              <Animated.View key="step1" entering={FadeInRight.duration(500)} exiting={FadeOutLeft.duration(300)} className="flex-1 justify-center">
                <View className="bg-green-400 w-24 h-24 rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] items-center justify-center mb-8">
                  <Feather name="users" size={40} color="black" />
                </View>
                <Text className="text-5xl text-black tracking-tight mb-4" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Groups & Friends</Text>
                <Text className="text-xl text-black font-bold mb-10 leading-relaxed" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  Create private groups for your college or workplace. Add friends directly or share your unique invite code.
                </Text>
                <Button 
                  size="lg"
                  onPress={() => setStep(2)}
                  className="w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl h-16" 
                >
                  <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Next</Text>
                </Button>
              </Animated.View>
            )}

            {step === 2 && (
              <Animated.View key="step2" entering={FadeInRight.duration(500)} exiting={FadeOutLeft.duration(300)} className="flex-1 justify-center">
                <View className="bg-blue-400 w-24 h-24 rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] items-center justify-center mb-8">
                  <Feather name="credit-card" size={40} color="black" />
                </View>
                <Text className="text-5xl text-black tracking-tight mb-4" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Split Costs Fairly</Text>
                <Text className="text-xl text-black font-bold mb-10 leading-relaxed" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  CarYaar automatically calculates the trip cost and splits it equally among passengers. Check who owes you at a glance!
                </Text>
                <Button 
                  size="lg"
                  onPress={() => setStep(3)}
                  className="w-full bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl h-16" 
                >
                  <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Get Started</Text>
                </Button>
              </Animated.View>
            )}

            {step === 3 && (
              <Animated.View key="step3" entering={FadeInRight.duration(500)} className="flex-1 justify-center">
                <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-10">
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
              </Animated.View>
            )}

          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
