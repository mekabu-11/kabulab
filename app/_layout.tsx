import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "@/lib/auth";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="meal/new" options={{ presentation: "modal" }} />
          <Stack.Screen name="condition/new" options={{ presentation: "modal" }} />
          <Stack.Screen name="weight/new" options={{ presentation: "modal" }} />
          <Stack.Screen name="workout/new" options={{ presentation: "modal" }} />
        </Stack>
        <StatusBar style="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

