import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps, JSX } from "react";
import type { ColorValue } from "react-native";
import { View } from "react-native";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

function TabIcon({ name, color, focused }: { name: IoniconName; color: ColorValue; focused: boolean }): JSX.Element {
  return (
    <View className={`items-center justify-center p-2 rounded-full ${focused ? 'bg-zinc-100' : ''}`}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function TabsLayout(): JSX.Element {
  return (
    <Tabs 
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5', // indigo-600
        tabBarInactiveTintColor: '#a5b4fc', // indigo-300
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'System',
          fontWeight: '700',
          fontSize: 12,
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
