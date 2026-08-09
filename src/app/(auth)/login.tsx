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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-zinc-50 px-8 py-16 justify-center">
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-16">
          <Text className="text-5xl font-black text-zinc-900 tracking-tighter mb-3">CarYaar.</Text>
          <Text className="text-lg text-zinc-500 font-medium">Split costs seamlessly.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="space-y-6 gap-6">
          <Input 
            variant="underlined"
            label="Name" 
            placeholder="John Doe" 
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            classNames={{ input: "text-zinc-900 text-lg", label: "text-zinc-500 font-medium" }}
          />
          <Input 
            variant="underlined"
            label="Phone" 
            placeholder="+91 00000 00000" 
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            classNames={{ input: "text-zinc-900 text-lg", label: "text-zinc-500 font-medium" }}
          />
          <Input 
            variant="underlined"
            label="UPI ID" 
            placeholder="name@okbank" 
            value={upiId}
            onChangeText={setUpiId}
            autoCapitalize="none"
            classNames={{ input: "text-zinc-900 text-lg", label: "text-zinc-500 font-medium" }}
          />
          
          <Button 
            className="w-full mt-8 bg-zinc-900 rounded-full" 
            size="lg" 
            isLoading={isLoading}
            onPress={handleLogin}
          >
            <Text className="text-white font-semibold text-lg">{isLoading ? "Authenticating" : "Continue"}</Text>
          </Button>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
