import "react-native-reanimated";
import { AppThemeProvider, useAppTheme } from "@/stores/app-theme-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTanStackQueryDevTools } from "@rozenite/tanstack-query-plugin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function RootStack() {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="(scan-flow)"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="(main-screens)" />
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
