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
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="homepage"
        options={{ headerShown: false, title: "" }}
      />
      <Stack.Screen name="bar-view" options={{ title: "" }} />
      <Stack.Screen name="all-products-view" options={{ title: "" }} />
    </Stack>
  );
}
