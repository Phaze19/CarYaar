import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from 'heroui-native';
import { useAuthStore } from '../../store/useAuthStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!name || !phone) {
      alert("Name and Phone are required.");
      return;
    }
    
    await login(name, phone, upiId);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-slate-900">
        <View className="flex-1 px-8 py-16 justify-center">
          
          <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-12">
            <View className="w-16 h-16 bg-cyan-500/20 rounded-2xl items-center justify-center mb-6 border border-cyan-500/30">
              <Text className="text-cyan-400 text-3xl font-bold tracking-tighter" style={{ fontFamily: 'Poppins_700Bold' }}>CY</Text>
            </View>
            <Text className="text-4xl font-bold text-white tracking-tight mb-2" style={{ fontFamily: 'Poppins_700Bold' }}>Welcome to CarYaar</Text>
            <Text className="text-base text-slate-300" style={{ fontFamily: 'Poppins_400Regular' }}>Sign in to your account to continue.</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/50 space-y-4 gap-5">
            <Input 
              variant="bordered"
              label="Full Name" 
              placeholder="Jane Doe" 
              placeholderTextColor="#94a3b8"
              style={{ color: 'white' }}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              classNames={{ input: "text-white", label: "text-slate-300 font-medium", inputWrapper: "border-slate-600 bg-slate-900/50" }}
            />
            <Input 
              variant="bordered"
              label="Phone Number" 
              placeholder="1234567890" 
              placeholderTextColor="#94a3b8"
              style={{ color: 'white' }}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              classNames={{ input: "text-white", label: "text-slate-300 font-medium", inputWrapper: "border-slate-600 bg-slate-900/50" }}
            />
            <Input 
              variant="bordered"
              label="UPI ID (Optional)" 
              placeholder="name@okbank" 
              placeholderTextColor="#94a3b8"
              style={{ color: 'white' }}
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
              classNames={{ input: "text-white", label: "text-slate-300 font-medium", inputWrapper: "border-slate-600 bg-slate-900/50" }}
            />
            
            <Button 
              className="w-full mt-2 bg-cyan-500 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
              size="lg" 
              isLoading={isLoading}
              onPress={handleLogin}
            >
              <Text className="text-slate-950 font-bold text-base">{isLoading ? "Authenticating..." : "Continue"}</Text>
            </Button>
          </Animated.View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
