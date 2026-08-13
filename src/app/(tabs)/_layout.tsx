import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps, JSX } from "react";
import type { ColorValue } from "react-native";
import { View } from "react-native";
import { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useSocialStore } from "../../store/useSocialStore";
import { registerForPushNotificationsAsync } from "../../lib/notifications";
import * as Linking from 'expo-linking';
import { Alert } from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

function TabIcon({ name, color, focused }: { name: IoniconName; color: ColorValue; focused: boolean }): JSX.Element {
  return (
    <View className={`items-center justify-center p-2 rounded-2xl ${focused ? 'bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}`}>
      <Ionicons name={name} size={22} color={focused ? '#000000' : color} />
    </View>
  );
}

export default function TabsLayout(): JSX.Element {
  const { user } = useAuthStore();
  const { joinGroup } = useSocialStore();
  const url = Linking.useURL();

  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (url && user) {
      const { hostname, path } = Linking.parse(url);
      if (hostname === 'group' && path?.startsWith('invite/')) {
        const inviteCode = path.split('/')[1];
        if (inviteCode) {
          Alert.alert(
            "Join Group",
            `Do you want to join this group? (Code: ${inviteCode})`,
            [
              { text: "Cancel", style: "cancel" },
              { text: "Join", onPress: () => joinGroup(user.id, inviteCode) }
            ]
          );
        }
      }
    }
  }, [url, user]);

  return (
    <Tabs 
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000000', 
        tabBarInactiveTintColor: '#a3a3a3', 
        tabBarStyle: {
          backgroundColor: '#ffffff', 
          borderTopWidth: 4,
          borderTopColor: '#000000', 
          elevation: 0,
          shadowOpacity: 0,
          height: 80,
          paddingBottom: 20,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontFamily: 'RacingSansOne_400Regular',
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? "home" : "home-outline"} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="balances"
        options={{
          title: "Balances",
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? "wallet" : "wallet-outline"} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? "time" : "time-outline"} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? "people" : "people-outline"} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? "car" : "car-outline"} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? "person" : "person-outline"} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
