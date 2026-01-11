import "react-native-reanimated";
import { AppThemeProvider, useAppTheme } from "@/stores/app-theme-context";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTanStackQueryDevTools } from "@rozenite/tanstack-query-plugin";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";
import { Platform, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
function CloseButton() {
    const { theme } = useAppTheme();
  const { colors } = theme;
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 5 }}>
      <Ionicons name="close" size={30} color={colors.icon}/>
    </Pressable>
  );
}
function RootStack() {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="(scan-flow)"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="(main-screens)" />
      <Stack.Screen
        name="(settings)"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="(modals)/edit-field"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: Platform.OS === "ios",
          title: "",
          headerRight: () => <CloseButton />,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useTanStackQueryDevTools(queryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppThemeProvider>
          <RootStack />
          <StatusBar style="auto" />
        </AppThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
