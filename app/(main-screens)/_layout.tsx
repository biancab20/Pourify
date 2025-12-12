import { useAppTheme } from "@/stores/app-theme-context";
import { Stack } from "expo-router";

export default function MainScreensLayout() {
  const { theme } = useAppTheme();
  const { colors } = theme;
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false, // iOS: removes bottom line
      }}
    >
      <Stack.Screen
        name="homepage"
        options={{ headerShown: false, title: "" }}
      />
      <Stack.Screen
        name="bar-view"
        options={{ headerShown: true, title: "" }}
      />
    </Stack>
  );
}
