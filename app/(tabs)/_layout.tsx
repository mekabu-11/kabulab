import { Redirect, Tabs } from "expo-router";
import { BarChart3, ClipboardList, Home, Settings } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/lib/auth";
import { colors } from "@/styles/theme";

export default function TabsLayout() {
  const { session, isDemo, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  if (!session && !isDemo) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.spotCool,
        tabBarInactiveTintColor: colors.inkTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          minHeight: 58
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ホーム",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: "記録",
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: "分析",
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "設定",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
