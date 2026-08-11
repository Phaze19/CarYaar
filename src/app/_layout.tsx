import type { JSX } from "react";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "../store/useAuthStore";
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
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
  const { user, checkSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
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

    if (!user && !inAuthGroup) {
      // Redirect to the login page.
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect away from the login page.
      router.replace('/(tabs)');
    }
  }, [user, segments]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)/login" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        </Stack>
        <StatusBar style="auto" />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
