import { Stack } from "expo-router";

export default function ScanFlowLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="scan-new-delivery" />
      <Stack.Screen name="check-supplier" />
      <Stack.Screen name="delivery-check" />
      <Stack.Screen name="delivery-summary" />
      <Stack.Screen name="manual-delivery" />
      <Stack.Screen name="message-screen" />
      <Stack.Screen name="add-delivery-item" />
    </Stack>
  );
}
