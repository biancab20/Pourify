import { useAppTheme } from "@/stores/app-theme-context";
import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function ScanFlowLayout() {
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
      <Stack.Screen
        name="scan-new-delivery"
        options={{ title: "", headerShown: false }}
      />
      <Stack.Screen name="check-supplier" options={{ title: "" }} />
      <Stack.Screen
        name="delivery-check"
        options={{ title: "", headerShown: false }}
      />
      <Stack.Screen
        name="delivery-summary"
        options={{ title: "", headerShown: false }}
      />
      <Stack.Screen
        name="manual-delivery"
        options={{ title: "", headerShown: false }}
      />
      <Stack.Screen
        name="add-delivery-item"
        options={{ title: "", headerShown: false }}
      />
      <Stack.Screen
        name="successful-delivery"
        options={{ title: "", headerShown: false }}
      />
    </Stack>
  );
}
