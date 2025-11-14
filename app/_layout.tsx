
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AppThemeProvider } from "@/stores/app-theme-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {

  return (
    <AppThemeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(scan-flow)"
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="(stock)"
          options={{ animation: "slide_from_right", gestureEnabled: true }}
        />
      </Stack>
      <StatusBar style="auto" />
    </AppThemeProvider>
  );
}
