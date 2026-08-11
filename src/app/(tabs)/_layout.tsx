import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps, JSX } from "react";
import type { ColorValue } from "react-native";
import { View } from "react-native";
import { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { registerForPushNotificationsAsync } from "../../lib/notifications";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

function TabIcon({ name, color, focused }: { name: IoniconName; color: ColorValue; focused: boolean }): JSX.Element {
  return (
    <View className={`items-center justify-center p-2 rounded-2xl ${focused ? 'bg-neutral-900' : ''}`}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function TabsLayout(): JSX.Element {
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync(user.id);
    }
  }, [user]);

  return (
    <Tabs 
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#facc15', // yellow-400
        tabBarInactiveTintColor: '#737373', // neutral-500
        tabBarStyle: {
          backgroundColor: '#000000', // black
          borderTopWidth: 1,
          borderTopColor: '#171717', // neutral-900
          elevation: 0,
          shadowOpacity: 0,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'System',
          fontWeight: '600',
          fontSize: 11,
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
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? "person" : "person-outline"} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
