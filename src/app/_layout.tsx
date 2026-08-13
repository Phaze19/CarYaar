import type { JSX } from "react";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "../store/useAuthStore";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { RacingSansOne_400Regular } from '@expo-google-fonts/racing-sans-one';
import * as SplashScreen from 'expo-splash-screen';

import "../global.css";
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const GEOFENCE_TASK = 'GEOFENCE_TRIP_END_TASK';

TaskManager.defineTask(GEOFENCE_TASK, async ({ data: { eventType, region }, error }: any) => {
  if (error) {
    console.error("Geofencing Task Error:", error.message);
    return;
  }
  
  if (eventType === Location.GeofencingEventType.Enter) {
    console.log("📍 Reached destination! Region:", region);
    
    const tripId = region.identifier;
    
    try {
      // Import store here to avoid initialization cycles
      const { useTripStore } = require('../store/useTripStore');
      await useTripStore.getState().endTrip(tripId);
      console.log("✅ Auto-ended trip:", tripId);
      
      // Stop tracking
      await Location.stopGeofencingAsync(GEOFENCE_TASK);
    } catch (err) {
      console.error("Failed to auto-end trip", err);
    }
  }
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout(): JSX.Element | null {
  const { user, needsOnboarding, checkSession, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    RacingSansOne_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const isLogin = segments[1] === 'login';
    const isOnboarding = segments[1] === 'onboarding';

    if (isLoading) return;

    if (!user && !needsOnboarding && (!inAuthGroup || isOnboarding)) {
      // Not logged in at all, go to login
      router.replace('/(auth)/login');
    } else if (needsOnboarding && (!inAuthGroup || isLogin)) {
      // Authenticated but needs onboarding
      router.replace('/(auth)/onboarding');
    } else if (user && !needsOnboarding && inAuthGroup) {
      // Fully authenticated and on auth screen, go to main app
      router.replace('/(tabs)');
    }
  }, [user, needsOnboarding, segments, isLoading]);

  if (!fontsLoaded || isLoading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)/login" options={{ animation: 'fade' }} />
          <Stack.Screen name="(auth)/onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        </Stack>
        <StatusBar style="auto" />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
