import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button } from 'heroui-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';
import { supabase } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Ensure the auth session handles web redirects properly
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    
    // Fallback error if the user hasn't set up the provider in Supabase yet.
    try {
      // 1. Get the OAuth URL from Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: Linking.createURL('/'), // Universal link back to app
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // 2. Open the URL in a secure in-app browser
        const result = await WebBrowser.openAuthSessionAsync(data.url, Linking.createURL('/'));
        
        // 3. Handle the redirect back from the browser
        if (result.type === 'success') {
          const { url } = result;
          // Supabase's onAuthStateChange handles the session token automatically 
          // because it detects the URL changes on the app root if set up correctly.
          // Otherwise, we can parse it here in production.
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
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-black">
          <View className="flex-1 px-8 py-16 justify-center">
            
            <Animated.View entering={FadeInDown.duration(600).springify()} className="mb-12 items-center">
              <View className="w-24 h-24 bg-yellow-400/20 rounded-3xl items-center justify-center mb-8 border border-yellow-400/30">
                <Text className="text-yellow-400 text-4xl font-bold tracking-tighter" style={{ fontFamily: 'Poppins_700Bold' }}>CY</Text>
              </View>
              <Text className="text-4xl font-bold text-white tracking-tight mb-3 text-center" style={{ fontFamily: 'Poppins_700Bold' }}>CarYaar</Text>
              <Text className="text-base text-neutral-400 text-center" style={{ fontFamily: 'Poppins_400Regular' }}>Secure, real-time carpooling.</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="space-y-4 gap-4">
              
              <Button 
                size="lg"
                variant="bordered"
                isLoading={isLoading} 
                onPress={() => handleOAuth('google')}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-2xl flex-row items-center justify-center" 
              >
                <Feather name="mail" size={20} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>Continue with Google</Text>
              </Button>

              <Button 
                size="lg"
                variant="bordered"
                isLoading={isLoading} 
                onPress={() => handleOAuth('apple')}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-2xl flex-row items-center justify-center" 
              >
                <Feather name="aperture" size={20} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>Continue with Apple</Text>
              </Button>
              
              <Text className="text-neutral-500 text-xs text-center mt-6" style={{ fontFamily: 'Poppins_400Regular' }}>
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </Text>
            </Animated.View>

          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
