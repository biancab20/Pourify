import { useAppTheme } from "@/stores/app-theme-context";
import { useAuthStore } from "@/stores/auth-store";
import { router, Stack } from "expo-router";
import { useEffect } from "react";

export default function MainScreensLayout() {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === "signedOut") {
      router.replace("/"); 
    }
  }, [status]);

  if (status === "loading") return null;
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
