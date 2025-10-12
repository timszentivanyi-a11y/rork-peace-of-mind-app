import { Tabs } from "expo-router";
import { Heart, CheckSquare, Brain, BarChart3 } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4A9B4A",
        tabBarInactiveTintColor: "#A8D8A8",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#F8FDF8",
          borderTopColor: "#E8F5E8",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Domov",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Úkoly",
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="meditation"
        options={{
          title: "Meditace",
          tabBarIcon: ({ color, size }) => <Brain color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Statistiky",
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />

    </Tabs>
  );
}