import "react-native-reanimated";
import { AppThemeProvider } from "@/stores/app-theme-context";
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from "expo-font";
import { Text } from "@/components/text"; 

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    Roobert: require("../assets/fonts/RoobertCollectionVF-TRIAL.ttf"),
  });

  return (
    <AppThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </AppThemeProvider>
  );
}
