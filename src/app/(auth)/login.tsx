import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button, Input } from 'heroui-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';
import { supabase } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Phone Auth State
  const [authMode, setAuthMode] = useState<'social' | 'phone_input' | 'otp_input'>('social');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

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

  const handleSendOtp = async () => {
    if (!phone) {
      Alert.alert("Error", "Please enter a valid phone number with country code (e.g. +91...)");
      return;
    }
    
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.startsWith('+') ? phone : `+91${phone}`, // Default to +91 if none provided
    });

    setIsLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setAuthMode('otp_input');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    
    setIsLoading(true);
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms',
    });

    setIsLoading(false);

    if (error) {
      Alert.alert("Verification Failed", error.message);
    }
    // On success, onAuthStateChange in _layout.tsx handles the routing
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

            {authMode === 'social' && (
              <Animated.View entering={FadeInUp.duration(800).delay(200).springify()} className="space-y-4 gap-4">
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
                
                <View className="flex-row items-center my-2 opacity-50">
                  <View className="flex-1 h-[2px] bg-black" />
                  <Text className="text-black font-bold mx-4" style={{ fontFamily: 'Poppins_700Bold' }}>OR</Text>
                  <View className="flex-1 h-[2px] bg-black" />
                </View>

                <Button 
                  size="lg"
                  onPress={() => setAuthMode('phone_input')}
                  className="w-full bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl flex-row items-center justify-center h-16" 
                >
                  <Feather name="smartphone" size={24} color="white" style={{ marginRight: 12 }} />
                  <Text className="text-white text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Login with Phone</Text>
                </Button>

                <Text className="text-black text-xs text-center mt-6 font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </Text>
              </Animated.View>
            )}

            {authMode === 'phone_input' && (
              <Animated.View entering={FadeIn.duration(400)} className="gap-5 bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <View>
                  <Text className="text-black font-bold text-xl mb-2" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Enter Phone Number</Text>
                  <Input 
                    placeholder="9876543210" 
                    placeholderTextColor="#737373"
                    style={{ color: 'black', fontFamily: 'Poppins_600SemiBold' }}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    className="border-2 border-black bg-white rounded-xl h-14 text-black"
                  />
                </View>
                
                <Button 
                  size="lg"
                  onPress={handleSendOtp}
                  className="w-full bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl h-16" 
                  isDisabled={isLoading}
                >
                  <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>{isLoading ? "Sending..." : "Send SMS Code"}</Text>
                </Button>

                <Button 
                  size="md"
                  onPress={() => setAuthMode('social')}
                  className="w-full bg-transparent mt-2" 
                >
                  <Text className="text-red-500 font-bold text-base" style={{ fontFamily: 'Poppins_700Bold' }}>Cancel</Text>
                </Button>
              </Animated.View>
            )}

            {authMode === 'otp_input' && (
              <Animated.View entering={FadeIn.duration(400)} className="gap-5 bg-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <View>
                  <Text className="text-black font-bold text-xl mb-2" style={{ fontFamily: 'RacingSansOne_400Regular' }}>Enter SMS Code</Text>
                  <Text className="text-black font-bold text-xs mb-4" style={{ fontFamily: 'Poppins_600SemiBold' }}>Sent to {phone}</Text>
                  <Input 
                    placeholder="123456" 
                    placeholderTextColor="#737373"
                    style={{ color: 'black', fontFamily: 'Poppins_600SemiBold', textAlign: 'center', fontSize: 24, letterSpacing: 8 }}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    className="border-2 border-black bg-white rounded-xl h-16 text-black"
                  />
                </View>
                
                <Button 
                  size="lg"
                  onPress={handleVerifyOtp}
                  className="w-full bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl h-16" 
                  isDisabled={isLoading || otp.length < 6}
                >
                  <Text className="text-black text-xl" style={{ fontFamily: 'RacingSansOne_400Regular' }}>{isLoading ? "Verifying..." : "Verify & Login"}</Text>
                </Button>

                <Button 
                  size="md"
                  onPress={() => setAuthMode('phone_input')}
                  className="w-full bg-transparent mt-2" 
                >
                  <Text className="text-red-500 font-bold text-base" style={{ fontFamily: 'Poppins_700Bold' }}>Back</Text>
                </Button>
              </Animated.View>
            )}

          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
