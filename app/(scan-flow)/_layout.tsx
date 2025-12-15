import { Stack } from "expo-router";

export default function ScanFlowLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="scan-new-delivery" />
      <Stack.Screen name="picture-overview" />
      <Stack.Screen name="delivery-list" />

    </Stack>
  );
}
