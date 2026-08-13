import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button, Input } from 'heroui-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    try {
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // If "Confirm email" is disabled, they are automatically signed in here!
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      Alert.alert("Authentication Failed", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      const redirectUrl = makeRedirectUri({
        scheme: 'caryaar',
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === 'success') {
          // Handled by onAuthStateChange
        }
      }
    } catch (err: any) {
      console.log(err);
      Alert.alert(
        "Provider Not Configured",
        `Looks like you haven't fully configured ${provider} OAuth in your Supabase Dashboard yet!\n\nCheck the developer logs for instructions.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
          <View className="flex-1 px-8 py-16 justify-center">
            
            <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-12 items-center">
              <View className="w-32 h-32 bg-yellow-400 rounded-3xl items-center justify-center mb-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(239,68,68,1)]">
                <Text className="text-black text-6xl tracking-tighter" style={{ fontFamily: 'RacingSansOne_400Regular' }}>CY</Text>
              </View>
              <Text className="text-5xl text-black tracking-tight mb-2 text-center" style={{ fontFamily: 'RacingSansOne_400Regular' }}>CarYaar</Text>
              <Text className="text-lg text-black font-bold text-center" style={{ fontFamily: 'Poppins_600SemiBold' }}>Secure, real-time carpooling.</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="space-y-4 gap-4">
              <Input
                placeholder="Email Address"
                placeholderTextColor="#737373"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full h-16 border-4 border-black rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg px-4"
                style={{ color: 'black', fontFamily: 'Poppins_600SemiBold' }}
              />
              
              <Input
                placeholder="Password"
                placeholderTextColor="#737373"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="w-full h-16 border-4 border-black rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg px-4"
                style={{ color: 'black', fontFamily: 'Poppins_600SemiBold' }}
              />

              <Button 
                size="lg"
                onPress={() => handleEmailAuth('login')}
                className="w-full bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl flex-row items-center justify-center h-16 mt-2" 
                isDisabled={isLoading}
              >
                <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Log In</Text>
              </Button>

              <Button 
                size="lg"
                onPress={() => handleEmailAuth('signup')}
                className="w-full bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl flex-row items-center justify-center h-16" 
                isDisabled={isLoading}
              >
                <Text className="text-white text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Create Account</Text>
              </Button>
              
              <Text className="text-black text-xs text-center mt-6 font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </Text>
            </Animated.View>

          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
