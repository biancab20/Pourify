import "react-native-reanimated";
import { AppThemeProvider } from "@/stores/app-theme-context";
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from "expo-font";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {

  const [fontsLoaded] = useFonts({
  "Roobert-Medium": require("../assets/fonts/Roobert-Medium.otf"),
  "Roobert-Bold": require("../assets/fonts/Roobert-Bold.otf"),
  "Roobert-BoldItalic": require("../assets/fonts/Roobert-BoldItalic.otf"),
  "Roobert-Light": require("../assets/fonts/Roobert-Light.otf"),
  "Roobert-LightItalic": require("../assets/fonts/Roobert-LightItalic.otf"),
  "Roobert-Heavy": require("../assets/fonts/Roobert-Heavy.otf"),
  "Roobert-HeavyItalic": require("../assets/fonts/Roobert-HeavyItalic.otf"),
});

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
        <Stack.Screen
          name="bar-detail-page"
          options={{ animation: "slide_from_right", gestureEnabled: true }}
        />
        <Stack.Screen
          name="homepage"
          options={{ animation: "slide_from_right", gestureEnabled: true }}
        />
      </Stack>
      <StatusBar style="auto" />
    </AppThemeProvider>
  );
}
