import "react-native-reanimated";
import { AppThemeProvider } from "@/stores/app-theme-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(scan-flow)"
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="(stock)"
          options={{ animation: "slide_from_right", gestureEnabled: true }}
        />
        <Stack.Screen name="(main-screens)" />
      </Stack>
      <StatusBar style="auto" />
    </AppThemeProvider>
  );
}
