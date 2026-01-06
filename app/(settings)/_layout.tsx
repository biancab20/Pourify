import { useAppTheme } from "@/stores/app-theme-context";
import { Stack } from "expo-router";

export default function SettingsLayout() {
    const { theme } = useAppTheme();
    const { colors } = theme;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="venue-settings" options={{ headerTitle: "" }}/>
      <Stack.Screen name="[entity]/add" options={{ headerShown: true, headerTitle: "" }} />
    </Stack>
  );
}
