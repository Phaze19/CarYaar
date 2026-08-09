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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-indigo-50 px-8 py-16 justify-center">
        
        <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-12">
          <View className="w-20 h-20 bg-indigo-600 rounded-3xl items-center justify-center mb-6 shadow-xl shadow-indigo-200">
            <Text className="text-white text-4xl font-black tracking-tighter">CY</Text>
          </View>
          <Text className="text-5xl font-black text-indigo-950 tracking-tighter mb-3">CarYaar</Text>
          <Text className="text-lg text-indigo-600 font-bold">Drive together. Split the cost.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="bg-white p-6 rounded-3xl shadow-2xl shadow-indigo-100/50 space-y-4 gap-4">
          <Input 
            variant="flat"
            color="primary"
            label="Name" 
            placeholder="e.g. Rahul" 
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            style={{ color: '#1e1b4b', fontSize: 18, fontWeight: '600' }}
          />
          <Input 
            variant="flat"
            color="primary"
            label="Phone" 
            placeholder="1234567890" 
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={{ color: '#1e1b4b', fontSize: 18, fontWeight: '600' }}
          />
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
          
          <Button 
            className="w-full mt-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-300" 
            size="lg" 
            isLoading={isLoading}
            onPress={handleLogin}
          >
            <Text className="text-white font-bold text-lg">{isLoading ? "Authenticating" : "Get Started"}</Text>
          </Button>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
