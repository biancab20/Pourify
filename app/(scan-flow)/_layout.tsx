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
      <Stack.Screen name="delivery-check" />
      <Stack.Screen name="supplier-check" />
      <Stack.Screen name="delivery-summary" />
    </Stack>
  );
}
