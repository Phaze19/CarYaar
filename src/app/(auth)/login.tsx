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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-slate-50 px-8 py-16 justify-center">
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-12">
          <View className="w-16 h-16 bg-slate-900 rounded-xl items-center justify-center mb-6 shadow-sm">
            <Text className="text-white text-3xl font-bold tracking-tighter">CY</Text>
          </View>
          <Text className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Welcome to CarYaar</Text>
          <Text className="text-base text-slate-500">Sign in to your account to continue.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 gap-5">
          <Input 
            variant="bordered"
            label="Full Name" 
            placeholder="Jane Doe" 
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            classNames={{ input: "text-slate-900", label: "text-slate-500 font-medium", inputWrapper: "border-slate-200" }}
          />
          <Input 
            variant="bordered"
            label="Phone Number" 
            placeholder="1234567890" 
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            classNames={{ input: "text-slate-900", label: "text-slate-500 font-medium", inputWrapper: "border-slate-200" }}
          />
          <Input 
            variant="bordered"
            label="UPI ID (Optional)" 
            placeholder="name@okbank" 
            value={upiId}
            onChangeText={setUpiId}
            autoCapitalize="none"
            classNames={{ input: "text-slate-900", label: "text-slate-500 font-medium", inputWrapper: "border-slate-200" }}
          />
          
          <Button 
            className="w-full mt-2 bg-slate-900 rounded-xl" 
            size="lg" 
            isLoading={isLoading}
            onPress={handleLogin}
          >
            <Text className="text-white font-semibold text-base">{isLoading ? "Authenticating..." : "Continue"}</Text>
          </Button>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
