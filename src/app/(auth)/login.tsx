import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button } from 'heroui-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';
import { supabase } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: Linking.createURL('/'),
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, Linking.createURL('/'));
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
        {/* Subtle grid background pattern can go here if needed, keeping it white for now */}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
          <View className="flex-1 px-8 py-16 justify-center">
            
            <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-16 items-center">
              <View className="w-32 h-32 bg-yellow-400 rounded-3xl items-center justify-center mb-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(239,68,68,1)]">
                <Text className="text-black text-6xl tracking-tighter" style={{ fontFamily: 'RacingSansOne_400Regular' }}>CY</Text>
              </View>
              <Text className="text-5xl text-black tracking-tight mb-2 text-center" style={{ fontFamily: 'RacingSansOne_400Regular' }}>CarYaar</Text>
              <Text className="text-lg text-black font-bold text-center" style={{ fontFamily: 'Poppins_600SemiBold' }}>Secure, real-time carpooling.</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="space-y-4 gap-5">
              
              <Button 
                size="lg"
                onPress={() => handleOAuth('google')}
                className="w-full bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl flex-row items-center justify-center h-16" 
                isDisabled={isLoading}
              >
                <Feather name="mail" size={24} color="black" style={{ marginRight: 12 }} />
                <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Continue with Google</Text>
              </Button>

              <Button 
                size="lg"
                onPress={() => handleOAuth('apple')}
                className="w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl flex-row items-center justify-center h-16" 
                isDisabled={isLoading}
              >
                <Feather name="aperture" size={24} color="black" style={{ marginRight: 12 }} />
                <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Continue with Apple</Text>
              </Button>
              
              <Text className="text-black text-xs text-center mt-6 font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </Text>
            </Animated.View>

          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
