import { useAppTheme } from "@/stores/app-theme-context";
import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function SettingsLayout() {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const isAndroid = Platform.OS === "android";
  return (
    <Stack
      screenOptions={{
        headerShown: !isAndroid,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="venue-settings" options={{ headerTitle: "", headerShown: false }} />
      <Stack.Screen
        name="[entity]/add"
        options={{ headerTitle: "" }}
      />
      <Stack.Screen
        name="[entity]/edit"
        options={{ headerTitle: "" }}
      />
      <Stack.Screen
        name="[entity]/edit-field"
        options={{ headerTitle: "" }}
      />
    </Stack>
    
  );
}
